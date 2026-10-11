// The welcome of MADRE 1.0 (2026-10-11), in Home and in every project: option B of «Recorrido de
// MADRE 1.0» — a bonjour, then a window of chapters read at the person's own pace — with two
// pieces of option C: a one-line hint the first time someone reaches a place that confuses, and
// the sheet of gestures that `?` opens anywhere.
//
// Where the person is lives in ~/.pulse/tour.json (src/tour.mjs), not in this browser: every
// project is its own origin, and a flag here would be forgotten or said twice. The page tells this
// module what it can do — `go`, one function per chapter that takes the person there — and when
// it must wait (`ready`): never over a turn that runs, never before an agent is connected.
//
// The bonjour asks nothing it can answer itself. Whoever has rooms with conversations came from
// 0.7.2: their projects are brought back to Home first, with the loader's real progress (one step
// per project), and the chapters open on what moved. A new person is welcomed and, in Home, handed
// to the assistant that connects agents and adds projects; the chapters come after it.

import { LOADER_MARK, finishLoader, makeLoader, setLoader } from './loader.js';
import { language, t } from './i18n.js';
import { CHAPTERS, GESTURES } from './tour-chapters.js';

const say = (pair) => (typeof pair === 'string' ? pair : pair?.[language()] ?? pair?.es ?? '');
const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (whole, name) => (Object.hasOwn(vars, name) ? String(vars[name]) : whole));
const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const CLOSE_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const FOLDER = '<svg viewBox="0 0 32 26" aria-hidden="true"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h7.2l3 3.2h12.8A2.5 2.5 0 0 1 30 8.7v12.8a2.5 2.5 0 0 1-2.5 2.5h-23A2.5 2.5 0 0 1 2 21.5z" fill="currentColor"/></svg>';
const ROBOT = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4.5V8M3 13v2M21 13v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9.5" cy="13.5" r="1.3" fill="currentColor"/><circle cx="14.5" cy="13.5" r="1.3" fill="currentColor"/></svg>';

function el(tag, className = null, text = null) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== null && text !== undefined) node.textContent = text;
  return node;
}
function key(className, words, act) {
  const node = el('button', className, words);
  node.type = 'button';
  node.addEventListener('click', act);
  return node;
}

const tourApi = {
  read: () => fetch('/api/tour', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
  change: (change) => fetch('/api/tour', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(change) })
    .then((response) => (response.ok ? response.json() : null)).catch(() => null),
};

