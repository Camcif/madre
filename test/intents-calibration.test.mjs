import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  calibrationCases, usualEffort, planRound, estimateTurns, mayCalibrate, blindPair, unblind,
  judgePrompt, parseJudgement, judgeForAgent, runCalibration, calibrationSummary, degrade, judgeHealth,
  QUICK_CASES, READ_ONLY_INTENTS, EXPIRING_MS, CONTROL_MIN,
} from '../src/modules/intents-calibration.mjs';
import { foldEvidence, suggestEffort, MIN_COMPARISONS, MAX_COMPARISONS } from '../src/modules/intents-policy.mjs';

// A ledger the way the room writes it: a human question, the reply that answered it.
function ledger({ perIntent = 8 } = {}) {
  let sequence = 0;
  const events = [];
  const exchange = (text, { sender = 'claude', effort, ghost = false } = {}) => {
    const id = `m${sequence + 1}`;
    events.push({ type: 'message.created', sequence: ++sequence, ...(ghost ? { ghost: true } : {}), payload: { messageId: id, role: 'user', sender: 'you', target: sender, text, ...(effort ? { effort } : {}) } });
    events.push({ type: 'message.created', sequence: ++sequence, payload: { messageId: `r${sequence}`, parentMessageId: id, role: 'assistant', sender, text: `Una respuesta completa a «${text}», con detalle suficiente.` } });
  };
  const templates = {
    lookup: (i) => `¿Dónde está definido el puerto del servicio ${i}?`,
    explain: (i) => `explica cómo funciona el módulo ${i} de la sala`,
    review: (i) => `revisa el cambio ${i} de src/room.mjs antes del commit`,
    diagnose: (i) => `explica por qué falla la prueba ${i} de memoria`,
    design: (i) => `¿conviene usar SQLite o JSONL para el caso ${i}?`,
  };
  for (let i = 0; i < perIntent; i += 1) for (const make of Object.values(templates)) exchange(make(i), { effort: 'high' });
  // None of these is a calibration case.
  exchange('implementa el selector de esfuerzo en el compositor');
  exchange('¿qué decidimos sobre el puerto del servidor?');
  exchange('explica cómo funciona el destilador en modo fantasma', { ghost: true });
  exchange('explica cómo funciona el destilador según el modelo local', { sender: 'madre' });
  exchange(templates.explain(0));
  exchange('/memory status of the whole room please');
  exchange('ok');
  return events;
}

test('intenciones calibration: the questions come from this project, and only the ones a read-only turn can answer', () => {
  const cases = calibrationCases(ledger());
  const count = (intent) => cases.filter((one) => one.intent === intent).length;
  for (const intent of READ_ONLY_INTENTS) assert.equal(count(intent), 8, intent);
  assert.equal(cases.length, 40);
  // Implementation, archive questions, ghosts, the local model's own answers, repeats, commands
  // and one-word messages are all out.
  assert.ok(!cases.some((one) => /selector|decidimos|fantasma|modelo local|^\/|^ok$/.test(one.question)));
  assert.ok(cases.every((one) => /^q\d+$/.test(one.caseId)));
  assert.equal(new Set(cases.map((one) => one.caseId)).size, cases.length);
});

test('intenciones calibration: the reference is the rung the human usually asks for', () => {
  const events = ledger({ perIntent: 1 });
  assert.equal(usualEffort(events, 'claude'), 'high');
  assert.equal(usualEffort(events, 'codex'), null);
  assert.equal(usualEffort(events, 'gemini'), null);
  // A tie goes to the deeper rung: the cheaper one is what is being tested, not assumed.
  const tie = [
    { type: 'message.created', payload: { role: 'user', target: 'codex', effort: 'low' } },
    { type: 'message.created', payload: { role: 'user', target: 'codex', effort: 'high' } },
  ];
  assert.equal(usualEffort(tie, 'codex'), 'high');
});

