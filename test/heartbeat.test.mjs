import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { heartbeat, heartbeatBody, installId } from '../src/heartbeat.mjs';

test('heartbeat: exactly four things leave — a random id, the version, the system and Node major', async () => {
  const root = await mkdtemp(join(tmpdir(), 'madre-heartbeat-'));
  try {
    const sent = [];
    const fetchImpl = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return new Response(null, { status: 204 }); };
    const first = await heartbeat({ root, version: '1.0.0', fetchImpl, url: 'https://example.test/api/ping', now: new Date('2026-10-13T10:00:00Z') });
    assert.equal(first.sent, true);
    assert.deepEqual(Object.keys(sent[0].body).sort(), ['id', 'node', 'os', 'version']);
    assert.match(sent[0].body.id, /^[0-9a-f-]{36}$/);
    assert.equal(sent[0].body.version, '1.0.0');
    assert.match(sent[0].body.node, /^\d+$/);
    // The id is made once and kept, in a file only its owner reads.
    assert.equal(await installId(root), sent[0].body.id);
    assert.equal((await readFile(join(root, 'install-id'), 'utf8')).trim(), sent[0].body.id);
    // Once a day: the same day sends nothing, the next one does.
    assert.equal((await heartbeat({ root, version: '1.0.0', fetchImpl, now: new Date('2026-10-13T23:00:00Z') })).sent, false);
    assert.equal((await heartbeat({ root, version: '1.0.1', fetchImpl, now: new Date('2026-10-14T01:00:00Z') })).sent, true);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].body.id, sent[0].body.id);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('heartbeat: offline or refused, MADRE carries on and tries again later', async () => {
  const root = await mkdtemp(join(tmpdir(), 'madre-heartbeat-'));
  try {
    const now = new Date('2026-10-13T10:00:00Z');
    assert.equal((await heartbeat({ root, version: '1.0.0', fetchImpl: async () => { throw new Error('offline'); }, now })).sent, false);
    assert.equal((await heartbeat({ root, version: '1.0.0', fetchImpl: async () => new Response(null, { status: 503 }), now })).sent, false);
    assert.equal((await heartbeat({ root, version: '1.0.0', fetchImpl: async () => new Response(null, { status: 204 }), now })).sent, true, 'a day that failed is tried again');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('heartbeat: a system MADRE does not name goes as «other»', () => {
  assert.deepEqual(heartbeatBody({ id: 'x', version: '1.0.0', platform: 'freebsd', node: '24.1.0' }), { id: 'x', version: '1.0.0', os: 'other', node: '24' });
});
