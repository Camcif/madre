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
  title: $('sm-title'), sub: $('sm-sub'), back: $('sm-back'), stop: $('sm-stop'), macro: $('sm-macro'), foot: $('sm-foot'), gear: $('sm-gear'),
  add: $('sm-add'), search: $('sm-search'), filter: $('sm-filter'), projects: $('sm-projects'), none: $('sm-none'),
  bishop: {
    box: $('sm-bishop'), mark: $('sm-bishop-mark'), state: $('sm-bishop-state'), go: $('sm-bishop-go'), tab: $('sm-bishop-tab'), about: $('sm-bishop-about'),
    asks: $('sm-bishop-asks'), error: $('sm-bishop-error'),
  },
  work: { box: $('sm-work'), title: $('sm-work-title'), by: $('sm-work-by'), again: $('sm-work-again'), list: $('sm-work-list'), note: $('sm-work-note') },
  waiting: { box: $('sm-waiting'), title: $('sm-waiting-title'), count: $('sm-waiting-count'), body: $('sm-waiting-body') },
  map: $('sm-map'), linksTileTitle: $('sm-links-tile-title'), linksSum: $('sm-links-sum'), linksAll: $('sm-links-all'), link: $('sm-link'),
  linksSheet: $('sm-links-sheet'), linksTitle: $('sm-links-title'), linksNote: $('sm-links-note'), links: $('sm-links'), linksClose: $('sm-links-close'), linkMore: $('sm-link-more'),
  memory: { title: $('sm-memory-title'), total: $('sm-memory-total'), body: $('sm-memory-body') },
  decisions: { title: $('sm-decisions-title'), list: $('sm-decisions-list') },
  attention: { title: $('sm-attention-title'), count: $('sm-attention-count'), list: $('sm-attention-list') },
};
let language = 'es';
let timer = 0;
let arming = 0;
let data = null;
let macro = null;              // the macroverse, while it is open
let welcomed = false;          // the first-run wizard was offered this visit
let agentsSeen = null;         // what /api/settings said of the agents, last time it was asked
let versionSeen = null;        // what /api/version said of MADRE, last time it was asked
let work = null;               // MADRE's summary of the last work (/api/salas/work)
let decisions = null;          // the recent decisions of the open rooms (/api/salas/decisions)
let filter = 'all';            // which projects show: all, open or asleep
let query = '';                // what the search box holds
// What each card is in the middle of, kept across the refreshes that redraw it.
const busy = new Map();       // room id → 'starting' | 'closing'
const asking = new Set();      // room ids whose card asks before closing
const failed = new Map();      // room id → what went wrong, said on its card
const revoking = new Set();    // link ids whose row asks before revoking

// The room's looks, from this browser: the same keys the room's own page keeps (app.js, LOOKS),
// so a choice made here is the room's too when the room is served at this address.
const ACCENTS = ['madre', 'mountain', 'caribbean', 'phantom', 'malbec', 'dijon', 'pacific', 'love', 'sierra', 'pitahaya', 'papaya', 'agave', 'dinamo', 'marina', 'pulso', 'leal', 'dulce'];
const ACCENT_WORDS = { madre: () => t('Madre green'), mountain: () => t('Mountain green'), caribbean: () => t('Caribbean blue'), phantom: () => t('Phantom purple'), malbec: () => t('Malbec red'), dijon: () => t('Dijon yellow'), pacific: () => t('Pacific blue'), love: () => t('Love pink'), sierra: () => t('Sierra blue'), pitahaya: () => 'Pitahaya', papaya: () => 'Papaya', agave: () => 'Agave', dinamo: () => t('Dynamo black'), marina: () => t('Marina blue'), pulso: () => t('Pulse green'), leal: () => t('Loyal orange'), dulce: () => t('Sweet yellow') };
function readLooks() {
  let theme = 'auto';
  let accent = null;
  try { theme = localStorage.getItem('pulse.theme') ?? 'auto'; accent = localStorage.getItem('pulse.accent'); } catch { /* no storage */ }
  return { theme: ['auto', 'light', 'dark'].includes(theme) ? theme : 'auto', accent: ACCENTS.includes(accent) ? accent : 'madre' };
}
function applyLooks() {
  const { theme, accent } = readLooks();
  const light = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme; else delete root.dataset.theme;
  root.dataset.scheme = theme === 'auto' ? (light ? 'light' : 'dark') : theme;
  if (accent !== 'madre') root.dataset.accent = accent; else delete root.dataset.accent;
}
applyLooks();
function saveLooks({ theme, accent }) {
  try {
    if (theme) localStorage.setItem('pulse.theme', theme);
    // The first accent is the room as it always was, and is kept as no choice at all (app.js, saveLook).
    if (accent) { if (accent === 'madre') localStorage.removeItem('pulse.accent'); else localStorage.setItem('pulse.accent', accent); }
  } catch { /* the choice lasts as long as the page */ }
  applyLooks();
  settingsSheet?.paintLooks();
}
window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', applyLooks);
window.addEventListener('storage', (event) => { if (event.key === 'pulse.theme' || event.key === 'pulse.accent') { applyLooks(); settingsSheet?.paintLooks(); } });

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
// Where a room is reached from this page: this one is here, the rest at their own port.
const addressOf = (room) => (room.here ? '/' : `http://127.0.0.1:${room.open.port}/`);

// The memory kinds, in the colours NOSTROMO gives them (styles.css, --mem-*).
const KINDS = ['decision', 'fact', 'preference', 'question', 'aberration'];
const KIND_WORDS = { decision: t('DECISION'), fact: t('FACT'), preference: t('PREFERENCE'), question: t('QUESTION'), aberration: t('ABERRATION') };
// A kind as a sentence says it: «Decisión», not «DECISIÓN».
const kindWord = (kind) => { const word = String(KIND_WORDS[kind] ?? kind).toLowerCase(); return word.charAt(0).toUpperCase() + word.slice(1); };

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
  const node = el('article', `sm-tile sm-card is-${state.key}${room.here ? ' here' : ''}`);
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
    actions.append(el('span', 'sm-ask', why), button('sm-btn danger small', t('Close it'), () => closeRoom(room)), button('sm-btn ghost small', t('Cancel'), () => { asking.delete(room.id); draw(); }));
  } else if (room.open) {
    const go = el('a', 'sm-btn primary small', room.here ? t('Back to the room') : t('Open'));
    go.href = addressOf(room);
    actions.append(go);
    if (!glance.outdated) actions.append(button('sm-btn ghost small', t('Close'), () => { failed.delete(room.id); asking.add(room.id); draw(); }));
  } else if (room.root) {
    actions.append(button('sm-btn primary small', t('Open'), () => startRoom(room, { enter: true })));
  }
  node.append(actions);
  return node;
}

