import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MAX_ORDERS, RESULT_CHARS, orderHeader, parsePlan, planById, resolveOrders } from '../src/modules/bishop.mjs';
import { CHANNEL_HEADER, NO_SUCH_LINK, channelKey, countRecent, revokeContract, signContract } from '../src/enlaces.mjs';
import { updateConfig } from '../src/config.mjs';
import { pairsFromEvents } from '../src/dataset.mjs';
import { localReply } from '../src/adapters/madre.mjs';
import { phonePolicy } from '../src/bridge/policy.mjs';
import { ensureSalasProject, knownRooms, projectRoomId, salasRoomId } from '../src/salas.mjs';
import { createPulseServer } from '../src/server.mjs';

// BISHOP's orders (docs/MACROVERSO.md, fase 4b; D-S11): the block, the checks of each order, and the
// channel end to end with the room of Salas and a real room that receives. Nothing leaves 127.0.0.1.
const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const roster = () => [{ id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' }, { id: 'claude', label: 'Claude', detected: true, ready: true, adapter: 'claude-readonly', path: '/fake', version: 'test' }];
const until = async (check, what, { tries = 150, every = 20 } = {}) => {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    const found = await check();
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, every));
  }
  assert.fail(`timed out waiting for ${what}`);
};

test('bishop · the block of orders: the last one, nothing after it, a reason first, at most four', () => {
  assert.equal(parsePlan('Sin bloque.'), null);
  assert.equal(parsePlan('```js\nconst x = 1;\n```'), null, 'another fence is not a plan');
  const two = parsePlan('```pulse-salas\nprimero\n@a/codex #1: uno\n```\nentre\n```pulse-salas\nsegundo\n@b/codex #0: dos\n```');
  assert.equal(two.reason, 'segundo', 'only the last block counts');
  assert.deepEqual(two.orders.map((order) => order.room), ['b']);
  assert.deepEqual(parsePlan('```pulse-salas\nmotivo\n@a/codex #1: x\n```\ndespués').ignored.map((item) => item.why), ['text after the block']);
  assert.deepEqual(parsePlan('```pulse-salas\n@a/codex #1: x\n```').ignored.map((item) => item.why), ['the first line says why']);
  assert.deepEqual(parsePlan('```pulse-salas\nmotivo\n@a/codex #1: x').ignored.map((item) => item.why), ['the block is not closed']);
  const many = parsePlan(['```pulse-salas', 'cinco', ...Array.from({ length: 5 }, (_, index) => `@sala ${index}/codex #1: tarea ${index}`), '@x/codex #7: no', 'no es orden', '```'].join('\n'));
  assert.equal(many.orders.length, MAX_ORDERS);
  assert.equal(many.orders[0].room, 'sala 0', 'a room name may have spaces');
  assert.deepEqual(many.ignored.map((item) => item.why), ['more than 4 orders', 'no such mode', 'not an order line']);
  assert.equal(parsePlan('```pulse-salas\nm\n@a/claude #4: despliega\n```').orders[0].mode, 4, '#3/#4 parse; they are refused later');
});

test('bishop · the header of an order is not read by @madre as a request to act', () => {
  const header = orderHeader({ step: 1, total: 2, plan: 'p-abcdef' });
  assert.equal(localReply(`${header}\n\nResume en tres líneas lo que la sala recuerda del Macroverso.`), null, 'a question that comes as an order is answered, not refused');
  assert.notEqual(localReply(`${header}\n\nDespliega el sitio.`), null, 'an order to act is still refused by @madre, as from the human');
});

