// Salas on the Mac (docs/MACROVERSO.md, phase 1): every room this Mac knows, open or asleep, and
// what one room may ask of another — to open, to close. The list is read from what each room
// leaves beside its record; nothing here touches a room's ledger or its memory.
//
// A room opened from here is opened the way `madre start` opens it, by the same `bin/madre.mjs`,
// without a shell: the folder is an argument, never a line for `sh` or `cmd.exe` to read
// (docs/WINDOWS.md, WIN-016), and the script is found with fileURLToPath, never `.pathname`
// (WIN-004). A room is closed by asking it to close, the way a signal closes it; nothing here
// kills a process (WIN-007).

import { spawn } from 'node:child_process';
import { closeSync, openSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MADRE_BIN = fileURLToPath(new URL('../bin/madre.mjs', import.meta.url));

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } };
const readJson = (file) => readFile(file, 'utf8').then((raw) => JSON.parse(raw)).catch(() => null);

// Where the project is, kept beside its record (S-002): the room's id is a hash of the path and
// cannot be turned back into it, and a room that is closed has to be found to be opened again.
// Written whole or not at all.
export async function markProject(roomDir, projectRoot, { now = new Date() } = {}) {
  await mkdir(roomDir, { recursive: true });
  const file = join(roomDir, 'project.json');
  const draft = `${file}.${process.pid}.tmp`;
  await writeFile(draft, `${JSON.stringify({ root: projectRoot, name: basename(projectRoot), lastOpened: now.toISOString() })}\n`);
  await rename(draft, file);
}

// Every room: the ones open now, and the ones asleep whose project is still on disk. A folder
// with neither (a test's, a temporary one, a room from before MADRE kept the path) is not
// offered: there is nothing to open (S-004).
export async function knownRooms(stateRoot) {
  const dir = join(stateRoot, 'rooms');
  const names = await readdir(dir).catch(() => []);
  const out = [];
  for (const id of names) {
    const mark = await readJson(join(dir, id, 'open.json'));
    const where = await readJson(join(dir, id, 'project.json'));
    const open = mark && Number.isInteger(mark.pid) && Number.isInteger(mark.port) && mark.port > 0 && mark.port < 65536 && alive(mark.pid)
      ? { port: mark.port, pid: mark.pid, version: mark.version ?? null, at: mark.at ?? null }
      : null;
    const root = typeof where?.root === 'string' ? where.root : null;
    const there = root ? await stat(root).then((info) => info.isDirectory()).catch(() => false) : false;
    if (!open && !there) continue;
    out.push({
      id,
      name: typeof where?.name === 'string' ? where.name : typeof mark?.project === 'string' ? mark.project : id.replace(/-[0-9a-f]{16}$/, ''),
      root: there ? root : null,
      lastOpened: where?.lastOpened ?? mark?.at ?? null,
      open,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// Opens a room for a project, as `madre start --project <root> --no-open` would. What it says on
// the way up lands in start.log beside its record: if it never comes up, that file says why.
export function startRoom({ projectRoot, roomDir, env = process.env, spawnImpl = spawn, bin = MADRE_BIN }) {
  let log = 'ignore';
  try { log = openSync(join(roomDir, 'start.log'), 'a'); } catch { /* no witness, still start */ }
  // The new room is its own: what this room set for itself on the way up is not handed on.
  const own = { ...env };
  for (const name of ['PULSE_UPDATE_RESTART', 'PULSE_OUTBOUND_LOG']) delete own[name];
  try {
    const child = spawnImpl(process.execPath, [bin, 'start', '--project', projectRoot, '--no-open'], {
      cwd: projectRoot,
      detached: process.platform !== 'win32',
      windowsHide: true,
      stdio: ['ignore', log, log],
      env: own,
    });
    child.unref?.();
    return child;
  } finally {
    if (typeof log === 'number') { try { closeSync(log); } catch { /* the child keeps its own copy */ } }
  }
}

// Waits until the room for that id is open and answers, or the time runs out.
export async function roomComesUp(stateRoot, id, { timeoutMs = 25000, everyMs = 300, fetchImpl = globalThis.fetch } = {}) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const room = (await knownRooms(stateRoot)).find((one) => one.id === id);
    if (room?.open) {
      const answers = await fetchImpl(`http://127.0.0.1:${room.open.port}/api/version`, { signal: AbortSignal.timeout(1000) }).then((response) => response.ok).catch(() => false);
      if (answers) return room;
    }
    await new Promise((resolve) => setTimeout(resolve, everyMs));
  }
  return null;
}

// What the Macroverso needs of a room's archive to draw it as a NOSTROMO, and nothing more. Without
// `full`, no memory's words leave their room: a far universe is drawn from kinds, zones, how much
// ledger each memory covers, how often it was reached for, and the links between them. Only the
// chosen universe asks for the words, and only the Mac may ask (the route refuses a phone).
export function universeOf(research, { full = false } = {}) {
  const memories = (research?.memories ?? []).map((memory) => ({
    id: memory.id,
    kind: memory.kind,
    zone: memory.zone ?? 'hold',
    fromSequence: memory.fromSequence ?? 0,
    throughSequence: memory.throughSequence ?? 0,
    sourcesCount: Array.isArray(memory.sources) ? memory.sources.length : 0,
    recalled: memory.recalled ?? 0,
    lastRecalled: memory.lastRecalled ?? null,
    cold: memory.cold ?? null,
    ...(full ? { text: memory.text ?? '', agent: memory.agent ?? null, origin: memory.origin ?? null, created: memory.created ?? null } : {}),
  }));
  const ids = new Set(memories.map((memory) => memory.id));
  const links = (research?.links ?? []).filter((link) => ids.has(link.a) && ids.has(link.b)).map((link) => ({ a: link.a, b: link.b, weight: link.weight ?? 0.5 }));
  return {
    memories,
    links,
    maturity: research?.maturity ?? null,
    stats: { entries: research?.stats?.entries ?? 0, embeddings: research?.stats?.embeddings ?? 0 },
  };
}

// What a room says about itself, read from its own page's address. A room on an older MADRE
// answers 404 to the routes it does not have yet, and is said to be outdated (S-005).
export async function askRoom(port, path, { method = 'GET', body = null, fetchImpl = globalThis.fetch, timeoutMs = 1500 } = {}) {
  try {
    const response = await fetchImpl(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 404) return { outdated: true };
    const answer = await response.json().catch(() => ({}));
    return response.ok ? answer : { unreachable: true, status: response.status, error: answer?.error ?? null };
  } catch {
    return { unreachable: true };
  }
}
