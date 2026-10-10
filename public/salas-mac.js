// SALAS on the Mac: every room this Mac knows, open or asleep, in one place (docs/MACROVERSO.md,
// phase 1). The room that serves this page answers for all of them (src/salas.mjs): it lists
// them, opens one that is asleep, asks one to close, and stops every agent in every room. A room
// opens at its own address; holding ⌘ opens it beside this one.
//
// The phone has its own SALAS (salas.js), served by the bridge; the two read the same rooms.

import { setLanguage, t } from './i18n.js';
import { brandOf } from './brands.js';

const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const ui = {
  title: $('sm-title'), sub: $('sm-sub'), back: $('sm-back'), stop: $('sm-stop'), macro: $('sm-macro'), empty: $('sm-empty'), foot: $('sm-foot'),
  open: $('sm-open'), openGroup: $('sm-open-group'), openTitle: $('sm-open-title'),
  asleep: $('sm-asleep'), asleepGroup: $('sm-asleep-group'), asleepTitle: $('sm-asleep-title'), asleepNote: $('sm-asleep-note'),
  linksGroup: $('sm-links-group'), linksTitle: $('sm-links-title'), linksNote: $('sm-links-note'), links: $('sm-links'), link: $('sm-link'),
  add: $('sm-add'), bishop: $('sm-bishop'),
};
let language = 'es';
let timer = 0;
let arming = 0;
let data = null;
let macro = null;              // the macroverse, while it is open
let welcomed = false;          // the first-run wizard was offered this visit
// What each card is in the middle of, kept across the refreshes that redraw it.
const busy = new Map();       // room id → 'starting' | 'closing'
const asking = new Set();      // room ids whose card asks before closing
const failed = new Map();      // room id → what went wrong, said on its card
const revoking = new Set();    // link ids whose row asks before revoking

// The room's looks, from this browser: the same keys the room's own page keeps.
(() => {
  let theme = 'auto';
  let accent = null;
  try { theme = localStorage.getItem('pulse.theme') ?? 'auto'; accent = localStorage.getItem('pulse.accent'); } catch { /* no storage */ }
  const light = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  root.dataset.scheme = theme === 'auto' ? (light ? 'light' : 'dark') : theme;
  if (accent && accent !== 'madre') root.dataset.accent = accent;
})();

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};

// The same small words as the phone's SALAS (salas.js).
const chatName = (title) => (title === 'First conversation' ? t('First conversation') : title === 'Untitled' ? t('Untitled') : title);
function ago(iso) {
  const at = Date.parse(iso ?? '');
  if (!Number.isFinite(at)) return '';
  const seconds = (at - Date.now()) / 1000;
  const away = Math.abs(seconds);
  const words = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'short' });
  if (away < 60) return t('now');
  if (away < 3600) return words.format(Math.round(seconds / 60), 'minute');
  if (away < 86400) return words.format(Math.round(seconds / 3600), 'hour');
  if (away < 604800) return words.format(Math.round(seconds / 86400), 'day');
  return new Date(at).toLocaleDateString(language, { day: 'numeric', month: 'short' });
}
const MODE_NAMES = ['GHOST', 'EXCHANGE', 'CREATE', 'CONTROL', 'AIRLOCK'];
function askLine(ask) {
  if (ask.kind === 'mode') return t('@{agent} asks for #{n} {label}', { agent: ask.agent, n: ask.mode, label: MODE_NAMES[ask.mode] ?? '' });
  if (ask.kind === 'run') return ask.text ? t('@{agent} wants to run {line}', { agent: ask.agent, line: ask.text }) : t('@{agent} wants to run a command', { agent: ask.agent });
  if (ask.kind === 'bishop') return t('BISHOP proposes #{n} to @{agent}: arm it with your key', { n: ask.mode, agent: ask.agent });
  if (ask.kind === 'plan') return ask.text ? t('BISHOP waits for your press: {reason}', { reason: ask.text }) : t('BISHOP waits for your press');
  return ask.text ? t('@{agent} asks you: {question}', { agent: ask.agent, question: ask.text }) : t('@{agent} asks you to choose', { agent: ask.agent });
}
// The folder, as a person writes it: the home folder is ~.
const homeWord = (path) => String(path ?? '').replace(/^\/(Users|home)\/[^/]+/, '~');

// The memory kinds, in the colours NOSTROMO gives them (styles.css, --mem-*).
const KINDS = ['decision', 'fact', 'preference', 'question', 'aberration'];
const KIND_WORDS = { decision: t('DECISION'), fact: t('FACT'), preference: t('PREFERENCE'), question: t('QUESTION'), aberration: t('ABERRATION') };

function memoryStrip(census) {
  const strip = el('div', 'sm-strip');
  const total = census?.memories ?? 0;
  strip.setAttribute('role', 'img');
  if (!total) { strip.classList.add('none'); strip.setAttribute('aria-label', t('No memories yet')); return strip; }
  const said = [];
  for (const kind of KINDS) {
    const count = census.kinds?.[kind] ?? 0;
    if (!count) continue;
    const part = el('i', `k-${kind}`);
    part.style.flexGrow = String(count);
    strip.append(part);
    said.push(`${count} ${KIND_WORDS[kind].toLowerCase()}`);
  }
  strip.setAttribute('aria-label', said.join(', '));
  strip.title = said.join(' · ');
  return strip;
}

