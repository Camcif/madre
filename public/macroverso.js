// THE MACROVERSE: every room on this Mac as a NOSTROMO in open space (docs/MACROVERSO.md, phase 3a).
// It is entered from SALAS and only on a large screen; on a phone SALAS is the list and nothing more.
//
// Each room is drawn the way its own NOSTROMO is drawn, by the same engine (nostromo-engine.js):
// MOTHER of molten rock at the centre, every memory a dwarf in its kind's colour, the veins between
// those that share a theme. Far away, a universe is one scene placed, settled and painted once into
// a sprite, and from then on only moved and scaled. Chosen, it is the real thing: one live scene,
// its physics and its magma running, composed over the space. Never more than one.
//
// The space is open: dragged, it moves; the wheel brings it closer; it has no edge. The Mac stays
// at the origin, the open rooms orbit near it and the sleeping ones far and cold, and RECENTER
// brings it all home. Dragging a chosen universe turns it in the hand, as in its room.
//
// What it costs: canvas 2D, no shaders. A sprite is never wider than SPRITE_MAX pixels and is
// painted again only when what it shows has changed; the live scene has one canvas of its own;
// frames run only while the macroverse is on screen, never in a hidden tab, and someone who asked
// for less motion gets one still frame redrawn when something changes. No line joins two universes
// until a link exists (phase 3c).

import { MEMORY_COLORS, PITCH_LIMIT, TURN_PER_PIXEL, createNostromo, magmaMap, texturesReady } from './nostromo-engine.js';

