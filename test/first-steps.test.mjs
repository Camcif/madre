import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const read = (file) => readFile(join(import.meta.dirname, '..', file), 'utf8');

test('first contact: the tour has five stops, each on the part of the room it talks about', async () => {
  const app = await read('public/app.js');
  const block = app.slice(app.indexOf('const TOUR_STEPS = ['), app.indexOf('const tour = {'));
  const targets = [...block.matchAll(/^ {4}target: '([^']+)',$/gm)].map((one) => one[1]);
  assert.deepEqual(targets, ['#composer', '#mother-button', '#chats-button', '#bar', '#modules-button']);
  // The keys a stop teaches are said beside it; the platform's own key opens Settings.
  assert.match(block, /\[`\$\{MOD_KEY\} ,`, t\('Opens Settings\.'\)\]/);
  assert.match(app, /row\.append\(el\('kbd', 'tour-key', key\), el\('span', 'what', what\)\);/);
  // One message goes to one agent: the crew works together through a plan, and the tour says so.
  assert.ok(!/two @|both answer/i.test(block), 'the tour promises that two @ make two agents answer');
});

test('first steps: offered once to a first visit, ticked by doing, never by a «done» key', async () => {
  const [app, page] = await Promise.all([read('public/app.js'), read('public/index.html')]);
  const ids = [...app.slice(app.indexOf('const FIRST_STEPS = ['), app.indexOf('const steps = {')).matchAll(/\{ id: '(\w+)'/g)].map((one) => one[1]);
  assert.deepEqual(ids, ['ask', 'team', 'mother', 'beside', 'bar', 'module']);
  assert.match(app, /return localStorage\.getItem\('pulse\.tour'\) === 'seen' \? null : \{ on: true, done: \[\] \};/);
  // The room's record ticks the first question and the first plan; the rest are ticked where they happen.
  assert.match(app, /if \(event\.type === 'message\.created' && event\.payload\?\.role === 'user'\) stepDone\('ask'\);/);
  assert.match(app, /else if \(event\.type === 'plan\.created'\) stepDone\('team'\);/);
  assert.match(app, /state\.lastSequence = Math\.max\(state\.lastSequence, event\.sequence \?\? 0\);\n  stepsSaw\(event\);/);
  for (const [where, id] of [['function openMother() {', 'mother'], ['function openModuleWindow(id) {', 'module'], ['function barEdit(on', 'bar']]) {
    const body = app.slice(app.indexOf(where), app.indexOf(where) + 400);
    assert.ok(body.includes(`stepDone('${id}')`), `${where} does not tick ${id}`);
  }
  assert.equal((app.match(/stepDone\('beside'\);/g) ?? []).length, 2, 'the split and a window both count as a second conversation');
  // The list is defined before the room replays its record, so the replay can tick it.
  assert.ok(app.indexOf('const steps = {') < app.indexOf('/* ---------- bootstrap ---------- */'));
  // It rides in the bar with the other pills that come and go, and ? brings a hidden list back.
  assert.match(app, /const BAR_CONTEXTUAL = \['#steps-pill', '#update-pill', '#stop-all'\];/);
  assert.match(app, /stepsResume\(\); startTour\(\);/);
  assert.match(page, /<button id="steps-pill" class="stop-all steps-pill" type="button" hidden/);
});

test('scrolling: the editor keeps its wheel, and a reply looks the same on screen and off it', async () => {
  const [editor, css, app] = await Promise.all([read('public/editor.js'), read('public/styles.css'), read('public/app.js')]);
  assert.match(editor, /node\.addEventListener\('wheel', \(event\) => \{\n {4}if \(event\.ctrlKey \|\| event\.target === input\) return;/);
  assert.match(css, /scrollbar-width: thin; overscroll-behavior: contain;\n\}/);
  assert.match(css, /\.viewer-body \{ height: calc\(100% - 46px\); overflow: auto; overscroll-behavior: contain;/);
  // Only the blur waits for a row to come near; its tint and shadow never change on the way in.
  assert.match(css, /:root\[data-scheme="light"\]\[data-wallpaper\] #messages \.row:is\(\.assistant, \.thinking\) \.bubble \{ background-color: rgba\(255, 255, 255, \.9\); \}/);
  assert.match(app, /rootMargin: '100% 0px'/);
});