function stateOf(room) {
  const glance = room.glance ?? {};
  if (!room.open) return { key: 'asleep', words: room.lastOpened ? t('Asleep · last open {when}', { when: ago(room.lastOpened) }) : t('Asleep') };
  if (glance.outdated) return { key: 'outdated', words: t('Update MADRE in this room to see it here.') };
  if (glance.unreachable) return { key: 'quiet', words: t('Not answering right now') };
  if (glance.waitingCount) return { key: 'waiting', words: t('Waiting for you · {n}', { n: glance.waitingCount }) };
  if (glance.working?.length) return { key: 'working', words: glance.working.length === 1 ? t('@{agent} is working', { agent: glance.working[0] }) : t('{n} agents working', { n: glance.working.length }) };
  return { key: 'calm', words: t('Calm') };
}

function button(className, words, onClick) {
  const node = el('button', className, words);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function card(room) {
  const glance = room.glance ?? {};
  const state = stateOf(room);
  const node = el('article', `sm-card is-${state.key}${room.here ? ' here' : ''}`);
  node.dataset.room = room.id;

  const head = el('header', 'sm-card-head');
  head.append(el('h3', null, room.name));
  if (room.here) head.append(el('span', 'sm-chip here', t('You are here')));
  else if (room.open) head.append(el('span', 'sm-chip port', `:${room.open.port}`));
  node.append(head);
  if (room.root) node.append(el('p', 'sm-path', homeWord(room.root)));

  const line = el('p', 'sm-state');
  line.append(el('i', 'dot'), document.createTextNode(state.words));
  node.append(line);

  if (glance.waiting?.length) {
    const box = el('div', 'sm-wait');
    box.append(el('span', null, askLine(glance.waiting[0])));
    node.append(box);
  }
  if (glance.chat && !glance.outdated) {
    const chat = el('div', 'sm-chat');
    chat.append(el('b', null, chatName(glance.chat.title)));
    if (glance.chat.preview) chat.append(el('span', null, glance.chat.preview));
    node.append(chat);
  }
  if (room.open && glance.census) {
    node.append(memoryStrip(glance.census));
    const counts = [t('{n} conversations', { n: glance.chats ?? 0 }), t('{n} memories', { n: glance.census.memories })];
    if (glance.census.memories) counts.push(t('{n} travel', { n: glance.census.travelling }));
    node.append(el('p', 'sm-counts', counts.join(' · ')));
  }

  const actions = el('div', 'sm-actions');
  const doing = busy.get(room.id);
  if (failed.has(room.id)) node.append(el('p', 'sm-error', failed.get(room.id)));
  if (doing === 'starting') actions.append(el('span', 'sm-doing', t('Waking…')));
  else if (doing === 'closing') actions.append(el('span', 'sm-doing', t('Closing…')));
  else if (asking.has(room.id)) {
    const why = room.here ? t('This page closes with it.') : glance.working?.length ? t('What is running stops.') : t('Nothing is running.');
    actions.append(el('span', 'sm-ask', why), button('sm-btn danger', t('Close it'), () => closeRoom(room)), button('sm-btn ghost', t('Cancel'), () => { asking.delete(room.id); draw(); }));
  } else if (room.open) {
    const go = el('a', 'sm-btn primary', room.here ? t('Back to the room') : t('Open'));
    go.href = room.here ? '/' : `http://127.0.0.1:${room.open.port}/`;
    actions.append(go);
    if (!glance.outdated) actions.append(button('sm-btn ghost', t('Close'), () => { failed.delete(room.id); asking.add(room.id); draw(); }));
  } else if (room.root) {
    actions.append(button('sm-btn primary', t('Open'), () => startRoom(room, { enter: true })));
  }
  node.append(actions);
  return node;
}

// Open first, by what needs the person: waiting, then working, then the rest, newest first.
const ORDER = { waiting: 0, working: 1, calm: 2, quiet: 3, outdated: 4 };
function draw() {
  if (!data) return;
  // BISHOP's own room is not a project: it is the lobby's, drawn as its own section above them.
  const projects = data.rooms.filter((room) => room.id !== data.salas);
  const open = projects.filter((room) => room.open)
    .sort((a, b) => (ORDER[stateOf(a).key] - ORDER[stateOf(b).key]) || (Date.parse(b.glance?.chat?.at ?? 0) - Date.parse(a.glance?.chat?.at ?? 0)));
  const asleep = projects.filter((room) => !room.open).sort((a, b) => Date.parse(b.lastOpened ?? b.added ?? 0) - Date.parse(a.lastOpened ?? a.added ?? 0));
  ui.sub.textContent = [data.mac ? t('On {mac}', { mac: data.mac }) : null, projects.length === 1 ? t('1 project') : t('{n} projects', { n: projects.length }), open.length ? t('{n} open', { n: open.length }) : null].filter(Boolean).join(' · ');
  drawBishop(data.rooms.find((room) => room.id === data.salas) ?? null);
  // The brand leads back to where this page came from; served by BISHOP's own room, it stays here.
  ui.back.href = data.here === data.salas ? '/salas' : '/';
  ui.openGroup.hidden = !open.length;
  ui.asleepGroup.hidden = !asleep.length;
  ui.open.replaceChildren(...open.map(card));
  ui.asleep.replaceChildren(...asleep.map(card));
  ui.empty.hidden = Boolean(open.length || asleep.length);
  if (!projects.length && !welcomed) { welcomed = true; openWizard(); }
  const working = open.some((room) => room.glance?.working?.length);
  ui.stop.hidden = !working;
  drawLinks();
  // The macroverse wants a large screen: on a small one SALAS is the whole of it.
  ui.macro.hidden = !data.rooms.length || window.innerWidth < 900;
  macro?.update(data.rooms, data.enlaces ?? []);
}

// LINKS (docs/MACROVERSO.md, phase 3c): the contracts between rooms, read from /api/salas, each
// one revocable here, and the sheet that signs a new one. A contract says which room reads which,
// what kinds cross and until when; what crosses is counted, never shown.
const roomName = (id) => data?.rooms.find((room) => room.id === id)?.name ?? id;
const kindsWords = (kinds) => (kinds ?? []).map((kind) => (KIND_WORDS[kind] ?? kind).toLowerCase()).join(', ');
// Who reads and who serves, from the contract's own words: `a→b` means the notes travel from a to b.
function endsOf(enlace) {
  const { a, b } = enlace.rooms;
  return enlace.direction === 'b→a' ? { source: b, reader: a } : { source: a, reader: b };
}
function linkRow(enlace) {
  const { source, reader } = endsOf(enlace);
  const node = el('article', `sm-link${revoking.has(enlace.id) ? ' revoking' : ''}`);
  node.dataset.link = enlace.id;
  node.append(el('p', 'who', enlace.direction === 'both' ? t('{a} and {b} read each other', { a: roomName(enlace.rooms.a), b: roomName(enlace.rooms.b) }) : t('{reader} reads from {source}', { reader: roomName(reader), source: roomName(source) })));
  const what = [kindsWords(enlace.kinds), enlace.expires ? t('until {date}', { date: new Date(enlace.expires).toLocaleDateString(language, { day: 'numeric', month: 'short' }) }) : t('no expiry')];
  if (enlace.orders?.allowed) what.push(t('orders up to #{n}', { n: enlace.orders.maxMode }));
  // D-S13: a link BISHOP signed on its own says so, so it is never mistaken for one you signed.
  if (enlace.signed?.by === 'bishop') what.push(t('signed by BISHOP'));
  node.append(el('p', 'what', what.join(' · ')));
  const traffic = enlace.traffic ?? {};
  // S-021: the last reading says who read, as the room that asked said it.
  const last = traffic.lastAt ? (traffic.lastAgent ? t('last by @{agent} of {room}, {when}', { agent: traffic.lastAgent, room: roomName(traffic.lastRoom), when: ago(traffic.lastAt) }) : t('last {when}', { when: ago(traffic.lastAt) })) : t('none yet');
  node.append(el('p', 'traffic', [t('{n} reads in 24 h', { n: traffic.reads24h ?? 0 }), last].join(' · ')));
  // Fase 3e: recall on every turn, ticked or cleared here by the human.
  const recall = el('label', 'row sm-recall');
  const recallBox = el('input'); recallBox.type = 'checkbox'; recallBox.checked = Boolean(enlace.recall);
  recallBox.addEventListener('change', async () => {
    recallBox.disabled = true;
    const answer = await fetch('/api/salas/enlaces/recall', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: enlace.id, recall: recallBox.checked }) })
      .then((response) => response.ok).catch(() => false);
    if (!answer) recallBox.checked = !recallBox.checked;
    recallBox.disabled = false;
    await refresh();
  });
  recall.append(recallBox, document.createTextNode(t('Recall on every turn (up to 3 notes)')));
  node.append(recall);
  const actions = el('div', 'sm-actions');
  if (revoking.has(enlace.id)) actions.append(el('span', 'sm-ask', t('Nothing crosses from then on.')), button('sm-btn danger', t('Revoke it'), () => revokeLink(enlace.id)), button('sm-btn ghost', t('Cancel'), () => { revoking.delete(enlace.id); draw(); }));
  else actions.append(button('sm-btn ghost', t('Revoke'), () => { revoking.add(enlace.id); draw(); }));
  node.append(actions);
  return node;
}
function drawLinks() {
  const enlaces = data.enlaces ?? [];
  const enough = data.rooms.length >= 2;
  ui.linksGroup.hidden = !enough && !enlaces.length;
  ui.link.hidden = !enough;
  ui.linksNote.textContent = t('A link lets one room read the distilled notes of another, read-only, by a contract you sign here. Nothing is written across, and only notes that travel into turns cross.');
  ui.links.replaceChildren(...enlaces.map(linkRow));
}
async function revokeLink(id) {
  revoking.delete(id);
  await fetch('/api/salas/enlaces/revoke', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => null);
  await refresh();
}

