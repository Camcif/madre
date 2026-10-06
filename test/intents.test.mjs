import test from 'node:test';
import assert from 'node:assert/strict';
import { EFFORTS } from '../src/models.mjs';
import {
  classifyIntent, contextSignals, threadContext, suggestEffort,
  foldEvidence, lowestSufficient, nextRung, rungStatus, wilsonUpper, evidenceKey,
  TIER_EFFORT, INTENT_TIER, MIN_COMPARISONS, MAX_COMPARISONS, LOSS_BAR, HEAVY_CHARS,
} from '../src/modules/intents-policy.mjs';

const ladder = EFFORTS.claude;
const comparisons = (base, verdicts) => verdicts.map((verdict, i) => ({ caseId: `c${i}`, ...base, verdict }));
const many = (n, verdict) => Array.from({ length: n }, () => verdict);

test('intenciones: only agents whose CLI takes an effort per run get a suggestion', () => {
  const text = 'explica cómo funciona el destilador';
  for (const agent of ['gemini', 'opencode', 'madre', 'nobody', undefined]) assert.equal(suggestEffort({ text, agent }), null, `${agent} has no effort to suggest`);
  for (const agent of Object.keys(EFFORTS)) assert.ok(suggestEffort({ text, agent }), `${agent} takes an effort and should get one`);

  // A rule speaks in rungs every ladder has. If a CLI ever renames one, this is where it shows,
  // instead of as a suggestion the CLI rejects.
  for (const [agent, rungs] of Object.entries(EFFORTS)) {
    for (const effort of Object.values(TIER_EFFORT)) assert.ok(rungs.includes(effort), `${agent} has no "${effort}"`);
  }
  for (const tier of Object.values(INTENT_TIER)) assert.ok(TIER_EFFORT[tier], `tier ${tier} names no rung`);
});

test('intenciones: what kind of request it is, read from how people actually write to an agent', () => {
  const cases = [
    ['¿Dónde está definido el puerto por defecto?', 'lookup'],
    ['which file defines the default port?', 'lookup'],
    ['explica cómo funciona el destilador', 'explain'],
    ['how does the distiller decide when to run?', 'explain'],
    // Explaining the architecture is an explanation, not a design session.
    ['explica la arquitectura de la sala', 'explain'],
    ['revisa el diff de room.mjs antes del commit', 'review'],
    ['review the changes in src/memory.mjs', 'review'],
    ['implementa el selector de esfuerzo en el compositor', 'implement'],
    ['add a --json flag to madre doctor', 'implement'],
    // The verb sits in the middle of the sentence, after a go-ahead that is not the whole message.
    ['Perfecto comencemos, para después cablear todo con ux, quiero que trabajes en las pruebas', 'implement'],
    // A fix with nothing failing in it is an edit.
    ['arregla el typo del README', 'implement'],
    ['arregla el login, truena al guardar con un TypeError', 'diagnose'],
    ['explica por qué falla el test de memoria', 'diagnose'],
    ['Can you please fix the flaky test? it fails on CI', 'diagnose'],
    // "build" is a noun here; an English verb only counts at the head of the request.
    ['why is the build failing on node 22?', 'diagnose'],
    ['the update broke the composer', 'diagnose'],
    ['sigue sin funcionar el login', 'diagnose'],
    ["TypeError: Cannot read properties of undefined (reading 'id')\n    at Room.send (src/room.mjs:902:15)", 'diagnose'],
    ['Analiza esta idea porque con ella puedo monetizar con madre', 'design'],
    ['¿Cómo ves esta idea?', 'design'],
    // Designing the error handling is design, whatever the word "errores" says on its own.
    ['diseña el manejo de errores del adaptador', 'design'],
    ['should we use SQLite WAL or a single JSONL ledger?', 'design'],
    ['gracias!', 'chat'],
    // Questions about what the room already said belong to routing.js and @madre.
    ['¿qué decidimos sobre el puerto?', 'archive'],
    ['what did we decide about the port?', 'archive'],
  ];
  for (const [text, intent] of cases) assert.equal(classifyIntent(text)?.intent, intent, text);
  assert.equal(classifyIntent(''), null);
  assert.equal(classifyIntent('   '), null);
});

