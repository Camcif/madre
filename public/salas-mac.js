// SALAS on the Mac: every room this Mac knows, open or asleep, in one place (docs/MACROVERSO.md,
// phase 1). The room that serves this page answers for all of them (src/salas.mjs): it lists
// them, opens one that is asleep, asks one to close, and stops every agent in every room. A room
// opens at its own address; holding ⌘ opens it beside this one.
//
// The phone has its own SALAS (salas.js), served by the bridge; the two read the same rooms.

import { setLanguage, t } from './i18n.js';

const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const ui = {
  title: $('sm-title'), sub: $('sm-sub'), back: $('sm-back'), stop: $('sm-stop'), macro: $('sm-macro'), empty: $('sm-empty'), foot: $('sm-foot'),
  open: $('sm-open'), openGroup: $('sm-open-group'), openTitle: $('sm-open-title'),
  asleep: $('sm-asleep'), asleepGroup: $('sm-asleep-group'), asleepTitle: $('sm-asleep-title'), asleepNote: $('sm-asleep-note'),
  linksGroup: $('sm-links-group'), linksTitle: $('sm-links-title'), linksNote: $('sm-links-note'), links: $('sm-links'), link: $('sm-link'),
};
let language = 'es';
let timer = 0;
let arming = 0;
let data = null;
let macro = null;              // the macroverse, while it is open
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
  // The room of SALAS (phase 3d): MADRE's own, where the super agent lives. Named as such.
  if (data?.salas && room.id === data.salas) { node.classList.add('is-salas'); head.append(el('span', 'sm-chip salas', t('The room of SALAS'))); }
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
    const go = el('a', 'sm-btn primary', data?.salas === room.id ? t('Talk to BISHOP') : room.here ? t('Back to the room') : t('Open'));
    go.href = room.here ? '/' : `http://127.0.0.1:${room.open.port}/`;
    actions.append(go);
    if (!glance.outdated) actions.append(button('sm-btn ghost', t('Close'), () => { failed.delete(room.id); asking.add(room.id); draw(); }));
  } else if (room.root) {
    actions.append(button('sm-btn primary', t('Wake'), () => startRoom(room)));
  }
  node.append(actions);
  return node;
}

// Open first, by what needs the person: waiting, then working, then the rest, newest first.
const ORDER = { waiting: 0, working: 1, calm: 2, quiet: 3, outdated: 4 };
function draw() {
  if (!data) return;
  // The room of SALAS leads either list: it is the door to all the others.
  const salasFirst = (a, b) => Number(b.id === data.salas) - Number(a.id === data.salas);
  const open = data.rooms.filter((room) => room.open)
    .sort((a, b) => salasFirst(a, b) || (ORDER[stateOf(a).key] - ORDER[stateOf(b).key]) || (Date.parse(b.glance?.chat?.at ?? 0) - Date.parse(a.glance?.chat?.at ?? 0)));
  const asleep = data.rooms.filter((room) => !room.open).sort((a, b) => salasFirst(a, b) || Date.parse(b.lastOpened ?? 0) - Date.parse(a.lastOpened ?? 0));
  ui.sub.textContent = [data.mac ? t('On {mac}', { mac: data.mac }) : null, t('{n} open', { n: open.length }), asleep.length ? t('{n} asleep', { n: asleep.length }) : null].filter(Boolean).join(' · ');
  ui.openGroup.hidden = !open.length;
  ui.asleepGroup.hidden = !asleep.length;
  ui.open.replaceChildren(...open.map(card));
  ui.asleep.replaceChildren(...asleep.map(card));
  ui.empty.hidden = Boolean(open.length || asleep.length);
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
  node.append(el('p', 'traffic', [t('{n} reads in 24 h', { n: traffic.reads24h ?? 0 }), traffic.lastAt ? t('last {when}', { when: ago(traffic.lastAt) }) : t('none yet')].join(' · ')));
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
  ui.foot.textContent = t('Your rooms run on this Mac. Each one is a project, with its own memory.');
  draw();
}

async function startRoom(room) {
  busy.set(room.id, 'starting');
  failed.delete(room.id);
  draw();
  const answer = await fetch('/api/salas/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room: room.id }) })
    .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
  busy.delete(room.id);
  if (!answer.ok) failed.set(room.id, answer.body.error ?? t('The room did not open.'));
  await refresh();
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
    ui.sub.textContent = t('This room closed. Open MADRE again from its folder, or from another room.');
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
    back: t('Back to Rooms'),
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

function translateStatic() {
  document.title = `MADRE · ${t('Rooms')}`;
  ui.title.textContent = t('Rooms');
  ui.back.title = t('Back to the room');
  ui.back.setAttribute('aria-label', t('Back to the room'));
  ui.stop.querySelector('span').textContent = t('Stop all');
  ui.macro.querySelector('span').textContent = t('Macroverse');
  ui.openTitle.textContent = t('Open now');
  ui.asleepTitle.textContent = t('Asleep');
  ui.asleepNote.textContent = t('Closed rooms whose project is still on this Mac. Waking one opens it as madre start would.');
  ui.linksTitle.textContent = t('Links');
  ui.link.textContent = t('Link rooms');
  ui.empty.textContent = t('No rooms yet. Open MADRE in a project folder and it will be here.');
  for (const kind of KINDS) KIND_WORDS[kind] = t(kind.toUpperCase());
}

translateStatic();
await refresh();
// Sent here for the Macroverso (the key in the room of SALAS): straight into it, on a large screen.
if (location.hash === '#macroverso' && data && !ui.macro.hidden) { history.replaceState(null, '', location.pathname); ui.macro.click(); }
timer = setInterval(() => { if (!document.hidden && !busy.size) void refresh(); }, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
