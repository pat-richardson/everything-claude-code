/**
 * Tests for scripts/codex/merge-codex-config.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const scriptPath = path.join(repoRoot, 'scripts', 'codex', 'merge-codex-config.js');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function run(args, cwd = repoRoot) {
  return execFileSync('node', [scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

if (
  test('baseline merge does not wire every reference agent without an allowlist', () => {
    const tempDir = createTempDir('merge-codex-config-');
    const configPath = path.join(tempDir, 'config.toml');

    try {
      fs.writeFileSync(configPath, '');
      run([configPath]);

      const merged = fs.readFileSync(configPath, 'utf8');
      assert.match(merged, /\[agents\]/, 'Expected [agents] root settings');
      assert.doesNotMatch(merged, /\[agents\.architect\]/, 'Should not add generated agent sections by default');
      assert.doesNotMatch(merged, /\[agents\.code_reviewer\]/, 'Should not add generated agent sections by default');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('baseline merge wires only selected agent sections from the allowlist', () => {
    const tempDir = createTempDir('merge-codex-config-');
    const configPath = path.join(tempDir, 'config.toml');

    try {
      fs.writeFileSync(configPath, '');
      run([configPath, '--agent', 'architect', '--agent', 'code-reviewer']);

      const merged = fs.readFileSync(configPath, 'utf8');
      assert.match(merged, /\[agents\.architect\]/, 'Expected selected architect section');
      assert.match(merged, /config_file = "agents\/architect\.toml"/);
      assert.match(merged, /\[agents\.code_reviewer\]/, 'Expected selected code-reviewer section');
      assert.match(merged, /config_file = "agents\/code-reviewer\.toml"/);
      assert.doesNotMatch(merged, /\[agents\.planner\]/, 'Should not add unselected generated agent sections');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