// Open first, by what needs the person: waiting, then working, then the rest, newest first.
const ORDER = { waiting: 0, working: 1, calm: 2, quiet: 3, outdated: 4 };
// The projects in the order the lobby shows them: the open ones by what needs the person, then
// the asleep ones, the last opened first. BISHOP's own room is not a project.
function projectsInOrder() {
  const projects = data.rooms.filter((room) => room.id !== data.salas);
  const open = projects.filter((room) => room.open)
    .sort((a, b) => (ORDER[stateOf(a).key] - ORDER[stateOf(b).key]) || (Date.parse(b.glance?.chat?.at ?? 0) - Date.parse(a.glance?.chat?.at ?? 0)));
  const asleep = projects.filter((room) => !room.open).sort((a, b) => Date.parse(b.lastOpened ?? b.added ?? 0) - Date.parse(a.lastOpened ?? a.added ?? 0));
  return { all: [...open, ...asleep], open, asleep };
}
function draw() {
  if (!data) return;
  const { all, open } = projectsInOrder();
  ui.sub.textContent = [data.mac ? t('On {mac}', { mac: data.mac }) : null, all.length === 1 ? t('1 project') : t('{n} projects', { n: all.length }), open.length ? t('{n} open', { n: open.length }) : null].filter(Boolean).join(' · ');
  drawBishop(data.rooms.find((room) => room.id === data.salas) ?? null);
  drawWaiting();
  // The brand leads back to where this page came from; served by BISHOP's own room, it stays here.
  ui.back.href = data.here === data.salas ? '/salas' : '/';
  drawProjects(all);
  if (!all.length && !welcomed) { welcomed = true; openWizard(); }
  const working = open.some((room) => room.glance?.working?.length);
  ui.stop.hidden = !working;
  drawLinks(all);
  drawMemory();
  drawAttention();
  // The macroverse wants a large screen: on a small one SALAS is the whole of it.
  ui.macro.hidden = !data.rooms.length || window.innerWidth < 900;
  macro?.update(data.rooms, data.enlaces ?? []);
}

// The projects, as the search box and the filter leave them. Nothing is hidden by the filter
// without saying so: an empty result says what was asked.
function shows(room) {
  if (filter === 'open' && !room.open) return false;
  if (filter === 'asleep' && room.open) return false;
  if (!query) return true;
  const wanted = query.toLocaleLowerCase(language);
  return room.name.toLocaleLowerCase(language).includes(wanted) || homeWord(room.root).toLocaleLowerCase(language).includes(wanted);
}
function drawProjects(all = data ? projectsInOrder().all : []) {
  if (!data) return;
  const shown = all.filter(shows);
  ui.projects.replaceChildren(...shown.map(card));
  ui.projects.hidden = !shown.length;
  ui.none.hidden = Boolean(shown.length);
  ui.none.replaceChildren();
  if (!all.length) ui.none.append(el('span', null, t('No projects yet. Add the first one.')), button('sm-btn primary small', t('Add a project'), openAddSheet));
  else if (!shown.length) ui.none.append(el('span', null, query ? t('No project matches «{query}».', { query }) : filter === 'open' ? t('No project is open.') : t('No project is asleep.')));
}
ui.search.addEventListener('input', () => { query = ui.search.value.trim(); drawProjects(); });
for (const choice of ui.filter.querySelectorAll('[data-filter]')) {
  choice.addEventListener('click', () => {
    filter = choice.dataset.filter;
    for (const one of ui.filter.querySelectorAll('[data-filter]')) one.setAttribute('aria-checked', String(one === choice));
    drawProjects();
  });
}

// WAITING FOR YOU: every question an agent asks the person, from every open room, counted in one
// number; the first ones said, each leading to its room.
function drawWaiting() {
  const rooms = data.rooms.filter((room) => room.open && room.glance?.waitingCount);
  const total = rooms.reduce((sum, room) => sum + room.glance.waitingCount, 0);
  ui.waiting.count.textContent = String(total);
  ui.waiting.box.classList.toggle('has', Boolean(total));
  ui.waiting.body.replaceChildren();
  if (!total) { ui.waiting.body.append(el('p', 'sm-hint', t('Nobody needs you. When an agent asks for you, it shows here.'))); return; }
  for (const room of rooms.slice(0, 2)) {
    const row = el('a', 'sm-waiting-row');
    row.href = addressOf(room);
    const first = room.glance.waiting?.[0];
    row.append(el('b', null, roomLabel(room)), el('span', null, first ? askLine(first) : t('Waiting for you · {n}', { n: room.glance.waitingCount })));
    ui.waiting.body.append(row);
  }
  if (rooms.length > 2) ui.waiting.body.append(el('p', 'sm-hint', t('And {n} more rooms.', { n: rooms.length - 2 })));
}

// MEMORY: what the open rooms hold, added up, by kind. A room asleep is not asked, so it is not
// counted, and the tile says so.
function drawMemory() {
  const sum = { memories: 0, travelling: 0, kinds: {} };
  const counted = data.rooms.filter((room) => room.open && room.glance?.census);
  for (const room of counted) {
    const census = room.glance.census;
    sum.memories += census.memories ?? 0;
    sum.travelling += census.travelling ?? 0;
    for (const kind of KINDS) sum.kinds[kind] = (sum.kinds[kind] ?? 0) + (census.kinds?.[kind] ?? 0);
  }
  ui.memory.total.textContent = t('{n} memories', { n: sum.memories });
  ui.memory.total.hidden = !counted.length;
  ui.memory.body.replaceChildren();
  if (!counted.length) { ui.memory.body.append(el('p', 'sm-hint', t('Open a project to count its memory.'))); return; }
  ui.memory.body.append(memoryStrip(sum));
  const legend = el('div', 'sm-legend');
  for (const kind of KINDS) {
    if (!sum.kinds[kind]) continue;
    const item = el('span', `k-${kind}`, `${kindWord(kind)} · ${sum.kinds[kind]}`);
    legend.append(item);
  }
  ui.memory.body.append(legend, el('p', 'sm-hint', [sum.memories ? t('{n} travel', { n: sum.travelling }) : null, t('Counted in the open rooms.')].filter(Boolean).join(' · ')));
}

