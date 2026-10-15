import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readOpenCodeProviders, removeOpenCodeKey } from '../src/credentials.mjs';
import { discoverModels, groupOpenCode } from '../src/models.mjs';

const authFile = (home) => join(home, '.local', 'share', 'opencode', 'auth.json');
async function homeWith(auth) {
  const home = await mkdtemp(join(tmpdir(), 'madre-oc-'));
  await mkdir(join(home, '.local', 'share', 'opencode'), { recursive: true });
  await writeFile(authFile(home), JSON.stringify(auth));
  return home;
}

test('opencode providers: who is signed in and how, never the key', async () => {
  const home = await homeWith({ openai: { type: 'oauth', refresh: 'secret-r', access: 'secret-a' }, openrouter: { type: 'api', key: 'sk-or-secret-123456' }, '../bad': { type: 'api', key: 'x' } });
  try {
    const providers = await readOpenCodeProviders({ home });
    assert.deepEqual(providers, [{ id: 'openai', type: 'oauth' }, { id: 'openrouter', type: 'api' }]);
    assert.doesNotMatch(JSON.stringify(providers), /secret/);
    assert.deepEqual(await readOpenCodeProviders({ home: join(home, 'nobody') }), []);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('opencode providers: a key comes out, the rest stays, and OpenCode has the last word', async () => {
  const home = await homeWith({ openai: { type: 'oauth', refresh: 'r' }, openrouter: { type: 'api', key: 'sk-or-123456789' } });
  try {
    assert.equal((await removeOpenCodeKey({ provider: 'openai', home, run: async () => '' })).ok, false, 'an account is signed out in OpenCode, not here');
    // OpenCode still lists it: the file goes back as it was.
    const kept = await removeOpenCodeKey({ provider: 'openrouter', home, run: async () => '● OpenRouter api\n● OpenAI oauth' });
    assert.equal(kept.ok, false);
    assert.equal(JSON.parse(await readFile(authFile(home), 'utf8')).openrouter.key, 'sk-or-123456789');
    const gone = await removeOpenCodeKey({ provider: 'openrouter', home, run: async () => '● OpenAI oauth' });
    assert.equal(gone.ok, true);
    const auth = JSON.parse(await readFile(authFile(home), 'utf8'));
    assert.deepEqual(Object.keys(auth), ['openai']);
    assert.equal((await stat(authFile(home))).mode & 0o777, 0o600);
    assert.equal((await removeOpenCodeKey({ provider: 'openrouter', home, run: async () => '' })).ok, false, 'nothing to remove');
    assert.equal((await removeOpenCodeKey({ provider: '../x', home, run: async () => '' })).ok, false);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('opencode models: grouped by provider, OpenCode\'s own last, and a hidden provider leaves the chooser', async () => {
  const listed = ['opencode/big-pickle', 'openai/gpt-5.6-sol', 'openai/gpt-5.6-luna', 'openrouter/meta/llama'];
  assert.deepEqual(groupOpenCode(listed).map((group) => [group.label, group.models.length, group.own]), [['OpenAI', 2, false], ['OpenRouter', 1, false], ['OpenCode', 1, true]]);
  const agents = [{ id: 'opencode', detected: true }];
  const shown = await discoverModels({ agents, config: { opencode: { hidden: ['openai'] } }, listOpenCode: async () => listed });
  assert.deepEqual(shown.opencode.groups.map((group) => group.id), ['openrouter', 'opencode']);
  assert.ok(!shown.opencode.models.some((name) => name.startsWith('openai/')));
});

test('opencode: each model offers its own reasoning rungs, read from the verbose listing, and they go out as --variant', async () => {
  const { parseOpenCodeVerbose } = await import('../src/models.mjs');
  const { buildOpenCodeArgs } = await import('../src/adapters/opencode.mjs');
  const lines = ['openai/gpt-5.6-sol', '{', '  "id": "gpt-5.6-sol",', '  "variants": { "none": {}, "low": {}, "high": {}, "max": {} }', '}', 'opencode/big-pickle', '{', '  "variants": {}', '}', 'anthropic/claude-haiku-4-5', '{ not json', '}'];
  const listed = parseOpenCodeVerbose(lines);
  assert.deepEqual(listed.map((one) => one.name), ['openai/gpt-5.6-sol', 'opencode/big-pickle', 'anthropic/claude-haiku-4-5']);
  assert.deepEqual(listed[0].variants, ['none', 'low', 'high', 'max']);
  const result = await discoverModels({ agents: [{ id: 'opencode', detected: true }], listOpenCode: async () => listed });
  assert.deepEqual(result.opencode.efforts, [], 'a ladder before any model is chosen');
  assert.deepEqual(result.opencode.effortsByModel['openai/gpt-5.6-sol'].levels, ['none', 'low', 'high', 'max']);
  assert.equal(result.opencode.effortsByModel['opencode/big-pickle'], undefined, 'a model with no rungs offers none');
  assert.deepEqual(result.opencode.models.slice(0, 3).sort(), ['anthropic/claude-haiku-4-5', 'openai/gpt-5.6-sol', 'opencode/big-pickle']);
  const args = buildOpenCodeArgs({ projectRoot: '/p', prompt: 'hola', model: 'openai/gpt-5.6-sol', effort: 'high' });
  assert.deepEqual(args.slice(args.indexOf('--variant'), args.indexOf('--variant') + 2), ['--variant', 'high']);
  assert.ok(!buildOpenCodeArgs({ projectRoot: '/p', prompt: 'hola' }).includes('--variant'));
});

test('opencode: every provider one key opens is offered, from OpenCode\'s own catalogue; those needing more stay out', async () => {
  const { openCodeKeyProviders } = await import('../src/credentials.mjs');
  const home = await mkdtemp(join(tmpdir(), 'madre-oc-catalog-'));
  try {
    await mkdir(join(home, '.cache', 'opencode'), { recursive: true });
    await writeFile(join(home, '.cache', 'opencode', 'models.json'), JSON.stringify({
      groq: { id: 'groq', name: 'Groq', env: ['GROQ_API_KEY'], doc: 'https://console.groq.com/docs/models' },
      azure: { id: 'azure', name: 'Azure', env: ['AZURE_RESOURCE_NAME', 'AZURE_API_KEY'] },
      'acme-ai': { id: 'acme-ai', name: 'Acme AI', env: ['ACME_KEY'], doc: 'http://insecure.example' },
    }));
    const providers = await openCodeKeyProviders({ home, env: {} });
    const ids = providers.map((one) => one.id);
    for (const id of ['anthropic', 'openai', 'openrouter', 'google', 'groq', 'acme-ai']) assert.ok(ids.includes(id), id);
    assert.ok(!ids.includes('azure'), 'a provider that needs two values is not offered a single key');
    assert.equal(providers.find((one) => one.id === 'groq').featured, true);
    assert.equal(providers.find((one) => one.id === 'acme-ai').keyUrl, null, 'only https links are offered');
  } finally { await rm(home, { recursive: true, force: true }); }
});
