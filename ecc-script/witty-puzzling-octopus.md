# ECC Adoption Plan — Single-Phase Bootstrap via `ecc-init.sh`

## Context

You're adopting `everything-claude-code` (v1.10.0) at `/Users/patrickrichardson/Documents/development/open-source/everything-claude-code` for full-stack work across **Claude Code, Cursor, Kiro, and Codex**. The repo ships 47 agents, 183 skills, 81 commands, and 14 rule directories — too much to cherry-pick by hand each time. This plan builds a single bootstrap script, `ecc-init.sh`, that scaffolds any project with your curated selection in one command, then verifies the install end-to-end.

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

**Location:** `~/.local/bin/ecc-init.sh` — already on your PATH (verified: `echo $PATH` includes `/Users/patrickrichardson/.local/bin`, same dir where your `claude-extract` / `claude-logs` / `claude-search` pipx symlinks live). Invoke as just `ecc-init <path>`.

**Pilot target:** `/Users/patrickrichardson/Documents/development/personal-automation/pilot-repo/` — confirmed this is a real Python/uv project (Alembic, pytest, `.env`, existing `.claude/` dir). The script must handle the pre-existing `.claude/` without destroying it (see step 1b below).

**Usage:** `ecc-init <target-project-path> [--force] [--skip-verify] [--with-gan] [--dry-run]`

**Behavior:**

1. **Validate inputs**
    - Target dir exists; is not the ECC repo itself; is a git repo (warn if not).
    - ECC repo path resolved (env `ECC_REPO_PATH` or default `/Users/patrickrichardson/Documents/development/open-source/everything-claude-code`).
    - Detect `--dry-run`: log every action without writing.

1b. **Handle pre-existing `.claude/` safely** (pilot already has one)
    - If `.claude/` exists: move to `.claude.backup-$(date +%Y%m%d-%H%M%S)/` unless `--force` explicitly requested.
    - Same treatment for pre-existing `.mcp.json`, `.cursor/`, `.kiro/`, `.codex/`.
    - Print the backup path so user can diff/merge afterward.

1. **Scaffold directories**
    - `.claude/{agents,commands,rules,skills,scripts/hooks}`
    - `.cursor/rules/`
    - `.kiro/steering/`
    - `.codex/`

2. **Copy curated files** (from catalog above)
    - Agents: 14 files from `agents/` → `.claude/agents/`
    - Commands: ~35 files from `commands/` → `.claude/commands/`
    - Skills: ~50 directories from `skills/` → `.claude/skills/`
    - Rules: `rules/{common,typescript,web,python,php}/*.md` → `.claude/rules/`, `.cursor/rules/`, `.kiro/steering/`, `.codex/rules/`
    - Tool mirrors: `.cursor/rules/` copied from ECC's `.cursor/rules/` where pre-adapted exists

3. **Vendor hook scripts**
    - Copy the seven Standard-posture hook scripts from `scripts/hooks/` + `scripts/hooks/run-with-flags.js` + `scripts/lib/` dependencies into `.claude/scripts/hooks/` (vendored for project self-containment; avoids fragile absolute paths).

4. **Write `.claude/settings.json`**
    - Wire the seven hooks to the vendored `.claude/scripts/hooks/*.js` via relative paths.
    - Enable session activity tracking OFF (grows unbounded).
    - Set `ECC_HOOK_PROFILE=standard` env var.

5. **Write `.mcp.json`**
    - `context7` + `playwright` with versions pinned from ECC's `.mcp.json`.

6. **Append to `.gitignore`**
    - `.claude/sessions/`, `.claude/metrics/`, `.claude/cost-tracker.log`, `.claude/bash-commands.log`.

7. **Write `.claude/CLAUDE.md` stub**
    - Lists installed agents/commands/skills for quick orientation.
    - References `rules/` location.

8. **Verification block** (skipped with `--skip-verify`)
    - Check all expected files exist (exit 1 if any missing).
    - Parse `.claude/settings.json` + `.mcp.json` with `jq` (exit 1 on invalid JSON).
    - `node -e "require('./.claude/scripts/hooks/run-with-flags.js')"` — sanity-import hook wrapper.
    - Print tool-by-tool "next steps" block: open in Claude Code / Cursor / Kiro / Codex, run which commands to confirm each tool sees the config.

9. **Post-install hints printed to stdout**
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

1. Read the critical files listed above (no execution).
2. Write `ecc-init.sh` at `~/.local/bin/ecc-init.sh`; `chmod +x`.
3. Dry-run against the pilot: `ecc-init ~/Documents/development/personal-automation/pilot-repo/ --dry-run` — review the log before any write.
4. Real run: `ecc-init ~/Documents/development/personal-automation/pilot-repo/` — the script backs up the existing `.claude/` to `.claude.backup-<timestamp>/`.
5. Open pilot in Claude Code, Cursor, Kiro, Codex in sequence; run the verification checklist below in each.
6. Diff `.claude.backup-<timestamp>/` against the new `.claude/` to recover any pilot-specific settings worth keeping, merge them back in.
7. Fix any gaps in `ecc-init.sh`, re-run with `--force` on pilot.
8. Replicate to remaining projects with one command each.

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
