// Links between rooms (docs/MACROVERSO.md, phase 3b): the contract two rooms sign, the key that
// proves a caller is a MADRE process on this Mac, the side that asks, and the counters of what
// crossed. A link reads; nothing here writes in another room.
//
// The contract lives in `~/.pulse/config.json` under `enlaces`, keyed by id, written with
// `updateConfig` so every room on this Mac reads the same one and two rooms signing at once keep
// both (S-001, S-007). What may cross is said once, in src/memory.mjs: `travels()` and
// `RECALLED_ZONES` are cited here, never copied (docs/ZONAS.md). The locks live in the room that
// serves (src/server.mjs, the ENLACES section), never in the room that asks.
//
// The key: one secret in `~/.pulse/credentials/enlaces.json`, the same shape the vault keeps for a
// module (`{ name: value }`, 0600 inside 0700), made by the first room that needs it, carried in a
// header and never in a URL, a body or a log. Of the key, the ledger may know its name and its
// length, never its value (docs/SDK.md, the vault). It proves «a MADRE process on this Mac», not
// which room: that limit is written down, not papered over.

import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { appendFile, chmod, link, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadConfig, updateConfig } from './config.mjs';
import { RECALLED_ZONES, STANDING_KINDS } from './memory.mjs';
import { knownRooms } from './salas.mjs';

// The kinds a contract may name: knowledge that stands. An aberration is the one kind that is
// not knowledge and it never crosses, whatever a contract says.
export const LINK_KINDS = [...STANDING_KINDS];
// The zones a link may read from are the zones a turn may read from, and nothing else.
export const LINK_ZONES = [...RECALLED_ZONES];
export const DIRECTIONS = ['a→b', 'b→a', 'both'];
export const MAX_LIMIT = 20;
export const DEFAULT_PER_HOUR = 6;
export const MAX_ORDER_MODE = 2;
export const HOUR_MS = 60 * 60 * 1000;
// The header the asking room presents, and the one answer every refused contract gets: the side
// that asks is never told whether the link is missing, revoked, expired or facing the other way.
export const CHANNEL_HEADER = 'x-madre-enlace';
export const NO_SUCH_LINK = 'No such link.';
export const CROSSINGS = ['read', 'received'];
// What one room may tell another about a link, by the channel: that it was signed or revoked.
// Each lands in the other room's ledger as a line, never as a message (phase 3c).
export const NOTICES = ['enlace.signed', 'enlace.revoked'];
export const DAY_MS = 24 * HOUR_MS;

const OWNER_ONLY = 0o600;
const OWNER_DIR = 0o700;
const KEY_HEX = /^[0-9a-f]{64}$/;
const ID = /^[0-9a-f]{12}-[0-9a-f]{6}$/;
// A room id is a folder name under ~/.pulse/rooms: never a path.
const ROOM = /^[^/\\\0]{1,200}$/;

const fail = (why, code = null) => { throw Object.assign(new Error(why), code ? { code } : {}); };
const pairHash = (a, b) => createHash('sha256').update([String(a), String(b)].sort().join('\n')).digest('hex').slice(0, 12);
const asDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };

// Stable for the pair of rooms, plus a short nonce so the same two rooms can sign again after a
// revocation and the old id never comes back to life.
export function contractId({ a, b }, { nonce = randomBytes(3).toString('hex') } = {}) {
  return `${pairHash(a, b)}-${nonce}`;
}

function isoOrNull(value, field) {
  if (value === null || value === undefined || value === '') return null;
  const date = typeof value === 'string' || value instanceof Date || typeof value === 'number' ? asDate(value) : null;
  if (!date) fail(`${field} is not a date.`);
  return date.toISOString();
}

// The rooms that hand their notes over under a contract: the arrow's tail, or both ends.
export const servingRooms = (contract) => (contract.direction === 'both' ? [contract.rooms.a, contract.rooms.b] : contract.direction === 'a→b' ? [contract.rooms.a] : [contract.rooms.b]);

// The room BISHOP's orders may reach under a contract: the end that is not the room of Salas.
// `null` when the contract allows no orders, or when neither end is that room.
export function receivesOrders(contract, salas) {
  if (!contract?.orders?.allowed || !salas) return null;
  const { a, b } = contract.rooms;
  return a === salas ? b : b === salas ? a : null;
}

