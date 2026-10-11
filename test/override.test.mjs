import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mergeOverride, overrideSettings, OVERRIDE_GRACE, OVERRIDE_KEYS } from '../src/override.mjs';

const read = (file) => readFile(join(import.meta.dirname, '..', file), 'utf8');
const PHRASE = { salt: 'a'.repeat(32), hash: 'b'.repeat(64) };

test('override: nothing stored is today\'s ritual — the designation, typed twice for #4, asked every message', () => {
  assert.deepEqual(overrideSettings(), { keys: { 3: 'designation', 4: 'designation-airlock' }, grace: { 3: 0, 4: 0 }, phrase: null });
  assert.deepEqual(overrideSettings(null), overrideSettings({}));
});

test('override: #4 always asks for something, and its grace is never longer than 5 minutes', () => {
  assert.ok(!OVERRIDE_KEYS[4].includes('confirm'), '#4 FULL ACCESS can be opened with one click');
  assert.equal(overrideSettings({ keys: { 4: 'confirm' } }).keys[4], 'designation-airlock');
  assert.equal(overrideSettings({ grace: { 4: 30 } }).grace[4], 0);
  assert.deepEqual(OVERRIDE_GRACE[4], [0, 5]);
  assert.equal(overrideSettings({ grace: { 3: 30, 4: 5 } }).grace[3], 30);
  assert.equal(overrideSettings({ grace: { 3: 45 } }).grace[3], 0, 'an unlisted grace is taken');
});

test('override: a phrase is a salted fingerprint or nothing, and a key that needs it falls back without it', () => {
  assert.equal(overrideSettings({ phrase: { salt: 'x', hash: 'y' } }).phrase, null);
  assert.equal(overrideSettings({ phrase: { plain: 'open sesame' } }).phrase, null, 'a phrase in clear is kept');
  assert.deepEqual(overrideSettings({ phrase: PHRASE }).phrase, PHRASE);
  assert.equal(overrideSettings({ keys: { 3: 'phrase' } }).keys[3], 'designation');
  assert.equal(overrideSettings({ keys: { 3: 'phrase', 4: 'phrase-airlock' }, phrase: PHRASE }).keys[4], 'phrase-airlock');
});

test('override: a change merges over what is stored, and forgetting the phrase takes its keys with it', () => {
  const stored = mergeOverride({}, { phrase: PHRASE, keys: { 3: 'phrase', 4: 'phrase-airlock' }, grace: { 3: 15 } });
  assert.deepEqual(stored.keys, { 3: 'phrase', 4: 'phrase-airlock' });
  const later = mergeOverride(stored, { grace: { 4: 5 } });
  assert.deepEqual(later.grace, { 3: 15, 4: 5 });
  assert.equal(later.keys[3], 'phrase', 'a grace change dropped the key');
  const forgot = mergeOverride(later, { phrase: null });
  assert.equal(forgot.phrase, null);
  assert.deepEqual(forgot.keys, { 3: 'designation', 4: 'designation-airlock' });
});

test('override: the room stores it, says it on boot and in AJUSTES, and the browser checks the key', async () => {
  const [server, app, page] = await Promise.all([read('src/server.mjs'), read('public/app.js'), read('public/index.html')]);
  assert.match(server, /overrideConfig = mergeOverride\(\(await readConfig\(root\)\)\.override, patch\.override\);/);
  assert.equal((server.match(/override: overrideConfig,/g) ?? []).length, 2, 'the key is not in both the boot state and the settings');
  // The phrase never leaves the browser: only its salted hash is compared and saved.
  assert.match(app, /crypto\.subtle\.digest\('SHA-256', new TextEncoder\(\)\.encode\(`\$\{salt\}:\$\{words\}`\)\)/);
  assert.match(app, /await saveOverride\(\{ phrase: \{ salt, hash \} \}/);
  assert.ok(!/override: \{ phrase: words/.test(app), 'the phrase is sent in clear');
  // A grace is per mode and agent, never covers a raise of the ceiling, and STOPALL closes it.
  assert.match(app, /const left = raise \? 0 : overrideGraceLeft\(mode, id\);/);
  assert.match(app, /if \(overrideGrace\.size\) closeOverrideGrace\(\);/);
  // PERMISSIONS is a category of its own, and the agent's sheet sends there for the ceiling.
  assert.match(app, /const SETTINGS_ORDER = \['look', 'room', 'files', 'agents', 'memory', 'permissions', 'privacy', 'release'\];/);
  assert.match(app, /sxButton\(t\('Change in Permissions'\), \(\) => openSettingsOn\('permissions', \{ part: 'permissions' \}\)\)/);
  assert.match(page, /<dialog id="override"/);
});

test('override: the key for #3 and #4 is one of the room\'s alerts, said in sentences', async () => {
  const [app, page, css] = await Promise.all([read('public/app.js'), read('public/index.html'), read('public/styles.css')]);
  assert.match(page, /<dialog id="override" class="room-ask key-ask" aria-labelledby="override-title">/);
  assert.match(app, /override\.title\.textContent = mode === 4 \? t\('Open #4 FULL ACCESS for @\{agent\}'/);
  assert.ok(!app.includes('SPECIAL ORDER 937 ACKNOWLEDGED'), 'the key still answers in capitals');
  // The room's questions wear a glyph and speak in sentences; the console's keep the console.
  assert.match(app, /sheet\.title\.textContent = inConsole \? title : askWords\(title\);/);
  assert.match(css, /dialog\.room-ask:not\(\.console\) \.room-ask-actions \{ width: 100%; display: grid;/);
});
