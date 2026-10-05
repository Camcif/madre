import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createCheckpoint, diffCheckpoint, restoreCheckpoint, dropCheckpoint, nestedRepos } from '../src/checkpoint.mjs';
import { ControlDesk } from '../src/room/control.mjs';

const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

test('checkpoint: a project made of nested repositories is photographed, diffed and restored as one', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-nested-'));
  try {
    git(root, 'init', '-q');
    await writeFile(join(root, 'README.md'), 'outer\n');
    const site = join(root, 'portfolio');
    await mkdir(join(site, 'src'), { recursive: true });
    git(site, 'init', '-q');
    await writeFile(join(site, 'src', 'index.astro'), 'v1\n');
    await writeFile(join(site, '.env'), 'SECRET=1\n');
    await mkdir(join(root, 'node_modules', 'ignored'), { recursive: true }); git(join(root, 'node_modules', 'ignored'), 'init', '-q');
    assert.deepEqual(await nestedRepos(root), ['portfolio'], 'node_modules is never scanned');

    const checkpoint = await createCheckpoint(root, { id: 'cp1' });
    assert.equal(checkpoint.nested.length, 1);
    assert.equal(checkpoint.nested[0].dir, 'portfolio');

    // The agent edits inside the nested repo, adds a page, and writes into its .env; the outer repo is untouched.
    await writeFile(join(site, 'src', 'index.astro'), 'v2\n');
    await writeFile(join(site, 'src', 'madre.astro'), 'new page\n');
    await writeFile(join(site, '.env'), 'SECRET=hacked\n');
    const diff = await diffCheckpoint(root, checkpoint);
    assert.deepEqual(diff.files.map((f) => [f.status, f.path]).sort(), [['A', 'portfolio/src/madre.astro'], ['M', 'portfolio/.env'], ['M', 'portfolio/src/index.astro']], 'changes inside the nested repo are seen, with project-relative paths');
    assert.deepEqual(diff.forbidden, ['portfolio/.env'], 'a .env inside a nested repo is a forbidden zone too');
    assert.match(diff.stat, /portfolio\/src\/index\.astro/);

    const partial = await restoreCheckpoint(root, checkpoint, { paths: ['portfolio/.env'] });
    assert.deepEqual(partial, { removed: [], restored: ['portfolio/.env'] });
    assert.equal(await readFile(join(site, '.env'), 'utf8'), 'SECRET=1\n');
    assert.equal(await readFile(join(site, 'src', 'index.astro'), 'utf8'), 'v2\n', 'the legitimate edit stays');

    const full = await restoreCheckpoint(root, checkpoint);
    assert.deepEqual(full.removed, ['portfolio/src/madre.astro']);
    assert.deepEqual(full.restored, ['portfolio/src/index.astro']);
    assert.equal(await readFile(join(site, 'src', 'index.astro'), 'utf8'), 'v1\n');
    assert.equal(await access(join(site, 'src', 'madre.astro')).then(() => true, () => false), false);
    assert.deepEqual((await diffCheckpoint(root, checkpoint)).files, [], 'UNDO leaves the whole project as photographed');
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
  }
});

test('checkpoint: a turn that runs git init in a project without git is still diffed and undone against its own photograph', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-airlock-init-'));
  try {
    await writeFile(join(root, 'index.html'), '<h1>v1</h1>\n');
    await mkdir(join(root, '.pulse'), { recursive: true });
    await writeFile(join(root, '.pulse', 'mother.env'), 'SEAL=1\n');
    // No .git yet: the photograph lives in the shadow repository.
    const checkpoint = await createCheckpoint(root, { id: 'airlock1' });
    assert.ok(checkpoint.via, 'a project without git is photographed in the shadow');

    // What the agent was asked to do: git init, a .gitignore that leaves .pulse out, an edit, a commit.
    git(root, 'init', '-q');
    await writeFile(join(root, '.gitignore'), '.pulse/\n');
    await writeFile(join(root, 'index.html'), '<h1>v2</h1>\n');
    git(root, 'add', '-A');
    git(root, 'commit', '-q', '-m', 'Phobos v1');

    // The diff used to look for the shadow's commits in the new repository, and git failed.
    const diff = await diffCheckpoint(root, checkpoint);
    assert.deepEqual(diff.files.map((file) => [file.status, file.path]).sort(), [['A', '.gitignore'], ['M', 'index.html']], 'the new .git is never listed, and a file merely ignored now is not a deletion');
    assert.deepEqual(diff.forbidden, [], '.pulse/mother.env did not move; nothing was written into a forbidden zone');
    assert.doesNotMatch(diff.stat, /mother\.env/);

    // UNDO goes back to the photograph it was taken with.
    const undone = await restoreCheckpoint(root, checkpoint);
    assert.deepEqual(undone.removed, ['.gitignore']);
    assert.deepEqual(undone.restored, ['index.html']);
    assert.equal(await readFile(join(root, 'index.html'), 'utf8'), '<h1>v1</h1>\n');
    assert.equal(await readFile(join(root, '.pulse', 'mother.env'), 'utf8'), 'SEAL=1\n');
    await access(join(root, '.git'));
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
  }
});

test('control: a turn whose changes git cannot read still ends, says so, and keeps its way back', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-unreadable-'));
  try {
    git(root, 'init', '-q');
    await writeFile(join(root, 'a.txt'), 'one\n');
    const desk = new ControlDesk({ projectRoot: root });
    const run = { agent: 'codex', messageId: 'm1', mode: 4, checkpoint: { id: 'gone', commit: 'f'.repeat(40), tree: 'e'.repeat(40), via: null, nested: [], exclude: [] } };
    const changes = await desk.settleOrSay(run);
    assert.equal(changes.files.length, 0);
    assert.ok(changes.unreadable, 'the reason is kept');
    assert.match(changes.message, /could not read what @codex changed[\s\S]*UNDO goes back to it/);
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
  }
});

test('checkpoint: UNDO takes away the folders the turn made for its files, and only those', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pulse-undo-folders-'));
  try {
    await writeFile(join(root, 'index.html'), '<h1>Phobos</h1>\n');
    await mkdir(join(root, 'keep'));   // empty before the turn: git cannot know it, the disk does
    const checkpoint = await createCheckpoint(root, { id: 'undo-folders' });
    await new Promise((resolve) => setTimeout(resolve, 20));
    await mkdir(join(root, 'docs', 'deep'), { recursive: true });
    await writeFile(join(root, 'docs', 'deep', 'comida.md'), '# Comida\n');
    await writeFile(join(root, 'docs', 'otros.md'), '# Otros\n');
    await writeFile(join(root, 'keep', 'note.md'), 'x\n');
    const undone = await restoreCheckpoint(root, checkpoint);
    assert.deepEqual(undone.removed.sort(), ['docs/deep/comida.md', 'docs/otros.md', 'keep/note.md']);
    await assert.rejects(access(join(root, 'docs')), 'an empty folder was left behind');
    await access(join(root, 'keep'));
    await access(join(root, 'index.html'));
    await dropCheckpoint(root, checkpoint);
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 6, retryDelay: 60 });
  }
});
