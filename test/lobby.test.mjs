import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { associateProject, knownRooms, listFolders, projectRoomId, suggestProjects } from '../src/salas.mjs';
import { createPulseServer } from '../src/server.mjs';

// THE LOBBY (2026-10-10): the first screen of MADRE. It adds projects by browsing the folders of
// the home folder itself (a browser cannot hand it a path), reads names and marker files and never
// what a file says, associates a folder without opening it, and gives a folder used before the id
// it already had, so its memory is there. Only its own page on this Mac may do any of it.
const scratch = (prefix) => mkdtemp(join(tmpdir(), prefix));
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
const roster = [{ id: 'codex', label: 'Codex', detected: true, ready: true, adapter: 'codex-readonly', path: '/fake', version: 'test' }];

test('lobby · folders inside the home, projects first; suggestions; associating writes where it is and nothing else', async () => {
  const home = await realpath(await scratch('madre-lobby-home-'));
  const state = await realpath(await scratch('madre-lobby-state-'));
  try {
    await mkdir(join(home, 'Projects', 'webshop', '.git'), { recursive: true });
    await mkdir(join(home, 'Projects', 'notes'), { recursive: true });
    await writeFile(join(home, 'Projects', 'notes', 'secret.txt'), 'never read');
    await mkdir(join(home, 'api'), { recursive: true });
    await writeFile(join(home, 'api', 'package.json'), '{}');
    await mkdir(join(home, '.hidden'), { recursive: true });
    await mkdir(join(home, 'node_modules'), { recursive: true });

    const top = await listFolders({ home, stateRoot: state });
    assert.equal(top.path, home);
    assert.equal(top.parent, null);
    assert.deepEqual(top.entries.map((one) => [one.name, one.project]), [['api', true], ['Projects', false]], 'hidden folders, node_modules or the order of projects first went wrong');
    const inner = await listFolders({ path: join(home, 'Projects'), home, stateRoot: state });
    assert.equal(inner.parent, home);
    assert.deepEqual(inner.entries.map((one) => [one.name, one.project]), [['webshop', true], ['notes', false]]);
    // Outside the home: refused, whichever way it is spelled.
    assert.equal((await listFolders({ path: tmpdir(), home, stateRoot: state })).error, 'outside');
    assert.equal((await listFolders({ path: join(home, '..'), home, stateRoot: state })).error, 'outside');

    const found = await suggestProjects({ home, stateRoot: state });
    assert.deepEqual(found.map((one) => one.name).sort(), ['api', 'webshop']);

    // Associating: a record of where it is, beside the room's record; nothing opened, no file read.
    const added = await associateProject({ root: join(home, 'Projects', 'webshop'), home, stateRoot: state });
    assert.equal(added.id, projectRoomId(join(home, 'Projects', 'webshop')), 'not the id madre start gives that folder');
    const record = JSON.parse(await readFile(join(state, 'rooms', added.id, 'project.json'), 'utf8'));
    assert.equal(record.root, join(home, 'Projects', 'webshop'));
    assert.equal(record.lastOpened, null);
    const rooms = await knownRooms(state);
    assert.equal(rooms.length, 1);
    assert.equal(rooms[0].open, null, 'associating opened it');
    // Known now: said so in the folders, and no longer suggested.
    assert.equal((await listFolders({ path: join(home, 'Projects'), home, stateRoot: state })).entries.find((one) => one.name === 'webshop').known, true);
    assert.deepEqual((await suggestProjects({ home, stateRoot: state })).map((one) => one.name), ['api']);
    // A second time: the same record, when it was added kept.
    const again = await associateProject({ root: join(home, 'Projects', 'webshop'), home, stateRoot: state });
    assert.equal(again.already, true);
    // Never the home itself, never outside it, never MADRE's own folder, never a folder not there.
    assert.equal((await associateProject({ root: home, home, stateRoot: state })).error, 'outside');
    assert.equal((await associateProject({ root: tmpdir(), home, stateRoot: state })).error, 'outside');
    assert.equal((await associateProject({ root: join(home, 'gone'), home, stateRoot: state })).error, 'missing');
    const inState = await realpath(await scratch('madre-lobby-nested-'));
    assert.equal((await associateProject({ root: join(state, 'salas'), home: state, stateRoot: state })).error, 'madre');
    await rm(inState, { recursive: true, force: true });
  } finally {
    await rm(home, { recursive: true, force: true });
    await rm(state, { recursive: true, force: true });
  }
});

