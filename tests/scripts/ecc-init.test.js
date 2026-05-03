/**
 * Tests for ecc-init.sh wrapper behavior.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const scriptPath = path.join(repoRoot, 'ecc-init.sh');
const source = fs.readFileSync(scriptPath, 'utf8');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
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
  test('wrapper delegates installs to scripts/install-apply.js', () => {
    assert.match(source, /INSTALLER=.*scripts\/install-apply\.js/);
    assert.match(source, /node "\$INSTALLER"/);
  })
)
  passed++;
else failed++;

if (
  test('wrapper contains no direct file-copy or removal install commands', () => {
    const commandPattern = /^\s*(?:run\s+)?(?:cp|rsync|mv|rm)\b/m;
    assert.doesNotMatch(source, commandPattern);
  })
)
  passed++;
else failed++;

if (
  test('wrapper dry-run invokes project adapters without mutating target', () => {
    const projectDir = createTempDir('ecc-init-project-');

    try {
      const output = execFileSync('bash', [scriptPath, projectDir, '--target', 'codex-project', '--dry-run'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      assert.match(output, /Target: codex-project/);
      assert.match(output, /Adapter: codex-project/);
      assert.ok(!fs.existsSync(path.join(projectDir, '.codex', 'ecc-install-state.json')));
    } finally {
      cleanup(projectDir);
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