// The sheet that signs a link. Two rooms, who reads whom (or both), what crosses, until when;
// and, only when one of the two is the room of SALAS (the super agent's), whether orders may enter
// the other and up to which mode, which asks for that room's designation, as arming #3 does.
let sheet = null;
function openLinkSheet({ reader = null, source = null } = {}) {
  if (!data || sheet) return;
  const rooms = [...data.rooms].sort((x, y) => Number(Boolean(y.open)) - Number(Boolean(x.open)) || x.name.localeCompare(y.name));
  sheet = el('dialog', 'sm-sheet');
  const form = el('form');
  form.method = 'dialog';
  form.append(el('h3', null, t('Link two rooms')));
  const choose = (labelWords, chosen) => {
    const label = el('label', null, labelWords);
    const select = el('select');
    for (const room of rooms) { const option = el('option', null, room.name); option.value = room.id; if (room.id === chosen) option.selected = true; select.append(option); }
    label.append(select);
    return { label, select };
  };
  const readerPick = choose(t('The one that reads'), reader ?? rooms.find((room) => room.id !== source)?.id ?? null);
  const sourcePick = choose(t('The one that serves'), source ?? rooms.find((room) => room.id !== readerPick.select.value)?.id ?? null);
  const pair = el('div', 'pair');
  pair.append(readerPick.label, el('span', 'arrow', '←'), sourcePick.label);
  form.append(pair);
  const both = el('label', 'row');
  const bothBox = el('input'); bothBox.type = 'checkbox';
  both.append(bothBox, document.createTextNode(t('Both ways')));
  form.append(both);
  const kinds = el('label', null, t('What crosses'));
  const kindRow = el('div', 'row');
  const kindBoxes = [];
  for (const kind of KINDS) {
    if (kind === 'aberration') continue;
    const one = el('label', 'row');
    const box = el('input'); box.type = 'checkbox'; box.value = kind; box.checked = kind === 'decision' || kind === 'fact';
    one.append(box, document.createTextNode(KIND_WORDS[kind].toLowerCase()));
    kindRow.append(one);
    kindBoxes.push(box);
  }
  kinds.append(kindRow, el('p', 'hint', t('Only notes that travel into turns cross: hold and bridge, cleaned by the privacy guard of the room that serves. Never the ledger, files, med bay or jettisoned.')));
  form.append(kinds);
  const expires = el('label', null, t('Expires'));
  const expiresPick = el('select');
  for (const [value, words] of [['1', t('In a day')], ['7', t('In a week')], ['30', t('In 30 days')], ['', t('Never')]]) { const option = el('option', null, words); option.value = value; if (value === '30') option.selected = true; expiresPick.append(option); }
  expires.append(expiresPick);
  form.append(expires);
  // Fase 3e: off unless ticked. The room that reads gets, on every turn, up to 3 of these notes
  // without asking for them; each turn that does is one reading of the hourly limit.
  const recall = el('label', 'row');
  const recallBox = el('input'); recallBox.type = 'checkbox';
  recall.append(recallBox, document.createTextNode(t('Recall on every turn')));
  form.append(recall, el('p', 'hint', t('The room that reads gets up to 3 of these notes on every turn, without asking. Each such turn counts as one reading of the hourly limit. Off, its agents read only when they choose to.')));
  // Orders: only with the room of SALAS on one side, and never automatic above #2.
  const orders = el('div', 'orders');
  const allow = el('label', 'row');
  const allowBox = el('input'); allowBox.type = 'checkbox';
  const allowWords = document.createTextNode('');
  allow.append(allowBox, allowWords);
  const ceiling = el('label', 'row');
  const modePick = el('select');
  for (const n of [1, 2]) { const option = el('option', null, `#${n} ${MODE_NAMES[n]}`); option.value = String(n); if (n === 1) option.selected = true; modePick.append(option); }
  const perHourPick = el('select');
  for (const n of [3, 6, 12]) { const option = el('option', null, String(n)); option.value = String(n); if (n === 6) option.selected = true; perHourPick.append(option); }
  ceiling.append(document.createTextNode(t('up to')), modePick, document.createTextNode(`· ${t('per hour')}`), perHourPick);
  const designation = el('label', null, '');
  const designationInput = el('input'); designationInput.type = 'text'; designationInput.autocomplete = 'off'; designationInput.spellcheck = false;
  designation.append(designationInput);
  orders.append(el('p', 'hint', t('Orders from the super agent')), allow, ceiling, designation);
  form.append(orders);
  const error = el('p', 'error');
  form.append(error);
  const actions = el('div', 'actions');
  const cancel = button('sm-btn ghost', t('Cancel'), () => sheet.close());
  const sign = el('button', 'sm-btn primary', t('Sign'));
  sign.type = 'submit';
  actions.append(cancel, sign);
  form.append(actions);
  sheet.append(form);
  document.body.append(sheet);

  // The orders block follows the pair: it is there only when one side is the room of SALAS, and
  // it names the other side, the one that would receive them.
  const target = () => {
    const ids = [readerPick.select.value, sourcePick.select.value];
    if (!data.salas || !ids.includes(data.salas)) return null;
    return ids.find((id) => id !== data.salas) ?? null;
  };
  const syncOrders = () => {
    const other = target();
    orders.hidden = !other;
    if (!other) { allowBox.checked = false; return; }
    allowWords.textContent = t('Allow orders into {room}', { room: roomName(other) });
    ceiling.hidden = !allowBox.checked;
    designation.hidden = !allowBox.checked;
    designation.firstChild.textContent = t('Type the designation of {room} to allow orders into it', { room: roomName(other) });
  };
  for (const control of [readerPick.select, sourcePick.select, allowBox]) control.addEventListener('change', syncOrders);
  syncOrders();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const readerId = readerPick.select.value, sourceId = sourcePick.select.value;
    if (readerId === sourceId) { error.textContent = t('Choose two different rooms.'); return; }
    const chosenKinds = kindBoxes.filter((box) => box.checked).map((box) => box.value);
    if (!chosenKinds.length) { error.textContent = t('Choose at least one kind.'); return; }
    const days = Number(expiresPick.value);
    const body = {
      a: sourceId, b: readerId, direction: bothBox.checked ? 'both' : 'a→b', kinds: chosenKinds,
      expires: days ? new Date(Date.now() + days * 86400000).toISOString() : null,
      orders: allowBox.checked && !orders.hidden ? { allowed: true, maxMode: Number(modePick.value), perHour: Number(perHourPick.value) } : { allowed: false, maxMode: 0, perHour: Number(perHourPick.value) },
      designation: allowBox.checked && !orders.hidden ? designationInput.value.trim() : undefined,
      recall: recallBox.checked,
    };
    sign.disabled = true;
    sign.textContent = t('Signing…');
    const answer = await fetch('/api/salas/enlaces', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
    sign.disabled = false;
    sign.textContent = t('Sign');
    if (!answer.ok) { error.textContent = answer.body.error ?? t('The link could not be signed.'); return; }
    sheet.close();
    await refresh();
  });
  sheet.addEventListener('close', () => { sheet.remove(); sheet = null; });
  sheet.showModal();
}
ui.link.addEventListener('click', () => openLinkSheet());

