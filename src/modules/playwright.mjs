// PLAYWRIGHT: a headless browser for the crew, pointed only at this MADRE. Agents open the
// RIPLEY preview of project files, click, read the console and take screenshots into the turn's
// scratch folder. Runs @playwright/mcp per turn, isolated, with allowed origins limited to the
// room's own address: nothing else on the network is reachable through it.

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { t } from '../i18n.mjs';
import { defineModule } from './sdk.mjs';
import { packageVersion } from './helpers.mjs';
import { terminateProcessTree, lastWords } from '../adapters/process.mjs';

export const PLAYWRIGHT_PACKAGE = '@playwright/mcp';
export const PLAYWRIGHT_BROWSERS = ['chromium', 'firefox', 'webkit'];
export const PLAYWRIGHT_SERVER_NAME = 'pulse-playwright';
// The tools @playwright/mcp exposes that a room turn may use. Screenshots and files land in scratch.
export const PLAYWRIGHT_TOOLS = ['browser_navigate', 'browser_navigate_back', 'browser_snapshot', 'browser_click', 'browser_type', 'browser_fill_form', 'browser_hover', 'browser_press_key', 'browser_select_option', 'browser_wait_for', 'browser_console_messages', 'browser_network_requests', 'browser_take_screenshot', 'browser_resize', 'browser_tabs', 'browser_close'];

let probe = { at: 0, version: null };
// Is @playwright/mcp installed where npx can find it without downloading? Read from the package
// itself, never asked of it: `npx --no <package> --version` answers with npm's own version and
// exits cleanly when the package is not there, so it said 11.16.0 for a server never installed.
export async function playwrightVersion({ env = process.env, projectRoot = process.cwd(), now = Date.now(), fresh = false } = {}) {
  if (!fresh && now - probe.at < 60000) return probe.version;
  const version = await packageVersion(PLAYWRIGHT_PACKAGE, { env, projectRoot });
  probe = { at: now, version };
  return version;
}

// Does the browser server start, with its browser? Asked when the switch is turned on, with the
// same server a turn gets: the card said «on · chromium» while every turn's server closed before it
// spoke, and the agents saw only CONNECTION_CLOSED. It is asked to open about:blank, because a
// server without its browser starts fine and fails only at the first page.
export async function playwrightStarts({ browser = 'chromium', env = process.env, cwd = process.cwd(), timeoutMs = 60000, command = 'npx', args = null } = {}) {
  // npx is a .cmd shim on Windows and there is no shell to run it (WIN-027): not asked there.
  if (process.platform === 'win32' && command === 'npx') return { ok: true, checked: false };
  const outputDir = await mkdtemp(join(tmpdir(), 'madre-playwright-'));
  const argv = args ?? ['--no', PLAYWRIGHT_PACKAGE, '--', '--headless', '--isolated', '--browser', browser, '--output-dir', outputDir, '--no-sandbox'];
  return new Promise((resolve) => {
    let child = null;
    let out = '';
    let err = '';
    let settled = false;
    let timer = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (child) terminateProcessTree(child, { graceMs: 1000 });
      rm(outputDir, { recursive: true, force: true }).catch(() => {});
      resolve(result);
    };
    try {
      child = spawn(command, argv, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], shell: false, detached: true, windowsHide: true });
    } catch (error) {
      finish({ ok: false, problem: error.message });
      return;
    }
    timer = setTimeout(() => finish({ ok: false, problem: t('it did not answer within {seconds}s', { seconds: Math.round(timeoutMs / 1000) }) }), timeoutMs);
    timer.unref?.();
    const send = (message) => { if (!settled) child.stdin.write(`${JSON.stringify(message)}\n`); };
    child.stdin.on('error', () => {});
    child.stdout.on('data', (chunk) => {
      out += chunk;
      for (let newline = out.indexOf('\n'); newline >= 0; newline = out.indexOf('\n')) {
        const line = out.slice(0, newline).trim();
        out = out.slice(newline + 1);
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        if (message.id === 1) {
          if (message.error) { finish({ ok: false, problem: String(message.error.message ?? 'initialize failed') }); return; }
          send({ jsonrpc: '2.0', method: 'notifications/initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'browser_navigate', arguments: { url: 'about:blank' } } });
        } else if (message.id === 2) {
          // The reason, without the path of the executable it looked for or the command it suggests:
          // the card and the refusal say what to run, in the room's words.
          const said = (message.result?.content ?? []).map((part) => part?.text ?? '').join(' ').replace(/^#+\s*Error\s*/i, '').replace(/^Error:\s*/i, '').replace(/;\s*expected executable at[\s\S]*$/i, '').replace(/\s+/g, ' ').trim();
          if (message.error || message.result?.isError) { finish({ ok: false, problem: String(message.error?.message ?? said).slice(0, 300) }); return; }
          finish({ ok: true, checked: true });
          return;
        }
      }
    });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (error) => finish({ ok: false, problem: error.message }));
    child.on('close', (code) => finish({ ok: false, problem: lastWords(err) ?? t('it exited with code {code} before it spoke', { code }) }));
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'madre', version: '1' } } });
  });
}