// The scenes: one short drawing per chapter, made of a few shapes that move once and loop slowly.
// With reduced motion they stand still and say the same.
const SCENES = {
  moved: () => '',
  home: () => `<div class="ts-bar"><i class="ts-logo"></i><span class="ts-pin"></span><span class="ts-pin"></span><span class="ts-pin ts-arrive"></span></div>
    <div class="ts-grid"><span class="ts-card"></span><span class="ts-card ts-lift"></span><span class="ts-card"></span><span class="ts-card ts-dim"></span></div>`,
  project: () => `<div class="ts-bar"><i class="ts-logo"></i><span style="flex:1"></span><span class="ts-key"></span><span class="ts-key ts-lamp"></span><span class="ts-key"></span><span class="ts-key"></span></div>
    <div class="ts-switch"><span class="ts-tile"><i>${FOLDER}</i></span><span class="ts-tile on"><i>${FOLDER}</i></span><span class="ts-tile"><i>${FOLDER}</i></span></div>`,
  talk: () => `<div class="ts-bubble"></div><div class="ts-bubble mine"></div>
    <div class="ts-box"><span class="ts-type"><b>@codex</b><b>#2</b><b>!app.js</b><b>/gh</b></span></div>`,
  modes: () => `<div class="ts-modes">${[0, 1, 2, 3, 4].map((n) => `<span class="ts-mode m${n}">#${n}${n >= 3 ? '<i class="ts-lock"></i>' : ''}</span>`).join('')}</div>`,
  coordinator: () => `<svg class="ts-wires" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true"><path id="ts-c1" d="M160 75L60 40"/><path id="ts-c2" d="M160 75L262 42"/><path id="ts-c3" d="M160 75L160 132"/>
    ${still() ? '' : ['ts-c1', 'ts-c2', 'ts-c3'].map((id, index) => `<path d="M0 0h0" class="ts-note"><animateMotion dur="2.6s" begin="${index * 0.8}s" repeatCount="indefinite"><mpath href="#${id}"/></animateMotion></path>`).join('')}</svg>
    <span class="ts-node" style="left:18.75%;top:26.6%">${FOLDER}</span><span class="ts-node" style="left:81.9%;top:28%">${FOLDER}</span><span class="ts-node" style="left:50%;top:88%">${FOLDER}</span>
    <span class="ts-hub">${ROBOT}</span>`,
  links: () => `<svg class="ts-wires" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true"><path id="ts-l1" class="ts-dash" d="M86 75C140 50 180 100 234 75"/>
    ${still() ? '' : [0, 0.9, 1.8].map((lag) => `<path d="M0 0h0" class="ts-note"><animateMotion dur="2.7s" begin="${lag}s" repeatCount="indefinite"><mpath href="#ts-l1"/></animateMotion></path>`).join('')}</svg>
    <span class="ts-node big" style="left:23%;top:50%">${FOLDER}</span><span class="ts-node big" style="left:77%;top:50%">${FOLDER}</span>`,
  maps: () => `<div class="ts-orbit"><i class="ts-core"></i>${[0, 1, 2, 3, 4, 5].map((n) => `<b class="ts-star s${n}"></b>`).join('')}</div>`,
  settings: () => `<div class="ts-window"><span class="ts-search"><i></i><em></em></span><div class="ts-tiles"><span></span><span></span><span></span><span></span><span></span><span></span></div></div><span class="ts-cap">⌘ ,</span>`,
  modules: () => `<div class="ts-modules">${[0, 1, 2, 3, 4, 5].map((n) => `<span class="ts-module m${n}"><i></i></span>`).join('')}</div>`,
  phone: () => `<span class="ts-mac"><i></i></span><svg class="ts-wires" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true"><path id="ts-p1" class="ts-dash" d="M206 80C178 62 150 62 124 76"/>
    ${still() ? '' : '<path d="M0 0h0" class="ts-note"><animateMotion dur="2.4s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"><mpath href="#ts-p1"/></animateMotion></path>'}</svg>
    <span class="ts-phone"><i class="ts-qr"></i></span>`,
  gestures: () => `<div class="ts-caps"><span class="ts-cap c0">⌘ ,</span><span class="ts-cap c1">Esc</span><span class="ts-cap c2">?</span></div>`,
};