test('intenciones calibration: the quick test is six different kinds of question, one rung down, twelve turns', () => {
  const cases = calibrationCases(ledger());
  const plan = planRound({ kind: 'quick', cases, agent: 'claude', reference: 'high' });
  assert.equal(plan.length, QUICK_CASES);
  assert.ok(plan.every((one) => one.effort === 'medium' && one.reference === 'high'));
  // Interleaved: every kind the ledger has appears before any kind repeats.
  assert.deepEqual(new Set(plan.slice(0, READ_ONLY_INTENTS.length).map((one) => one.intent)).size, READ_ONLY_INTENTS.length);
  assert.equal(estimateTurns(plan), 12);
  assert.equal(estimateTurns(plan, { answered: new Set(plan.map((one) => one.caseId)) }), 6);

  // A question already asked at that rung is not asked again.
  const asked = plan.map((one) => ({ agent: 'claude', model: null, reference: 'high', caseId: one.caseId, effort: 'medium', intent: one.intent, verdict: 'same' }));
  const again = planRound({ kind: 'quick', cases, agent: 'claude', reference: 'high', records: asked });
  assert.equal(again.length, QUICK_CASES);
  assert.ok(again.every((one) => !plan.some((first) => first.caseId === one.caseId)));

  // Nothing below the bottom rung, and nothing for a CLI without a ladder.
  assert.deepEqual(planRound({ kind: 'quick', cases, agent: 'claude', reference: 'low' }), []);
  assert.deepEqual(planRound({ kind: 'quick', cases, agent: 'gemini', reference: 'high' }), []);
  assert.deepEqual(planRound({ kind: 'full', cases, agent: 'claude', reference: 'nonsense' }), []);
});

test('intenciones calibration: the full test asks six more at a time, and never past twenty on one rung', () => {
  const cases = calibrationCases(ledger({ perIntent: 30 }));
  const explain = cases.filter((one) => one.intent === 'explain');
  const record = (one, verdict) => ({ agent: 'claude', model: null, reference: 'high', intent: 'explain', caseId: one.caseId, effort: 'medium', verdict });
  // Eighteen comparisons, three lost: not shown to be enough, not shown not to be. Still open.
  const eighteen = explain.slice(0, 18).map((one, i) => record(one, i < 3 ? 'worse' : 'same'));
  const plan = planRound({ kind: 'full', cases, agent: 'claude', reference: 'high', records: eighteen }).filter((one) => one.intent === 'explain');
  assert.equal(plan.length, MAX_COMPARISONS - 18);
  assert.ok(plan.every((one) => one.effort === 'medium' && !eighteen.some((done) => done.caseId === one.caseId)));
  // The other kinds start with six each.
  assert.equal(planRound({ kind: 'full', cases, agent: 'claude', reference: 'high', records: eighteen }).filter((one) => one.intent === 'lookup').length, MIN_COMPARISONS);
});

test('intenciones calibration: it never spends quota the human needs, and unattended only spends what would expire', () => {
  const now = Date.parse('2026-10-06T12:00:00Z');
  const inHours = (hours) => new Date(now + hours * 3600 * 1000).toISOString();
  const may = (kind, usage, extra = {}) => mayCalibrate({ kind, usage, now, ...extra });

  assert.deepEqual(may('quick', null), { ok: true, reason: 'quick' });
  assert.deepEqual(may('quick', { usedPercent: 85 }), { ok: false, reason: 'quota' });
  assert.deepEqual(may('full', { usedPercent: 50 }, { byHuman: true }), { ok: true, reason: 'asked' });
  assert.deepEqual(may('full', { usedPercent: 92 }, { byHuman: true }), { ok: false, reason: 'quota' });

  assert.deepEqual(may('full', null), { ok: false, reason: 'unknown-quota' });
  assert.deepEqual(may('full', { usedPercent: 30, resetAt: inHours(1) }), { ok: true, reason: 'expiring' });
  assert.deepEqual(may('full', { usedPercent: 30, resetAt: inHours(5) }), { ok: false, reason: 'not-expiring' });
  assert.deepEqual(may('full', { usedPercent: 30, resetAt: inHours(-1) }), { ok: false, reason: 'not-expiring' });
  assert.deepEqual(may('full', { usedPercent: 30 }), { ok: false, reason: 'not-expiring' });
  assert.deepEqual(may('full', { usedPercent: 70, resetAt: inHours(1) }), { ok: false, reason: 'no-spare' });
  assert.ok(EXPIRING_MS > 0);
});