const KINDS = Object.keys(MEMORY_COLORS);
const TILT = 0.42;                 // how flat the orbits read: the plane seen a little from above
const INNER = 0.27, OUTER = 0.43;  // the orbits of open and sleeping rooms, as a share of the view
const TURN = (Math.PI * 2) / 900;  // a whole orbit in fifteen minutes: alive, never busy
const FOCUS_ZOOM = 2.1;            // how close the camera comes to a chosen universe
const ZOOM_MIN = 0.25, ZOOM_MAX = FOCUS_ZOOM * 1.5;
const SPRITE_MAX = 1024;           // the widest a sprite is ever painted, in pixels
const FAR_MEMORIES = 300;          // the most a far universe draws, the most alive first; its card says the rest
const RELAX_STEPS = 60;            // steps of physics before a sprite is painted
const BODY_REACH = 520;            // world units from MOTHER to the edge of the brain, with room for its glow
const LIVE_SIDE = 760;             // css px of the live scene's own canvas
const LIVE_TURN = 0.0012;          // radians a frame a chosen universe turns on its own: a full turn in a minute and a half

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const hash = (text) => { let h = 2166136261; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const random = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

// How big a universe reads at zoom 1, in css px of radius: it grows slowly with what it holds.
const reachOf = (room) => 60 + 14 * Math.log2(1 + (room.glance?.census?.memories ?? 0) / 10);

// A scene for the engine: everything it reads, and nothing of a room's page. `bare`: no sky, no
// stars, no vignette — the space around it is this file's to draw.
function sceneFor(canvas, w, h, dpr, reduced) {
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const scene = {
    canvas, size: { w, h, dpr }, nodes: [], links: [], pulses: [], rings: [], lastPhase: 0, blasts: [],
    cam: { x: 0, y: 0, scale: 1, manual: false }, yaw: 0, pitch: 0, spin: 0, coreLit: 0,
    selected: null, hover: null, lock: null, witness: null, cage: null, alarm: null, altered: false,
    reduced, bare: true, coldOnly: false, maturity: 0, stage: null, words: null,
  };
  return { scene, engine: createNostromo(scene) };
}

// The memories a far universe draws: the most alive first, so a large archive is read by what the
// room leans on, and the veins between the ones kept.
function farMemories(data) {
  if ((data.memories?.length ?? 0) <= FAR_MEMORIES) return data;
  const alive = (memory) => (memory.recalled ?? 0) * 1e6 + (Date.parse(memory.lastRecalled ?? 0) || 0) / 1e9;
  const kept = [...data.memories].sort((a, b) => alive(b) - alive(a) || b.id - a.id).slice(0, FAR_MEMORIES);
  const ids = new Set(kept.map((memory) => memory.id));
  return { ...data, memories: kept, links: (data.links ?? []).filter((link) => ids.has(link.a) && ids.has(link.b)) };
}

// One universe painted once: its scene placed, settled and drawn into a sprite by the engine. A
// room that is asleep, sealed, outdated or unreachable is MOTHER alone: cold, or caged.
function paintUniverse(one, dpr) {
  const side = Math.min(SPRITE_MAX, Math.round(one.reach * 2 * dpr));
  const css = side / dpr;
  const canvas = canvasOf(side, side);
  const { scene, engine } = sceneFor(canvas, css, css, dpr, true);
  const data = one.data;
  if (data?.memories?.length) {
    engine.buildNodes(farMemories(data));
    // Where the live scene left the bodies, if it had this universe: nothing jumps on the way back.
    if (one.settled) for (const node of scene.nodes) { const was = one.settled.get(node.memory.id); if (was) Object.assign(node, was, { placed: true }); }
    engine.placeNostromo();
    let t = 0;
    for (let step = 0; step < (one.settled ? 8 : RELAX_STEPS); step += 1) { t += 1 / 60; engine.stepNostromo(1, t); }
  }
  scene.cam = { x: 0, y: 0, scale: (css / 2 - 4) / BODY_REACH, manual: true };
  if (data?.sealed) scene.cage = { at: 0, closed: true };
  engine.projectNostromo();
  engine.drawNostromo(0.7);
  if (!one.room.open) {
    // A cold ember: the same body, the fire gone out of it.
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(52, 64, 88, .78)';
    ctx.fillRect(0, 0, side, side);
    ctx.globalCompositeOperation = 'source-over';
  }
  return { canvas, css, ready: texturesReady(), scene };
}

// The ground: deep space and three slow glows, painted once per window size.
function paintNebula(width, height, dpr, accent) {
  const canvas = canvasOf(width * dpr, height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#030305';
  ctx.fillRect(0, 0, width, height);
  for (const [x, y, radius, colour] of [[0.18, 0.2, 0.7, accent], [0.85, 0.15, 0.55, '#3dc6ff'], [0.55, 0.95, 0.8, '#ff2a1f']]) {
    const glow = ctx.createRadialGradient(width * x, height * y, 0, width * x, height * y, Math.max(width, height) * radius);
    glow.addColorStop(0, `${colour}26`);
    glow.addColorStop(1, `${colour}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
}

// A tile of stars: three of them, at three depths, slide under the camera at three speeds.
function paintStars(seed, count, biggest, dpr) {
  const side = 512;
  const canvas = canvasOf(side * dpr, side * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const pick = random(seed);
  for (let i = 0; i < count; i += 1) {
    const warm = pick() < 0.12;
    ctx.globalAlpha = 0.25 + pick() * 0.75;
    ctx.fillStyle = warm ? '#ffe2a8' : pick() < 0.3 ? '#b0ccff' : '#ffffff';
    ctx.beginPath(); ctx.arc(pick() * side, pick() * side, 0.3 + pick() * biggest, 0, Math.PI * 2); ctx.fill();
  }
  return { canvas, side };
}

export function openMacroverso({ host, rooms, here, accent = '#9bff66', words, actions }) {
  const reduced = reducedMotion();
  const layer = document.createElement('section');
  layer.className = 'mv';
  layer.setAttribute('aria-label', words.title);
  const canvas = document.createElement('canvas');
  canvas.className = 'mv-canvas';
  canvas.tabIndex = 0;
  const head = document.createElement('header');
  head.className = 'mv-head';
  const title = document.createElement('h2');
  title.textContent = words.title;
  const sub = document.createElement('p');
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'mv-back';
  back.textContent = words.back;
  head.append(title, sub, back);
  const card = document.createElement('aside');
  card.className = 'mv-card';
  card.hidden = true;
  const hint = document.createElement('p');
  hint.className = 'mv-hint';
  hint.textContent = words.hint;
  const recenter = document.createElement('button');
  recenter.type = 'button';
  recenter.className = 'mv-recenter';
  recenter.textContent = words.recenter ?? 'RECENTER';
  recenter.hidden = true;
  layer.append(canvas, head, card, hint, recenter);
  host.append(layer);

  const view = { w: 0, h: 0, dpr: 1 };
  const camera = { x: 0, y: 0, zoom: 1, to: null, manual: false };
  const textures = { ready: texturesReady() };
  let nebula = null;
  let stars = [];
  let universes = [];
  let hover = null;
  let focus = null;
  let follow = false;       // the camera keeps a chosen universe in the middle while it travels
  let aside = 0;            // how far right of a chosen universe the camera sits, for its card
  let live = null;          // the one universe drawn as the real thing: its scene, its canvas
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let queued = false;
  let resizeTimer = 0;
  const drag = { active: false, moved: false, turning: false, x: 0, y: 0 };

  function layout(list) {
    const kept = new Map(universes.map((one) => [one.room.id, one]));
    const open = list.filter((room) => room.open);
    const asleep = list.filter((room) => !room.open);
    universes = [...open.map((room, i) => ({ room, orbit: INNER, phase: (i / Math.max(1, open.length)) * Math.PI * 2 + 0.6 })),
      ...asleep.map((room, i) => ({ room, orbit: OUTER, phase: (i / Math.max(1, asleep.length)) * Math.PI * 2 + 1.3 }))]
      .map((placing) => {
        const before = kept.get(placing.room.id);
        // A universe is read and painted again only when what it shows has changed.
        const face = `${placing.room.open ? 1 : 0}:${JSON.stringify(placing.room.glance?.census ?? null)}`;
        const same = before && before.face === face && before.dpr === view.dpr ? before : null;
        return {
          ...placing,
          face,
          dpr: view.dpr,
          reach: reachOf(placing.room),
          data: before && before.face === face ? before.data : null,
          full: before && before.face === face ? before.full : null,
          sprite: same?.sprite ?? null,
          settled: before?.settled ?? null,
          loading: before && before.face === face ? before.loading : null,
          dirty: !same || Boolean(before?.dirty),
        };
      });
    sub.textContent = words.sub(list);
    if (focus) focus = universes.find((one) => one.room.id === focus.room.id) ?? null;
    if (live && (!focus || live.one.room.id !== focus.room.id)) leaveLive();
    if (live && focus) live.one = focus;
    if (focus) drawCard(focus);
  }

  function size() {
    const rect = layer.getBoundingClientRect();
    view.w = rect.width;
    view.h = rect.height;
    view.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(view.w * view.dpr);
    canvas.height = Math.round(view.h * view.dpr);
    nebula = paintNebula(view.w, view.h, view.dpr, accent);
    stars = [paintStars(11, 260, 0.9, view.dpr), paintStars(23, 90, 1.4, view.dpr), paintStars(37, 30, 2, view.dpr)];
  }

  // What a universe is made of, read from its room through this one. Without `full` no words
  // cross: the far view is drawn from kinds, zones and sizes. The chosen universe asks for them.
  function load(one, full = false) {
    const key = full ? 'full' : 'data';
    if (one[key]) return Promise.resolve(one[key]);
    if (one.loading?.[key]) return one.loading[key];
    const asked = fetch(`/api/salas/universe?id=${encodeURIComponent(one.room.id)}${full ? '&full=1' : ''}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)
      .then((answer) => {
        const now = universes.find((item) => item.room.id === one.room.id);
        if (!now || now.face !== one.face) return null;
        now[key] = answer ?? { unreachable: true };
        if (now.loading) delete now.loading[key];
        if (!full) { now.dirty = true; redraw(); }
        return now[key];
      });
    one.loading = { ...(one.loading ?? {}), [key]: asked };
    return asked;
  }

  // One universe is painted a frame, the chosen one first, so a Mac with many rooms never stalls.
  function paintNext() {
    const next = [focus, ...universes].find((one) => one && one.dirty);
    if (!next) return false;
    if (!next.data) { if (!next.loading?.data) void load(next); return false; }
    next.sprite = paintUniverse(next, view.dpr);
    next.dirty = false;
    return true;
  }

  // The slow textures, a band a frame, shared by every scene. Once they are whole, every sprite
  // painted before them is painted again.
  function tick() {
    if (!textures.ready) {
      magmaMap(12);
      if (texturesReady()) {
        textures.ready = true;
        for (const one of universes) if (one.sprite && !one.sprite.ready) one.dirty = true;
      }
    }
    paintNext();
    return !textures.ready || universes.some((one) => one.dirty && (one.data || one.loading?.data));
  }

  // Where a universe is now: on its orbit round the Mac, the far side smaller and fainter.
  function placed(one) {
    const angle = one.phase + (reduced ? 0 : clock * TURN);
    const span = Math.min(view.w, view.h * 1.7);
    const depth = (Math.sin(angle) + 1) / 2;   // 0 far, 1 near
    return {
      x: Math.cos(angle) * span * one.orbit,
      y: Math.sin(angle) * span * one.orbit * TILT,
      scale: 0.72 + 0.42 * depth,
      light: 0.55 + 0.45 * depth,
      depth,
    };
  }
  const toScreen = (x, y) => ({ x: view.w / 2 + (x - camera.x) * camera.zoom, y: view.h * 0.54 + (y - camera.y) * camera.zoom });
  const toWorld = (sx, sy) => ({ x: camera.x + (sx - view.w / 2) / camera.zoom, y: camera.y + (sy - view.h * 0.54) / camera.zoom });

  // ---- The live scene: the chosen universe as its room draws it.
  function enterLive(one) {
    if (!one.room.open) return;
    void load(one, true).then((data) => {
      if (!data?.memories || focus !== one || live?.one === one) return;
      const own = canvasOf(LIVE_SIDE * view.dpr, LIVE_SIDE * view.dpr);
      const { scene, engine } = sceneFor(own, LIVE_SIDE, LIVE_SIDE, view.dpr, reduced);
      engine.buildNodes(data);
      // The bodies start where the sprite left them, so the close look continues the far one.
      const far = one.sprite?.scene;
      if (far) {
        const was = new Map(far.nodes.map((node) => [node.memory.id, node]));
        for (const node of scene.nodes) {
          const from = was.get(node.memory.id);
          if (from?.placed) { node.wx = from.wx; node.wy = from.wy; node.wz = from.wz; node.wvx = 0; node.wvy = 0; node.wvz = 0; node.placed = true; }
        }
      }
      engine.placeNostromo();
      scene.words = words;
      if (data.sealed) scene.cage = { at: 0, closed: true };
      // The pointer reaches it through its own canvas, which is nowhere on the page: it answers
      // from the origin, and the pointer is moved into its frame before it is asked.
      own.getBoundingClientRect = () => ({ left: 0, top: 0, width: LIVE_SIDE, height: LIVE_SIDE });
      live = { one, canvas: own, scene, engine, last: performance.now(), screen: null };
      if (reduced) { stepLive(performance.now()); redraw(); }
      else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
  }
  function stepLive(now) {
    const { scene, engine } = live;
    const dt = Math.min(48, now - live.last) / 16;
    live.last = now;
    const t = now / 1000;
    if (!reduced && !scene.selected && !drag.turning) scene.yaw += dt * LIVE_TURN;
    engine.stepNostromo(dt, t);
    engine.focusNostromo(dt, t);
    engine.projectNostromo();
    engine.fitNostromo();
    engine.drawNostromo(t);
  }
  // Leaving keeps where the bodies settled, so the sprite painted next continues the live one.
  function leaveLive() {
    if (!live) return;
    live.one.settled = new Map(live.scene.nodes.map((node) => [node.memory.id, { wx: node.wx, wy: node.wy, wz: node.wz, wvx: 0, wvy: 0, wvz: 0 }]));
    live.one.dirty = true;
    live = null;
    showMemory(null);
  }
  // The pointer, in the live scene's own frame: what it is over there, or null when it is outside.
  function liveAt(event) {
    if (!live?.screen) return null;
    const rect = canvas.getBoundingClientRect();
    const k = LIVE_SIDE / live.screen.side;
    const lx = (event.clientX - rect.left - live.screen.x) * k;
    const ly = (event.clientY - rect.top - live.screen.y) * k;
    if (lx < 0 || ly < 0 || lx > LIVE_SIDE || ly > LIVE_SIDE) return { inside: false, at: null };
    return { inside: true, at: live.engine.nostromoAt({ clientX: lx, clientY: ly }) };
  }

  function frame(now) {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    clock += dt;
    tick();
    if (camera.to) {
      const k = Math.min(1, (now - camera.to.at) / camera.to.ms);
      const e = ease(k);
      camera.x = camera.to.from.x + (camera.to.x - camera.to.from.x) * e;
      camera.y = camera.to.from.y + (camera.to.y - camera.to.from.y) * e;
      camera.zoom = camera.to.from.zoom + (camera.to.zoom - camera.to.from.zoom) * e;
      if (k >= 1) camera.to = null;
    } else if (focus && follow && !camera.manual) {
      // A chosen universe keeps the middle while it travels.
      const at = placed(focus);
      camera.x = at.x + aside;
      camera.y = at.y;
    }
    if (live) stepLive(now);
    draw();
    raf = reduced && !camera.to ? 0 : requestAnimationFrame(frame);
  }
  // One frame when something changed, for a still macroverse; and the next while there is still a
  // sprite to paint or a texture to finish.
  function redraw() {
    if (raf || queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; const more = tick(); draw(); if (more) redraw(); });
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (nebula) ctx.drawImage(nebula, 0, 0, view.w, view.h);
    // Stars: the near ones move with the camera, the far ones barely. The tiles repeat under any
    // movement, so the space has no edge.
    stars.forEach((tile, depth) => {
      const speed = [0.04, 0.1, 0.22][depth] * camera.zoom;
      const ox = (((-camera.x * speed - clock * (reduced ? 0 : 1.5 * (depth + 1))) % tile.side) + tile.side) % tile.side;
      const oy = (((-camera.y * speed) % tile.side) + tile.side) % tile.side;
      for (let x = ox - tile.side; x < view.w; x += tile.side) {
        for (let y = oy - tile.side; y < view.h; y += tile.side) ctx.drawImage(tile.canvas, x, y, tile.side, tile.side);
      }
    });

    // The orbits, faint, round the Mac at the centre.
    const centre = toScreen(0, 0);
    const span = Math.min(view.w, view.h * 1.7);
    ctx.lineWidth = 1;
    for (const orbit of [INNER, OUTER]) {
      ctx.strokeStyle = 'rgba(242, 241, 238, .11)';
      ctx.setLineDash(orbit === OUTER ? [3, 7] : []);
      ctx.beginPath();
      ctx.ellipse(centre.x, centre.y, span * orbit * camera.zoom, span * orbit * TILT * camera.zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // This Mac: the white star everything turns round, and its name.
    const mac = ctx.createRadialGradient(centre.x, centre.y, 0, centre.x, centre.y, 46 * camera.zoom);
    mac.addColorStop(0, 'rgba(255, 255, 255, 1)');
    mac.addColorStop(0.12, 'rgba(225, 238, 255, .75)');
    mac.addColorStop(0.4, 'rgba(160, 200, 255, .14)');
    mac.addColorStop(1, 'rgba(160, 200, 255, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = mac;
    ctx.beginPath(); ctx.arc(centre.x, centre.y, 46 * camera.zoom, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(242, 241, 238, .5)';
    ctx.fillText(words.mac, centre.x, centre.y + 22 * camera.zoom);

    // The universes, far ones first.
    const beat = reduced ? 0.4 : 0.5 + 0.5 * Math.sin(clock * 5.46);
    const order = universes.map((one) => ({ one, at: placed(one) })).sort((a, b) => a.at.depth - b.at.depth);
    for (const { one, at } of order) {
      const p = toScreen(at.x, at.y);
      const glance = one.room.glance ?? {};
      const awake = Boolean(one.room.open);
      const isLive = live?.one === one;
      // On screen: the live scene at its own size, or the sprite at the universe's.
      const breath = glance.working?.length && !reduced && !isLive ? 1 + 0.035 * Math.sin(clock * 3.2) : 1;
      const side = isLive ? LIVE_SIDE * (camera.zoom / FOCUS_ZOOM) : one.reach * 2 * at.scale * camera.zoom * breath;
      const r = isLive ? side * 0.19 : one.reach * at.scale * camera.zoom * 0.2;   // MOTHER's radius on screen, for the rings and the names
      one.screen = { x: p.x, y: p.y, r: side / 2 };
      if (p.x < -side || p.x > view.w + side || p.y < -side || p.y > view.h + side) { if (isLive) live.screen = null; continue; }
      // MOTHER's warmth on the dark, breathing with her heart; a sleeping room gives off a cold glow.
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(p.x, p.y, r * 0.6, p.x, p.y, r * (3.2 + 0.4 * beat));
      halo.addColorStop(0, awake ? `rgba(226, 40, 22, ${(0.22 + 0.1 * beat) * at.light})` : `rgba(120, 150, 200, ${0.12 * at.light})`);
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * (3.2 + 0.4 * beat), 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = at.light * (hover && hover !== one && !focus ? 0.7 : 1) * (awake ? 1 : 0.6);
      if (isLive) {
        live.screen = { x: p.x - side / 2, y: p.y - side / 2, side };
        ctx.drawImage(live.canvas, p.x - side / 2, p.y - side / 2, side, side);
      } else if (one.sprite) {
        ctx.drawImage(one.sprite.canvas, p.x - side / 2, p.y - side / 2, side, side);
      } else {
        // Not read yet: an ember where it will be.
        const ember = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        ember.addColorStop(0, awake ? '#ff7a3a' : '#56637a');
        ember.addColorStop(1, awake ? 'rgba(168, 23, 12, 0)' : 'rgba(27, 33, 48, 0)');
        ctx.fillStyle = ember;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Waiting for you: a ring in the accent, breathing.
      if (glance.waitingCount) {
        const pulse = reduced ? 0.6 : 0.45 + 0.35 * Math.sin(clock * 2.4);
        ctx.strokeStyle = accent;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, side * 0.56, side * 0.56 * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if ((one === hover && !isLive) || one.room.id === here) {
        ctx.strokeStyle = one === focus ? '#ffffff' : 'rgba(255, 255, 255, .55)';
        ctx.lineWidth = one === focus ? 1.6 : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, side * 0.52, 0, Math.PI * 2); ctx.stroke();
      }
      // Its name, under it.
      const below = p.y + side * 0.5 + 8;
      ctx.font = `600 ${Math.round(13 + 3 * at.depth)}px Geist, -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Over a galaxy a name needs its own dark edge to be read.
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(3, 3, 5, .75)';
      ctx.lineWidth = 4;
      ctx.fillStyle = awake ? 'rgba(242, 241, 238, .95)' : 'rgba(200, 210, 225, .6)';
      ctx.globalAlpha = at.light;
      ctx.strokeText(one.room.name, p.x, below);
      ctx.fillText(one.room.name, p.x, below);
      ctx.font = '500 11px Geist, -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.lineWidth = 3;
      ctx.fillStyle = glance.waitingCount ? accent : 'rgba(242, 241, 238, .6)';
      ctx.strokeText(words.state(one.room), p.x, below + 19);
      ctx.fillText(words.state(one.room), p.x, below + 19);
      ctx.globalAlpha = 1;
    }
  }

  function at(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    let best = null;
    for (const one of universes) {
      if (!one.screen) continue;
      const d = Math.hypot(one.screen.x - x, one.screen.y - y);
      if (d <= Math.max(26, one.screen.r * 1.1) && (!best || d < best.d)) best = { one, d };
    }
    return best?.one ?? null;
  }

  function fly(to, ms = 900) {
    camera.to = { from: { x: camera.x, y: camera.y, zoom: camera.zoom }, ...to, at: performance.now(), ms: reduced ? 1 : ms };
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function home() {
    camera.manual = false;
    recenter.hidden = true;
    if (focus) { follow = true; const where = placed(focus); fly({ x: where.x + aside, y: where.y, zoom: FOCUS_ZOOM }); }
    else fly({ x: 0, y: 0, zoom: 1 });
  }

  // The memory chosen in the live scene, said on the card: its kind and its words.
  function showMemory(node) {
    const slot = card.querySelector('.mv-memory');
    if (!slot) return;
    slot.replaceChildren();
    slot.hidden = !node;
    if (!node) return;
    const kind = document.createElement('b');
    kind.style.setProperty('--k', node.color);
    kind.textContent = words.kind(node.memory.kind);
    const text = document.createElement('p');
    text.textContent = node.memory.text ?? '';
    slot.append(kind, text);
  }

  function drawCard(one) {
    const room = one.room;
    const glance = room.glance ?? {};
    const census = glance.census;
    card.replaceChildren();
    const name = document.createElement('h3');
    name.textContent = room.name;
    const state = document.createElement('p');
    state.className = 'mv-state';
    state.textContent = words.state(room);
    card.append(name, state);
    if (room.root) { const path = document.createElement('p'); path.className = 'mv-path'; path.textContent = words.path(room.root); card.append(path); }
    if (glance.waiting?.length) { const wait = document.createElement('p'); wait.className = 'mv-wait'; wait.textContent = words.ask(glance.waiting[0]); card.append(wait); }
    if (census?.memories) {
      const list = document.createElement('ul');
      list.className = 'mv-kinds';
      for (const kind of KINDS) {
        const n = census.kinds?.[kind] ?? 0;
        if (!n) continue;
        const row = document.createElement('li');
        row.style.setProperty('--k', MEMORY_COLORS[kind]);
        const bar = document.createElement('i');
        bar.style.width = `${Math.max(3, (n / census.memories) * 100)}%`;
        const label = document.createElement('span');
        label.textContent = `${words.kind(kind)} · ${n}`;
        row.append(label, bar);
        list.append(row);
      }
      card.append(list);
    }
    const counts = document.createElement('p');
    counts.className = 'mv-counts';
    const veins = one.data?.links?.length ?? one.full?.links?.length ?? null;
    counts.textContent = [words.counts(room), veins !== null && words.veins ? words.veins(veins) : null].filter(Boolean).join(' · ');
    card.append(counts);
    const memory = document.createElement('div');
    memory.className = 'mv-memory';
    memory.hidden = true;
    card.append(memory);
    const row = document.createElement('div');
    row.className = 'mv-actions';
    if (room.open) {
      const go = document.createElement('a');
      go.className = 'sm-btn primary';
      go.textContent = room.id === here ? words.backToRoom : words.enter;
      go.href = room.id === here ? '/' : `http://127.0.0.1:${room.open.port}/`;
      row.append(go);
    } else if (room.root) {
      const wake = document.createElement('button');
      wake.type = 'button';
      wake.className = 'sm-btn primary';
      wake.textContent = words.wake;
      wake.addEventListener('click', async () => { wake.disabled = true; wake.textContent = words.waking; await actions.wake(room); });
      row.append(wake);
    }
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'sm-btn ghost';
    out.textContent = words.all;
    out.addEventListener('click', () => choose(null));
    row.append(out);
    card.append(row);
    card.hidden = false;
    if (live?.one === one && live.scene.selected) showMemory(live.scene.selected);
  }

  function choose(one) {
    if (focus && focus !== one) leaveLive();
    focus = one;
    camera.manual = false;
    recenter.hidden = true;
    if (!one) {
      card.hidden = true;
      follow = false;
      fly({ x: 0, y: 0, zoom: 1 });
      return;
    }
    drawCard(one);
    aside = (view.w * 0.16) / FOCUS_ZOOM;
    follow = true;
    const where = placed(one);
    fly({ x: where.x + aside, y: where.y, zoom: FOCUS_ZOOM });
    enterLive(one);
  }

  // Pointer: a drag on the space moves it; a drag on the chosen universe turns it; a click picks a
  // universe, or a memory inside the chosen one; the wheel brings the space closer round the pointer.
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    drag.active = true;
    drag.moved = false;
    drag.turning = Boolean(liveAt(event)?.inside);
    drag.x = event.clientX;
    drag.y = event.clientY;
    try { canvas.setPointerCapture(event.pointerId); } catch { /* the pointer already left */ }
  });
  canvas.addEventListener('pointermove', (event) => {
    if (drag.active) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (drag.turning && live) {
        if (live.scene.lock) live.scene.lock.aim = false;
        live.scene.yaw = (live.scene.yaw ?? 0) + dx * TURN_PER_PIXEL;
        live.scene.pitch = clamp((live.scene.pitch ?? 0) + dy * TURN_PER_PIXEL, -PITCH_LIMIT, PITCH_LIMIT);
        if (reduced) { stepLive(performance.now()); redraw(); }
      } else {
        camera.to = null;
        camera.x -= dx / camera.zoom;
        camera.y -= dy / camera.zoom;
        camera.manual = true;
        recenter.hidden = false;
        redraw();
      }
      canvas.style.cursor = 'grabbing';
      return;
    }
    const now = at(event);
    const over = liveAt(event);
    const node = over?.at && over.at !== 'core' ? over.at : null;
    if (live && live.scene.hover !== node) { live.scene.hover = node; if (reduced) { stepLive(performance.now()); redraw(); } }
    if (now !== hover) { hover = now; redraw(); }
    canvas.style.cursor = node || over?.at === 'core' ? 'pointer' : now && now !== focus ? 'pointer' : over?.inside ? 'grab' : 'default';
  });
  const release = () => { drag.active = false; drag.turning = false; canvas.style.cursor = 'default'; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { hover = null; if (live) live.scene.hover = null; redraw(); });
  canvas.addEventListener('click', (event) => {
    if (drag.moved) { drag.moved = false; return; }
    const over = liveAt(event);
    if (over?.inside && live) {
      // Inside the chosen universe: a memory is picked and read on the card; the dark lets go of it on the next click.
      const node = over.at && over.at !== 'core' ? over.at : null;
      live.scene.selected = node;
      showMemory(node);
      if (reduced) { stepLive(performance.now()); redraw(); }
      if (node || over.at === 'core') return;
    }
    const one = at(event);
    choose(one && one !== focus ? one : focus && !one ? null : one);
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left, py = event.clientY - rect.top;
    const before = toWorld(px, py);
    camera.to = null;
    camera.zoom = clamp(camera.zoom * Math.exp(-event.deltaY * 0.0012), ZOOM_MIN, ZOOM_MAX);
    const after = toWorld(px, py);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
    camera.manual = true;
    recenter.hidden = false;
    redraw();
  }, { passive: false });
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const list = universes;
      if (!list.length) return;
      const i = focus ? list.indexOf(focus) : -1;
      choose(list[(i + (event.key === 'ArrowRight' ? 1 : list.length - 1) + (i < 0 ? 1 : 0)) % list.length]);
    }
  });
  function onKey(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (live?.scene.selected) { live.scene.selected = null; showMemory(null); if (reduced) { stepLive(performance.now()); redraw(); } }
    else if (focus) choose(null);
    else close();
  }
  document.addEventListener('keydown', onKey);
  recenter.addEventListener('click', home);
  // A window being resized is settled before anything is painted again: the sky and the stars at
  // the new size, the sprites only if the density changed.
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { size(); layout(rooms); redraw(); }, 150); };
  window.addEventListener('resize', onResize);
  const onVisible = () => { if (!document.hidden && !raf && !reduced) { last = performance.now(); if (live) live.last = last; raf = requestAnimationFrame(frame); } else if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; } };
  document.addEventListener('visibilitychange', onVisible);

  function close() {
    cancelAnimationFrame(raf);
    raf = 0;
    clearTimeout(resizeTimer);
    live = null;
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisible);
    layer.classList.add('leaving');
    setTimeout(() => layer.remove(), reduced ? 0 : 260);
    actions.closed?.();
  }
  back.addEventListener('click', close);

  size();
  layout(rooms);
  camera.zoom = 0.6;
  fly({ x: 0, y: 0, zoom: 1 }, 1200);
  redraw();
  canvas.focus({ preventScroll: true });
  // A window on the macroverse for whoever is measuring it, the way the room leaves `__pulse`.
  globalThis.__macroverso = { peek: () => ({ live, universes, camera, textures: { ...textures, whole: texturesReady() }, raf }) };

  return {
    update(next) { rooms = next; layout(next); redraw(); },
    close,
  };
}
