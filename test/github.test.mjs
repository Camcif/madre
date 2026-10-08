// GITHUB: which credential it signs in with, what it reads, and that nothing is posted without the
// word. git, gh and GitHub are all answered by fakes through `client`, so the suite needs none of
// them installed and not a byte leaves the machine.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as github from '../src/github.mjs';
import { READ_TOOLS, WRITE_TOOLS, TOOLS, handleRequest, callTool } from '../src/mcp/github-server.mjs';
import module, { runGh, tokenize } from '../src/modules/github.mjs';
import { toolsForTurn } from '../src/modules/index.mjs';
import { parseCommand } from '../src/commands.mjs';
import { OutboundLog, classify, clearDeclaredDestinations, declareDestinations } from '../src/outbound.mjs';
import { writeSecret } from '../src/vault.mjs';

const TOKEN = 'github_pat_SECRET_do_not_print_0123456789';
const real = { which: github.client.which, run: github.client.run, fetch: github.client.fetch };

// A project on disk, as git would describe it. Every field can be taken away to make the case.
function fakeGit({ top = '/proj', remotes = { origin: 'git@github.com:octo/hello.git' }, branch = 'feature', upstream = 'origin/feature' } = {}) {
  return (args) => {
    const rest = args.slice(2).join(' ');
    if (rest === 'rev-parse --show-toplevel') return top ? { code: 0, stdout: `${top}\n` } : { code: 128, stdout: '' };
    if (rest === 'remote') return { code: 0, stdout: Object.keys(remotes).join('\n') };
    if (rest.startsWith('remote get-url ')) { const url = remotes[rest.slice(15)]; return url ? { code: 0, stdout: `${url}\n` } : { code: 2, stdout: '' }; }
    if (rest === 'rev-parse --abbrev-ref HEAD') return { code: 0, stdout: `${branch ?? 'HEAD'}\n` };
    if (rest === 'rev-parse --abbrev-ref --symbolic-full-name @{u}') return upstream ? { code: 0, stdout: `${upstream}\n` } : { code: 128, stdout: '' };
    return { code: 1, stdout: '' };
  };
}

// gh: `login` is who its config names; `held` whether `auth token` would succeed; `api` answers requests.
function install({ gh = null, login = 'octo', held = true, git = fakeGit(), api = null, fetch = null } = {}) {
  const calls = [];
  github.forgetSession();
  github.client.which = async (name) => (name === 'gh' ? gh : null);
  github.client.run = async (file, args, options = {}) => {
    calls.push({ file, args, options });
    if (file === 'git') return { stderr: '', ...git(args) };
    if (args[0] === 'config') return { code: 0, stdout: login ? `${login}\n` : '\n', stderr: '' };
    if (args[0] === 'auth') return { code: held ? 0 : 1, stdout: '', stderr: '' };
    if (args[0] === 'api') return api ? api(args, options) : { code: 1, stdout: '', stderr: 'no api' };
    return { code: 1, stdout: '', stderr: '' };
  };
  if (fetch) github.client.fetch = fetch;
  return calls;
}
function restore() {
  Object.assign(github.client, real);
  github.forgetSession();
}

// GitHub, for the token path: a little router over what a test needs, and a record of every call.
function fakeGithub(routes = {}) {
  const seen = [];
  const fetch = async (url, init = {}) => {
    const { pathname, search } = new URL(url);
    const key = `${init.method ?? 'GET'} ${pathname}`;
    seen.push({ key, search, headers: init.headers ?? {}, body: init.body ? JSON.parse(init.body) : null });
    const answer = routes[key];
    if (!answer) return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    const { status = 200, body = {}, headers = {} } = typeof answer === 'function' ? answer(seen.at(-1)) : answer;
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
  };
  return { fetch, seen };
}

