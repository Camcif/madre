import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RoomMemory } from '../src/memory.mjs';
import { RECALL_NOTES, channelKey, countRecent } from '../src/enlaces.mjs';
import { projectRoomId } from '../src/salas.mjs';
import { createPulseServer } from '../src/server.mjs';

// Fase 3e (docs/MACROVERSO.md): a link may recall, on every turn of the room that reads, up to
// RECALL_NOTES of the other room's notes — only if the human ticked it. And S-021: each of those
// readings names its agent and its turn. Two real rooms on one state root; fake agents.
const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const roster = () => [{ id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' }];
const until = async (check, what, { tries = 250, every = 20 } = {}) => {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    const found = await check();
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, every));
  }
  assert.fail(`timed out waiting for ${what}`);
};

test('enlaces · recall on every turn: off unless ticked, at most 3 notes, a reading of the turn, never in GHOST', async () => {
  const state = await scratch('madre-recall-');
  const projectA = await realpath(await scratch('madre-recall-a-'));
  const projectB = await realpath(await scratch('madre-recall-b-'));
  const prompts = [];
  const invokers = { 'codex-readonly': async ({ prompt }) => { prompts.push(prompt); return { text: 'listo' }; } };
  let servers = [];
  try {
    await channelKey(state);
    const a = await createPulseServer({ projectRoot: projectA, stateRoot: state, agents: roster(), invokers });
    const b = await createPulseServer({ projectRoot: projectB, stateRoot: state, agents: roster(), invokers });
    servers = [a, b];
    const [portA, portB] = await Promise.all(servers.map(({ server }) => listen(server)));
    await a.markOpen(portA);
    await b.markOpen(portB);
    const [idA, idB] = [projectRoomId(projectA), projectRoomId(projectB)];
    const memory = await new RoomMemory(join(state, 'rooms', idA, 'memory.sqlite')).initialize();
    memory.addMemories(Array.from({ length: 5 }, (_, index) => ({ kind: 'decision', text: `Webhook rule ${index}: signatures are checked before parsing.`, sources: [1] })), { agent: 'codex', fromSequence: 1, throughSequence: 1 });
    memory.close();
    const A = `http://127.0.0.1:${portA}`;
    const B = `http://127.0.0.1:${portB}`;
    const post = (url, body, headers = {}) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    const ledgerB = () => b.store.readAll();
    let counted = 0;   // turns that leave a trace in the ledger (every one but GHOST)
    const ask = async (text, mode = 1) => {
      const before = prompts.length;
      assert.equal((await post(`${B}/api/messages`, { text, target: 'codex', mode })).status, 202);
      await until(() => prompts.length > before, 'the turn');
      // A GHOST turn leaves nothing in the ledger; the others are waited for until they end.
      if (mode === 0) await new Promise((resolve) => setTimeout(resolve, 150));
      else {
        counted += 1;
        await until(async () => (await ledgerB()).filter((event) => event.type === 'agent.completed').length >= counted, 'the end of the turn');
      }
      return prompts.at(-1);
    };

    // Signed with the box ticked, from the page of Salas (A's room serves it).
    const signed = await post(`${A}/api/salas/enlaces`, { a: idA, b: idB, direction: 'a→b', kinds: ['decision'], expires: null, orders: { allowed: false, maxMode: 0, perHour: 3 }, recall: true }, { origin: A });
    assert.equal(signed.status, 200);
    const contract = (await signed.json()).contract;
    assert.equal(contract.recall, true);

    // The preview says it will read on sending, and does not read.
    const preview = await fetch(`${B}/api/briefing?agent=codex&text=webhook%20signatures`).then((response) => response.json());
    assert.equal(preview.dynamic, true);
    assert.ok(!preview.parts.some((part) => part.id === 'linked'));
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'read'), 0, 'the preview spent a reading');

    // A turn: at most 3 notes, stamped with the room, and the reading names this turn and agent.
    const prompt = await ask('webhook signatures');
    const block = prompt.match(/<linked>\n([\s\S]*?)\n<\/linked>/);
    assert.ok(block, 'no linked block');
    assert.equal(block[1].split('\n').length, RECALL_NOTES);
    assert.match(block[1], /^- \[[^\]]+ · decision · #1\] Webhook rule/m);
    assert.match(prompt, /according to room/);
    const ledger = await ledgerB();
    const reading = ledger.find((event) => event.type === 'enlace.received');
    const reply = ledger.find((event) => event.type === 'message.created' && event.payload.role === 'assistant');
    assert.deepEqual({ auto: reading.payload.auto, agent: reading.payload.agent, turn: reading.payload.turn, count: reading.payload.count }, { auto: true, agent: 'codex', turn: reply.payload.messageId, count: RECALL_NOTES });
    const cost = ledger.find((event) => event.type === 'turn.cost');
    assert.ok(cost.payload.blocks.linked > 0, 'the economy does not see the block');

    // GHOST reads nothing and recalls nothing.
    const ghost = await ask('webhook signatures', 0);
    assert.doesNotMatch(ghost, /<linked>/);
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'read'), 1);

    // The hourly limit (3 here) applies: past it the turn still runs, with nothing recalled.
    await ask('webhook signatures');
    await ask('webhook signatures');
    const over = await ask('webhook signatures');
    assert.doesNotMatch(over, /<linked>/, 'recalled past the hourly limit');
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'read'), 3);

    // The box: only the human, from Salas. Not a process, not a phone; then off means off.
    assert.equal((await post(`${A}/api/salas/enlaces/recall`, { id: contract.id, recall: false })).status, 403, 'a process changed it');
    assert.equal((await post(`${A}/api/salas/enlaces/recall`, { id: contract.id, recall: false }, { origin: A, 'x-madre-device': 'd1' })).status, 403, 'a phone changed it');
    assert.equal((await post(`${A}/api/salas/enlaces/recall`, { id: contract.id, recall: 'no' }, { origin: A })).status, 422);
    const cleared = await post(`${A}/api/salas/enlaces/recall`, { id: contract.id, recall: false }, { origin: A });
    assert.equal(cleared.status, 200);
    const listed = await fetch(`${A}/api/salas`).then((response) => response.json());
    assert.equal(listed.enlaces.find((one) => one.id === contract.id).recall, false);
    const quiet = await fetch(`${B}/api/briefing?agent=codex&text=webhook`).then((response) => response.json());
    assert.equal(quiet.dynamic, false, 'still announced after the box was cleared');

    // BISHOP never ticks it: a link it signs reads only when its agents choose to. (A pair is
    // connected once, so the first link is revoked before the second is signed.)
    assert.equal((await post(`${A}/api/salas/enlaces/revoke`, { id: contract.id }, { origin: A })).status, 200);
    const byBishop = await post(`${A}/api/salas/enlaces`, { a: idA, b: idB, direction: 'a→b', kinds: ['fact'], expires: new Date(Date.now() + 86400000).toISOString(), by: 'bishop', recall: true });
    assert.equal((await byBishop.json()).contract.recall, false);
  } finally {
    await Promise.all(servers.map(({ server }) => close(server)));
    await Promise.all([state, projectA, projectB].map((root) => rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 })));
  }
});