// A turn that asks to look at a page, click through it, test it, read its console or take a picture
// of it, in the two languages the crew is spoken to here. A page merely named is not one: «cambia el
// lema de la página» needs no browser.
export const BROWSER_INTENT = /navegador|browser|playwright|captura|screenshot|pantallazo|\bclic|\bclick|consola|console|responsive|m[oó]vil|mobile|viewport|ancho de|se ve\b|c[oó]mo (se )?ve|visual|vista previa|preview|ripley|interfaz|\bui\b|\bux\b|e2e|end.to.end|pru[eé]ba(lo|la|las|los)? en|test (it|the page|in the browser)|abre (la|el) (p[aá]gina|app|sitio)|open the (page|app|site)|smoke test/i;
export const wantsBrowser = (text) => BROWSER_INTENT.test(String(text ?? ''));

// The last answer to «does it start?», for a switch that was already on: asked again in the
// background at most every ten minutes, so the card can say the browser is missing and no turn
// carries a server that would only fail.
let started = { at: 0, result: null, asking: null };
export function playwrightHealth({ browser = 'chromium', env = process.env, cwd = process.cwd(), now = Date.now(), check = playwrightStarts } = {}) {
  if (env.PULSE_PLAYWRIGHT_CHECK === '0') return started.result;
  if (!started.asking && now - started.at > 10 * 60 * 1000) {
    started.asking = check({ browser, env, cwd }).then((result) => { started = { at: Date.now(), result, asking: null }; return result; }, () => { started.asking = null; return null; });
  }
  return started.result;
}
export function forgetPlaywrightHealth(result = null) { started = { at: result ? Date.now() : 0, result, asking: null }; }

