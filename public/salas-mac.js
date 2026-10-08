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
    actions.append(button('sm-btn primary', t('Wake'), () => startRoom(room)));
  }
  node.append(actions);
  return node;
}

// Open first, by what needs the person: waiting, then working, then the rest, newest first.
const ORDER = { waiting: 0, working: 1, calm: 2, quiet: 3, outdated: 4 };
function draw() {
  if (!data) return;
  const open = data.rooms.filter((room) => room.open)
    .sort((a, b) => (ORDER[stateOf(a).key] - ORDER[stateOf(b).key]) || (Date.parse(b.glance?.chat?.at ?? 0) - Date.parse(a.glance?.chat?.at ?? 0)));
  const asleep = data.rooms.filter((room) => !room.open).sort((a, b) => Date.parse(b.lastOpened ?? 0) - Date.parse(a.lastOpened ?? 0));
  ui.sub.textContent = [data.mac ? t('On {mac}', { mac: data.mac }) : null, t('{n} open', { n: open.length }), asleep.length ? t('{n} asleep', { n: asleep.length }) : null].filter(Boolean).join(' · ');
  ui.openGroup.hidden = !open.length;
  ui.asleepGroup.hidden = !asleep.length;
  ui.open.replaceChildren(...open.map(card));
  ui.asleep.replaceChildren(...asleep.map(card));
  ui.empty.hidden = Boolean(open.length || asleep.length);
  const working = open.some((room) => room.glance?.working?.length);
  ui.stop.hidden = !working;
  // The macroverse wants a large screen: on a small one SALAS is the whole of it.
  ui.macro.hidden = !data.rooms.length || window.innerWidth < 900;
  macro?.update(data.rooms);
}

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
    hint: t('Click a universe to look at it · ← → to go from one to the next · Esc to come back'),
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
ui.macro.addEventListener('click', async () => {
  if (macro || !data) return;
  const { openMacroverso } = await import('./macroverso.js');
  const accent = getComputedStyle(document.body).getPropertyValue('--s-acc').trim();
  document.body.classList.add('sm-in-macro');
  macro = openMacroverso({
    host: document.body,
    rooms: data.rooms,
    here: data.here,
    accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#9bff66',
    words: macroWords(),
    actions: {
      wake: async (room) => { await startRoom(room); },
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
  ui.empty.textContent = t('No rooms yet. Open MADRE in a project folder and it will be here.');
  for (const kind of KINDS) KIND_WORDS[kind] = t(kind.toUpperCase());
}

translateStatic();
await refresh();
timer = setInterval(() => { if (!document.hidden && !busy.size) void refresh(); }, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
