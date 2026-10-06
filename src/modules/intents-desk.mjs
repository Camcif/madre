// The desk behind Intenciones: what this project has measured, what is being measured now, and
// what that says about the message being written.
//
// One desk per project, because what an agent needs is a fact about this project's work and not
// about one conversation. Its measurements live next to the project's room, in intents.jsonl, and
// never in a conversation's ledger: a calibration is not something anybody said.
//
// It spends turns only when the human presses a button, and only through the same door the
// archivist uses: the agent's own CLI, read-only, with no lease and no tools beyond its own. The
// quick test waits for the human's word on each pair; the full one asks an impartial agent and
// tests that agent before believing it (intents-calibration.mjs).

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { t } from '../i18n.mjs';
import { classifyUsagePercent } from '../usage-sentinel.mjs';
import { effortLadder, foldEvidence, invitable, offerable, suggestEffort, threadContext, TIER_EFFORT } from './intents-policy.mjs';
import {
  calibrationCases, calibrationSummary, estimateTurns, judgeForAgent, judgePrompt, mayCalibrate,
  parseJudgement, planRound, runCalibration, usualEffort, QUICK_CASES, READ_ONLY_INTENTS,
} from './intents-calibration.mjs';

// A calibration turn is a real turn of the CLI, reading the project as it would for the human.
export const ASK_TIMEOUT_MS = 300000;
const CHOICES = new Set(['first', 'second', 'same']);

// What the provider last said about this agent's window, as the room heard it.
export function usageOf(events = [], agent) {
  let last = null;
  for (const event of events) if (event?.type === 'quota.updated' && event.payload?.agent === agent) last = event.payload;
  return last ? { usedPercent: last.usedPercent, resetAt: last.resetAt ?? null } : null;
}

const versionsOf = (agents = []) => Object.fromEntries(agents.filter((agent) => agent.version).map((agent) => [agent.id, agent.version]));

export class IntentsDesk {
  #file;
  #offersFile;
  #events;
  #projectEvents;
  #project = null;
  #bench;
  #projectRoot;
  #records = null;
  #offers = null;
  #run = null;
  #last = null;
  #pending = null;
  #controller = null;
  #stopping = false;
  #running = null;
  // Where the run stands, for the pair the human is shown: which question of how many, and its kind.
  #pendingAt = { step: 0, total: 0, intent: null };

  // `events()` is the open conversation's ledger: the thread a suggestion reads and the quota the
  // provider reported. `projectEvents()` is what was said in every conversation of the project,
  // where the questions to calibrate with come from. `bench()` is room.bench(): the agents, their
  // invokers and who is busy. Everything else is files under the project's room.
  constructor({ file, offersFile, events, projectEvents = null, bench, projectRoot }) {
    this.#file = file;
    this.#offersFile = offersFile;
    this.#events = events;
    this.#projectEvents = projectEvents ?? events;
    this.#bench = bench;
    this.#projectRoot = projectRoot;
  }

  // Every conversation of the project, read at most every few seconds: the composer asks while the
  // human types, and the questions in a project do not change between two keystrokes.
  static PROJECT_TTL_MS = 20000;
  async #said() {
    const now = Date.now();
    if (this.#project && now - this.#project.at < IntentsDesk.PROJECT_TTL_MS) return this.#project.events;
    const events = await this.#projectEvents();
    this.#project = { at: now, events };
    return events;
  }