const REPO = { owner: 'octo', repo: 'hello', slug: 'octo/hello' };
const ROUTES = {
  'GET /repos/octo/hello': { body: { default_branch: 'main', open_issues_count: 5, private: false, html_url: 'https://github.com/octo/hello' } },
  'GET /repos/octo/hello/pulls': { body: [{ number: 3, title: 'Make it faster', user: { login: 'ana' }, head: { ref: 'feature' }, base: { ref: 'main' }, draft: false }] },
  'GET /repos/octo/hello/issues/12': { body: { number: 12, title: 'The card says off', state: 'open', user: { login: 'bo' }, pull_request: {} } },
  'GET /repos/octo/hello/commits/feature/status': { body: { statuses: [{ context: 'lint', state: 'success' }] } },
  'GET /repos/octo/hello/commits/feature/check-runs': { body: { check_runs: [{ name: 'test', status: 'completed', conclusion: 'failure' }] } },
  'POST /repos/octo/hello/issues': { status: 201, body: { number: 7, html_url: 'https://github.com/octo/hello/issues/7' } },
  'POST /repos/octo/hello/pulls': { status: 201, body: { number: 8, html_url: 'https://github.com/octo/hello/pull/8' } },
  'POST /repos/octo/hello/issues/12/comments': { status: 201, body: { id: 1, html_url: 'https://github.com/octo/hello/pull/12#issuecomment-1' } },
};
// What the composer hands a module: the line split on spaces, quotes and all.
const argsOf = (line) => parseCommand(line).args;
const ctxFor = ({ token = TOKEN, env = {} } = {}) => ({ projectRoot: '/proj', env: { PATH: '/usr/bin', ...env }, vault: { get: async () => token } });

test('github: a remote names a GitHub repository, and nothing else does', () => {
  for (const [url, slug] of [
    ['git@github.com:octo/hello.git', 'octo/hello'],
    ['https://github.com/octo/hello.git', 'octo/hello'],
    ['https://github.com/octo/hello', 'octo/hello'],
    ['https://github.com/octo/hello/', 'octo/hello'],
    ['ssh://git@github.com/octo/hello.git', 'octo/hello'],
    ['https://someone@github.com/Octo-Org/hello.world.git', 'Octo-Org/hello.world'],
    ['git@ssh.github.com:octo/hello.git', 'octo/hello'],
  ]) assert.equal(github.repoFromRemote(url)?.slug, slug, url);
  // Another forge, an Enterprise host, or something that is not a repository at all: a credential
  // for github.com must never be sent to any of them.
  for (const url of ['git@gitlab.com:octo/hello.git', 'https://github.example.com/octo/hello.git', 'https://bitbucket.org/octo/hello', 'https://github.com/octo', 'https://github.com/octo/hello/tree/main', 'C:\\work\\hello', 'file:///srv/hello.git', '', null, 'https://github.com/../hello']) {
    assert.equal(github.repoFromRemote(url), null, String(url));
  }
});

