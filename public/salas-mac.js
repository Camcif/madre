// SALAS on the Mac: every room this Mac knows, open or asleep, in one place (docs/MACROVERSO.md,
// phase 1). The room that serves this page answers for all of them (src/salas.mjs): it lists
// them, opens one that is asleep, asks one to close, and stops every agent in every room. A room
// opens at its own address; holding ⌘ opens it beside this one.
//
// The phone has its own SALAS (salas.js), served by the bridge; the two read the same rooms.

import { setLanguage, t } from './i18n.js';
import { brandOf, monogram } from './brands.js';
import { startReviewAsk } from './review-ask.js';
import { startTour } from './tour.js';
import { dropStickyHover } from './touch.js';

// Where nothing can hover (a tablet), a tapped key does not stay lit (public/touch.js).
dropStickyHover();
import { creep, finishLoader, makeLoader, setLoader, showCurtain } from './loader.js';

const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const ui = {
  title: $('sm-title'), stop: $('sm-stop'), macro: $('sm-macro'), foot: $('sm-foot'), colophon: $('sm-colophon'), gear: $('sm-gear'),
  bar: { backRoom: $('sm-back-room'), crumb: $('sm-crumb'), live: $('sm-live'), open: $('sm-tb-open'), agents: $('sm-tb-agents'), waiting: $('sm-tb-waiting'), update: $('sm-tb-update'), links: $('sm-tb-links'), linksCount: $('sm-tb-links-count'), reload: $('sm-reload') },
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
const forgetting = new Set();  // room ids whose card asks before leaving MADRE
const failed = new Map();      // room id → what went wrong, said on its card
const revoking = new Set();    // link ids whose row asks before revoking

// The room's looks, from this browser: the same keys the room's own page keeps (app.js, LOOKS),
// so a choice made here is the room's too when the room is served at this address.
const ACCENTS = ['madre', 'mountain', 'caribbean', 'phantom', 'malbec', 'dijon', 'pacific', 'love', 'sierra', 'pitahaya', 'papaya', 'agave', 'dinamo', 'marina', 'pulso', 'leal', 'dulce'];
const ACCENT_WORDS = { madre: () => t('Madre green'), mountain: () => t('Mountain green'), caribbean: () => t('Caribbean blue'), phantom: () => t('Phantom purple'), malbec: () => t('Malbec red'), dijon: () => t('Dijon yellow'), pacific: () => t('Pacific blue'), love: () => t('Love pink'), sierra: () => t('Sierra blue'), pitahaya: () => 'Pitahaya', papaya: () => 'Papaya', agave: () => 'Agave', dinamo: () => t('Dynamo black'), marina: () => t('Marina blue'), pulso: () => t('Pulse green'), leal: () => t('Loyal orange'), dulce: () => t('Sweet yellow') };
// The wallpapers are the room's (app.js, LOOKS.wallpaper; styles.css, --wp-*): the same images, the
// same veil, the same «mesh» and blur the room's PERSONALIZE sets, read from the same keys.
const WALLPAPERS = ['default', 'jarrito', 'canela', 'paradise', 'ventura', 'magna', 'biznaga', 'oceano', 'quila', 'xico', 'tropical', 'tradicion', 'urbania'];
const WALLPAPER_WORDS = { default: () => t('Default'), jarrito: () => 'Jarrito', canela: () => 'Canela', paradise: () => t('Paradise'), ventura: () => 'Ventura', magna: () => 'Magna', biznaga: () => 'Biznaga', oceano: () => 'Oceano', quila: () => 'Quila', xico: () => 'Xico', tropical: () => 'Tropical', tradicion: () => 'Tradicion', urbania: () => 'Urbania' };
// The conversation's own looks (app.js, LOOKS.bubbles and LOOKS.text): the lobby has no
// conversation, so here they are only chosen, for the room served at this address.
const BUBBLES = ['comfortable', 'large', 'compact', 'fitted'];
const TEXTS = ['comfortable', 'larger', 'smaller', 'visual'];
// The photographs' two dials, as the room keeps them (app.js, TUNES): the first value is no key.
const TUNES = {
  veil: { key: 'pulse.wallpaper.veil', min: 0, max: 140, step: 5, value: 100, shown: (v) => `${v}%`, apply: (v) => root.style.setProperty('--veil-k', String(v / 100)) },
  blur: { key: 'pulse.wallpaper.blur', min: 0, max: 24, step: 1, value: 0, shown: (v) => `${v}px`, apply: (v) => root.style.setProperty('--wp-blur', `${v}px`) },
};
// Home's own choices (2026-10-11): how its project cards read, how large its text is and in which
// order the projects come. Kept in this browser for Home alone: a project keeps its conversation's
// (bubbles and text) in its own Settings. The first value of each is Home as it always was.
const HOME_LOOKS = {
  cards: { key: 'pulse.home.cards', values: ['full', 'compact'], words: { full: () => t('With their last conversation'), compact: () => t('Name and state only') } },
  text: { key: 'pulse.home.text', values: ['comfortable', 'larger', 'smaller'], words: { comfortable: () => t('Comfortable'), larger: () => t('Larger'), smaller: () => t('Smaller') } },
  order: { key: 'pulse.home.order', values: ['attention', 'name', 'recent'], words: { attention: () => t('Attention'), name: () => t('Name'), recent: () => t('Recent') } },
};
const LOOK_KEYS = ['pulse.theme', 'pulse.accent', 'pulse.wallpaper', 'pulse.wallpaper.style', 'pulse.wallpaper.veil', 'pulse.wallpaper.blur', 'pulse.bubbles', 'pulse.text', ...Object.values(HOME_LOOKS).map((one) => one.key)];
function readLooks() {
  let theme = 'auto';
  let accent = null;
  let wallpaper = null;
  let style = null;
  let veil = null;
  let blur = null;
  let bubbles = null;
  let text = null;
  try {
    theme = localStorage.getItem('pulse.theme') ?? 'auto'; accent = localStorage.getItem('pulse.accent'); wallpaper = localStorage.getItem('pulse.wallpaper');
    style = localStorage.getItem('pulse.wallpaper.style'); veil = localStorage.getItem('pulse.wallpaper.veil'); blur = localStorage.getItem('pulse.wallpaper.blur');
    bubbles = localStorage.getItem('pulse.bubbles'); text = localStorage.getItem('pulse.text');
  } catch { /* no storage */ }
  const number = (raw, low, high, fallback) => { const value = raw === null ? Number.NaN : Number(raw); return Number.isFinite(value) && value >= low && value <= high ? value : fallback; };
  return {
    theme: ['auto', 'light', 'dark'].includes(theme) ? theme : 'auto',
    accent: ACCENTS.includes(accent) ? accent : 'madre',
    wallpaper: WALLPAPERS.includes(wallpaper) ? wallpaper : 'default',
    style: style === 'mesh' ? 'mesh' : 'veil',
    veil: number(veil, 0, 140, 100),
    blur: number(blur, 0, 24, 0),
    bubbles: BUBBLES.includes(bubbles) ? bubbles : BUBBLES[0],
    text: TEXTS.includes(text) ? text : TEXTS[0],
    home: Object.fromEntries(Object.entries(HOME_LOOKS).map(([name, spec]) => {
      let value = null;
      try { value = localStorage.getItem(spec.key); } catch { /* no storage */ }
      return [name, spec.values.includes(value) ? value : spec.values[0]];
    })),
  };
}
function applyLooks() {
  const { theme, accent } = readLooks();
  const light = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme; else delete root.dataset.theme;
  root.dataset.scheme = theme === 'auto' ? (light ? 'light' : 'dark') : theme;
  if (accent !== 'madre') root.dataset.accent = accent; else delete root.dataset.accent;
  // The wallpaper, its style and its two dials, as the room applies them (app.js, applyLook, TUNES).
  const looks = readLooks();
  if (looks.wallpaper !== 'default') root.dataset.wallpaper = looks.wallpaper; else delete root.dataset.wallpaper;
  if (looks.style === 'mesh') root.dataset.wpStyle = 'mesh'; else delete root.dataset.wpStyle;
  root.style.setProperty('--veil-k', String(looks.veil / 100));
  root.style.setProperty('--wp-blur', `${looks.blur}px`);
  if (looks.bubbles !== BUBBLES[0]) root.dataset.bubbles = looks.bubbles; else delete root.dataset.bubbles;
  if (looks.text !== TEXTS[0]) root.dataset.text = looks.text; else delete root.dataset.text;
  // Home's own: its cards and its text (salas-mac.css, data-home-*); the order is draw()'s.
  if (looks.home.cards !== 'full') root.dataset.homeCards = looks.home.cards; else delete root.dataset.homeCards;
  if (looks.home.text !== 'comfortable') root.dataset.homeText = looks.home.text; else delete root.dataset.homeText;
}
applyLooks();
function saveLooks({ theme, accent, wallpaper, style, bubbles, text }) {
  // The first value of each look is the room as it always was, kept as no choice at all (app.js, saveLook).
  const keep = (key, value, first) => { if (value === first) localStorage.removeItem(key); else localStorage.setItem(key, value); };
  try {
    if (theme) localStorage.setItem('pulse.theme', theme);
    if (accent) keep('pulse.accent', accent, 'madre');
    if (wallpaper) keep('pulse.wallpaper', wallpaper, 'default');
    if (style) keep('pulse.wallpaper.style', style, 'veil');
    if (bubbles) keep('pulse.bubbles', bubbles, BUBBLES[0]);
    if (text) keep('pulse.text', text, TEXTS[0]);
  } catch { /* the choice lasts as long as the page */ }
  applyLooks();
  settingsSheet?.paintLooks();
}
function saveHome(name, value) {
  const spec = HOME_LOOKS[name];
  try { if (value === spec.values[0]) localStorage.removeItem(spec.key); else localStorage.setItem(spec.key, value); } catch { /* the choice lasts as long as the page */ }
  applyLooks();
  if (name === 'order' && typeof draw === 'function') draw();
  settingsSheet?.paintLooks();
}
// A dial is saved when it is let go and shown while it moves; the sheet is not painted again under
// the hand (app.js, saveTune).
function saveTune(name, value) {
  try { if (value === TUNES[name].value) localStorage.removeItem(TUNES[name].key); else localStorage.setItem(TUNES[name].key, String(value)); } catch { /* the choice lasts as long as the page */ }
  applyLooks();
}
window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', applyLooks);
window.addEventListener('storage', (event) => { if (LOOK_KEYS.includes(event.key)) { applyLooks(); settingsSheet?.paintLooks(); } });

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};

// The same small words as the phone's SALAS (salas.js).
const chatName = (title) => (title === 'First conversation' ? t('First conversation') : title === 'Untitled' ? t('Untitled') : title === 'Coordinator' ? t('Coordinator') : title);
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
// The modes as the room names them (app.js, MODES): asked when shown, so the language is the page's.
const modeName = (n) => [t('INCOGNITO'), t('CHAT ONLY'), t('CREATE'), t('EDIT'), t('FULL ACCESS')][n] ?? '';
function askLine(ask) {
  if (ask.kind === 'mode') return t('@{agent} asks for #{n} {label}', { agent: ask.agent, n: ask.mode, label: modeName(ask.mode) });
  if (ask.kind === 'run') return ask.text ? t('@{agent} wants to run {line}', { agent: ask.agent, line: ask.text }) : t('@{agent} wants to run a command', { agent: ask.agent });
  if (ask.kind === 'bishop') return t('The Coordinator proposes #{n} to @{agent}: unlock it with your key', { n: ask.mode, agent: ask.agent });
  if (ask.kind === 'plan') return ask.text ? t('The Coordinator waits for your press: {reason}', { reason: ask.text }) : t('The Coordinator waits for your press');
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
  if (glance.outdated) return { key: 'outdated', words: t('Update MADRE in this project to see it here.') };
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
  // To the bar: dragged there, or pinned from its right-click.
  node.draggable = true;
  node.addEventListener('dragstart', (event) => pinsDragOut(event, room));
  node.addEventListener('dragend', () => pinsDropEnd());
  node.addEventListener('contextmenu', (event) => pinsMenu(event, room));

  const head = el('header', 'sm-card-head');
  head.append(el('h3', null, room.name));
  if (room.here) head.append(el('span', 'sm-chip here', t('You are here')));
  else if (room.open) head.append(el('span', 'sm-chip port', `:${room.open.port}`));
  // What the right-click offers, for whoever does not right-click: a key of its own.
  const more = button('sm-card-more', null, (event) => {
    event.stopPropagation();
    const box = more.getBoundingClientRect();
    pinsMenu(event, room, { x: box.right - 214, y: box.bottom + 6 });
  });
  more.innerHTML = MORE_ICON; // trusted: our own SVG string
  more.title = t('Options for {name}', { name: room.name });
  more.setAttribute('aria-label', more.title);
  more.setAttribute('aria-haspopup', 'menu');
  head.append(more);
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
  if (doing) actions.append(waitFor(room.id, { starting: t('Waking…'), closing: t('Closing…'), forgetting: t('Removing…') }[doing] ?? ''));
  else if (forgetting.has(room.id)) {
    // Taking it out of MADRE says what goes and what stays before it happens.
    const links = (data.enlaces ?? []).filter((one) => one.rooms?.a === room.id || one.rooms?.b === room.id).length;
    const why = [
      room.open ? t('It closes and leaves Home.') : t('It leaves Home.'),
      t('Its folder stays on this Mac, and its memory in MADRE.'),
      ...(links ? [links === 1 ? t('Its connection ends.') : t('Its {n} connections end.', { n: links })] : []),
    ].join(' ');
    actions.append(el('span', 'sm-ask', why), button('sm-btn danger small', t('Remove'), () => void forgetRoom(room)), button('sm-btn ghost small', t('Cancel'), () => { forgetting.delete(room.id); draw(); }));
  } else if (asking.has(room.id)) {
    const why = room.here ? t('This page closes with it.') : glance.working?.length ? t('What is running stops.') : t('Nothing is running.');
    actions.append(el('span', 'sm-ask', why), button('sm-btn danger small', t('Close it'), () => closeRoom(room)), button('sm-btn ghost small', t('Cancel'), () => { asking.delete(room.id); draw(); }));
  } else if (room.open) {
    const go = el('a', 'sm-btn primary small', room.here ? t('Back to the project') : t('Open'));
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
  // The order Home's Appearance chose: what needs the person first (as above), by name, or by the
  // last thing that happened in each, open or asleep.
  const order = readLooks().home.order;
  const touched = (room) => Math.max(Date.parse(room.glance?.chat?.at ?? 0) || 0, Date.parse(room.lastOpened ?? room.added ?? 0) || 0);
  const all = order === 'name' ? [...projects].sort((a, b) => a.name.localeCompare(b.name, language))
    : order === 'recent' ? [...projects].sort((a, b) => touched(b) - touched(a))
      : [...open, ...asleep];
  return { all, open, asleep };
}
function draw() {
  if (!data) return;
  const { all, open } = projectsInOrder();
  drawBishop(data.rooms.find((room) => room.id === data.salas) ?? null);
  drawWaiting();
  drawProjects(all);
  if (!all.length && !welcomed) { welcomed = true; void homeTour.loaded.then((answer) => { if (!answer?.owed) openWizard(); }); }
  welcomeHome();
  const working = open.some((room) => room.glance?.working?.length);
  ui.stop.hidden = !working;
  drawLinks(all);
  drawMemory();
  drawAttention();
  drawTopbar();
  // The macroverse wants a large screen: on a small one SALAS is the whole of it.
  ui.macro.hidden = !data.rooms.length || window.innerWidth < 900;
  macro?.update(data.rooms, data.enlaces ?? []);
  settingsSheet?.sync();
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
  if (rooms.length > 2) ui.waiting.body.append(el('p', 'sm-hint', t('And {n} more projects.', { n: rooms.length - 2 })));
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
  ui.memory.body.append(legend, el('p', 'sm-hint', [sum.memories ? t('{n} travel', { n: sum.travelling }) : null, t('Counted in the open projects.')].filter(Boolean).join(' · ')));
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
  drawTopbar();
  settingsSheet?.sync();
}
// MADRE itself: the version this room runs and the newest one it knows of.
// Asked again every hour (the server asks npm at most once a day); the first time a newer MADRE
// shows up while Home is open, it says so once, and the pill stays in the bar.
let versionAnnounced = null;
async function loadVersion() {
  const answer = await fetch('/api/version', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer) return;
  versionSeen = answer;
  if (answer.available && answer.latest && versionAnnounced !== answer.latest) {
    versionAnnounced = answer.latest;
    toast(t('MADRE {version} is out. Update it from the bar.', { version: answer.latest }), 'look');
  }
  drawAttention();
  drawTopbar();
  settingsSheet?.sync();
}
setInterval(() => { if (!document.hidden) void loadVersion(); }, 60 * 60 * 1000);

// The open projects that run an older MADRE than Home: Home was updated, they were not restarted.
const versionParts = (value) => String(value ?? '').split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
function olderVersion(a, b) {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0);
  return false;
}
function behindRooms() {
  if (!data?.version) return [];
  return data.rooms.filter((room) => room.open?.version && !room.here && room.id !== data.salas && olderVersion(room.open.version, data.version) && !busy.has(room.id));
}
// A project restarted with the MADRE Home runs: closed, then opened again where it was.
async function restartRoom(room) {
  await closeRoom(room);
  if (data?.rooms.find((one) => one.id === room.id)?.open) return;
  await startRoom(room);
}