test('intenciones: the rung a rule names follows the kind of request, on both ladders', () => {
  const expected = [
    ['¿Dónde está definido el puerto por defecto?', 'lookup', 'low'],
    ['explica cómo funciona el destilador', 'explain', 'medium'],
    ['revisa el diff de room.mjs antes del commit', 'review', 'medium'],
    ['implementa el selector de esfuerzo en el compositor', 'implement', 'medium'],
    ['explica por qué falla el test de memoria', 'diagnose', 'high'],
    ['¿Cómo ves esta idea?', 'design', 'high'],
  ];
  for (const agent of ['claude', 'codex']) {
    for (const [text, intent, effort] of expected) {
      const said = suggestEffort({ text, agent });
      assert.equal(said.intent, intent, text);
      assert.equal(said.effort, effort, `${agent}: ${text}`);
      assert.equal(said.basis, 'rule');
      // Nobody told the room what the CLI would have used, so there is no direction to claim.
      assert.equal(said.from, null);
      assert.equal(said.direction, null);
    }
  }
  // An archive question gets no effort: routing.js offers @madre for it instead.
  assert.equal(suggestEffort({ text: '¿qué decidimos sobre el puerto?', agent: 'claude' }), null);
});

test('intenciones: the context of the turn moves the effort one rung at a time, and says which part did', () => {
  const at = (text, extra = {}) => suggestEffort({ text, agent: 'claude', ...extra });

  assert.deepEqual([at('explica rápido cómo funciona el destilador').effort, at('explica rápido cómo funciona el destilador').signals], ['low', ['asked-quick']]);
  assert.deepEqual([at('explica a fondo cómo funciona el destilador').effort, at('explica a fondo cómo funciona el destilador').signals], ['high', ['asked-deep']]);
  // Both at once cancel out.
  assert.equal(at('explica rápido pero a fondo cómo funciona el destilador').effort, 'medium');

  // The last answer in this conversation failed, or the human says it did not work.
  assert.deepEqual(at('explica cómo funciona el destilador', { previous: { intent: 'explain', outcome: 'failed' } }).signals, ['retry']);
  assert.equal(at('explica cómo funciona el destilador', { previous: { intent: 'explain', outcome: 'bad' } }).effort, 'high');
  assert.equal(at('explica cómo funciona el destilador', { previous: { intent: 'explain', outcome: 'good' } }).effort, 'medium');

  // Reading it is work: a long paste, or several files at once.
  assert.equal(at(`explica este log ${'x'.repeat(HEAVY_CHARS)}`).effort, 'high');
  assert.deepEqual(at('explica cómo se relacionan estos archivos', { references: 2, attachments: 1 }).signals, ['heavy']);
  assert.equal(at('explica cómo se relacionan estos archivos', { references: 2 }).effort, 'medium');

  // "Dale" means whatever was being discussed, done: a design approved is a design to build.
  assert.equal(at('dale', { previous: { intent: 'design' } }).intent, 'implement');
  assert.equal(at('sí, adelante', { previous: { intent: 'diagnose' } }).effort, 'medium');
  // After an explanation it is "keep going", and stays an explanation.
  assert.equal(at('sigue', { previous: { intent: 'explain' } }).intent, 'explain');
  // Something that starts like a yes and is a question is not a go-ahead.
  assert.notEqual(at('si cambias el puerto, ¿qué se rompe en el servidor?', { previous: { intent: 'design' } }).intent, 'implement');
});

test('intenciones: a rule never proposes an extreme rung; quota caps the deepest one', () => {
  for (const agent of ['claude', 'codex']) {
    const rungs = EFFORTS[agent];
    // Everything that pushes up at once still stops at high: xhigh and max are the human's.
    const pushed = suggestEffort({ text: 'explica a fondo por qué falla, sigue sin funcionar', agent, previous: { intent: 'diagnose', outcome: 'failed' }, references: 4 });
    assert.equal(pushed.effort, 'high', agent);
    // Everything that pushes down at once still stops at low: minimal is not a rule's to offer.
    const pulled = suggestEffort({ text: 'gracias, rápido', agent });
    assert.equal(pulled.effort, 'low', agent);
    assert.ok(rungs.indexOf(pulled.effort) <= rungs.indexOf(pushed.effort));
  }

  // An agent near the end of its window gets standard work at most, and the reason is named.
  const capped = suggestEffort({ text: 'explica por qué falla el test de memoria', agent: 'claude', quota: { level: 'critical' } });
  assert.deepEqual([capped.effort, capped.signals], ['medium', ['quota']]);
  // Light work is not pushed further down by it.
  assert.equal(suggestEffort({ text: '¿Dónde está definido el puerto por defecto?', agent: 'claude', quota: { level: 'exhausted' } }).effort, 'low');
  assert.deepEqual(contextSignals('explica algo', { quota: { level: 'warning' } }), []);
});