test('github: the gh session wins when there is one, the token only without it', async (t) => {
  t.after(restore);
  install({ gh: '/opt/bin/gh', login: 'octo' });
  assert.deepEqual(await github.resolveAuth({ env: { PATH: '/opt/bin' }, token: TOKEN }), { kind: 'gh', gh: '/opt/bin/gh', login: 'octo' }, 'a token was preferred over a signed-in gh');
  assert.equal(github.authLabel(await github.resolveAuth({ env: { PATH: '/opt/bin' } })), 'gh · @octo');

  // gh with a token and no name in its config still counts — and the token never reaches us.
  const calls = install({ gh: '/opt/bin/gh', login: '', held: true });
  assert.deepEqual(await github.resolveAuth({ env: { PATH: '/a' } }), { kind: 'gh', gh: '/opt/bin/gh', login: null });
  const asked = calls.find((one) => one.args[0] === 'auth');
  assert.deepEqual(asked.args, ['auth', 'token', '-h', 'github.com']);
  assert.equal(asked.options.quiet, true, 'gh auth token was asked with its output coming back into this process');

  // Signed out: the token.
  install({ gh: '/opt/bin/gh', login: '', held: false });
  assert.deepEqual(await github.resolveAuth({ env: { PATH: '/b' }, token: ` ${TOKEN} ` }), { kind: 'token', token: TOKEN });
  // No gh: the token, and without one, nothing.
  install({ gh: null });
  assert.equal((await github.resolveAuth({ env: { PATH: '/c' }, token: TOKEN })).kind, 'token');
  assert.equal(await github.resolveAuth({ env: { PATH: '/d' } }), null);
  // A gh that is a .cmd shim cannot be run without a shell (docs/WINDOWS.md, WIN-016): it is absent.
  install({ gh: 'C:\\tools\\gh.cmd' });
  assert.equal(await github.resolveAuth({ env: { PATH: '/e' } }), null);
  // And PULSE_GH=0 leaves gh out entirely, without running anything.
  const quiet = install({ gh: '/opt/bin/gh' });
  assert.equal(await github.ghSession({ env: { PULSE_GH: '0' } }), null);
  assert.equal(quiet.length, 0);
});

test('github: with gh, gh makes the request, without a shell, pinned to github.com', async (t) => {
  t.after(restore);
  const dir = await mkdtemp(join(tmpdir(), 'madre-github-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const calls = install({
    gh: '/opt/bin/gh',
    api: () => ({ code: 0, stdout: 'HTTP/2.0 200 OK\r\nContent-Type: application/json\r\nX-Ratelimit-Remaining: 4999\r\n\r\n[{"number":12,"title":"Bug","user":{"login":"bo"},"labels":[{"name":"ui"}],"comments":2},{"number":13,"title":"A PR","pull_request":{}}]', stderr: '' }),
    fetch: async () => { throw new Error('fetch was used although gh is signed in'); },
  });
  clearDeclaredDestinations();
  declareDestinations('github', github.REACHES);
  t.after(clearDeclaredDestinations);
  const file = join(dir, 'outbound.jsonl');
  const log = new OutboundLog({ file });
  const auth = await github.resolveAuth({ env: { PATH: '/opt/bin' } });
  const issues = await github.listIssues({ repo: REPO, auth, log, env: { PATH: '/opt/bin' } });
  assert.deepEqual(issues.map((one) => one.number), [12], 'a pull request was listed as an issue');
  assert.deepEqual(issues[0].labels, ['ui']);

  const call = calls.find((one) => one.args[0] === 'api');
  assert.equal(call.file, '/opt/bin/gh');
  assert.deepEqual(call.args.slice(0, 4), ['api', '--method', 'GET', '--include']);
  assert.equal(call.args.at(-1), 'repos/octo/hello/issues?state=open&per_page=20');
  assert.equal(call.options.env.GH_HOST, 'github.com', 'an enterprise GH_HOST could take the request elsewhere');

  await log.drain();
  const line = JSON.parse((await readFile(file, 'utf8')).trim());
  assert.equal(line.id, 'github:api', 'the request was logged as an address nothing declares');
  assert.equal(line.method, 'GET');
  assert.equal(line.ok, true);
  assert.equal(typeof line.ms, 'number');
});

