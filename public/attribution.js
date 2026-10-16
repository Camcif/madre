// Who made MADRE, in the corner of every project and of Home (2026-10-15).
//
// This corner is the attribution NOTICE asks for: the Apache License 2.0 (section 4(d)) has a
// derivative work show the attribution notices of NOTICE «wherever such third-party notices
// normally appear», and in MADRE they appear here. A version or a fork that is distributed keeps
// this corner as it is or, under another name, says «Built with MADRE by Jossue Alcalá» /
// «Desarrollado con MADRE de Jossue Alcalá», with the same link. One source for both pages, so
// the words cannot drift from NOTICE (test/attribution.test.mjs holds them together).

export const AUTHOR = 'Jossue Alcalá';
export const AUTHOR_URL = 'https://jossuealcala.com';
export const YEAR = 2026;

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