test('intenciones calibration: the judge cannot tell which answer is the cheaper one', () => {
  // Same case, same order; across cases, both orders.
  assert.deepEqual(blindPair('a', 'b', 'seed-1'), blindPair('a', 'b', 'seed-1'));
  const orders = new Set(Array.from({ length: 40 }, (_, i) => blindPair('cheap', 'usual', `case-${i}`).candidateFirst));
  assert.deepEqual([...orders].sort(), [false, true]);
  const pair = blindPair('cheap', 'usual', 'case-0');
  assert.deepEqual([pair.first, pair.second].sort(), ['cheap', 'usual']);

  assert.equal(unblind('same', true), 'same');
  assert.equal(unblind('first', true), 'better');
  assert.equal(unblind('first', false), 'worse');
  assert.equal(unblind('second', true), 'worse');
  assert.equal(unblind('second', false), 'better');
  assert.equal(unblind(null, true), null);
  assert.equal(unblind('maybe', false), null);

  const prompt = judgePrompt({ question: '¿Dónde está el puerto?', first: 'En src/ports.mjs.', second: 'En config.' });
  assert.ok(prompt.includes('¿Dónde está el puerto?') && prompt.includes('En src/ports.mjs.') && prompt.includes('En config.'));
  // No names, no rungs: nothing that says who wrote what, or at what price.
  assert.doesNotMatch(prompt, /\b(claude|codex|gemini|effort|minimal|low|medium|high|xhigh|max|cheap|expensive)\b/i);

  assert.equal(parseJudgement('SAME'), 'same');
  assert.equal(parseJudgement('**FIRST**'), 'first');
  assert.equal(parseJudgement('Second.'), 'second');
  assert.equal(parseJudgement('It could be FIRST or SECOND.\nSAME'), 'same');
  assert.equal(parseJudgement('FIRST and SECOND are both fine'), null);
  assert.equal(parseJudgement('neither'), null);
  assert.equal(parseJudgement(''), null);
});

test('intenciones calibration: an agent never judges its own answers', () => {
  const agents = ['ollama', 'claude', 'codex'].map((id) => ({ id, adapter: id, detected: true, ready: true }));
  const invokers = Object.fromEntries(agents.map((agent) => [agent.adapter, () => {}]));
  assert.equal(judgeForAgent('claude', { agents, invokers }).id, 'ollama');
  assert.equal(judgeForAgent('ollama', { agents, invokers }).id, 'codex');
  assert.equal(judgeForAgent('claude', { agents: agents.filter((agent) => agent.id !== 'ollama'), invokers }).id, 'codex');
  assert.equal(judgeForAgent('claude', { agents: agents.filter((agent) => agent.id === 'claude'), invokers }), null);
});