test('intenciones: nothing is suggested when the turn already runs where it should; otherwise the direction is named', () => {
  const text = 'explica cómo funciona el destilador';
  assert.equal(suggestEffort({ text, agent: 'claude', effort: 'medium' }), null);
  // The CLI's own default counts as the current rung when MADRE knows it (Codex's config.toml).
  assert.equal(suggestEffort({ text, agent: 'codex', defaultEffort: 'medium' }), null);
  assert.equal(suggestEffort({ text, agent: 'codex', effort: 'high', defaultEffort: 'medium' }).direction, 'lower');

  const lower = suggestEffort({ text, agent: 'claude', effort: 'max' });
  assert.deepEqual([lower.from, lower.effort, lower.direction], ['max', 'medium', 'lower']);
  const raise = suggestEffort({ text: 'explica por qué falla el test de memoria', agent: 'codex', effort: 'minimal' });
  assert.deepEqual([raise.from, raise.effort, raise.direction], ['minimal', 'high', 'raise']);
  // A rule has measured nothing, so it claims no saving.
  assert.equal(lower.saving, null);
});

test('intenciones: the conversation so far is read from the ledger, ghosts and other agents left out', () => {
  let sequence = 0;
  const created = (payload, extra = {}) => ({ type: 'message.created', sequence: ++sequence, payload, ...extra });
  const events = [
    created({ messageId: 'm1', role: 'user', sender: 'you', target: 'claude', text: 'explica por qué falla el test de memoria', effort: 'low' }),
    created({ messageId: 'r1', parentMessageId: 'm1', role: 'assistant', sender: 'claude', text: 'Porque…' }),
    { type: 'message.rated', sequence: ++sequence, payload: { messageId: 'r1', rating: 'bad', by: 'you' } },
    created({ messageId: 'm2', role: 'user', sender: 'you', target: 'codex', text: 'revisa el diff de room.mjs' }),
    created({ messageId: 'g1', role: 'user', sender: 'you', target: 'claude', text: 'esto no cuenta' }, { ghost: true }),
  ];
  assert.deepEqual(threadContext(events, { agent: 'claude' }), { intent: 'diagnose', effort: 'low', outcome: 'bad' });
  assert.deepEqual(threadContext(events, { agent: 'codex' }), { intent: 'review', effort: null, outcome: null });
  assert.equal(threadContext([], { agent: 'claude' }), null);

  // A turn that never answered is an outcome too.
  const failed = [...events, created({ messageId: 'm3', role: 'user', sender: 'you', target: 'claude', text: 'explica cómo funciona el destilador' }), { type: 'message.failed', sequence: ++sequence, payload: { messageId: 'm3', target: 'claude' } }];
  assert.equal(threadContext(failed, { agent: 'claude' }).outcome, 'failed');

  // And the suggestion reads it: the same words, after a bad answer, ask for more.
  const previous = threadContext(events, { agent: 'claude' });
  const again = suggestEffort({ text: 'revisa otra vez por qué falla el test de memoria', agent: 'claude', effort: 'low', previous });
  assert.deepEqual([again.effort, again.direction], ['high', 'raise']);
});

