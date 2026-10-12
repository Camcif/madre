// How the person wants MADRE to look, once for every page (2026-10-12). Each project is its own
// origin — another port — and Home is one more, so what a browser keeps for one is invisible to
// the others: the dark theme chosen in Home left every project light. The choices live here, in
// ~/.pulse/looks.json, beside tour.json and whats-new.json; every page reads them when it opens or
// comes back into view, and writes them when the person changes one. The browser's own copy stays,
// so a page paints in the last known look before it hears from here.
//
// Only what the pages share: the theme, the accent, the wallpaper and its dials, the bubbles and
// the text of the conversation. How Home lays out its own cards stays in Home's browser.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { oneAtATime, writeWhole } from './json-file.mjs';

const CHOICE = /^[a-z][a-z0-9-]{0,23}$/;
const NUMBER = /^\d{1,3}$/;
export const LOOK_KEYS = {
  'pulse.theme': CHOICE,
  'pulse.accent': CHOICE,
  'pulse.wallpaper': CHOICE,
  'pulse.wallpaper.style': CHOICE,
  'pulse.wallpaper.veil': NUMBER,
  'pulse.wallpaper.blur': NUMBER,
  'pulse.bubbles': CHOICE,
  'pulse.text': CHOICE,
};
const looksFile = (stateRoot) => join(stateRoot, 'looks.json');

// What is kept, read key by key: anything else in the file, or a value of the wrong shape, is not
// a look. `null` for a key means the first value — the room as it always was.
export async function readLooks(stateRoot) {
  const raw = await readFile(looksFile(stateRoot), 'utf8').then((text) => JSON.parse(text)).catch(() => null);
  const looks = {};
  for (const [key, shape] of Object.entries(LOOK_KEYS)) {
    const value = raw?.looks?.[key];
    looks[key] = typeof value === 'string' && shape.test(value) ? value : null;
  }
  return { looks, saved: Boolean(raw && typeof raw.looks === 'object') };
}

// A change from a page: the keys it names, set or cleared. A key it does not know, or a value of
// the wrong shape, refuses the whole change rather than half of it.
export function changeLooks(stateRoot, patch, now = new Date()) {
  return oneAtATime(looksFile(stateRoot), async () => {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { error: 'looks' };
    for (const [key, value] of Object.entries(patch)) {
      if (!Object.hasOwn(LOOK_KEYS, key)) return { error: 'key' };
      if (value !== null && (typeof value !== 'string' || !LOOK_KEYS[key].test(value))) return { error: 'value' };
    }
    const { looks } = await readLooks(stateRoot);
    Object.assign(looks, patch);
    await writeWhole(looksFile(stateRoot), `${JSON.stringify({ looks, at: new Date(now).toISOString() }, null, 2)}\n`);
    return { looks, saved: true };
  });
}
