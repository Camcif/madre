// BISHOP's plans, without the room around them (docs/MACROVERSO.md, fases 4b y 4c): the block a
// reply ends with, what each of its lines means on this Mac, and the record the buttons act on.
// Nothing here sends, signs or starts anything; src/modules/bishop.mjs does, after a human press
// or within the mode the human chose.
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LINK_KINDS, MAX_ORDER_MODE, receivesOrders, servingRooms } from '../enlaces.mjs';
import { salasRoomId } from '../salas.mjs';

export const MAX_ORDERS = 4;
export const MAX_LINKS = 2;
export const RESULT_CHARS = 1200;
export const ORDER_CHARS = 2000;
export const PLAN_FENCE = 'pulse-salas';
export const BISHOP_MODES = ['manual', 'hybrid', 'auto'];
const KEEP_PLANS = 40;
export const clean = (value, max = 60) => String(value ?? '').replace(/[\r\n\t<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/* ---------- the headers a relayed message carries ---------- */

// What a turn reads first when BISHOP's channel brings it a message. English, like everything a
// turn reads, and with no word of @madre's list of actions (src/adapters/madre.mjs, ACTION_EN):
// «order» or «delegate» made @madre answer every order with its fixed refusal (S-031).
export const orderHeader = ({ step, total, plan }) => `BISHOP › ${step}/${total} · plan ${plan} · from Salas, sent by the human. Answer in this room only; this turn cannot pass anything on to other rooms.`;
export const consultHeader = ({ room }) => `BISHOP › question from room ${clean(room, 60)}, asked by the human there. Answer from what you know of the linked rooms; this turn ends with the answer.`;
export const ORDER_HEADER = /^BISHOP › (\d+)\/(\d+) · plan (p-[0-9a-f]{6})\b/;
export const CONSULT_HEADER = /^BISHOP › question from room (.+?), asked by the human there\./;

/* ---------- the block ---------- */

// One order: `@<room>/<agent> #<0-4>: what to do`. The room is its name (it may have spaces) or
// its id; the agent is a crew id. The mode is a single digit and #3/#4 parse, to be refused later.
const ORDER_LINE = /^\s*[-*]?\s*@(.+?)\/([a-z][a-z0-9_-]*)\s*#(\d)\s*[:：]\s*(.+)$/i;
// One link: `enlace <room> → <room>: decision, fact; 30 días; órdenes #1`. The arrow says which way
// notes travel (the first room hands over, the second reads); ↔ is both ways.
const LINK_LINE = /^\s*[-*]?\s*(?:enlace|link)\s*:?\s+@?(.+?)\s*(↔|<->|→|->)\s*@?(.+?)\s*[:：]\s*(.+)$/i;
const KIND_WORDS = new Map([
  ['decision', 'decision'], ['decisions', 'decision'], ['decisión', 'decision'], ['decision', 'decision'], ['decisiones', 'decision'],
  ['fact', 'fact'], ['facts', 'fact'], ['hecho', 'fact'], ['hechos', 'fact'],
  ['preference', 'preference'], ['preferences', 'preference'], ['preferencia', 'preference'], ['preferencias', 'preference'],
  ['question', 'question'], ['questions', 'question'], ['pregunta', 'question'], ['preguntas', 'question'],
]);
const isLine = (line) => ORDER_LINE.test(line) || LINK_LINE.test(line);

function linkTerms(rest) {
  const [first, ...others] = String(rest).split(/[;·|]/).map((part) => part.trim()).filter(Boolean);
  const words = String(first ?? '').toLowerCase().split(/\s*,\s*|\s+y\s+|\s+and\s+/).map((word) => word.trim()).filter(Boolean);
  const kinds = [...new Set(words.map((word) => KIND_WORDS.get(word)).filter(Boolean))];
  const unknown = words.filter((word) => !KIND_WORDS.has(word));
  let days = null;
  let orders = null;
  for (const part of others) {
    const span = part.match(/(\d{1,3})\s*(?:d|días|dias|day|days)\b/i);
    if (span) days = Number(span[1]);
    const ceiling = part.match(/(?:órdenes|ordenes|orders?)\s*(?:hasta|up to)?\s*#?\s*([0-4])/i);
    if (ceiling) orders = Number(ceiling[1]);
  }
  return { kinds, unknown, days, orders };
}

// The last ```pulse-salas block of a reply, read the way the room reads ```pulse: the reason on the
// first line, then up to 4 orders and up to 2 links, and nothing after the block. `null` when the
// reply has no such block; otherwise `{ reason, orders, links, ignored }`, where `ignored` says why
// each line (or the whole block) was not taken.
export function parsePlan(text) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
  // Fences as the page reads them (renderMarkdown): a fence opens with an optional language and
  // only a bare ``` closes it.
  const blocks = [];
  let open = null;
  for (let index = 0; index < lines.length; index += 1) {
    if (open === null) {
      const fence = lines[index].match(/^\s*```\s*([\w+-]*)\s*$/);
      if (fence) open = { start: index, lang: fence[1].toLowerCase() };
      continue;
    }
    if (/^\s*```\s*$/.test(lines[index])) { blocks.push({ ...open, end: index }); open = null; }
  }
  const none = (why) => ({ reason: '', orders: [], links: [], ignored: [{ line: '', why }] });
  if (open?.lang === PLAN_FENCE) return none('the block is not closed');
  const found = blocks.filter((block) => block.lang === PLAN_FENCE).at(-1);
  if (!found) return null;
  if (lines.slice(found.end + 1).join('\n').trim()) return none('text after the block');
  const body = lines.slice(found.start + 1, found.end).map((line) => line.trim()).filter(Boolean);
  const reason = body[0] && !isLine(body[0]) ? clean(body.shift(), 300) : '';
  if (!reason) return none('the first line says why');
  const orders = [];
  const links = [];
  const ignored = [];
  for (const line of body) {
    const link = line.match(LINK_LINE);
    if (link) {
      if (links.length >= MAX_LINKS) { ignored.push({ line: clean(line, 120), why: 'more than 2 links' }); continue; }
      const terms = linkTerms(link[4]);
      links.push({ from: clean(link[1], 80), to: clean(link[3], 80), both: link[2] === '↔' || link[2] === '<->', ...terms });
      continue;
    }
    const match = line.match(ORDER_LINE);
    if (!match) { ignored.push({ line: clean(line, 120), why: 'not an order line' }); continue; }
    const mode = Number(match[3]);
    if (mode > 4) { ignored.push({ line: clean(line, 120), why: 'no such mode' }); continue; }
    if (orders.length >= MAX_ORDERS) { ignored.push({ line: clean(line, 120), why: 'more than 4 orders' }); continue; }
    orders.push({ room: clean(match[1], 80), agent: match[2].toLowerCase(), mode, text: String(match[4]).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, ORDER_CHARS) });
  }
  return { reason, orders, links, ignored };
}

/* ---------- what each line means on this Mac ---------- */

// A room by its id, or by a name only one room on this Mac has.
function findRoom(rooms, wanted) {
  const byId = rooms.filter((room) => room.id === wanted);
  if (byId.length) return byId;
  const lower = String(wanted).toLowerCase();
  return rooms.filter((room) => String(room.name).toLowerCase() === lower);
}

// One parsed order, checked: the room, an agent of this crew, a contract in force that lets BISHOP
// give orders to it and up to which mode. An order that fails a check stays on the card with its
// reason and no button; #3 and #4 become a proposal for that room.
export function resolveOrder(order, step, { rooms, contracts, salas, agents }) {
  const crew = new Set((agents ?? []).filter((agent) => agent.detected).map((agent) => agent.id));
  const named = findRoom(rooms, order.room);
  const base = { step, room: named[0]?.id ?? null, name: named[0]?.name ?? order.room, agent: order.agent, mode: order.mode, text: order.text, contract: null, maxMode: null, asked: order.room };
  if (!named.length) return { ...base, status: 'blocked', why: 'MADRE does not know that room on this Mac.' };
  if (named.length > 1) return { ...base, room: null, status: 'blocked', why: 'Two rooms on this Mac have that name; use the room id.' };
  if (named[0].id === salas) return { ...base, status: 'blocked', why: 'BISHOP lives in this room; it gives orders to the others.' };
  if (!crew.has(order.agent)) return { ...base, status: 'blocked', why: 'No such agent on this Mac.' };
  const contract = contracts.find((one) => receivesOrders(one, salas) === named[0].id) ?? null;
  if (!contract) return { ...base, status: 'blocked', why: 'No signed link lets BISHOP give orders to that room.' };
  const maxMode = Math.min(contract.orders.maxMode, MAX_ORDER_MODE);
  if (order.mode >= 3) return { ...base, contract: contract.id, maxMode, status: 'proposal', why: '#3 and #4 never travel: arm it yourself in that room.' };
  if (order.mode > maxMode) return { ...base, contract: contract.id, maxMode, status: 'blocked', why: 'That link allows orders up to #{n}.', whyArgs: { n: maxMode } };
  return { ...base, contract: contract.id, maxMode, status: 'ready', why: null };
}
export const resolveOrders = ({ orders, ...where }) => orders.map((order, index) => resolveOrder(order, index + 1, where));

// One proposed link, checked the way the sheet of Salas and `normalizeContract` would: two rooms
// this Mac knows, the room of Salas never handing over, kinds that may cross, orders only with
// Salas at one end. A link already in force says so. Signing it is the human's press.
export function resolveLinks({ links, rooms, contracts, salas }) {
  return links.map((link, index) => {
    const from = findRoom(rooms, link.from);
    const to = findRoom(rooms, link.to);
    const base = { index, from: from[0]?.id ?? null, fromName: from[0]?.name ?? link.from, to: to[0]?.id ?? null, toName: to[0]?.name ?? link.to, direction: link.both ? 'both' : 'a→b', kinds: link.kinds, days: link.days, orders: null, receives: null };
    if (from.length !== 1 || to.length !== 1) return { ...base, status: 'blocked', why: from.length > 1 || to.length > 1 ? 'Two rooms on this Mac have that name; use the room id.' : 'MADRE does not know that room on this Mac.' };
    if (base.from === base.to) return { ...base, status: 'blocked', why: 'A room cannot be linked to itself.' };
    if (base.from === salas || (link.both && base.to === salas)) return { ...base, status: 'blocked', why: 'The room of Salas never hands its notes over.' };
    if (!link.kinds.length || link.unknown.length) return { ...base, status: 'blocked', why: 'Name what crosses: decision, fact, preference or question.' };
    if (!link.kinds.every((kind) => LINK_KINDS.includes(kind))) return { ...base, status: 'blocked', why: 'Name what crosses: decision, fact, preference or question.' };
    let orders = null;
    if (link.orders !== null) {
      if (base.from !== salas && base.to !== salas) return { ...base, status: 'blocked', why: 'Orders go only on a link with the room of Salas.' };
      orders = { allowed: true, maxMode: Math.min(link.orders, MAX_ORDER_MODE), perHour: 6 };
    }
    const receives = orders ? (base.from === salas ? base.to : base.from) : null;
    const same = contracts.find((one) => [one.rooms.a, one.rooms.b].sort().join() === [base.from, base.to].sort().join()
      && (link.both ? one.direction === 'both' : servingRooms(one).includes(base.from)));
    if (same) return { ...base, orders, receives, status: 'exists', why: 'That link is already in force.', contract: same.id };
    return { ...base, orders, receives, status: 'ready', why: null };
  });
}

/* ---------- the plans, kept beside the room of Salas ---------- */

// What the buttons act on is read from here, never from the page: the page names a plan and a step.
const plansFile = (stateRoot) => join(stateRoot, 'rooms', salasRoomId(stateRoot), 'bishop-plans.json');
const writes = new Map();
async function readPlans(stateRoot) {
  try { const data = JSON.parse(await readFile(plansFile(stateRoot), 'utf8')); return data && typeof data.plans === 'object' ? data : { plans: {} }; } catch { return { plans: {} }; }
}
// One change at a time per file, written whole and renamed into place.
export function changePlans(stateRoot, change) {
  const file = plansFile(stateRoot);
  const run = (writes.get(file) ?? Promise.resolve()).then(async () => {
    const data = await readPlans(stateRoot);
    const result = await change(data);
    const kept = Object.values(data.plans).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, KEEP_PLANS);
    data.plans = Object.fromEntries(kept.map((plan) => [plan.id, plan]));
    await mkdir(join(file, '..'), { recursive: true });
    const temp = `${file}.${process.pid}.${randomBytes(3).toString('hex')}.tmp`;
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    await rename(temp, file);
    return result;
  });
  writes.set(file, run.catch(() => null));
  return run;
}
export const planById = async (stateRoot, id) => (await readPlans(stateRoot)).plans[id] ?? null;
export const newPlanId = () => `p-${randomBytes(3).toString('hex')}`;

// A plan closes once, when no order is still waiting for a press or an answer and at least one
// was answered, failed or skipped. The close is a line; it never opens another plan.
const OPEN_STATES = new Set(['ready', 'sending', 'sent']);
export function closing(plan) {
  if (plan.closed || plan.orders.some((order) => OPEN_STATES.has(order.status))) return null;
  if (!plan.orders.some((order) => ['done', 'failed', 'skipped'].includes(order.status))) return null;
  plan.closed = true;
  const count = (...statuses) => plan.orders.filter((order) => statuses.includes(order.status)).length;
  return { plan: plan.id, done: count('done'), failed: count('failed'), skipped: count('skipped'), blocked: count('blocked', 'proposal', 'delivered') };
}
export const publicOrder = ({ step, room, name, agent, mode, text, contract, maxMode, status, why, whyArgs }) => ({ step, room, name, agent, mode, text, contract, maxMode, status, why, ...(whyArgs ? { whyArgs } : {}) });
export const publicLink = ({ index, from, fromName, to, toName, direction, kinds, days, orders, receives, status, why, contract }) => ({ index, from, fromName, to, toName, direction, kinds, days, orders, receives, status, why, ...(contract ? { contract } : {}) });