// The contract, whole and checked, or the reason it is not one. The shape is §4B of the encargo:
// two rooms, a direction, the kinds that may cross, the zones (fixed: what travels into a turn),
// an expiry, a revocation, the ceiling for BISHOP's orders, and the human's signature.
//
// With `salas` (the id of the room of Salas, src/salas.mjs) two more rules hold: that room never
// serves — BISHOP gathers every room and is nobody's source (§4C.7) — and orders are allowed only
// on a link with that room at one end, which is then the end that gives them.
export function normalizeContract(raw, { now = new Date(), salas = null } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('A link is an object.');
  const rooms = raw.rooms && typeof raw.rooms === 'object' ? raw.rooms : {};
  const a = typeof rooms.a === 'string' ? rooms.a.trim() : '';
  const b = typeof rooms.b === 'string' ? rooms.b.trim() : '';
  if (!ROOM.test(a) || !ROOM.test(b)) fail('A link names two rooms, a and b.');
  if (a === b) fail('A room cannot be linked to itself.');

  const id = raw.id === undefined || raw.id === null ? contractId({ a, b }) : String(raw.id);
  if (!ID.test(id)) fail('That is not a link id.');
  if (id.slice(0, 12) !== pairHash(a, b)) fail('The link id does not belong to these rooms.');

  const direction = String(raw.direction ?? '').replace('->', '→');
  if (!DIRECTIONS.includes(direction)) fail('The direction is a→b, b→a or both.');

  if (!Array.isArray(raw.kinds) || !raw.kinds.length) fail('A link names the kinds that may cross.');
  const kinds = [...new Set(raw.kinds.map(String))];
  for (const kind of kinds) {
    if (kind === 'aberration') fail('An aberration never crosses a link.');
    if (!LINK_KINDS.includes(kind)) fail(`"${kind}" is not a kind of memory.`);
  }
  kinds.sort((x, y) => LINK_KINDS.indexOf(x) - LINK_KINDS.indexOf(y));

  // Not configurable: a contract that names any other set of zones is refused rather than
  // trimmed, so nobody believes they signed something the room will not do.
  if (raw.zones !== undefined && raw.zones !== null) {
    const asked = Array.isArray(raw.zones) ? [...new Set(raw.zones.map(String))].sort() : null;
    if (!asked || asked.length !== LINK_ZONES.length || asked.some((zone) => !LINK_ZONES.includes(zone))) fail('The zones of a link are not configurable: only what travels into a turn crosses.');
  }

  const expires = isoOrNull(raw.expires, 'expires');
  const revoked = isoOrNull(raw.revoked, 'revoked');

  const orders = raw.orders && typeof raw.orders === 'object' ? raw.orders : {};
  const maxMode = orders.maxMode === undefined ? 1 : Number(orders.maxMode);
  if (!Number.isInteger(maxMode) || maxMode < 0) fail('orders.maxMode is a mode, #0 to #2.');
  if (maxMode > MAX_ORDER_MODE) fail(`orders.maxMode never passes #${MAX_ORDER_MODE}: #3 and #4 are armed by the human, in that room.`);
  const perHour = orders.perHour === undefined ? DEFAULT_PER_HOUR : Number(orders.perHour);
  if (!Number.isInteger(perHour) || perHour < 1 || perHour > 1000) fail('orders.perHour is a whole number above zero.');
  const allowed = Boolean(orders.allowed);
  if (salas) {
    const serves = direction === 'both' ? [a, b] : direction === 'a→b' ? [a] : [b];
    if (serves.includes(salas)) fail('The room of Salas never serves a link: BISHOP gathers every room and is nobody\'s source.');
    if (allowed && a !== salas && b !== salas) fail('Orders need the room of Salas at one end of the link.');
  }

  const signed = raw.signed && typeof raw.signed === 'object' ? raw.signed : {};
  if (signed.by !== undefined && signed.by !== 'you') fail('Only you sign a link.');
  const at = signed.at === undefined || signed.at === null ? new Date(now).toISOString() : isoOrNull(signed.at, 'signed.at');

  return {
    id,
    rooms: { a, b },
    direction,
    kinds,
    zones: [...LINK_ZONES],
    expires,
    revoked,
    orders: { allowed, maxMode, perHour },
    signed: { at, by: 'you' },
  };
}

