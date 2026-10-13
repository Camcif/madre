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