async function refresh() {
  const answer = await fetch('/api/salas', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer) { ui.foot.textContent = t('This room did not answer. It may have closed.'); return; }
  if (answer.language && answer.language !== language) { language = setLanguage(answer.language); root.lang = language; translateStatic(); }
  data = answer;
  ui.foot.textContent = t('Every project runs on this Mac, in a room of its own, with its own memory.');
  draw();
}

async function startRoom(room, { enter = false } = {}) {
  busy.set(room.id, 'starting');
  failed.delete(room.id);
  draw();
  const answer = await fetch('/api/salas/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room: room.id }) })
    .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
  busy.delete(room.id);
  if (!answer.ok) failed.set(room.id, answer.body.error ?? t('The room did not open.'));
  // Opened from its card, the person goes in: that is what «Open» means.
  else if (enter && answer.body.port) { location.href = `http://127.0.0.1:${answer.body.port}/`; return answer; }
  await refresh();
  return answer;
}

async function closeRoom(room) {
  asking.delete(room.id);
  busy.set(room.id, 'closing');
  failed.delete(room.id);
  draw();
  const answer = await fetch('/api/salas/close', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room: room.id }) })
    .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
  if (answer.body.here) {
    // This page goes with the room that serves it: it says so, and stops asking.
    clearInterval(timer);
    document.body.classList.add('sm-gone');
    ui.sub.textContent = t('This room closed. Open MADRE again to come back to the lobby.');
    ui.stop.hidden = true;
    for (const group of [ui.openGroup, ui.asleepGroup]) group.hidden = true;
    return;
  }
  if (!answer.ok) { busy.delete(room.id); failed.set(room.id, answer.body.error ?? t('That room did not answer.')); draw(); return; }
  // It closes in a moment; the card stays «closing» until the list says it is asleep.
  for (let wait = 0; wait < 20; wait += 1) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await refresh();
    if (!data?.rooms.find((one) => one.id === room.id)?.open) break;
  }
  busy.delete(room.id);
  draw();
}

