// Built CLI checks. Runs in a temporary timer file, never changes real history.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fixture = path.join(__dirname, 'pty-fixture.cjs');

function scenario(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cace-cli-'));
  const data = path.join(dir, 'timer.json');
  const cli = (...args) => spawnSync(process.execPath, [fixture, 'cli', ...args], {
    env: { ...process.env, CACE_TEST_DATA: data, NO_COLOR: '1' },
    encoding: 'utf8', timeout: 5000,
  });
  try { run(cli, data); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('start/mark/stop/resume remain compatible, without screen clears or intro delays', () => scenario((cli, data) => {
  const started = performance.now();
  const start = cli('start', 'Fix timer', '--tag', 'dev', '--estimate', '10');
  const elapsed = performance.now() - started;
  assert.equal(start.status, 0, start.stderr);
  assert.ok(elapsed < 2000, `start took ${elapsed}ms; the old intro took at least 2400ms`);
  assert.ok(!start.stdout.includes('\x1b'), 'redirected start contains ANSI');
  assert.equal(cli('mark', 'checkpoint').status, 0);
  assert.equal(cli('stop', '--reflection', 'done').status, 0);
  const record = JSON.parse(fs.readFileSync(data));
  assert.equal(record.history.length, 1);
  assert.equal(record.history[0].marks[0].note, 'checkpoint');
  assert.equal(record.history[0].reflection, 'done');
  assert.equal(cli('resume', '--last').status, 0);
  assert.equal(JSON.parse(fs.readFileSync(data)).current.task, 'Fix timer');
}));

test('global boolean switches can precede the command and all 16 ASCII portraits export', () => scenario(cli => {
  const result = cli('--ascii', '--no-animation', '--no-tui', 'mascot', 'preview', '--all', '--color', 'never', '--lang', 'en');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(/^[\x20-\x7e\n\r]*$/.test(result.stdout));
  assert.equal((result.stdout.match(/^[a-z_]+ \/ /gm) || []).length, 16);
}));

test('explicit colour modes work when output is redirected', () => scenario(cli => {
  const never = cli('mascot', 'preview', '--color', 'never');
  const rgb = cli('mascot', 'preview', '--color', 'always');
  const indexed = cli('mascot', 'preview', '--color', '256');
  assert.ok(!never.stdout.includes('\x1b'));
  assert.ok(rgb.stdout.includes('\x1b[38;2;'));
  assert.ok(indexed.stdout.includes('\x1b[38;5;'));
}));

test('invalid display options and expressions fail with a nonzero exit', () => scenario(cli => {
  for (const args of [
    ['mascot', 'preview', '--expression', 'missing'],
    ['mascot', 'preview', '--size', 'huge'],
    ['status', '--color', 'rainbow'], ['status', '--color'],
    ['status', '--theme', 'invalid'], ['unknown-command'],
  ]) {
    const result = cli(...args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.ok(result.stderr.trim());
  }
}));

test('NO_COLOR also applies to legacy warning/status/completion messages', () => scenario(cli => {
  for (const args of [['stop'], ['start', 'Task'], ['start', 'Another'], ['status'], ['stop', '--reflection', 'Done']]) {
    const result = cli(...args);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!result.stdout.includes('\x1b'), JSON.stringify(args));
  }
}));
