/**
 * Tests for scripts/codex/convert-agents-to-toml.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const TOML = require('@iarna/toml');

const repoRoot = path.join(__dirname, '..', '..');
const converterScript = path.join(repoRoot, 'scripts', 'codex', 'convert-agents-to-toml.js');

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

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function runNode(args, cwd = repoRoot) {
  return spawnSync('node', [converterScript, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function assertAppearsInOrder(text, patterns) {
  let cursor = -1;
  for (const pattern of patterns) {
    const index = text.indexOf(pattern);
    assert.ok(index > cursor, `Expected ${pattern} to appear after previous ordered field`);
    cursor = index;
  }
}

let passed = 0;
let failed = 0;

if (
  test('converter emits valid TOML and wires config entries conservatively', () => {
    const tempDir = createTempDir('codex-convert-basic-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');
    const configPath = path.join(tempDir, '.codex', 'config.toml');

    try {
      writeFile(
        path.join(sourceDir, 'code-reviewer.md'),
        `---
name: code-reviewer
description: Expert code review specialist.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
nickname_candidates: ["Atlas", "Delta", "Echo"]
color: red
---

You are a senior code reviewer ensuring high standards of code quality and security.

## Review Process

1. Gather context.
2. Report findings by severity.

Use /review before merge.
`,
      );

      writeFile(configPath, '[agents]\nmax_threads = 9\n');

      const result = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
      ]);

      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
      assert.doesNotMatch(result.stderr, /Unsupported metadata.*model=sonnet/i);
      assert.match(result.stderr, /Unsupported metadata.*color/i);

      const rolePath = path.join(destDir, 'code-reviewer.toml');
      assert.ok(fs.existsSync(rolePath), 'Expected generated TOML file');

      const generated = fs.readFileSync(rolePath, 'utf8');
      assert.match(generated, /# Source: agents\/code-reviewer\.md/);
      assert.doesNotMatch(generated, /Use \/review before merge\./);

      const parsedRole = TOML.parse(generated);
      assertAppearsInOrder(generated, [
        'name = "code_reviewer"',
        'description = "Expert code review specialist."',
        'nickname_candidates = [ "Atlas", "Delta", "Echo" ]',
        'model = "gpt-5.4"',
        'model_reasoning_effort = "high"',
        'sandbox_mode = "read-only"',
        'developer_instructions = """',
      ]);
      assert.strictEqual(parsedRole.name, 'code_reviewer');
      assert.strictEqual(parsedRole.description, 'Expert code review specialist.');
      assert.deepStrictEqual(parsedRole.nickname_candidates, ['Atlas', 'Delta', 'Echo']);
      assert.strictEqual(parsedRole.model, 'gpt-5.4');
      assert.strictEqual(parsedRole.model_reasoning_effort, 'high');
      assert.strictEqual(parsedRole.sandbox_mode, 'read-only');
      assert.match(parsedRole.developer_instructions, /code reviewer/i);
      assert.match(parsedRole.developer_instructions, /Report findings by severity/i);
      assert.match(parsedRole.developer_instructions, /## Review Process/);
      assert.doesNotMatch(parsedRole.developer_instructions, /\*Security\*\*/);

      const parsedConfig = TOML.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(parsedConfig.agents.max_threads, 9);
      assert.strictEqual(parsedConfig.agents.max_depth, 1);
      assert.strictEqual(parsedConfig.agents.code_reviewer.config_file, 'agents/code-reviewer.toml');
      assert.strictEqual(parsedConfig.agents.code_reviewer.description, 'Expert code review specialist.');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter maps Claude model aliases to Codex model ids', () => {
    const tempDir = createTempDir('codex-convert-model-aliases-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');

    try {
      writeFile(
        path.join(sourceDir, 'architect.md'),
        `---
name: architect
description: Architecture specialist.
model: opus
---

Design complex architecture changes.
`,
      );
      writeFile(
        path.join(sourceDir, 'doc-updater.md'),
        `---
name: doc-updater
description: Documentation specialist.
model: haiku
---

Update docs quickly.
`,
      );

      const result = runNode(['--source', sourceDir, '--dest', destDir]);
      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
      assert.doesNotMatch(result.stderr, /Unsupported metadata.*model=(opus|haiku)/i);

      const architect = TOML.parse(fs.readFileSync(path.join(destDir, 'architect.toml'), 'utf8'));
      const docUpdater = TOML.parse(fs.readFileSync(path.join(destDir, 'doc-updater.toml'), 'utf8'));

      assert.strictEqual(architect.model, 'gpt-5.5');
      assert.strictEqual(docUpdater.model, 'gpt-5.4-mini');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter maps explicit write-capable agents to workspace-write and can synthesize description', () => {
    const tempDir = createTempDir('codex-convert-write-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');
    const configPath = path.join(tempDir, '.codex', 'config.toml');

    try {
      writeFile(
        path.join(sourceDir, 'doc-updater.md'),
        `---
name: doc-updater
tools: [Read, Write, Edit, Bash]
---

Documentation specialist focused on keeping docs current.

## Workflow

- Refresh READMEs from code.
- Validate links and examples.
`,
      );
      writeFile(configPath, '');

      const result = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
      ]);

      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);

      const parsedRole = TOML.parse(fs.readFileSync(path.join(destDir, 'doc-updater.toml'), 'utf8'));
      assert.strictEqual(parsedRole.sandbox_mode, 'workspace-write');
      assert.strictEqual(parsedRole.model_reasoning_effort, 'medium');
      assert.match(parsedRole.developer_instructions, /Documentation specialist/i);

      const parsedConfig = TOML.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(
        parsedConfig.agents.doc_updater.description,
        'Documentation specialist focused on keeping docs current.',
      );
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter preserves markdown structure instead of truncating or flattening instructions', () => {
    const tempDir = createTempDir('codex-convert-markdown-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');

    try {
      writeFile(
        path.join(sourceDir, 'security-reviewer.md'),
        `---
name: security-reviewer
description: Security specialist.
tools: [Read, Write, Edit, Bash]
---

# Security Reviewer

You are an expert security specialist.

## Analysis Commands

\`\`\`bash
npm audit --audit-level=high
npx eslint . --plugin security
\`\`\`

## Pattern Table

| Pattern | Severity | Fix |
|---------|----------|-----|
| Hardcoded secrets | CRITICAL | Use \`process.env\` |

## Checklist

- **Secrets Detection** - Find hardcoded tokens.
- Preserve inline \`code\` spans.

## Output Format

\`\`\`markdown
## Review Summary
Verdict: BLOCK
\`\`\`
`,
      );

      const result = runNode(['--source', sourceDir, '--dest', destDir]);
      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);

      const parsedRole = TOML.parse(fs.readFileSync(path.join(destDir, 'security-reviewer.toml'), 'utf8'));
      assert.match(parsedRole.developer_instructions, /# Security Reviewer/);
      assert.match(parsedRole.developer_instructions, /```bash\nnpm audit --audit-level=high/);
      assert.match(parsedRole.developer_instructions, /\| Pattern \| Severity \| Fix \|/);
      assert.match(parsedRole.developer_instructions, /\*\*Secrets Detection\*\*/);
      assert.match(parsedRole.developer_instructions, /`process\.env`/);
      assert.match(parsedRole.developer_instructions, /```markdown\n## Review Summary/);
      assert.match(parsedRole.developer_instructions, /Verdict: BLOCK/);
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter preserves existing agent config wiring by default', () => {
    const tempDir = createTempDir('codex-convert-preserve-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');
    const configPath = path.join(tempDir, '.codex', 'config.toml');

    try {
      writeFile(
        path.join(sourceDir, 'planner.md'),
        `---
name: planner
description: Planning specialist.
tools: ["Read", "Grep"]
---

Plan complex changes before implementation.
`,
      );
      writeFile(
        configPath,
        `[agents]
max_threads = 2

[agents.planner]
description = "Custom planner description"
config_file = "agents/custom-planner.toml"
`,
      );

      const result = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
      ]);

      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);

      const parsedConfig = TOML.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(parsedConfig.agents.max_threads, 2);
      assert.strictEqual(parsedConfig.agents.max_depth, 1);
      assert.strictEqual(parsedConfig.agents.planner.description, 'Custom planner description');
      assert.strictEqual(parsedConfig.agents.planner.config_file, 'agents/custom-planner.toml');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter check mode detects drift and dry-run reports changes without writing', () => {
    const tempDir = createTempDir('codex-convert-check-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');
    const configPath = path.join(tempDir, '.codex', 'config.toml');

    try {
      writeFile(
        path.join(sourceDir, 'code-explorer.md'),
        `---
name: code-explorer
description: Deeply analyzes existing code.
tools: ["Read", "Grep", "Glob"]
---

Trace the real execution path before proposing changes.
`,
      );
      writeFile(path.join(destDir, 'code-explorer.toml'), 'model = "gpt-5.4"\n');
      writeFile(configPath, '');

      const checkResult = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
        '--check',
      ]);

      assert.strictEqual(checkResult.status, 1, `${checkResult.stdout}\n${checkResult.stderr}`);
      assert.match(checkResult.stdout, /Drift detected/i);

      const dryRunResult = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
        '--dry-run',
      ]);

      assert.strictEqual(dryRunResult.status, 0, `${dryRunResult.stdout}\n${dryRunResult.stderr}`);
      assert.match(dryRunResult.stdout, /Would write/i);
      assert.strictEqual(fs.readFileSync(path.join(destDir, 'code-explorer.toml'), 'utf8'), 'model = "gpt-5.4"\n');
      assert.strictEqual(fs.readFileSync(configPath, 'utf8'), '');
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter supports include/exclude globs and fail-on-unsupported', () => {
    const tempDir = createTempDir('codex-convert-globs-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');

    try {
      writeFile(
        path.join(sourceDir, 'security-reviewer.md'),
        `---
name: security-reviewer
description: Security specialist.
tools: ["Read", "Grep"]
model: unknown-claude-model
---

Flag auth, secrets, and injection issues first.
`,
      );
      writeFile(
        path.join(sourceDir, 'planner.md'),
        `---
name: planner
description: Planner.
tools: ["Read"]
---

Create phased implementation plans.
`,
      );

      const failResult = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--include', '*reviewer.md',
        '--exclude', 'planner.md',
        '--fail-on-unsupported',
      ]);

      assert.strictEqual(failResult.status, 1, `${failResult.stdout}\n${failResult.stderr}`);
      assert.match(failResult.stderr, /Unsupported metadata.*model=unknown-claude-model/i);
      assert.match(failResult.stderr, /Failing because unsupported metadata was found/i);
      assert.ok(!fs.existsSync(path.join(destDir, 'planner.toml')));
    } finally {
      cleanup(tempDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('converter includes referenced skills and selected MCP server definitions', () => {
    const tempDir = createTempDir('codex-convert-skills-mcp-');
    const sourceDir = path.join(tempDir, 'agents');
    const destDir = path.join(tempDir, '.codex', 'agents');
    const skillsDir = path.join(tempDir, '.agents', 'skills');
    const configPath = path.join(tempDir, '.codex', 'config.toml');

    try {
      writeFile(
        path.join(sourceDir, 'docs-lookup.md'),
        `---
name: docs-lookup
description: Use Context7 docs.
tools: ["Read", "mcp__context7__resolve-library-id", "mcp__context7__query-docs"]
---

Use the Context7 MCP to verify APIs.

For detailed docs workflows, see skill: \`documentation-lookup\`.
`,
      );
      writeFile(
        path.join(skillsDir, 'documentation-lookup', 'SKILL.md'),
        `---
name: documentation-lookup
description: Current docs
---
`,
      );
      writeFile(
        configPath,
        `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
startup_timeout_sec = 30
`,
      );

      const result = runNode([
        '--source', sourceDir,
        '--dest', destDir,
        '--config', configPath,
        '--wire-config',
      ], tempDir);

      assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);

      const parsedRole = TOML.parse(fs.readFileSync(path.join(destDir, 'docs-lookup.toml'), 'utf8'));
      const generated = fs.readFileSync(path.join(destDir, 'docs-lookup.toml'), 'utf8');
      assertAppearsInOrder(generated, [
        'sandbox_mode = "read-only"',
        'developer_instructions = """',
        '[mcp_servers.context7]',
        '[[skills.config]]',
      ]);
      assert.ok(Array.isArray(parsedRole.skills.config), 'Expected [[skills.config]] entries');
      assert.deepStrictEqual(parsedRole.skills.config, [
        { path: '.agents/skills/documentation-lookup/SKILL.md' },
      ]);
      assert.deepStrictEqual(parsedRole.mcp_servers.context7, {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp@latest'],
        startup_timeout_sec: 30,
      });
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