// THE MACROVERSE (macroverso.js): the same rooms as universes, entered from here.
function macroWords() {
  return {
    title: t('Macroverse'),
    mac: (data?.mac ?? t('This Mac')).toUpperCase(),
    back: t('Back to the lobby'),
    hint: t('Drag the space to move it · wheel to come closer · click a universe to look at it · drag it to turn it · drag one onto another to link them · ← → from one to the next · Esc to come back'),
    recenter: t('RECENTER'),
    veins: (n) => t('{n} veins', { n }),
    links: t('Links'),
    link: t('Link…'),
    // One link as seen from one of its rooms.
    linkRow: (enlace, roomId) => {
      const other = roomName(enlace.rooms.a === roomId ? enlace.rooms.b : enlace.rooms.a);
      const kinds = kindsWords(enlace.kinds);
      if (enlace.direction === 'both') return t('both ways with {room}: {kinds}', { room: other, kinds });
      return endsOf(enlace).reader === roomId ? t('reads {kinds} from {room}', { kinds, room: other }) : t('{room} reads its {kinds}', { room: other, kinds });
    },
    sub: (rooms) => {
      const open = rooms.filter((room) => room.open);
      const memories = open.reduce((sum, room) => sum + (room.glance?.census?.memories ?? 0), 0);
      const waiting = open.filter((room) => room.glance?.waitingCount).length;
      return [t('{n} universes', { n: rooms.length }), waiting ? t('{n} waiting for you', { n: waiting }) : null, t('{n} memories', { n: memories })].filter(Boolean).join(' · ');
    },
    state: (room) => stateOf(room).words,
    path: homeWord,
    ask: askLine,
    kind: (kind) => KIND_WORDS[kind] ?? kind,
    counts: (room) => (room.open ? [t('{n} conversations', { n: room.glance?.chats ?? 0 }), t('{n} memories', { n: room.glance?.census?.memories ?? 0 })].join(' · ') : room.lastOpened ? t('Asleep · last open {when}', { when: ago(room.lastOpened) }) : t('Asleep')),
    enter: t('Enter the room'),
    backToRoom: t('Back to the room'),
    wake: t('Wake'),
    waking: t('Waking…'),
    all: t('All the universes'),
    close: t('Close'),
  };
}
// The macroverse is night in either theme, so it wears the accent as the night does: the hex the
// stylesheet gives that accent before the light scheme recolours it (S-014), read from the rule
// itself rather than from the page, which may be light.
function darkAccent() {
  const wanted = `[data-accent="${root.dataset.accent || 'madre'}"]`;
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (rule.selectorText !== wanted) continue;
        const hex = rule.style.getPropertyValue('--acc').trim();
        if (/^#[0-9a-f]{6}$/i.test(hex)) return hex;
      }
    }
  } catch { /* no sheets to read: the house accent */ }
  return '#9bff66';
}
ui.macro.addEventListener('click', async () => {
  if (macro || !data) return;
  const { openMacroverso } = await import('./macroverso.js');
  document.body.classList.add('sm-in-macro');
  macro = openMacroverso({
    host: document.body,
    rooms: data.rooms,
    here: data.here,
    enlaces: data.enlaces ?? [],
    accent: darkAccent(),
    words: macroWords(),
    actions: {
      wake: async (room) => { await startRoom(room); },
      // Dragged from one universe onto another: the notes of the first would travel to the second.
      link: (source, reader) => openLinkSheet({ source: source?.id ?? null, reader: reader?.id ?? null }),
      closed: () => { macro = null; document.body.classList.remove('sm-in-macro'); ui.macro.focus(); },
    },
  });
});
window.addEventListener('resize', () => { if (data) ui.macro.hidden = !data.rooms.length || window.innerWidth < 900; });

