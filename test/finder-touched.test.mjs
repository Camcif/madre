import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { filesChangedSince } from '../src/files.mjs';
import { EventStore } from '../src/event-store.mjs';
import { Room } from '../src/room.mjs';

const gitInit = (cwd) => new Promise((resolve, reject) => execFile('git', ['init', '-q'], { cwd }, (error) => (error ? reject(error) : resolve())));

test('finder: what changed on disk is found by its time, ignored folders included, MADRE\'s own and the heavy ones skipped', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-touched-'));
  try {
    const old = new Date(Date.now() - 3600_000);
    for (const [path, body] of [['README.md', 'v1'], ['node_modules/x/i.js', 'x'], ['.pulse/out/a.txt', 'a'], ['output/pdf/old.pdf', 'o']]) {
      await mkdir(join(root, path, '..'), { recursive: true });
      await writeFile(join(root, path), body);
      await utimes(join(root, path), old, old);
    }
    const since = Date.now();
    await writeFile(join(root, 'output/pdf/new.pdf'), 'pdf');
    await writeFile(join(root, 'node_modules/x/i.js'), 'changed');
    await writeFile(join(root, '.pulse/out/a.txt'), 'changed');
    assert.deepEqual(await filesChangedSince(root, since), ['output/pdf/new.pdf']);
    assert.deepEqual(await filesChangedSince(root, 'never'), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('finder: a command that writes where git does not look says so, and its card names the file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-touched-run-'));
  const logDir = await mkdtemp(join(tmpdir(), 'pulse-touched-run-log-'));
  try {
    await gitInit(root);
    await writeFile(join(root, '.gitignore'), 'output/\n');
    await utimes(join(root, '.gitignore'), new Date(Date.now() - 60_000), new Date(Date.now() - 60_000));
    await mkdir(join(root, 'output'), { recursive: true });
    const store = await new EventStore(join(logDir, 'events.jsonl')).initialize();
    const agents = [{ id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/x', version: '1' }];
    const script = 'require("fs").writeFileSync("output/quote.pdf", "pdf")';
    let turn = 0;
    const room = new Room({ store, agents, projectRoot: root, invokers: {
      'codex-readonly': async () => {
        turn += 1;
        return turn === 1 ? { text: `Listo el script.\n\n\`\`\`pulse-run\nGenerar el PDF\n$ ${process.execPath} -e '${script}'\n\`\`\``, usage: null } : { text: 'Visto.', usage: null };
      },
    } });
    room.setRuns(true);
    await room.send({ text: 'genera el pdf', target: 'codex' });
    const { responseMessageId } = (await store.readAll()).find((event) => event.type === 'run.requested').payload;
    await room.runRequested({ responseMessageId, index: 0 });
    const card = (await store.readAll()).find((event) => event.type === 'command.output');
    assert.deepEqual(card.payload.run.touched, ['output/quote.pdf'], `the PDF in an ignored folder went unsaid: ${JSON.stringify(card.payload.run)}`);
    assert.equal(card.payload.run.files, undefined, 'git saw a file it ignores');
    await room.shutdown();
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
    await rm(logDir, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
  }
});