// What the browser may open: this room, and the servers the human started from RUNS in this project
// while they listen on 127.0.0.1. RIPLEY's sealed frame keeps no data, so an app that stores its
// data could only be tried through it half-blind. Nothing else on the network.
export function playwrightServerFor({ port, outputDir, browser = 'chromium', headless = true, servers = [] }) {
  const origins = [port, ...servers.filter((one) => Number.isInteger(one) && one !== port)].flatMap((one) => [`http://127.0.0.1:${one}`, `http://localhost:${one}`]);
  const served = servers.filter((one) => Number.isInteger(one) && one !== port);
  return {
    name: PLAYWRIGHT_SERVER_NAME,
    command: 'npx',
    // `--` or npm eats them: without the separator npm takes --headless, --isolated and the
    // rest as its own config, hands the server only their bare values, and the server exits with
    // "too many arguments" before it speaks a word of MCP. The agent sees CONNECTION_CLOSED.
    // No --blocked-origins: the allowlist is already a closed door. The server routes `**` to
    // abort and then routes each allowed origin to continue, and Playwright matches the most
    // recently added route first — so a blocked `*`, registered after both, wins over the
    // allowlist and aborts even this room with ERR_BLOCKED_BY_CLIENT.
    args: ['--no', '@playwright/mcp', '--', ...(headless ? ['--headless'] : []), '--isolated', '--browser', browser, '--allowed-origins', origins.join(';'), '--output-dir', outputDir, '--no-sandbox'],
    env: {},
    tools: PLAYWRIGHT_TOOLS,
    brief: `a headless browser that reaches only this MADRE at http://127.0.0.1:${port}${served.length ? ` and the project's servers the human started (${served.map((one) => `http://127.0.0.1:${one}`).join(', ')})` : ''}. Open a project file rendered by RIPLEY at http://127.0.0.1:${port}/preview/project/<path>, click, read the console and network, take screenshots (they land in ${outputDir}). RIPLEY's preview keeps no data (no localStorage, no cookies)${served.length ? '; to try an app with its data, open it on its server' : ''}. Nothing else on the network is reachable through it.`,
  };
}

export default defineModule({
  id: 'playwright',
  name: 'PLAYWRIGHT',
  vendor: 'MADRE · Playwright MCP',
  tracks: { name: PLAYWRIGHT_PACKAGE, npm: PLAYWRIGHT_PACKAGE },
  summary: 'Hands an agent a headless browser that reaches only this room and the servers you start from RUNS, on the turns that ask to look at a page, click through it, read its console or take screenshots.',
  creates: ['nothing in the project \u00b7 screenshots land in .pulse/out/<turn>/', 'a switch in ~/.pulse/config.json', 'a browser per turn, started and stopped by the CLI', 'no origin but this room is reachable through it'],
  requires: ['@playwright/mcp and a chromium browser on this machine', 'RIPLEY on, to have pages to open'],
  settings: { enabled: false, browser: 'chromium', headless: true },
  card: 'switch',
  controls: [
    { key: 'browser', label: 'BROWSER', type: 'select', options: PLAYWRIGHT_BROWSERS, note: 'Which browser engine the agents drive.' },
    { key: 'headless', label: 'SHOW THE WINDOW', type: 'switch', invert: true, note: 'Off, the browser runs headless. On, it opens on this screen so you can watch.' },
  ],
  async status(ctx) {
    const version = await playwrightVersion({ env: ctx.env, projectRoot: ctx.projectRoot });
    const health = ctx.settings.enabled && version ? playwrightHealth({ browser: ctx.settings.browser ?? 'chromium', env: ctx.env, cwd: ctx.projectRoot }) : null;
    return {
      runs: [{ name: PLAYWRIGHT_PACKAGE, version }],
      settings: { browser: ctx.settings.browser ?? 'chromium', headless: ctx.settings.headless !== false },
      status: { installed: Boolean(ctx.settings.enabled), detail: ctx.settings.enabled ? (!version ? t('on · the browser server is not installed') : health?.ok === false ? t('on · the browser does not start: {problem}', { problem: String(health.problem).slice(0, 160) }) : `${t('on')} · ${ctx.settings.browser}`) : version ? t('off') : t('off · the browser server is not installed') },
      preflight: version ? { ok: true, problems: [] } : { ok: false, problems: ['Install the browser server first: npm install -g @playwright/mcp, then its browser: npx @playwright/mcp install-browser chrome-for-testing'] },
      install: { display: ctx.settings.enabled ? 'disable PLAYWRIGHT' : 'enable PLAYWRIGHT (config.json)', platforms: ['codex', 'claude', 'gemini', 'opencode'] },
    };
  },
  // Getting the browser server onto this computer, or a newer one. Installed globally, which is
  // where `npx --no` looks for it at turn time without downloading anything.
  async updatePlan(ctx, { latest = null } = {}) {
    const target = latest ? `${PLAYWRIGHT_PACKAGE}@${latest}` : PLAYWRIGHT_PACKAGE;
    return {
      command: 'npm',
      args: ['install', '-g', target],
      display: `npm install -g ${target}`,
      note: 'Installs the browser server for every project on this computer. A browser itself may still be missing; the card says so if it is.',
      after: async () => { await playwrightVersion({ env: ctx.env, projectRoot: ctx.projectRoot, fresh: true }); },
    };
  },
  async toolsForTurn(ctx, turn) {
    if (!(await playwrightVersion({ env: ctx.env, projectRoot: ctx.projectRoot }))) return [];
    if (turn.mode === 0) return [];   // a ghost turn leaves no screenshots and opens no browser
    // Only for a turn that asks for what a browser does. Its tool list goes into every call the CLI
    // makes inside the turn: a one-line change cost Codex 576 thousand tokens of reading, and the
    // browser it carried was never opened.
    if (turn.text !== undefined && !wantsBrowser(turn.text)) return [];
    // A browser known not to start is not handed to anyone: every call to it would fail.
    if (playwrightHealth({ browser: ctx.settings.browser ?? 'chromium', env: ctx.env, cwd: ctx.projectRoot })?.ok === false) return [];
    const outputDir = turn.scratchDir ?? join(turn.roomDir ?? ctx.stateRoot, 'playwright');
    return [playwrightServerFor({ port: turn.port, outputDir, browser: ctx.settings.browser ?? 'chromium', headless: ctx.settings.headless !== false, servers: turn.servers ?? [] })];
  },
  // The switch, guarded: on only if the server starts and has its browser. Off is always allowed.
  async toggle(ctx) {
    const enabled = !ctx.settings.enabled;
    if (enabled) {
      const check = await playwrightStarts({ browser: ctx.settings.browser ?? 'chromium', env: ctx.env, cwd: ctx.projectRoot });
      forgetPlaywrightHealth(check);
      if (!check.ok) return { status: 412, body: { error: t('PLAYWRIGHT did not start, so it stays off: {problem}. Install the server and its browser (npm install -g @playwright/mcp, then npx @playwright/mcp install-browser chrome-for-testing) and turn it on again.', { problem: String(check.problem).replace(/[.\s]+$/, '') }), code: 'MU-054' } };
    }
    await ctx.updateConfig({ modules: { playwright: { ...(ctx.config.modules?.playwright ?? {}), enabled } } });
    await ctx.record('extension.toggled', { id: 'playwright', name: 'PLAYWRIGHT', enabled });
    return { status: 200, body: { enabled } };
  },
  conditions: [{
    id: 'playwright-missing',
    code: 'MU-054',
    severity: 'informational',
    title: 'PLAYWRIGHT: the browser server is not installed',
    match: /@playwright\/mcp|playwright.*not (found|installed)|browser server/i,
    diagnosis: 'The PLAYWRIGHT module runs @playwright/mcp per turn. Two different things have to be on this computer and only one of them is the package: the server, and the browser build that this version of it expects. A server that starts without its browser answers every tool call with "Browser … is not installed", and one that cannot start at all reaches the agent as CONNECTION_CLOSED.',
    remedy: 'Install the server once, globally, then its browser — the browser is downloaded by the server itself, not by the playwright CLI — and RECHECK in MODULES.',
    fixes: { darwin: ['npm install -g @playwright/mcp', 'npx @playwright/mcp install-browser chrome-for-testing'], linux: ['npm install -g @playwright/mcp', 'npx @playwright/mcp install-browser chrome-for-testing'] },
  }],
});