ui.stop.addEventListener('click', async () => {
  if (!arming) {
    ui.stop.classList.add('armed');
    ui.stop.querySelector('span').textContent = t('Touch again to stop all');
    arming = setTimeout(() => { arming = 0; ui.stop.classList.remove('armed'); ui.stop.querySelector('span').textContent = t('Stop all'); }, 3000);
    return;
  }
  clearTimeout(arming);
  arming = 0;
  ui.stop.classList.remove('armed');
  ui.stop.disabled = true;
  await fetch('/api/salas/stop-all', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).catch(() => null);
  ui.stop.disabled = false;
  ui.stop.querySelector('span').textContent = t('Stop all');
  await refresh();
});

// ---- THE LOBBY (2026-10-10). The first screen of MADRE: every project on this Mac, BISHOP above
// them, and the way to add more. A bare `madre` opens here; `madre start` in a folder still opens
// that project directly.

const post = (url, payload) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload ?? {}) })
  .then(async (response) => ({ ok: response.ok, status: response.status, body: await response.json().catch(() => ({})) }))
  .catch(() => ({ ok: false, status: 0, body: {} }));
const mark = (id, size = 40) => {
  const brand = brandOf(id);
  const node = el('span', 'sm-mark');
  node.style.setProperty('--b', brand.color);
  node.style.setProperty('--b-ink', brand.ink);
  node.style.width = node.style.height = `${size}px`;
  node.innerHTML = brand.mark(); // trusted: our own SVG strings from brands.js
  return node;
};

// BISHOP, as a section of the lobby: the super agent that reads across the projects, signs links
// between them and carries orders from one to another. It lives in a room of its own (MADRE's
// folder, not a project), so talking to it opens that room; asleep, it is woken first.
function drawBishop(room) {
  const box = ui.bishop;
  box.hidden = false;
  box.replaceChildren();
  const cardNode = el('article', 'sm-bishop-card');
  const head = el('header', 'sm-bishop-head');
  const words = el('div', 'sm-bishop-words');
  words.append(el('h2', null, 'BISHOP'), el('p', null, t('Your super agent. It reads across your projects, signs the links between them and carries an order from one to another.')));
  head.append(mark('bishop', 44), words);
  cardNode.append(head);
  const glance = room?.glance ?? {};
  const line = el('p', 'sm-state');
  line.append(el('i', 'dot'), document.createTextNode(room?.open ? stateOf(room).words : t('Asleep')));
  cardNode.append(line);
  cardNode.classList.add(`is-${room?.open ? stateOf(room).key : 'asleep'}`);
  if (glance.waiting?.length) { const wait = el('div', 'sm-wait'); wait.append(el('span', null, askLine(glance.waiting[0]))); cardNode.append(wait); }
  else if (glance.chat && !glance.outdated) { const chat = el('div', 'sm-chat'); chat.append(el('b', null, chatName(glance.chat.title))); if (glance.chat.preview) chat.append(el('span', null, glance.chat.preview)); cardNode.append(chat); }
  const actions = el('div', 'sm-actions');
  const id = data?.salas;
  if (busy.get(id) === 'starting') actions.append(el('span', 'sm-doing', t('Waking…')));
  else if (room?.open) {
    const go = el('a', 'sm-btn primary', t('Talk to BISHOP'));
    go.href = room.here ? '/' : `http://127.0.0.1:${room.open.port}/`;
    actions.append(go);
  } else {
    actions.append(button('sm-btn primary', t('Talk to BISHOP'), () => startRoom({ id }, { enter: true })));
  }
  if (failed.has(id)) cardNode.append(el('p', 'sm-error', failed.get(id)));
  cardNode.append(actions);
  box.append(cardNode);
}

