// SPDX-License-Identifier: AGPL-3.0-only
// MADRE · © 2026 Jossue Alcalá · GNU AGPL v3 with additional terms (Section 7): ADDITIONAL-TERMS.md

// Who made MADRE (2026-10-15). This file is what term 1 of ADDITIONAL-TERMS.md asks every copy and
// every work based on MADRE to keep showing: the corner of every project and of Home, «MADRE
// <version> · © 2026 Jossue Alcalá» linked to its author, and the same attribution in the
// Appropriate Legal Notices (Settings › Updates and errors › License and authorship). One source
// for both pages, so the words cannot drift from NOTICE and the terms (test/attribution.test.mjs).

import { t } from './i18n.js';

export const AUTHOR = 'Jossue Alcalá';
export const AUTHOR_URL = 'https://jossuealcala.com';
export const YEAR = 2026;
export const LICENSE_NAME = 'GNU AGPL v3';
const REPO = 'https://github.com/jossuealcacao-exe/madre';
export const LEGAL_LINKS = {
  license: `${REPO}/blob/main/LICENSE`,
  terms: `${REPO}/blob/main/ADDITIONAL-TERMS.md`,
  source: REPO,
};

export function drawAttribution(host, version) {
  if (!host || !version) return null;
  const link = document.createElement('a');
  link.className = 'colophon-link';
  link.href = AUTHOR_URL;
  link.target = '_blank';
  link.rel = 'noopener';
  const name = document.createElement('b');
  name.textContent = `MADRE ${version}`;
  link.append(name, document.createTextNode(` · © ${YEAR} ${AUTHOR}`));
  host.replaceChildren(link);
  host.hidden = false;
  return link;
}

// The Appropriate Legal Notices (AGPL v3, section 0 and 5(d)): the copyright, that there is no
// warranty, that it may be shared under the License, how to read it — and, by term 1(b) of the
// additional terms, the author's attribution. Built with the Settings blocks both pages share.
export function drawLegal(host) {
  if (!host) return null;
  const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const block = make('section', 'sx-block sx-legal');
  const head = make('header', 'sx-head');
  const words = make('div', 'sx-words');
  words.append(make('h3', null, t('License and authorship')), make('p', null, t('© {year} {author}. MADRE is free software: you can share it and change it under the {license}, with additional terms that keep its author\'s attribution visible. It comes with no warranty of any kind.', { year: YEAR, author: AUTHOR, license: LICENSE_NAME })));
  head.append(words);
  const rows = make('div', 'sx-rows');
  const row = (label, hint, url, words) => {
    const line = make('div', 'sx-row');
    const text = make('div', 'sx-words');
    text.append(make('b', null, label));
    if (hint) text.append(make('span', 'sx-hint', hint));
    const box = make('div', 'sx-control');
    const link = make('a', 'sx-btn', words);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    box.append(link);
    line.append(text, box);
    rows.append(line);
  };
  row(t('Made by {author}', { author: AUTHOR }), t('Every copy and every version based on MADRE keeps this attribution visible.'), AUTHOR_URL, 'jossuealcala.com');
  row(t('The license'), LICENSE_NAME, LEGAL_LINKS.license, t('Read'));
  row(t('The additional terms'), t('Author attribution, origin and trademarks (Section 7).'), LEGAL_LINKS.terms, t('Read'));
  row(t('The source code'), t('Whoever offers a modified MADRE must offer its source code too.'), LEGAL_LINKS.source, 'GitHub');
  block.append(head, rows);
  host.append(block);
  return block;
}