test('intenciones: "enough" is a number with a confidence, not a feeling', () => {
  // Six blind comparisons and the cheaper rung lost none: enough. One loss in six is not known yet.
  assert.ok(wilsonUpper(0, MIN_COMPARISONS) <= LOSS_BAR);
  assert.ok(wilsonUpper(1, MIN_COMPARISONS) > LOSS_BAR);
  assert.equal(rungStatus({ n: MIN_COMPARISONS - 1, worse: 0 }), 'open');
  assert.equal(rungStatus({ n: 6, worse: 0 }), 'sufficient');
  assert.equal(rungStatus({ n: 6, worse: 1 }), 'open');
  assert.equal(rungStatus({ n: 12, worse: 1 }), 'sufficient');
  assert.equal(rungStatus({ n: 12, worse: 2 }), 'open');
  // Clearly losing is an answer before the cap; never showing it is enough is one at the cap.
  assert.equal(rungStatus({ n: 8, worse: 6 }), 'insufficient');
  assert.equal(rungStatus({ n: MAX_COMPARISONS, worse: 5 }), 'insufficient');
  assert.equal(rungStatus(undefined), 'open');
});

test('intenciones: evidence keeps only what still describes the CLI installed now', () => {
  const base = { agent: 'claude', model: null, intent: 'explain', reference: 'high', version: '2.0.1' };
  const records = [
    // An older calibration against another reference: a different question, left out.
    ...comparisons({ ...base, effort: 'low', reference: 'medium' }, many(6, 'worse')),
    ...comparisons({ ...base, effort: 'medium', tokens: { effort: 900, reference: 3000 } }, ['same', 'same', 'better', 'same', 'worse', 'same']),
    { ...base, effort: 'medium', caseId: 'x', skipped: 'failed' },
    { ...base, effort: 'medium', caseId: 'y', verdict: 'maybe' },
    // Measured under a CLI that is no longer installed.
    ...comparisons({ ...base, effort: 'low', version: '1.9.0' }, many(6, 'same')),
    // Gemini takes no effort, so it has no evidence.
    ...comparisons({ ...base, agent: 'gemini', effort: 'low' }, many(6, 'same')),
  ];
  const evidence = foldEvidence(records, { versions: { claude: '2.0.1' } });
  assert.deepEqual([...evidence.keys()], [evidenceKey('claude', null, 'explain')]);
  const cell = evidence.get('claude|default|explain');
  assert.equal(cell.reference, 'high');
  assert.deepEqual(cell.rungs, { medium: { n: 6, worse: 1, same: 4, better: 1 } });
  assert.deepEqual(cell.tokens, { medium: many(6, 900), high: many(6, 3000) });

  // Without knowing the installed version, nothing is thrown away for its version.
  assert.equal(foldEvidence(records).get('claude|default|explain').rungs.low.n, 6);
});

test('intenciones: the search goes down one rung at a time; the answer steps over a rung nobody measured, never over one that failed', () => {
  const cell = (rungs) => ({ agent: 'claude', model: null, intent: 'explain', reference: 'high', rungs, tokens: {} });
  const enough = { n: 6, worse: 0 };
  const notEnough = { n: 8, worse: 6 };

  assert.equal(nextRung(undefined, ladder, 'high'), 'medium');
  assert.equal(lowestSufficient(null, ladder), null);

  assert.equal(nextRung(cell({ medium: enough }), ladder, 'high'), 'low');
  assert.deepEqual(lowestSufficient(cell({ medium: enough }), ladder), { effort: 'medium', n: 6, needsReference: false });

  assert.equal(nextRung(cell({ medium: enough, low: notEnough }), ladder, 'high'), null);
  assert.equal(lowestSufficient(cell({ medium: enough, low: enough }), ladder).effort, 'low');
  // The bottom of the ladder is the end of the search.
  assert.equal(nextRung(cell({ medium: enough, low: enough }), ladder, 'high'), null);

  // The first rung down was not enough: measured, and the answer is the reference itself.
  assert.deepEqual(lowestSufficient(cell({ medium: notEnough }), ladder), { effort: 'high', n: 8, needsReference: true });
  assert.equal(nextRung(cell({ medium: notEnough }), ladder, 'high'), null);

  // "Low was as good as high" is a measurement of low, whatever is still open about medium; the
  // search itself still goes back to finish medium.
  assert.equal(lowestSufficient(cell({ medium: { n: 3, worse: 0 }, low: enough }), ladder).effort, 'low');
  assert.equal(nextRung(cell({ medium: { n: 3, worse: 0 }, low: enough }), ladder, 'high'), 'medium');
  // But a rung that failed is a wall: a good run below it is not believed.
  assert.equal(lowestSufficient(cell({ medium: notEnough, low: enough }), ladder).effort, 'high');
  // Nothing measured at all on the way down is no answer.
  assert.equal(lowestSufficient(cell({ medium: { n: 3, worse: 0 } }), ladder), null);
  assert.equal(nextRung(undefined, ladder, 'low'), null);
  assert.equal(nextRung(undefined, ladder, 'nonsense'), null);
});

