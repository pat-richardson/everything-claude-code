# ECC Adoption Plan — Single-Phase Bootstrap via `ecc-init.sh`

## Context

You're adopting `everything-claude-code` (v1.10.0) at `~/Documents/development/personal-automation/pr-everything-claude-code` for full-stack work across **Claude Code, Cursor, Kiro, and Codex**. The repo ships 47 agents, 183 skills, 81 commands, and 14 rule directories — too much to cherry-pick by hand each time. This plan builds a single bootstrap script, `ecc-init.sh`, that scaffolds any project with your curated selection in one command, then verifies the install end-to-end.

**Decisions from clarifying questions:**

- **Scope:** per-project (nothing installed to `~/.claude/`)
- **Tools:** Claude Code, Cursor, Kiro, Codex
- **MCP:** `context7` + `playwright`
- **Hooks:** Standard posture (session persistence + quality gates)
- **Stack:** TypeScript/Node/Next.js/Nuxt, Python/Django/FastAPI, PHP/Laravel
- **Workflows:** PRP, TDD/Testing/E2E, Multi-agent orchestration, GAN loops
- **Meta:** session persistence, continuous learning, rules distillation + hookify
- **Specialties:** AI/LLM app dev, frontend design/UX

## Safety Audit Summary

Read-only audit found no malicious behavior.

| Area | Verdict |
| --- | --- |
| `install.sh` / `install.ps1` | Safe — delegates to Node installer |
| `scripts/hooks/*.js` | Safe — no outbound HTTP, no telemetry |
| `.mcp.json` | Safe — 6 servers pinned, disabled in ECC's own repo |
| `scripts/gan-harness.sh` | **Cost flag** — loops Opus up to 15×; run deliberately |
| `hooks/hooks.json` `block-no-verify` | **Flag** — uses `npx` on every Bash call; excluded from Standard |
| Personal paths / secrets | None found |

## Developer Usage Guide

### One-Time Setup: Add `ecc-init` to PATH

To make `ecc-init` available globally from any shell session, copy or symlink the script to a directory on your PATH. Choose one of these locations based on your system setup:

**Option 1: `~/.local/bin` (recommended for Linux/macOS)**

```bash
mkdir -p ~/.local/bin
cp ~/Documents/development/personal-automation/pr-everything-claude-code/ecc-init.sh ~/.local/bin/ecc-init
chmod +x ~/.local/bin/ecc-init
```