  async records() {
    if (this.#records) return this.#records;
    const text = await readFile(this.#file, 'utf8').catch(() => '');
    this.#records = text.split('\n').filter(Boolean).flatMap((line) => { try { return [JSON.parse(line)]; } catch { return []; } });
    return this.#records;
  }

  async #keep(records) {
    if (!records.length) return;
    await this.records();
    await mkdir(dirname(this.#file), { recursive: true });
    await appendFile(this.#file, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
    this.#records.push(...records);
  }

  async offers() {
    if (this.#offers) return this.#offers;
    try { this.#offers = { shown: 0, accepted: 0, ...JSON.parse(await readFile(this.#offersFile, 'utf8')) }; } catch { this.#offers = { shown: 0, accepted: 0 }; }
    return this.#offers;
  }

  // A suggestion went out with a message: counted once per message, never per keystroke. How often
  // the human takes it is the only number that says whether this is worth anything.
  async offered({ accepted = false } = {}) {
    const offers = await this.offers();
    offers.shown += 1;
    if (accepted) offers.accepted += 1;
    await mkdir(dirname(this.#offersFile), { recursive: true });
    await writeFile(this.#offersFile, JSON.stringify(offers));
    return offers;
  }

  // What to say about the message being written, or null. An offer is what offerable() lets
  // through: a measurement, or a rule that asks for more. An invitation is a rule that says less
  // would do, on an agent nobody has measured here yet: not advice, a question worth six answers.
  async suggest({ text = '', agent, model = null, effort = null, defaultEffort = null, references = 0, attachments = 0 } = {}) {
    if (!effortLadder(agent)) return null;
    const events = await this.#events();
    const usage = usageOf(events, agent);
    const { agents = [] } = this.#bench() ?? {};
    const records = await this.records();
    const suggestion = suggestEffort({
      text, agent, model, effort, defaultEffort, references, attachments,
      previous: threadContext(events, { agent }),
      quota: usage ? { level: classifyUsagePercent(usage.usedPercent) } : null,
      evidence: foldEvidence(records, { versions: versionsOf(agents) }),
    });
    if (offerable(suggestion)) return { ...suggestion, kind: 'offer' };
    if (!invitable(suggestion) || this.#run) return null;
    const subject = agents.find((one) => one.id === agent);
    if (!subject?.ready) return null;
    // Once this agent and model have been measured under the CLI installed now, the card is where
    // to measure more. A new version of the CLI is a new program, and the invitation comes back.
    const version = subject.version ?? null;
    if (records.some((record) => record.agent === agent && (record.model ?? null) === (model ?? null) && !(version && record.version && record.version !== version))) return null;
    const plan = planRound({ kind: 'quick', cases: calibrationCases(await this.#said()), agent, model, reference: suggestion.from, effort: suggestion.effort, intent: suggestion.intent, version, records });
    if (!plan.length) return null;
    return { ...suggestion, kind: 'invite', questions: plan.length, ofKind: plan.filter((one) => one.intent === suggestion.intent).length };
  }

  // The rung a cheaper one has to match: what the human usually asks this agent for, or the deep
  // tier when the ledger has never said.
  #reference(events, agent) {
    return usualEffort(events, agent) ?? TIER_EFFORT.deep;
  }

  // Everything the card shows. `models` is what the composer has chosen per agent: evidence is
  // per model, so the card reads the one the human would actually be sending to.
  async view({ models = {} } = {}) {
    const events = await this.#said();
    const records = await this.records();
    const { agents = [] } = this.#bench() ?? {};
    const cases = calibrationCases(events);
    const crew = agents.filter((agent) => agent.detected && effortLadder(agent.id));
    return {
      agents: crew.map((agent) => {
        const model = models[agent.id] ?? null;
        const reference = this.#reference(events, agent.id);
        const spec = { agent: agent.id, model, reference, version: agent.version ?? null };
        const full = planRound({ kind: 'full', cases, records, ...spec });
        const quick = planRound({ kind: 'quick', cases, records, ...spec });
        const spent = records.filter((record) => record.agent === agent.id && (record.model ?? null) === model)
          .reduce((sum, record) => sum + (record.tokens?.effort ?? 0) + (record.tokens?.reference ?? 0), 0);
        return {
          id: agent.id,
          label: agent.label ?? agent.id,
          version: agent.version ?? null,
          model,
          reference,
          ladder: effortLadder(agent.id),
          ready: Boolean(agent.ready),
          summary: calibrationSummary(records, spec),
          cases: Object.fromEntries(READ_ONLY_INTENTS.map((intent) => [intent, cases.filter((one) => one.intent === intent).length])),
          estimate: { quick: estimateTurns(quick), full: estimateTurns(full) },
          spent,
        };
      }),
      running: this.#run ? { ...this.#run } : null,
      // The pair on the table, with nothing in it that says which answer came from which rung.
      pending: this.#pending ? { step: this.#pending.step, total: this.#pending.total, intent: this.#pending.intent, question: this.#pending.question, first: this.#pending.first, second: this.#pending.second } : null,
      last: this.#last,
      offers: await this.offers(),
    };
  }

  // Starts a test in the background and answers at once. Refused, with the reason, when another
  // is running, when the agent cannot be asked, when its window is too full, or when there is
  // nothing in the ledger to ask it.
  // The quick test may be aimed (`reference`, `effort`, `intent`): the invitation under the composer
  // starts it from the rung the human is on, toward the one the rule names, on the kind of request
  // they were writing.
  async start({ kind = 'quick', agent, model = null, reference: from = null, effort = null, intent = null } = {}) {
    if (this.#run) return { error: t('A calibration is already running.') };
    if (!['quick', 'full'].includes(kind)) return { error: t('No such test "{kind}".', { kind }) };
    if (!effortLadder(agent)) return { error: t('@{agent} takes no effort per turn, so there is nothing to calibrate.', { agent }) };
    const bench = this.#bench() ?? {};
    const subject = (bench.agents ?? []).find((one) => one.id === agent);
    const invoke = subject ? bench.invokers?.[subject.adapter] : null;
    if (!subject?.ready || !invoke) return { error: t('@{agent} is not ready to answer.', { agent }) };

    const gate = mayCalibrate({ kind, usage: usageOf(await this.#events(), agent), byHuman: true });
    if (!gate.ok) return { error: t('@{agent} is too close to the end of its window to spend turns on a test.', { agent }) };

    let judge;
    if (kind === 'quick') {
      judge = { id: 'you', decide: (shown) => new Promise((resolve) => { this.#pending = { ...shown, ...this.#pendingAt, resolve }; }) };
    } else {
      const picked = judgeForAgent(agent, bench);
      if (!picked) return { error: t('There is no impartial judge for @{agent}: another agent, or the local model, has to be ready.', { agent }) };
      judge = {
        id: picked.id,
        decide: async ({ question, first, second }) => {
          const result = await bench.invokers[picked.adapter]({ executable: picked.path, projectRoot: this.#projectRoot, prompt: judgePrompt({ question, first, second }), timeoutMs: ASK_TIMEOUT_MS, model: null, json: false, attachments: [], lease: null, scopes: { web: false, imageGen: false }, imageStudio: null, signal: this.#controller?.signal });
          return parseJudgement(result?.text);
        },
      };
    }

    const events = await this.#said();
    const records = await this.records();
    const cases = calibrationCases(events);
    const ladder = effortLadder(agent);
    const reference = ladder.includes(from) ? from : this.#reference(events, agent);
    const aimed = kind === 'quick' && ladder.indexOf(effort) >= 0 && ladder.indexOf(effort) < ladder.indexOf(reference) ? effort : null;
    const focus = kind === 'quick' && READ_ONLY_INTENTS.includes(intent) ? intent : null;
    const version = subject.version ?? null;
    const plan = planRound({ kind, cases, agent, model, reference, version, records, effort: aimed, intent: focus });
    if (!plan.length) return { error: t('Nothing left to ask @{agent} at this rung: the ledger has no new questions of the kinds this test reads.', { agent }) };

    this.#controller = new AbortController();
    this.#stopping = false;
    this.#last = null;
    this.#pendingAt = { step: 0, total: kind === 'quick' ? Math.min(QUICK_CASES, plan.length) : plan.length, intent: null };
    this.#run = { kind, agent, model, reference, effort: kind === 'quick' ? plan[0].effort : null, intent: focus, judge: judge.id, startedAt: new Date().toISOString(), turns: 0, estimate: estimateTurns(plan) };
    const ask = ({ question, effort }) => invoke({ executable: subject.path, projectRoot: this.#projectRoot, prompt: question, timeoutMs: ASK_TIMEOUT_MS, model, effort, attachments: [], lease: null, scopes: { web: false, imageGen: false }, imageStudio: null, signal: this.#controller.signal });

    this.#running = (async () => {
      try {
        const result = await runCalibration({
          kind, cases, agent, model, reference, version, records, ask, judge, effort: aimed, intent: focus,
          stop: () => this.#stopping,
          onProgress: (at) => {
            if (at.done === true) return;
            this.#pendingAt = { step: at.done + 1, total: at.total, intent: at.intent ?? null };
            if (this.#run) this.#run.turns = at.turns;
          },
        });
        await this.#keep(result.records);
        const compared = result.records.filter((record) => record.verdict && !record.control);
        // Whether the kind the test was aimed at is now settled, and where: what the human is told
        // when it ends, and what the composer will offer from now on.
        const all = [...records, ...result.records];
        const row = focus ? calibrationSummary(all, { agent, model, reference, version }).intents.find((one) => one.intent === focus) : null;
        this.#last = {
          kind, agent, model, reference, effort: aimed ?? plan[0].effort, intent: focus,
          settled: row?.status === 'measured' ? row.effort : null,
          ended: result.ended, turns: result.turns, judge: result.judge,
          compared: compared.length,
          same: compared.filter((record) => record.verdict === 'same').length,
          worse: compared.filter((record) => record.verdict === 'worse').length,
        };
      } catch (error) {
        this.#last = { kind, agent, ended: 'error', error: error.message };
      } finally {
        this.#run = null;
        this.#pending = null;
        this.#controller = null;
      }
    })();
    return { started: kind, agent, reference, estimate: this.#run.estimate };
  }

  // The human's word on the pair on the table.
  answer(choice) {
    if (!this.#pending) return { error: t('There is no pair waiting for an answer.') };
    const { resolve } = this.#pending;
    this.#pending = null;
    resolve(CHOICES.has(choice) ? choice : null);
    return { ok: true };
  }

  // Stops after the turn in flight; a pair waiting for the human is put away unjudged.
  async stop() {
    if (!this.#run) return { stopping: false };
    this.#stopping = true;
    this.#controller?.abort();
    if (this.#pending) this.answer(null);
    await this.#running?.catch(() => null);
    return { stopping: true };
  }

  // For tests and for shutdown: the run in flight, settled.
  async settled() { await this.#running?.catch(() => null); }
}
