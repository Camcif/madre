import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runReadonlyProcess } from '../src/adapters/process.mjs';
import { createPulseServer } from '../src/server.mjs';

// Lote 2 of the 1.0 review (2026-10-12): what MADRE keeps is never damaged on the way in.

test('integrity: a letter split between two chunks of an agent\'s output stays one letter (LOG-04)', async () => {
  // «canción» with its «ó» (0xC3 0xB3) cut between two writes, a pause apart.
  const script = "process.stdout.write(Buffer.from([0x63,0x61,0x6e,0x63,0x69,0xc3])); setTimeout(() => process.stdout.write(Buffer.from([0xb3,0x6e,0x0a])), 60);";
  const answer = await runReadonlyProcess({ executable: process.execPath, args: ['-e', script], cwd: tmpdir(), label: 'test', parse: (stdout) => ({ text: stdout.trim() }) });
  assert.equal(answer.text, 'canción');
});

test('integrity: a request whose «ñ» arrives in two packets is read whole, and the editor saves past 100 KB (SRV-08)', async () => {
  const state = await mkdtemp(join(tmpdir(), 'madre-integrity-'));
  const project = await mkdtemp(join(tmpdir(), 'madre-integrity-project-'));
  let server;
  try {
    ({ server } = await createPulseServer({ projectRoot: project, stateRoot: state, agents: [], invokers: {}, testMode: true }));
    const port = await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
    const origin = `http://127.0.0.1:${port}`;
    for (const name of ['notas.md', 'grande.md', 'enorme.md']) await writeFile(join(project, name), '');
    // Two packets, the «ñ» (0xC3 0xB1) cut between them.
    const whole = Buffer.from(JSON.stringify({ path: 'notas.md', content: 'año\n', force: true }));
    const cut = whole.indexOf(0xc3) + 1;
    const status = await new Promise((resolve, reject) => {
      const request = http.request({ host: '127.0.0.1', port, method: 'PUT', path: '/api/files', headers: { 'content-type': 'application/json', 'content-length': whole.length, origin } }, (response) => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
      request.on('error', reject);
      request.write(whole.subarray(0, cut));
      setTimeout(() => request.end(whole.subarray(cut)), 60);
    });
    assert.equal(status, 200);
    assert.equal(await readFile(join(project, 'notas.md'), 'utf8'), 'año\n');
    // 150 KB is well inside the editor's 2 MB: it used to answer «Nothing to save».
    const big = 'línea de texto con acentos áéíóú\n'.repeat(4600);
    const saved = await fetch(`${origin}/api/files`, { method: 'PUT', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ path: 'grande.md', content: big, force: true }) });
    assert.equal(saved.status, 200);
    assert.equal((await readFile(join(project, 'grande.md'), 'utf8')).length, big.length);
    const huge = await fetch(`${origin}/api/files`, { method: 'PUT', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ path: 'enorme.md', content: 'x'.repeat(7 * 1024 * 1024), force: true }) });
    assert.equal(huge.status, 413);
    assert.match((await huge.json()).error, /2 MB/);
  } finally {
    if (server) await new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
    for (const dir of [state, project]) await rm(dir, { recursive: true, force: true });
  }
});