test('intenciones: what was measured beats what the request looks like, and says what it saved', () => {
  const base = { agent: 'claude', model: null, reference: 'high', version: null };
  const evidence = foldEvidence([
    // Explanations: medium and low were both as good as high, and low cost a quarter.
    ...comparisons({ ...base, intent: 'explain', effort: 'medium', tokens: { effort: 2000, reference: 4000 } }, many(6, 'same')),
    ...comparisons({ ...base, intent: 'explain', effort: 'low', tokens: { effort: 1000, reference: 4000 } }, many(6, 'same')),
    // Diagnoses: medium lost most of the time. High is what they need.
    ...comparisons({ ...base, intent: 'diagnose', effort: 'medium' }, [...many(6, 'worse'), 'same', 'same']),
  ]);

  const explain = suggestEffort({ text: 'explica cómo funciona el destilador', agent: 'claude', effort: 'high', evidence });
  assert.deepEqual(
    [explain.effort, explain.basis, explain.direction, explain.saving, explain.measured],
    ['low', 'measured', 'lower', 0.75, { n: 6, reference: 'high', needsReference: false }],
  );
  // The context still counts, on top of what was measured.
  const deeper = suggestEffort({ text: 'explica a fondo cómo funciona el destilador', agent: 'claude', effort: 'high', evidence });
  assert.deepEqual([deeper.effort, deeper.signals, deeper.saving], ['medium', ['asked-deep'], 0.5]);

  // Measured as needing its reference: raised, even though "medium" would have been the rule for
  // a cheaper-looking request.
  const diagnose = suggestEffort({ text: 'explica por qué falla el test de memoria', agent: 'claude', effort: 'medium', evidence });
  assert.deepEqual([diagnose.effort, diagnose.direction, diagnose.basis, diagnose.measured.needsReference], ['high', 'raise', 'measured', true]);
  // Quota does not talk the room into a rung it saw fail.
  const pressed = suggestEffort({ text: 'explica por qué falla el test de memoria', agent: 'claude', effort: 'medium', quota: { level: 'critical' }, evidence });
  assert.equal(pressed.effort, 'high');

  // Evidence is per model: what Sonnet showed says nothing about Opus.
  const sonnet = foldEvidence(comparisons({ ...base, model: 'sonnet', intent: 'explain', effort: 'medium' }, many(6, 'same')));
  assert.equal(suggestEffort({ text: 'explica cómo funciona el destilador', agent: 'claude', model: 'opus', effort: 'high', evidence: sonnet }).basis, 'rule');
  assert.equal(suggestEffort({ text: 'explica cómo funciona el destilador', agent: 'claude', model: 'sonnet', effort: 'high', evidence: sonnet }).basis, 'measured');
});

test('intenciones: a measurement may reach rungs a rule never names', () => {
  // Codex lookups, measured against medium: low and even minimal were as good.
  const base = { agent: 'codex', model: null, intent: 'lookup', reference: 'medium' };
  const evidence = foldEvidence([
    ...comparisons({ ...base, effort: 'low' }, many(6, 'same')),
    ...comparisons({ ...base, effort: 'minimal' }, many(6, 'same')),
  ]);
  const said = suggestEffort({ text: '¿Dónde está definido el puerto por defecto?', agent: 'codex', effort: 'medium', evidence });
  assert.deepEqual([said.effort, said.basis], ['minimal', 'measured']);

  // And a reference above high, measured as needed, is offered even though no rule goes there.
  const hard = foldEvidence(comparisons({ agent: 'codex', model: null, intent: 'design', reference: 'xhigh', effort: 'high' }, many(8, 'worse')));
  assert.equal(suggestEffort({ text: '¿Cómo ves esta idea?', agent: 'codex', effort: 'medium', evidence: hard }).effort, 'xhigh');
});