// AGENTS: the ones on this computer, with the session each has. Connected once, every project
// uses them; the settings sheet installs or signs in the one that needs it, and «Needs you» says
// which one does.
function agentState(agent, answer) {
  const session = answer.sessions?.[agent.id]?.state;
  const busyNow = answer.loggingIn === agent.id;
  const ok = agent.ready && session !== 'signed-out';
  return { ok, busyNow, key: ok ? 'ok' : busyNow ? 'wait' : agent.detected ? 'bad' : 'wait', words: ok ? t('Connected') : busyNow ? t('Signing in…') : agent.detected ? t('Not signed in') : t('Not installed') };
}
async function loadAgents() {
  const answer = await fetch('/api/settings', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer?.agents) return;
  agentsSeen = answer;
  drawAttention();
}
// MADRE itself: the version this room runs and the newest one it knows of.
async function loadVersion() {
  const answer = await fetch('/api/version', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer) return;
  versionSeen = answer;
  drawAttention();
}

// APPEARANCE, in the settings sheet: the theme and the accent, chosen at once, on the room's own
// rail. The same three words and the same colours as PERSONALIZE in the room.
function themeSeg() {
  const { theme } = readLooks();
  const seg = el('div', 'sx-seg');
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', t('Theme'));
  for (const [value, words] of [['auto', t('Automatic')], ['light', t('Light')], ['dark', t('Dark')]]) {
    const one = button(null, words, () => saveLooks({ theme: value }));
    one.setAttribute('role', 'radio');
    one.setAttribute('aria-checked', String(theme === value));
    seg.append(one);
  }
  return seg;
}
function swatches() {
  const { accent } = readLooks();
  const row = el('div', 'sm-swatches');
  row.setAttribute('role', 'radiogroup');
  row.setAttribute('aria-label', t('Accent'));
  for (const id of ACCENTS) {
    const swatch = button('sm-swatch', null, () => saveLooks({ accent: id }));
    swatch.dataset.accent = id;
    swatch.setAttribute('role', 'radio');
    swatch.setAttribute('aria-checked', String(accent === id));
    swatch.title = ACCENT_WORDS[id]();
    swatch.setAttribute('aria-label', swatch.title);
    row.append(swatch);
  }
  return row;
}

// NEEDS YOU: what the person would want to know before anything else, from what the rooms, the
// agents and MADRE itself say: a room on an older MADRE or not answering, an agent without a
// session, a link about to expire, a newer MADRE. Nothing listed is a guess.
function attentionItems() {
  const items = [];
  for (const room of data?.rooms ?? []) {
    if (!room.open) continue;
    const name = roomLabel(room);
    if (room.glance?.outdated) items.push({ tone: 'wait', words: t('{room} runs an older MADRE.', { room: name }), hint: t('Update it to see it here and to link it.'), href: addressOf(room), go: t('Open') });
    else if (room.glance?.unreachable) items.push({ tone: 'bad', words: t('{room} is not answering.', { room: name }), hint: t('It may be busy. If it stays like this, close it and open it again.') });
  }
  for (const agent of (agentsSeen?.agents ?? []).filter((one) => one.id !== 'madre')) {
    const state = agentState(agent, agentsSeen);
    if (!state.ok) items.push({ tone: state.key, words: `${agent.label ?? agent.id} · ${state.words}`, hint: t('Connected once, every project uses it.'), act: () => openSettings('agents'), go: t('Connect') });
  }
  const soon = Date.now() + 3 * 86400000;
  for (const enlace of data?.enlaces ?? []) {
    if (!enlace.expires || Date.parse(enlace.expires) > soon) continue;
    const { source, reader } = endsOf(enlace);
    items.push({ tone: 'wait', words: t('The link {reader} ← {source} ends {when}.', { reader: roomName(reader), source: roomName(source), when: ago(enlace.expires) }), hint: t('Sign it again if it should go on.'), act: () => ui.linksSheet.showModal(), go: t('See the links') });
  }
  if (versionSeen?.available && versionSeen.latest) items.push({ tone: 'ok', words: t('MADRE {version} is out.', { version: versionSeen.latest }), hint: t('You run {version}. Each room updates from its settings, in Version.', { version: versionSeen.current }), href: versionSeen.release, external: true, go: t('What it brings') });
  return items;
}
function drawAttention() {
  const items = attentionItems();
  ui.attention.count.textContent = String(items.length);
  ui.attention.count.hidden = !items.length;
  ui.attention.list.replaceChildren();
  if (!items.length) {
    const calm = el('li', 'sm-attention-item is-calm');
    const words = el('div', 'sm-attention-words');
    words.append(el('b', null, t('All in order.')), el('span', null, t('No room, agent or link needs you.')));
    calm.append(el('i', 'dot'), words);
    ui.attention.list.append(calm);
    return;
  }
  for (const item of items.slice(0, 3)) {
    const row = el('li', `sm-attention-item is-${item.tone}`);
    const words = el('div', 'sm-attention-words');
    words.append(el('b', null, item.words), el('span', null, item.hint));
    row.append(el('i', 'dot'), words);
    if (item.href) {
      const go = el('a', 'sm-btn small', item.go);
      go.href = item.href;
      if (item.external) { go.target = '_blank'; go.rel = 'noopener'; }
      row.append(go);
    } else if (item.act) row.append(button('sm-btn small', item.go, item.act));
    ui.attention.list.append(row);
  }
  if (items.length > 3) ui.attention.list.append(el('li', 'sm-hint', t('And {n} more.', { n: items.length - 3 })));
}