// Revoked or expired is the same as never signed.
export const inForce = (contract, now = new Date()) => Boolean(contract) && contract.revoked === null && (contract.expires === null || Date.parse(contract.expires) > new Date(now).getTime());

// Every contract in force, read from the config every room shares. A malformed entry is skipped,
// never repaired: a link the room cannot read is a link that does not exist.
export function activeContracts(config, { now = new Date(), salas = null } = {}) {
  const raw = config?.enlaces;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const out = [];
  for (const [id, entry] of Object.entries(raw)) {
    let contract;
    try { contract = normalizeContract({ ...entry, id: entry?.id ?? id }, { now, salas }); } catch { continue; }
    if (contract.id === id && inForce(contract, now)) out.push(contract);
  }
  return out;
}

// The contracts that let `asking` read, each with the room it reads from. What a module, a tool
// and the asking side of the channel all need to know, said once.
export function readsFrom(contracts, asking, { now = new Date() } = {}) {
  const out = [];
  for (const contract of contracts) {
    for (const from of [contract.rooms.a, contract.rooms.b]) {
      if (from !== asking && mayServe({ contract, serving: from, asking, now }).ok) out.push({ contract, from });
    }
  }
  return out;
}

// May `serving` hand its notes to `asking` under this contract, now? The arrow says which way
// notes travel: `a→b` lets b read from a, so a serves and b asks.
export function mayServe({ contract, serving, asking, now = new Date() }) {
  if (!contract) return { ok: false, why: 'no-contract' };
  if (contract.revoked !== null) return { ok: false, why: 'revoked' };
  if (contract.expires !== null && Date.parse(contract.expires) <= new Date(now).getTime()) return { ok: false, why: 'expired' };
  const { a, b } = contract.rooms;
  const from = serving === a ? 'a' : serving === b ? 'b' : null;
  const to = asking === a ? 'a' : asking === b ? 'b' : null;
  if (!from || !to || from === to) return { ok: false, why: 'not-a-party' };
  if (contract.direction !== 'both' && contract.direction !== `${from}→${to}`) return { ok: false, why: 'direction' };
  return { ok: true };
}

// Signing writes one key under `enlaces`: `updateConfig` merges that level by key, so two rooms
// signing at once keep both contracts, as two modules saving at once keep both (S-007). Both
// rooms must be known on this Mac — asleep is fine; it is read when it wakes. `rooms` may be the
// ids, or the rooms as `knownRooms` lists them (with their names).
//
// A link that lets orders through is signed the way #3 is armed: the human types the designation
// of the room that will receive them — its name, whichever letters — or nothing is signed
// (§4B). The error carries `code: 'DESIGNATION'` so the route can answer 403 and not 422.
export async function signContract(stateRoot, raw, { now = new Date(), rooms = null, salas = null, designation = null } = {}) {
  const contract = normalizeContract(raw, { now, salas });
  if (contract.revoked !== null) fail('A link is not signed already revoked.');
  if (contract.expires !== null && Date.parse(contract.expires) <= new Date(now).getTime()) fail('That link would already have expired.');
  const known = new Map((rooms ?? await knownRooms(stateRoot)).map((room) => (typeof room === 'string' ? [room, { id: room, name: room }] : [room.id, room])));
  for (const id of [contract.rooms.a, contract.rooms.b]) if (!known.has(id)) fail(`MADRE does not know the room ${id} on this Mac.`, 'UNKNOWN_ROOM');
  const ordered = receivesOrders(contract, salas);
  if (ordered) {
    const name = String(known.get(ordered).name ?? ordered);
    if (typeof designation !== 'string' || designation.trim().toLowerCase() !== name.toLowerCase()) fail('UNABLE TO COMPUTE. UNABLE TO CLARIFY.', 'DESIGNATION');
  }
  await updateConfig(stateRoot, { enlaces: { [contract.id]: contract } });
  return contract;
}

// Revoking stamps the moment and keeps the contract: a link that was revoked is a fact of the
// record, and the id never comes back (a new signature gets a new nonce).
export async function revokeContract(stateRoot, id, { now = new Date() } = {}) {
  const current = (await loadConfig(stateRoot)).enlaces?.[id];
  if (!current || typeof current !== 'object') return null;
  const revoked = { ...current, id, revoked: current.revoked ?? new Date(now).toISOString() };
  await updateConfig(stateRoot, { enlaces: { [id]: revoked } });
  return revoked;
}

