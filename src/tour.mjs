// The welcome of MADRE 1.0 (2026-10-11): one bonjour per person and per major version, then the
// chapters that tell everything new, at the person's own pace (docs: the «Recorrido de MADRE 1.0»
// decision, option B with two pieces of C — the one-line hints and the sheet of gestures).
//
// Where it was, what was read, which hints were seen: kept in ~/.pulse/tour.json, never in a
// browser. Every project is its own origin and a project may open on another port next time, so a
// flag in the browser would be forgotten or said twice; this file is one per person, as
// whats-new.json and review-ask.json are.
//
// It also brings the projects of 0.7.2 to Home. 0.7.2 never wrote where a project is
// (project.json), so Home cannot list them; but a room's id is its folder's name and a hash of its
// path (src/salas.mjs), so the folder is found by looking for that name where people keep their
// projects and is proved by the hash. Nothing is guessed: a folder whose hash does not match is
// not that project, and a project MADRE was told to forget is never brought back.

import { mkdir, readdir, readFile, realpath, rename, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PROJECT_HOMES, associateProject, projectRoomId, salasRoomId } from './salas.mjs';

export const TOUR_VERSION = '1.0';
// The chapters, in their order; «moved» is only for whoever comes from 0.7.2.
export const CHAPTERS = ['moved', 'home', 'project', 'talk', 'modes', 'coordinator', 'links', 'maps', 'settings', 'modules', 'phone', 'gestures'];
// The places that confuse most, each told once in one line (from option C).
export const HINTS = ['switch', 'links', 'key4'];
const PATHS = ['new', 'back'];

const fresh = () => ({ version: TOUR_VERSION, path: null, bonjourAt: null, done: [], at: null, closed: false, finished: null, hints: {}, held: null });
// A tab that shows the bonjour or the chapters says so every few seconds; another tab that finds it
// said within this long tells the person it is open there, instead of a second bonjour.
export const HELD_MS = 45 * 1000;
const TAB = /^[\w-]{6,64}$/;
const tourFile = (stateRoot) => join(stateRoot, 'tour.json');

// What is kept, checked field by field: a file written by hand or by an older MADRE is read for
// what it says correctly and nothing else. A file for another version starts the tour again.
export async function readTour(stateRoot) {
  const raw = await readFile(tourFile(stateRoot), 'utf8').then((text) => JSON.parse(text)).catch(() => null);
  if (!raw || typeof raw !== 'object' || raw.version !== TOUR_VERSION) return fresh();
  const iso = (value) => (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null);
  return {
    version: TOUR_VERSION,
    path: PATHS.includes(raw.path) ? raw.path : null,
    bonjourAt: iso(raw.bonjourAt),
    done: Array.isArray(raw.done) ? CHAPTERS.filter((id) => raw.done.includes(id)) : [],
    at: CHAPTERS.includes(raw.at) ? raw.at : null,
    closed: raw.closed === true,
    finished: iso(raw.finished),
    hints: Object.fromEntries(HINTS.filter((id) => iso(raw.hints?.[id])).map((id) => [id, raw.hints[id]])),
    held: raw.held && TAB.test(String(raw.held.by ?? '')) && iso(raw.held.at) ? { by: raw.held.by, at: raw.held.at } : null,
  };
}

async function writeTour(stateRoot, state) {
  await mkdir(stateRoot, { recursive: true });
  const file = tourFile(stateRoot);
  const draft = `${file}.${process.pid}.tmp`;
  await writeFile(draft, `${JSON.stringify(state, null, 2)}\n`);
  await rename(draft, file);
  return state;
}

// One change at a time, from the page: the path taken at the bonjour, a chapter read, where the
// person is, closed to go on later, finished, a hint seen, or everything again from the start.
export async function changeTour(stateRoot, change, now = new Date()) {
  if (!change || typeof change !== 'object') return { error: 'change' };
  if (change.reset === true) return writeTour(stateRoot, fresh());
  const state = await readTour(stateRoot);
  const at = new Date(now).toISOString();
  if (change.path !== undefined) {
    if (!PATHS.includes(change.path)) return { error: 'path' };
    state.path = change.path;
  }
  if (change.bonjour === true) state.bonjourAt ??= at;
  if (change.chapter !== undefined) {
    if (!CHAPTERS.includes(change.chapter)) return { error: 'chapter' };
    if (!state.done.includes(change.chapter)) state.done = CHAPTERS.filter((id) => id === change.chapter || state.done.includes(id));
  }
  if (change.at !== undefined) {
    if (change.at !== null && !CHAPTERS.includes(change.at)) return { error: 'chapter' };
    state.at = change.at;
  }
  if (change.closed !== undefined) state.closed = change.closed === true;
  if (change.finished === true) { state.finished ??= at; state.closed = false; }
  // Which tab has the tour open now (one says it every few seconds while it does), and that it
  // let go — only the tab that holds it lets go.
  if (change.hold !== undefined) {
    if (!TAB.test(String(change.hold))) return { error: 'tab' };
    state.held = { by: change.hold, at };
  }
  if (change.release !== undefined && state.held?.by === change.release) state.held = null;
  if (change.hint !== undefined) {
    if (!HINTS.includes(change.hint)) return { error: 'hint' };
    state.hints[change.hint] ??= at;
  }
  return writeTour(stateRoot, state);
}

// Whoever has a room of their own already used MADRE before: a room with a conversation or a
// memory in it. A project added in Home and never opened has neither, so a new person who adds
// projects before the bonjour is still new.
export async function cameBefore(stateRoot) {
  const dir = join(stateRoot, 'rooms');
  const salas = salasRoomId(stateRoot);
  for (const id of await readdir(dir).catch(() => [])) {
    if (id === salas) continue;
    for (const kept of ['events.jsonl', 'memory.sqlite']) {
      if (await stat(join(dir, id, kept)).then((info) => info.isFile(), () => false)) return true;
    }
  }
  return false;
}

// The rooms Home cannot list: no record of where their project is, and not set aside on purpose.
export async function roomsWithoutProject(stateRoot) {
  const dir = join(stateRoot, 'rooms');
  const salas = salasRoomId(stateRoot);
  const out = [];
  for (const id of (await readdir(dir).catch(() => [])).sort()) {
    if (id === salas || !/-[0-9a-f]{16}$/.test(id)) continue;
    const has = (name) => stat(join(dir, id, name)).then(() => true, () => false);
    if (await has('project.json') || await has('project.forgotten.json')) continue;
    if (!(await has('events.jsonl')) && !(await has('memory.sqlite'))) continue;
    out.push({ id, name: id.replace(/-[0-9a-f]{16}$/, '') });
  }
  return out;
}

// One room: its folder looked for by name where people keep their projects, proved by its hash,
// and written beside its record as adding it in Home would. Answers where it was, or that it was
// not found (a folder that was deleted, moved, or lived somewhere else).
export async function recoverProject({ stateRoot, home, id }) {
  const room = (await roomsWithoutProject(stateRoot)).find((one) => one.id === id);
  if (!room) return { error: 'unknown' };
  for (const where of PROJECT_HOMES) {
    const candidate = join(home, where, room.name);
    const real = await realpath(candidate).catch(() => null);
    if (!real || projectRoomId(real) !== id) continue;
    const added = await associateProject({ root: real, home, stateRoot });
    if (added.error) continue;
    return { id, name: added.name, root: added.root, found: true };
  }
  return { id, name: room.name, found: false };
}
