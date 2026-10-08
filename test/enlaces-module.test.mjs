import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RoomMemory } from '../src/memory.mjs';
import { loadConfig, updateConfig } from '../src/config.mjs';
import { markProject, salasProjectRoot, salasRoomId } from '../src/salas.mjs';
import { createPulseServer, projectRoomId } from '../src/server.mjs';
import { phonePolicy } from '../src/bridge/policy.mjs';
import { CHANNEL_HEADER, NO_SUCH_LINK, channelKey, countRecent, receivesOrders, signContract } from '../src/enlaces.mjs';
import enlaces, { BRIEF, ENLACE_TOOLS, SERVER_NAME, TOOLS, callTool, handleRequest } from '../src/modules/enlaces.mjs';

// ENLACES, the door an agent reads through (docs/MACROVERSO.md, phase 3c): the module that hands a
// turn the MCP server `pulse-enlaces` only when a signed link lets this room read, the server's
// two tools, the side that asks (`/api/enlace/ask`), the notices between rooms, and signing and
// revoking from Salas. Two real rooms, A and B, on one state root; nothing leaves 127.0.0.1.
const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const roster = [{ id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' }];
const SELF = fileURLToPath(new URL('../src/modules/enlaces.mjs', import.meta.url));
const hash = (q) => createHash('sha256').update(q).digest('hex').slice(0, 16);
const events = async (room, type) => (await room.store.readAll()).filter((event) => event.type === type);

test('enlaces · the module, the tool, the asking side, the notices, and signing from Salas, end to end with two rooms', async () => {
  const state = await scratch('madre-enlaces-3c-');
  const projectA = await realpath(await scratch('madre-enlaces-3c-a-'));
  const projectB = await realpath(await scratch('madre-enlaces-3c-b-'));
  const invokers = { 'codex-readonly': async () => ({ text: 'done' }) };
  const a = await createPulseServer({ projectRoot: projectA, stateRoot: state, agents: roster, invokers });
  const b = await createPulseServer({ projectRoot: projectB, stateRoot: state, agents: roster, invokers });
  const portA = await listen(a.server);
  await a.markOpen(portA);
  const portB = await listen(b.server);
  await b.markOpen(portB);
  const [idA, idB, nameA, nameB] = [projectRoomId(projectA), projectRoomId(projectB), basename(projectA), basename(projectB)];
  // The room of Salas does not exist yet (phase 3d); its id does, and it is known once its
  // notebook folder is on disk, asleep like any closed room.
  const salas = salasRoomId(state);
  await mkdir(salasProjectRoot(state), { recursive: true });
  await markProject(join(state, 'rooms', salas), salasProjectRoot(state));
  const key = await channelKey(state);
  const post = (port, path, payload, headers = {}) => fetch(`http://127.0.0.1:${port}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(payload) });
  const page = (port) => ({ origin: `http://127.0.0.1:${port}` });
  const channel = { [CHANNEL_HEADER]: key };
  const phone = { 'x-madre-device': 'd1', 'x-madre-device-kind': 'iphone' };
  const ask = (payload, headers = channel, port = portB) => post(port, '/api/enlace/ask', payload, headers);
  const toolsOf = async (port, mode = 1) => (await (await fetch(`http://127.0.0.1:${port}/api/briefing?agent=codex&mode=${mode}`)).json()).launch.mcpServers;
  const turnB = { agent: 'codex', mode: 1, port: portB, roomDir: join(state, 'rooms', idB) };
  const ctxB = async () => ({ stateRoot: state, projectRoot: projectB, config: await loadConfig(state), env: {} });
  const env = { PULSE_HOME: state, PULSE_ENLACES_ROOM: idB, PULSE_ENLACES_PORT: String(portB) };
  try {
    // A's archive: what travels and what does not.
    const memory = await new RoomMemory(join(state, 'rooms', idA, 'memory.sqlite')).initialize();
    memory.addMemories([
      { kind: 'decision', text: 'Webhook signatures are verified before parsing.', sources: [1] },
      { kind: 'fact', text: 'The client of record is Globex.', sources: [1] },
      { kind: 'question', text: 'Should the webhook retry on 5xx?', sources: [1] },
    ], { agent: 'codex', fromSequence: 1, throughSequence: 1 });
    memory.close();

    // ---- The module: nothing without a contract, nothing in #0, and never from the phone's side.
    assert.equal(enlaces.id, 'enlaces');
    assert.equal(enlaces.name, 'ENLACES');
    assert.equal(enlaces.defaults.enabled, true, 'ENLACES is not on by default');
    assert.deepEqual(await enlaces.toolsForTurn(await ctxB(), turnB), [], 'a tool travelled with no link signed');
    assert.ok(!(await toolsOf(portB)).some((server) => server.name === SERVER_NAME), 'THE LAUNCH shows a server no link justifies');
    for (const [method, path] of [['POST', '/api/salas/enlaces'], ['POST', '/api/salas/enlaces/revoke'], ['POST', '/api/enlace/ask'], ['POST', '/api/enlace/notice']]) {
      assert.equal(phonePolicy({ method, pathname: path }).allow, false, `the bridge lets a phone at ${path}`);
    }

    // ---- Signing from Salas: from the room's own page, with the rules of the contract and of Salas.
    assert.equal((await post(portA, '/api/salas/enlaces', { a: idA, b: idB, direction: 'a→b', kinds: ['decision', 'fact'] }, phone)).status, 403, 'signed from a phone');
    assert.equal((await post(portA, '/api/salas/enlaces', { a: idA, b: idB, direction: 'a→b', kinds: ['decision', 'fact'] }, { origin: 'http://127.0.0.1:1' })).status, 403, 'signed from another page');
    assert.equal((await post(portA, '/api/salas/enlaces', { a: idA, b: 'nowhere-0123456789abcdef', direction: 'a→b', kinds: ['fact'] }, page(portA))).status, 404);
    const sideways = await post(portA, '/api/salas/enlaces', { a: idA, b: idB, direction: 'sideways', kinds: ['fact'] }, page(portA));
    assert.equal(sideways.status, 422);
    assert.match((await sideways.json()).error, /direction/);
    const fromSalas = await post(portA, '/api/salas/enlaces', { a: salas, b: idB, direction: 'a→b', kinds: ['fact'] }, page(portA));
    assert.equal(fromSalas.status, 422, 'the room of Salas served');
    assert.match((await fromSalas.json()).error, /never serves/);
    const ordersAlone = await post(portA, '/api/salas/enlaces', { a: idA, b: idB, direction: 'a→b', kinds: ['fact'], orders: { allowed: true, maxMode: 1, perHour: 6 } }, page(portA));
    assert.equal(ordersAlone.status, 422, 'orders without the room of Salas');
    assert.match((await ordersAlone.json()).error, /need the room of Salas/);
    const toSalas = { a: salas, b: idB, direction: 'b→a', kinds: ['fact'], orders: { allowed: true, maxMode: 2, perHour: 4 } };
    assert.equal((await post(portA, '/api/salas/enlaces', toSalas, page(portA))).status, 403, 'orders signed with no designation');
    assert.equal((await post(portA, '/api/salas/enlaces', { ...toSalas, designation: nameA }, page(portA))).status, 403, 'orders signed with the wrong room\'s name');
    const ordered = await post(portA, '/api/salas/enlaces', { ...toSalas, designation: nameB.toUpperCase() }, page(portA));
    assert.equal(ordered.status, 200);
    const orderedContract = (await ordered.json()).contract;
    assert.deepEqual(orderedContract.orders, { allowed: true, maxMode: 2, perHour: 4 });
    assert.equal(receivesOrders(orderedContract, salas), idB);
    // B serves Salas under that one and was told so, by the channel, as a line and never a message.
    const toldB = await events(b, 'enlace.signed');
    assert.equal(toldB.length, 1);
    assert.deepEqual(toldB[0].payload, { contract: orderedContract, other: 'salas', otherId: salas, role: 'serves', kinds: ['fact'], expires: null, orders: orderedContract.orders });
    assert.equal((await events(b, 'message.created')).length, 0);

    // Orders left out are no orders: off, #0, six an hour (B serves Salas questions, to be read by BISHOP).
    const plain = (await (await post(portA, '/api/salas/enlaces', { a: idB, b: salas, direction: 'a→b', kinds: ['question'] }, page(portA))).json()).contract;
    assert.deepEqual(plain.orders, { allowed: false, maxMode: 0, perHour: 6 }, 'orders absent did not default to none');
    assert.equal((await events(b, 'enlace.signed')).at(-1).payload.role, 'serves');

    // The link this test reads through: A serves B, decisions and facts, more readings an hour
    // than this test makes (the ceiling of six is 3b's, and it is proved there).
    const signed = await post(portA, '/api/salas/enlaces', { a: idA, b: idB, direction: 'a→b', kinds: ['decision', 'fact'], expires: null, orders: { allowed: false, maxMode: 0, perHour: 50 } }, page(portA));
    assert.equal(signed.status, 200);
    const { contract } = await signed.json();
    assert.deepEqual(Object.keys(contract), ['id', 'rooms', 'direction', 'kinds', 'zones', 'expires', 'revoked', 'orders', 'signed']);
    assert.deepEqual(contract.orders, { allowed: false, maxMode: 0, perHour: 50 });
    assert.deepEqual((await events(a, 'enlace.signed')).map((event) => event.payload), [{ contract, other: nameB, otherId: idB, role: 'serves', kinds: ['decision', 'fact'], expires: null, orders: contract.orders }]);
    assert.deepEqual((await events(b, 'enlace.signed')).at(-1).payload, { contract, other: nameA, otherId: idA, role: 'reads', kinds: ['decision', 'fact'], expires: null, orders: contract.orders });

    // ---- Salas sees it: the id of its own room, the links in force, and no traffic yet.
    const list = await (await fetch(`http://127.0.0.1:${portA}/api/salas`)).json();
    assert.equal(list.salas, salas);
    assert.deepEqual(list.enlaces.map((one) => one.id).sort(), [contract.id, orderedContract.id, plain.id].sort());
    assert.deepEqual(list.enlaces.find((one) => one.id === contract.id), { ...contract, traffic: { reads24h: 0, reads1h: 0, lastAt: null } });

    // ---- The module now hands the server to B, and only to B, and only above #0.
    const [server] = await enlaces.toolsForTurn(await ctxB(), turnB);
    assert.equal(server.name, SERVER_NAME);
    assert.equal(server.command, process.execPath);
    assert.deepEqual(server.args, [SELF]);
    assert.deepEqual(server.tools, ENLACE_TOOLS);
    assert.deepEqual(server.tools, TOOLS.map((tool) => tool.name));
    assert.deepEqual(server.env, env);
    assert.equal(server.sends, undefined, 'a reading tool declared that it sends');
    assert.equal(server.brief, BRIEF);
    assert.match(server.brief, /Read-only/);
    assert.match(server.brief, /according to room/);
    assert.ok(!server.brief.includes(key) && !JSON.stringify(server.env).includes(key), 'the key reached the turn');
    assert.deepEqual(await enlaces.toolsForTurn(await ctxB(), { ...turnB, mode: 0 }), [], 'the tool travelled in #0');
    assert.deepEqual(await enlaces.toolsForTurn({ ...(await ctxB()), config: { ...(await loadConfig(state)), modules: { enlaces: { enabled: false } } } }, turnB), [], 'switched off and still offered');
    assert.deepEqual(await enlaces.toolsForTurn(await ctxB(), { ...turnB, roomDir: join(state, 'rooms', idA) }), [], 'A reads from nobody');
    // Counted in THE LAUNCH as any server: by name, with the names of its environment and never a value.
    const launched = (await toolsOf(portB)).find((one) => one.name === SERVER_NAME);
    assert.ok(launched, 'THE LAUNCH of B does not show pulse-enlaces');
    assert.deepEqual(launched.tools, ENLACE_TOOLS);
    assert.deepEqual(launched.env, ['PULSE_ENLACES_PORT', 'PULSE_ENLACES_ROOM', 'PULSE_HOME']);
    assert.ok(!(await toolsOf(portB, 0)).some((one) => one.name === SERVER_NAME), 'offered in #0');
    assert.ok(!(await toolsOf(portA)).some((one) => one.name === SERVER_NAME), 'offered to the room that only serves');

    // ---- The asking side: B asks itself, with the key, and it asks A.
    assert.equal((await ask({ room: idA }, { ...channel, ...phone })).status, 403, 'asked from a phone');
    assert.equal((await ask({ room: idA }, { ...channel, ...page(portB) })).status, 403, 'asked from a page');
    assert.equal((await ask({ room: idA }, {})).status, 403, 'asked without the key');
    assert.equal((await ask({ room: 'nowhere' })).status, 404);
    assert.deepEqual(await (await ask({ room: idB }, channel, portA)).json(), { error: NO_SUCH_LINK }, 'A read from B against the arrow');
    const first = await ask({ room: idA, query: 'webhook signatures', limit: 1 });
    assert.equal(first.status, 200);
    const got = await first.json();
    assert.deepEqual(Object.keys(got), ['from', 'contract', 'notes']);
    assert.equal(got.from, nameA, 'the source is named by its id, not its name');
    assert.equal(got.contract, contract.id);
    assert.deepEqual(got.notes.map((note) => [note.kind, note.zone, note.text]), [['decision', 'hold', 'Webhook signatures are verified before parsing.']]);
    // By name, the latest of the kinds signed; and fewer kinds than signed, never more.
    const byName = await (await ask({ room: nameA.toUpperCase() })).json();
    assert.deepEqual(byName.notes.map((note) => note.kind), ['fact', 'decision']);
    const narrowed = await (await ask({ room: nameA, kinds: ['decision', 'question'] })).json();
    assert.deepEqual(narrowed.notes.map((note) => note.kind), ['decision']);
    const outside = await ask({ room: nameA, kinds: ['question'] });
    assert.equal(outside.status, 422, 'a kind the link does not cross was asked across it');
    assert.match((await outside.json()).error, /read only: decision, fact/);
    // What each room kept: counters, never words. The query is a hash in both.
    const received = await events(b, 'enlace.received');
    assert.deepEqual(received.map((event) => event.payload), [
      { contract: contract.id, from: idA, count: 1, turn: null, query: hash('webhook signatures') },
      { contract: contract.id, from: idA, count: 2, turn: null, query: null },
      { contract: contract.id, from: idA, count: 1, turn: null, query: null },
    ]);
    const reads = await events(a, 'enlace.read');
    assert.deepEqual(reads.map((event) => [event.payload.to, event.payload.count, event.payload.kinds, event.payload.query]), [[idB, 1, ['decision', 'fact'], hash('webhook signatures')], [idB, 2, ['decision', 'fact'], null], [idB, 1, ['decision'], null]]);
    assert.ok(!JSON.stringify([received, reads]).includes('Webhook') && !JSON.stringify([received, reads]).includes('Globex'), 'a note or a query reached a ledger');
    const crossings = (await readFile(join(state, 'rooms', idB, 'enlaces.jsonl'), 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
    assert.deepEqual(crossings.map((line) => [line.kind, line.contract, line.other, line.count]), [['received', contract.id, idA, 1], ['received', contract.id, idA, 2], ['received', contract.id, idA, 1]]);
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'read'), 3);
    // Salas counts the readings from the serving room's lines; the card of B says what it read.
    const traffic = (await (await fetch(`http://127.0.0.1:${portA}/api/salas`)).json()).enlaces.find((one) => one.id === contract.id).traffic;
    assert.equal(traffic.reads24h, 3);
    assert.equal(traffic.reads1h, 3);
    assert.ok(Number.isFinite(Date.parse(traffic.lastAt)));
    const cardB = (await (await fetch(`http://127.0.0.1:${portB}/api/extensions`)).json()).extensions.find((one) => one.id === 'enlaces');
    assert.deepEqual(cardB.status, { installed: true, detail: 'on · one link lets this room read · 3 readings in 24 h' });
    assert.equal(cardB.summary, 'What other rooms know, when a signed link lets this room read it. Read-only; nothing leaves this Mac.');

    // ---- The tools, in process, as the agent would see them.
    const roomsSeen = await callTool('enlace_rooms', {}, { env });
    assert.equal(roomsSeen, `- ${nameA} · decision, fact · no expiry · open`);
    const found = await callTool('enlace_search', { room: nameA, query: 'webhook signatures', limit: 1 }, { env });
    assert.equal(found, `- [${nameA} · decision · hold · #1] Webhook signatures are verified before parsing.`);
    assert.match(await callTool('enlace_search', { room: nameA, kinds: ['fact'] }, { env }), new RegExp(`^- \\[${nameA} · fact · hold · #1\\] The client of record is Globex\\.$`));
    // Words that match nothing still bring the latest (the search is memory_search's, fallback and
    // all, 3b); the sentence for an empty answer is said when the serving room has nothing to give.
    const empty = async (url, init) => new Response(JSON.stringify({ from: 'phobos', contract: 'c', notes: [], asked: JSON.parse(init.body) }), { status: 200 });
    assert.equal(await callTool('enlace_search', { room: 'phobos', query: 'nothing of the sort xyzzy' }, { env, fetchImpl: empty }), 'Room phobos has no note that matches "nothing of the sort xyzzy" right now.');
    assert.equal(await callTool('enlace_search', { room: 'phobos', kinds: ['fact', 'rumour'] }, { env, fetchImpl: empty }), 'Room phobos has no note of kind fact that travels right now.');
    assert.equal(await callTool('enlace_search', { room: 'phobos', kinds: ['rumour'] }, { env, fetchImpl: empty }), 'Nothing was read: a kind is one of decision, fact, preference, question.');
    assert.equal(await callTool('enlace_search', { room: nameA, kinds: ['question'] }, { env }), 'Nothing was read: This link lets this room read only: decision, fact.');
    assert.equal(await callTool('enlace_search', {}, { env }), 'Say which room to read from; enlace_rooms lists them.');
    assert.equal(await callTool('enlace_search', { room: nameB }, { env: { ...env, PULSE_ENLACES_ROOM: idA } }), `Nothing was read: ${NO_SUCH_LINK}`);
    const rpc = await handleRequest({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'enlace_search', arguments: { room: nameA, limit: 1 } } }, { env });
    assert.equal(rpc.result.isError, false);
    assert.match(rpc.result.content[0].text, new RegExp(`^- \\[${nameA} · fact`));
    assert.equal((await handleRequest({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'memory_note', arguments: {} } }, { env })).error.code, -32602);
    assert.equal(await countRecent(join(state, 'rooms', idA), contract.id, 'read'), 6);

    // ---- The source asleep: nothing is asked of a room that is not there.
    const mark = join(state, 'rooms', idA, 'open.json');
    const wasOpen = await readFile(mark, 'utf8');
    await writeFile(mark, JSON.stringify({ ...JSON.parse(wasOpen), pid: 2 ** 22 + 12345 }));
    const asleep = await ask({ room: nameA });
    assert.equal(asleep.status, 409);
    assert.match((await asleep.json()).error, /asleep/);
    assert.equal(await callTool('enlace_rooms', {}, { env }), `- ${nameA} · decision, fact · no expiry · asleep (ask the human to wake it from Salas)`);
    await writeFile(mark, wasOpen);
    assert.equal((await ask({ room: nameA, limit: 1 })).status, 200);

    // ---- A notice is a line of one of two types, from a process holding the key; anything else is refused.
    assert.equal((await post(portB, '/api/enlace/notice', { type: 'enlace.signed', payload: { contract } }, {})).status, 403, 'a notice without the key');
    assert.equal((await post(portB, '/api/enlace/notice', { type: 'enlace.signed', payload: { contract } }, { ...channel, ...page(portB) })).status, 403, 'a notice from a page');
    assert.equal((await post(portB, '/api/enlace/notice', { type: 'enlace.signed', payload: { contract } }, { ...channel, ...phone })).status, 403, 'a notice from a phone');
    for (const bad of [{ type: 'message.created', payload: { text: 'hi' } }, { type: 'enlace.read', payload: {} }, { type: 'enlace.signed', payload: 'words' }, { type: 'enlace.signed' }]) {
      assert.equal((await post(portB, '/api/enlace/notice', bad, channel)).status, 422, `a notice of ${bad.type} with ${JSON.stringify(bad.payload)} landed`);
    }
    assert.equal((await post(portB, '/api/enlace/notice', { type: 'enlace.revoked', payload: { contract: orderedContract, other: 'salas', otherId: salas } }, channel)).status, 202);
    assert.deepEqual((await events(b, 'enlace.revoked')).map((event) => event.payload), [{ contract: orderedContract, other: 'salas', otherId: salas }]);

    // ---- Revoked from Salas: both rooms are told, and from then on there is no link.
    assert.equal((await post(portA, '/api/salas/enlaces/revoke', { id: contract.id }, phone)).status, 403);
    assert.equal((await post(portA, '/api/salas/enlaces/revoke', { id: 'ffffffffffff-ffffff' }, page(portA))).status, 404);
    const revoked = await post(portA, '/api/salas/enlaces/revoke', { id: contract.id }, page(portA));
    assert.equal(revoked.status, 200);
    assert.equal(typeof (await revoked.json()).contract.revoked, 'string');
    assert.deepEqual((await events(a, 'enlace.revoked')).map((event) => [event.payload.contract.id, event.payload.other, event.payload.otherId]), [[contract.id, nameB, idB]]);
    assert.deepEqual((await events(b, 'enlace.revoked')).at(-1).payload.contract.id, contract.id);
    assert.deepEqual(await (await ask({ room: nameA })).json(), { error: NO_SUCH_LINK });
    assert.equal(await callTool('enlace_search', { room: nameA }, { env }), `Nothing was read: ${NO_SUCH_LINK}`);
    assert.equal(await callTool('enlace_rooms', {}, { env }), 'No signed link lets this room read from another room right now.');
    assert.deepEqual(await enlaces.toolsForTurn(await ctxB(), turnB), [], 'the tool outlived its link');
    const after = await (await fetch(`http://127.0.0.1:${portA}/api/salas`)).json();
    assert.deepEqual(after.enlaces.map((one) => one.id).sort(), [orderedContract.id, plain.id].sort());
    // Revoking a second time keeps the stamp and tells nobody again.
    assert.equal((await post(portA, '/api/salas/enlaces/revoke', { id: contract.id }, page(portA))).status, 200);
    assert.equal((await events(a, 'enlace.revoked')).length, 1);
    // A contract in config.json that breaks the rules of Salas is nothing to the room that serves.
    assert.equal((await fetch(`http://127.0.0.1:${portB}/api/enlace/memories?${new URLSearchParams({ contract: orderedContract.id, asking: salas })}`, { headers: channel })).status, 200);
    await updateConfig(state, { enlaces: { [orderedContract.id]: { ...orderedContract, direction: 'both' } } });
    assert.deepEqual((await (await fetch(`http://127.0.0.1:${portA}/api/salas`)).json()).enlaces.map((one) => one.id), [plain.id]);
    assert.equal((await fetch(`http://127.0.0.1:${portB}/api/enlace/memories?${new URLSearchParams({ contract: orderedContract.id, asking: salas })}`, { headers: channel })).status, 404);
  } finally {
    await close(b.server);
    await close(a.server);
  }
});

test('enlaces · the module file is the MCP server when it is run: it answers tools/list and enlace_rooms over stdio', async () => {
  const state = await scratch('madre-enlaces-stdio-');
  const project = await scratch('madre-enlaces-stdio-proj-');
  const [idA, idB] = ['phobos-0123456789abcdef', 'gumball-0123456789abcdef'];
  for (const [id, name] of [[idA, 'phobos'], [idB, 'gumball']]) { await mkdir(join(project, name), { recursive: true }); await markProject(join(state, 'rooms', id), join(project, name)); }
  const contract = await signContract(state, { rooms: { a: idA, b: idB }, direction: 'a→b', kinds: ['decision'], expires: '2030-01-01' });
  const child = spawn(process.execPath, [SELF], { env: { ...process.env, PULSE_HOME: state, PULSE_ENLACES_ROOM: idB, PULSE_ENLACES_PORT: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
  let out = '';
  let err = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { out += chunk; });
  child.stderr.on('data', (chunk) => { err += chunk; });
  const done = new Promise((resolve) => child.on('close', resolve));
  child.stdin.write([
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } }),
    JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'enlace_rooms', arguments: {} } }),
    JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'enlace_search', arguments: { room: 'phobos' } } }),
    '',
  ].join('\n'));
  child.stdin.end();
  const code = await done;
  assert.equal(code, 0, `the server did not end cleanly: ${err}`);
  const replies = out.trim().split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(replies.map((reply) => reply.id), [1, 2, 3, 4]);
  assert.equal(replies[0].result.serverInfo.name, SERVER_NAME);
  assert.deepEqual(replies[1].result.tools.map((tool) => tool.name), ENLACE_TOOLS);
  assert.equal(replies[2].result.content[0].text, `- phobos · decision · until 2030-01-01 · asleep (ask the human to wake it from Salas)`);
  // Port 1 answers nobody: the tool says so, as a sentence, and the server does not die of it.
  assert.equal(replies[3].result.content[0].text, 'Nothing was read: this room did not answer.');
  assert.equal(replies[3].result.isError, false);
  assert.equal(contract.rooms.a, idA);
});
