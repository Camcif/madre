import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dropStickyHover, withoutHover } from '../public/touch.js';

// A tap is not a hover (2026-10-11): where nothing can hover, the :hover rules go and the other
// states a rule offers stay.
test('touch · a selector loses its :hover and keeps every other state it offers', () => {
  assert.equal(withoutHover('.key:hover'), null);
  assert.equal(withoutHover('.key:hover::before'), null);
  assert.equal(withoutHover('.key:focus-visible'), '.key:focus-visible');
  assert.equal(withoutHover('.key:is(:hover, :focus-visible)'), '.key:is(:focus-visible)');
  assert.equal(withoutHover('.key:is(:hover, :focus, :active, [aria-pressed="true"])'), '.key:is(:focus, :active, [aria-pressed="true"])');
  assert.equal(withoutHover('.row:is(:hover) .x'), null);
  assert.equal(withoutHover('.a:is(.b:hover, .c) .d'), '.a:is(.c) .d');
  // A word that only starts like it is not it.
  assert.equal(withoutHover('.a:hovered'), '.a:hovered');
});

test('touch · the page\'s rules are rewritten only where nothing can hover', () => {
  const rules = () => {
    const list = [
      { selectorText: '.a:hover' },
      { selectorText: '.b:hover, .b:focus-visible' },
      { selectorText: '.c' },
      { cssRules: [{ selectorText: '.d:is(:hover, .open)' }, { selectorText: '.e:hover' }], deleteRule(i) { this.cssRules.splice(i, 1); } },
    ];
    return list;
  };
  const sheetOf = (list) => ({ cssRules: list, deleteRule(i) { list.splice(i, 1); } });
  const before = globalThis.matchMedia;
  try {
    const list = rules();
    globalThis.matchMedia = () => ({ matches: false });
    assert.equal(dropStickyHover({ styleSheets: [sheetOf(list)] }), 0, 'a Mac lost its hover');
    globalThis.matchMedia = (query) => ({ matches: query === '(hover: none)' });
    assert.equal(dropStickyHover({ styleSheets: [sheetOf(list), { get cssRules() { throw new Error('cross-origin'); } }] }), 4);
    assert.deepEqual(list.map((rule) => rule.selectorText ?? rule.cssRules.map((one) => one.selectorText)), ['.b:focus-visible', '.c', ['.d:is(.open)']]);
  } finally {
    globalThis.matchMedia = before;
  }
});

test('touch · every page that can open on a phone or a tablet takes it', async () => {
  for (const page of ['app.js', 'salas-mac.js', 'salas.js']) {
    const text = await readFile(new URL(`../public/${page}`, import.meta.url), 'utf8');
    assert.match(text, /import \{ dropStickyHover \} from '\.\/touch\.js';/, page);
    assert.match(text, /\ndropStickyHover\(\);/, `${page} imports it and never calls it`);
  }
  const bridge = await readFile(new URL('../src/bridge/server.mjs', import.meta.url), 'utf8');
  assert.match(bridge, /'\/bridge\/touch\.js': 'touch\.js'/, 'the phone\'s Home cannot load it');
});
