import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bishop, { formatBishop, onlyAnswers, parsePlan, resolveLinks } from '../src/modules/bishop.mjs';
import { BISHOP_SIGN_DAYS, activeContracts, channelKey, normalizeContract, signContract } from '../src/enlaces.mjs';
import { loadConfig, updateConfig } from '../src/config.mjs';
import { ensureSalasProject, knownRooms, projectRoomId, salasRoomId } from '../src/salas.mjs';
import { createPulseServer } from '../src/server.mjs';

// BISHOP, fase 4c (docs/MACROVERSO.md): S-030 (@madre only answers), the link wizard, the modes,
// #3/#4 taken to their room, STOP ALL, /bishop from any room, and S-029. Three real rooms on one
// state root (Salas, A, B) and fake agents; nothing leaves 127.0.0.1.
const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const roster = () => [
  { id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' },
  { id: 'claude', label: 'Claude', detected: true, ready: true, adapter: 'claude-readonly', path: '/fake', version: 'test' },
];
const until = async (check, what, { tries = 200, every = 20 } = {}) => {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    const found = await check();
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, every));
  }
  assert.fail(`timed out waiting for ${what}`);
};
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('bishop · @madre only answers (S-030): no block is taught and none is read', async () => {
  assert.equal(onlyAnswers('madre'), true);
  assert.equal(onlyAnswers('claude'), false);
  const salas = 'salas-0000000000000000';
  const rooms = [{ id: salas, name: 'salas', open: { port: 1 } }, { id: 'aurora-1111111111111111', name: 'aurora', open: { port: 2 } }];
  const contracts = [{ id: 'c', rooms: { a: 'aurora-1111111111111111', b: salas }, direction: 'a→b', kinds: ['decision'], orders: { allowed: true, maxMode: 1, perHour: 6 } }];
  const teaching = formatBishop({ rooms, contracts, salas, crew: ['codex', 'madre'] });
  assert.match(teaching, /```pulse-salas/);
  assert.match(teaching, /@aurora\/codex #1/, 'the example uses a room that takes orders and an agent that is here');
  const answering = formatBishop({ rooms, contracts, salas, crew: ['codex', 'madre'], answersOnly: true });
  assert.doesNotMatch(answering, /```/);
  assert.match(answering, /Solo consulta/);

  const state = await scratch('madre-bishop-s030-');
  try {
    const projectRoot = await ensureSalasProject(state);
    const recorded = [];
    const ctx = { projectRoot, stateRoot: state, config: { modules: {} }, agents: [{ id: 'madre', detected: true, ready: true }], record: async (type, payload) => recorded.push({ type, payload }), chat: 'main' };
    await bishop.onEvent(ctx, { type: 'message.created', payload: { role: 'assistant', status: 'completed', target: 'you', sender: 'madre', messageId: 'm1', parentMessageId: 'u1', text: 'Plan.\n\n```pulse-salas\nmotivo\n@aurora/codex #1: algo\n```' } });
    assert.deepEqual(recorded, [], '@madre as BISHOP never starts a plan');
  } finally {
    await rm(state, { recursive: true, force: true });
  }
});

test('bishop · D-S13: BISHOP signs only a link to read, with no orders, that expires within a week', () => {
  const now = new Date('2026-10-08T12:00:00Z');
  const day = 24 * 60 * 60 * 1000;
  const base = { rooms: { a: 'aurora-1111111111111111', b: 'boreal-2222222222222222' }, direction: 'a→b', kinds: ['fact'] };
  const at = (days) => new Date(now.getTime() + days * day).toISOString();
  assert.equal(normalizeContract({ ...base, expires: at(7), signed: { by: 'bishop' } }, { now }).signed.by, 'bishop');
  assert.equal(normalizeContract({ ...base, expires: at(30) }, { now }).signed.by, 'you', 'the human signs any link');
  assert.throws(() => normalizeContract({ ...base, expires: at(8), signed: { by: 'bishop' } }, { now }), /within 7 days/);
  assert.throws(() => normalizeContract({ ...base, expires: null, signed: { by: 'bishop' } }, { now }), /within 7 days/);
  assert.throws(() => normalizeContract({ ...base, rooms: { a: 'aurora-1111111111111111', b: 'salas-0000000000000000' }, expires: at(3), orders: { allowed: true, maxMode: 1, perHour: 6 }, signed: { by: 'bishop' } }, { now, salas: 'salas-0000000000000000' }), /orders is signed by you/);
  assert.throws(() => normalizeContract({ ...base, expires: at(3), signed: { by: 'codex' } }, { now }), /Only you or BISHOP/);
  assert.equal(BISHOP_SIGN_DAYS, 7);
});