// An agent whose answers get worse below some rung, differently for each kind of question, and
// longer the harder it thinks — as real ones are. The quality is written into the answer so a fake
// judge can read it; the order the judge sees is blinded by the runner, not by the fake.
const RUNGS = ['low', 'medium', 'high', 'xhigh', 'max'];
const NEEDS = { lookup: 'low', explain: 'low', review: 'medium', diagnose: 'high', design: 'high' };
const TEMPLATE_HEADS = { lookup: '¿Dónde', explain: 'explica cómo', review: 'revisa', diagnose: 'explica por qué', design: '¿conviene' };
function simulatedAgent() {
  const calls = [];
  const ask = async ({ question, effort }) => {
    calls.push({ question, effort });
    const intent = Object.keys(NEEDS).find((kind) => question.startsWith(TEMPLATE_HEADS[kind]));
    const quality = RUNGS.indexOf(effort) >= RUNGS.indexOf(NEEDS[intent]) ? 3 : 1;
    return { text: `[q${quality}] answer to ${question}${' detail'.repeat(RUNGS.indexOf(effort))} [end]`, usage: { inputTokens: 1000, outputTokens: 200 * (RUNGS.indexOf(effort) + 1), source: 'claude-json' } };
  };
  return { ask, calls };
}
// A judge with failings of its own, deterministic so a failure here is a real failure and not a
// bad roll. `slip`: between two answers that are as good, it now and then prefers the longer one
// (the length bias every model judge has). `miss`: it now and then fails to notice that the cheaper
// answer is worse. `missCut`: the same, for an answer cut to a third — an obvious drop.
//
// The default slip is 5%, and that number is a finding rather than a convenience: at 6% this same
// fixture already settles explanations at high instead of low. Twenty comparisons allow two losses,
// so a judge's length bias is spent straight out of the savings. It never costs quality (see the
// biased-judge test), but it is the first thing to measure about a real judge.
const roll = (key) => createHash('sha256').update(key).digest()[0] / 256;
const score = (text) => (/\[end\]$/.test(text) ? Number(/\[q(\d)\]/.exec(text)[1]) : 0);
function fakeJudge({ slip = 0.05, miss = 0.25, missCut = 0.05 } = {}) {
  return {
    id: 'codex',
    decide: async ({ first, second, caseId }) => {
      const [a, b] = [score(first), score(second)];
      const r = roll(`${caseId}|${first.length}|${second.length}`);
      if (a === b) return r < slip ? (first.length >= second.length ? 'first' : 'second') : 'same';
      if (r < (Math.min(a, b) === 0 ? missCut : miss)) return 'same';
      return a > b ? 'first' : 'second';
    },
  };
}
const settledOf = (records) => Object.fromEntries(calibrationSummary(records, { agent: 'claude', reference: 'high', version: '2.0.1' }).intents.map((one) => [one.intent, one.effort]));

test('intenciones calibration: the quick test asks each question twice, keeps the human\'s word, and settles nothing on its own', async () => {
  const cases = calibrationCases(ledger());
  const { ask, calls } = simulatedAgent();
  const seen = [];
  const human = { id: 'you', decide: async (shown) => { seen.push(shown); return 'same'; } };
  const result = await runCalibration({ kind: 'quick', cases, agent: 'claude', reference: 'high', version: '2.0.1', ask, judge: human, run: 'r1', now: () => '2026-10-06T12:00:00Z' });

  assert.equal(result.ended, 'done');
  assert.equal(result.turns, 12);
  assert.equal(calls.length, 12);
  assert.equal(result.records.length, QUICK_CASES);
  assert.ok(result.records.every((record) => record.verdict === 'same' && record.judge === 'you' && record.effort === 'medium' && record.reference === 'high' && record.version === '2.0.1' && record.run === 'r1'));
  // What each rung cost, as the room's own budget counts it.
  assert.deepEqual(result.records[0].tokens, { effort: 1400, reference: 1600 });
  // A person is not put through controls: nothing in a quick run is marked untrusted.
  assert.ok(result.records.every((record) => !record.control && !record.untrusted));
  assert.equal(result.judge, null);
  // The human saw the question and two answers, never which one was which.
  assert.ok(seen.every((shown) => !('effort' in shown) && !('candidateFirst' in shown)));

  // Six of six "same" across five kinds of question is a reading, not a measurement of any kind.
  const summary = calibrationSummary(result.records, { agent: 'claude', reference: 'high', version: '2.0.1' });
  assert.deepEqual(summary.totals, { compared: 6, worse: 0, same: 6, better: 0, skipped: 0 });
  assert.ok(summary.intents.every((one) => one.status === 'open'));
  const evidence = foldEvidence(result.records);
  assert.equal(suggestEffort({ text: 'explica cómo funciona el módulo 3 de la sala', agent: 'claude', effort: 'high', evidence }).basis, 'rule');
});