test('lobby · the routes answer only its own page on this Mac: not a phone, not another site, not another host name', async () => {
  const home = await realpath(await scratch('madre-lobby-routes-home-'));
  const state = await realpath(await scratch('madre-lobby-routes-state-'));
  const project = await realpath(await scratch('madre-lobby-routes-project-'));
  const before = process.env.PULSE_LOBBY_HOME;
  process.env.PULSE_LOBBY_HOME = home;
  let server;
  try {
    await mkdir(join(home, 'shop', '.git'), { recursive: true });
    ({ server } = await createPulseServer({ projectRoot: project, stateRoot: state, agents: roster, invokers: {} }));
    const port = await listen(server);
    const base = `http://127.0.0.1:${port}`;
    const page = { 'sec-fetch-site': 'same-origin' };
    const listed = await fetch(`${base}/api/salas/folders`, { headers: page });
    assert.equal(listed.status, 200);
    assert.deepEqual((await listed.json()).entries.map((one) => one.name), ['shop']);
    assert.equal((await fetch(`${base}/api/salas/folders`, { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403, 'another site read the folders');
    assert.equal((await fetch(`${base}/api/salas/folders`, { headers: { ...page, 'x-madre-device': 'phone-1' } })).status, 403, 'a phone read the folders');
    assert.equal((await fetch(`${base}/api/salas/folders?path=${encodeURIComponent(tmpdir())}`, { headers: page })).status, 403, 'a folder outside the home was listed');
    const suggestions = await fetch(`${base}/api/salas/suggestions`, { headers: page }).then((response) => response.json());
    assert.deepEqual(suggestions.suggestions.map((one) => one.name), ['shop']);
    // Adding: only with this page's origin.
    const add = (headers) => fetch(`${base}/api/salas/projects`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ roots: [join(home, 'shop')] }) });
    assert.equal((await add({})).status, 403, 'a process without an origin added a project');
    assert.equal((await add({ origin: 'https://evil.example' })).status, 403, 'another site added a project');
    const ok = await add({ origin: base });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).added[0].name, 'shop');
    const lobby = await fetch(`${base}/api/salas`).then((response) => response.json());
    assert.ok(lobby.rooms.some((room) => room.name === 'shop' && !room.open), 'the added project is not in the lobby, asleep');
  } finally {
    if (before === undefined) delete process.env.PULSE_LOBBY_HOME; else process.env.PULSE_LOBBY_HOME = before;
    if (server) await close(server);
    for (const dir of [home, state, project]) await rm(dir, { recursive: true, force: true });
  }
});

// The lobby as a dashboard (2026-10-10): BISHOP at its heart. A question written there goes to
// BISHOP's room in the address (`#para=`), waits in that room's box unsent, and the address
// forgets it at once; BISHOP opens here or in a new tab, by plain links.
test('lobby · a question for BISHOP reaches its room\'s box unsent, here or in a new tab', async () => {
  const read = (file) => readFile(join(import.meta.dirname, '..', 'public', file), 'utf8');
  const [app, page, html] = await Promise.all([read('app.js'), read('salas-mac.js'), read('salas-mac.html')]);
  // The room takes `#para=` into its box only when the box is empty, and never sends it.
  const arrival = app.slice(app.indexOf("const said = /^#para=(.*)$/s.exec("), app.indexOf("const said = /^#para=(.*)$/s.exec(") + 600);
  assert.ok(arrival.length > 100, 'the room does not read #para= any more');
  assert.match(arrival, /replaceState\?\.\(null, '', `\$\{globalThis\.location\.pathname\}\$\{globalThis\.location\.search\}`\)/, 'the address keeps the words');
  assert.match(arrival, /!els\.input\.value\.trim\(\)\) \{ els\.input\.value = text; autosize\(\); els\.input\.focus\(\); \}/);
  assert.doesNotMatch(arrival, /requestSubmit|\.submit\(|sendMessage|fetch\(/, 'the words are sent, not left in the box');
  // The lobby writes them encoded, and BISHOP's two ways in are links: the second a new tab.
  assert.match(page, /#para=\$\{encodeURIComponent\(text\)\}/);
  assert.match(html, /<a id="sm-bishop-go" class="sm-btn primary small" href="\/">/);
  assert.match(html, /<a id="sm-bishop-tab" class="sm-round small" href="\/" target="_blank" rel="noopener"/);
  // Asleep, it is woken first and the new tab is opened at the press, so it is not blocked.
  assert.match(page, /const tab = newTab \? window\.open\('about:blank', '_blank'\) : null;/);
});