test('bishop · the link wizard reads links and checks them like the sheet of Salas', () => {
  const parsed = parsePlan('Propuesta.\n\n```pulse-salas\nEnlazar para responder\nenlace boreal → salas: decisiones, hechos; 30 días; órdenes #1\nenlace salas → boreal: decision\nenlace boreal ↔ aurora: preferencia\nenlace aurora → boreal: secretos\n```');
  assert.equal(parsed.links.length, 2, 'two links at most');
  assert.deepEqual(parsed.ignored.map((item) => item.why), ['more than 2 links', 'more than 2 links']);
  assert.deepEqual(parsed.links[0].kinds, ['decision', 'fact']);
  assert.equal(parsed.links[0].days, 30);
  assert.equal(parsed.links[0].orders, 1);
  const salas = 'salas-0000000000000000';
  const rooms = [{ id: salas, name: 'salas' }, { id: 'aurora-1111111111111111', name: 'aurora' }, { id: 'boreal-2222222222222222', name: 'boreal' }];
  const contracts = [{ id: 'old', rooms: { a: 'aurora-1111111111111111', b: 'boreal-2222222222222222' }, direction: 'both', kinds: ['fact'], orders: { allowed: false, maxMode: 0, perHour: 6 } }];
  const lines = parsePlan('x\n\n```pulse-salas\nm\nenlace boreal → salas: decision; órdenes #2\nenlace salas → boreal: decision\n```').links
    .concat(parsePlan('x\n\n```pulse-salas\nm\nenlace aurora → boreal: fact\nenlace aurora → boreal: secretos\n```').links)
    .concat(parsePlan('x\n\n```pulse-salas\nm\nenlace aurora → boreal: fact; órdenes #1\n```').links);
  const checked = resolveLinks({ links: lines, rooms, contracts, salas });
  assert.deepEqual(checked.map((link) => link.status), ['ready', 'blocked', 'exists', 'blocked', 'blocked']);
  assert.equal(checked[0].receives, 'boreal-2222222222222222', 'orders go to the room that is not Salas');
  assert.match(checked[1].why, /never hands its notes over/);
  assert.match(checked[3].why, /Name what crosses/);
  assert.match(checked[4].why, /only on a link with the room of Salas/);
});