// RECENT DECISIONS: what the open rooms decided last, in their own words, as each archive keeps
// them (the notes that travel into turns). Read through the lobby's route, which asks the rooms
// at most every few minutes.
async function loadDecisions() {
  const answer = await fetch('/api/salas/decisions', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer) return;
  decisions = answer.decisions ?? [];
  drawDecisions();
}
function drawDecisions() {
  const list = ui.decisions.list;
  list.replaceChildren();
  if (!decisions) { list.append(el('li', 'sm-hint', t('Reading the open rooms…'))); return; }
  if (!decisions.length) { list.append(el('li', 'sm-hint', t('No decisions yet in the open rooms. When an archive keeps one, it shows here.'))); return; }
  for (const one of decisions.slice(0, 4)) {
    const item = el('li', 'sm-decision');
    const head = el('div', 'sm-decision-head');
    head.append(roomTag(one.room, one.name), el('time', null, ago(one.at)));
    item.append(head, el('p', null, one.text));
    list.append(item);
  }
}
// A project's name as a small tag: a way into it when it is open.
function roomTag(id, name) {
  const room = data?.rooms.find((one) => one.id === id) ?? null;
  const tag = el(room?.open ? 'a' : 'span', 'sm-chip port sm-tag-room', name);
  if (room?.open) tag.href = addressOf(room);
  return tag;
}