// ---- Choosing folders. Suggestions first (folders that look like projects in the places people
// keep them), then the folders of the home folder, walked one level at a time. Several can be
// chosen; a folder already in the lobby says so and is not offered again.
function projectPicker({ onAdded, compact = false }) {
  const chosen = new Map();     // path → name
  const node = el('div', `sm-picker${compact ? ' compact' : ''}`);
  const found = el('section', 'sm-found');
  const browse = el('section', 'sm-browse');
  const footer = el('div', 'sm-picker-foot');
  const count = el('span', 'sm-picked');
  const addButton = button('sm-btn primary', t('Add'), () => void add());
  const error = el('p', 'error');
  footer.append(count, addButton);
  node.append(found, browse, error, footer);
  const sync = () => {
    count.textContent = chosen.size ? (chosen.size === 1 ? t('1 folder chosen') : t('{n} folders chosen', { n: chosen.size })) : t('Choose one or more folders');
    addButton.disabled = !chosen.size;
    addButton.textContent = chosen.size > 1 ? t('Add {n} projects', { n: chosen.size }) : t('Add project');
    for (const box of node.querySelectorAll('input[data-path]')) box.checked = chosen.has(box.dataset.path);
  };
  const row = ({ name, path, project = true, known = false }, { open = null } = {}) => {
    const item = el('label', `sm-folder${known ? ' known' : ''}`);
    const box = el('input');
    box.type = 'checkbox';
    box.dataset.path = path;
    box.disabled = known;
    box.checked = chosen.has(path);
    box.addEventListener('change', () => { if (box.checked) chosen.set(path, name); else chosen.delete(path); sync(); });
    const words = el('span', 'sm-folder-words');
    words.append(el('b', null, name), el('small', null, homeWord(path)));
    item.append(box, words);
    if (known) item.append(el('span', 'sm-tag', t('In the lobby')));
    else if (project) item.append(el('span', 'sm-tag is-project', t('Project')));
    if (open) {
      const into = button('sm-into', '›', (event) => { event.preventDefault(); open(); });
      into.setAttribute('aria-label', t('Open {name}', { name }));
      into.title = t('Open {name}', { name });
      item.append(into);
    }
    return item;
  };
  async function loadFound() {
    found.replaceChildren(el('h4', null, t('Found on this Mac')), el('p', 'hint', t('Looking…')));
    const answer = await fetch('/api/salas/suggestions', { cache: 'no-store' }).then((response) => response.json()).catch(() => ({ suggestions: [] }));
    const list = answer.suggestions ?? [];
    found.replaceChildren(el('h4', null, t('Found on this Mac')));
    if (!list.length) { found.append(el('p', 'hint', t('Nothing that looks like a project in the usual places. Look for it below.'))); return; }
    const rows = el('div', 'sm-folders');
    for (const one of list) rows.append(row(one));
    found.append(rows);
  }
  async function walk(path = null) {
    const answer = await fetch(`/api/salas/folders${path ? `?path=${encodeURIComponent(path)}` : ''}`, { cache: 'no-store' }).then((response) => response.json()).catch(() => null);
    browse.replaceChildren();
    const head = el('div', 'sm-browse-head');
    head.append(el('h4', null, t('Your folders')));
    if (answer?.parent) head.append(button('sm-btn ghost small', t('Up'), () => void walk(answer.parent)));
    browse.append(head);
    if (!answer?.entries) { browse.append(el('p', 'hint', answer?.error ?? t('That folder is not there.'))); return; }
    browse.append(el('p', 'sm-where', homeWord(answer.path)));
    const rows = el('div', 'sm-folders tall');
    if (answer.path !== answer.home) rows.append(row({ name: t('This folder'), path: answer.path, project: false, known: false }));
    for (const one of answer.entries) rows.append(row(one, { open: () => void walk(one.path) }));
    if (!answer.entries.length) rows.append(el('p', 'hint', t('No folders inside.')));
    browse.append(rows);
    sync();
  }
  async function add() {
    error.textContent = '';
    addButton.disabled = true;
    const answer = await post('/api/salas/projects', { roots: [...chosen.keys()] });
    addButton.disabled = false;
    if (!answer.ok) { error.textContent = answer.body.refused?.[0]?.error ?? answer.body.error ?? t('They could not be added.'); return; }
    if (answer.body.refused?.length) error.textContent = answer.body.refused.map((one) => `${homeWord(one.root)}: ${one.error}`).join(' · ');
    chosen.clear();
    sync();
    await refresh();
    onAdded?.(answer.body.added ?? []);
    void loadFound();
  }
  void loadFound();
  void walk();
  sync();
  return node;
}

// «Add a project», on its own: the picker in a sheet.
let addSheet = null;
function openAddSheet() {
  if (addSheet) return;
  addSheet = el('dialog', 'sm-sheet sm-wide');
  const inner = el('div', 'sm-sheet-body');
  const head = el('header', 'sm-sheet-head');
  head.append(el('h3', null, t('Add a project')), button('sm-x', '×', () => addSheet.close()));
  head.lastChild.setAttribute('aria-label', t('Close'));
  inner.append(head, el('p', 'hint', t('A project is a folder: MADRE opens a room for it, with its own conversations and its own memory. Adding it does not open it; you open it from its card.')));
  inner.append(projectPicker({ onAdded: () => addSheet?.close() }));
  addSheet.append(inner);
  document.body.append(addSheet);
  addSheet.addEventListener('close', () => { addSheet.remove(); addSheet = null; });
  addSheet.showModal();
}
ui.add.addEventListener('click', openAddSheet);