test('intenciones calibration: a turn that failed is a skip, never a loss', async () => {
  const cases = calibrationCases(ledger()).slice(0, 6);
  let n = 0;
  const ask = async ({ effort }) => {
    n += 1;
    if (n === 2) throw new Error('RATE_LIMITED');
    if (n === 4) return { text: '', usage: null };
    return { text: `answer at ${effort}`, usage: null };
  };
  const undecided = { id: 'ollama', decide: async ({ caseId }) => (caseId === cases[3].caseId ? 'I cannot tell' : 'same') };
  const result = await runCalibration({ kind: 'quick', cases, agent: 'claude', reference: 'high', ask, judge: { id: 'ollama', decide: async (shown) => parseJudgement(await undecided.decide(shown)) }, controls: false });
  const skipped = result.records.filter((record) => record.skipped).map((record) => record.skipped);
  assert.deepEqual(skipped, ['failed', 'failed', 'unjudged']);
  assert.ok(result.records.filter((record) => record.skipped).every((record) => !('verdict' in record)));
  // A skip counts for nothing in either direction.
  const summary = calibrationSummary(result.records, { agent: 'claude', reference: 'high' });
  assert.deepEqual(summary.totals, { compared: 3, worse: 0, same: 3, better: 0, skipped: 3 });
});