// THE LAST WORK: MADRE's summary of the newest conversations of every project, written with its
// local model in this Mac (src/lobby-work.mjs) and checked against them. Without the model, or
// while it writes, the conversations show as they are.
let workTimer = 0;
async function loadWork({ again = false } = {}) {
  clearTimeout(workTimer);
  if (again) { ui.work.again.disabled = true; ui.work.box.classList.add('is-working'); }
  const answer = await fetch('/api/salas/work', again ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' } : { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (answer) { work = answer; drawWork(); }
  // While MADRE writes, the tile asks again soon; otherwise every two minutes.
  workTimer = setTimeout(() => { if (!document.hidden) void loadWork(); }, answer?.state === 'working' ? 3000 : 120000);
}
function drawWork() {
  const w = ui.work;
  w.list.replaceChildren();
  const state = work?.state ?? 'loading';
  w.box.classList.toggle('is-working', state === 'working');
  w.again.hidden = !work || state === 'empty' || state === 'unavailable';
  w.again.disabled = state === 'working';
  if (!work) { w.by.textContent = ''; w.note.textContent = t('Reading your conversations…'); return; }
  if (state === 'empty') { w.by.textContent = ''; w.note.textContent = t('No conversations in the last two weeks. What you work on in any project shows here, summarised by MADRE.'); return; }
  const bullets = work.bullets ?? [];
  if (bullets.length) {
    // Each line's project is the conversation's it summarises, put by the lobby (src/lobby-work.mjs).
    for (const one of bullets) {
      const item = el('li');
      item.append(roomTag(one.room, one.name), el('span', null, one.text));
      w.list.append(item);
    }
  } else {
    for (const one of (work.sources ?? []).slice(0, 5)) {
      const item = el('li', 'raw');
      const words = el('span');
      words.append(el('b', null, chatName(one.title)));
      if (one.last?.text) words.append(document.createTextNode(` — ${one.last.text}`));
      item.append(roomTag(one.room, one.name), words, el('time', null, ago(one.at)));
      w.list.append(item);
    }
  }
  w.by.textContent = bullets.length && work.at ? `@madre · ${work.model ?? ''} · ${ago(new Date(work.at).toISOString())}` : '';
  w.note.textContent = state === 'working' ? t('MADRE is summarising your latest conversations…')
    : state === 'unavailable' ? (bullets.length ? t('MADRE\'s local model is off: this is the last summary it wrote.') : t('MADRE\'s local model is off: these are your latest conversations, as they are.'))
    : state === 'failed' ? t('MADRE could not summarise them this time: these are your latest conversations, as they are.')
    : work.stale ? t('There is newer work than this summary: it is written again in a few minutes, or now if you ask.')
    : t('Written by MADRE on this Mac from your latest conversations.');
}
ui.work.again.addEventListener('click', () => void loadWork({ again: true }));

// LINKS (docs/MACROVERSO.md, phase 3c): the contracts between rooms, read from /api/salas, each
// one revocable here, and the sheet that signs a new one. A contract says which room reads which,
// what kinds cross and until when; what crosses is counted, never shown.
const roomLabel = (room) => (room.id === data?.salas ? 'BISHOP' : room.name);
const roomName = (id) => { const room = data?.rooms.find((one) => one.id === id); return room ? roomLabel(room) : id === data?.salas ? 'BISHOP' : id; };
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
function drawLinks(projects) {
  const enlaces = data.enlaces ?? [];
  const enough = data.rooms.length >= 2;
  ui.link.hidden = !enough;
  ui.linkMore.hidden = !enough;
  ui.linksAll.hidden = !enlaces.length;
  const reads = enlaces.reduce((sum, enlace) => sum + (enlace.traffic?.reads24h ?? 0), 0);
  ui.linksSum.textContent = enlaces.length
    ? [enlaces.length === 1 ? t('1 in force') : t('{n} in force', { n: enlaces.length }), t('{n} reads in 24 h', { n: reads })].join(' · ')
    : enough ? t('No links yet.') : t('Add a project to link it.');
  ui.linksNote.textContent = t('A link lets one room read the distilled notes of another, read-only, by a contract you sign here. Nothing is written across, and only notes that travel into turns cross.');
  ui.links.replaceChildren(...enlaces.map(linkRow));
  if (!enlaces.length && ui.linksSheet.open) ui.linksSheet.close();
  drawMap(projects, enlaces);
}
async function revokeLink(id) {
  revoking.delete(id);
  await fetch('/api/salas/enlaces/revoke', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => null);
  await refresh();
}
ui.linksAll.addEventListener('click', () => { if (!ui.linksSheet.open) ui.linksSheet.showModal(); });
ui.linksClose.addEventListener('click', () => ui.linksSheet.close());
ui.linkMore.addEventListener('click', () => openLinkSheet());

// The map of the links: BISHOP in the middle, the projects round it (the first ten, in the
// lobby's order), and an arrow for each contract in force, from the room that serves to the one
// that reads. A project asleep is a dashed ring; nothing here is drawn that the contracts do not say.
const SVG = 'http://www.w3.org/2000/svg';
const svgNode = (tag, attributes = {}) => {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
};
function drawMap(projects, enlaces) {
  ui.map.replaceChildren();
  if (!projects.length) { ui.map.append(el('p', 'sm-hint', t('Your projects show here, round BISHOP, with the links between them.'))); return; }
  const W = 320, H = 200, cx = W / 2, cy = H / 2 - 6;
  const shown = projects.slice(0, 10);
  const at = new Map([[data.salas, { x: cx, y: cy, r: 16 }]]);
  shown.forEach((room, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / shown.length + (shown.length === 2 ? Math.PI / 2 : 0);
    const memories = room.glance?.census?.memories ?? 0;
    at.set(room.id, { x: cx + Math.cos(angle) * 118, y: cy + Math.sin(angle) * 62, r: room.open ? 7 + Math.min(8, Math.sqrt(memories) / 2) : 7 });
  });
  const svg = svgNode('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  svg.setAttribute('aria-label', ui.linksSum.textContent);
  const defs = svgNode('defs');
  const arrow = svgNode('marker', { id: 'sm-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
  arrow.append(svgNode('path', { d: 'M0 0L10 5L0 10z', fill: 'currentColor' }));
  defs.append(arrow);
  svg.append(defs);
  for (const room of shown) { const end = at.get(room.id); svg.append(svgNode('line', { class: 'spoke', x1: cx, y1: cy, x2: end.x, y2: end.y })); }
  for (const enlace of enlaces) {
    const { source, reader } = endsOf(enlace);
    const from = at.get(source), to = at.get(reader);
    if (!from || !to) continue;
    // A soft curve, bent to one side, that stops at the edge of each body.
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
    const ux = dx / length, uy = dy / length;
    const start = { x: from.x + ux * (from.r + 3), y: from.y + uy * (from.r + 3) };
    const end = { x: to.x - ux * (to.r + 4), y: to.y - uy * (to.r + 4) };
    const bend = { x: (start.x + end.x) / 2 - uy * 26, y: (start.y + end.y) / 2 + ux * 26 };
    const path = svgNode('path', { class: 'vein', d: `M${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${bend.x.toFixed(1)} ${bend.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`, 'marker-end': 'url(#sm-arrow)' });
    if (enlace.direction === 'both') path.setAttribute('marker-start', 'url(#sm-arrow)');
    svg.append(path);
  }
  for (const room of shown) {
    const spot = at.get(room.id);
    const body = svgNode('circle', { class: `node${room.open ? '' : ' asleep'}${room.glance?.waitingCount ? ' waiting' : ''}`, cx: spot.x.toFixed(1), cy: spot.y.toFixed(1), r: spot.r.toFixed(1) });
    const title = svgNode('title');
    title.textContent = `${room.name} · ${stateOf(room).words}`;
    body.append(title);
    const name = svgNode('text', { class: 'label', x: spot.x.toFixed(1), y: (spot.y + spot.r + 12).toFixed(1), 'text-anchor': 'middle' });
    name.textContent = room.name.length > 14 ? `${room.name.slice(0, 13)}…` : room.name;
    svg.append(body, name);
  }
  // BISHOP, in its own colours, with its own mark (brands.js).
  const brand = brandOf('bishop');
  const centre = svgNode('g', { class: 'bishop' });
  centre.append(svgNode('circle', { cx, cy, r: 16, fill: brand.color }));
  const face = svgNode('g', { transform: `translate(${cx - 10} ${cy - 10})`, color: brand.ink });
  face.innerHTML = brand.mark(); // trusted: our own SVG string from brands.js
  face.firstElementChild?.setAttribute('width', '20');
  face.firstElementChild?.setAttribute('height', '20');
  centre.append(face);
  svg.append(centre);
  ui.map.append(svg);
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
    for (const room of rooms) { const option = el('option', null, roomLabel(room)); option.value = room.id; if (room.id === chosen) option.selected = true; select.append(option); }
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
  if (answer.language && answer.language !== language) { language = setLanguage(answer.language); root.lang = language; translateStatic(); drawAttention(); drawDecisions(); drawWork(); }
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
    ui.projects.hidden = true;
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
    back: t('Back to the lobby'),
    hint: t('Drag the space to move it · wheel to come closer · click a universe to look at it · drag it to turn it · carry one onto BISHOP for BISHOP to read it, or onto another to link them · ← → from one to the next · Esc to come back'),
    bishop: 'BISHOP',
    bishopAbout: t('Your super agent. It reads across your projects, signs the links between them and carries an order from one to another.'),
    bishopReads: (n) => (n ? (n === 1 ? t('It reads 1 project by a link') : t('It reads {n} projects by links', { n })) : t('It reads no project yet: each one it reads is a link you sign.')),
    notLinked: t('Not linked yet: touch one to link it'),
    talk: t('Talk to BISHOP'),
    asleep: t('Asleep'),
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
      return [data?.mac ?? null, t('{n} universes', { n: rooms.length }), waiting ? t('{n} waiting for you', { n: waiting }) : null, t('{n} memories', { n: memories })].filter(Boolean).join(' · ');
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
// And the ink that accent wears, read the same way.
function darkAccentInk() {
  const wanted = `[data-accent="${root.dataset.accent || 'madre'}"]`;
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (rule.selectorText !== wanted) continue;
        const hex = rule.style.getPropertyValue('--acc-ink').trim();
        if (/^#[0-9a-f]{6}$/i.test(hex)) return hex;
      }
    }
  } catch { /* no sheets to read: the house ink */ }
  return '#0a1405';
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
    accentInk: darkAccentInk(),
    // BISHOP at the centre (D-S12), in its own colours and with its own mark (brands.js).
    bishop: data.salas ? { id: data.salas, mark: brandOf('bishop').mark(), color: brandOf('bishop').color, ink: brandOf('bishop').ink } : null,
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
function mark(id, size = 40) {
  const brand = brandOf(id);
  const node = el('span', 'sm-mark');
  node.style.setProperty('--b', brand.color);
  node.style.setProperty('--b-ink', brand.ink);
  node.style.width = node.style.height = `${size}px`;
  node.innerHTML = brand.mark(); // trusted: our own SVG strings from brands.js
  return node;
}

// BISHOP, at the head of the lobby: the super agent that reads across the projects, signs links
// between them and carries orders from one to another. It is talked to in its own room (MADRE's
// folder, not a project), here or in a new tab; asleep, it is woken first. What it waits for is
// read from that room. Under it, the last work of every project, summarised by MADRE.
ui.bishop.mark.replaceWith(mark('bishop', 44));
function drawBishop(room) {
  const b = ui.bishop;
  const glance = room?.glance ?? {};
  const state = room?.open ? stateOf(room) : { key: 'asleep', words: t('Asleep') };
  b.box.className = `sm-tile sm-bishop c-8 r-3 is-${state.key}`;
  b.state.querySelector('span').textContent = state.words;
  const waking = busy.get(data?.salas) === 'starting';
  for (const way of [b.go, b.tab]) way.setAttribute('aria-disabled', String(waking));
  b.go.textContent = waking ? t('Waking…') : t('Talk to BISHOP');
  syncBishopLinks();
  // What it waits for, each one a door into its room.
  b.asks.replaceChildren();
  b.asks.hidden = !glance.waiting?.length;
  if (!b.asks.hidden) {
    b.asks.append(el('span', 'sm-hint', t('Waiting for you')));
    for (const ask of glance.waiting.slice(0, 3)) b.asks.append(button('sm-chip ask', askLine(ask), () => openBishop()));
  }
  b.error.hidden = !failed.has(data?.salas);
  b.error.textContent = failed.get(data?.salas) ?? '';
}
// Both ways into BISHOP's room are links, so ⌘-click and «open in a new tab» do what they always
// do. Asleep, it is woken first; a new tab is then opened at the press, while the press is still
// the person's, and sent on when the room answers: a tab opened after waiting is blocked.
function bishopAddress() {
  const room = data?.rooms.find((one) => one.id === data.salas);
  return room?.open ? addressOf(room) : null;
}
function syncBishopLinks() {
  const address = bishopAddress() ?? '/salas';
  ui.bishop.go.href = address;
  ui.bishop.tab.href = address;
}
function wakeBishop({ newTab = false } = {}) {
  const tab = newTab ? window.open('about:blank', '_blank') : null;
  if (tab) tab.opener = null;
  void startRoom({ id: data.salas }).then((answer) => {
    if (!answer.ok || !answer.body.port) { tab?.close(); return; }
    const address = `http://127.0.0.1:${answer.body.port}/`;
    if (tab) tab.location.href = address;
    else location.href = address;
  });
}
function openBishop({ newTab = false } = {}) {
  if (!data) return;
  const address = bishopAddress();
  if (!address) { wakeBishop({ newTab }); return; }
  if (newTab) window.open(address, '_blank', 'noopener');
  else location.href = address;
}
for (const [way, alwaysNew] of [[ui.bishop.go, false], [ui.bishop.tab, true]]) {
  way.addEventListener('click', (event) => {
    if (way.getAttribute('aria-disabled') === 'true' || !data) { event.preventDefault(); return; }
    // Awake, the link goes where it points.
    if (bishopAddress()) return;
    event.preventDefault();
    wakeBishop({ newTab: alwaysNew || event.metaKey || event.ctrlKey || event.shiftKey });
  });
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

// The room's close (styles.css, .surface-modes · .x-close): a sunk track holding one key, the
// cross that turns as the pointer comes to it.
function closeKey(onClick) {
  const track = el('span', 'surface-modes');
  const key = button('surface-mode close x-close x-only', null, onClick);
  key.setAttribute('aria-label', t('Close'));
  const icon = el('span', 'x-icon');
  icon.innerHTML = '<svg viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  key.append(icon);
  track.append(key);
  return track;
}

// «Add a project», on its own: the picker in a sheet.
let addSheet = null;
function openAddSheet() {
  if (addSheet) return;
  addSheet = el('dialog', 'sm-sheet sm-wide');
  const inner = el('div', 'sm-sheet-body');
  const head = el('header', 'sm-sheet-head');
  head.append(el('h3', null, t('Add a project')), closeKey(() => addSheet.close()));
  inner.append(head, el('p', 'hint', t('A project is a folder: MADRE opens a room for it, with its own conversations and its own memory. Adding it does not open it; you open it from its card.')));
  inner.append(projectPicker({ onAdded: () => addSheet?.close() }));
  addSheet.append(inner);
  document.body.append(addSheet);
  addSheet.addEventListener('close', () => { addSheet.remove(); addSheet = null; });
  addSheet.showModal();
}
ui.add.addEventListener('click', openAddSheet);

// The agents of this computer, each with its session and the one action it needs (install, or
// sign in), kept current while it is on screen: polled, and told by the room's events what an
// install or a sign-in says as it goes. The wizard's first step and the settings sheet show it.
function agentsPanel({ onPaint = null } = {}) {
  const list = el('div', 'sm-agents');
  const lastLine = new Map();   // agent → what its install or sign-in said last
  let poll = 0;
  let stream = null;
  const paint = async () => {
    const answer = await fetch('/api/settings', { cache: 'no-store' }).then((response) => response.json()).catch(() => null);
    if (!answer?.agents) return;
    agentsSeen = answer;
    drawAttention();
    list.replaceChildren();
    let ready = 0;
    for (const agent of answer.agents.filter((one) => one.id !== 'madre')) {
      const state = agentState(agent, answer);
      if (state.ok) ready += 1;
      const item = el('div', `sm-agent${state.ok ? ' ok' : ''}`);
      const words = el('span', 'sm-agent-words');
      words.append(el('b', null, agent.label ?? agent.id));
      words.append(el('small', `session-lamp ${state.key}`, state.words));
      if (lastLine.has(agent.id) && !state.ok) {
        const said = lastLine.get(agent.id);
        const line = el('small', 'sm-agent-line', said.line);
        if (said.url) { const link = el('a', null, t('Open the sign-in page')); link.href = said.url; link.target = '_blank'; link.rel = 'noopener'; line.append(' ', link); }
        words.append(line);
      }
      item.append(mark(agent.id, 34), words);
      if (!state.ok && !state.busyNow) {
        if (!agent.detected && agent.install) item.append(button('sm-btn ghost small', t('Install'), async (event) => { event.currentTarget.disabled = true; await post(`/api/agents/${agent.id}/install`); void paint(); }));
        else if (agent.detected && agent.login) item.append(button('sm-btn ghost small', t('Sign in'), async (event) => { event.currentTarget.disabled = true; await post(`/api/agents/${agent.id}/login`); void paint(); }));
      }
      list.append(item);
    }
    onPaint?.(ready, answer);
  };
  const live = () => {
    if (!list.isConnected || poll) return;
    poll = setInterval(() => { if (!document.hidden) void paint(); }, 2500);
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
  };
  const stop = () => { clearInterval(poll); poll = 0; stream?.close(); stream = null; };
  return { node: list, paint, live, stop };
}

// ---- The first time: three steps. The agents (connected once, for every project: a CLI's session
// is this computer's, not a project's), the projects, and which to open now. Over each step, a
// scene of what it is about, moving: the agents come to MADRE and light up as they are connected;
// the folders drop into the lobby; the rooms light up one after another as the beat runs through
// them. Drawn here, from MADRE's own marks; still for whoever asked for less motion.
const SCENE_AGENTS = [['codex', 17, 30], ['claude', 27, 78], ['gemini', 83, 30], ['opencode', 73, 78]];
const FOLDER_GLYPH = '<svg viewBox="0 0 32 26" aria-hidden="true"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h7.2l3 3.2h12.8A2.5 2.5 0 0 1 30 8.7v12.8a2.5 2.5 0 0 1-2.5 2.5h-23A2.5 2.5 0 0 1 2 21.5z" fill="currentColor"/><path d="M2 10h28" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/></svg>';
const BEAT_PATH = 'M0 22H70L78 22L86 6L96 38L104 22H190L198 22L206 6L216 38L224 22H320L328 22L336 6L346 38L354 22H420';
function wizardScene(kind) {
  const scene = el('div', `sm-scene scene-${kind}`);
  scene.setAttribute('aria-hidden', 'true');
  if (kind === 'agents') {
    const wires = svgNode('svg', { class: 'sm-wires', viewBox: '0 0 100 100', preserveAspectRatio: 'none' });
    SCENE_AGENTS.forEach(([id, x, y], index) => {
      wires.append(svgNode('line', { class: 'sm-wire', 'data-agent': id, x1: 50, y1: 54, x2: x, y2: y, 'vector-effect': 'non-scaling-stroke' }));
      const node = el('span', 'sm-scene-node agent');
      node.dataset.agent = id;
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
      node.style.setProperty('--d', `${index * 160}ms`);
      node.append(mark(id, 42));
      scene.append(node);
    });
    const core = el('span', 'sm-scene-node core');
    core.style.left = '50%';
    core.style.top = '54%';
    core.append(mark('madre', 60));
    scene.prepend(wires);
    scene.append(core);
  } else if (kind === 'projects') {
    const tray = el('div', 'sm-tray');
    for (let index = 0; index < 5; index += 1) {
      const slot = el('i', 'sm-slot');
      slot.style.setProperty('--i', String(index));
      tray.append(slot);
      const folder = el('span', 'sm-fly');
      folder.style.setProperty('--i', String(index));
      folder.style.left = `${22 + index * 14}%`;
      folder.innerHTML = FOLDER_GLYPH; // trusted: drawn here
      scene.append(folder);
    }
    scene.append(tray);
  } else {
    const rooms = el('div', 'sm-wins');
    for (let index = 0; index < 3; index += 1) {
      const win = el('span', 'sm-win');
      win.style.setProperty('--i', String(index));
      win.append(el('i', 'sm-win-bar'), el('i', 'sm-win-line'), el('i', 'sm-win-line short'));
      rooms.append(win);
    }
    const beat = svgNode('svg', { class: 'sm-beat', viewBox: '0 0 420 44', preserveAspectRatio: 'none' });
    beat.append(svgNode('path', { d: BEAT_PATH, pathLength: 100, 'vector-effect': 'non-scaling-stroke' }));
    scene.append(rooms, beat);
  }
  return scene;
}
let wizard = null;
function openWizard() {
  if (wizard) return;
  wizard = el('dialog', 'sm-sheet sm-wide sm-wizard');
  const inner = el('div', 'sm-sheet-body');
  wizard.append(inner);
  document.body.append(wizard);
  let step = 0;
  let panel = null;
  let scene = null;
  const steps = [t('Agents'), t('Projects'), t('Open')];
  const KINDS_OF_STEP = ['agents', 'projects', 'open'];
  const stop = () => { panel?.stop(); panel = null; };
  const frame = (title, note, body, actions, { back = false } = {}) => {
    stop();
    inner.replaceChildren();
    const head = el('header', 'sm-sheet-head');
    const dots = el('ol', 'sm-steps');
    steps.forEach((name, index) => { const item = el('li', index === step ? 'on' : index < step ? 'done' : null, name); dots.append(item); });
    head.append(dots, closeKey(() => wizard.close()));
    scene = wizardScene(KINDS_OF_STEP[step]);
    const page = el('div', `sm-step${back ? ' back' : ''}`);
    page.append(el('h3', null, title));
    if (note) page.append(el('p', 'hint', note));
    page.append(body, actions);
    inner.append(head, scene, page);
  };
  async function agentsStep(options) {
    const actions = el('div', 'actions');
    const next = button('sm-btn primary', t('Continue'), () => { step = 1; projectsStep(); });
    actions.append(next);
    const fresh = agentsPanel({
      onPaint: (ready, answer) => {
        next.textContent = ready ? t('Continue') : t('Continue without agents');
        // The scene lights the agents that are connected, and their wire to MADRE.
        for (const agent of answer.agents) {
          const on = agentState(agent, answer).ok;
          scene?.querySelector(`.sm-scene-node[data-agent="${agent.id}"]`)?.classList.toggle('on', on);
          scene?.querySelector(`.sm-wire[data-agent="${agent.id}"]`)?.classList.toggle('on', on);
        }
      },
    });
    frame(t('Connect your agents'), t('MADRE works with the AI tools already on this computer. Each one is connected once, and every project uses it.'), fresh.node, actions, options);
    panel = fresh;
    await fresh.paint();
    fresh.live();
  }
  function projectsStep(options) {
    const actions = el('div', 'actions');
    actions.append(button('sm-btn', t('Back'), () => { step = 0; void agentsStep({ back: true }); }), button('sm-btn primary', t('Continue'), () => { step = 2; openStep(); }));
    frame(t('Add your projects'), t('Choose the folders you work in. Adding them does not open them: you choose which to open in the next step.'), projectPicker({ compact: true }), actions, options);
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
      if (room.open) item.append(el('span', 'sm-tag is-project', t('Already open')));
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
    actions.append(button('sm-btn', t('Back'), () => { step = 1; projectsStep({ back: true }); }), go);
    frame(t('Open what you will use'), t('Each open project runs on this Mac with its own room. The rest stay in the lobby, asleep, until you open them.'), list, actions);
  }
  wizard.addEventListener('close', () => { stop(); wizard.remove(); wizard = null; void loadAgents(); });
  wizard.showModal();
  void agentsStep();
}

// ---- The lobby's settings: what belongs to the lobby and to every project at once. The looks
// (kept in this browser, as the room keeps them), the language (MADRE's, for every room), the
// agents of this computer, and the way back to the first steps. What belongs to one room — its
// turns, its memory, BISHOP's agent and mode — is set in that room.
let settingsSheet = null;
function openSettings(section = null) {
  if (settingsSheet) { settingsSheet.show(section); return; }
  const dialog = el('dialog', 'sm-sheet sm-wide sm-settings');
  const inner = el('div', 'sm-sheet-body');
  const head = el('header', 'sm-sheet-head');
  head.append(el('h3', null, t('Lobby settings')), closeKey(() => dialog.close()));
  inner.append(head);
  const block = (id, title, note) => {
    const node = el('section', 'sm-set');
    node.dataset.section = id;
    node.append(el('h4', null, title));
    if (note) node.append(el('p', 'hint', note));
    inner.append(node);
    return node;
  };
  const row = (words, control) => { const line = el('div', 'sm-set-row'); line.append(el('span', null, words), control); return line; };

  const looks = block('looks', t('Appearance'), t('Kept in this browser, for the lobby and for the room served at this address.'));
  const looksRows = el('div', 'sm-set-rows');
  looks.append(looksRows);
  const languages = el('div', 'sx-seg');
  for (const [code, name] of [['es', 'Español'], ['en', 'English']]) {
    const one = button(null, name, async () => {
      if (code === language) return;
      try { localStorage.setItem('pulse.language', code); } catch { /* no storage */ }
      await post('/api/language', { language: code });
      location.reload();
    });
    one.setAttribute('role', 'radio');
    one.setAttribute('aria-checked', String(code === language));
    languages.append(one);
  }
  const paintLooks = () => looksRows.replaceChildren(row(t('Theme'), themeSeg()), row(t('Accent'), swatches()), row(t('Language'), languages));
  paintLooks();

  const agents = block('agents', t('Agents'), t('MADRE works with the AI tools already on this computer. Each one is connected once, and every project uses it.'));
  const panel = agentsPanel();
  agents.append(panel.node);

  const bishop = block('bishop', 'BISHOP', t('Its agent and its mode are chosen in its own room.'));
  const bishopKeys = el('div', 'sm-set-keys');
  bishopKeys.append(button('sm-btn ghost small', t('Talk to BISHOP'), () => { dialog.close(); openBishop(); }), button('sm-btn ghost small', t('Open BISHOP in a new tab'), () => openBishop({ newTab: true })));
  bishop.append(bishopKeys);

  const projects = block('projects', t('Projects'), null);
  const projectKeys = el('div', 'sm-set-keys');
  projectKeys.append(button('sm-btn ghost small', t('Add a project'), () => { dialog.close(); openAddSheet(); }), button('sm-btn ghost small', t('See the welcome again'), () => { dialog.close(); welcomed = true; openWizard(); }));
  projects.append(projectKeys);

  dialog.append(inner);
  document.body.append(dialog);
  const show = (wanted) => {
    if (!dialog.open) dialog.showModal();
    if (wanted) inner.querySelector(`[data-section="${wanted}"]`)?.scrollIntoView({ block: 'start' });
  };
  settingsSheet = { show, paintLooks };
  dialog.addEventListener('close', () => { panel.stop(); dialog.remove(); settingsSheet = null; });
  show(section);
  void panel.paint().then(() => panel.live());
}
ui.gear.addEventListener('click', () => openSettings());

function translateStatic() {
  document.title = `MADRE · ${t('Lobby')}`;
  ui.title.textContent = t('Lobby');
  ui.add.textContent = t('Add a project');
  ui.back.title = t('Back to the room');
  ui.back.setAttribute('aria-label', t('Back to the room'));
  ui.stop.querySelector('span').textContent = t('Stop all');
  ui.macro.querySelector('span').textContent = t('Macroverse');
  ui.gear.title = t('Lobby settings');
  ui.gear.setAttribute('aria-label', t('Lobby settings'));
  ui.search.placeholder = t('Search a project…');
  ui.search.setAttribute('aria-label', t('Search a project…'));
  ui.filter.setAttribute('aria-label', t('Show'));
  const FILTER_WORDS = { all: t('All projects'), open: t('Open projects'), asleep: t('Asleep projects') };
  for (const choice of ui.filter.querySelectorAll('[data-filter]')) choice.textContent = FILTER_WORDS[choice.dataset.filter];
  ui.bishop.go.textContent = t('Talk to BISHOP');
  ui.bishop.tab.title = t('Open BISHOP in a new tab');
  ui.bishop.tab.setAttribute('aria-label', t('Open BISHOP in a new tab'));
  ui.bishop.about.textContent = t('Your super agent. It reads across your projects, signs the links between them and carries an order from one to another.');
  ui.work.title.textContent = t('The last work');
  ui.work.again.textContent = t('Summarise again');
  ui.waiting.title.textContent = t('Waiting on you');
  ui.linksTileTitle.textContent = t('Links');
  ui.link.textContent = t('Link projects');
  ui.linksAll.textContent = t('See the links');
  ui.linksTitle.textContent = t('Links');
  ui.linksClose.setAttribute('aria-label', t('Close'));
  ui.linkMore.textContent = t('Link projects');
  ui.memory.title.textContent = t('Memory');
  ui.decisions.title.textContent = t('Recent decisions');
  ui.attention.title.textContent = t('Needs you');
  for (const kind of KINDS) KIND_WORDS[kind] = t(kind.toUpperCase());
}

translateStatic();
drawWork();
drawDecisions();
await refresh();
void loadAgents();
void loadVersion();
void loadWork();
void loadDecisions();
// `#welcome`: the first-run wizard again, on purpose (to connect an agent or add projects in steps).
if (location.hash === '#welcome') { history.replaceState(null, '', location.pathname); welcomed = true; openWizard(); }
// Sent here for the Macroverso (the key in BISHOP's room): straight into it, on a large screen.
if (location.hash === '#macroverso' && data && !ui.macro.hidden) { history.replaceState(null, '', location.pathname); ui.macro.click(); }
timer = setInterval(() => { if (!document.hidden && !busy.size) void refresh(); }, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { void refresh(); void loadAgents(); void loadWork(); void loadDecisions(); } });
// The decisions are asked again every few minutes (the route itself asks the rooms no oftener).
setInterval(() => { if (!document.hidden) void loadDecisions(); }, 5 * 60 * 1000);
