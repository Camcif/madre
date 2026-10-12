import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runReadonlyProcess } from '../src/adapters/process.mjs';
import { createPulseServer } from '../src/server.mjs';

// Lote 2 of the 1.0 review (2026-10-12): what MADRE keeps is never damaged on the way in.

test('integrity: a letter split between two chunks of an agent\'s output stays one letter (LOG-04)', async () => {
  // «canción» with its «ó» (0xC3 0xB3) cut between two writes, a pause apart.
  const script = "process.stdout.write(Buffer.from([0x63,0x61,0x6e,0x63,0x69,0xc3])); setTimeout(() => process.stdout.write(Buffer.from([0xb3,0x6e,0x0a])), 60);";
  const answer = await runReadonlyProcess({ executable: process.execPath, args: ['-e', script], cwd: tmpdir(), label: 'test', parse: (stdout) => ({ text: stdout.trim() }) });
  assert.equal(answer.text, 'canción');
});

test('integrity: a request whose «ñ» arrives in two packets is read whole, and the editor saves past 100 KB (SRV-08)', async () => {
  const state = await mkdtemp(join(tmpdir(), 'madre-integrity-'));
  const project = await mkdtemp(join(tmpdir(), 'madre-integrity-project-'));
  let server;
  try {
    ({ server } = await createPulseServer({ projectRoot: project, stateRoot: state, agents: [], invokers: {}, testMode: true }));
    const port = await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
    const origin = `http://127.0.0.1:${port}`;
    for (const name of ['notas.md', 'grande.md', 'enorme.md']) await writeFile(join(project, name), '');
    // Two packets, the «ñ» (0xC3 0xB1) cut between them.
    const whole = Buffer.from(JSON.stringify({ path: 'notas.md', content: 'año\n', force: true }));
    const cut = whole.indexOf(0xc3) + 1;
    const status = await new Promise((resolve, reject) => {
      const request = http.request({ host: '127.0.0.1', port, method: 'PUT', path: '/api/files', headers: { 'content-type': 'application/json', 'content-length': whole.length, origin } }, (response) => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
      request.on('error', reject);
      request.write(whole.subarray(0, cut));
      setTimeout(() => request.end(whole.subarray(cut)), 60);
    });
    assert.equal(status, 200);
    assert.equal(await readFile(join(project, 'notas.md'), 'utf8'), 'año\n');
    // 150 KB is well inside the editor's 2 MB: it used to answer «Nothing to save».
    const big = 'línea de texto con acentos áéíóú\n'.repeat(4600);
    const saved = await fetch(`${origin}/api/files`, { method: 'PUT', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ path: 'grande.md', content: big, force: true }) });
    assert.equal(saved.status, 200);
    assert.equal((await readFile(join(project, 'grande.md'), 'utf8')).length, big.length);
    const huge = await fetch(`${origin}/api/files`, { method: 'PUT', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ path: 'enorme.md', content: 'x'.repeat(7 * 1024 * 1024), force: true }) });
    assert.equal(huge.status, 413);
    assert.match((await huge.json()).error, /2 MB/);
  } finally {
    if (server) await new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
    for (const dir of [state, project]) await rm(dir, { recursive: true, force: true });
  }
});