// NEEDS YOU: what the person would want to know before anything else, from what the rooms, the
// agents and MADRE itself say: a room on an older MADRE or not answering, an agent without a
// session, a link about to expire, a newer MADRE. Nothing listed is a guess.
function attentionItems() {
  const items = [];
  for (const room of data?.rooms ?? []) {
    if (!room.open) continue;
    const name = roomLabel(room);
    if (room.glance?.outdated) items.push({ tone: 'wait', words: t('{room} runs an older MADRE.', { room: name }), hint: t('Update it to see it here and to connect it.'), href: addressOf(room), go: t('Open') });
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
    items.push({ tone: 'wait', words: t('The connection {reader} ← {source} ends {when}.', { reader: roomName(reader), source: roomName(source), when: ago(enlace.expires) }), hint: t('Sign it again if it should go on.'), act: () => ui.linksSheet.showModal(), go: t('See the connections') });
  }
  if (versionSeen?.available && versionSeen.latest) items.push({ tone: 'ok', words: t('MADRE {version} is out.', { version: versionSeen.latest }), hint: t('You run {version}. Home restarts with it from here.', { version: versionSeen.current }), act: () => openSettings('release'), go: t('Update') });
  // After Home updated, the projects that stayed open still run the version they started with.
  for (const room of behindRooms()) items.push({ tone: 'wait', words: t('{room} runs MADRE {version}.', { room: roomLabel(room), version: room.open.version }), hint: t('Restart it to bring it to {latest}: what is running stops.', { latest: data.version }), act: () => void restartRoom(room), go: t('Restart') });
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
    words.append(el('b', null, t('All in order.')), el('span', null, t('No project, agent or connection needs you.')));
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
  if (!decisions) { list.append(el('li', 'sm-hint', t('Reading the open projects…'))); return; }
  if (!decisions.length) { list.append(el('li', 'sm-hint', t('No decisions yet in the open projects. When an archive keeps one, it shows here.'))); return; }
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
  // The Coordinator's own project is named as the Coordinator, in the reader's language.
  const tag = el(room?.open ? 'a' : 'span', 'sm-chip port sm-tag-room', id === data?.salas ? t('Coordinator') : name);
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
const roomLabel = (room) => (room.id === data?.salas ? t('Coordinator') : room.name);
const roomName = (id) => { const room = data?.rooms.find((one) => one.id === id); return room ? roomLabel(room) : id === data?.salas ? t('Coordinator') : id; };
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
  if (enlace.signed?.by === 'bishop') what.push(t('signed by the Coordinator'));
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
  recall.append(recallBox, document.createTextNode(t('Always include (up to 3 notes)')));
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
    : enough ? t('No connections yet.') : t('Add a project to connect it.');
  ui.linksNote.textContent = t('A connection lets one project read the distilled notes of another, read-only, by a contract you sign here. Nothing is written across, and only notes that travel into turns cross.');
  ui.links.replaceChildren(...enlaces.map(linkRow));
  drawMapLegend(enlaces);
  if (!enlaces.length && ui.linksSheet.open) ui.linksSheet.close();
  drawMap(projects, enlaces);
}
// Under the map, each connection in words, who looks up whom (2026-10-11): the first two, and how
// many more there are; the whole list is one press away.
const mapLegend = el('ul', 'sm-map-legend');
function drawMapLegend(enlaces) {
  if (!mapLegend.isConnected) ui.map.after(mapLegend);
  mapLegend.replaceChildren();
  mapLegend.hidden = !enlaces.length;
  const said = (enlace) => {
    const { source, reader } = endsOf(enlace);
    if (enlace.direction === 'both') return sayBold('{a} and {b} look each other up', { a: roomName(enlace.rooms.a), b: roomName(enlace.rooms.b) });
    if (reader === data.salas) return sayBold('The Coordinator looks up {source}', { source: roomName(source) });
    return sayBold('{reader} looks up {source}', { reader: roomName(reader), source: roomName(source) });
  };
  for (const enlace of enlaces.slice(0, 2)) {
    const line = el('li');
    const words = el('span', 'says');
    words.append(said(enlace));
    line.append(el('i'), words);
    if (enlace.orders?.allowed) line.append(el('span', 'sm-map-orders', t('orders up to #{n}', { n: enlace.orders.maxMode })));
    mapLegend.append(line);
  }
  if (enlaces.length > 2) mapLegend.append(el('li', 'more', t('and {n} more', { n: enlaces.length - 2 })));
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
// lobby's order), and a wire for each contract in force, from the room that serves to the one
// that reads, the notes running along it the way they travel. Drawn at the tile's own size
// (2026-10-11), so the names read at their real size: the projects a connection touches are
// drawn whole and named in full; the rest stay quiet round the edge, a dashed ring when asleep.
// Nothing here is drawn that the contracts do not say.
const SVG = 'http://www.w3.org/2000/svg';
const svgNode = (tag, attributes = {}) => {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
};
let mapDrawn = null;
function drawMap(projects, enlaces) {
  mapDrawn = { projects, enlaces };
  ui.map.replaceChildren();
  if (!projects.length) { ui.map.append(el('p', 'sm-hint', t('Your projects show here, round the Coordinator, with the connections between them.'))); return; }
  const box = ui.map.getBoundingClientRect();
  const W = Math.max(220, Math.round(box.width || 320)), H = Math.max(140, Math.round(box.height || 200));
  const cx = W / 2, cy = H / 2 - 4;
  const shown = projects.slice(0, 10);
  const linked = new Set(enlaces.flatMap((enlace) => [enlace.rooms.a, enlace.rooms.b]));
  const rx = Math.max(64, W / 2 - 50), ry = Math.max(36, H / 2 - 26);
  // The Coordinator's halo (drawn while it is connected) is part of its body for the wires.
  const at = new Map([[data.salas, { x: cx, y: cy, r: 17, pad: linked.has(data.salas) ? 7 : 0, up: false }]]);
  shown.forEach((room, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / shown.length + (shown.length === 2 ? Math.PI / 2 : 0);
    const memories = room.glance?.census?.memories ?? 0;
    const r = (room.open ? 6 + Math.min(4, Math.sqrt(memories) / 3) : 5.5) + (linked.has(room.id) ? 1 : 0);
    // A name above its body in the upper half, below it in the lower, so none runs into the middle.
    at.set(room.id, { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry, r, up: Math.sin(angle) < -0.35 });
  });
  const svg = svgNode('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  svg.setAttribute('aria-label', ui.linksSum.textContent);
  const defs = svgNode('defs');
  const arrow = svgNode('marker', { id: 'sm-arrow', viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 7, markerHeight: 7, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' });
  arrow.append(svgNode('path', { d: 'M1 1.5L8 5L1 8.5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  defs.append(arrow);
  svg.append(defs);
  // From the edge of one body to the edge of the other.
  const edges = (from, to, gapFrom = 3, gapTo = 4) => {
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
    const ux = dx / length, uy = dy / length;
    const reach = (spot, gap) => spot.r + (spot.pad ?? 0) + gap;
    return { start: { x: from.x + ux * reach(from, gapFrom), y: from.y + uy * reach(from, gapFrom) }, end: { x: to.x - ux * reach(to, gapTo), y: to.y - uy * reach(to, gapTo) } };
  };
  const centre = at.get(data.salas);
  for (const room of shown) {
    const { start, end } = edges(centre, at.get(room.id), 2, 2);
    svg.append(svgNode('line', { class: `spoke${linked.has(room.id) ? ' linked' : ''}`, x1: start.x.toFixed(1), y1: start.y.toFixed(1), x2: end.x.toFixed(1), y2: end.y.toFixed(1) }));
  }
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  enlaces.forEach((enlace, index) => {
    const { source, reader } = endsOf(enlace);
    const from = at.get(source), to = at.get(reader);
    if (!from || !to) return;
    const { start, end } = edges(from, to);
    // With the Coordinator at one end the wire runs straight along its spoke; between two
    // projects it bows outwards, away from the middle, so it never crosses the Coordinator.
    let d = `M${start.x.toFixed(1)} ${start.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    if (source !== data.salas && reader !== data.salas) {
      const mx = (start.x + end.x) / 2, my = (start.y + end.y) / 2;
      const ox = mx - cx, oy = my - cy, out = Math.hypot(ox, oy) || 1;
      d = `M${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${(mx + (ox / out) * 34).toFixed(1)} ${(my + (oy / out) * 34).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    }
    const id = `sm-wire-${index}`;
    const wire = svgNode('path', { id, class: 'wire', d, 'marker-end': 'url(#sm-arrow)' });
    if (enlace.direction === 'both') wire.setAttribute('marker-start', 'url(#sm-arrow)');
    svg.append(wire);
    if (still) return;
    // The notes on their way: two dots one after the other, back the other way too when both read.
    const ways = enlace.direction === 'both' ? [['0;1', 0], ['1;0', 1.2]] : [['0;1', 0]];
    for (const [points, offset] of ways) {
      for (const lag of [0, 1.2]) {
        const dot = svgNode('circle', { class: 'note', r: 2.6, opacity: 0 });
        const begin = `${(lag + offset + index * 0.4).toFixed(1)}s`;
        const move = svgNode('animateMotion', { dur: '2.4s', repeatCount: 'indefinite', begin, keyPoints: points, keyTimes: '0;1', calcMode: 'linear' });
        const along = svgNode('mpath');
        along.setAttribute('href', `#${id}`);
        move.append(along);
        dot.append(move, svgNode('animate', { attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;.15;.85;1', dur: '2.4s', repeatCount: 'indefinite', begin }));
        svg.append(dot);
      }
    }
  });
  for (const room of shown) {
    const spot = at.get(room.id);
    const on = linked.has(room.id);
    const body = svgNode('circle', { class: `node${room.open ? '' : ' asleep'}${on ? ' linked' : ''}${room.glance?.waitingCount ? ' waiting' : ''}`, cx: spot.x.toFixed(1), cy: spot.y.toFixed(1), r: spot.r.toFixed(1) });
    const title = svgNode('title');
    title.textContent = `${room.name} · ${stateOf(room).words}`;
    body.append(title);
    const name = svgNode('text', { class: `label${on ? ' linked' : ''}`, x: spot.x.toFixed(1), y: (spot.up ? spot.y - spot.r - 6 : spot.y + spot.r + 13).toFixed(1), 'text-anchor': 'middle' });
    name.textContent = room.name.length > 16 ? `${room.name.slice(0, 15)}…` : room.name;
    svg.append(body, name);
  }
  // BISHOP, in its own colours, with its own mark (brands.js), and a halo while it is connected.
  const brand = brandOf('bishop');
  const hub = svgNode('g', { class: `bishop${linked.has(data.salas) ? ' linked' : ''}` });
  if (linked.has(data.salas)) hub.append(svgNode('circle', { class: 'halo', cx, cy, r: 23 }));
  hub.append(svgNode('circle', { cx, cy, r: 17, fill: brand.solid ?? brand.color }));
  const face = svgNode('g', { transform: `translate(${cx - 10.5} ${cy - 10.5})`, color: brand.ink });
  face.innerHTML = brand.mark(); // trusted: our own SVG string from brands.js
  face.firstElementChild?.setAttribute('width', '21');
  face.firstElementChild?.setAttribute('height', '21');
  hub.append(face);
  svg.append(hub);
  ui.map.append(svg);
}
// The tile changes size with the window: the map is drawn again at the new size.
if (typeof ResizeObserver === 'function') {
  let drawnAt = '';
  new ResizeObserver(() => {
    const box = ui.map.getBoundingClientRect();
    const size = `${Math.round(box.width)}x${Math.round(box.height)}`;
    if (!box.width || size === drawnAt || !mapDrawn) return;
    drawnAt = size;
    drawMap(mapDrawn.projects, mapDrawn.enlaces);
  }).observe(ui.map);
}

// THE WELCOME OF 1.0 (public/tour.js): the bonjour the first time, the chapters after it, the pill
// that waits in the bar, `?` for the gestures, and the hint on Connections. In Home, «Take me
// there» opens what lives here; for what lives inside a project it opens the one open most
// recently, if any is. A new person is handed to the wizard (agents, projects, open) first.
const agentsReady = () => (agentsSeen?.agents ?? []).some((agent) => agent.id !== 'madre' && agentState(agent, agentsSeen).ok);
const intoAProject = () => {
  const room = data ? projectsInOrder().open[0] : null;
  return room ? () => leaveTo(addressOf(room)) : undefined;
};
const homeTour = startTour({
  page: 'home',
  pillSlot: $('sm-tour-pill'),
  soon: () => (data?.phonePreview ? [] : ['phone']),
  ready: () => Boolean(data) && !wizard && !sheet,
  welcome: { needed: () => !projectsInOrder().all.length || !agentsReady(), open: (then) => { welcomed = true; openWizard({ then }); } },
  onProjects: () => void refresh(),
  go: {
    get project() { return intoAProject(); },
    get talk() { return intoAProject(); },
    get modes() { return intoAProject(); },
    get modules() { return intoAProject(); },
    get phone() { return intoAProject(); },
    coordinator: () => openBishop(),
    links: () => openLinkSheet(),
    get maps() { return ui.macro.hidden ? undefined : () => ui.macro.click(); },
    settings: () => openSettings(),
    gestures: () => homeTour.openGestures(),
  },
});
// Once Home has drawn: the bonjour if it is owed; if it was given, the hint on Connections — what
// it is, and, for whoever came from 0.7.2, what the word meant before.
let welcomeAsked = false;
function welcomeHome() {
  if (welcomeAsked) return;
  welcomeAsked = true;
  void homeTour.loaded.then(async (answer) => {
    if (answer?.owed) { await homeTour.maybeBonjour(); return; }
    if (!answer?.state?.bonjourAt) return;
    setTimeout(() => {
      const tile = $('sm-links-tile');
      if (!tile || tile.hidden || document.querySelector('dialog[open]')) return;
      void homeTour.hint('links', tile.querySelector('.sm-tile-head') ?? tile, {
        title: t('Connections'),
        text: homeTour.path() === 'back'
          ? t('A connection lets one project look up what another learned, by a contract you sign. In 0.7.2 «Connections» was signing your agents in: that is now in Settings › Agents.')
          : t('A connection lets one project look up what another learned, by a contract you sign. Nothing is written across.'),
      });
    }, 2200);
  });
}

// LINKING TWO ROOMS, step by step. A link lets one room read the notes of another; nothing is
// written across. The assistant asks one thing at a time, in the room's own material — the step,
// the question and what it decides; the choices on a card, each saying what it does, the safe one
// marked; and, under every step, the link as it stands so far, in words: who serves, what crosses,
// who reads, until when, how the notes arrive, whether orders go. Safe from the start: a week,
// decisions and facts, notes read only when asked, no orders. Orders appear only with BISHOP on
// one side, off, and ask for the room's designation typed, as arming #3 does. It warns when the
// room that serves is asleep or older, and says the whole contract before it is signed.
const LINK_KINDS = ['decision', 'fact', 'preference', 'question'];
const LINK_KIND_NOTES = { decision: () => t('What was agreed: the choices the project made.'), fact: () => t('What is known: data and findings the project settled.'), preference: () => t('How you like to work: conventions and tastes.'), question: () => t('What is open: questions still waiting for an answer.') };
const LINK_DAYS = [[1, () => t('A day')], [7, () => t('A week')], [30, () => t('30 days')], [0, () => t('No expiry')]];
let sheet = null;
// A sentence whose project names stand out (2026-10-11): the slots named in `bold` (all of them,
// unless said) are written in bold, the rest as the catalogue says it.
function sayBold(key, vars, bold = Object.keys(vars)) {
  const out = document.createDocumentFragment();
  const template = t(key);
  let at = 0;
  for (const match of template.matchAll(/\{(\w+)\}/g)) {
    out.append(template.slice(at, match.index));
    const value = Object.hasOwn(vars, match[1]) ? String(vars[match[1]]) : match[0];
    out.append(bold.includes(match[1]) ? el('b', null, value) : value);
    at = match.index + match[0].length;
  }
  out.append(template.slice(at));
  return out;
}
const ALLOWED_GLYPH = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.4l3.2 3.1L15 6.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NOT_ALLOWED_GLYPH = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 6.5l7 7M13.5 6.5l-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const BOTH_WAYS_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7.2h11.2L12.4 4.4M16 12.8H4.8l2.8 2.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function openLinkSheet({ reader = null, source = null } = {}) {
  if (!data || sheet) return;
  const rooms = [...data.rooms].sort((x, y) => Number(Boolean(y.open)) - Number(Boolean(x.open)) || roomLabel(x).localeCompare(roomLabel(y)));
  if (rooms.length < 2) return;
  // Where it starts, unless it was asked for a pair: BISHOP reading, from a room that can hand
  // notes over now (open and up to date) when there is one.
  const ready = (room) => room.open && !room.glance?.outdated && !room.glance?.unreachable;
  // Two projects already connected are not connected again (2026-10-11): whichever way the one in
  // force goes, the wizard says how they are connected and where to change it, and signs nothing.
  const linkedPair = (x, y) => (x && y ? (data.enlaces ?? []).find((one) => [one.rooms.a, one.rooms.b].sort().join('\n') === [x, y].sort().join('\n')) ?? null : null);
  const pick = {
    reader: reader ?? (source !== data.salas && rooms.some((room) => room.id === data.salas) ? data.salas : rooms.find((room) => room.id !== source)?.id),
    source: null, both: false, kinds: new Set(['decision', 'fact']), days: 7, recall: false,
    orders: false, maxMode: 1, perHour: 6, designation: '',
  };
  const free = (room) => room.id !== pick.reader && room.id !== data.salas && !linkedPair(room.id, pick.reader);
  pick.source = source ?? (rooms.find((room) => free(room) && ready(room)) ?? rooms.find(free) ?? rooms.find((room) => room.id !== pick.reader && room.id !== data.salas))?.id;
  // The Coordinator never shares its memory (src/enlaces.mjs: it gathers every project and is
  // nobody's source), so the wizard never offers what signing would refuse: asked for with the
  // Coordinator as the one that shares, the two change places; it never reads both ways.
  const coordinator = (id) => Boolean(data.salas) && id === data.salas;
  if (coordinator(pick.source)) [pick.reader, pick.source] = [pick.source, pick.reader];
  const settle = () => { if (coordinator(pick.source) && !coordinator(pick.reader)) [pick.reader, pick.source] = [pick.source, pick.reader]; if (coordinator(pick.source) || coordinator(pick.reader)) pick.both = false; };
  const roomOf = (id) => rooms.find((room) => room.id === id) ?? null;
  const nameOf = (id) => { const room = roomOf(id); return room ? roomLabel(room) : ''; };
  // Orders only with BISHOP on one side; they would go into the other.
  const ordersInto = () => (data.salas && [pick.reader, pick.source].includes(data.salas) ? [pick.reader, pick.source].find((id) => id !== data.salas) ?? null : null);
  const stepsNow = () => ['who', 'what', 'time', ...(ordersInto() ? ['orders'] : []), 'review'];
  const STEP_WORDS = { who: () => t('Projects'), what: () => t('What it looks up'), time: () => t('How long'), orders: () => t('Orders'), review: () => t('Sign') };
  // The kinds as a sentence says them: «decisiones y hechos».
  const KIND_PLURALS = { decision: () => t('decisions'), fact: () => t('facts'), preference: () => t('preferences'), question: () => t('questions') };
  const kindsSaid = () => new Intl.ListFormat(language, { type: 'conjunction' }).format(LINK_KINDS.filter((kind) => pick.kinds.has(kind)).map((kind) => KIND_PLURALS[kind]()));
  const until = () => new Date(Date.now() + pick.days * 86400000).toLocaleDateString(language, { day: 'numeric', month: 'long' });
  let at = 0;
  sheet = el('dialog', 'sm-sheet sm-wide sm-link-wizard');
  const inner = el('div', 'sm-sheet-body');
  sheet.append(inner);
  document.body.append(sheet);

  // ---- The pieces every step is made of.
  const card = () => el('div', 'lw-card');
  // A row: what it is and what it does on the left, its control on the right.
  const row = (title, note, control, { recommended = false, dot = null } = {}) => {
    const line = el('div', 'lw-row');
    const words = el('div', 'lw-words');
    const head = el('div', 'lw-title');
    if (dot) head.append(el('i', `lw-dot k-${dot}`));
    // Words, or a sentence with its names in bold (sayBold).
    const name = el('b');
    name.append(title);
    head.append(name);
    if (recommended) head.append(el('span', 'lw-tag', t('Recommended')));
    words.append(head);
    if (note) { const said = el('span', 'lw-note'); said.append(note); words.append(said); }
    line.append(words);
    if (control) line.append(control);
    return line;
  };
  const toggle = (on, change, label) => {
    const wrap = el('label', 'settings-switch');
    const box = el('input'); box.type = 'checkbox'; box.checked = on; box.setAttribute('aria-label', label);
    box.addEventListener('change', () => change(box.checked));
    wrap.append(box, el('i'));
    return wrap;
  };
  const rail = (options, current, choose, label) => {
    const seg = el('div', 'sx-seg');
    seg.setAttribute('role', 'radiogroup');
    seg.setAttribute('aria-label', label);
    for (const [value, words] of options) {
      const one = button(null, words, () => { choose(value); render(); });
      one.setAttribute('role', 'radio');
      one.setAttribute('aria-checked', String(value === current));
      seg.append(one);
    }
    return seg;
  };
  const roomSelect = (chosen, change, label, { shares = false, other = null } = {}) => {
    const select = el('select', 'lw-select');
    select.setAttribute('aria-label', label);
    for (const room of rooms) {
      if (shares && coordinator(room.id)) continue;
      const linked = room.id !== other && linkedPair(room.id, other);
      const option = el('option', null, linked ? t('{project} · already connected', { project: roomLabel(room) }) : roomLabel(room)); option.value = room.id; if (room.id === chosen) option.selected = true; select.append(option);
    }
    select.addEventListener('change', () => change(select.value));
    return select;
  };
  // What the connection allows and what it does not, line by line (2026-10-11): a tick for what
  // it lets happen, a cross for what it never does, each with its reason, so nobody has to
  // guess why a choice is missing.
  const allows = (lines) => {
    const box = el('div', 'lw-allows');
    const list = el('ul');
    for (const [yes, words] of lines) {
      const line = el('li', yes ? 'yes' : 'no');
      const sign = el('i');
      sign.innerHTML = yes ? ALLOWED_GLYPH : NOT_ALLOWED_GLYPH; // trusted: our own SVG strings
      const said = el('span');
      said.append(words);
      line.append(sign, said);
      list.append(line);
    }
    box.append(el('span', 'lw-allows-head', t('What this connection allows')), list);
    return box;
  };
  const alreadyLinked = (enlace) => {
    const ends = endsOf(enlace);
    const box = el('div', 'lw-allows lw-already');
    const said = el('p', 'lw-already-says');
    said.append(enlace.direction === 'both'
      ? sayBold('{a} and {b} already look each other up.', { a: roomName(enlace.rooms.a), b: roomName(enlace.rooms.b) })
      : coordinator(ends.reader) ? sayBold('The Coordinator already looks up the notes of {source}.', { source: roomName(ends.source) })
      : sayBold('{reader} already looks up the notes of {source}.', { reader: roomName(ends.reader), source: roomName(ends.source) }));
    const kinds = new Intl.ListFormat(language, { type: 'conjunction' }).format(LINK_KINDS.filter((kind) => (enlace.kinds ?? []).includes(kind)).map((kind) => KIND_PLURALS[kind]()));
    const what = [kinds.charAt(0).toUpperCase() + kinds.slice(1), enlace.expires ? t('until {date}', { date: new Date(enlace.expires).toLocaleDateString(language, { day: 'numeric', month: 'short' }) }) : t('no expiry')];
    if (enlace.orders?.allowed) what.push(t('orders up to #{n}', { n: enlace.orders.maxMode }));
    const see = button('sm-btn small', t('See the connections'), () => { sheet.close(); if (!ui.linksSheet.open) ui.linksSheet.showModal(); });
    box.append(el('span', 'lw-allows-head', t('They are already connected')), said, el('p', 'lw-note', what.join(' · ')), el('p', 'lw-note', t('A pair is connected once. To change what it looks up, how long or the orders, revoke it in Connections and make a new one.')), see);
    return box;
  };
  const caution = (words) => { const line = el('div', 'lw-caution'); const said = el('span'); said.append(words); line.append(el('i'), said); return line; };
  // What the person should know about the rooms chosen.
  function cautions() {
    const said = [];
    for (const id of pick.both ? [pick.source, pick.reader] : [pick.source]) {
      const room = roomOf(id);
      if (!room) continue;
      if (!room.open) said.push(sayBold('{room} is asleep: while it sleeps, it hands nothing over.', { room: roomLabel(room) }));
      else if (room.glance?.outdated) said.push(sayBold('{room} runs an older MADRE: it may hand nothing over until you update it.', { room: roomLabel(room) }));
    }
    return said;
  }
  // The scene over every step, in the welcome's own style (wizardScene): the room that serves and
  // the one that reads, arriving and floating; BISHOP with its ring; between them the wire, its dashes
  // running the way the notes travel (both ways when both read), and the notes themselves crossing it,
  // one dot per kind that crosses, in its kind's colour. Under the scene, in a strip of their own so
  // they never cover it, the link's terms. It is made once and kept across the steps; a choice
  // redraws what it says, not the scene.
  const stage = el('div', 'sm-scene scene-link');
  const field = el('div', 'lw-field');
  stage.append(field);
  const shown = { head: null, page: null };
  stage.setAttribute('aria-hidden', 'true');
  const ends = { source: null, reader: null };
  function endNode(role) {
    const node = el('div', `sm-scene-node lw-end ${role}`);
    node.style.left = role === 'source' ? '20%' : '80%';
    node.style.top = '42%';
    node.style.setProperty('--d', role === 'source' ? '0ms' : '160ms');
    field.append(node);
    return node;
  }
  function paintEnd(node, id, role) {
    if (node.dataset.room !== id) {
      node.dataset.room = id;
      node.replaceChildren();
      const body = id === data.salas ? mark('bishop', 46) : (() => { const disc = el('span', 'lw-room-mark'); disc.innerHTML = FOLDER_GLYPH; return disc; })(); // trusted: drawn here
      node.classList.toggle('is-bishop', id === data.salas);
      node.append(body, el('b', null, nameOf(id)), el('small'));
    }
    node.lastChild.textContent = role;
  }
  function paintStage() {
    ends.source ??= endNode('source');
    ends.reader ??= endNode('reader');
    paintEnd(ends.source, pick.source, pick.both ? t('Shares and looks up') : t('Shares'));
    paintEnd(ends.reader, pick.reader, pick.both ? t('Shares and looks up') : coordinator(pick.reader) && pick.orders ? t('Looks up and gives orders') : t('Looks up'));
    stage.querySelector('.lw-wires')?.remove();
    stage.querySelector('.lw-terms')?.remove();
    const box = field.getBoundingClientRect();
    if (box.width) {
      // In the scene's own pixels, so the dots stay round and the wire meets the bodies.
      const W = box.width, H = box.height, y = H * 0.42, x0 = W * 0.2 + 34, x1 = W * 0.8 - 34;
      const wires = svgNode('svg', { class: 'lw-wires', viewBox: `0 0 ${W} ${H}` });
      const there = `M${x0} ${y} C ${x0 + (x1 - x0) * 0.33} ${y - 18}, ${x0 + (x1 - x0) * 0.66} ${y + 18}, ${x1} ${y}`;
      const back = `M${x1} ${y + 7} C ${x0 + (x1 - x0) * 0.66} ${y + 26}, ${x0 + (x1 - x0) * 0.33} ${y - 10}, ${x0} ${y + 7}`;
      const paths = [['lw-there', there], ...(pick.both ? [['lw-back', back]] : [])];
      paths.forEach(([id, d]) => wires.append(svgNode('path', { id, class: 'sm-wire on', d })));
      // The notes crossing: one dot per kind, one after another, along each way (still, for whoever
      // asked for less motion: then the wire alone says it).
      const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const kinds = still ? [] : LINK_KINDS.filter((kind) => pick.kinds.has(kind));
      paths.forEach(([id], way) => kinds.forEach((kind, index) => {
        const dot = svgNode('circle', { r: 4.2, class: `lw-crossing k-${kind}`, opacity: 0 });
        const begin = `${(index * 2.6) / Math.max(1, kinds.length) + way * 1.3}s`;
        const move = svgNode('animateMotion', { dur: '2.6s', repeatCount: 'indefinite', begin, calcMode: 'spline', keyTimes: '0;1', keySplines: '.45 0 .55 1' });
        const along = svgNode('mpath');
        along.setAttribute('href', `#${id}`);
        move.append(along);
        dot.append(move, svgNode('animate', { attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;.12;.88;1', dur: '2.6s', repeatCount: 'indefinite', begin }));
        wires.append(dot);
      }));
      field.prepend(wires);
    }
    const terms = el('p', 'lw-terms');
    const said = [
      pick.kinds.size ? kindsSaid() : t('nothing yet'),
      pick.days ? t('Ends {date}', { date: until() }) : t('No expiry'),
      pick.recall ? t('On every turn') : t('Only when asked'),
      ...(ordersInto() ? [pick.orders ? t('Orders up to #{n}', { n: pick.maxMode }) : t('No orders')] : []),
    ];
    for (const words of said) terms.append(el('span', null, words));
    stage.append(terms);
  }

  function render({ back = false } = {}) {
    settle();
    const steps = stepsNow();
    at = Math.min(at, steps.length - 1);
    const kind = steps[at];
    const head = el('header', 'sm-sheet-head');
    const dots = el('ol', 'sm-steps');
    steps.forEach((name, index) => dots.append(el('li', index === at ? 'on' : index < at ? 'done' : null, STEP_WORDS[name]())));
    head.append(dots, closeKey(() => sheet.close()));
    const page = el('div', `sm-step lw-step${back ? ' back' : ''}`);
    // The swap, on the first step: it turns the link round, and the scene shows it.
    const turn = button('sm-btn small', t('Swap'), () => { [pick.reader, pick.source] = [pick.source, pick.reader]; render(); });
    const intro = (title, lead) => {
      const box = el('div', 'lw-intro');
      box.append(el('span', 'lw-eyebrow', t('Step {n} of {total}', { n: at + 1, total: steps.length })), el('h3', null, title));
      if (lead) { const said = el('p', 'lw-lead'); said.append(lead); box.append(said); }
      page.append(box);
    };
    const error = el('p', 'error');
    const actions = el('div', 'actions');
    const next = (check) => button('sm-btn primary', t('Continue'), () => { const wrong = check?.(); if (wrong) { error.textContent = wrong; return; } at += 1; render(); });
    if (at > 0) actions.append(button('sm-btn', t('Back'), () => { at -= 1; render({ back: true }); }));

    if (kind === 'who') {
      // With the Coordinator at one end the step speaks of it: what it reads, the orders it may
      // give, and why it is never read (src/enlaces.mjs). Between two projects, who reads whom.
      const withCoordinator = coordinator(pick.reader);
      const source = nameOf(pick.source), reader = nameOf(pick.reader);
      intro(t('Which projects do you want to connect?'), withCoordinator
        ? t('The Coordinator looks up what a project has already learned: its decisions, facts and preferences. If you allow it, it can also ask that project for tasks.')
        : t('Connecting them lets one project look up what the other has already learned: its decisions, facts and preferences. It only reads; nothing in the other project ever changes.'));
      const box = card();
      if (pick.both) {
        // Both ways, neither only serves nor only reads: the two projects side by side, with no
        // direction to choose and nothing to swap.
        const pair = el('div', 'lw-pair');
        const both = el('span', 'lw-both');
        both.innerHTML = BOTH_WAYS_ICON; // trusted: our own SVG string
        pair.append(roomSelect(pick.source, (id) => { pick.source = id; render(); }, t('One project'), { shares: true, other: pick.reader }), both, roomSelect(pick.reader, (id) => { pick.reader = id; render(); }, t('The other project'), { shares: true, other: pick.source }));
        const line = row(t('The two projects'), t('Each one looks up the notes of the other. Nothing is written into either.'), null);
        line.classList.add('lw-stack');
        line.append(pair);
        box.append(line);
      } else {
        // Nothing to swap with the Coordinator: it is always the one that looks up, so its project
        // is chosen alone, as wide as the one under it.
        const sharing = roomSelect(pick.source, (id) => { pick.source = id; render(); }, t('Shares its memory'), { shares: true, other: pick.reader });
        const serves = withCoordinator ? sharing : el('div', 'lw-control lw-pick');
        if (!withCoordinator) serves.append(sharing, turn);
        box.append(row(t('Shares its memory'), withCoordinator ? t('The Coordinator reads its notes.') : t('Its notes can be read. Nothing is written into it.'), serves));
        box.append(row(t('Looks it up'), t('Its agents can look the notes up when they need them.'), roomSelect(pick.reader, (id) => { pick.reader = id; render(); }, t('Looks it up'), { other: pick.source })));
      }
      if (!withCoordinator) box.append(row(t('Both ways'), t('Each one looks up the other. Leave it off if only one needs it.'), toggle(pick.both, (on) => { pick.both = on; render(); }, t('Both ways'))));
      const looks = (who, whose) => sayBold('{reader} looks up the notes of {source}.', { reader: who, source: whose });
      const existing = pick.reader !== pick.source ? linkedPair(pick.source, pick.reader) : null;
      if (existing) box.append(alreadyLinked(existing));
      else box.append(allows(withCoordinator
        ? [
          [true, sayBold('The Coordinator looks up the notes of {room}.', { room: source })],
          [true, sayBold('It can ask {room} for tasks, up to #2, if you allow it in the Orders step.', { room: source })],
          [false, sayBold('{room} does not look up the Coordinator: the Coordinator keeps what it read in all your projects, and {room} would see it without your signature.', { room: source })],
        ]
        : pick.both
          ? [[true, looks(reader, source)], [true, looks(source, reader)], [false, t('Neither one writes in the other: nothing in either project changes.')]]
          : [[true, looks(reader, source)], [false, sayBold('{source} does not look up {reader}. Turn on Both ways if it needs to.', { source, reader })], [false, t('Neither one writes in the other: nothing in either project changes.')]]));
      for (const said of cautions()) box.append(caution(said));
      page.append(box);
      const onward = next(() => (pick.reader === pick.source ? t('Choose two different projects.') : coordinator(pick.source) ? t('The Coordinator never shares its memory: it is always the one that looks up.') : existing ? t('These two are already connected. To change it, revoke it in Connections and make a new one.') : null));
      // Already connected: nothing to go on to; the box above says why and where to change it.
      onward.disabled = Boolean(existing);
      actions.append(onward);
    } else if (kind === 'what') {
      intro(t('What can it look up?'), t('Turn on only what it needs. Decisions and facts are usually enough.'));
      const box = card();
      box.classList.add('lw-grid');
      for (const kindOf of LINK_KINDS) {
        box.append(row(kindWord(kindOf), LINK_KIND_NOTES[kindOf](), toggle(pick.kinds.has(kindOf), (on) => { if (on) pick.kinds.add(kindOf); else pick.kinds.delete(kindOf); error.textContent = ''; render(); }, kindWord(kindOf)), { recommended: kindOf === 'decision' || kindOf === 'fact', dot: kindOf }));
      }
      page.append(box, el('p', 'lw-foot', t('Only the notes already in use are shared, cleaned of private data first. Never your files, your whole conversations or the notes you set aside.')));
      actions.append(next(() => (pick.kinds.size ? null : t('Choose at least one kind.'))));
    } else if (kind === 'time') {
      intro(t('For how long?'), t('The connection ends on its own on the day you choose. Until then, its agents look the notes up only when they need them, unless you turn on the option below.'));
      const box = card();
      const ends = el('div', 'lw-control');
      ends.append(rail(LINK_DAYS.map(([value, words]) => [value, words()]), pick.days, (value) => { pick.days = value; }, t('It ends')));
      box.append(row(t('It ends'), t('A week is enough to try it; signing it again takes a moment.'), ends, { recommended: pick.days === 7 }));
      box.append(row(t('Always include'), t('With every question it gets up to 3 related notes without looking for them; each time counts toward the hourly limit. Off, its agents look them up only when they need to.'), toggle(pick.recall, (on) => { pick.recall = on; render(); }, t('Always include'))));
      page.append(box);
      actions.append(next());
    } else if (kind === 'orders') {
      const name = nameOf(ordersInto());
      intro(t('Orders from the coordinator'), sayBold('With orders, the Coordinator can ask {room} for a task, and its agents do it there. Without them, it only reads. Edit (#3) and Full access (#4) never go this way: they arrive as a proposal you unlock in that project.', { room: name }));
      const box = card();
      box.append(row(sayBold('Allow orders into {room}', { room: name }), sayBold('Leave it off unless you need the Coordinator to act in {room}.', { room: name }), toggle(pick.orders, (on) => { pick.orders = on; render(); }, t('Allow orders into {room}', { room: name })), { recommended: !pick.orders }));
      if (pick.orders) {
        const modes = el('div', 'lw-control');
        modes.append(rail([1, 2].map((n) => [n, `#${n} ${modeName(n)}`]), pick.maxMode, (value) => { pick.maxMode = value; }, t('Up to which mode')));
        box.append(row(t('Up to which mode'), null, modes));
        const hourly = el('div', 'lw-control');
        hourly.append(rail([3, 6, 12].map((n) => [n, String(n)]), pick.perHour, (value) => { pick.perHour = value; }, t('How many an hour')));
        box.append(row(t('How many an hour'), null, hourly));
        const typed = el('input', 'lw-input'); typed.type = 'text'; typed.autocomplete = 'off'; typed.spellcheck = false; typed.value = pick.designation;
        typed.setAttribute('aria-label', t('Type the name of {room} to allow orders into it', { room: name }));
        typed.addEventListener('input', () => { pick.designation = typed.value; error.textContent = ''; });
        const said = row(sayBold('Type the name of {room} to allow orders into it', { room: name }), null, null);
        said.classList.add('lw-stack');
        said.append(typed);
        box.append(said);
      }
      page.append(box);
      actions.append(next(() => (pick.orders && !pick.designation.trim() ? t('Type the project name to allow orders, or turn them off.') : null)));
    } else {
      intro(t('Check it and sign'), t('This is the whole connection. Nothing changes until you press Sign.'));
      const list = el('ul', 'lw-card lw-review');
      const said = (words) => { const item = el('li'); item.append(words); list.append(item); };
      said(pick.both ? sayBold('{a} and {b} will look up each other\'s {kinds}.', { a: nameOf(pick.reader), b: nameOf(pick.source), kinds: kindsSaid() }, ['a', 'b']) : sayBold('{reader} will look up the {kinds} of {source}.', { reader: nameOf(pick.reader), source: nameOf(pick.source), kinds: kindsSaid() }, ['reader', 'source']));
      said(pick.days ? t('Until {date}.', { date: until() }) : t('With no expiry: it lasts until you revoke it.'));
      said(pick.recall ? t('With every question, up to 3 of these notes arrive without being looked for.') : t('Its agents look them up only when they need them.'));
      if (ordersInto()) said(pick.orders ? sayBold('The Coordinator may send orders into {room}, up to #{n}, {k} an hour.', { room: nameOf(ordersInto()), n: pick.maxMode, k: pick.perHour }, ['room']) : t('No orders: the Coordinator only looks up.'));
      said(t('Nothing is written across, and you can revoke it at any moment from Connections.'));
      page.append(list);
      const warn = cautions();
      if (warn.length) { const box = card(); for (const words of warn) box.append(caution(words)); page.append(box); }
      const sign = button('sm-btn primary', t('Sign'), async () => {
        error.textContent = '';
        const body = {
          a: pick.source, b: pick.reader, direction: pick.both ? 'both' : 'a→b', kinds: [...pick.kinds],
          expires: pick.days ? new Date(Date.now() + pick.days * 86400000).toISOString() : null,
          orders: pick.orders && ordersInto() ? { allowed: true, maxMode: pick.maxMode, perHour: pick.perHour } : { allowed: false, maxMode: 0, perHour: pick.perHour },
          designation: pick.orders && ordersInto() ? pick.designation.trim() : undefined,
          recall: pick.recall,
        };
        sign.disabled = true;
        sign.textContent = t('Signing…');
        const answer = await fetch('/api/salas/enlaces', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
          .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
        sign.disabled = false;
        sign.textContent = t('Sign');
        if (!answer.ok) { error.textContent = answer.body.error ?? t('The connection could not be signed.'); return; }
        sheet.close();
        await refresh();
      });
      actions.append(sign);
    }
    page.append(error, actions);
    // The scene stays where it is (taken out and put back, its animations would start over).
    if (!stage.isConnected) inner.replaceChildren(head, stage, page);
    else { shown.head.replaceWith(head); shown.page.replaceWith(page); }
    shown.head = head; shown.page = page;
    paintStage();
  }
  sheet.addEventListener('close', () => { sheet.remove(); sheet = null; });
  render();
  sheet.showModal();
  paintStage();
}
ui.link.addEventListener('click', () => openLinkSheet());

async function refresh() {
  const answer = await fetch('/api/salas', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
  if (!answer) { ui.foot.textContent = t('This project did not answer. It may have closed.'); ui.bar.live.classList.add('is-off'); ui.bar.live.lastChild.textContent = t('Not answering right now'); return; }
  if (answer.language && answer.language !== language) { language = setLanguage(answer.language); root.lang = language; translateStatic(); drawAttention(); drawDecisions(); drawWork(); }
  data = answer;
  ui.foot.textContent = t('Every project runs on this Mac, on its own, with its own memory.');
  // The room's corner (app.js, #colophon): the version this Home runs, and NOTICE's own line.
  if (answer.version) {
    ui.colophon.replaceChildren(el('b', null, `MADRE ${answer.version}`), document.createTextNode('\u00a0·\u00a0© 2026 Jossue Alcalá'));
    ui.colophon.hidden = false;
  }
  draw();
}

async function startRoom(room, { enter = false } = {}) {
  busy.set(room.id, 'starting');
  failed.delete(room.id);
  draw();
  const answer = await fetch('/api/salas/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room: room.id }) })
    .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) })).catch(() => ({ ok: false, body: {} }));
  if (answer.ok) await waitDone(room.id); else waitDrop(room.id);
  busy.delete(room.id);
  if (!answer.ok) failed.set(room.id, answer.body.error ?? t('The project did not open.'));
  // Opened from its card, the person goes in: that is what «Open» means.
  else if (enter && answer.body.port) { leaveTo(`http://127.0.0.1:${answer.body.port}/`); return answer; }
  await refresh();
  return answer;
}

// A card's wait (2026-10-10): MADRE's loader in a line (loader.js), kept across the redraws of the
// card so it never starts over, creeping while the project wakes, closes or leaves, and filled when
// it is done.
const waits = new Map();       // room id → its loader while the card waits
function waitFor(id, label) {
  let loader = waits.get(id);
  if (!loader) {
    loader = makeLoader({ small: true, progress: 0.04 });
    loader.stop = creep(loader, { to: 0.9, rate: 0.03, every: 200 });
    waits.set(id, loader);
  }
  setLoader(loader, 0, label);
  return loader;
}
// It did not happen: the loader goes without filling, and the card says why.
function waitDrop(id) {
  waits.get(id)?.stop?.();
  waits.delete(id);
}
function waitDone(id) {
  const loader = waits.get(id);
  if (!loader) return Promise.resolve();
  waits.delete(id);
  loader.stop?.();
  return finishLoader(loader, { hold: 220 });
}

// Out of MADRE (2026-10-10): Home forgets it (src/salas.mjs, forgetProject); its folder and its
// memory stay where they are, and adding the folder again brings them back.
async function forgetRoom(room) {
  forgetting.delete(room.id);
  busy.set(room.id, 'forgetting');
  failed.delete(room.id);
  draw();
  const answer = await post('/api/salas/forget', { room: room.id });
  if (answer.ok) await waitDone(room.id); else waitDrop(room.id);
  busy.delete(room.id);
  if (!answer.ok) { failed.set(room.id, answer.body.error ?? t('It could not be taken out of MADRE.')); draw(); return; }
  if (pinsStored()?.includes(room.id)) pinRemove(room.id);
  toast(t('{name} left MADRE. Its folder is still on this Mac.', { name: answer.body.name ?? room.name }));
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
    ui.none.hidden = false;
    ui.none.replaceChildren(el('span', null, t('This project closed. Open MADRE again to come back to Home.')));
    ui.stop.hidden = true;
    ui.projects.hidden = true;
    return;
  }
  if (!answer.ok) { waitDrop(room.id); busy.delete(room.id); failed.set(room.id, answer.body.error ?? t('That project did not answer.')); draw(); return; }
  // It closes in a moment; the card stays «closing» until the list says it is asleep.
  for (let wait = 0; wait < 20; wait += 1) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await refresh();
    if (!data?.rooms.find((one) => one.id === room.id)?.open) break;
  }
  await waitDone(room.id);
  busy.delete(room.id);
  draw();
}

// THE MACROVERSE (macroverso.js): the same rooms as universes, entered from here.
function macroWords() {
  return {
    title: t('Project map'),
    back: t('Back to Home'),
    hint: t('Drag the space to move it · wheel to come closer · click a project to look at it · drag it to turn it · carry one onto the Coordinator for the Coordinator to read it, or onto another to connect them · ← → from one to the next · Esc to come back'),
    bishop: t('Coordinator'),
    bishopAbout: t('Your coordinator. It reads across your projects, signs the connections between them and carries an order from one to another.'),
    bishopReads: (n) => (n ? (n === 1 ? t('It reads 1 project by a connection') : t('It reads {n} projects by connections', { n })) : t('It reads no project yet: each one it reads is a connection you sign.')),
    notLinked: t('Not connected yet: touch one to connect it'),
    talk: t('Talk to the Coordinator'),
    asleep: t('Asleep'),
    recenter: t('RECENTER'),
    // The legend under its name, in the Memory map's words.
    legend: t('Memory kinds'),
    kinds: { ...Object.fromEntries(KINDS.map((kind) => [kind, kindWord(kind)])), dim: t('OUT OF CIRCULATION') },
    veins: (n) => t('{n} connections', { n }),
    links: t('Connections'),
    link: t('Connect…'),
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
      return [data?.mac ?? null, t('{n} projects', { n: rooms.length }), waiting ? t('{n} waiting for you', { n: waiting }) : null, t('{n} memories', { n: memories })].filter(Boolean).join(' · ');
    },
    state: (room) => stateOf(room).words,
    path: homeWord,
    ask: askLine,
    kind: (kind) => KIND_WORDS[kind] ?? kind,
    counts: (room) => (room.open ? [t('{n} conversations', { n: room.glance?.chats ?? 0 }), t('{n} memories', { n: room.glance?.census?.memories ?? 0 })].join(' · ') : room.lastOpened ? t('Asleep · last open {when}', { when: ago(room.lastOpened) }) : t('Asleep')),
    enter: t('Enter the project'),
    backToRoom: t('Back to the project'),
    wake: t('Wake'),
    waking: t('Waking…'),
    all: t('All the projects'),
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
    // BISHOP at the centre (D-S12): the macroverse draws its body itself (macroverso.js, bishopOrb).
    bishop: data.salas ? { id: data.salas } : null,
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

// ---- THE BAR, as a room's: the logo and where you are (and, served by a project's room, the way
// back to it); this lobby answering; the rooms on the bar, each with how it is and a way into it; the
// agents with their sessions; who waits for you; a newer MADRE; what is running and the key that
// stops it; the links in force; the macroverse; reload and settings apart, as in the room.
function drawTopbar() {
  if (!data) return;
  const b = ui.bar;
  // Where you are, and the way back to the room that serves this page, when it is a project's.
  const here = data.rooms.find((room) => room.id === data.here) ?? null;
  b.backRoom.hidden = !here || here.id === data.salas;
  if (here && here.id !== data.salas) { b.backRoom.href = '/'; b.backRoom.lastChild.textContent = here.name; b.backRoom.title = t('Back to the project'); }
  b.live.classList.remove('is-off');
  b.live.lastChild.textContent = data.mac ?? '';
  // The rooms on the bar: the open projects, or the ones the person pinned, in their order.
  drawPins();
  // The agents of this computer, each with its session.
  b.agents.replaceChildren();
  for (const agent of (agentsSeen?.agents ?? []).filter((one) => one.id !== 'madre')) {
    const state = agentState(agent, agentsSeen);
    const key = button(`sm-agent-key ${state.key}`, null, () => openSettings('agents'));
    key.append(mark(agent.id, 24));
    key.title = `${agent.label ?? agent.id} · ${state.words}`;
    key.setAttribute('aria-label', key.title);
    b.agents.append(key);
  }
  b.agents.hidden = !b.agents.childElementCount;
  // Who waits for you: how many, and a way into the first room that asks.
  const asking = data.rooms.filter((room) => room.open && room.glance?.waitingCount);
  const waiting = asking.reduce((sum, room) => sum + room.glance.waitingCount, 0);
  b.waiting.hidden = !waiting;
  if (waiting) { b.waiting.href = addressOf(asking[0]); b.waiting.lastChild.textContent = t('{n} waiting for you', { n: waiting }); b.waiting.title = asking.map((room) => roomLabel(room)).join(' · '); }
  // A newer MADRE.
  b.update.hidden = !(versionSeen?.available && versionSeen.latest);
  if (!b.update.hidden) { b.update.lastChild.textContent = t('{version} AVAILABLE', { version: versionSeen.latest }); b.update.title = t('MADRE {version} is out.', { version: versionSeen.latest }); }
  // The links in force.
  const links = (data.enlaces ?? []).length;
  b.linksCount.hidden = !links;
  b.linksCount.textContent = String(links);
}
// ---- THE BAR'S ROOMS, the way you want them (2026-10-10), as the room's bar is arranged (app.js,
// «The bar, the way you want it»). Until the person arranges it, the bar holds the projects that
// are open, the ones that need the person first. A project is pinned from its card (right-click
// it, or drag the card to the bar); right-click a room on the bar and the bar opens for editing:
// the rooms tremble, each wears a «−», they can be carried to another place, and a card under the
// bar holds the projects that are not on it yet. What is on the bar, and in which order, is this
// browser's own (localStorage), as the room keeps its bar.
const PIN_KEY = 'pulse.lobbyBar';
const PIN_TYPE = 'application/x-madre-room';
const PIN_MINUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const PIN_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.4 3.4h5.2l-.9 4.4 2.6 2.6v1.2H5.7v-1.2l2.6-2.6zM10 11.6v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UNPIN_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.4 3.4h5.2l-.9 4.4 2.6 2.6v1.2H5.7v-1.2l2.6-2.6zM10 11.6v5M3.6 3.6l12.8 12.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARRANGE_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.6" y="5.4" width="14.8" height="9.2" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.2 10h2.2M11.6 10h2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const FORGET_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6.2c0-.9.7-1.6 1.6-1.6h3l1.6 1.8h5.2c.9 0 1.6.7 1.6 1.6v6.4c0 .9-.7 1.6-1.6 1.6H5.1c-.9 0-1.6-.7-1.6-1.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.6 11h4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const MORE_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="10" r="1.6" fill="currentColor"/><circle cx="10" cy="10" r="1.6" fill="currentColor"/><circle cx="15" cy="10" r="1.6" fill="currentColor"/></svg>';
const pins = {
  saved: null,          // what this page decided, for when storage will not keep it
  chips: new Map(),     // room id → its key on the bar
  badges: new Map(),    // room id → its «−»
  layer: null,          // where the «−» live, over the rooms
  more: null,           // «+n», when the rooms do not all fit
  spilled: [],          // the rooms behind «+n»
  moreCard: null,
  card: null,           // the card under the bar while it is being arranged
  cardSaid: '',
  menu: null,           // a card's right-click menu
  editing: false,
  frame: 0,
  drag: null,           // a room being carried along the bar
  dropping: null,       // a project's card being dragged towards the bar
  slot: null,           // where it would land
  slotAt: null,
};
const motionStill = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
const motionMs = (ms) => ms * (Number.parseFloat(getComputedStyle(root).getPropertyValue('--motion-scale')) || 1);

function pinsStored() {
  if (pins.saved) return [...pins.saved];
  try {
    const raw = JSON.parse(localStorage.getItem(PIN_KEY) ?? 'null');
    if (Array.isArray(raw) && raw.every((id) => typeof id === 'string')) return [...new Set(raw)];
  } catch { /* no storage, or not a list: the bar as it comes */ }
  return null;
}
// The rooms on the bar, in their order: the person's, or the open projects until they arrange it.
// A project that left the lobby is skipped; BISHOP's own room is never a project.
function pinsShown() {
  if (!data) return [];
  const stored = pinsStored();
  if (!stored) return projectsInOrder().open.map((room) => room.id);
  const known = new Set(data.rooms.filter((room) => room.id !== data.salas).map((room) => room.id));
  return stored.filter((id) => known.has(id));
}
function pinsWrite(list) {
  pins.saved = [...list];
  try { localStorage.setItem(PIN_KEY, JSON.stringify(pins.saved)); } catch { /* this page only */ }
  drawTopbar();
  settingsSheet?.sync({ detail: true });
}
function pinAdd(id, at = null) {
  const list = pinsShown().filter((one) => one !== id);
  list.splice(at === null ? list.length : Math.max(0, Math.min(at, list.length)), 0, id);
  pinsWrite(list);
  // It arrives where it was put, growing into its place rather than appearing in it.
  const chip = pins.chips.get(id);
  if (chip && typeof chip.animate === 'function' && !motionStill()) chip.animate([{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1' }], { duration: motionMs(240), easing: 'cubic-bezier(.2, .7, .2, 1)' });
}
function pinRemove(id) { pinsWrite(pinsShown().filter((one) => one !== id)); }
function pinsReset() {
  pins.saved = null;
  try { localStorage.removeItem(PIN_KEY); } catch { /* this page only */ }
  drawTopbar();
  settingsSheet?.sync({ detail: true });
}

// From six rooms on, each is a square with its two letters (brands.js, monogram).
const PINS_SQUARE = 6;

// A room's key on the bar: its lamp and its name, or, from six rooms on, a square with its two
// letters and the lamp at its corner (its name is then its title). Open, it is a link to its room;
// asleep, pressing it wakes it and goes in, as «Open» on its card does.
function pinChip(id) {
  let chip = pins.chips.get(id);
  if (chip) return chip;
  chip = el('a', 'sm-tb-room');
  chip.dataset.barItem = id;
  chip.draggable = false;
  chip.append(el('i'), el('span'), el('b', 'sm-tb-mono'));
  chip.addEventListener('click', (event) => {
    if (pins.editing) return;
    const room = data?.rooms.find((one) => one.id === id);
    if (!room || room.open) return;
    event.preventDefault();
    if (!busy.has(room.id)) void startRoom(room, { enter: true });
  });
  chip.addEventListener('keydown', (event) => { if (!chip.hasAttribute('href') && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); chip.click(); } });
  chip.addEventListener('contextmenu', (event) => { event.preventDefault(); event.pinHandled = true; pinsEdit(!pins.editing); });
  chip.addEventListener('pointerdown', (event) => { if (pins.editing) pinsDragStart(event, id); });
  pins.chips.set(id, chip);
  return chip;
}
// Puts the keys where the order says. Only what is out of place moves, so a key that stays is
// never taken off the page (and keeps its focus, and its tremble).
function pinsPlace(ids) {
  const box = ui.bar.open;
  const want = ids.map((id) => pins.chips.get(id)).filter(Boolean);
  if (pins.dropping && pins.slot) want.splice(Math.min(pins.slotAt ?? want.length, want.length), 0, pins.slot);
  want.push(pins.more);
  let next = pins.layer.parentNode === box ? pins.layer : null;
  for (let index = want.length - 1; index >= 0; index -= 1) {
    const node = want[index];
    if (node.parentNode !== box || node.nextElementSibling !== next) box.insertBefore(node, next);
    next = node;
  }
}
function drawPins() {
  const box = ui.bar.open;
  const ids = pinsShown();
  for (const id of ids) {
    const room = data.rooms.find((one) => one.id === id);
    const state = stateOf(room);
    const chip = pinChip(id);
    const lifted = pins.drag?.moved && pins.drag.id === id;
    chip.className = `sm-tb-room is-${busy.get(id) === 'starting' ? 'working' : state.key}${lifted ? ' bar-lifted' : ''}${pins.dropping === id ? ' is-moving' : ''}`;
    chip.querySelector('span').textContent = room.name;
    chip.lastChild.textContent = monogram(room.name);
    chip.title = `${room.name} · ${busy.get(id) === 'starting' ? t('Waking…') : state.words}`;
    chip.setAttribute('aria-label', room.name);
    if (room.open) { chip.href = addressOf(room); chip.removeAttribute('role'); chip.removeAttribute('tabindex'); }
    else { chip.removeAttribute('href'); chip.setAttribute('role', 'button'); chip.tabIndex = 0; }
  }
  for (const [id, chip] of pins.chips) if (!ids.includes(id)) { chip.remove(); pins.chips.delete(id); }
  pinsPlace(pins.drag?.order ?? (pins.dropping ? ids.filter((id) => id !== pins.dropping) : ids));
  box.classList.toggle('is-square', ids.length + (pins.dropping && !ids.includes(pins.dropping) ? 1 : 0) >= PINS_SQUARE);
  box.hidden = !ids.length && !pins.dropping && !pins.editing;
  pinsFit();
  if (pins.editing) { pinsBadges(); pinsDrawCard(); }
}

// When the rooms do not all fit, the last ones go behind «+n», which opens a small card with them.
// While the bar is arranged every room shows.
function pinsFit() {
  const box = ui.bar.open;
  for (const chip of pins.chips.values()) chip.classList.remove('is-spilled');
  pins.spilled = [];
  pins.more.hidden = true;
  if (pins.editing || pins.dropping || box.hidden || !box.clientWidth) { pinsCloseMore(); return; }
  const spills = () => box.scrollWidth > box.clientWidth + 1;
  if (!spills()) { pinsCloseMore(); return; }
  pins.more.hidden = false;
  const ids = pinsShown();
  while (ids.length && spills()) {
    const id = ids.pop();
    pins.chips.get(id)?.classList.add('is-spilled');
    pins.spilled.unshift(id);
    pins.more.textContent = `+${pins.spilled.length}`;
  }
  pins.more.title = t('{n} more', { n: pins.spilled.length });
  if (pins.moreCard && !pins.moreCard.hidden) pinsDrawMore();
}
function pinTile(room, onPress) {
  const tile = button('bar-tile', null, onPress);
  tile.dataset.barItem = room.id;
  const glyph = el('span', `bar-tile-glyph sm-pin-glyph is-${stateOf(room).key}`);
  glyph.innerHTML = FOLDER_GLYPH; // trusted: our own SVG string
  glyph.append(el('i'));
  tile.append(glyph, el('span', 'bar-tile-name', room.name));
  return tile;
}
function pinsDrawMore() {
  const card = pins.moreCard ??= (() => { const node = el('div', 'bar-card bar-more-card'); node.setAttribute('role', 'menu'); node.hidden = true; document.body.append(node); return node; })();
  const grid = el('div', 'bar-grid');
  for (const id of pins.spilled) {
    const room = data.rooms.find((one) => one.id === id);
    if (!room) continue;
    const tile = pinTile(room, () => { pinsCloseMore(); pins.chips.get(id)?.click(); });
    tile.setAttribute('role', 'menuitem');
    grid.append(tile);
  }
  card.replaceChildren(grid);
  card.hidden = false;
  const key = pins.more.getBoundingClientRect();
  const width = card.offsetWidth || 240;
  card.style.top = `${Math.round(key.bottom + 10)}px`;
  card.style.left = `${Math.round(Math.max(16, Math.min(window.innerWidth - width - 16, key.left)))}px`;
  card.style.right = 'auto';
  pins.more.setAttribute('aria-expanded', 'true');
}
function pinsCloseMore() {
  if (pins.moreCard) pins.moreCard.hidden = true;
  pins.more?.setAttribute('aria-expanded', 'false');
}

// The «−» of every room on the bar. They live in a layer of their own over the rooms (a link
// cannot hold a button) and follow their room every frame: its place, its tremble, its carry.
function pinsBadges() {
  const ids = pinsShown();
  for (const [id, badge] of pins.badges) if (!ids.includes(id)) { badge.remove(); pins.badges.delete(id); }
  ids.forEach((id, index) => {
    const delay = `${-((index * 97) % 260)}ms`;
    pins.chips.get(id)?.style.setProperty('--jiggle-delay', delay);
    let badge = pins.badges.get(id);
    if (!badge) {
      const name = data.rooms.find((one) => one.id === id)?.name ?? id;
      badge = button('bar-badge', null, (event) => { event.stopPropagation(); pinRemove(id); });
      badge.innerHTML = PIN_MINUS; // trusted: our own SVG string
      badge.title = t('Remove {name} from the bar', { name });
      badge.setAttribute('aria-label', badge.title);
      pins.badges.set(id, badge);
      pins.layer.append(badge);
    }
    badge.style.setProperty('--jiggle-delay', delay);
  });
  pinsFollow();
}
function pinsFollow() {
  for (const [id, badge] of pins.badges) {
    const chip = pins.chips.get(id);
    badge.hidden = !chip?.offsetWidth;
    if (badge.hidden) continue;
    badge.style.left = `${chip.offsetLeft - 5}px`;
    badge.style.top = `${chip.offsetTop - 5}px`;
    badge.style.transformOrigin = `${chip.offsetWidth / 2 + 5}px ${chip.offsetHeight / 2 + 5}px`;
    badge.style.translate = chip.style.translate || '';
  }
}
function pinsTick() {
  pins.frame = 0;
  if (!pins.editing) return;
  pinsFollow();
  pinsPlaceCard();
  pins.frame = requestAnimationFrame(pinsTick);
}
// The card under the bar: the projects that are not on it, a key to finish, and how to come back.
function pinsDrawCard() {
  if (!pins.card) {
    pins.card = el('section', 'bar-card sm-pins-card');
    pins.card.setAttribute('role', 'dialog');
    pins.card.setAttribute('aria-label', t('Add to the bar'));
    document.body.append(pins.card);
  }
  const ids = pinsShown();
  const offered = projectsInOrder().all.filter((room) => !ids.includes(room.id));
  // Drawn again only when what it offers changed, so a tile under the pointer stays put.
  const said = offered.map((room) => `${room.id}:${stateOf(room).key}`).join() + language;
  if (said === pins.cardSaid && !pins.card.hidden) { pinsPlaceCard(); return; }
  pins.cardSaid = said;
  const head = el('header', 'bar-card-head');
  const done = sxButton(t('Done'), () => pinsEdit(false), { tone: 'primary' });
  done.classList.add('bar-done');
  head.append(el('h3', null, t('Add to the bar')), done);
  const grid = el('div', 'bar-grid');
  for (const room of offered) {
    const tile = pinTile(room, () => pinAdd(room.id));
    tile.title = t('Add {name}', { name: room.name });
    tile.setAttribute('aria-label', tile.title);
    grid.append(tile);
  }
  pins.card.replaceChildren(head, grid.children.length ? grid : el('p', 'bar-card-empty', t('Everything is already on the bar.')), el('p', 'bar-card-hint', t('Drag a project to move it. A project comes to the bar from its card: right-click it, or drag it here.')));
  pins.card.hidden = false;
  pinsPlaceCard();
}
function pinsPlaceCard() {
  const card = pins.card;
  if (!card || card.hidden) return;
  const bar = ui.bar.open.closest('.sm-topbar').getBoundingClientRect();
  const from = ui.bar.open.getBoundingClientRect();
  const width = card.offsetWidth || 360;
  card.style.top = `${Math.round(bar.bottom + 10)}px`;
  card.style.left = `${Math.round(Math.max(16, Math.min(window.innerWidth - width - 16, from.left - 6)))}px`;
  card.style.right = 'auto';
}
function pinsEdit(on) {
  if (on === pins.editing) return;
  pins.editing = on;
  pinsCloseMenu();
  ui.bar.open.classList.toggle('is-editing', on);
  if (on) {
    pins.cardSaid = '';
    drawPins();
    pins.card?.querySelector('.bar-tile, .bar-done')?.focus({ preventScroll: true });
    if (!pins.frame) pins.frame = requestAnimationFrame(pinsTick);
    return;
  }
  cancelAnimationFrame(pins.frame);
  pins.frame = 0;
  pinsDragEnd({ save: true });
  for (const badge of pins.badges.values()) badge.remove();
  pins.badges.clear();
  if (pins.card) { pins.card.hidden = true; pins.card.replaceChildren(); }
  drawPins();
}

// Carrying a room to another place: it follows the pointer, the others make room as it passes
// their middle, and it settles where it is let go. The order is saved then.
function pinsDragStart(event, id) {
  if (event.button !== 0 || pins.drag) return;
  const chip = pins.chips.get(id);
  if (!chip || event.target.closest?.('.bar-badge')) return;
  const drag = { id, node: chip, x0: event.clientX, base: 0, moved: false, order: pinsShown() };
  drag.move = (moving) => pinsDragMove(moving);
  drag.up = () => pinsDragEnd({ save: true });
  pins.drag = drag;
  window.addEventListener('pointermove', drag.move);
  window.addEventListener('pointerup', drag.up);
  window.addEventListener('pointercancel', drag.up);
}
function pinsDragMove(event) {
  const drag = pins.drag;
  if (!drag) return;
  const dx = event.clientX - drag.x0;
  if (!drag.moved) {
    if (Math.abs(dx) < 5) return;
    drag.moved = true;
    drag.base = drag.node.offsetLeft;
    drag.node.classList.add('bar-lifted');
  }
  const centre = drag.base + dx + drag.node.offsetWidth / 2;
  const others = drag.order.filter((one) => one !== drag.id).map((one) => [one, pins.chips.get(one)]).filter(([, node]) => node);
  const past = others.find(([, node]) => centre < node.offsetLeft + node.offsetWidth / 2)?.[0] ?? null;
  const order = drag.order.filter((one) => one !== drag.id);
  order.splice(past ? order.indexOf(past) : order.length, 0, drag.id);
  if (order.join() !== drag.order.join()) {
    const before = new Map(others.map(([one, node]) => [one, node.offsetLeft]));
    drag.order = order;
    pinsPlace(order);
    // The rooms that moved slide from where they were, instead of jumping.
    for (const [one, node] of others) {
      const shift = before.get(one) - node.offsetLeft;
      if (shift && typeof node.animate === 'function' && !motionStill()) node.animate([{ translate: `${shift}px 0` }, { translate: '0 0' }], { duration: motionMs(180), easing: 'cubic-bezier(.2, .7, .2, 1)' });
    }
  }
  drag.node.style.translate = `${drag.base + dx - drag.node.offsetLeft}px 0`;
}
function pinsDragEnd({ save = false } = {}) {
  const drag = pins.drag;
  if (!drag) return;
  pins.drag = null;
  window.removeEventListener('pointermove', drag.move);
  window.removeEventListener('pointerup', drag.up);
  window.removeEventListener('pointercancel', drag.up);
  if (!drag.moved) return;
  const from = drag.node.style.translate;
  drag.node.style.translate = '';
  drag.node.classList.remove('bar-lifted');
  if (from && typeof drag.node.animate === 'function' && !motionStill()) drag.node.animate([{ translate: from }, { translate: '0 0' }], { duration: motionMs(160), easing: 'cubic-bezier(.2, .7, .2, 1)' });
  if (save) pinsWrite(drag.order);
}

// A project's card, right-clicked: pin it to the bar (or take it off), or arrange the bar.
function pinsCloseMenu() { pins.menu?.remove(); pins.menu = null; }
function pinsMenu(event, room, at = null) {
  event.preventDefault();
  pinsCloseMenu();
  const menu = el('div', 'bar-card sm-menu');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', room.name);
  const item = (words, icon, act, { danger = false } = {}) => {
    const one = button(`sm-menu-item${danger ? ' danger' : ''}`, null, () => { pinsCloseMenu(); act(); });
    one.setAttribute('role', 'menuitem');
    one.innerHTML = icon; // trusted: our own SVG strings
    one.append(el('span', null, words));
    menu.append(one);
  };
  const on = pinsShown().includes(room.id);
  item(on ? t('Remove from the bar') : t('Pin to the bar'), on ? UNPIN_ICON : PIN_ICON, () => (on ? pinRemove(room.id) : pinAdd(room.id)));
  item(t('Arrange the bar'), ARRANGE_ICON, () => pinsEdit(true));
  menu.append(el('i', 'sm-menu-sep'));
  item(t('Remove from MADRE…'), FORGET_ICON, () => { forgetting.add(room.id); asking.delete(room.id); failed.delete(room.id); draw(); }, { danger: true });
  menu.addEventListener('keydown', (key) => {
    const items = [...menu.querySelectorAll('.sm-menu-item')];
    const at = items.indexOf(document.activeElement);
    if (key.key === 'ArrowDown') { key.preventDefault(); items[(at + 1) % items.length].focus(); }
    if (key.key === 'ArrowUp') { key.preventDefault(); items[(at - 1 + items.length) % items.length].focus(); }
  });
  document.body.append(menu);
  pins.menu = menu;
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const point = at ?? { x: event.clientX, y: event.clientY };
  menu.style.left = `${Math.round(Math.max(8, Math.min(window.innerWidth - width - 8, point.x)))}px`;
  menu.style.top = `${Math.round(Math.max(8, Math.min(window.innerHeight - height - 8, point.y)))}px`;
  menu.style.right = 'auto';
  menu.querySelector('.sm-menu-item')?.focus({ preventScroll: true });
}

// A project's card, dragged to the bar: the bar shows where it would land, following the pointer,
// and it is pinned there when it is let go. A room already on the bar is moved instead.
function pinsDragOut(event, room) {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData(PIN_TYPE, room.id);
  event.dataTransfer.setData('text/plain', room.name);
  event.dataTransfer.effectAllowed = 'copyMove';
  pinsCloseMenu();
  pins.dropping = room.id;
  pins.slotAt = null;
  pins.slot = el('span', 'sm-tb-room sm-tb-slot');
  pins.slot.append(el('i'), el('span', null, room.name), el('b', 'sm-tb-mono', monogram(room.name)));
  document.body.classList.add('sm-pin-dragging');
  // The source card stays as it is while it is carried: the lobby is not drawn again under it.
  requestAnimationFrame(() => drawPins());
}
function pinsDropEnd() {
  if (!pins.dropping) return;
  pins.dropping = null;
  pins.slot?.remove();
  pins.slot = null;
  pins.slotAt = null;
  document.body.classList.remove('sm-pin-dragging');
  drawPins();
}
function pinsIndexAt(x) {
  const ids = pinsShown().filter((id) => id !== pins.dropping);
  const index = ids.findIndex((id) => { const box = pins.chips.get(id)?.getBoundingClientRect(); return box && x < box.left + box.width / 2; });
  return index < 0 ? ids.length : index;
}
{
  const box = ui.bar.open;
  pins.layer = el('div', 'bar-badges');
  box.append(pins.layer);
  pins.more = button('sm-tb-room is-more', '', (event) => { event.stopPropagation(); if (pins.moreCard && !pins.moreCard.hidden) pinsCloseMore(); else pinsDrawMore(); });
  pins.more.hidden = true;
  pins.more.setAttribute('aria-haspopup', 'menu');
  box.append(pins.more);
  const bar = box.closest('.sm-topbar');
  // While the bar is arranged a room is carried, not followed; a right-click between the rooms
  // puts the bar back, as a second right-click on a room does.
  box.addEventListener('click', (event) => {
    if (!pins.editing || event.target.closest?.('.bar-badge') || !event.target.closest?.('[data-bar-item]')) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  box.addEventListener('contextmenu', (event) => { if (pins.editing && !event.pinHandled) { event.preventDefault(); pinsEdit(false); } });
  // A press anywhere but the bar and its card puts the bar back; Escape too.
  document.addEventListener('pointerdown', (event) => {
    if (pins.menu && !pins.menu.contains(event.target)) pinsCloseMenu();
    if (pins.moreCard && !pins.moreCard.hidden && !pins.moreCard.contains(event.target) && !pins.more.contains(event.target)) pinsCloseMore();
    if (pins.editing && !box.contains(event.target) && !pins.card?.contains(event.target)) pinsEdit(false);
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (pins.menu) { pinsCloseMenu(); return; }
    if (pins.moreCard && !pins.moreCard.hidden) { pinsCloseMore(); return; }
    if (pins.editing) { event.preventDefault(); pinsEdit(false); }
  });
  window.addEventListener('resize', () => { pinsCloseMenu(); if (data) drawPins(); });
  window.addEventListener('scroll', () => pinsCloseMenu(), { passive: true });
  // The drop: anywhere on the bar, at the place nearest the pointer.
  bar.addEventListener('dragover', (event) => {
    if (!pins.dropping || !event.dataTransfer?.types.includes(PIN_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const at = pinsIndexAt(event.clientX);
    if (at !== pins.slotAt) { pins.slotAt = at; bar.classList.add('is-drop'); pinsPlace(pinsShown().filter((id) => id !== pins.dropping)); }
  });
  bar.addEventListener('dragleave', (event) => {
    if (!pins.dropping || bar.contains(event.relatedTarget)) return;
    pins.slotAt = null;
    bar.classList.remove('is-drop');
    pinsPlace(pinsShown().filter((id) => id !== pins.dropping));
  });
  bar.addEventListener('drop', (event) => {
    const id = event.dataTransfer?.getData(PIN_TYPE);
    if (!id) return;
    event.preventDefault();
    const at = pins.slotAt ?? pinsIndexAt(event.clientX);
    bar.classList.remove('is-drop');
    pinsDropEnd();
    pinAdd(id, at);
  });
  // Another tab arranged the bar: this one follows.
  window.addEventListener('storage', (event) => { if (event.key === PIN_KEY) { pins.saved = null; if (data) drawPins(); } });
}

ui.bar.links.addEventListener('click', () => { if ((data?.enlaces ?? []).length) { if (!ui.linksSheet.open) ui.linksSheet.showModal(); } else openLinkSheet(); });
ui.bar.update.addEventListener('click', () => openSettings('release'));
// RELOAD, as a room reloads (app.js, reloadWithGrace): the curtain of Home's own ground with MADRE's
// loader; the page goes with the share it reached and the new one fills the rest (salas-mac.html).
function reloadWithGrace() {
  if (motionStill() || document.querySelector('.reload-curtain')) { location.reload(); return; }
  const curtain = el('div', 'reload-curtain');
  const loader = makeLoader({ progress: 0.04 });
  curtain.append(loader);
  showCurtain(curtain);
  creep(loader, { to: 0.34, rate: 0.09 });
  setTimeout(() => {
    try { sessionStorage.setItem('madre.curtain', loader.dataset.p ?? '0.3'); } catch { /* the new page simply arrives */ }
    location.reload();
  }, 900);
}
ui.bar.reload.addEventListener('click', reloadWithGrace);

// From Home into a project, and back (2026-10-10): the page settles back under a veil of its own
// ground and goes (styles.css, madre-leaving); the room lifts the veil as it arrives. Every way in
// is a link — a card, a key on the bar, a tag, the Coordinator, the map — so a plain press on any
// link to a MADRE page goes through here; ⌘-click, a new tab or a page elsewhere is left alone.
function leaveTo(url) {
  if (motionStill()) { location.href = url; return; }
  root.classList.add('madre-leaving');
  setTimeout(() => { location.href = url; }, 200);
  setTimeout(() => root.classList.remove('madre-leaving'), 2500);
}
window.addEventListener('pageshow', () => root.classList.remove('madre-leaving'));
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
  let to = null;
  try { to = new URL(link.href, location.href); } catch { return; }
  if (to.protocol !== 'http:' || !/^(127\.0\.0\.1|localhost)$/.test(to.hostname)) return;
  if (to.origin === location.origin && to.pathname === location.pathname) return;
  event.preventDefault();
  leaveTo(to.href);
});

// What just happened, in a line (the room's notice: styles.css, .toast), at the foot of the screen
// and over any open sheet, for a few seconds.
let toastNode = null;
let toastTimer = 0;
function toast(words, tone = 'done') {
  toastNode?.remove();
  const node = el('div', 'toast sm-toast');
  node.setAttribute('role', 'status');
  node.dataset.tone = tone;
  node.append(el('i', 'toast-dot'), el('span', 'toast-text', words));
  document.body.append(node);
  if (typeof node.showPopover === 'function') { node.popover = 'manual'; node.showPopover(); }
  toastNode = node;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.remove(); if (toastNode === node) toastNode = null; }, 5000);
}

// ---- THE LOBBY (2026-10-10). The first screen of MADRE: every project on this Mac, BISHOP above
// them, and the way to add more. A bare `madre` opens here; `madre start` in a folder still opens
// that project directly.

const post = (url, payload) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload ?? {}) })
  .then(async (response) => ({ ok: response.ok, status: response.status, body: await response.json().catch(() => ({})) }))
  .catch(() => ({ ok: false, status: 0, body: {} }));
function mark(id, size = 40) {
  const brand = brandOf(id);
  const node = el('span', 'sm-mark');
  node.style.setProperty('--b', brand.solid ?? brand.color);
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
  b.go.textContent = waking ? t('Waking…') : t('Talk to the Coordinator');
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
    else leaveTo(address);
  });
}
function openBishop({ newTab = false } = {}) {
  if (!data) return;
  const address = bishopAddress();
  if (!address) { wakeBishop({ newTab }); return; }
  if (newTab) window.open(address, '_blank', 'noopener');
  else leaveTo(address);
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

// ---- Choosing folders (2026-10-10): tiles, a page at a time. Suggestions first (folders that look
// like projects in the places people keep them), or the folders of the home folder, walked one
// level at a time; a search narrows either. Several can be chosen; a folder already in Home says
// so and is not offered again. The sheet never runs past the screen: the tiles take as many rows
// as it holds, and ‹ › turn the page, so nothing scrolls inside it.
const SEARCH_GLYPH = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13.2 13.2 17 17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const PAGE_BACK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PAGE_ON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOLD_TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.4 6.8 11 12 5.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOLD_ROWS = 5;

// The tiles and their pages. How many rows is measured, not guessed: from five down to two, the
// most that keep the sheet inside the screen, measured again when the screen changes size. The
// grid keeps the height of its rows whatever the page holds, so turning a page or searching never
// moves the keys under it; a list that does not change (`snug`) takes only the rows it fills.
function foldPages({ snug = false } = {}) {
  const grid = el('div', 'sm-fold-grid');
  const pager = el('div', 'sm-pager');
  const back = button('sm-icon-key sm-page', null, () => turn(-1));
  const on = button('sm-icon-key sm-page', null, () => turn(1));
  back.innerHTML = PAGE_BACK; // trusted: our own SVG strings
  on.innerHTML = PAGE_ON;
  back.setAttribute('aria-label', t('Previous'));
  on.setAttribute('aria-label', t('Next'));
  const where = el('span', 'sm-page-where');
  pager.append(back, where, on);
  let items = [];
  let tile = () => null;
  let none = null;
  let page = 0;
  let rows = 4;
  let cols = 3;
  let seen = '';
  const per = () => rows * cols;
  const paint = () => {
    const pages = Math.max(1, Math.ceil(items.length / per()));
    page = Math.max(0, Math.min(page, pages - 1));
    grid.style.setProperty('--cols', String(cols));
    grid.style.setProperty('--rows', String(snug ? Math.max(1, Math.min(rows, Math.ceil(items.length / cols))) : rows));
    grid.replaceChildren(...items.slice(page * per(), (page + 1) * per()).map((item) => tile(item)));
    if (!items.length && none) grid.append(el('p', 'sm-fold-none', none()));
    pager.hidden = pages < 2;
    where.textContent = t('{n} of {total}', { n: page + 1, total: pages });
    back.disabled = page === 0;
    on.disabled = page >= pages - 1;
  };
  const turn = (step) => {
    page += step;
    paint();
    // The key pressed stays under the finger; at the last page it is the other one.
    if (document.activeElement === document.body || document.activeElement?.disabled) (step > 0 ? back : on).focus({ preventScroll: true });
  };
  const fit = () => {
    const layer = grid.closest('dialog');
    if (!grid.isConnected || !layer?.open || !grid.clientWidth) return;
    const key = `${grid.clientWidth}x${layer.clientHeight}`;
    if (key === seen) return;
    seen = key;
    cols = grid.clientWidth >= 540 ? 3 : grid.clientWidth >= 340 ? 2 : 1;
    rows = FOLD_ROWS;
    paint();
    while (rows > 2 && layer.scrollHeight > layer.clientHeight + 1) { rows -= 1; paint(); }
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => requestAnimationFrame(fit)).observe(grid);
  const resized = () => { if (!grid.isConnected) { window.removeEventListener('resize', resized); return; } seen = ''; requestAnimationFrame(fit); };
  window.addEventListener('resize', resized);
  return {
    grid,
    pager,
    show(list, { draw, empty = null, keepPage = false }) {
      items = list;
      tile = draw;
      none = empty;
      if (!keepPage) page = 0;
      paint();
    },
  };
}

// One folder as a tile: its mark (green when it looks like a project), its name and where it is.
// Chosen, the tile takes the accent and its mark a tick; a folder already in Home is only shown.
function foldTile({ name, path, note = null, project = true, known = false, checked = false, onToggle = null, enter = null }) {
  const item = el('label', `sm-fold${project ? ' is-project' : ''}${known ? ' known' : ''}${checked ? ' is-on' : ''}`);
  item.title = homeWord(path);
  const box = el('input');
  box.type = 'checkbox';
  box.checked = checked;
  box.disabled = known;
  box.addEventListener('change', () => { item.classList.toggle('is-on', box.checked); onToggle?.(box.checked); });
  const glyph = el('span', 'sm-fold-glyph');
  glyph.innerHTML = FOLDER_GLYPH; // trusted: our own SVG strings
  const tick = el('i', 'sm-fold-tick');
  tick.innerHTML = FOLD_TICK;
  glyph.append(tick);
  const words = el('span', 'sm-fold-words');
  words.append(el('b', null, name), el('small', null, note ?? homeWord(path)));
  item.append(box, glyph, words);
  if (enter) {
    const into = button('sm-into', null, (event) => { event.preventDefault(); enter(); });
    into.innerHTML = PAGE_ON;
    into.setAttribute('aria-label', t('Open {name}', { name }));
    into.title = t('Open {name}', { name });
    item.append(into);
  }
  return item;
}

function projectPicker({ onAdded = null, onChange = null, withAdd = true } = {}) {
  const chosen = new Map();     // path → name
  const node = el('div', 'sm-picker');
  const pages = foldPages();
  let source = 'found';         // found · browse
  let found = null;             // the suggestions, once read
  let here = null;              // the folder being walked, as /api/salas/folders answered
  let query = '';
  let touched = false;          // the person chose the list: an empty one is not left on its own
  const head = el('div', 'sm-picker-head');
  let seg = el('span');
  const search = el('label', 'settings-search sm-picker-search');
  search.innerHTML = SEARCH_GLYPH; // trusted: our own SVG string
  const input = el('input');
  input.type = 'search';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = t('Search a folder…');
  input.setAttribute('aria-label', t('Search a folder…'));
  input.addEventListener('input', () => { query = input.value.trim().toLocaleLowerCase(language); draw(); });
  search.append(input);
  head.append(seg, search);
  const line = el('div', 'sm-picker-line');
  const footer = el('div', 'sm-picker-foot');
  const count = el('span', 'sm-picked');
  const addButton = withAdd ? button('sm-btn primary', t('Add'), () => void add()) : null;
  const error = el('p', 'error');
  footer.append(pages.pager, count);
  if (addButton) footer.append(addButton);
  node.append(head, line, pages.grid, footer, error);
  const sync = () => {
    count.textContent = chosen.size ? (chosen.size === 1 ? t('1 folder chosen') : t('{n} folders chosen', { n: chosen.size })) : t('Choose one or more folders');
    if (addButton) {
      addButton.disabled = !chosen.size;
      addButton.textContent = chosen.size > 1 ? t('Add {n} projects', { n: chosen.size }) : t('Add project');
    }
    onChange?.(chosen.size);
  };
  const matches = (one) => !query || one.name.toLocaleLowerCase(language).includes(query) || homeWord(one.path).toLocaleLowerCase(language).includes(query);
  const tile = (one) => foldTile({
    ...one,
    note: one.known ? t('In Home') : null,
    checked: chosen.has(one.path),
    onToggle: (on) => { if (on) chosen.set(one.path, one.name); else chosen.delete(one.path); sync(); },
  });
  function draw({ keepPage = false } = {}) {
    const fresh = customSeg([['found', t('Found on this Mac')], ['browse', t('Your folders')]], source, (value) => {
      touched = true;
      source = value;
      draw();
      if (value === 'browse' && !here) void walk();
    }, 'two');
    seg.replaceWith(fresh);
    seg = fresh;
    const noMatch = () => t('No folder matches «{query}».', { query: input.value.trim() });
    if (source === 'found') {
      line.replaceChildren(el('span', 'sm-picker-note', found ? t('Folders that look like projects, in the places people keep them.') : t('Looking…')));
      pages.show(found ? found.filter(matches) : [], {
        draw: tile,
        empty: () => (!found ? t('Looking…') : query ? noMatch() : t('Nothing that looks like a project in the usual places. Look for it in Your folders.')),
        keepPage,
      });
      return;
    }
    line.replaceChildren();
    if (here?.parent) {
      const up = button('sm-btn ghost small sm-up', null, () => void walk(here.parent));
      up.innerHTML = PAGE_BACK; // trusted: our own SVG string
      up.append(el('span', null, t('Up')));
      line.append(up);
    }
    line.append(el('span', 'sm-where', here?.path ? homeWord(here.path) : t('Looking…')));
    const list = here?.entries
      ? [...(here.path !== here.home ? [{ name: t('This folder'), path: here.path, project: false }] : []), ...here.entries.map((one) => ({ ...one, enter: () => void walk(one.path) }))]
      : [];
    pages.show(list.filter(matches), {
      draw: tile,
      empty: () => (!here ? t('Looking…') : !here.entries ? (here.error ?? t('That folder is not there.')) : query ? noMatch() : t('No folders inside.')),
      keepPage,
    });
  }
  async function loadFound() {
    const answer = await fetch('/api/salas/suggestions', { cache: 'no-store' }).then((response) => response.json()).catch(() => ({ suggestions: [] }));
    found = answer.suggestions ?? [];
    // Nothing found and nothing chosen yet: the folders of the home folder, where it must be.
    if (!found.length && !touched && source === 'found') { source = 'browse'; if (!here) void walk(); }
    draw({ keepPage: true });
  }
  async function walk(path = null) {
    const answer = await fetch(`/api/salas/folders${path ? `?path=${encodeURIComponent(path)}` : ''}`, { cache: 'no-store' }).then((response) => response.json()).catch(() => null);
    here = answer ?? { error: t('That folder is not there.') };
    if (path !== null) { query = ''; input.value = ''; }
    if (source === 'browse') draw();
  }
  async function add() {
    error.textContent = '';
    if (addButton) addButton.disabled = true;
    const answer = await post('/api/salas/projects', { roots: [...chosen.keys()] });
    if (addButton) addButton.disabled = false;
    if (!answer.ok) { error.textContent = answer.body.refused?.[0]?.error ?? answer.body.error ?? t('They could not be added.'); return false; }
    if (answer.body.refused?.length) error.textContent = answer.body.refused.map((one) => `${homeWord(one.root)}: ${one.error}`).join(' · ');
    chosen.clear();
    sync();
    await refresh();
    const added = answer.body.added ?? [];
    if (added.length) toast(added.length === 1 ? t('{name} was added to Home.', { name: added[0].name }) : t('{n} projects were added to Home.', { n: added.length }));
    onAdded?.(added);
    void loadFound();
    if (here) void walk(here.path === here.home ? null : here.path);
    return true;
  }
  draw();
  void loadFound();
  sync();
  return { node, add, count: () => chosen.size };
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

// «Add a project», on its own: the picker in a sheet, under the welcome's scene of the projects.
let addSheet = null;
function openAddSheet() {
  if (addSheet) return;
  addSheet = el('dialog', 'sm-sheet sm-wide sm-add');
  const inner = el('div', 'sm-sheet-body');
  const head = el('header', 'sm-sheet-head');
  head.append(el('h3', null, t('Add a project')), closeKey(() => addSheet.close()));
  // The welcome's own scene over it: the folders dropping into Home.
  inner.append(head, wizardScene('projects'), el('p', 'hint', t('A project is a folder: MADRE gives it its own conversations and its own memory. Adding it does not open it; you open it from its card.')));
  inner.append(projectPicker({ onAdded: () => addSheet?.close() }).node);
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
    // Each folder lives in its own slot of the tray and drops into it, one after another.
    const tray = el('div', 'sm-tray');
    for (let index = 0; index < 5; index += 1) {
      const slot = el('i', 'sm-slot');
      slot.style.setProperty('--i', String(index));
      const folder = el('span', 'sm-fly');
      folder.innerHTML = FOLDER_GLYPH; // trusted: drawn here
      slot.append(folder);
      tray.append(slot);
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
    scene.append(beat, rooms);
  }
  return scene;
}
let wizard = null;
let wizardThen = null;          // what comes once the wizard closes: the chapters, after a bonjour
function openWizard({ then = null } = {}) {
  if (wizard) return;
  wizardThen = then;
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
    frame(t('Connect your agents'), t('Agents are the AI tools that write code, such as Claude Code or Codex. MADRE works with the ones already on this computer: each one is connected once, and every project uses it.'), fresh.node, actions, options);
    panel = fresh;
    await fresh.paint();
    fresh.live();
  }
  function projectsStep(options) {
    // What is chosen here is added on the way to the next step: one key, not two.
    const actions = el('div', 'actions');
    const next = button('sm-btn primary', t('Continue'), async () => {
      if (picker.count()) {
        next.disabled = true;
        const added = await picker.add();
        next.disabled = false;
        if (!added) return;
      }
      step = 2;
      openStep();
    });
    const picker = projectPicker({ withAdd: false, onChange: (n) => { next.textContent = n ? t('Add and continue') : t('Continue'); } });
    actions.append(button('sm-btn', t('Back'), () => { step = 0; void agentsStep({ back: true }); }), next);
    frame(t('Add your projects'), t('A project is a folder you work in. Choose yours: adding them does not open them; in the next step you pick which to open.'), picker.node, actions, options);
  }
  function openStep() {
    const projects = (data?.rooms ?? []).filter((room) => room.id !== data?.salas);
    const chosen = new Set();
    const pages = foldPages({ snug: true });
    const list = el('div', 'sm-picker');
    const foot = el('div', 'sm-picker-foot');
    foot.append(pages.pager);
    list.append(pages.grid, foot);
    pages.show(projects, {
      draw: (room) => foldTile({
        name: room.name,
        path: room.root ?? '',
        note: room.open ? t('Already open') : null,
        checked: Boolean(room.open) || chosen.has(room.id),
        known: Boolean(room.open),
        onToggle: (on) => { if (on) chosen.add(room.id); else chosen.delete(room.id); },
      }),
      empty: () => t('No projects yet. You can add them from Home whenever you like.'),
    });
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
    frame(t('Open what you will use'), t('Each open project runs on this Mac on its own. The rest stay in Home, asleep, until you open them.'), list, actions);
  }
  wizard.addEventListener('close', () => { stop(); wizard.remove(); wizard = null; void loadAgents(); const after = wizardThen; wizardThen = null; after?.(); });
  wizard.showModal();
  void agentsStep();
}

// ---- AJUSTES, as the room's (app.js, SETTINGS_SECTIONS and its sheets; 2026-10-10): a board of
// three sections, a card per category that already says how it stands and holds the one switch
// people reach for, the category in a sheet over the board, and one search for any setting. The
// window is the room's own (styles.css: #settings, .settings-*, .sx-*), not a likeness of it. The
// lobby sets what is the lobby's — how it looks, what its bar holds, the agents of this Mac,
// BISHOP's ways in, the projects and the version; a room's turns, memory or permissions are set
// in that room. Nothing scrolls inside the window: the screen behind it does.
const SET_SECTIONS = [
  ['You', 'How Home looks and what its bar holds', ['look', 'bar']],
  ['The agents', 'Who works on this Mac', ['agents', 'bishop']],
  ['System', 'The projects of this Mac and the version', ['projects', 'release']],
];
// The room's own icons where the room has the category (app.js, SETTINGS_CATS); the bar, BISHOP
// and the projects drawn here in the same hand: 20×20, one round stroke.
const SET_CATS = {
  look: { name: 'Appearance', icon: '<circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/>' },
  bar: { name: 'Top bar', icon: '<rect x="2.6" y="5.4" width="14.8" height="9.2" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.2 10h2.2M11.6 10h2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
  agents: { name: 'Agents', icon: '<circle cx="7" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="13.6" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 16c.6-2.3 2.2-3.6 4.2-3.6s3.6 1.3 4.2 3.6M9.6 13c.9-.4 2.4-.6 4-.6 2 0 3.6 1.3 4.2 3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' },
  bishop: { name: 'Coordinator', icon: '<path d="M2.6 10c1.7-3.1 4.3-4.8 7.4-4.8s5.7 1.7 7.4 4.8c-1.7 3.1-4.3 4.8-7.4 4.8S4.3 13.1 2.6 10z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="10" r="2.3" fill="currentColor"/>' },
  projects: { name: 'Projects', icon: '<path d="M3.5 6.2c0-.9.7-1.6 1.6-1.6h3l1.6 1.8h5.2c.9 0 1.6.7 1.6 1.6v6.4c0 .9-.7 1.6-1.6 1.6H5.1c-.9 0-1.6-.7-1.6-1.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' },
  release: { name: 'Version', icon: '<path d="M15.6 10a5.6 5.6 0 1 1-1.64-3.96" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M15.7 3.6v3.2h-3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' },
};
const SET_ORDER = ['look', 'bar', 'agents', 'bishop', 'projects', 'release'];
// The words the search knows, each pointing to the category that holds it (app.js, SETTINGS_INDEX).
const SET_INDEX = [
  ['look', 'Preview'], ['look', 'Theme'], ['look', 'Accent'], ['look', 'Wallpaper'], ['look', 'Intensity'], ['look', 'Blur'], ['look', 'Project cards'], ['look', 'Text'], ['look', 'Project order'], ['look', 'Language'],
  ['bar', 'Arrange the bar'], ['bar', 'Back to default'],
  ['bishop', 'Talk to the Coordinator'], ['bishop', 'Open the Coordinator in a new tab'],
  ['projects', 'Add a project'], ['projects', 'See the welcome again'], ['projects', 'The tour of MADRE 1.0'],
  ['release', 'Check now'],
];
const THEME_WORDS = { auto: () => t('Automatic'), light: () => t('Light'), dark: () => t('Dark') };
const catName = (id) => t(SET_CATS[id].name);
const setIcon = (id) => { const span = el('span', 'settings-icon'); span.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true">${SET_CATS[id].icon}</svg>`; span.style.setProperty('--cat', 'var(--phosphor)'); return span; }; // trusted: our own SVG strings
const CHEVRON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.2 6.2 8 10l3.8-3.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const chevron = (className) => { const mark = el('span', `${className} chev-icon`); mark.innerHTML = CHEVRON; return mark; }; // trusted: our own SVG string
const fold = (text) => String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const bishopRoom = () => data?.rooms.find((room) => room.id === data.salas) ?? null;

// The pieces every sheet is built from, the room's (app.js, sxBlock, sxRow, sxButton): a block is a
// card with a title and a line about it, then its rows; a row says what it is on the left and
// holds its control on the right.
function sxBlock(host, title, about = null, { aside = null, className = '' } = {}) {
  const block = el('section', `sx-block${className ? ` ${className}` : ''}`);
  const head = el('header', 'sx-head');
  const words = el('div', 'sx-words');
  words.append(el('h3', null, title));
  if (about) words.append(el('p', null, about));
  head.append(words);
  if (aside) head.append(aside);
  block.rows = el('div', 'sx-rows');
  block.append(head, block.rows);
  host.append(block);
  return block;
}
function sxRow(block, label, hint, control = null, { stack = false } = {}) {
  const row = el('div', `sx-row${stack ? ' stack' : ''}`);
  const words = el('div', 'sx-words');
  words.append(el('b', null, label));
  if (hint) words.append(el('span', 'sx-hint', hint));
  row.append(words);
  if (control) { const box = el('div', 'sx-control'); box.append(control); row.append(box); }
  block.rows.append(row);
  return row;
}
const sxButton = (words, click, { tone = null } = {}) => button(`sx-btn${tone ? ` ${tone}` : ''}`, words, click);
// A choice of a few, on the rail PERSONALIZE uses (app.js, drawCustom, segmented).
function customSeg(options, current, pick, size = '') {
  const seg = el('div', `custom-seg${size ? ` ${size}` : ''}`);
  seg.setAttribute('role', 'radiogroup');
  for (const [value, words] of options) {
    const option = button('seg-option', words, () => { if (value !== current) pick(value); });
    option.setAttribute('role', 'radio');
    option.setAttribute('aria-checked', String(value === current));
    seg.append(option);
  }
  return seg;
}

// How each category stands, in a line, from what the lobby already knows; nothing is guessed.
function setStatus(id) {
  const looks = readLooks();
  if (id === 'look') return { line: `${THEME_WORDS[looks.theme]()} · ${WALLPAPER_WORDS[looks.wallpaper]()} · ${ACCENT_WORDS[looks.accent]()}` };
  if (id === 'bar') {
    if (!pinsStored()) return { line: t('The open projects, as they open') };
    const count = pinsShown().length;
    return { line: count ? t('{n} projects pinned', { n: count }) : t('Nothing pinned') };
  }
  if (id === 'agents') {
    if (!agentsSeen) return { line: t('Reading…') };
    const here = agentsSeen.agents.filter((agent) => agent.id !== 'madre' && agent.detected);
    const off = here.filter((agent) => !agentState(agent, agentsSeen).ok);
    return { line: t('{n} of {total} signed in', { n: here.length - off.length, total: here.length }), warn: off.length ? t('{agents} without a session', { agents: off.map((agent) => agent.label ?? agent.id).join(', ') }) : null };
  }
  if (id === 'bishop') { const room = bishopRoom(); return { line: room ? stateOf(room).words : t('Reading…') }; }
  if (id === 'projects') {
    if (!data) return { line: t('Reading…') };
    const { all, open } = projectsInOrder();
    return { line: t('{n} projects · {open} open', { n: all.length, open: open.length }) };
  }
  if (id === 'release') {
    if (!versionSeen) return { line: t('Reading…') };
    return { line: `MADRE ${versionSeen.current} · ${versionSeen.available ? t('{version} available', { version: versionSeen.latest }) : t('up to date')}`, warn: versionSeen.available ? t('{version} is on npm', { version: versionSeen.latest }) : null };
  }
  return { line: '' };
}

// The one thing people reach for, on the card itself: changing it opens nothing.
function setQuick(id) {
  const rows = el('div', 'settings-quick');
  const add = (label, control) => { const row = el('div', 'settings-quick-row'); row.append(el('span', null, label), control); rows.append(row); };
  if (id === 'look') {
    const { theme } = readLooks();
    const seg = el('div', 'settings-seg');
    for (const [value, word] of [['auto', t('Auto')], ['light', t('Light')], ['dark', t('Dark')]]) {
      seg.append(button(value === theme ? 'on' : null, word, (event) => { event.stopPropagation(); saveLooks({ theme: value }); }));
    }
    add(t('Theme'), seg);
  }
  if (id === 'bar') add(t('Arrange the bar'), sxButton(t('Arrange'), (event) => { event.stopPropagation(); settingsSheet?.close(); pinsEdit(true); }));
  if (id === 'agents' && agentsSeen) {
    for (const agent of agentsSeen.agents.filter((one) => one.id !== 'madre' && one.detected)) {
      const state = agentState(agent, agentsSeen);
      const row = el('div', 'settings-quick-row agent');
      const who = el('span', 'who', agent.label ?? agent.id);
      who.style.setProperty('--agent', brandOf(agent.id).color);
      row.append(who, el('span', `state session-lamp ${state.ok ? 'on ok' : state.key === 'bad' ? 'off bad' : 'wait'}`, state.ok ? t('signed in') : state.key === 'bad' ? t('no session') : t('unknown')));
      rows.append(row);
    }
  }
  return rows.children.length ? rows : null;
}

// What MADRE looks like with these choices: the room's preview, built as the room builds it
// (app.js, drawCustom), wearing the choices, so the bubbles and the text — which the lobby has no
// conversation to show — are seen before they are lived with.
// The preview is Home itself, small (2026-10-11): its bar with the projects on it, the
// Coordinator, and two of your projects as cards, on the wallpaper, theme and accent chosen, with
// the cards, the text and the order Home's own choices give them. It wears the room's preview
// (styles.css, .look-preview) for the ground, so the wallpaper reads exactly as it will.
function lookPreview(looks) {
  const preview = el('div', 'look-preview sm-home-preview');
  preview.setAttribute('aria-hidden', 'true');
  Object.assign(preview.dataset, { accent: looks.accent, wallpaper: looks.wallpaper, wpStyle: looks.style, homeCards: looks.home.cards, homeText: looks.home.text });
  preview.style.setProperty('--veil-k', String(looks.veil / 100));
  preview.style.setProperty('--wp-blur', `${looks.blur}px`);
  preview.dataset.scheme = root.dataset.scheme ?? 'dark';
  const shown = (data ? projectsInOrder().all : []).slice(0, 2);
  const names = shown.length ? shown.map((room) => room.name) : ['pulse', 'tienda'];
  const bar = el('div', 'hp-bar');
  bar.append(el('i', 'hp-logo'), el('b', null, t('Home')));
  for (const name of names) { const pin = el('span', 'hp-pin'); pin.append(el('i'), name); bar.append(pin); }
  const grid = el('div', 'hp-grid');
  const coord = el('div', 'hp-tile hp-coord');
  const head = el('div', 'hp-head');
  head.append(el('span', 'hp-mark'), el('b', null, t('Coordinator')));
  coord.append(head, el('small', null, t('Calm')), el('span', 'hp-key', t('Talk to the Coordinator')));
  grid.append(coord);
  names.forEach((name, index) => {
    const card = el('div', 'hp-tile hp-card');
    const state = el('small', 'hp-state');
    state.append(el('i'), index ? t('Asleep') : t('Calm'));
    card.append(el('b', null, name), state, el('span', 'hp-chat'), el('span', 'hp-strip'), el('span', `hp-key${index ? '' : ' on'}`, t('Open')));
    grid.append(card);
  });
  preview.append(bar, grid);
  return preview;
}

// The sheets. Appearance is the room's own sheet of PERSONALIZE inside AJUSTES (app.js,
// drawCustom with customWindow.instant): the preview first, then the colours, the wallpaper, the
// conversation and the language, each applied as it is touched.
function fillLook(host) {
  host.classList.add('settings-look');
  const looks = readLooks();
  // Where the choices are kept, and the way back to MADRE as it comes, on one line above it all.
  const top = el('div', 'sm-look-top');
  top.append(el('p', 'sx-intro', t('Kept in this browser. Theme, accent and wallpaper also dress the project served at this address.')));
  host.append(top);
  // Two columns when the window is wide (it opens over the whole window): the preview, with how
  // the conversation reads and the language under it; the colours and the wallpaper beside it. So
  // the whole of Appearance is seen at once.
  const frame = el('div', 'sx-look sm-look');
  const side = el('div', 'sm-look-side');
  const preview = lookPreview(looks);
  sxBlock(side, t('Preview'), t('Your choices, on Home itself.'), { className: 'sx-preview' }).rows.append(preview);
  const page = el('div', 'sx-look-controls');
  frame.append(side, page);

  const named = el('span', 'custom-current', ACCENT_WORDS[looks.accent]());
  const colour = sxBlock(page, t('Colour'), null, { aside: named });
  sxRow(colour, t('Theme'), t('Automatic follows your system.'), customSeg(['auto', 'light', 'dark'].map((value) => [value, THEME_WORDS[value]()]), looks.theme, (value) => saveLooks({ theme: value }), 'three'));
  const swatches = el('div', 'custom-swatches');
  swatches.setAttribute('role', 'radiogroup');
  for (const id of ACCENTS) {
    const swatch = button('swatch', null, () => saveLooks({ accent: id }));
    swatch.dataset.swatch = id;
    swatch.setAttribute('role', 'radio');
    swatch.setAttribute('aria-checked', String(id === looks.accent));
    swatch.setAttribute('aria-label', ACCENT_WORDS[id]());
    // The colour's name sits beside COLOUR: the one picked, or the one under the pointer.
    const say = () => { named.textContent = ACCENT_WORDS[id](); named.classList.toggle('peek', id !== looks.accent); };
    const back = () => { named.textContent = ACCENT_WORDS[looks.accent](); named.classList.remove('peek'); };
    swatch.addEventListener('pointerenter', say);
    swatch.addEventListener('focus', say);
    swatch.addEventListener('pointerleave', back);
    swatch.addEventListener('blur', back);
    swatches.append(swatch);
  }
  sxRow(colour, t('Accent'), t('Each colour in dark (top) and in light (bottom). The permission modes keep their own.'), swatches, { stack: true });

  const photo = looks.wallpaper !== 'default';
  const papers = el('div', 'custom-papers');
  papers.setAttribute('role', 'radiogroup');
  for (const value of WALLPAPERS) {
    const paper = button('paper', null, () => saveLooks({ wallpaper: value }));
    paper.dataset.wp = value;
    paper.setAttribute('role', 'radio');
    paper.setAttribute('aria-checked', String(value === looks.wallpaper));
    paper.append(el('span', 'paper-swatch'), el('span', 'paper-name', WALLPAPER_WORDS[value]()));
    papers.append(paper);
  }
  const paperBox = el('div', 'paper-box');
  paperBox.append(papers);
  if (photo) {
    // A photograph: layer or mesh, how strong, how blurred. The dials move the lobby and the
    // preview while they are dragged, and are kept when they are let go.
    const tune = el('div', 'paper-tune');
    tune.append(customSeg([['veil', t('Layer')], ['mesh', t('Mesh')]], looks.style, (value) => saveLooks({ style: value }), 'two'));
    const dial = (name, label) => {
      const spec = TUNES[name];
      const line = el('label', 'tune-row');
      const value = el('span', 'tune-value', spec.shown(looks[name]));
      const input = el('input', 'tune-range');
      input.type = 'range';
      input.min = String(spec.min); input.max = String(spec.max); input.step = String(spec.step);
      input.value = String(looks[name]);
      const fill = (v) => input.style.setProperty('--fill', `${((v - spec.min) / (spec.max - spec.min)) * 100}%`);
      fill(looks[name]);
      input.addEventListener('input', () => {
        const v = Number(input.value);
        spec.apply(v);
        if (name === 'veil') preview.style.setProperty('--veil-k', String(v / 100)); else preview.style.setProperty('--wp-blur', `${v}px`);
        value.textContent = spec.shown(v);
        fill(v);
      });
      input.addEventListener('change', () => saveTune(name, Number(input.value)));
      line.append(el('span', 'tune-name', label), input, value);
      return line;
    };
    tune.append(dial('veil', t('Intensity')), dial('blur', t('Blur')));
    paperBox.append(tune);
  }
  sxBlock(page, t('Wallpaper'), photo
    ? t('A photograph wears the project\'s ground as a layer or as a mesh of its own colours: choose how strong it is and how much the photograph blurs.')
    : t('Behind Home, and behind the conversation of the project served at this address. Light and dark each have their own.')).rows.append(paperBox);

  // Home's own: its cards, its text, the order of its projects. The conversation's bubbles and text
  // are each project's, in its own Settings.
  const home = sxBlock(side, t('Home'), t('Only for Home: each project keeps its conversation as you set it there.'));
  const homeSeg = (name) => customSeg(HOME_LOOKS[name].values.map((value) => [value, HOME_LOOKS[name].words[value]()]), looks.home[name], (value) => saveHome(name, value), HOME_LOOKS[name].values.length === 2 ? 'two' : 'three');
  sxRow(home, t('Project cards'), null, homeSeg('cards'), { stack: true });
  sxRow(home, t('Text'), null, homeSeg('text'), { stack: true });
  sxRow(home, t('Project order'), null, homeSeg('order'), { stack: true });

  const words = sxBlock(side, t('Language'));
  sxRow(words, t('Interface'), t('The page reloads in it when you choose to.'), customSeg([['es', 'Español'], ['en', 'English']], language, async (code) => {
    try { localStorage.setItem('pulse.language', code); } catch { /* no storage */ }
    await post('/api/language', { language: code });
    reloadWithGrace();
  }, 'two'));

  const homeDefault = Object.entries(HOME_LOOKS).every(([name, spec]) => looks.home[name] === spec.values[0]);
  const atDefault = looks.accent === 'madre' && looks.wallpaper === 'default' && looks.style === 'veil' && looks.veil === TUNES.veil.value && looks.blur === TUNES.blur.value && homeDefault;
  if (!atDefault) {
    top.append(sxButton(t('Back to default'), () => {
      for (const name of ['veil', 'blur']) saveTune(name, TUNES[name].value);
      for (const [name, spec] of Object.entries(HOME_LOOKS)) { try { localStorage.removeItem(spec.key); } catch { /* this page only */ } }
      saveLooks({ accent: 'madre', wallpaper: 'default', style: 'veil' });
      draw();
    }));
  }
  host.append(frame);
}
function fillBar(host) {
  const block = sxBlock(host, t('Top bar'), t('The projects you keep at hand, in the order you choose. A project comes to the bar from its card: right-click it, or drag it to the bar.'));
  const ids = pinsShown();
  if (!ids.length) sxRow(block, t('Nothing pinned'), null);
  for (const id of ids) {
    const room = data.rooms.find((one) => one.id === id);
    sxRow(block, room.name, stateOf(room).words, sxButton(t('Remove'), () => pinRemove(id)));
  }
  const acts = el('div', 'sx-actions end');
  if (pinsStored()) acts.append(sxButton(t('Back to default'), () => pinsReset()));
  acts.append(sxButton(t('Arrange the bar'), () => { settingsSheet?.close(); pinsEdit(true); }, { tone: 'primary' }));
  host.append(acts);
}
function fillAgents(host, keep) {
  const block = sxBlock(host, t('Agents'), t('MADRE works with the AI tools already on this computer. Each one is connected once, and every project uses it.'));
  const panel = agentsPanel({ onPaint: () => settingsSheet?.sync() });
  block.rows.append(panel.node);
  keep(panel.stop);
  void panel.paint().then(() => panel.live());
}
function fillBishop(host) {
  const room = bishopRoom();
  const block = sxBlock(host, t('Coordinator'), t('Its agent and its mode are chosen in its own project.'));
  sxRow(block, t('Talk to the Coordinator'), room ? stateOf(room).words : null, sxButton(t('Open'), () => { settingsSheet?.close(); openBishop(); }, { tone: 'primary' }));
  sxRow(block, t('Open the Coordinator in a new tab'), null, sxButton(t('Open'), () => openBishop({ newTab: true })));
}
function fillProjects(host) {
  const block = sxBlock(host, t('Projects'), t('A project is a folder: MADRE gives it its own conversations and its own memory. Adding it does not open it; you open it from its card.'));
  sxRow(block, t('Add a project'), null, sxButton(t('Add'), () => { settingsSheet?.close(); openAddSheet(); }, { tone: 'primary' }));
  sxRow(block, t('See the welcome again'), null, sxButton(t('Open'), () => { settingsSheet?.close(); welcomed = true; openWizard(); }));
  sxRow(block, t('The tour of MADRE 1.0'), t('Everything new, chapter by chapter. ? opens the gestures anywhere.'), sxButton(t('See the tour'), () => { settingsSheet?.close(); homeTour.openChapters(); }));
}
function fillRelease(host) {
  const info = versionSeen;
  const block = sxBlock(host, t('Version'), info ? t('You run {version}. Home restarts with it from here.', { version: info.current }) : null);
  const check = info?.enabled ? sxButton(t('Check now'), async () => {
    check.disabled = true;
    const answer = await fetch('/api/version?force=1', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
    if (answer) versionSeen = answer;
    drawAttention();
    drawTopbar();
    settingsSheet?.sync({ detail: true });
  }) : null;
  sxRow(block, `MADRE ${info?.current ?? ''}`.trim(), info ? (info.available ? t('{version} available', { version: info.latest }) : t('up to date')) : t('Reading…'), check);
  if (info?.available) {
    const notes = el('a', 'sx-btn', t('What it brings'));
    notes.href = info.release ?? 'https://madre.run';
    notes.target = '_blank';
    notes.rel = 'noopener';
    sxRow(block, `MADRE ${info.latest}`, t('MADRE {version} is out.', { version: info.latest }), notes);
    // Home restarts with it, as a project does (app.js, drawRelease): the whole page waits on the
    // curtain with MADRE's loader through the version arriving, Home closed, and Home back.
    if (info.install !== 'source') {
      const fresh = sxBlock(host, t('Restart Home with {version}', { version: info.latest }), t('Home closes, installs it and comes back on this same address in a few seconds. The open projects keep their version until you restart them.'));
      const said = el('p', 'sx-hint');
      const restart = sxButton(t('Restart with {version}', { version: info.latest }), () => void updateHome(info, restart, said), { tone: 'primary' });
      sxRow(fresh, t('Restart here'), null, restart);
      fresh.rows.append(said);
    } else {
      sxRow(block, t('Pull the repository and start it again.'), null);
    }
  }
  // Home already runs the newer one: the projects still on the older one, each with its restart.
  const behind = behindRooms();
  if (behind.length) {
    const late = sxBlock(host, t('Projects on an older MADRE'), t('They keep running the version they started with until you restart them. What is running in them stops.'));
    for (const room of behind) sxRow(late, roomLabel(room), `MADRE ${room.open.version}`, sxButton(t('Restart'), () => { settingsSheet?.close(); void restartRoom(room); }));
  }
}
async function updateHome(info, key, said) {
  key.disabled = true;
  said.textContent = '';
  const curtain = el('div', 'reload-curtain');
  const loader = makeLoader({ progress: 0.04, label: t('Downloading MADRE {version}…', { version: info.latest }) });
  curtain.append(loader);
  showCurtain(curtain);
  const drop = (words) => { stop(); curtain.classList.add('leaving'); setTimeout(() => curtain.remove(), 760); key.disabled = false; said.textContent = words; };
  let stop = creep(loader, { to: 0.45, rate: 0.02 });
  const answer = await post('/api/updates/apply');
  if (!answer.ok) { drop(answer.body.error ?? t('The update did not start.')); return; }
  stop();
  setLoader(loader, 0.5, t('Restarting MADRE…'));
  stop = creep(loader, { to: 0.88, rate: 0.015, every: 400 });
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const next = await fetch('/api/version', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null);
    if (next?.current && next.current !== info.current) {
      stop();
      setLoader(loader, 0.94, t('MADRE {version} is ready', { version: next.current }));
      try { sessionStorage.setItem('madre.curtain', loader.dataset.p ?? '0.94'); } catch { /* it simply arrives */ }
      setTimeout(() => location.reload(), 420);
      return;
    }
  }
  drop(t('Home did not come back on its own. Start MADRE again from your terminal.'));
}
const SET_FILL = { look: fillLook, bar: fillBar, agents: fillAgents, bishop: fillBishop, projects: fillProjects, release: fillRelease };

let settingsSheet = null;
function openSettings(section = null) {
  if (settingsSheet) { settingsSheet.show(section); return; }
  const state = { open: null, query: '', stops: [] };
  const dialog = el('dialog', 'sm-sheet sm-settings');
  dialog.setAttribute('aria-label', t('Home settings'));
  // The room's window, by its own name, so it wears exactly what the room's wears.
  const win = el('div', 'sm-sheet-body sm-settings-window');
  win.id = 'settings';
  const head = el('header', 'custom-head settings-head');
  const search = el('label', 'settings-search');
  search.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13.2 13.2 17 17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'; // trusted: our own SVG
  const input = el('input');
  input.type = 'search';
  input.placeholder = t('Search any setting');
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', t('Search any setting'));
  search.append(input);
  head.append(el('span', 'custom-title', t('SETTINGS')), search, closeKey(() => dialog.close()));
  const body = el('div', 'sm-settings-body');
  win.append(head, body);
  dialog.append(win);
  document.body.append(dialog);

  const stop = () => { for (const one of state.stops.splice(0)) one(); };
  const card = (id) => {
    const status = setStatus(id);
    const node = el('div', `settings-card${state.open === id ? ' open' : ''}`);
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.dataset.cat = id;
    const top = el('div', 'settings-card-head');
    top.append(setIcon(id), el('b', null, catName(id)), chevron('settings-go'));
    node.append(top, el('p', 'settings-line', status.line));
    if (status.warn) node.append(el('p', 'settings-warn', status.warn));
    const quick = setQuick(id);
    if (quick) node.append(quick);
    node.addEventListener('click', () => openCategory(id));
    node.addEventListener('keydown', (event) => { if (event.target === node && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openCategory(id); } });
    return node;
  };
  const board = () => {
    const node = el('div', 'settings-board');
    for (const [name, sub, ids] of SET_SECTIONS) {
      const section = el('section', 'settings-section');
      const top = el('header');
      top.append(el('b', null, t(name)), el('span', null, t(sub)));
      const cards = el('div', 'settings-cards');
      for (const id of ids) cards.append(card(id));
      section.append(top, cards);
      node.append(section);
    }
    return node;
  };
  const detail = (id) => {
    const node = el('div', 'settings-detail');
    const top = el('div', 'settings-detail-head');
    const title = el('div', 'settings-detail-title');
    const back = el('button', 'settings-back');
    back.type = 'button';
    back.title = t('Back to settings');
    back.setAttribute('aria-label', t('Back to settings'));
    back.append(chevron('settings-back-icon'));
    back.addEventListener('click', () => closeCategory());
    title.append(back, setIcon(id), el('b', null, catName(id)));
    top.append(title, el('p', 'settings-line', setStatus(id).line));
    const host = el('div', 'settings-host');
    node.append(top, host);
    SET_FILL[id](host, (one) => state.stops.push(one));
    return node;
  };
  const results = () => {
    const wanted = fold(state.query.trim());
    const list = el('div', 'settings-results');
    const hits = [];
    for (const id of SET_ORDER) if (fold(catName(id)).includes(wanted)) hits.push([id, null]);
    for (const [id, key] of SET_INDEX) if (fold(t(key)).includes(wanted)) hits.push([id, t(key)]);
    for (const agent of agentsSeen?.agents ?? []) if (agent.id !== 'madre' && fold(agent.label ?? agent.id).includes(wanted)) hits.push(['agents', agent.label ?? agent.id]);
    if (!hits.length) { list.append(el('p', 'settings-reading', t('Nothing called «{query}».', { query: state.query.trim() }))); return list; }
    for (const [id, said] of hits.slice(0, 40)) {
      const row = el('button', 'settings-result');
      row.type = 'button';
      row.append(setIcon(id), el('b', null, said ?? catName(id)), el('span', null, catName(id)));
      row.addEventListener('click', () => { state.query = ''; input.value = ''; openCategory(id, said); });
      list.append(row);
    }
    return list;
  };
  const draw = () => {
    stop();
    if (state.query.trim()) { body.replaceChildren(results()); return; }
    if (!state.open) { body.replaceChildren(board()); return; }
    // Appearance has more to show than a sheet holds: it takes the whole window, as a category
    // does in the room when a sheet would be cramped (app.js, «push»). The others open over the board.
    const full = state.open === 'look';
    const sheet = el('div', `settings-sheet${full ? ' full' : ''}`);
    const scroll = el('div', 'settings-scroll');
    scroll.append(detail(state.open));
    sheet.append(scroll);
    if (full) { body.replaceChildren(sheet); return; }
    const scrim = el('div', 'settings-scrim');
    scrim.addEventListener('click', () => closeCategory());
    body.replaceChildren(board(), scrim, sheet);
  };
  const openCategory = (id, landOn = null) => {
    state.open = id;
    draw();
    dialog.scrollTop = 0;
    if (!landOn) { body.querySelector('.settings-back')?.focus({ preventScroll: true }); return; }
    // Land on the setting the search found, once its sheet has drawn.
    let tries = 0;
    const land = () => {
      const hit = [...body.querySelectorAll('.settings-detail :is(.sx-row b, .sx-head h3, .tune-name, button)')].find((node) => fold(node.textContent).includes(fold(landOn)));
      if (hit) { hit.scrollIntoView({ block: 'center', behavior: 'smooth' }); const row = hit.closest('.sx-row, .tune-row, .sx-block') ?? hit; row.classList.add('settings-found'); setTimeout(() => row.classList.remove('settings-found'), 1600); return; }
      if ((tries += 1) < 20) setTimeout(land, 150);
    };
    setTimeout(land, 60);
  };
  const closeCategory = () => {
    const was = state.open;
    state.open = null;
    draw();
    body.querySelector(`.settings-card[data-cat="${was}"]`)?.focus({ preventScroll: true });
  };
  input.addEventListener('input', () => { state.query = input.value; draw(); });
  // Escape steps back the way the person came: out of the search, out of the sheet, then away.
  dialog.addEventListener('cancel', (event) => {
    if (state.query) { event.preventDefault(); state.query = ''; input.value = ''; draw(); return; }
    if (state.open) { event.preventDefault(); closeCategory(); }
  });
  // What the lobby learns while the window is open (an agent signs in, a version is found, a
  // project opens) reaches the cards and the sheet's line; a card that says the same is left alone,
  // so nothing under the pointer or the keyboard is drawn again for nothing.
  const sync = ({ detail: again = false } = {}) => {
    if (state.query.trim()) return;
    for (const old of body.querySelectorAll('.settings-card')) {
      const fresh = card(old.dataset.cat);
      if (fresh.outerHTML !== old.outerHTML) old.replaceWith(fresh);
    }
    const line = body.querySelector('.settings-detail-head .settings-line');
    if (line && state.open) line.textContent = setStatus(state.open).line;
    // The sheet stays where it is (it slid in once); only what is inside it is drawn again.
    const scroll = body.querySelector('.settings-scroll');
    if (again && state.open && scroll) { stop(); scroll.replaceChildren(detail(state.open)); }
  };
  // A look changed (here, in a room's PERSONALIZE at this address, or in another tab): the cards
  // say so, and Appearance is drawn again with it.
  const paintLooks = () => { sync({ detail: state.open === 'look' }); };
  const show = (wanted) => {
    if (!dialog.open) dialog.showModal();
    if (wanted && SET_FILL[wanted]) openCategory(wanted); else draw();
  };
  const close = () => dialog.close();
  settingsSheet = { show, paintLooks, sync, close };
  dialog.addEventListener('close', () => { stop(); dialog.remove(); settingsSheet = null; });
  show(section);
}
ui.gear.addEventListener('click', () => openSettings());

function translateStatic() {
  document.title = `MADRE · ${t('Home')}`;
  ui.title.textContent = t('Home');
  ui.add.textContent = t('Add a project');
  ui.bar.crumb.textContent = t('Home');
  ui.bar.open.setAttribute('aria-label', t('Projects on the bar'));
  ui.bar.agents.setAttribute('aria-label', t('Agents'));
  ui.bar.links.querySelector('span').textContent = t('Connections');
  ui.bar.reload.title = t('Reload the page');
  ui.bar.reload.setAttribute('aria-label', t('Reload the page'));
  ui.stop.querySelector('span').textContent = t('Stop all');
  ui.macro.querySelector('span').textContent = t('Project map');
  ui.gear.title = t('Home settings');
  ui.gear.setAttribute('aria-label', t('Home settings'));
  ui.search.placeholder = t('Search a project…');
  ui.search.setAttribute('aria-label', t('Search a project…'));
  ui.filter.setAttribute('aria-label', t('Show'));
  const FILTER_WORDS = { all: t('All projects'), open: t('Open projects'), asleep: t('Asleep projects') };
  for (const choice of ui.filter.querySelectorAll('[data-filter]')) choice.textContent = FILTER_WORDS[choice.dataset.filter];
  $('sm-bishop-name').textContent = t('Coordinator');
  ui.bishop.go.textContent = t('Talk to the Coordinator');
  ui.bishop.tab.title = t('Open the Coordinator in a new tab');
  ui.bishop.tab.setAttribute('aria-label', t('Open the Coordinator in a new tab'));
  ui.bishop.about.textContent = t('Your coordinator. It reads across your projects, signs the connections between them and carries an order from one to another.');
  ui.work.title.textContent = t('Recent summary');
  ui.work.again.textContent = t('Summarise again');
  ui.waiting.title.textContent = t('Waiting on you');
  ui.linksTileTitle.textContent = t('Connections');
  ui.link.textContent = t('Connect projects');
  ui.linksAll.textContent = t('See the connections');
  ui.linksTitle.textContent = t('Connections');
  ui.linksClose.setAttribute('aria-label', t('Close'));
  ui.linkMore.textContent = t('Connect projects');
  ui.memory.title.textContent = t('Memory');
  ui.decisions.title.textContent = t('Recent decisions');
  ui.attention.title.textContent = t('Needs you');
  for (const kind of KINDS) KIND_WORDS[kind] = t(kind.toUpperCase());
}

translateStatic();
drawWork();
drawDecisions();
await refresh();
// Arriving from RELOAD (salas-mac.html put the curtain back): Home has read its projects, so the
// bar fills and the curtain clears.
{
  const curtain = document.getElementById('reload-curtain');
  if (curtain) {
    void finishLoader(curtain.querySelector('.madre-loader')).then(() => {
      curtain.classList.add('leaving');
      setTimeout(() => curtain.remove(), 760);
    });
  }
}
void loadAgents();
void loadVersion();
void loadWork();
void loadDecisions();
// `#welcome`: the first-run wizard again, on purpose (to connect an agent or add projects in steps).
if (location.hash === '#welcome') { history.replaceState(null, '', location.pathname); welcomed = true; openWizard(); }
// Sent here for the Macroverso (the key in BISHOP's room): straight into it, on a large screen.
if (location.hash === '#macroverso' && data && !ui.macro.hidden) { history.replaceState(null, '', location.pathname); ui.macro.click(); }
timer = setInterval(() => { if (!document.hidden && !busy.size && !pins.dropping && !pins.drag) void refresh(); }, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { void refresh(); void loadAgents(); void loadWork(); void loadDecisions(); } });
// The decisions are asked again every few minutes (the route itself asks the rooms no oftener).
setInterval(() => { if (!document.hidden) void loadDecisions(); }, 5 * 60 * 1000);

// Asking for a star or a review (review-ask.js), when Home is quiet: nothing waking or closing,
// the bar not being arranged.
startReviewAsk({ busy: () => busy.size > 0 || pins.editing || Boolean(pins.drag) || Boolean(pins.dropping) });
