import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPulseServer } from '../src/server.mjs';

test('home widgets: the machine is read from the system, a reading is kept, and an unknown widget is refused', async () => {
  const state = await mkdtemp(join(tmpdir(), 'madre-widgets-'));
  const project = await mkdtemp(join(tmpdir(), 'madre-widgets-project-'));
  let server;
  try {
    ({ server } = await createPulseServer({ projectRoot: project, stateRoot: state, agents: [], invokers: {}, testMode: true }));
    const port = await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
    const read = (kind) => fetch(`http://127.0.0.1:${port}/api/salas/widget?kind=${kind}`).then(async (response) => ({ status: response.status, body: await response.json() }));
    const system = await read('system');
    assert.equal(system.status, 200);
    assert.equal(system.body.available, true);
    assert.ok(system.body.cpu.cores >= 1);
    assert.ok(system.body.cpu.busy === null || (system.body.cpu.busy >= 0 && system.body.cpu.busy <= 1));
    assert.ok(system.body.memory.free > 0 && system.body.memory.free <= system.body.memory.total);
    assert.match(system.body.memory.source, /^(vm_stat|meminfo|freemem)$/);
    assert.deepEqual((await read('system')).body, system.body, 'a reading is kept for 30 s');
    // No project is open in this state: nothing feeds the projects' widgets, and they say so.
    assert.deepEqual((await read('servers')).body, { available: false, projects: [] });
    assert.deepEqual((await read('memory')).body, { available: false, projects: [] });
    // This server is a project, not Home: the Coordinator's training is read from the Coordinator's
    // own room, and with that room closed nothing feeds it — never this project's record instead.
    assert.deepEqual((await read('coordinator')).body, { available: false });
    assert.equal((await read('nothing')).status, 404);
  } finally {
    if (server) await new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
    for (const dir of [state, project]) await rm(dir, { recursive: true, force: true });
  }
});