/* ---------- the key of the channel ---------- */

export const channelKeyFile = (stateRoot) => join(stateRoot, 'credentials', 'enlaces.json');

async function readKey(file) {
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  const key = parsed && typeof parsed === 'object' ? parsed.key : null;
  if (typeof key !== 'string' || !KEY_HEX.test(key)) fail('credentials/enlaces.json does not hold a key.');
  return key;
}

// The key is made the first time a room needs it: a whole file written beside the name and
// linked under it, which lands only if nothing is there yet — two rooms making it at once keep
// the one that landed first, and nobody ever reads half a key. Read from disk on every call, so
// every room on this Mac holds the same one.
export async function channelKey(stateRoot) {
  const file = channelKeyFile(stateRoot);
  try {
    return await readKey(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const dir = join(stateRoot, 'credentials');
  await mkdir(dir, { recursive: true, mode: OWNER_DIR });
  // An older credentials directory may predate this mode (src/vault.mjs does the same).
  await chmod(dir, OWNER_DIR).catch(() => {});
  const draft = `${file}.${process.pid}.${randomUUID()}.tmp`;
  const content = `${JSON.stringify({ key: randomBytes(32).toString('hex') })}\n`;
  await writeFile(draft, content, { mode: OWNER_ONLY });
  try {
    await link(draft, file);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      // A filesystem without hard links: the bridge's way (src/bridge/devices.mjs), one write
      // that lands only if nothing is there yet.
      try { await writeFile(file, content, { mode: OWNER_ONLY, flag: 'wx' }); } catch (again) { if (again.code !== 'EEXIST') throw again; }
    }
  } finally {
    await rm(draft, { force: true });
  }
  await chmod(file, OWNER_ONLY).catch(() => {});
  return readKey(file);
}

// Constant time, and never a throw on a header that is not a string.
export function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// What the ledger, a card or a report may know of the key: that it is there, its name, its
// length. Never the value.
export async function channelKeySummary(stateRoot) {
  try {
    const key = await readKey(channelKeyFile(stateRoot));
    return { name: 'enlaces.json', bytes: key.length };
  } catch {
    return null;
  }
}

/* ---------- the side that asks ---------- */

// Asks another room for notes under a contract. The call goes from this process to that one, on
// this Mac: no `Origin` (a page did not make it), no `x-madre-device` (a phone did not), the key
// in its header. What comes back is one of four things: the notes; `outdated` (that room runs a
// MADRE without the route); `refused` with the reason the serving room gave (no such link, no
// key, sealed, over its hourly limit); or `unreachable`. A received batch is recorded through
// `record` when the caller hands one in, and counted beside the room's record when it hands in
// the room's folder.
export async function askEnlace({ port, contract, asking, q = '', kinds = null, limit = MAX_LIMIT, key, fetchImpl = globalThis.fetch, timeoutMs = 4000, record = null, roomDir = null, turn = null, now = new Date() }) {
  const id = typeof contract === 'string' ? contract : contract?.id;
  if (!id || !asking) return { refused: NO_SUCH_LINK, status: 404 };
  const params = new URLSearchParams({ contract: id, asking, limit: String(Math.min(MAX_LIMIT, Math.max(1, Math.trunc(Number(limit)) || MAX_LIMIT))) });
  if (q) params.set('q', String(q));
  // Fewer kinds than the contract names, never more: the serving room intersects again.
  if (Array.isArray(kinds) && kinds.length) params.set('kinds', kinds.map(String).join(','));
  let response;
  try {
    response = await fetchImpl(`http://127.0.0.1:${port}/api/enlace/memories?${params}`, {
      method: 'GET',
      headers: { [CHANNEL_HEADER]: typeof key === 'string' ? key : '' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { unreachable: true };
  }
  const answer = await response.json().catch(() => ({}));
  if (response.status === 404) return answer?.error === NO_SUCH_LINK ? { refused: NO_SUCH_LINK, status: 404 } : { outdated: true };
  if (!response.ok) return { refused: typeof answer?.error === 'string' ? answer.error : `HTTP ${response.status}`, status: response.status };
  const notes = Array.isArray(answer?.notes) ? answer.notes : [];
  const from = typeof answer?.from === 'string' ? answer.from : null;
  if (record) await record('enlace.received', { contract: id, from, count: notes.length, turn });
  if (roomDir) await noteCrossing(roomDir, { kind: 'received', contract: id, other: from, count: notes.length, now });
  return { contract: id, from, notes };
}

// Tells another room, by the channel, that a link of its was signed or revoked. The same call as
// `askEnlace` makes, the other way: no `Origin`, no device, the key in its header, a short wait.
// What comes back is `{ ok }`, `{ outdated }` (that room runs a MADRE without the route),
// `{ refused, status }` or `{ unreachable }`; the caller never lets any of them stop a signature.
export async function noticeEnlace({ port, type, payload, key, fetchImpl = globalThis.fetch, timeoutMs = 3000 }) {
  if (!NOTICES.includes(type)) fail(`A notice is one of ${NOTICES.join(', ')}.`);
  let response;
  try {
    response = await fetchImpl(`http://127.0.0.1:${port}/api/enlace/notice`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', [CHANNEL_HEADER]: typeof key === 'string' ? key : '' },
      body: JSON.stringify({ type, payload }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { unreachable: true };
  }
  if (response.status === 404) return { outdated: true };
  if (!response.ok) {
    const answer = await response.json().catch(() => ({}));
    return { refused: typeof answer?.error === 'string' ? answer.error : `HTTP ${response.status}`, status: response.status };
  }
  return { ok: true };
}

/* ---------- the counters ---------- */

// One line per crossing beside the room's record, so the traffic of a link is counted without
// opening every ledger on every refresh: `{ at, kind: 'read' | 'received', contract, other, count }`.
export const crossingsFile = (roomDir) => join(roomDir, 'enlaces.jsonl');

export async function noteCrossing(roomDir, { kind, contract, other = null, count = 0, now = new Date() }) {
  if (!CROSSINGS.includes(kind)) fail(`A crossing is one of ${CROSSINGS.join(', ')}.`);
  const id = typeof contract === 'string' ? contract : contract?.id;
  if (!id) fail('A crossing names its contract.');
  await mkdir(roomDir, { recursive: true });
  const line = { at: new Date(now).toISOString(), kind, contract: id, other, count: Number.isInteger(count) ? count : 0 };
  await appendFile(crossingsFile(roomDir), `${JSON.stringify(line)}\n`);
  return line;
}

// The lines of one contract and one kind beside a room's record, oldest first. A torn line is
// skipped, never fatal; no file is no crossing.
async function crossings(roomDir, contract, kind) {
  const id = typeof contract === 'string' ? contract : contract?.id;
  let raw = '';
  try { raw = await readFile(crossingsFile(roomDir), 'utf8'); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const out = [];
  for (const text of raw.split('\n')) {
    if (!text) continue;
    let line;
    try { line = JSON.parse(text); } catch { continue; }
    if (line?.contract === id && line.kind === kind && Number.isFinite(Date.parse(line.at))) out.push(line);
  }
  return out;
}

// How many crossings of that kind this contract had in the window: lines, not notes, because the
// ceiling is on readings.
export async function countRecent(roomDir, contract, kind, { sinceMs = HOUR_MS, now = new Date() } = {}) {
  const floor = new Date(now).getTime() - sinceMs;
  return (await crossings(roomDir, contract, kind)).filter((line) => Date.parse(line.at) >= floor).length;
}

// What Salas shows of a link's traffic: the readings the serving room (or rooms, on a link that
// goes both ways) handed over in the last day and the last hour, and when the latest was. Summed
// across the folders given, with `countRecent`; `lastAt` is the newest line or `null`.
export async function linkTraffic(roomDirs, contract, { now = new Date() } = {}) {
  const traffic = { reads24h: 0, reads1h: 0, lastAt: null };
  for (const roomDir of roomDirs) {
    traffic.reads24h += await countRecent(roomDir, contract, 'read', { sinceMs: DAY_MS, now });
    traffic.reads1h += await countRecent(roomDir, contract, 'read', { sinceMs: HOUR_MS, now });
    for (const line of await crossings(roomDir, contract, 'read')) {
      if (traffic.lastAt === null || Date.parse(line.at) > Date.parse(traffic.lastAt)) traffic.lastAt = line.at;
    }
  }
  return traffic;
}