test('intenciones calibration: the full test walks each kind of question down until a rung is not enough, and the suggestion follows', async () => {
  const cases = calibrationCases(ledger({ perIntent: 24 }));
  const { ask, calls } = simulatedAgent();
  const result = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', ask, judge: fakeJudge(), maxTurns: 1000, run: 'full-1' });
  assert.equal(result.ended, 'done');
  assert.equal(result.judge.status, 'trusted');
  assert.ok(result.judge.controls >= CONTROL_MIN);

  // What the simulated agent actually needs, found through a judge that errs now and then.
  assert.deepEqual(settledOf(result.records), { lookup: 'low', explain: 'low', review: 'medium', diagnose: 'high', design: 'high' });
  const summary = calibrationSummary(result.records, { agent: 'claude', reference: 'high', version: '2.0.1' });
  assert.ok(summary.intents.every((one) => one.status === 'measured' && one.next === null));

  // The judge's errors really happened, and the statistics absorbed them: a rung that was enough
  // lost a comparison it should not have and was given six more questions instead of a verdict...
  const counted = (intent, effort) => result.records.filter((record) => record.intent === intent && record.effort === effort && record.verdict && !record.control);
  const falseLoss = Object.entries(NEEDS).some(([intent, need]) => RUNGS.slice(RUNGS.indexOf(need), RUNGS.indexOf('high')).some((effort) => counted(intent, effort).some((record) => record.verdict === 'worse')));
  assert.ok(falseLoss, 'the fixture should make the judge wrong against a rung that was enough');
  assert.ok(summary.intents.some((one) => one.n > MIN_COMPARISONS * 2 - 1), 'some rung needed more than six questions');
  // ...and a rung that was not enough was called the same now and then, and still came out short.
  const missed = Object.entries(NEEDS).some(([intent, need]) => RUNGS.slice(0, RUNGS.indexOf(need)).some((effort) => counted(intent, effort).some((record) => record.verdict === 'same')));
  assert.ok(missed, 'the fixture should make the judge miss a real drop');
  // No rung is ever asked more than the cap.
  for (const intent of READ_ONLY_INTENTS) for (const effort of RUNGS) assert.ok(counted(intent, effort).length <= MAX_COMPARISONS, `${intent}@${effort}`);

  // Every question was answered at the reference once, however many rungs it was then asked at.
  const references = calls.filter((call) => call.effort === 'high');
  assert.equal(references.length, new Set(references.map((call) => call.question)).size);
  assert.equal(result.turns, calls.length);
  // Controls cost the judge a turn and the agent none.
  assert.equal(result.judged, result.records.filter((record) => record.verdict || record.skipped === 'unjudged').length);

  // And now the room can say, per kind of request, where this project's turns should run.
  const evidence = foldEvidence(result.records, { versions: { claude: '2.0.1' } });
  const at = (text, effort) => suggestEffort({ text, agent: 'claude', effort, evidence });
  const lookup = at('¿Dónde está definido el puerto del servicio 99?', 'high');
  assert.deepEqual([lookup.effort, lookup.direction, lookup.basis], ['low', 'lower', 'measured']);
  assert.ok(lookup.saving > 0, 'a cheaper rung that was measured says what it saved');
  assert.equal(at('revisa el cambio 99 de src/room.mjs antes del commit', 'high').effort, 'medium');
  // A diagnosis already at its rung gets nothing; one asked cheaper is told to go up, by measurement.
  assert.equal(at('explica por qué falla la prueba 99 de memoria', 'high'), null);
  const raise = at('explica por qué falla la prueba 99 de memoria', 'low');
  assert.deepEqual([raise.effort, raise.direction, raise.basis], ['high', 'raise', 'measured']);
  // The context of the turn still counts on top: an explanation asked "a fondo" goes up a rung.
  assert.equal(at('explica a fondo cómo funciona el módulo 99 de la sala', 'high').effort, 'medium');

  // A new version of the CLI is a new program: the search starts over.
  const replanned = planRound({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.1.0', records: result.records });
  assert.deepEqual(new Set(replanned.map((one) => one.effort)), new Set(['medium']));
  assert.equal(planRound({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', records: result.records }).length, 0);
});

test('intenciones calibration: a judge biased toward longer answers costs savings, never quality', async () => {
  const cases = calibrationCases(ledger({ perIntent: 24 }));
  // Between two answers that are as good, it prefers the longer one three times in ten.
  const result = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', ask: simulatedAgent().ask, judge: fakeJudge({ slip: 0.3 }), maxTurns: 1000 });
  assert.equal(result.judge.status, 'trusted');
  const settled = settledOf(result.records);
  // Never below what the work needs...
  for (const [intent, need] of Object.entries(NEEDS)) assert.ok(RUNGS.indexOf(settled[intent]) >= RUNGS.indexOf(need), `${intent} settled at ${settled[intent]}, needs ${need}`);
  // ...and above it somewhere: this is what a biased judge costs, and why the human's quick test exists.
  assert.ok(Object.entries(NEEDS).some(([intent, need]) => settled[intent] !== need));
});

test('intenciones calibration: a judge that cannot see the difference teaches the room nothing', async () => {
  const cases = calibrationCases(ledger({ perIntent: 24 }));
  const agent = simulatedAgent();
  // It misses most real drops — and most cut answers too, which is how it is caught.
  const result = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', ask: agent.ask, judge: fakeJudge({ miss: 1, missCut: 1 }), maxTurns: 1000 });
  assert.equal(result.ended, 'judge-blind');
  assert.equal(result.judge.status, 'blind');
  // It was stopped at its first controls, not after a hundred turns.
  assert.ok(result.turns <= CONTROL_MIN * 2, `stopped after ${result.turns} turns`);
  assert.ok(result.records.filter((record) => record.verdict && !record.control).every((record) => record.untrusted));

  // Nothing it said is evidence: the suggestion stays what the request looks like.
  const evidence = foldEvidence(result.records);
  assert.equal(evidence.size, 0);
  assert.equal(suggestEffort({ text: 'explica por qué falla la prueba 99 de memoria', agent: 'claude', effort: 'high', evidence }), null);
  assert.equal(suggestEffort({ text: 'explica cómo funciona el módulo 99 de la sala', agent: 'claude', effort: 'high', evidence }).basis, 'rule');
  // And what it saw can be asked again of a judge that can see.
  assert.ok(planRound({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', records: result.records }).length > 0);

  // Without controls the same judge would have taught the room a diagnosis needs less than it does.
  const unchecked = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', version: '2.0.1', ask: simulatedAgent().ask, judge: fakeJudge({ miss: 1, missCut: 1 }), controls: false, maxTurns: 1000 });
  assert.ok(RUNGS.indexOf(settledOf(unchecked.records).diagnose) < RUNGS.indexOf('high'), 'the danger the controls exist for');
});

test('intenciones calibration: the control is the paid answer cut to a third, and the judge is graded on it', () => {
  const text = 'El puerto por defecto se define en src/ports.mjs y el servidor lo lee al arrancar.';
  const cut = degrade(text);
  assert.ok(text.startsWith(cut) && cut.length <= text.length / 3 && cut.length > 0);
  assert.equal(degrade('a'), 'a');
  assert.equal(degrade(''), '');

  const control = (verdict, run = 'r') => ({ control: true, verdict, run });
  assert.equal(judgeHealth([control('worse'), control('worse')]).status, 'unknown');
  assert.equal(judgeHealth([control('worse'), control('worse'), control('worse')]).status, 'trusted');
  assert.equal(judgeHealth([control('same'), control('same'), control('better')]).status, 'blind');
  assert.equal(judgeHealth([control('worse'), control('same'), control('worse')]).status, 'unknown');
  // Per run: another run's controls vouch for nobody here.
  assert.equal(judgeHealth([control('worse', 'a'), control('worse', 'a'), control('worse', 'a')], { run: 'b' }).status, 'unknown');
  // Comparisons are not controls.
  assert.equal(judgeHealth([{ verdict: 'worse' }, { verdict: 'worse' }, { verdict: 'worse' }]).controls, 0);
});

test('intenciones calibration: a budget is a budget, and stop means stop', async () => {
  const cases = calibrationCases(ledger({ perIntent: 24 }));
  const budgeted = simulatedAgent();
  const tight = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', ask: budgeted.ask, judge: fakeJudge(), maxTurns: 5 });
  assert.equal(tight.ended, 'budget');
  assert.ok(tight.turns <= 5);
  assert.equal(budgeted.calls.length, tight.turns);

  let checks = 0;
  const stopped = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', ask: simulatedAgent().ask, judge: fakeJudge(), stop: () => (checks += 1) > 2 });
  assert.equal(stopped.ended, 'stopped');
  assert.equal(stopped.records.filter((record) => !record.control).length, 2);

  // The full test's own default cap holds even when the human never set one.
  const capped = simulatedAgent();
  const run = await runCalibration({ kind: 'full', cases, agent: 'claude', reference: 'high', ask: capped.ask, judge: fakeJudge() });
  assert.ok(run.turns <= 120);
});

test('intenciones calibration: a turn that fails keeps its reason and what it cost, so the card can say why', async () => {
  const cases = calibrationCases(ledger());
  const ask = async ({ effort }) => (effort === 'high'
    ? { text: '', error: 'Codex exited 1: stream disconnected before completion\nmore lines that are not kept', usage: { inputTokens: 1200, outputTokens: 40 } }
    : { text: 'an answer', usage: { inputTokens: 900, outputTokens: 30 } });
  const result = await runCalibration({ kind: 'quick', cases, agent: 'codex', reference: 'high', ask, judge: { id: 'you', decide: async () => 'same' }, run: 'fail-1' });
  const failed = result.records.filter((record) => record.skipped === 'failed');
  assert.ok(failed.length > 0, 'the failed turns were not kept as failures');
  for (const record of failed) {
    assert.equal(record.failedAt, 'high');
    assert.equal(record.why, 'Codex exited 1: stream disconnected before completion', 'the reason is not the first line of the error');
    assert.ok(record.tokens.reference > 0, 'what the failed turn cost was lost');
  }
});
