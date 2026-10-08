import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

// User preferences that should survive terminals: `~/.pulse/config.json`.
// Environment variables always win over the file, so a one-off override
// never has to touch it.

export const configPath = (root = process.env.PULSE_HOME ?? join(homedir(), '.pulse')) => join(root, 'config.json');

export async function loadConfig(root) {
  try {
    const parsed = JSON.parse(await readFile(configPath(root), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return {};
    throw error;
  }
}

// Every room on this Mac writes this one file. A write is whole — a draft renamed over the file,
// so nobody ever reads half of one — and a change is read, applied and written under a lock, so
// two rooms saving at once keep both changes instead of the last one writing over the other
// (docs/MACROVERSO.md, S-001).
export async function saveConfig(root, config) {
  const file = configPath(root);
  await mkdir(dirname(file), { recursive: true });
  const draft = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(draft, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  await rename(draft, file);
  return file;
}

async function locked(root, work) {
  const lock = join(dirname(configPath(root)), 'config.lock');
  await mkdir(dirname(lock), { recursive: true });
  let held = false;
  for (let attempt = 0; attempt < 250 && !held; attempt += 1) {
    try {
      await (await open(lock, 'wx')).close();
      held = true;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      // A lock left by a process that died mid-write is stale after a few seconds.
      const since = await stat(lock).catch(() => null);
      if (since && Date.now() - since.mtimeMs > 5000) { await rm(lock, { force: true }); continue; }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  if (!held) throw new Error('The settings are being saved by another room; try again.');
  try {
    return await work();
  } finally {
    await rm(lock, { force: true });
  }
}

export async function updateConfig(root, patch) {
  return locked(root, async () => {
    const current = await loadConfig(root);
    const next = { ...current, ...patch };
    for (const [key, value] of Object.entries(patch)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) next[key] = { ...(current[key] ?? {}), ...value };
    }
    await saveConfig(root, next);
    return next;
  });
}

// Applies file-backed preferences to the process environment without
// overriding anything the user already exported.
export function applyConfigToEnv(config, env = process.env) {
  const applied = {};
  const set = (name, value) => {
    if (value === undefined || value === null || value === '' || env[name] !== undefined) return;
    env[name] = String(value);
    applied[name] = String(value);
  };
  set('PULSE_OPENCODE_MODEL', config.opencode?.model);
  set('PULSE_SOFT_TOKEN_BUDGET', config.room?.softTokenBudget);
  set('PULSE_CONTEXT_MAX_CHARS', config.room?.contextMaxChars);
  set('PULSE_AGENT_TIMEOUT_MS', config.timeouts?.default);
  if (config.room?.delegation === false) set('PULSE_DELEGATION', '0');
  set('PULSE_GEMINI_IDLE_MS', config.gemini?.idleMs);
  set('PULSE_GEMINI_RETRIES', config.gemini?.retries);
  set('PULSE_MAX_PLAN_STEPS', config.room?.maxPlanSteps);
  for (const [agent, value] of Object.entries(config.timeouts ?? {})) {
    if (agent !== 'default') set(`PULSE_${agent.toUpperCase()}_TIMEOUT_MS`, value);
  }
  return applied;
}