test('github: with a token, it goes as a Bearer header and nowhere else', async (t) => {
  t.after(restore);
  const dir = await mkdtemp(join(tmpdir(), 'madre-github-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { fetch, seen } = fakeGithub(ROUTES);
  install({ gh: null, fetch });
  clearDeclaredDestinations();
  declareDestinations('github', github.REACHES);
  t.after(clearDeclaredDestinations);
  const file = join(dir, 'outbound.jsonl');
  const log = new OutboundLog({ file });
  const auth = await github.resolveAuth({ env: { PATH: '/x' }, token: TOKEN });
  const made = await github.createIssue({ repo: REPO, auth, log, title: 'It breaks', body: 'Steps…' });
  assert.deepEqual(made, { number: 7, url: 'https://github.com/octo/hello/issues/7' });
  assert.equal(seen[0].headers.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(seen[0].body, { title: 'It breaks', body: 'Steps…' });

  await log.drain();
  const written = await readFile(file, 'utf8');
  const line = JSON.parse(written.trim());
  assert.equal(line.id, 'github:api');
  assert.equal(line.method, 'POST');
  assert.ok(!written.includes(TOKEN), 'the token reached the outbound log');
  assert.ok(!written.includes('It breaks') && !written.includes('Steps'), 'what was posted reached the outbound log');
});

test('github: failures are said plainly, and never carry the credential', async (t) => {
  t.after(restore);
  const auth = { kind: 'token', token: TOKEN };
  for (const [answer, code, says] of [
    [{ status: 401, body: { message: 'Bad credentials' } }, 'UNAUTHORIZED', /did not accept the token/],
    [{ status: 404, body: { message: 'Not Found' } }, 'NOT_FOUND', /not visible with this credential/],
    [{ status: 403, body: { message: 'API rate limit exceeded' }, headers: { 'x-ratelimit-remaining': '0' } }, 'RATE_LIMIT', /rate limit/],
    [{ status: 403, body: { message: 'Resource not accessible by personal access token' } }, 'FORBIDDEN', /not allowed/],
    [{ status: 422, body: { message: 'Validation Failed', errors: [{ message: 'A pull request already exists for octo:feature.' }] } }, 'INVALID', /refused the request/],
  ]) {
    install({ gh: null, fetch: fakeGithub({ 'GET /repos/octo/hello': answer }).fetch });
    const error = await github.getRepo({ repo: REPO, auth }).then(() => null, (one) => one);
    assert.equal(error?.code, code);
    assert.match(error.message, says);
    assert.ok(!JSON.stringify({ message: error.message, detail: error.detail }).includes(TOKEN));
    if (code === 'INVALID') assert.match(error.detail, /already exists/, 'what GitHub said about the refusal was lost');
  }
  // The same 401 through gh names gh's own way back in.
  install({ gh: '/opt/bin/gh', api: () => ({ code: 1, stdout: 'HTTP/2.0 401 Unauthorized\n\n{"message":"Bad credentials"}', stderr: 'gh: Bad credentials (HTTP 401)' }) });
  const viaGh = await github.getRepo({ repo: REPO, auth: { kind: 'gh', gh: '/opt/bin/gh' } }).then(() => null, (one) => one);
  assert.match(viaGh.message, /gh auth login/);
  // And a fetch that never connected is not dressed up as an answer.
  install({ gh: null, fetch: async () => { throw Object.assign(new Error(`connect ECONNREFUSED with ${TOKEN}`), { code: 'ECONNREFUSED' }); } });
  const offline = await github.getRepo({ repo: REPO, auth }).then(() => null, (one) => one);
  assert.equal(offline.code, 'NETWORK');
  assert.ok(!offline.message.includes(TOKEN));
});

test('github: checks, statuses and reviews fold into one word each', () => {
  assert.equal(github.foldChecks({}).state, 'none');
  assert.equal(github.foldChecks({ statuses: [{ context: 'a', state: 'success' }], runs: [{ name: 'b', status: 'completed', conclusion: 'skipped' }] }).state, 'success');
  assert.equal(github.foldChecks({ runs: [{ name: 'b', status: 'in_progress' }] }).state, 'pending');
  assert.equal(github.foldChecks({ statuses: [{ context: 'a', state: 'pending' }], runs: [{ name: 'b', status: 'completed', conclusion: 'failure' }] }).state, 'failure');
  // The latest review of each reviewer decides.
  assert.equal(github.reviewState([{ user: { login: 'a' }, state: 'CHANGES_REQUESTED' }, { user: { login: 'a' }, state: 'APPROVED' }]).state, 'approved');
  assert.equal(github.reviewState([{ user: { login: 'a' }, state: 'APPROVED' }, { user: { login: 'b' }, state: 'CHANGES_REQUESTED' }]).state, 'changes requested');
  assert.equal(github.reviewState([{ user: { login: 'a' }, state: 'COMMENTED' }]).state, 'no review yet');
});

test('github: the composer\'s pieces become a title, a body and the word', () => {
  assert.deepEqual(tokenize(argsOf('/gh issue "The card is wrong" "It says off" confirm')), {
    pieces: [{ text: 'issue', quoted: false }, { text: 'The card is wrong', quoted: true }, { text: 'It says off', quoted: true }],
    confirm: true,
  });
  // A quoted "confirm" is somebody's words, not the word that sends.
  assert.equal(tokenize(argsOf('/gh comment 4 "confirm"')).confirm, false);
  assert.equal(tokenize(argsOf('/gh comment 4 “curly quotes too” CONFIRM')).pieces[2].text, 'curly quotes too');
});

test('github: /gh issue shows what would be posted, and posts it only with confirm', async (t) => {
  t.after(restore);
  const { fetch, seen } = fakeGithub(ROUTES);
  install({ gh: null, fetch });
  const preview = await runGh(ctxFor(), argsOf('/gh issue "The card says off" "It is on, and the card says off."'));
  assert.equal(preview.ok, true);
  assert.match(preview.title, /preview/);
  assert.match(preview.text, /Would open an issue on octo\/hello/);
  assert.match(preview.text, /Title: The card says off/);
  assert.match(preview.text, /It is on, and the card says off\./);
  assert.match(preview.text, /As: token/);
  assert.match(preview.text, /\/gh issue "The card says off" "It is on, and the card says off\." confirm/, 'the preview does not say how to send exactly this');
  assert.equal(seen.filter((one) => one.key.startsWith('POST')).length, 0, 'the preview posted');

  const sent = await runGh(ctxFor(), argsOf('/gh issue "The card says off" "It is on, and the card says off." confirm'));
  assert.equal(sent.ok, true);
  assert.match(sent.text, /Opened issue #7 on octo\/hello/);
  const posts = seen.filter((one) => one.key.startsWith('POST'));
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0].body, { title: 'The card says off', body: 'It is on, and the card says off.' }, 'what was posted is not what the preview showed');
  for (const card of [preview, sent]) assert.ok(!JSON.stringify(card).includes(TOKEN), 'the token reached a card');

  const untitled = await runGh(ctxFor(), argsOf('/gh issue confirm'));
  assert.equal(untitled.ok, false);
  assert.equal(seen.filter((one) => one.key.startsWith('POST')).length, 1, 'an untitled issue was posted');
});

test('github: /gh pr create and /gh comment preview first, and send exactly that on confirm', async (t) => {
  t.after(restore);
  const { fetch, seen } = fakeGithub(ROUTES);
  install({ gh: null, fetch });
  const posts = () => seen.filter((one) => one.key.startsWith('POST'));

  const pr = await runGh(ctxFor(), argsOf('/gh pr create "Faster cards" "Half the requests."'));
  assert.match(pr.text, /Would open a pull request on octo\/hello/);
  assert.match(pr.text, /From feature into main/);
  assert.equal(posts().length, 0);
  const opened = await runGh(ctxFor(), argsOf('/gh pr create "Faster cards" "Half the requests." confirm'));
  assert.match(opened.text, /Opened pull request #8/);
  assert.deepEqual(posts()[0].body, { title: 'Faster cards', head: 'feature', base: 'main', body: 'Half the requests.' });

  const comment = await runGh(ctxFor(), argsOf('/gh comment 12 "Looks right to me."'));
  assert.match(comment.text, /Would comment on pull request #12 · The card says off/, 'the preview does not name the thread');
  assert.match(comment.text, /Looks right to me\./);
  assert.equal(posts().length, 1);
  await runGh(ctxFor(), argsOf('/gh comment 12 "Looks right to me." confirm'));
  assert.equal(posts().length, 2);
  assert.equal(posts()[1].key, 'POST /repos/octo/hello/issues/12/comments');
  assert.deepEqual(posts()[1].body, { body: 'Looks right to me.' });

  // A branch GitHub has never seen is stopped here, before anything is asked of GitHub.
  install({ gh: null, fetch, git: fakeGit({ upstream: null }) });
  const unpushed = await runGh(ctxFor(), argsOf('/gh pr create "Faster cards" confirm'));
  assert.equal(unpushed.ok, false);
  assert.match(unpushed.text, /feature is not on GitHub yet/);
  assert.equal(posts().length, 2);
  // And on the default branch there is nothing to open a pull request from.
  install({ gh: null, fetch, git: fakeGit({ branch: 'main' }) });
  const onMain = await runGh(ctxFor(), argsOf('/gh pr create "x" confirm'));
  assert.equal(onMain.ok, false);
  assert.equal(posts().length, 2);
});

test('github: /gh reads the summary, a pull request list and the CI without a word of setup', async (t) => {
  t.after(restore);
  const { fetch } = fakeGithub(ROUTES);
  install({ gh: '/opt/bin/gh', login: 'octo', fetch, api: (args) => {
    // gh answers with what the fake GitHub would, so both paths read the same.
    const path = `/${args.at(-1)}`;
    const route = ROUTES[`GET ${path.split('?')[0]}`];
    return route ? { code: 0, stdout: `HTTP/2.0 ${route.status ?? 200} OK\n\n${JSON.stringify(route.body)}`, stderr: '' } : { code: 1, stdout: 'HTTP/2.0 404 Not Found\n\n{}', stderr: '' };
  } });
  const summary = await runGh(ctxFor({ token: null }), []);
  assert.equal(summary.ok, true);
  assert.match(summary.text, /## octo\/hello · gh · @octo/);
  assert.match(summary.text, /Open pull requests: 1/);
  assert.match(summary.text, /Open issues: 4/, 'pull requests were counted as issues');
  assert.match(summary.text, /CI on feature: failing \(2 checks\)/);
  assert.match(summary.text, /This branch has pull request #3/);

  const list = await runGh(ctxFor({ token: null }), ['pr']);
  assert.match(list.text, /#3 Make it faster · @ana · feature → main/);
  const unknown = await runGh(ctxFor({ token: null }), ['merge']);
  assert.equal(unknown.ok, false);
  assert.match(unknown.text, /Unknown subcommand "merge"/);
});

test('github: the card says which credential and which repository, or what is missing', async (t) => {
  t.after(restore);
  const stateRoot = await mkdtemp(join(tmpdir(), 'madre-github-vault-'));
  t.after(() => rm(stateRoot, { recursive: true, force: true }));
  const ctx = { projectRoot: '/proj', stateRoot, env: { PATH: '/usr/bin' }, config: { modules: { github: { enabled: true } } } };

  install({ gh: '/opt/bin/gh', login: 'octo' });
  let card = await module.describe(ctx);
  assert.equal(card.preflight.ok, true);
  assert.equal(card.status.detail, 'on · gh · @octo · octo/hello');
  assert.deepEqual(card.secrets.map((one) => one.name), ['token']);
  assert.match(card.secrets[0].where, /^https:\/\/github\.com\/settings\/personal-access-tokens\/new$/);

  await writeSecret(stateRoot, 'github', 'token', TOKEN);
  install({ gh: null });
  card = await module.describe(ctx);
  assert.equal(card.status.detail, 'on · token · octo/hello');
  assert.ok(!JSON.stringify(card).includes(TOKEN), 'the token reached the card');
  assert.deepEqual(card.held, [{ module: 'github', name: 'token', bytes: TOKEN.length }]);

  const cases = [
    [{ git: fakeGit({ top: null }) }, /not a git repository/],
    [{ git: fakeGit({ remotes: { origin: 'git@gitlab.com:octo/hello.git' } }) }, /No remote of this repository points at github\.com/],
  ];
  for (const [setup, says] of cases) {
    install({ gh: '/opt/bin/gh', ...setup });
    card = await module.describe(ctx);
    assert.equal(card.preflight.ok, false);
    assert.ok(card.preflight.problems.some((one) => says.test(one)), `${says} is not on the card`);
    assert.equal(card.status.detail, 'on · not configured');
  }
  // Neither gh nor a token.
  install({ gh: null });
  card = await module.describe({ ...ctx, stateRoot: join(stateRoot, 'empty') });
  assert.ok(card.preflight.problems.some((one) => /no GitHub session on this computer and no token/.test(one)));
  // And /gh says the same instead of trying.
  const refused = await runGh({ ...ctxFor({ token: null }) }, []);
  assert.equal(refused.ok, false);
  assert.match(refused.text, /gh auth login/);
});

test('github: the writes are declared as sending, and below #4 the room never mentions them', async (t) => {
  t.after(restore);
  const stateRoot = await mkdtemp(join(tmpdir(), 'madre-github-vault-'));
  t.after(() => rm(stateRoot, { recursive: true, force: true }));
  await writeSecret(stateRoot, 'github', 'token', TOKEN);
  install({ gh: null });
  const ctx = { projectRoot: '/proj', stateRoot, env: { PATH: '/usr/bin', PULSE_OUTBOUND_LOG: '/tmp/x.jsonl' }, config: { modules: { github: { enabled: true } } } };

  const [own] = await module.toolsForTurn(ctx, { mode: 4 });
  assert.deepEqual(own.sends, WRITE_TOOLS, 'the writes did not declare that they send');
  assert.deepEqual(own.tools, [...READ_TOOLS, ...WRITE_TOOLS]);
  assert.equal(own.env.PULSE_GITHUB_TOKEN, TOKEN, 'the token did not reach the server it is for');
  assert.equal(own.env.PULSE_GITHUB_WRITES, '1');
  assert.equal(own.env.PULSE_GITHUB_REPO, 'octo/hello');
  assert.ok(!own.brief.includes(TOKEN), 'the token reached the brief the model reads');
  assert.match(own.brief, /cannot be undone/);

  for (const mode of [0, 1, 2, 3]) {
    const servers = await toolsForTurn(ctx, { agent: 'claude', mode });
    const server = servers.find((one) => one.name === 'github');
    assert.ok(server, `the read tools were withheld at #${mode}`);
    assert.deepEqual(server.tools, READ_TOOLS);
    assert.equal(server.env.PULSE_GITHUB_WRITES, undefined, `the server was told it may write at #${mode}`);
    // What reaches the agent's CLI — the tools, the brief, the environment — names none of them.
    // (`sends` stays on the spec: it is the declaration the core read, and no adapter passes it on.)
    const told = JSON.stringify(servers.map(({ sends, ...handed }) => handed));
    for (const name of WRITE_TOOLS) assert.ok(!told.includes(name), `${name} was named at #${mode}`);
  }
  const airlock = (await toolsForTurn(ctx, { agent: 'claude', mode: 4 })).find((one) => one.name === 'github');
  assert.deepEqual(airlock.tools, [...READ_TOOLS, ...WRITE_TOOLS]);

  // With gh, no token travels at all.
  install({ gh: '/opt/bin/gh', login: 'octo' });
  const [viaGh] = await module.toolsForTurn(ctx, { mode: 4 });
  assert.equal(viaGh.env.PULSE_GITHUB_AUTH, 'gh');
  assert.equal(viaGh.env.PULSE_GITHUB_TOKEN, undefined, 'the token travelled although gh signs in');
  assert.ok(!JSON.stringify(viaGh).includes(TOKEN));

  // Switched off, nothing.
  assert.deepEqual(await module.toolsForTurn({ ...ctx, config: { modules: { github: { enabled: false } } } }, { mode: 4 }), []);
});

test('github: the server keeps the writes to #4 itself, and its answers never carry the token', async (t) => {
  t.after(restore);
  const below = { PULSE_GITHUB_REPO: 'octo/hello', PULSE_GITHUB_AUTH: 'token', PULSE_GITHUB_TOKEN: TOKEN };
  const listed = await handleRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, { env: below });
  assert.deepEqual(listed.result.tools.map((one) => one.name), READ_TOOLS);
  const allListed = await handleRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, { env: { ...below, PULSE_GITHUB_WRITES: '1' } });
  assert.deepEqual(allListed.result.tools.map((one) => one.name), TOOLS.map((one) => one.name));
  for (const tool of TOOLS.filter((one) => WRITE_TOOLS.includes(one.name))) assert.match(tool.description, /cannot be undone/);

  let posted = false;
  const api = { ...github, createIssue: async () => { posted = true; return { number: 1 }; } };
  const refused = await handleRequest({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'github_create_issue', arguments: { title: 'x' } } }, { env: below, api });
  assert.equal(refused.result.isError, true);
  assert.match(refused.result.content[0].text, /^Nothing was posted \(NOT_AIRLOCK\)/);
  assert.equal(posted, false, 'the server posted below #4');

  // A read, end to end through the client, with its log line written by this process.
  const dir = await mkdtemp(join(tmpdir(), 'madre-github-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { fetch } = fakeGithub({ ...ROUTES, 'GET /repos/octo/hello/issues': { body: [{ number: 1, title: 'One', user: { login: 'a' }, labels: [] }] } });
  install({ gh: null, fetch });
  const log = join(dir, 'outbound.jsonl');
  const read = await handleRequest({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'github_list_issues', arguments: {} } }, { env: { ...below, PULSE_OUTBOUND_LOG: log } });
  assert.equal(read.result.isError, false);
  assert.deepEqual(JSON.parse(read.result.content[0].text).issues.map((one) => one.number), [1]);
  await new Promise((resolve) => setTimeout(resolve, 60));
  const written = await readFile(log, 'utf8');
  assert.equal(JSON.parse(written.trim().split('\n').pop()).id, 'github:api');
  assert.ok(!written.includes(TOKEN), 'the token reached the outbound log');

  // A refusal from GitHub comes back as an error result, without the token in it.
  install({ gh: null, fetch: fakeGithub({ 'GET /repos/octo/hello/issues': { status: 401, body: { message: 'Bad credentials' } } }).fetch });
  const denied = await handleRequest({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'github_list_issues', arguments: {} } }, { env: below });
  assert.equal(denied.result.isError, true);
  assert.match(denied.result.content[0].text, /UNAUTHORIZED/);
  assert.ok(!JSON.stringify(denied).includes(TOKEN));

  // And a write at #4 goes through.
  install({ gh: null, fetch: fakeGithub(ROUTES).fetch });
  const result = await callTool('github_comment', { number: 12, body: 'ok' }, { env: { ...below, PULSE_GITHUB_WRITES: '1' } });
  assert.equal(result.number, 12);
});

test('github: the release check and the module are two different promises in the log', () => {
  clearDeclaredDestinations();
  try {
    declareDestinations('github', module.reaches);
    assert.equal(classify('https://api.github.com/repos/ollama/ollama/releases/latest').id, 'github', 'the release check lost its own declaration');
    const pulls = classify('https://api.github.com/repos/octo/hello/pulls');
    assert.equal(pulls.id, 'github:api', 'the module\'s requests were vouched for as the release check');
    assert.equal(pulls.module, 'github');
    for (const answer of ['to', 'what', 'when', 'where']) assert.ok(module.reaches[0][answer], `the destination does not say ${answer}`);
  } finally {
    clearDeclaredDestinations();
  }
});
