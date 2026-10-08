import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bishop, { bishopBlock, formatBishop } from '../src/modules/bishop.mjs';
import { channelKey, revokeContract, signContract } from '../src/enlaces.mjs';
import { loadConfig } from '../src/config.mjs';
import { RoomMemory } from '../src/memory.mjs';
import { ensureSalasProject, projectRoomId, salasRoomId } from '../src/salas.mjs';
import { createPulseServer } from '../src/server.mjs';

const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const agents = [
  { id: 'madre', label: 'MADRE', detected: true, ready: true, adapter: 'madre-local', local: true, version: 'test' },
  { id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' },
  { id: 'claude', label: 'Claude', detected: true, ready: false, adapter: 'claude-readonly', path: '/fake', version: 'test' },
];

test('bishop · the card lives only in Salas and the choice accepts only ready agents', async () => {
  const state = await scratch('madre-bishop-card-');
  try {
    const projectRoot = await ensureSalasProject(state);
    let config = { modules: {} };
    const ctx = { projectRoot, stateRoot: state, agents, get config() { return config; }, updateConfig: async (patch) => { config = { ...config, modules: { ...config.modules, ...patch.modules } }; } };
    const card = await bishop.describe(ctx);
    assert.equal(card.status.installed, true);
    assert.equal(card.controls[0].value, 'madre');
    assert.deepEqual(card.controls[0].options, ['madre', 'codex']);
    assert.equal((await bishop.setControl(ctx, { key: 'agent', value: 'claude' })).status, 400);
    assert.equal((await bishop.setControl(ctx, { key: 'agent', value: 'codex' })).status, 200);
    assert.equal((await bishop.describe(ctx)).controls[0].value, 'codex');
    assert.equal(await bishop.promptForTurn(ctx, { agent: 'madre', text: 'hola' }), null);
    const elsewhere = { ...ctx, projectRoot: state };
    assert.equal(await bishop.describe(elsewhere), null);
    assert.equal((await bishop.setControl(elsewhere, { key: 'agent', value: 'codex' })).status, 404);
    const noLocal = { ...ctx, agents: agents.filter((agent) => agent.id !== 'madre'), config: { modules: {} } };
    assert.equal((await bishop.describe(noLocal)).status.installed, false, 'without a local model no agent is selected for the human');
  } finally {
    await rm(state, { recursive: true, force: true });
  }
});

test('bishop · the census is bounded and never contains a waiting message', () => {
  const rooms = Array.from({ length: 30 }, (_, index) => ({ id: `room-${index}`, name: `room ${index}`, open: index % 2 ? null : { port: 4000 + index } }));
  const glances = new Map(rooms.map((room) => [room.id, { working: ['codex'], waitingCount: 1, waiting: [{ text: 'PRIVATE WAITING TEXT' }], census: { kinds: { fact: 2, decision: 1 } } }]));
  const block = formatBishop({ rooms, glances });
  assert.ok(block.length <= 1500);
  assert.match(block, /room 0 · abierta · trabaja:codex · espera:1 · fact:2,decision:1/);
  assert.doesNotMatch(block, /PRIVATE WAITING TEXT/);
  assert.match(block, /Nunca pidas llaves/);
  const withNote = formatBishop({ rooms, glances, local: true, notes: [{ room: 'Aurora', kind: 'decision', text: 'The signed webhook comes first.' }] });
  assert.ok(withNote.length <= 1500);
  assert.match(withNote, /Aurora · decision.*signed webhook/, 'a large census cannot hide the signed note');
});

test('bishop · two signed rooms supply notes to @madre, and a turn cites both without giving it unsanctioned notes', async () => {
  const state = await scratch('madre-bishop-links-');
  const one = await scratch('madre-bishop-one-');
  const two = await scratch('madre-bishop-two-');
  const projectRoot = await ensureSalasProject(state);
  const captured = [];
  const running = { running: true, host: 'http://bishop-test-ollama', models: [{ name: 'qwen2.5:7b' }], embedModel: null, chatModel: 'qwen2.5:7b' };
  const reportFetch = async (url, init) => {
    if (String(url).startsWith(running.host)) {
      const call = JSON.parse(init.body);
      captured.push(call);
      return { ok: true, json: async () => ({ message: { content: `Según la sala ${one.split('/').at(-1)}, los webhooks usan firmas; según la sala ${two.split('/').at(-1)}, las facturas se archivan.` }, prompt_eval_count: 200, eval_count: 30 }) };
    }
    return fetch(url, init);
  };
  const options = { stateRoot: state, agents: agents.filter((agent) => agent.id !== 'madre'), ollamaProbe: async () => running, reportFetch,
    invokers: { 'codex-readonly': async () => ({ text: 'done', usage: null }) } };
  let servers = [];
  try {
    await channelKey(state);
    const salas = await createPulseServer({ ...options, projectRoot, agents: options.agents.map((agent) => ({ ...agent })) });
    const a = await createPulseServer({ ...options, projectRoot: one, agents: options.agents.map((agent) => ({ ...agent })) });
    const b = await createPulseServer({ ...options, projectRoot: two, agents: options.agents.map((agent) => ({ ...agent })) });
    servers = [salas, a, b];
    const ports = await Promise.all(servers.map(({ server }) => listen(server)));
    await Promise.all(servers.map((server, index) => server.markOpen(ports[index])));
    const [idA, idB] = await Promise.all([one, two].map(async (root) => projectRoomId(await realpath(root))));
    for (const [id, sentence] of [[idA, 'Webhook invoices in room one require signed headers.'], [idB, 'Webhook invoices in room two are archived daily.']]) {
      const memory = await new RoomMemory(join(state, 'rooms', id, 'memory.sqlite')).initialize();
      memory.addMemories([{ kind: 'decision', text: sentence, sources: [1] }], { agent: 'codex', fromSequence: 1, throughSequence: 1 });
      memory.close();
    }
    const here = salasRoomId(state);
    const blockFor = async (agent = 'madre') => bishopBlock({ projectRoot, stateRoot: state, config: await loadConfig(state), agents: [...agents], record: async () => {} }, { agent, text: 'webhook invoices' });
    assert.doesNotMatch(await blockFor(), /require signed headers|archived daily/, 'no signed link gives no note');
    const linkA = await signContract(state, { rooms: { a: idA, b: here }, direction: 'a→b', kinds: ['decision'] });
    await signContract(state, { rooms: { a: idB, b: here }, direction: 'a→b', kinds: ['decision'] });

    const url = `http://127.0.0.1:${ports[0]}`;
    const cards = await fetch(`${url}/api/extensions`).then((response) => response.json());
    assert.ok(cards.extensions.some((card) => card.id === 'bishop'));
    const outside = await fetch(`http://127.0.0.1:${ports[1]}/api/extensions`).then((response) => response.json());
    assert.ok(!outside.extensions.some((card) => card.id === 'bishop'));
    const preview = await fetch(`${url}/api/briefing?agent=madre&text=webhook%20invoices`).then((response) => response.json());
    assert.ok(Array.isArray(preview.parts), JSON.stringify(preview));
    const bishopPart = preview.parts.find((part) => part.id === 'bishop');
    assert.ok(bishopPart && bishopPart.chars <= 1500);
    assert.equal(preview.dynamic, true);
    assert.doesNotMatch(bishopPart.text, /require signed headers|archived daily/, 'a preview must not consume a link reading');
    const direct = await blockFor();
    assert.match(direct, /require signed headers/);
    assert.match(direct, /archived daily/);
    assert.ok(direct.length <= 1500);
    assert.equal(await blockFor('codex'), null, 'a different agent does not inherit BISHOP');

    const response = await fetch(`${url}/api/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: 'webhook invoices', target: 'madre', mode: 1 }) });
    assert.equal(response.status, 202);
    for (let attempt = 0; attempt < 50 && !captured.length; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(captured.length, 1);
    assert.match(captured[0].messages[0].content, /BISHOP in the MADRE room of Salas/);
    assert.match(captured[0].messages[1].content, /require signed headers/);
    assert.match(captured[0].messages[1].content, /archived daily/);
    assert.doesNotMatch(captured[0].messages[1].content, /PRIVATE WAITING TEXT/);
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const ledger = await salas.store.readAll();
      if (ledger.some((event) => event.type === 'agent.completed' && event.payload.agent === 'madre')) {
        assert.ok(ledger.some((event) => event.type === 'message.created' && /Según la sala/.test(event.payload.text ?? '')));
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await revokeContract(state, linkA.id);
    assert.doesNotMatch(await blockFor(), /require signed headers/, 'a revoked link removes its notes');
    assert.match(await blockFor(), /archived daily/, 'the other signed link still works');
    const switched = await fetch(`${url}/api/extensions/bishop/settings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: 'agent', value: 'codex' }) });
    assert.equal(switched.status, 200);
    const otherPreview = await fetch(`${url}/api/briefing?agent=codex&text=webhook%20invoices`).then((result) => result.json());
    assert.ok(otherPreview.parts.some((part) => part.id === 'bishop'));
    assert.equal(otherPreview.dynamic, false);
    const previousPreview = await fetch(`${url}/api/briefing?agent=madre&text=webhook%20invoices`).then((result) => result.json());
    assert.ok(!previousPreview.parts.some((part) => part.id === 'bishop'));
  } finally {
    await Promise.all(servers.map(({ server }) => close(server)));
    await Promise.all([state, one, two].map((root) => rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 })));
  }
});