test('integrity: a record cut halfway still opens, and what comes next starts on its own line (LOG-02)', async () => {
  const { EventStore } = await import('../src/event-store.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'madre-torn-'));
  try {
    const file = join(dir, 'events.jsonl');
    const good = (sequence, text) => `${JSON.stringify({ id: `e${sequence}`, sequence, type: 'message.created', timestamp: '2026-10-12T00:00:00.000Z', payload: { role: 'user', text } })}\n`;
    // Two events, then half of a third: the process died in the middle of writing it.
    await writeFile(file, good(1, 'hola') + good(2, 'año') + '{"id":"e3","sequence":3,"type":"mess');
    const store = await new EventStore(file).initialize();
    assert.equal(store.damaged, 1);
    assert.deepEqual((await store.readAll()).map((event) => event.sequence), [1, 2]);
    const next = await store.append('message.created', { role: 'user', text: 'sigo aquí' });
    assert.equal(next.sequence, 3);
    // A second reader sees both whole events and the new one; the half line is kept, stepped over.
    const again = await new EventStore(file).initialize();
    assert.deepEqual((await again.readAll()).map((event) => event.payload.text), ['hola', 'año', 'sigo aquí']);
    assert.match(await readFile(file, 'utf8'), /"type":"mess\n\{/, 'the half line was removed, or the next event was glued to it');
    const { events } = await again.tail(0);
    assert.equal(events.length, 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('integrity: a pair is signed once even when asked at once, and a revoked link stays revoked (INI-01, INI-02)', async () => {
  const { signContract, revokeContract, recallContract, activeContracts } = await import('../src/enlaces.mjs');
  const { loadConfig } = await import('../src/config.mjs');
  const state = await mkdtemp(join(tmpdir(), 'madre-links-'));
  try {
    const rooms = ['alpha-0123456789abcdef', 'beta-0123456789abcdef'];
    const raw = { rooms: { a: rooms[0], b: rooms[1] }, direction: 'a→b', kinds: ['decision'], expires: null, orders: { allowed: false, maxMode: 0, perHour: 6 } };
    const tries = await Promise.allSettled([0, 1, 2, 3].map(() => signContract(state, raw, { rooms })));
    assert.equal(tries.filter((one) => one.status === 'fulfilled').length, 1, 'the same pair was signed twice at once');
    assert.ok(tries.filter((one) => one.status === 'rejected').every((one) => one.reason.code === 'ALREADY'));
    const [contract] = activeContracts(await loadConfig(state));
    // A revocation and a recall at the same moment: the link ends revoked, every time.
    for (let round = 0; round < 10; round += 1) {
      const [again] = activeContracts(await loadConfig(state));
      const id = again?.id ?? contract.id;
      await Promise.all([revokeContract(state, id), recallContract(state, id, true)]);
      assert.equal(activeContracts(await loadConfig(state)).length, 0, 'a revoked link came back in force');
      if (round < 9) await signContract(state, raw, { rooms });
    }
    // An id that is not one writes nothing.
    assert.equal(await revokeContract(state, '__proto__'), null);
    assert.ok(!Object.hasOwn((await loadConfig(state)).enlaces, '__proto__'));
  } finally {
    await rm(state, { recursive: true, force: true });
  }
});

test('integrity: a settings file that cannot be read is kept aside before anything is saved over it', async () => {
  const { updateConfig, loadConfig } = await import('../src/config.mjs');
  const { readdir } = await import('node:fs/promises');
  const state = await mkdtemp(join(tmpdir(), 'madre-config-'));
  try {
    await writeFile(join(state, 'config.json'), '{"language":"es","scopes":{"codex":{"maxMode":3}},');
    await updateConfig(state, { theme: 'dark' });
    const kept = (await readdir(state)).filter((name) => name.startsWith('config.json.damaged-'));
    assert.equal(kept.length, 1, 'the damaged settings were not kept');
    assert.match(await readFile(join(state, kept[0]), 'utf8'), /"maxMode":3/);
    assert.equal((await loadConfig(state)).theme, 'dark');
  } finally {
    await rm(state, { recursive: true, force: true });
  }
});

test('integrity: changes that arrive at once all land — the list of conversations, the tour (LOG-11, TOUR-01)', async () => {
  const { createChat, renameChat, touchChat, listChats } = await import('../src/chats.mjs');
  const { changeTour, readTour, CHAPTERS } = await import('../src/tour.mjs');
  const room = await mkdtemp(join(tmpdir(), 'madre-index-'));
  const state = await mkdtemp(join(tmpdir(), 'madre-tour-race-'));
  try {
    const chat = await createChat(room, { title: 'antes' });
    await Promise.all([renameChat(room, chat.id, 'después'), ...Array.from({ length: 10 }, () => touchChat(room, chat.id, { text: 'hola' }))]);
    const seen = (await listChats(room)).chats.find((one) => one.id === chat.id);
    assert.equal(seen.title, 'después', 'the rename was lost to the messages');
    assert.equal(seen.messages, 10, 'a message was lost to another');
    const results = await Promise.allSettled(CHAPTERS.flatMap((id) => [changeTour(state, { chapter: id }), changeTour(state, { hold: 'tab-aaaaaa' })]));
    assert.ok(results.every((one) => one.status === 'fulfilled'), 'a change to the tour failed');
    assert.equal((await readTour(state)).done.length, CHAPTERS.length, 'a chapter read was lost');
  } finally {
    for (const dir of [room, state]) await rm(dir, { recursive: true, force: true });
  }
});

test('integrity: the privacy purge cleans every conversation of the project and counts them all (LOG-03)', async () => {
  const { readdir } = await import('node:fs/promises');
  const { createChat, chatLedger } = await import('../src/chats.mjs');
  const { basename } = await import('node:path');
  const state = await mkdtemp(join(tmpdir(), 'madre-purge-'));
  const project = await mkdtemp(join(tmpdir(), 'madre-purge-project-'));
  let server;
  try {
    ({ server } = await createPulseServer({ projectRoot: project, stateRoot: state, agents: [], invokers: {}, testMode: true }));
    const port = await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
    const origin = `http://127.0.0.1:${port}`;
    const post = (path, payload) => fetch(`${origin}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(payload) });
    const roomDir = join(state, 'rooms', (await readdir(join(state, 'rooms')))[0]);
    // Another conversation, closed, that said the private name.
    const other = await createChat(roomDir, { activate: false });
    await writeFile(chatLedger(roomDir, other.id), `${JSON.stringify({ id: 'x1', sequence: 900, type: 'message.created', timestamp: '2026-10-12T00:00:00.000Z', payload: { role: 'user', text: 'el cliente es Acme Corp' } })}\n`);
    await post('/api/privacy', { terms: ['Acme Corp'] });
    const before = await (await fetch(`${origin}/api/privacy`)).json();
    assert.equal(before.exposure.events, 1, 'the other conversation was not counted');
    const purged = await (await post('/api/privacy/purge', { designation: basename(project) })).json();
    assert.equal(purged.purged.events, 1);
    assert.equal(purged.exposure.events, 0);
    const kept = await readFile(chatLedger(roomDir, other.id), 'utf8');
    assert.ok(!kept.includes('Acme Corp'), 'the other conversation still holds the private name');
  } finally {
    if (server) await new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
    for (const dir of [state, project]) await rm(dir, { recursive: true, force: true });
  }
});

test('integrity: the memory waits its turn when another process is writing it (LOG-08)', async () => {
  const { spawn } = await import('node:child_process');
  const { RoomMemory } = await import('../src/memory.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'madre-busy-'));
  try {
    const file = join(dir, 'memory.sqlite');
    const memory = await new RoomMemory(file).initialize();
    // Another process holds the file for a moment, as the memory server of a turn does.
    const holder = spawn(process.execPath, ['-e', `const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(${JSON.stringify(file)}); db.exec('BEGIN IMMEDIATE'); console.log('held'); setTimeout(() => { db.exec('COMMIT'); db.close(); }, 400);`], { stdio: ['ignore', 'pipe', 'inherit'] });
    await new Promise((resolve) => holder.stdout.once('data', resolve));
    const started = Date.now();
    memory.index([{ id: 'e1', sequence: 1, type: 'message.created', timestamp: '2026-10-12T00:00:00.000Z', payload: { role: 'user', sender: 'you', target: 'codex', messageId: 'm1', text: 'espera tu turno' } }]);
    assert.ok(Date.now() - started >= 200, 'it did not wait, or the other process never held it');
    await new Promise((resolve) => holder.once('close', resolve));
    memory.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