test('bishop · each order is checked: room, agent, link, ceiling; #3 and #4 only as a proposal', () => {
  const salas = 'salas-0000000000000000';
  const rooms = [{ id: salas, name: 'salas' }, { id: 'aurora-1111111111111111', name: 'Aurora' }, { id: 'boreal-2222222222222222', name: 'boreal' }, { id: 'twin-3333333333333333', name: 'twin' }, { id: 'twin-4444444444444444', name: 'twin' }];
  const contracts = [{ id: 'c1', rooms: { a: 'aurora-1111111111111111', b: salas }, orders: { allowed: true, maxMode: 1, perHour: 6 } }];
  const orders = ['aurora/codex #1: a', 'AURORA/codex #2: b', 'aurora/claude #3: c', 'boreal/codex #1: d', 'twin/codex #1: e', 'salas/codex #1: f', 'nadie/codex #1: g', 'aurora/robot #1: h'].map((line) => parsePlan(`\`\`\`pulse-salas\nm\n@${line}\n\`\`\``).orders[0]);
  const checked = resolveOrders({ orders, rooms, contracts, salas, agents: roster() });
  assert.deepEqual(checked.map((order) => order.status), ['ready', 'blocked', 'proposal', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']);
  assert.equal(checked[1].why, 'That link allows orders up to #{n}.');
  assert.deepEqual(checked[1].whyArgs, { n: 1 });
  assert.match(checked[3].why, /No signed link/);
  assert.match(checked[4].why, /Two rooms/);
  assert.match(checked[5].why, /lives in this room/);
  assert.match(checked[7].why, /No such agent/);
});

test('bishop · an order goes out from Salas, runs at depth 1 in the room it is for, and comes back as a card', async () => {
  const state = await scratch('madre-bishop-4b-');
  const projectA = await realpath(await scratch('madre-bishop-4b-a-'));
  const salasRoot = await ensureSalasProject(state);
  const long = `Resumen: ${'detalle '.repeat(400)}`;
  const seen = [];
  // One invoker for every room: BISHOP in Salas answers with a block of orders; the room that
  // receives an order answers long, and also tries to open a plan of its own.
  const invokers = {
    'codex-readonly': async ({ prompt }) => {
      seen.push(prompt);
      if (prompt.includes('from Salas, sent by the human')) return { text: `${long}\n\n\`\`\`pulse\n@claude: sigue tú\n\`\`\`` };
      return { text: `Propongo esto.\n\n\`\`\`pulse-salas\nRevisar el proyecto A\n@${nameA}/codex #1: resume el README\n@${nameA}/codex #2: crea un borrador\n@${nameA}/claude #3: arma el despliegue\n@nowhere/codex #1: nada\n\`\`\`` };
    },
    'claude-readonly': async () => ({ text: 'claude here' }),
  };
  let nameA = '';
  let servers = [];
  try {
    const key = await channelKey(state);
    const salas = await createPulseServer({ projectRoot: salasRoot, stateRoot: state, agents: roster(), invokers });
    const a = await createPulseServer({ projectRoot: projectA, stateRoot: state, agents: roster(), invokers });
    servers = [salas, a];
    const [portS, portA] = await Promise.all(servers.map(({ server }) => listen(server)));
    await salas.markOpen(portS);
    await a.markOpen(portA);
    const salasId = salasRoomId(state);
    const idA = projectRoomId(projectA);
    nameA = (await knownRooms(state)).find((room) => room.id === idA).name;
    const contract = await signContract(state, { rooms: { a: idA, b: salasId }, direction: 'a→b', kinds: ['decision'], orders: { allowed: true, maxMode: 1, perHour: 2 } }, { salas: salasId, designation: nameA.toUpperCase() });
    await updateConfig(state, { modules: { bishop: { enabled: true, agent: 'codex' } } });
    const S = `http://127.0.0.1:${portS}`;
    const A = `http://127.0.0.1:${portA}`;

    // The human asks BISHOP; its reply becomes a plan with one button per order.
    const asked = await fetch(`${S}/api/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: 'revisa A', target: 'codex', mode: 1 }) });
    assert.equal(asked.status, 202);
    const proposed = await until(async () => (await salas.store.readAll()).find((event) => event.type === 'bishop.plan.proposed'), 'the plan');
    assert.ok(seen[0].includes('```pulse-salas'), 'the prompt of BISHOP teaches the block when a link allows orders');
    assert.deepEqual(proposed.payload.orders.map((order) => order.status), ['ready', 'blocked', 'proposal', 'blocked']);
    const plan = proposed.payload.plan;
    assert.equal((await planById(state, plan)).chat !== undefined, true);
    const send = (step, headers = {}) => fetch(`${S}/api/x/bishop/send`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ plan, step }) });
    assert.equal((await send(2)).status, 409, 'a blocked order has no button');
    assert.equal((await send(1, { 'x-madre-device': 'd1', 'x-madre-device-kind': 'iphone' })).status, 403, 'not from a phone');
    for (const path of ['/api/x/bishop/send', '/api/x/bishop/skip', '/api/x/bishop/order', '/api/x/bishop/result']) assert.equal(phonePolicy({ method: 'POST', pathname: path }).allow, false, `the bridge lets a phone at ${path}`);
    const before = (await a.store.readAll()).length;

    // Send order 1. It runs in A through the door of a message, at depth 1, with origin bishop.
    assert.equal((await send(1)).status, 202);
    assert.equal((await send(1)).status, 409, 'an order is sent once');
    const card = await until(async () => (await salas.store.readAll()).find((event) => event.type === 'command.output' && event.payload.name === 'bishop'), 'the answer card');
    assert.equal(card.payload.ok, true);
    assert.ok(card.payload.text.length <= RESULT_CHARS, 'the card is bounded');
    assert.equal(card.payload.bishop.cut, true);
    assert.equal(card.payload.bishop.step, 1);
    assert.match(card.payload.bishop.link, new RegExp(`:${portA}/$`));
    const ledgerA = await a.store.readAll();
    const order = ledgerA.slice(before).find((event) => event.type === 'message.created' && event.payload.role === 'user');
    assert.equal(order.payload.via, 'bishop');
    assert.equal(order.payload.mode, 1);
    assert.ok(order.payload.text.startsWith(orderHeader({ step: 1, total: 4, plan })));
    assert.ok(!ledgerA.some((event) => event.type === 'plan.created'), 'the room that received the order did not open a plan');
    assert.ok(ledgerA.some((event) => event.type === 'room.alert' && event.payload.code === 'nested-delegation'), 'the turn ran at depth 1: its attempt at a plan was refused as nested');
    assert.equal(pairsFromEvents(ledgerA).length, 0, 'an order and its answer are not the human\'s words');
    const chatsA = (await fetch(`${A}/api/chats`).then((response) => response.json())).chats;
    assert.ok(chatsA.every((chat) => !/^BISHOP ›/.test(chat.preview ?? '') && !/^BISHOP ›/.test(chat.title ?? '')), 'the list of conversations shows the header, not the task');
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'order'), 1);
    const closed = await until(async () => (await salas.store.readAll()).find((event) => event.type === 'bishop.plan.closed'), 'the close of the plan');
    assert.deepEqual({ done: closed.payload.done, failed: closed.payload.failed, skipped: closed.payload.skipped }, { done: 1, failed: 0, skipped: 0 });
    const turnsInSalas = (await salas.store.readAll()).filter((event) => event.type === 'agent.started').length;
    assert.equal(turnsInSalas, 1, 'the card and the close start no turn in Salas');

    // The channel, straight at A: every door checked by A itself.
    const direct = (body, headers = { [CHANNEL_HEADER]: key }) => fetch(`${A}/api/x/bishop/order`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ contract: contract.id, plan: 'p-abcdef', step: 1, total: 1, agent: 'codex', mode: 1, text: 'hola', from: salasId, ...body }) });
    const quiet = (await a.store.readAll()).length;
    assert.equal((await direct({}, {})).status, 403, 'no key');
    assert.equal((await direct({}, { [CHANNEL_HEADER]: key, origin: A })).status, 403, 'a page cannot');
    assert.equal((await direct({}, { [CHANNEL_HEADER]: key, 'x-madre-device': 'd1' })).status, 403, 'a phone cannot');
    assert.equal((await direct({ mode: 3 })).status, 403, '#3 never travels');
    assert.equal((await direct({ mode: 2 })).status, 403, 'over the contract ceiling');
    assert.equal((await direct({ from: 'someone-else' })).status, 404);
    assert.equal((await direct({ agent: 'gemini' })).status, 422);
    assert.equal((await a.store.readAll()).length, quiet, 'nothing refused reached the room');
    assert.equal((await fetch(`${S}/api/x/bishop/order`, { method: 'POST', headers: { 'content-type': 'application/json', [CHANNEL_HEADER]: key }, body: '{}' })).status, 403, 'Salas never receives orders');

    // One at a time, then the hourly limit (2 on this link; one was used above).
    assert.equal((await direct({})).status, 202);
    assert.equal((await direct({})).status, 409, 'one order at a time per room');
    await until(async () => {
      const ledger = await a.store.readAll();
      const sent = ledger.filter((event) => event.type === 'message.created' && event.payload.via === 'bishop');
      return sent.length === 2 && ledger.some((event) => event.type === 'message.created' && event.payload.parentMessageId === sent[1].payload.messageId);
    }, 'the second order answered');
    // While the order is still settling the room says 409; a refusal never uses up the limit.
    let status = 409;
    await until(async () => { status = (await direct({})).status; return status !== 409; }, 'the room free again');
    assert.equal(status, 429, 'the hourly limit of orders');

    await revokeContract(state, contract.id);
    const revoked = await direct({});
    assert.equal(revoked.status, 404);
    assert.equal((await revoked.json()).error, NO_SUCH_LINK);
  } finally {
    await Promise.all(servers.map(({ server }) => close(server)));
    await Promise.all([state, projectA].map((root) => rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 })));
  }
});
