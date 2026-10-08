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

const OWNER_ONLY = 0o600;
const OWNER_DIR = 0o700;
const KEY_HEX = /^[0-9a-f]{64}$/;
const ID = /^[0-9a-f]{12}-[0-9a-f]{6}$/;
// A room id is a folder name under ~/.pulse/rooms: never a path.
const ROOM = /^[^/\\\0]{1,200}$/;

const fail = (why) => { throw new Error(why); };
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

// The contract, whole and checked, or the reason it is not one. The shape is §4B of the encargo:
// two rooms, a direction, the kinds that may cross, the zones (fixed: what travels into a turn),
// an expiry, a revocation, the ceiling for BISHOP's orders, and the human's signature.
export function normalizeContract(raw, { now = new Date() } = {}) {
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
    orders: { allowed: Boolean(orders.allowed), maxMode, perHour },
    signed: { at, by: 'you' },
  };
}

// Revoked or expired is the same as never signed.
export const inForce = (contract, now = new Date()) => Boolean(contract) && contract.revoked === null && (contract.expires === null || Date.parse(contract.expires) > new Date(now).getTime());

// Every contract in force, read from the config every room shares. A malformed entry is skipped,
// never repaired: a link the room cannot read is a link that does not exist.
export function activeContracts(config, { now = new Date() } = {}) {
  const raw = config?.enlaces;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const out = [];
  for (const [id, entry] of Object.entries(raw)) {
    let contract;
    try { contract = normalizeContract({ ...entry, id: entry?.id ?? id }, { now }); } catch { continue; }
    if (contract.id === id && inForce(contract, now)) out.push(contract);
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
// rooms must be known on this Mac — asleep is fine; it is read when it wakes.
export async function signContract(stateRoot, raw, { now = new Date(), rooms = null } = {}) {
  const contract = normalizeContract(raw, { now });
  if (contract.revoked !== null) fail('A link is not signed already revoked.');
  if (contract.expires !== null && Date.parse(contract.expires) <= new Date(now).getTime()) fail('That link would already have expired.');
  const known = rooms ?? (await knownRooms(stateRoot)).map((room) => room.id);
  for (const id of [contract.rooms.a, contract.rooms.b]) if (!known.includes(id)) fail(`MADRE does not know the room ${id} on this Mac.`);
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
export async function askEnlace({ port, contract, asking, q = '', limit = MAX_LIMIT, key, fetchImpl = globalThis.fetch, timeoutMs = 4000, record = null, roomDir = null, turn = null, now = new Date() }) {
  const id = typeof contract === 'string' ? contract : contract?.id;
  if (!id || !asking) return { refused: NO_SUCH_LINK, status: 404 };
  const params = new URLSearchParams({ contract: id, asking, limit: String(Math.min(MAX_LIMIT, Math.max(1, Math.trunc(Number(limit)) || MAX_LIMIT))) });
  if (q) params.set('q', String(q));
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

// How many crossings of that kind this contract had in the window: lines, not notes, because the
// ceiling is on readings.
export async function countRecent(roomDir, contract, kind, { sinceMs = HOUR_MS, now = new Date() } = {}) {
  const id = typeof contract === 'string' ? contract : contract?.id;
  const floor = new Date(now).getTime() - sinceMs;
  let raw = '';
  try { raw = await readFile(crossingsFile(roomDir), 'utf8'); } catch (error) { if (error.code === 'ENOENT') return 0; throw error; }
  let n = 0;
  for (const text of raw.split('\n')) {
    if (!text) continue;
    let line;
    try { line = JSON.parse(text); } catch { continue; }
    if (line?.contract === id && line.kind === kind && Date.parse(line.at) >= floor) n += 1;
  }
  return n;
}
