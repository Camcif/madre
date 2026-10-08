// How #3 CONTROL and #4 AIRLOCK are unlocked, as the person chose it in AJUSTES › Permissions.
//
// The key is checked in the browser, as it always was; this only says which key, and for how long
// an accepted one is not asked again. Three rules never move, whatever the file says:
//   · #4 always asks for something — there is no «just confirm» for a mode that runs commands;
//   · a personal phrase is never stored, only its salted SHA-256, computed in the browser;
//   · the grace is short: #3 up to 30 minutes, #4 up to 5, and off unless chosen.
export const OVERRIDE_KEYS = Object.freeze({
  3: Object.freeze(['designation', 'phrase', 'confirm']),
  4: Object.freeze(['designation-airlock', 'phrase-airlock', 'designation']),
});
export const OVERRIDE_GRACE = Object.freeze({
  3: Object.freeze([0, 5, 15, 30]),
  4: Object.freeze([0, 5]),
});
const DEFAULT_KEYS = { 3: 'designation', 4: 'designation-airlock' };

const HEX = (length) => new RegExp(`^[0-9a-f]{${length}}$`);
function cleanPhrase(phrase) {
  if (!phrase || typeof phrase !== 'object') return null;
  const salt = String(phrase.salt ?? '').toLowerCase();
  const hash = String(phrase.hash ?? '').toLowerCase();
  return HEX(32).test(salt) && HEX(64).test(hash) ? { salt, hash } : null;
}

// Whatever is on disk, read as something the room can act on: unknown keys fall back to the
// default, a key that needs a phrase falls back when there is no phrase.
export function overrideSettings(stored = {}) {
  const source = stored && typeof stored === 'object' ? stored : {};
  const phrase = cleanPhrase(source.phrase);
  const keys = {};
  const grace = {};
  for (const mode of [3, 4]) {
    let key = source.keys?.[mode] ?? source.keys?.[String(mode)];
    if (!OVERRIDE_KEYS[mode].includes(key)) key = DEFAULT_KEYS[mode];
    if (key.startsWith('phrase') && !phrase) key = DEFAULT_KEYS[mode];
    keys[mode] = key;
    const minutes = Number(source.grace?.[mode] ?? source.grace?.[String(mode)] ?? 0);
    grace[mode] = OVERRIDE_GRACE[mode].includes(minutes) ? minutes : 0;
  }
  return { keys, grace, phrase };
}

// A change from AJUSTES over what is stored. `phrase: null` forgets the phrase, and with it any
// key that needed it.
export function mergeOverride(current = {}, patch = {}) {
  const base = overrideSettings(current);
  const next = {
    keys: { ...base.keys, ...(patch.keys && typeof patch.keys === 'object' ? patch.keys : {}) },
    grace: { ...base.grace, ...(patch.grace && typeof patch.grace === 'object' ? patch.grace : {}) },
    phrase: 'phrase' in patch ? patch.phrase : base.phrase,
  };
  return overrideSettings(next);
}
