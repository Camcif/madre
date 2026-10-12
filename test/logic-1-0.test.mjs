import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildConversationContext } from '../src/conversation-context.mjs';
import { EventStore } from '../src/event-store.mjs';
import { RoomMemory } from '../src/memory.mjs';
import { MODULES, toolsForTurn } from '../src/modules/index.mjs';
import { QuotaMonitor } from '../src/quota-monitor.mjs';
import { Room } from '../src/room.mjs';
import { VectorWorker } from '../src/room/vectors.mjs';
import { fakeEmbedding } from '../src/embeddings.mjs';

// Lote 3 of the 1.0 review (2026-10-12): logic that answered wrong, each with what it does now.

test('logic: a lease the human grants mid-plan carries what was announced (LOG-05)', async () => {
  const root = await mkdtemp(join(tmpdir(), 'madre-escalate-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: root });
    const agents = [
      { id: 'claude', label: 'Claude', detected: true, ready: true, adapter: 'claude-readonly', path: '/fake/claude', version: 'test' },
      { id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake/codex', version: 'test' },
    ];
    let seen = null;
    const invokers = {
      'claude-readonly': async ({ text }) => (/closing turn/.test(text) ? { text: 'done', usage: null } : { text: 'Plan:\n```pulse\n@codex #2: genera una imagen png del logo\n```', usage: null }),
      'codex-readonly': async ({ lease }) => { seen = lease?.scopes ?? null; return { text: 'none', usage: null }; },
    };
    const store = await new EventStore(join(root, '.ledger', 'events.jsonl')).initialize();
    const room = new Room({ store, agents, projectRoot: root, invokers, distill: { enabled: false } });
    const announced = [];
    room.subscribe((event) => {
      if (event.type === 'mode.requested') setTimeout(() => room.decideMode(event.payload.requestId, 'plan'), 10);
      if (event.type === 'lease.granted') announced.push(...(event.payload.scopes ?? []));
    });
    await room.send({ text: 'coordina con codex', target: 'claude' });
    for (let i = 0; i < 100 && !seen; i += 1) await new Promise((resolve) => setTimeout(resolve, 50));
    for (const scope of announced) assert.equal(seen?.[scope], true, `${scope} was announced and arrived off`);
    await room.shutdown();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('logic: the vectors drain a backlog past one batch (LOG-07)', async () => {
  const memory = await new RoomMemory(':memory:').initialize();
  memory.index(Array.from({ length: 250 }, (_, i) => ({ id: `e${i}`, sequence: i + 1, type: 'message.created', timestamp: new Date().toISOString(), payload: { messageId: `m${i}`, role: 'user', sender: 'you', target: 'codex', text: `mensaje número ${i} sobre el proyecto` } })));
  memory.attachEmbedder({ model: 'fake-64', dims: 64, embed: async (texts) => texts.map((text) => fakeEmbedding(text)) });
  const worker = new VectorWorker({ memory });
  worker.schedule(10);
  for (let i = 0; i < 80 && memory.vectorCounts().entries < 250; i += 1) await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(memory.vectorCounts().entries, 250, 'the backlog stopped after one batch');
  worker.stop();
  memory.close();
});

test('logic: an unchanged quota reading is not written to the record again (LOG-12)', async () => {
  const root = await mkdtemp(join(tmpdir(), 'madre-quota-'));
  try {
    const store = await new EventStore(join(root, 'events.jsonl')).initialize();
    const room = new Room({ store, agents: [], projectRoot: root, distill: { enabled: false } });
    let percent = 12;
    const monitor = new QuotaMonitor({ sources: [{ id: 'codex-rollout', agent: 'codex', read: async () => ({ usedPercent: percent, resetAt: null, stale: true }) }], intervalMs: 20, onReport: (report) => room.reportOfficialQuota(report) });
    await monitor.start();
    await new Promise((resolve) => setTimeout(resolve, 200));
    percent = 30;
    await new Promise((resolve) => setTimeout(resolve, 120));
    monitor.stop();
    const written = (await store.readAll()).filter((event) => event.type === 'quota.updated');
    assert.deepEqual(written.map((event) => event.payload.usedPercent), [12, 30]);
    await room.shutdown();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('logic: an anchor on the first message holds the window (LOG-15)', () => {
  const events = Array.from({ length: 10 }, (_, i) => ({ type: 'message.created', sequence: i + 1, payload: { messageId: `m${i}`, role: i % 2 ? 'assistant' : 'user', sender: i % 2 ? 'codex' : 'you', target: 'x', text: 'z'.repeat(1000) } }));
  for (const anchor of [1, 2]) {
    const context = buildConversationContext(events, { maxChars: 16000, anchor });
    assert.equal(context.omittedMessages, anchor - 1, `anchor ${anchor} was let go though everything fits`);
  }
});

test('logic: a module that fails takes only its own tools out of the turn (LOG-17)', async () => {
  const before = MODULES.length;
  MODULES.push({ id: 'good-test', toolsForTurn: async () => [{ name: 'browser-test', command: 'node', tools: ['open'] }] });
  MODULES.push({ id: 'broken-test', toolsForTurn: async () => { throw new Error('boom'); } });
  try {
    const servers = await toolsForTurn({ config: {} }, { mode: 1 });
    assert.ok(servers.some((server) => server.name === 'browser-test'));
  } finally {
    MODULES.splice(before);
  }
});

test('logic: a note freed from an aberration stands where the human\'s verdict puts it (LOG-10)', async () => {
  const memory = await new RoomMemory(':memory:').initialize();
  memory.index([{ id: 'e1', sequence: 1, type: 'message.created', timestamp: new Date().toISOString(), payload: { messageId: 'r1', role: 'assistant', sender: 'codex', target: 'you', text: 'Usamos PostgreSQL dieciséis para la base principal del proyecto' } }]);
  memory.addMemories([{ kind: 'decision', text: 'Usamos PostgreSQL dieciséis para la base principal del proyecto', sources: [1] }], { agent: 'codex', fromSequence: 1, throughSequence: 1 });
  const [note] = memory.memories();
  memory.judge('r1', 'bad');
  const judged = memory.memories().find((one) => one.id === note.id).zone;
  const flagged = memory.flagAberration({ text: 'Falso: no usamos PostgreSQL', contradicts: note.id });
  memory.clearAberration(flagged.id);
  assert.equal(memory.memories().find((one) => one.id === note.id).zone, judged, 'a note judged bad travels again');
  memory.close();
});