// `onChange` hears the kept state each time it is known or changes (null if it could not be read).
export function startTour({ page, go = {}, ready = () => true, phone = false, pillSlot = null, welcome = null, onProjects = null, onChange = null } = {}) {
  let info = null;
  let state = null;
  let windowNode = null;
  let sheetNode = null;
  let hintNode = null;
  let current = null;
  const loaded = tourApi.read().then((answer) => {
    info = answer;
    state = answer?.state ?? null;
    paintPill();
    onChange?.(state);
    return answer;
  });
  const keep = async (change) => {
    const answer = await tourApi.change(change);
    if (answer?.state) state = answer.state;
    paintPill();
    onChange?.(state);
    return state;
  };
  const path = () => state?.path ?? (info?.returning ? 'back' : 'new');
  const chapters = () => CHAPTERS.filter((chapter) => chapter.id !== 'moved' || path() === 'back');
  const busyWith = () => Boolean(windowNode?.open || sheetNode?.open || document.querySelector('dialog.tour-bonjour[open]'));

  // ---- The pill: «Continue the tour · 4 of 12», while there is a tour to continue.
  function paintPill() {
    if (!pillSlot) return;
    pillSlot.replaceChildren();
    const list = chapters();
    const show = state?.bonjourAt && !state.finished && !windowNode?.open && !phone;
    pillSlot.hidden = !show;
    if (!show) return;
    const done = list.filter((chapter) => state.done.includes(chapter.id)).length;
    const pill = el('span', 'tour-pill');
    const open = key('tour-pill-go', fill(t('Continue the tour · {n} of {total}'), { n: done, total: list.length }), () => openChapters(state.at));
    const away = key('tour-pill-x', null, () => { void keep({ finished: true }); });
    away.innerHTML = CLOSE_ICON; // trusted: our own SVG string
    away.setAttribute('aria-label', t('Hide the tour'));
    away.title = t('Hide the tour. It stays in Settings.');
    pill.append(open, away);
    pillSlot.append(pill);
  }

  // ---- The bonjour.
  async function maybeBonjour() {
    const answer = await loaded;
    if (!answer?.owed || phone) return false;
    // Never over work in progress, a window the person opened, or an agent not yet connected.
    for (let tries = 0; tries < 720 && (!ready() || document.querySelector('dialog[open]')); tries += 1) await new Promise((resolve) => setTimeout(resolve, 500));
    if (!ready() || document.querySelector('dialog[open]')) return false;
    showBonjour();
    return true;
  }
  function showBonjour() {
    const back = path() === 'back';
    const node = el('dialog', 'tour-bonjour');
    node.setAttribute('aria-labelledby', 'tour-bonjour-title');
    const stage = el('div', 'tour-bonjour-stage');
    const mark = el('span', 'madre-loader-mark tour-hello-mark');
    mark.innerHTML = LOADER_MARK; // trusted: our own SVG string
    const title = el('h1', 'tour-hello', back ? t('Hello again.') : t('Hello.'));
    title.id = 'tour-bonjour-title';
    const body = el('p', 'tour-hello-says', back
      ? t('MADRE changed a lot since 0.7.2. First I bring your projects to Home; then I tell you what is new, at your own pace.')
      : t('This is MADRE: all your AI agents in one place, with your projects, their memory and your permissions.'));
    const note = back ? el('p', 'tour-hello-note') : null;
    if (note) note.innerHTML = t('<code>madre</code> now opens Home; <code>madre start</code> still opens the project in the folder.'); // trusted: our own catalogue
    const acts = el('div', 'tour-hello-acts');
    const later = key('tour-btn quiet', t('Later'), async () => {
      await keep({ path: path(), bonjour: true, closed: true });
      node.close();
    });
    const onward = key('tour-btn primary', back ? t('Continue') : t('Start'), async () => {
      later.disabled = true; onward.disabled = true;
      await keep({ path: path(), bonjour: true });
      void fetch('/api/whats-new/seen', { method: 'POST' }).catch(() => null); // the chapters replace What's new 1.0
      if (back) { await bringProjects(stage); return; }
      node.close();
      if (page === 'home' && welcome?.needed?.()) welcome.open(() => openChapters('home'));
      else openChapters(page === 'home' ? 'home' : 'project');
    });
    acts.append(later, onward);
    stage.append(mark, title, body, ...(note ? [note] : []), acts);
    node.append(stage);
    node.addEventListener('cancel', (event) => { event.preventDefault(); later.click(); });
    node.addEventListener('close', () => setTimeout(() => node.remove(), 400));
    document.body.append(node);
    node.showModal();
    onward.focus();
  }

  // ---- 0.7.2: the projects Home cannot list, brought back one by one, the loader saying how far.
  async function bringProjects(stage) {
    const loader = makeLoader({ progress: 0.04, label: t('Looking for your projects of 0.7.2…') });
    stage.replaceChildren(loader);
    const rooms = (await fetch('/api/tour/projects', { cache: 'no-store' }).then((response) => response.json()).catch(() => null))?.rooms ?? [];
    const found = [];
    const missing = [];
    for (const [index, room] of rooms.entries()) {
      setLoader(loader, 0.08 + (0.84 * index) / Math.max(1, rooms.length), fill(t('Bringing your projects of 0.7.2 · {n} of {total}'), { n: index + 1, total: rooms.length }));
      const answer = await fetch('/api/tour/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: room.id }) })
        .then((response) => (response.ok ? response.json() : null)).catch(() => null);
      if (answer?.found) found.push(answer.name); else missing.push(room.name);
    }
    await finishLoader(loader, { hold: 380 });
    if (found.length) onProjects?.();
    const list = (names) => new Intl.ListFormat(language(), { type: 'conjunction' }).format(names.map((name) => `«${name}»`));
    const done = el('div', 'tour-bonjour-done');
    const mark = el('span', 'madre-loader-mark tour-hello-mark');
    mark.innerHTML = LOADER_MARK; // trusted: our own SVG string
    done.append(mark, el('h1', 'tour-hello', found.length ? t('Your projects are in Home.') : t('Home is ready.')));
    done.append(el('p', 'tour-hello-says', found.length
      ? (found.length === 1 ? fill(t('I brought {list} to Home, with its conversations and its memory.'), { list: list(found) }) : fill(t('I brought {n} projects to Home, with their conversations and their memory: {list}.'), { n: found.length, list: list(found) }))
      : t('Your projects were already in Home.')));
    if (missing.length) done.append(el('p', 'tour-hello-note', missing.length === 1 ? t('One I could not find: its folder is no longer where it was. If you moved it, add it in Home and it gets back its conversations.') : fill(t('{n} I could not find: their folders are no longer where they were. If you moved them, add them in Home and they get back their conversations.'), { n: missing.length })));
    const acts = el('div', 'tour-hello-acts');
    const node = stage.closest('dialog');
    acts.append(key('tour-btn primary', t('See what is new'), () => { node.close(); openChapters('moved'); }));
    done.append(acts);
    stage.replaceChildren(done);
    acts.firstChild.focus();
  }

  // ---- The chapters.
  function openChapters(at = null) {
    const list = chapters();
    current = list.find((chapter) => chapter.id === at) ?? list.find((chapter) => !state?.done.includes(chapter.id)) ?? list[0];
    if (!windowNode) build();
    if (!windowNode.open) windowNode.showModal();
    paintPill();
    show(current);
  }
  function build() {
    windowNode = el('dialog', 'whats-new tour-window');
    windowNode.setAttribute('aria-labelledby', 'tour-window-title');
    const sheet = el('div', 'wn-sheet tour-sheet');
    const head = el('header', 'tour-head');
    const words = el('div', 'tour-head-words');
    words.append(el('span', 'wn-eyebrow', t('The tour of MADRE 1.0')));
    const title = el('h2', null, t('Everything new, at your pace'));
    title.id = 'tour-window-title';
    words.append(title);
    const close = key('tour-close', null, () => windowNode.close());
    close.innerHTML = CLOSE_ICON; // trusted: our own SVG string
    close.setAttribute('aria-label', t('Close'));
    head.append(words, close);
    const body = el('div', 'tour-body');
    const nav = el('ol', 'tour-nav');
    nav.setAttribute('aria-label', t('Chapters'));
    const main = el('section', 'tour-main');
    main.setAttribute('aria-live', 'polite');
    body.append(nav, main);
    sheet.append(head, body);
    windowNode.append(sheet);
    windowNode.addEventListener('close', () => {
      const list = chapters();
      const all = list.every((chapter) => state?.done.includes(chapter.id));
      void keep(all ? { finished: true } : { closed: true });
    });
    windowNode.addEventListener('keydown', (event) => {
      if (event.target.closest?.('input, textarea')) return;
      const list = chapters();
      const index = list.indexOf(current);
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); show(list[Math.min(list.length - 1, index + 1)]); }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); show(list[Math.max(0, index - 1)]); }
    });
    document.body.append(windowNode);
  }
  function show(chapter) {
    current = chapter;
    void keep({ chapter: chapter.id, at: chapter.id });
    if (!state.done.includes(chapter.id)) state.done = [...state.done, chapter.id];
    const list = chapters();
    const index = list.indexOf(chapter);
    const nav = windowNode.querySelector('.tour-nav');
    nav.replaceChildren(...list.map((one, at) => {
      const item = el('li');
      const pick = key(`tour-nav-key${one === chapter ? ' on' : ''}${state.done.includes(one.id) ? ' done' : ''}`, null, () => show(one));
      pick.append(el('span', 'tour-nav-n', String(at + 1)), el('span', 'tour-nav-name', say(one.title)));
      if (one === chapter) pick.setAttribute('aria-current', 'step');
      item.append(pick);
      return item;
    }));
    const main = windowNode.querySelector('.tour-main');
    const page2 = el('article', `tour-chapter c-${chapter.id}`);
    const scene = el('div', `tour-scene s-${chapter.id}`);
    scene.setAttribute('aria-hidden', 'true');
    if (chapter.id === 'moved') {
      const table = el('div', 'ts-moved');
      for (const [was, now] of chapter.moved) {
        const line = el('div', 'ts-moved-row');
        line.append(el('span', 'was', say(was)), el('i', null, '→'), el('span', 'now', say(now)));
        table.append(line);
      }
      scene.append(table);
    } else scene.innerHTML = SCENES[chapter.id]?.() ?? ''; // trusted: our own markup
    const words = el('div', 'tour-words');
    words.append(el('span', 'tour-step', fill(t('{n} of {total}'), { n: index + 1, total: list.length })), el('h3', null, say(chapter.title)), el('p', 'tour-lead', say(chapter.lead)));
    const points = chapter.points?.[language()] ?? chapter.points?.es ?? [];
    if (points.length) {
      const ul = el('ul', 'tour-points');
      for (const point of points) { const item = el('li'); item.innerHTML = point; ul.append(item); } // trusted: our own copy
      words.append(ul);
    }
    if (chapter.id === 'gestures') words.append(gestureGrid());
    else if (chapter.keys?.length) {
      const keys = el('dl', 'tour-keys');
      for (const [what, how] of chapter.keys) keys.append(el('dt', null, say(what)), el('dd', null, say(how)));
      words.append(keys);
    }
    const acts = el('div', 'tour-acts');
    const here = typeof go[chapter.id] === 'function';
    if (here) {
      acts.append(key('tour-btn', t('Take me there'), () => {
        void keep({ at: chapter.id, closed: true });
        windowNode.close();
        setTimeout(() => go[chapter.id](), 60);
      }));
    } else if (chapter.where?.includes(page)) {
      acts.append(el('span', 'tour-where', t('It is right here, on this screen.')));
    } else if (chapter.where?.length) {
      acts.append(el('span', 'tour-where', chapter.where.includes('room') ? t('You try this inside a project.') : t('You try this in Home.')));
    }
    acts.append(el('span', 'tour-gap'));
    if (index > 0) acts.append(key('tour-btn quiet', t('Back'), () => show(list[index - 1])));
    if (index < list.length - 1) acts.append(key('tour-btn primary', t('Next chapter'), () => show(list[index + 1])));
    else acts.append(key('tour-btn primary', t('Finish'), () => { void keep({ finished: true }); windowNode.close(); }));
    words.append(acts);
    page2.append(scene, words);
    main.replaceChildren(page2);
    main.scrollTop = 0;
    acts.querySelector('.tour-btn.primary')?.focus({ preventScroll: true });
  }

  // ---- `?`: the sheet of gestures, anywhere.
  function gestureGrid() {
    const grid = el('div', 'tour-gestures');
    for (const [group, rows] of GESTURES) {
      const box = el('section', 'tour-gesture-group');
      box.append(el('h4', null, say(group)));
      const keys = el('dl', 'tour-keys');
      for (const [what, how] of rows) keys.append(el('dt', null, say(what)), el('dd', null, say(how)));
      box.append(keys);
      grid.append(box);
    }
    return grid;
  }
  function openGestures() {
    if (windowNode?.open) { show(chapters().find((chapter) => chapter.id === 'gestures')); return; }
    if (!sheetNode) {
      sheetNode = el('dialog', 'whats-new tour-gesture-window');
      sheetNode.setAttribute('aria-labelledby', 'tour-gestures-title');
      const sheet = el('div', 'wn-sheet tour-sheet tour-gesture-sheet');
      const head = el('header', 'tour-head');
      const words = el('div', 'tour-head-words');
      words.append(el('span', 'wn-eyebrow', t('Press ? at any moment')));
      const title = el('h2', null, t('Gestures and shortcuts'));
      title.id = 'tour-gestures-title';
      words.append(title);
      const close = key('tour-close', null, () => sheetNode.close());
      close.innerHTML = CLOSE_ICON; // trusted: our own SVG string
      close.setAttribute('aria-label', t('Close'));
      head.append(words, close);
      const body = el('div', 'tour-gesture-body');
      body.append(gestureGrid());
      sheet.append(head, body);
      sheetNode.append(sheet);
      sheetNode.addEventListener('click', (event) => { if (event.target === sheetNode) sheetNode.close(); });
      document.body.append(sheetNode);
    }
    if (!sheetNode.open) sheetNode.showModal();
  }
  const typing = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
  if (!phone) {
    document.addEventListener('keydown', (event) => {
      if (event.key !== '?' || event.metaKey || event.ctrlKey || event.altKey || typing(event.target)) return;
      if (sheetNode?.open) { sheetNode.close(); return; }
      event.preventDefault();
      openGestures();
    });
  }

  // ---- The hints: one line, once, the first time someone reaches a place that confuses. Never
  // two at once, never over the bonjour or the chapters, never before the bonjour was seen.
  // `inside`: the hint goes into that box, at its top (a window that is modal, where a card
  // floating over the page could not be pressed); it counts as seen when the box closes.
  async function hint(id, anchor, { title, text, inside = false }) {
    const answer = await loaded;
    if (phone || !answer || !state?.bonjourAt || state.hints?.[id] || hintNode || busyWith()) return false;
    if (!anchor?.isConnected) return false;
    const box = anchor.getBoundingClientRect();
    if (!inside && !box.width && !box.height) return false;
    const card = el('section', `tour-hint${inside ? ' inline' : ''}`);
    card.setAttribute('role', 'note');
    card.append(el('span', 'tour-hint-eyebrow', t('The first time')), el('b', null, title), el('p', null, text));
    const done = () => {
      if (!hintNode) return;
      void keep({ hint: id });
      card.remove();
      hintNode = null;
      document.removeEventListener('keydown', onKey, true);
    };
    const onKey = (event) => { if (event.key === 'Escape' && hintNode && !inside) { event.stopPropagation(); done(); } };
    card.append(key('tour-btn small primary', t('Got it'), done));
    hintNode = card;
    if (inside) {
      anchor.prepend(card);
      anchor.closest('dialog')?.addEventListener('close', done, { once: true });
      return true;
    }
    if (typeof card.showPopover === 'function') card.popover = 'manual';
    document.body.append(card);
    try { card.showPopover?.(); } catch { /* not a popover: on the page */ }
    // Below the anchor when there is room, above it otherwise; never off the screen.
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, box.left + box.width / 2 - width / 2));
    card.style.width = `${width}px`;
    const height = card.getBoundingClientRect().height;
    const below = box.bottom + 10 + height < window.innerHeight;
    Object.assign(card.style, { left: `${left}px`, top: `${below ? box.bottom + 10 : Math.max(12, box.top - height - 10)}px` });
    card.classList.add(below ? 'below' : 'above');
    card.style.setProperty('--arrow', `${Math.max(16, Math.min(width - 16, box.left + box.width / 2 - left))}px`);
    document.addEventListener('keydown', onKey, true);
    return true;
  }

  return {
    loaded,
    maybeBonjour,
    bonjour: showBonjour,
    openChapters,
    openGestures,
    hint,
    state: () => state,
    path,
  };
}