// ---- The first time: three steps. The agents (connected once, for every project: a CLI's session
// is this computer's, not a project's), the projects, and which to open now.
let wizard = null;
function openWizard() {
  if (wizard) return;
  wizard = el('dialog', 'sm-sheet sm-wide sm-wizard');
  const inner = el('div', 'sm-sheet-body');
  wizard.append(inner);
  document.body.append(wizard);
  let step = 0;
  let poll = 0;
  let stream = null;
  const lastLine = new Map();   // agent → what its install or sign-in said last
  const steps = [t('Agents'), t('Projects'), t('Open')];
  const stop = () => { clearInterval(poll); poll = 0; stream?.close(); stream = null; };
  const frame = (title, note, body, actions) => {
    stop();
    inner.replaceChildren();
    const head = el('header', 'sm-sheet-head');
    const dots = el('ol', 'sm-steps');
    steps.forEach((name, index) => { const item = el('li', index === step ? 'on' : index < step ? 'done' : null, name); dots.append(item); });
    head.append(dots, button('sm-x', '×', () => wizard.close()));
    head.lastChild.setAttribute('aria-label', t('Close'));
    inner.append(head, el('h3', null, title));
    if (note) inner.append(el('p', 'hint', note));
    inner.append(body, actions);
  };
  async function agentsStep() {
    const list = el('div', 'sm-agents');
    const actions = el('div', 'actions');
    const next = button('sm-btn primary', t('Continue'), () => { step = 1; projectsStep(); });
    actions.append(next);
    frame(t('Connect your agents'), t('MADRE works with the AI tools already on this computer. Each one is connected once, and every project uses it.'), list, actions);
    const paint = async () => {
      const answer = await fetch('/api/settings', { cache: 'no-store' }).then((response) => response.json()).catch(() => null);
      if (!answer?.agents) return;
      const sessions = answer.sessions ?? {};
      list.replaceChildren();
      let ready = 0;
      for (const agent of answer.agents.filter((one) => one.id !== 'madre')) {
        const session = sessions[agent.id]?.state;
        const busyNow = answer.loggingIn === agent.id;
        const ok = agent.ready && session !== 'signed-out';
        if (ok) ready += 1;
        const item = el('div', `sm-agent${ok ? ' ok' : ''}`);
        const words = el('span', 'sm-agent-words');
        words.append(el('b', null, agent.label ?? agent.id));
        const lamp = el('small', `session-lamp ${ok ? 'ok' : busyNow ? 'wait' : agent.detected ? 'bad' : 'wait'}`, ok ? t('Connected') : busyNow ? t('Signing in…') : agent.detected ? t('Not signed in') : t('Not installed'));
        words.append(lamp);
        if (lastLine.has(agent.id) && !ok) {
          const said = lastLine.get(agent.id);
          const line = el('small', 'sm-agent-line', said.line);
          if (said.url) { const link = el('a', null, t('Open the sign-in page')); link.href = said.url; link.target = '_blank'; link.rel = 'noopener'; line.append(' ', link); }
          words.append(line);
        }
        item.append(mark(agent.id, 34), words);
        if (!ok && !busyNow) {
          if (!agent.detected && agent.install) item.append(button('sm-btn ghost small', t('Install'), async (event) => { event.currentTarget.disabled = true; await post(`/api/agents/${agent.id}/install`); void paint(); }));
          else if (agent.detected && agent.login) item.append(button('sm-btn ghost small', t('Sign in'), async (event) => { event.currentTarget.disabled = true; await post(`/api/agents/${agent.id}/login`); void paint(); }));
        }
        list.append(item);
      }
      next.textContent = ready ? t('Continue') : t('Continue without agents');
    };
    await paint();
    poll = setInterval(() => { if (!document.hidden) void paint(); }, 2500);
    // What an install or a sign-in says as it goes, and the page it asks you to open.
    try {
      stream = new EventSource('/api/events');
      stream.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type === 'connection.login.output' || event.type === 'connection.install.output') lastLine.set(event.payload.agent, { line: event.payload.line, url: event.payload.url ?? null });
          if (/^connection\./.test(event.type)) void paint();
        } catch { /* not ours */ }
      };
    } catch { /* no stream: the poll keeps it current */ }
  }
  function projectsStep() {
    const actions = el('div', 'actions');
    actions.append(button('sm-btn ghost', t('Back'), () => { step = 0; void agentsStep(); }), button('sm-btn primary', t('Continue'), () => { step = 2; openStep(); }));
    frame(t('Add your projects'), t('Choose the folders you work in. Adding them does not open them: you choose which to open in the next step.'), projectPicker({ compact: true }), actions);
  }
  function openStep() {
    const projects = (data?.rooms ?? []).filter((room) => room.id !== data?.salas);
    const list = el('div', 'sm-folders');
    const chosen = new Set();
    for (const room of projects) {
      const item = el('label', 'sm-folder');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = Boolean(room.open);
      box.disabled = Boolean(room.open);
      box.addEventListener('change', () => { if (box.checked) chosen.add(room.id); else chosen.delete(room.id); });
      const words = el('span', 'sm-folder-words');
      words.append(el('b', null, room.name), el('small', null, homeWord(room.root ?? '')));
      item.append(box, words);
      if (room.open) item.append(el('span', 'sm-tag is-project', t('Open')));
      list.append(item);
    }
    if (!projects.length) list.append(el('p', 'hint', t('No projects yet. You can add them from the lobby whenever you like.')));
    const actions = el('div', 'actions');
    const go = button('sm-btn primary', t('Done'), async () => {
      go.disabled = true;
      for (const id of chosen) {
        go.textContent = t('Opening {name}…', { name: projects.find((room) => room.id === id)?.name ?? id });
        await startRoom({ id });
      }
      wizard.close();
    });
    actions.append(button('sm-btn ghost', t('Back'), () => { step = 1; projectsStep(); }), go);
    frame(t('Open what you will use'), t('Each open project runs on this Mac with its own room. The rest stay in the lobby, asleep, until you open them.'), list, actions);
  }
  wizard.addEventListener('close', () => { stop(); wizard.remove(); wizard = null; });
  wizard.showModal();
  void agentsStep();
}

function translateStatic() {
  document.title = `MADRE · ${t('Lobby')}`;
  ui.title.textContent = t('Lobby');
  ui.add.textContent = t('Add a project');
  ui.back.title = t('Back to the room');
  ui.back.setAttribute('aria-label', t('Back to the room'));
  ui.stop.querySelector('span').textContent = t('Stop all');
  ui.macro.querySelector('span').textContent = t('Macroverse');
  ui.openTitle.textContent = t('Open projects');
  ui.asleepTitle.textContent = t('Asleep projects');
  ui.asleepNote.textContent = t('Projects in the lobby that are not open. Opening one starts its room.');
  ui.linksTitle.textContent = t('Links');
  ui.link.textContent = t('Link projects');
  ui.empty.textContent = t('No projects yet. Add the first one.');
  for (const kind of KINDS) KIND_WORDS[kind] = t(kind.toUpperCase());
}

translateStatic();
await refresh();
// `#welcome`: the first-run wizard again, on purpose (to connect an agent or add projects in steps).
if (location.hash === '#welcome') { history.replaceState(null, '', location.pathname); welcomed = true; openWizard(); }
// Sent here for the Macroverso (the key in BISHOP's room): straight into it, on a large screen.
if (location.hash === '#macroverso' && data && !ui.macro.hidden) { history.replaceState(null, '', location.pathname); ui.macro.click(); }
timer = setInterval(() => { if (!document.hidden && !busy.size) void refresh(); }, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