Add `~/.local/bin` to your PATH in `~/.zshrc` or `~/.bashrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Option 2: `~/.dotfiles/bin` (if you maintain dotfiles)**

```bash
mkdir -p ~/.dotfiles/bin
cp ~/Documents/development/personal-automation/pr-everything-claude-code/ecc-init.sh ~/.dotfiles/bin/ecc-init
chmod +x ~/.dotfiles/bin/ecc-init
```

Add to your shell profile:

```bash
export PATH="$HOME/.dotfiles/bin:$PATH"
```

**Option 3: `/usr/local/bin` (system-wide, requires sudo)**

```bash
sudo cp ~/Documents/development/personal-automation/pr-everything-claude-code/ecc-init.sh /usr/local/bin/ecc-init
sudo chmod +x /usr/local/bin/ecc-init
```

After copying/symlinking, set the `ECC_REPO_PATH` environment variable in your shell profile to tell `ecc-init` where to find the ECC repository:

```bash
export ECC_REPO_PATH="$HOME/Documents/development/personal-automation/pr-everything-claude-code"
```

Reload your shell (or `source ~/.zshrc`) to apply changes. Verify the setup:

```bash
ecc-init --help
```

You should see the usage message and available flags.

### Per-Project Installation

Once `ecc-init` is on your PATH, bootstrapping a new project takes a single command.

#### Basic Installation

```bash
ecc-init ~/path/to/my-project
```

This installs all curated agents, commands, rules, skills, hooks, and MCP servers into `.claude/`, `.cursor/`, `.kiro/`, and `.codex/` directories.

#### Dry Run (Recommended First Step)

Before committing to an install, preview what will be copied without writing anything:

```bash
ecc-init ~/path/to/my-project --dry-run
```

Review the output, then run without `--dry-run` when ready.

#### With GAN Harness

If you plan to use autonomous agent loops (GAN harness), include the `--with-gan` flag:

```bash
ecc-init ~/path/to/my-project --with-gan
```

This copies `gan-harness.sh` and related GAN agents/commands.

#### Force Reinstall / Refresh

To overwrite an existing `.claude/` directory (e.g., when upgrading ECC), use `--force`:

```bash
ecc-init ~/path/to/my-project --force
```

⚠️ This overwrites without backup — be certain before running.

#### Skip Verification

By default, `ecc-init` runs a post-install verification to confirm all files are in place and valid. To skip this step:

```bash
ecc-init ~/path/to/my-project --skip-verify
```

(Useful for scripting; not recommended for manual installs.)

### After Installation: What to Expect

Once the script completes, your project has:

- `.claude/` — agents, commands, rules, skills, vendored hook scripts, and `settings.json`
- `.mcp.json` — MCP servers (`context7`, `playwright`) pinned to known versions
- `.cursor/`, `.kiro/`, `.codex/` — tool-specific rules and configuration
- `.gitignore` — appended with ECC state paths (`.claude/sessions/`, `.claude/metrics/`, etc.)
- `.claude/CLAUDE.md` — quick reference listing installed components

Open the project in Claude Code and run `/agents` to confirm all 14 agents are loaded. Try `/help` to see curated commands.

### Disabling Individual Hooks at Runtime

If a hook interferes with your workflow, disable it temporarily without editing configuration:

```bash
ECC_DISABLED_HOOKS=stop:desktop-notify,post:quality-gate claude
```

Format: `[phase]:[hook-name],[phase]:[hook-name],...` where phase is `stop`, `pre`, or `post`.

Common toggles:

- `--with-gan` — gate expensive GAN loops
- `stop:cost-tracker` — disable token logging
- `post:quality-gate` — skip async lint/typecheck
- `pre:bash:commit-quality` — allow commits without lint checks

### Updating ECC Itself

When a new ECC version ships (e.g., v1.11.0), pull the latest from the repo:

```bash
cd ~/Documents/development/personal-automation/pr-everything-claude-code
git pull origin main
```

Then re-run `ecc-init` on each project to refresh vendored files:

```bash
ecc-init ~/path/to/my-project --force
```

This ensures all projects use the latest agents, commands, rules, and hook logic.

## Curated Catalog (what `ecc-init.sh` copies)

### Cross-stack agents (`agents/` → `.claude/agents/`)

`architect`, `planner`, `code-reviewer`, `tdd-guide`, `security-reviewer`, `database-reviewer`, `performance-optimizer`, `build-error-resolver`, `refactor-cleaner`, `docs-lookup`, `doc-updater`, `chief-of-staff`, `typescript-reviewer`, `python-reviewer`.

### Language rules (`rules/{common,typescript,web,python,php}/` → each tool's rules dir)

Stacks: TypeScript + Node/Next/Nuxt, Python + Django/FastAPI, PHP + Laravel.

### Commands (`commands/*.md` → `.claude/commands/`)

- **PRP:** `/prp-prd`, `/prp-plan`, `/prp-implement`, `/prp-commit`, `/prp-pr`
- **TDD/testing:** `/tdd`, `/e2e`, `/test-coverage`, `/verify`, `/code-review`, `/build-fix`
- **Multi-agent:** `/multi-plan`, `/multi-backend`, `/multi-frontend`, `/multi-execute`, `/multi-workflow`, `/orchestrate`
- **GAN:** `/gan-build`, `/gan-design`, `/loop-start`, `/loop-status`, `/aside`
- **Session / meta:** `/checkpoint`, `/save-session`, `/resume-session`, `/sessions`, `/learn`, `/learn-eval`
- **Rules distill / hookify:** `/rules-distill`, `/hookify`, `/hookify-configure`, `/hookify-list`, `/skill-create`, `/skill-health`
- **AI/LLM:** `/eval`, `/prompt-optimize`, `/model-route`
- **Quality:** `/quality-gate`, `/refactor-clean`, `/docs`, `/update-docs`

### Skills (`skills/<name>/` → `.claude/skills/`)

- **Stack-specific:** `frontend-patterns`, `backend-patterns`, `api-design`, `nextjs-turbopack`, `nuxt4-patterns`, `bun-runtime`, `python-patterns`, `python-testing`, `django-patterns`, `django-tdd`, `django-security`, `django-verification`, `laravel-patterns`, `laravel-tdd`, `laravel-security`, `laravel-verification`
- **Core workflow:** `tdd-workflow`, `e2e-testing`, `ai-regression-testing`, `browser-qa`, `verification-loop`, `codebase-onboarding`, `architecture-decision-records`, `git-workflow`
- **Multi-agent / orchestration:** `agentic-engineering`, `enterprise-agent-ops`, `team-builder`, `council`
- **GAN / autonomous loops:** `gan-style-harness`, `autonomous-agent-harness`, `continuous-agent-loop`, `autonomous-loops`
- **Meta:** `continuous-learning` (lighter), `continuous-learning-v2` (opt-in via flag), `rules-distill`, `hookify-rules`, `configure-ecc`, `strategic-compact`, `context-budget`, `token-budget-advisor`
- **AI/LLM dev:** `claude-api`, `mcp-server-patterns`, `agent-eval`, `agent-harness-construction`, `cost-aware-llm-pipeline`, `eval-harness`, `prompt-optimizer`, `iterative-retrieval`, `search-first`, `regex-vs-llm-structured-text`
- **Frontend/UX:** `design-system`, `frontend-design`, `liquid-glass-design`, `ui-demo`, `click-path-audit`, `workspace-surface-audit`, `dashboard-builder`
- **PRP/RFC:** `ralphinho-rfc-pipeline`

### Hooks (Standard posture → `.claude/settings.json`)

Wired with absolute paths to ECC repo `scripts/hooks/*.js`:

- `stop:session-end` — checkpoint for `/resume-session`
- `stop:cost-tracker` — token usage log (required before GAN use)
- `stop:desktop-notify` — macOS notification
- `stop:format-typecheck` — Biome/Prettier + tsc
- `pre:bash:commit-quality` — lint + secret/console.log detection
- `pre:config-protection` — blocks AI from loosening linter configs
- `post:quality-gate` — async lint/typecheck after edits

### MCP (`.mcp.json`)

`context7` (pairs with `/docs` + `docs-lookup` agent) and `playwright` (pairs with `/e2e`). Versions pinned from ECC's `.mcp.json`.

### Per-tool placement

| Tool | What lands where |
| --- | --- |
| Claude Code | `.claude/{agents,commands,rules,skills,settings.json}`, `.mcp.json` |
| Cursor | `.cursor/rules/` (from ECC's pre-adapted `.cursor/rules/`) |
| Kiro | `.kiro/steering/` + select `.kiro/` subdirs (from ECC's `.kiro/`) |
| Codex | `.codex/` contents (from ECC's `.codex/`) |

## The Script: `ecc-init.sh`

Single bootstrap that does the entire install + verification for a target project.

**Location:** `~/.dotfiles/bin/ecc-init.sh` (or wherever you keep personal bin scripts). Plan file will reference a placeholder.

**Usage:** `ecc-init.sh <target-project-path> [--skip-verify]`

**Behavior:**

1. **Validate inputs**
    - Target dir exists; is not the ECC repo itself; is a git repo (warn if not).
    - ECC repo path resolved (env `ECC_REPO_PATH` or default `~/Documents/development/open-source/everything-claude-code`).
    - Abort if any target file would be overwritten without `--force`.

2. **Scaffold directories**
    - `.claude/{agents,commands,rules,skills,scripts/hooks}`
    - `.cursor/rules/`
    - `.kiro/steering/`
    - `.codex/`

3. **Copy curated files** (from catalog above)
    - Agents: 14 files from `agents/` → `.claude/agents/`
    - Commands: ~35 files from `commands/` → `.claude/commands/`
    - Skills: ~50 directories from `skills/` → `.claude/skills/`
    - Rules: `rules/{common,typescript,web,python,php}/*.md` → `.claude/rules/`, `.cursor/rules/`, `.kiro/steering/`, `.codex/rules/`
    - Tool mirrors: `.cursor/rules/` copied from ECC's `.cursor/rules/` where pre-adapted exists

4. **Vendor hook scripts**
    - Copy the seven Standard-posture hook scripts from `scripts/hooks/` + `scripts/hooks/run-with-flags.js` + `scripts/lib/` dependencies into `.claude/scripts/hooks/` (vendored for project self-containment; avoids fragile absolute paths).

5. **Write `.claude/settings.json`**
    - Wire the seven hooks to the vendored `.claude/scripts/hooks/*.js` via relative paths.
    - Enable session activity tracking OFF (grows unbounded).
    - Set `ECC_HOOK_PROFILE=standard` env var.

6. **Write `.mcp.json`**
    - `context7` + `playwright` with versions pinned from ECC's `.mcp.json`.

7. **Append to `.gitignore`**
    - `.claude/sessions/`, `.claude/metrics/`, `.claude/cost-tracker.log`, `.claude/bash-commands.log`.

8. **Write `.claude/CLAUDE.md` stub**
    - Lists installed agents/commands/skills for quick orientation.
    - References `rules/` location.

9. **Verification block** (skipped with `--skip-verify`)
    - Check all expected files exist (exit 1 if any missing).
    - Parse `.claude/settings.json` + `.mcp.json` with `jq` (exit 1 on invalid JSON).
    - `node -e "require('./.claude/scripts/hooks/run-with-flags.js')"` — sanity-import hook wrapper.
    - Print tool-by-tool "next steps" block: open in Claude Code / Cursor / Kiro / Codex, run which commands to confirm each tool sees the config.

10. **Post-install hints printed to stdout**
    - Cost-tracker location.
    - How to disable individual hooks (`ECC_DISABLED_HOOKS` env var).
    - Reminder: before first GAN command, run with `GAN_MAX_ITERATIONS=3` and cheaper Sonnet models.

## Critical Files to Read Before Running

Read these (no execution) to confirm what `ecc-init.sh` will copy and wire:

- `hooks/hooks.json` — hook wiring reference
- `scripts/hooks/run-with-flags.js` — wrapper dispatcher
- `scripts/hooks/session-end.js`, `commit-quality.js`, `post-edit-quality-gate.js`, `format-typecheck.js`, `cost-tracker.js`, `desktop-notify.js`, `config-protection.js`
- `scripts/lib/` — shared helpers the hooks depend on (determines what else must be vendored)
- `examples/settings.json` — reference structure for `.claude/settings.json`
- `.mcp.json` — pinned MCP versions to copy
- `skills/continuous-learning-v2/SKILL.md` — confirm whether to gate behind a flag

## Single-Pass Execution Flow

1. Read the critical files above.
2. Write `ecc-init.sh` at `~/.dotfiles/bin/ecc-init.sh` implementing the behavior spec.
3. Pick a pilot project. Run `ecc-init.sh <pilot-path>`.
4. Open pilot in all four tools and run the verification list below.
5. Fix any gaps in `ecc-init.sh`, re-run on pilot with `--force`.
6. Replicate to remaining projects with one command each.

## Verification (runs inside the pilot project after `ecc-init.sh`)

- [ ] `.claude/agents/` lists 14 agents; visible via `/agents` in Claude Code
- [ ] `.claude/commands/` lists curated commands; visible via `/help` in Claude Code
- [ ] `.claude/skills/` populated with ~50 skill directories
- [ ] `.cursor/rules/` populated and picked up by Cursor
- [ ] `.kiro/steering/` populated and picked up by Kiro
- [ ] `.codex/` populated and picked up by Codex
- [ ] `.claude/settings.json` valid JSON; hooks resolve to vendored scripts
- [ ] `.mcp.json` valid JSON; `context7` + `playwright` entries
- [ ] Session end writes checkpoint → `/resume-session` reloads in new session
- [ ] `pre:bash:commit-quality` blocks a test commit containing `console.log`
- [ ] `pre:config-protection` blocks an edit that loosens eslint config
- [ ] `post:quality-gate` runs async after a trivial file edit
- [ ] `/prp-plan` generates a plan on a trivial feature request
- [ ] `/e2e` generates a Playwright test via MCP
- [ ] `/multi-plan` spawns parallel agents on a cross-cutting feature
- [ ] `stop:cost-tracker` log accumulates entries
- [ ] GAN harness dry-run with `GAN_MAX_ITERATIONS=3` (in scratch copy, not pilot) completes without cost spike
- [ ] `.gitignore` includes the appended ECC state paths

## Open Questions to Resolve During Script Write

- **Vendor vs. reference hook scripts?** Plan defaults to **vendor** (self-contained, portable). If you'd rather reference ECC repo via absolute path (single source of truth), flip the flag in the script.
- **`continuous-learning-v2` default?** Plan ships it copied but NOT activated via hook. Opt-in with `ECC_CONTINUOUS_LEARNING=v2` env var.
- **GAN harness:** not installed by default. Add `--with-gan` flag to `ecc-init.sh` that copies `gan-harness.sh` + GAN agents/commands into the project.
