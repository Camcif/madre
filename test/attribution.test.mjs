import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AUTHOR, AUTHOR_URL, YEAR } from '../public/attribution.js';

const read = (file) => readFile(join(import.meta.dirname, '..', file), 'utf8');

// The corner of every project and of Home is MADRE's attribution (NOTICE): one source for both
// pages, a link to its author, and the same words NOTICE asks a fork to keep.
test('attribution · the corner says whose MADRE is, links to its author, and agrees with NOTICE', async () => {
  const [notice, app, home, room, homePage] = await Promise.all([read('NOTICE'), read('public/app.js'), read('public/salas-mac.js'), read('public/index.html'), read('public/salas-mac.html')]);
  assert.equal(AUTHOR, 'Jossue Alcalá');
  assert.equal(AUTHOR_URL, 'https://jossuealcala.com');
  assert.ok(notice.includes(`«MADRE <version> · © ${YEAR} ${AUTHOR}», linked to ${AUTHOR_URL}`));
  assert.ok(notice.includes('«Built with MADRE by Jossue Alcalá»') && notice.includes('«Desarrollado\ncon MADRE de Jossue Alcalá»'));
  assert.ok(notice.includes('Based on MADRE by Jossue Alcalá — https://madre.run'));
  assert.match(app, /drawAttribution\(document\.querySelector\('#colophon'\), initial\.version\)/);
  assert.match(home, /drawAttribution\(ui\.colophon, answer\.version\)/);
  assert.match(room, /<small id="colophon" class="colophon"/);
  assert.match(homePage, /<small id="sm-colophon" class="colophon sm-colophon"/);
  // Nobody writes the line by hand any more: a copy would drift from NOTICE.
  for (const page of [app, home]) assert.doesNotMatch(page, /© 2026 Jossue Alcalá/);
});

test('attribution · drawn, it is one link to the author with the version and the copyright', async () => {
  const made = [];
  const node = (tag) => { const one = { tag, children: [], append: (...kids) => one.children.push(...kids), replaceChildren: (...kids) => { one.children = kids; }, textContent: '' }; made.push(one); return one; };
  globalThis.document = { createElement: node, createTextNode: (text) => ({ text }) };
  try {
    const { drawAttribution } = await import('../public/attribution.js');
    const host = node('small');
    host.hidden = true;
    const link = drawAttribution(host, '1.0.2');
    assert.equal(host.hidden, false);
    assert.deepEqual(host.children, [link]);
    assert.equal(link.tag, 'a');
    assert.equal(link.href, 'https://jossuealcala.com');
    assert.equal(link.rel, 'noopener');
    assert.equal(link.children[0].textContent, 'MADRE 1.0.2');
    assert.equal(link.children[1].text, ' · © 2026 Jossue Alcalá');
    assert.equal(drawAttribution(host, ''), null);
  } finally { delete globalThis.document; }
});
