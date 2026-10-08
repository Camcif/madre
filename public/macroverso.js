// THE MACROVERSE: every room on this Mac as a universe (docs/MACROVERSO.md, phase 2). It is entered
// from SALAS and only on a large screen; on a phone SALAS is the list and nothing more.
//
// Phase 2 shows; it does not link. What is drawn is only what is true: each room's sun, the galaxy
// of its memories in NOSTROMO's colours and in their real proportions, who works, who waits, which
// rooms are asleep. No line joins two universes until a link exists (phase 3).
//
// Imposing without asking much of the machine. Canvas 2D, no shaders. Each universe is painted
// once into a sprite of its own and from then on only turned, moved and scaled; the nebula is
// painted once per window size; the stars are three tiles that slide at three speeds. Frames run
// only while the macroverse is on screen, never in a hidden tab, and someone who asked for less
// motion gets one still frame redrawn when something changes. The canvas is never denser than
// two pixels per point.

const KINDS = ['decision', 'fact', 'preference', 'question', 'aberration'];
const KIND_COLOURS = { decision: '#ffdc3c', fact: '#dfeeff', preference: '#5cf07a', question: '#3dc6ff', aberration: '#b14cff' };
const TILT = 0.42;                 // how flat the orbits read: the plane seen a little from above
const INNER = 0.27, OUTER = 0.43;  // the orbits of open and sleeping rooms, as a share of the view
const TURN = (Math.PI * 2) / 900;  // a whole orbit in fifteen minutes: alive, never busy

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const hash = (text) => { let h = 2166136261; for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const random = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

// How big a universe is: its sun grows with what the archive holds, slowly.
const sunRadius = (room) => 24 + 8 * Math.log2(1 + (room.glance?.census?.memories ?? 0) / 10);

// One universe, painted once: the galaxy of its memories turning round its sun. Open rooms burn
// like MOTHER; a sleeping one is a cold ember.
function paintUniverse(room, dpr) {
  const awake = Boolean(room.open);
  const r = sunRadius(room);
  const reach = r * 3.6;
  const size = Math.ceil(reach * 2 * dpr);
  const canvas = canvasOf(size, size);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.translate(reach, reach);
  const census = room.glance?.census;
  const total = census?.memories ?? 0;
  const pick = random(hash(room.id));

  // The galaxy: its memories in the share of each kind, along three arms. First a disc of dust in
  // the colour of what it holds most, then the stars of the arms, the brightest nearest the sun.
  if (total) {
    const top = KINDS.reduce((best, kind) => ((census.kinds?.[kind] ?? 0) > (census.kinds?.[best] ?? 0) ? kind : best), 'fact');
    ctx.globalCompositeOperation = 'lighter';
    const dust = ctx.createRadialGradient(0, 0, r, 0, 0, reach);
    dust.addColorStop(0, `${KIND_COLOURS[top]}${awake ? '30' : '14'}`);
    dust.addColorStop(0.55, `${KIND_COLOURS[top]}${awake ? '12' : '08'}`);
    dust.addColorStop(1, `${KIND_COLOURS[top]}00`);
    ctx.fillStyle = dust;
    ctx.beginPath(); ctx.arc(0, 0, reach, 0, Math.PI * 2); ctx.fill();
    const dots = Math.min(420, 60 + total * 1.6);
    const deck = [];
    for (const kind of KINDS) {
      const share = Math.round(((census.kinds?.[kind] ?? 0) / total) * dots);
      for (let i = 0; i < share; i += 1) deck.push(kind);
    }
    for (let i = deck.length - 1; i > 0; i -= 1) { const j = Math.floor(pick() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    deck.forEach((kind, i) => {
      const along = ((i + pick()) / deck.length) ** 0.8;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const out = r * 1.2 + along * (reach - r * 1.3);
      const angle = arm + along * 3.6 + (pick() - 0.5) * (0.35 + along * 0.4);
      const scatter = r * (0.12 + along * 0.3);
      const x = Math.cos(angle) * out + (pick() - 0.5) * scatter;
      const y = Math.sin(angle) * out + (pick() - 0.5) * scatter;
      const size = 0.9 + pick() * (2.2 - along);
      ctx.globalAlpha = (awake ? 1 : 0.4) * (1 - along * 0.5);
      ctx.fillStyle = KIND_COLOURS[kind];
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      // A few of them glow.
      if (awake && pick() < 0.08) {
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(x, y, size * 3.2, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  // The corona and the sun.
  ctx.globalCompositeOperation = 'lighter';
  const corona = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.6);
  corona.addColorStop(0, awake ? 'rgba(255, 140, 70, .55)' : 'rgba(150, 170, 200, .22)');
  corona.addColorStop(0.4, awake ? 'rgba(226, 40, 22, .16)' : 'rgba(110, 130, 160, .07)');
  corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = corona;
  ctx.beginPath(); ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const body = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.08, 0, 0, r);
  if (awake) { body.addColorStop(0, '#fff1dc'); body.addColorStop(0.3, '#ff9a52'); body.addColorStop(0.75, '#e2361c'); body.addColorStop(1, '#7a1006'); }
  else { body.addColorStop(0, '#c9d3e2'); body.addColorStop(0.45, '#56637a'); body.addColorStop(1, '#1b2130'); }
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // Its surface: cells of hotter and cooler gas, and the edge seen through more of itself. Painted
  // here once, so the texture costs nothing per frame.
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  for (let i = 0; i < 140; i += 1) {
    const a = pick() * Math.PI * 2;
    const d = Math.sqrt(pick()) * r;
    const size = r * (0.05 + pick() * 0.14);
    const hot = pick() < 0.55;
    ctx.globalAlpha = hot ? 0.16 : 0.2;
    ctx.fillStyle = awake ? (hot ? '#ffd9a0' : '#6e0f06') : (hot ? '#e4ecf6' : '#121726');
    ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const limb = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
  limb.addColorStop(0, 'rgba(0, 0, 0, 0)');
  limb.addColorStop(1, awake ? 'rgba(70, 4, 0, .55)' : 'rgba(5, 8, 16, .6)');
  ctx.fillStyle = limb;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  return { canvas, reach, r };
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
  layer.append(canvas, head, card, hint);
  host.append(layer);

  const view = { w: 0, h: 0, dpr: 1 };
  const camera = { x: 0, y: 0, zoom: 1, to: null };
  let nebula = null;
  let stars = [];
  let universes = [];
  let hover = null;
  let focus = null;
  let aside = 0;            // how far right of a chosen universe the camera sits, for its card
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let queued = false;

  function layout(list) {
    const kept = new Map(universes.map((one) => [one.room.id, one]));
    const open = list.filter((room) => room.open);
    const asleep = list.filter((room) => !room.open);
    universes = [...open.map((room, i) => ({ room, orbit: INNER, phase: (i / Math.max(1, open.length)) * Math.PI * 2 + 0.6 })),
      ...asleep.map((room, i) => ({ room, orbit: OUTER, phase: (i / Math.max(1, asleep.length)) * Math.PI * 2 + 1.3 }))]
      .map((one) => {
        const before = kept.get(one.room.id);
        // A universe is painted again only when what it shows has changed.
        const face = `${one.room.open ? 1 : 0}:${JSON.stringify(one.room.glance?.census ?? null)}`;
        const sharp = Boolean(before?.sharp && focus?.room.id === one.room.id);
        const sprite = before && before.face === face && before.dpr === view.dpr ? before.sprite : paintUniverse(one.room, view.dpr * (sharp ? FOCUS_ZOOM * 1.1 : 1));
        return { ...one, face, dpr: view.dpr, sprite, sharp, spin: before?.spin ?? (hash(one.room.id) % 628) / 100 };
      });
    sub.textContent = words.sub(list);
    if (focus) focus = universes.find((one) => one.room.id === focus.room.id) ?? null;
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
    universes = universes.map((one) => ({ ...one, sprite: paintUniverse(one.room, view.dpr * (one.sharp ? FOCUS_ZOOM * 1.1 : 1)), dpr: view.dpr }));
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

  function frame(now) {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    clock += dt;
    if (camera.to) {
      const k = Math.min(1, (now - camera.to.at) / camera.to.ms);
      const e = ease(k);
      camera.x = camera.to.from.x + (camera.to.x - camera.to.from.x) * e;
      camera.y = camera.to.from.y + (camera.to.y - camera.to.from.y) * e;
      camera.zoom = camera.to.from.zoom + (camera.to.zoom - camera.to.from.zoom) * e;
      if (k >= 1) camera.to = null;
    } else if (focus) {
      // A chosen universe keeps the middle while it travels.
      const at = placed(focus);
      camera.x = at.x + aside;
      camera.y = at.y;
    }
    draw();
    raf = reduced && !camera.to ? 0 : requestAnimationFrame(frame);
  }
  function redraw() {
    if (raf || queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; draw(); });
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (nebula) ctx.drawImage(nebula, 0, 0, view.w, view.h);
    // Stars: the near ones move with the camera, the far ones barely.
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
    const order = universes.map((one) => ({ one, at: placed(one) })).sort((a, b) => a.at.depth - b.at.depth);
    for (const { one, at } of order) {
      const p = toScreen(at.x, at.y);
      const scale = at.scale * camera.zoom;
      const { canvas: sprite, reach, r } = one.sprite;
      const glance = one.room.glance ?? {};
      const breath = glance.working?.length && !reduced ? 1 + 0.035 * Math.sin(clock * 3.2) : 1;
      one.screen = { x: p.x, y: p.y, r: r * scale * 1.25 };
      if (p.x < -reach * scale * 2 || p.x > view.w + reach * scale * 2 || p.y < -reach * scale * 2 || p.y > view.h + reach * scale * 2) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(1, 0.62 + 0.38 * (1 - TILT));
      ctx.rotate(one.spin + (reduced ? 0 : clock * (one.room.open ? 0.05 : 0.012)));
      ctx.globalAlpha = at.light * (hover && hover !== one && !focus ? 0.7 : 1);
      ctx.drawImage(sprite, -reach * scale * breath, -reach * scale * breath, reach * 2 * scale * breath, reach * 2 * scale * breath);
      ctx.restore();
      // Waiting for you: a ring in the accent, breathing.
      if (glance.waitingCount) {
        const pulse = reduced ? 0.6 : 0.45 + 0.35 * Math.sin(clock * 2.4);
        ctx.strokeStyle = accent;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, r * scale * 1.9, r * scale * 1.9 * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (one === hover || one === focus || one.room.id === here) {
        ctx.strokeStyle = one === focus ? '#ffffff' : 'rgba(255, 255, 255, .55)';
        ctx.lineWidth = one === focus ? 1.6 : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * scale * 1.45, 0, Math.PI * 2); ctx.stroke();
      }
      // Its name, under it.
      ctx.font = `600 ${Math.round(13 + 3 * at.depth)}px Geist, -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Over a galaxy a name needs its own dark edge to be read.
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(3, 3, 5, .75)';
      ctx.lineWidth = 4;
      ctx.fillStyle = one.room.open ? 'rgba(242, 241, 238, .95)' : 'rgba(200, 210, 225, .6)';
      ctx.globalAlpha = at.light;
      ctx.strokeText(one.room.name, p.x, p.y + r * scale * 1.75);
      ctx.fillText(one.room.name, p.x, p.y + r * scale * 1.75);
      ctx.font = `500 11px Geist, -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.lineWidth = 3;
      ctx.fillStyle = glance.waitingCount ? accent : 'rgba(242, 241, 238, .6)';
      ctx.strokeText(words.state(one.room), p.x, p.y + r * scale * 1.75 + 19);
      ctx.fillText(words.state(one.room), p.x, p.y + r * scale * 1.75 + 19);
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
      if (d <= Math.max(26, one.screen.r * 1.4) && (!best || d < best.d)) best = { one, d };
    }
    return best?.one ?? null;
  }

  function fly(to, ms = 900) {
    camera.to = { from: { x: camera.x, y: camera.y, zoom: camera.zoom }, ...to, at: performance.now(), ms: reduced ? 1 : ms };
    if (!raf) raf = requestAnimationFrame(frame);
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
        row.style.setProperty('--k', KIND_COLOURS[kind]);
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
    counts.textContent = words.counts(room);
    card.append(counts);
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
  }

  // The chosen universe is painted again for the closer look, and the one left goes back to the
  // ordinary size, so only one large picture is ever held.
  const FOCUS_ZOOM = 2.1;
  function sharpen(one, close) {
    if (!one) return;
    one.sprite = paintUniverse(one.room, view.dpr * (close ? FOCUS_ZOOM * 1.1 : 1));
    one.sharp = close;
  }
  function choose(one) {
    if (focus && focus !== one) sharpen(focus, false);
    focus = one;
    if (!one) {
      card.hidden = true;
      fly({ x: 0, y: 0, zoom: 1 });
      return;
    }
    if (!one.sharp) sharpen(one, true);
    const where = placed(one);
    drawCard(one);
    aside = (view.w * 0.16) / 2.1;
    fly({ x: where.x + aside, y: where.y, zoom: FOCUS_ZOOM });
  }

  canvas.addEventListener('pointermove', (event) => {
    const now = at(event);
    if (now !== hover) { hover = now; canvas.style.cursor = now ? 'pointer' : 'default'; redraw(); }
  });
  canvas.addEventListener('pointerleave', () => { hover = null; redraw(); });
  canvas.addEventListener('click', (event) => { const one = at(event); choose(one && one !== focus ? one : focus && !one ? null : one); });
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
    if (focus) choose(null); else close();
  }
  document.addEventListener('keydown', onKey);
  const onResize = () => { size(); layout(rooms); redraw(); };
  window.addEventListener('resize', onResize);
  const onVisible = () => { if (!document.hidden && !raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; } };
  document.addEventListener('visibilitychange', onVisible);

  function close() {
    cancelAnimationFrame(raf);
    raf = 0;
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
  canvas.focus({ preventScroll: true });

  return {
    update(next) { rooms = next; layout(next); redraw(); },
    close,
  };
}