test('bishop · hybrid sends #1 on its own, holds #2, takes #3 to its room, signs a proposed link, and /bishop answers any room', async () => {
  const state = await scratch('madre-bishop-4c-');
  const projectA = await realpath(await scratch('madre-bishop-4c-a-'));
  const projectB = await realpath(await scratch('madre-bishop-4c-b-'));
  const salasRoot = await ensureSalasProject(state);
  let nameA = '';
  let nameB = '';
  let turnInSalas = 0;
  const prompts = { consult: [] };
  const invokers = {
    'codex-readonly': async ({ prompt }) => {
      // An order in a room: it answers and asks for a command (S-029: that is not a nested plan).
      if (prompt.includes('from Salas, sent by the human')) return { text: 'Hecho en la sala.\n\n```pulse-run\nVer las pruebas\n$ npm test\n```' };
      // A question raised from a room: it answers, and even a block it writes is never a plan.
      if (prompt.includes('question from room')) { prompts.consult.push(prompt); return { text: `En ${nameA}, la firma se verifica primero.\n\n\`\`\`pulse-salas\nNo\n@${nameA}/codex #1: nada\n\`\`\`` }; }
      turnInSalas += 1;
      prompts.bishop = prompts.bishop ?? prompt;
      if (turnInSalas === 1) return { text: `Propongo esto.\n\n\`\`\`pulse-salas\nRevisar A y enlazar B\n@${nameA}/codex #1: resume el README\n@${nameA}/codex #2: crea un borrador\n@${nameA}/claude #3: arma el despliegue\n@${nameB}/codex #1: resume lo de B\nenlace ${nameB} → salas: decision; 30 días; órdenes #1\nenlace ${nameA} → ${nameB}: fact; 30 días\n\`\`\`` };
      return { text: `Otra vez.\n\n\`\`\`pulse-salas\nSegundo plan\n@${nameA}/codex #2: otro borrador\n\`\`\`` };
    },
    'claude-readonly': async () => ({ text: 'claude here' }),
  };
  let servers = [];
  try {
    await channelKey(state);
    const salas = await createPulseServer({ projectRoot: salasRoot, stateRoot: state, agents: roster(), invokers });
    const a = await createPulseServer({ projectRoot: projectA, stateRoot: state, agents: roster(), invokers });
    const b = await createPulseServer({ projectRoot: projectB, stateRoot: state, agents: roster(), invokers });
    servers = [salas, a, b];
    const ports = await Promise.all(servers.map(({ server }) => listen(server)));
    await Promise.all(servers.map((server, index) => server.markOpen(ports[index])));
    const [S, A] = ports.map((port) => `http://127.0.0.1:${port}`);
    const salasId = salasRoomId(state);
    const [idA, idB] = [projectRoomId(projectA), projectRoomId(projectB)];
    const rooms = await knownRooms(state);
    nameA = rooms.find((room) => room.id === idA).name;
    nameB = rooms.find((room) => room.id === idB).name;
    await signContract(state, { rooms: { a: idA, b: salasId }, direction: 'a→b', kinds: ['decision'], orders: { allowed: true, maxMode: 2, perHour: 6 } }, { salas: salasId, designation: nameA });
    await updateConfig(state, { modules: { bishop: { enabled: true, agent: 'codex', mode: 'hybrid' } } });
    const ledger = async (room) => room.store.readAll();
    const find = async (room, type, test = () => true) => (await ledger(room)).filter((event) => event.type === type && test(event.payload));

    assert.equal((await post(`${S}/api/messages`, { text: 'revisa A y enlaza B', target: 'codex', mode: 1 })).status, 202);
    const [proposed] = await until(async () => { const found = await find(salas, 'bishop.plan.proposed'); return found.length ? found : null; }, 'the plan');
    const plan = proposed.payload.plan;
    assert.equal(proposed.payload.mode, 'hybrid');
    assert.deepEqual(proposed.payload.orders.map((order) => order.status), ['ready', 'ready', 'proposal', 'blocked']);
    assert.deepEqual(proposed.payload.links.map((link) => link.status), ['ready', 'ready']);
    assert.doesNotMatch(prompts.bishop, /You may put other agents to work/, 'S-032: BISHOP is not taught to delegate in Salas');
    assert.match(prompts.bishop, /Un enlace de solo lectura lo firmas tú/, 'BISHOP knows which links it signs');

    // D-S13: the link that only reads, BISHOP signed itself, for a week at most; the one with
    // orders still waits for the human.
    const auto = await until(async () => { const found = await find(salas, 'bishop.link.signed', (said) => said.index === 1); return found.length ? found[0] : null; }, 'BISHOP signing the link to read');
    assert.equal(auto.payload.by, 'bishop');
    const readOnly = activeContracts(await loadConfig(state), { salas: salasId }).find((contract) => contract.id === auto.payload.contract);
    assert.equal(readOnly.signed.by, 'bishop');
    assert.equal(readOnly.orders.allowed, false);
    assert.ok(Date.parse(readOnly.expires) - Date.now() <= 7 * 24 * 60 * 60 * 1000 + 5000, 'clamped to a week although 30 days were asked');
    assert.equal((await find(salas, 'bishop.link.signed', (said) => said.index === 0)).length, 0, 'a link with orders is never signed by BISHOP');
    const settings = await post(`${S}/api/settings`, { room: { delegation: true } });
    assert.equal(settings.status, 200);
    assert.equal((await fetch(`${S}/api/settings`).then((response) => response.json())).settings.delegation, false, 'S-032: delegation stays off in Salas');
    const page = await fetch(`${S}/api/salas/enlaces`, { method: 'POST', headers: { 'content-type': 'application/json', origin: S }, body: JSON.stringify({ a: idB, b: idA, direction: 'a→b', kinds: ['fact'], expires: new Date(Date.now() + 86400000).toISOString(), by: 'bishop' }) });
    assert.equal((await page.json()).contract.signed.by, 'you', 'a page cannot sign as BISHOP');

    // Hybrid: #1 leaves on its own and comes back; #2 waits for the press; #3 goes to its room.
    await until(async () => (await find(salas, 'command.output', (said) => said.name === 'bishop' && said.bishop.step === 1)).length, 'the answer to #1');
    assert.equal((await find(salas, 'bishop.order.sent', (said) => said.step === 1 && said.auto)).length, 1, 'said as sent on its own');
    assert.equal((await find(salas, 'bishop.order.sent', (said) => said.step === 2)).length, 0, '#2 waits in hybrid');
    const delivered = await until(async () => { const found = await find(a, 'bishop.order.proposed'); return found.length ? found : null; }, 'the proposal in A');
    assert.deepEqual({ agent: delivered[0].payload.agent, mode: delivered[0].payload.mode }, { agent: 'claude', mode: 3 });
    const glance = await fetch(`${A}/api/glance`).then((response) => response.json());
    assert.ok(glance.waiting.some((ask) => ask.kind === 'bishop' && ask.mode === 3), 'A waits for the human\'s key');
    assert.ok(!(await ledger(a)).some((event) => event.type === 'room.alert' && event.payload.code === 'nested-delegation'), 'S-029: a ```pulse-run is not a nested plan');
    assert.ok(!(await ledger(a)).some((event) => event.type === 'message.created' && event.payload.via === 'bishop' && /#3/.test(event.payload.text ?? '') && /arma el despliegue/.test(event.payload.text ?? '')), '#3 never runs');

    // The proposed link: wrong designation refused, the right one signs, and the order to B that
    // waited for it leaves on its own (hybrid, #1).
    assert.equal((await post(`${S}/api/x/bishop/link`, { plan, index: 0, designation: 'otra' })).status, 403);
    assert.equal((await post(`${S}/api/x/bishop/link`, { plan, index: 0, designation: nameB })).status, 202);
    const linked = activeContracts(await loadConfig(state), { salas: salasId }).find((contract) => contract.rooms.a === idB && contract.rooms.b === salasId);
    assert.ok(linked && linked.orders.allowed && linked.orders.maxMode === 1, 'the contract is the one proposed');
    assert.equal((await post(`${S}/api/x/bishop/link`, { plan, index: 0, designation: nameB })).status, 409, 'signed once');
    await until(async () => (await find(salas, 'command.output', (said) => said.name === 'bishop' && said.bishop.step === 4)).length, 'the answer from B');
    assert.ok((await find(b, 'message.created', (said) => said.via === 'bishop')).length, 'B received its order after the link was signed');

    // #2 by the human's press; then the plan closes once.
    assert.equal((await post(`${S}/api/x/bishop/send`, { plan, step: 2 })).status, 202);
    await until(async () => (await find(salas, 'bishop.plan.closed')).length, 'the close');
    assert.equal((await find(salas, 'bishop.plan.closed')).length, 1);

    // A second plan waits in hybrid (#2); STOP ALL in Salas stops it from leaving on its own.
    await until(async () => !(await fetch(`${S}/api/state`).then((response) => response.json())).working?.length, 'Salas idle', { tries: 50 });
    assert.equal((await post(`${S}/api/messages`, { text: 'otro plan', target: 'codex', mode: 1 })).status, 202);
    const second = await until(async () => { const found = await find(salas, 'bishop.plan.proposed'); return found.length === 2 ? found[1] : null; }, 'the second plan');
    assert.equal((await post(`${S}/api/stop-all`, {})).status, 202);
    await until(async () => (await find(salas, 'bishop.plan.halted', (said) => said.plan === second.payload.plan)).length, 'the halt');

    // /bishop from A: the question goes to Salas, the answer comes back for the human only.
    const turnsBefore = turnInSalas;
    const command = await post(`${A}/api/commands`, { text: `/bishop ¿qué decidió ${nameA}?` });
    assert.equal(command.status, 200, await command.clone().text());
    const answer = await until(async () => { const found = await find(a, 'bishop.answer'); return found.length ? found[0] : null; }, 'the answer in A');
    assert.match(answer.payload.text, /la firma se verifica primero/);
    assert.ok(!(await find(a, 'command.output')).some((event) => /la firma se verifica primero/.test(event.payload.text ?? '')), 'the agents of A do not read the answer');
    assert.equal(turnInSalas, turnsBefore, 'a question from a room is not a turn that starts a plan');
    assert.match(prompts.consult[0], /Solo consulta/, 'a relayed question is answered in the answers-only block');
    assert.doesNotMatch(prompts.consult[0], /Si el humano pide actuar/, 'and is never taught the block of orders');
    assert.equal((await find(salas, 'bishop.plan.proposed')).length, 2, 'a block in a relayed answer is never a plan');
    const relayed = (await find(salas, 'message.created', (said) => said.via === 'bishop' && said.role === 'user')).at(-1);
    assert.match(relayed.payload.text, /question from room/);
  } finally {
    await Promise.all(servers.map(({ server }) => close(server)));
    await Promise.all([state, projectA, projectB].map((root) => rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 })));
  }
});
