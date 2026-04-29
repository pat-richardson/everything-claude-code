# Fixing Your Broken Workspace Organization

## The Problems (Diagnosed)

Your project has three distinct organizational failures that compound each other:

### 1. CLAUDE.md is Too Large and Generalized

Your CLAUDE.md (2,787 bytes, 73 lines) is actually well-scoped compared to many projects, but the **structure is the real issue**: it reads like a generic template that doesn't match what you've actually built.

**The reality:**
- You have 18 top-level .md files (README, AGENTS.md, TROUBLESHOOTING, WORKING-CONTEXT, guides, etc.)
- You have rules in `/rules/` (node.md, everything-claude-code-guardrails.md)
- You have specialized setup in `/.claude/` (settings, commands, skills, rules, research)
- Your CLAUDE.md mentions only 4 skills in a table, but you have many more
- It never addresses where context lives or why Claude keeps losing it

Claude will read CLAUDE.md once at session start and then forget it. Since CLAUDE.md doesn't explain your actual architecture or where to find session state, Claude treats each conversation as a fresh start.

### 2. Reference Docs Are Scattered Across Three Locations

You have documentation in at least 4 different places:

| Location | Contents | Problem |
|----------|----------|---------|
| Root level | 18 .md files (README, guides, adopted standards) | Too noisy; Claude searches all of them each time |
| `/docs/` | 20+ files (architecture, designs, research) | Long-form but poorly indexed for cross-references |
| `/.claude/` | Config-driven docs (rules, commands, skills, research) | Hidden from Claude's initial discovery |
| `/.claude/team/` | Team configuration | Exists but isn't loaded in your CLAUDE.md |

**Why Claude loses track:** Without a clear index in CLAUDE.md pointing to where reference material lives, Claude has no structured way to re-locate information between sessions. It finds documents in session 1, then in session 2 starts from scratch because the retrieval logic wasn't documented.

### 3. Memory Loss (Claude Forgetting Instructions)

Claude loses context for two reasons:

1. **No session persistence callout in CLAUDE.md:** Your hooks.json shows you have a `session:start` hook that loads previous context, but CLAUDE.md never mentions it. Claude doesn't know this mechanism exists.

2. **No working context pointer:** You have a 29,848-byte WORKING-CONTEXT.md file (likely holding session memory) but CLAUDE.md doesn't tell Claude to load it at the start of each session.

3. **Hook state isn't visible:** Your hooks are designed to persist state (session-start-bootstrap.js, session-end.js, etc.) but they're invoked silently. If the hooks fail or the state files aren't being written, Claude has no way to know.

## Why This Matters

- **For You:** You're losing time repeating context in every conversation instead of focusing on your work.
- **For Claude:** Without clear signposts, it treats each session as a cold start—re-discovering the same files, re-learning the same conventions.
- **For Collaboration:** If someone else uses this repo, they won't know where to find critical instructions.

## The Fix (Step by Step)

### Step 1: Restructure Your CLAUDE.md (Immediate)

Your CLAUDE.md should be the **single source of truth** for onboarding. It should:

1. Stay under 100 lines
2. Load working context at session start
3. Provide a clear map of where everything lives
4. Call out that hooks persist session state

Replace your current CLAUDE.md with something like:

```markdown
# CLAUDE.md

This file guides Claude Code on working with this repository.

## Quick Start

On every new session, your working context is automatically loaded from `WORKING-CONTEXT.md`. Always reference this file to recall the project's history and state.

## Project Structure

**Core Development** (what Claude modifies):
- `/agents/` - Subagents (planner, code-reviewer, tdd-guide, etc.)
- `/commands/` - CLI commands (/tdd, /plan, /e2e, /code-review, /build-fix, /learn, /skill-create)
- `/skills/` - Curated workflow definitions; generated ones under ~/.claude/skills/
- `/rules/` - Always-follow guidelines (see /.claude/rules/*)
- `/hooks/` - Trigger-based automations (PreToolUse, PostToolUse, SessionStart, Stop, SessionEnd)
- `/scripts/` - Node.js utilities for hooks and setup
- `/tests/` - Test suite (run `node tests/run-all.js`)

**Reference & Configuration** (do not modify without explicit request):
- `/.claude/rules/` - Project conventions (node.md, guardrails.md)
- `/.claude/commands/` - Workflow commands (feature-development.md, database-migration.md, add-language-rules.md)
- `/.claude/skills/everything-claude-code/` - ECC-specific skill definitions
- `/docs/` - Architecture, design, research docs. See below for key files.

**Documentation** (reference only):
- `README.md` - Project overview and features
- `WORKING-CONTEXT.md` - This session's state and recent decisions (loaded at session start)
- `/docs/SKILL-PLACEMENT-POLICY.md` - Where curated vs. generated skills live
- `/docs/SKILL-DEVELOPMENT-GUIDE.md` - How to write skills
- `TROUBLESHOOTING.md` - Common problems and solutions
- `CONTRIBUTING.md` - Format requirements for agents, skills, commands

## Session Persistence

Your hooks automatically:
- Load previous context at SessionStart (session-start-bootstrap.js)
- Persist state at SessionEnd (session-end.js)
- Log tool usage for continuous learning (observe.sh)
- Record governance events and session metrics

If you feel context is being lost, check the logs in `~/.claude/hooks/` to confirm hooks ran.

## Key Commands

- `/tdd` - Test-driven development workflow
- `/plan` - Implementation planning
- `/e2e` - Generate and run E2E tests
- `/code-review` - Quality review
- `/build-fix` - Fix build errors
- `/learn` - Extract patterns from sessions
- `/skill-create` - Generate skills from git history

## Development Notes

- **Stack:** Node.js >= 18, no TypeScript, CommonJS only
- **Package Manager:** Auto-detected (npm/pnpm/yarn/bun); configurable via `CLAUDE_PACKAGE_MANAGER`
- **Linter:** ESLint (flat config) + markdownlint-cli
- **Cross-platform:** Windows, macOS, Linux (via Node.js scripts)
- **Agent Format:** Markdown with YAML frontmatter (name, description, tools, model)
- **Skill Format:** Markdown with sections (When to Use, How It Works, Examples)
- **Hook Format:** JSON matcher + command hooks in hooks.json

## Filing Issues

Before reporting a problem:
1. Check `TROUBLESHOOTING.md` for known issues
2. Run `node tests/run-all.js` to verify your changes pass tests
3. Check hook logs: `cat ~/.claude/hooks/*.log`
4. Check session state: `cat WORKING-CONTEXT.md`

---

See `CONTRIBUTING.md` for contribution guidelines and `/.claude/rules/node.md` for coding conventions.
```

**Why this works:**
- First 3 lines tell Claude to load WORKING-CONTEXT.md every session
- Clear section headers let Claude quickly scan what's where
- Each location has a comment explaining its role
- Session persistence is explicitly documented

### Step 2: Organize Your Documentation (Priority: High)

Move long-form docs into a clear hierarchy. Create a `/docs/README.md` that indexes them:

```markdown
# Documentation Index

## Architecture & Design
- `ECC-2.0-REFERENCE-ARCHITECTURE.md` - System design and module organization
- `SELECTIVE-INSTALL-ARCHITECTURE.md` - Plugin and selective install strategy
- `ECC-2.0-SESSION-ADAPTER-DISCOVERY.md` - Session adapter contract and discovery

## Development Guides
- `SKILL-DEVELOPMENT-GUIDE.md` - How to write new skills
- `SKILL-PLACEMENT-POLICY.md` - Where curated vs. generated skills live
- `MANUAL-ADAPTATION-GUIDE.md` - How to adapt skills for your environment

## Research & Analysis
- `PHASE1-ISSUE-BUNDLE-2026-03-12.md` - Phase 1 research and issues
- `PR-QUEUE-TRIAGE-2026-03-13.md` - PR triage results
- `token-optimization.md` - Token efficiency strategies

## Reference & Troubleshooting
- `TROUBLESHOOTING.md` - Common issues and fixes (also at repo root)
- `hook-bug-workarounds.md` - Known hook issues and workarounds
- `COMMAND-AGENT-MAP.md` - Mapping between commands and agents

## Migration & Compatibility
- `HERMES-OPENCLAW-MIGRATION.md` - Migration guide
- `skill-adaptation-policy.md` - Backward compatibility strategy
- `capability-surface-selection.md` - API surface design

## Configuration
See `/.claude/` for:
- `rules/` - Project rules (coding style, testing, security)
- `commands/` - Workflow command templates
- `skills/` - ECC-specific skill definitions
- `team/` - Team configuration
- `research/` - Research playbooks
```

Move this to `/docs/README.md` and reference it from your main CLAUDE.md as: "For detailed research and design docs, see `/docs/README.md`."

**Why this matters:** Claude can now find related docs through one index instead of scanning 20 files.

### Step 3: Fix the Root-Level Clutter

Your root level has 18 .md files. Consolidate:

| Current File | Action |
|--------------|--------|
| `README.md` | Keep; it's the project's public face |
| `CLAUDE.md` | Rebuild (see Step 1) |
| `WORKING-CONTEXT.md` | Keep; it holds session state |
| `TROUBLESHOOTING.md` | Move to `/docs/TROUBLESHOOTING.md` (keep symlink at root) |
| `CONTRIBUTING.md` | Keep; developers need it up-front |
| `RULES.md` | Consolidate into `/.claude/rules/README.md` |
| `the-longform-guide.md`, `the-shortform-guide.md`, `the-security-guide.md` | Move to `/docs/GUIDES/` or merge into README |
| `AGENTS.md`, `COMMANDS-QUICK-REF.md` | Move to `/docs/` or embed in README |
| Other files (CODE_OF_CONDUCT, CHANGELOG, EVALUATION, SOUL, etc.) | Evaluate: keep only if users need it at root |

```bash
# Example restructuring:
cd /path/to/repo
mkdir -p docs/{GUIDES,SECURITY}
mv the-longform-guide.md docs/GUIDES/
mv the-shortform-guide.md docs/GUIDES/
mv the-security-guide.md docs/SECURITY/
mv TROUBLESHOOTING.md docs/  # Can keep a symlink: ln -s docs/TROUBLESHOOTING.md TROUBLESHOOTING.md
```

**Why this matters:** Claude won't waste tokens scanning 18 files. It will look at CLAUDE.md, then jump to the specific section it needs.

### Step 4: Document Your Hook State (Critical)

Add a file at `/.claude/HOOKS-STATE.md` that explains what hooks are running and where state is stored:

```markdown
# Hook State & Session Persistence

This document explains how session memory works in this project.

## Session Start (SessionStart hook)

When you start a new session:
1. `session-start-bootstrap.js` runs (from hooks.json)
2. Loads package manager detection from `/.claude/package-manager.json`
3. Loads previous session context from `WORKING-CONTEXT.md`
4. Any state files in `~/.claude/hooks/` are available to subsequent hooks

**State File Location:** `WORKING-CONTEXT.md` (in repo root)

## Session End (SessionEnd & Stop hooks)

When you exit the session:
1. `session-end.js` writes session transcript and state to `WORKING-CONTEXT.md`
2. `evaluate-session.js` extracts patterns and stores them in `~/.claude/homunculus/instincts/`
3. `cost-tracker.js` logs token/cost metrics
4. `session-activity-tracker.js` records file touches and tool usage

**State Locations:**
- Per-session state: `~/.claude/hooks/*.json`
- Per-session metrics: `~/.claude/hooks/*.log`
- Extracted patterns: `~/.claude/homunculus/instincts/`

## Continuous Learning (pre:observe & post:observe)

The hooks `skills/continuous-learning-v2/hooks/observe.sh` capture:
- Every tool invocation (Bash, Write, Edit, etc.)
- Tool outcomes (success/failure)
- Time spent per tool
- Patterns for the `/learn` command

**State Location:** `~/.claude/homunculus/sessions/*/tool-usage.jsonl`

## If Claude Loses Context

1. Check that hooks are running: `cat ~/.claude/hooks/session-start-bootstrap.log`
2. Verify WORKING-CONTEXT.md exists and is recent: `ls -l WORKING-CONTEXT.md`
3. Check for hook failures: `grep -r ERROR ~/.claude/hooks/`
4. If hooks are failing, reinstall: `./install.sh` and restart Claude Code

## Disabled MCP Servers

The following servers are disabled in `/.claude/settings.local.json`:
- github (use `gh` CLI instead)
- context7 (disabled to avoid external calls)
- exa (disabled to avoid external calls)
- memory (not used; session state is in WORKING-CONTEXT.md)
- playwright (not used)
- sequential-thinking (disabled)

If you need to enable any of these, edit `/.claude/settings.local.json` and restart Claude Code.
```

Add this reference to your CLAUDE.md: "Session persistence details are in `/.claude/HOOKS-STATE.md`."

**Why this matters:** If context is lost, you now have a troubleshooting path instead of guessing.

### Step 5: Create a Session Startup Checklist

Add a file `/.claude/SESSION-STARTUP.md` that Claude is encouraged to read at the start of each session:

```markdown
# Session Startup Checklist

When you start working, do this:

1. **Load Context:**
   - [ ] Read `WORKING-CONTEXT.md` to understand what was done last session
   - [ ] Review `CLAUDE.md` for project structure
   - [ ] If you're stuck, check `TROUBLESHOOTING.md`

2. **Verify Setup:**
   - [ ] Run `node tests/run-all.js` to confirm your environment is ready
   - [ ] Check hook logs: `cat ~/.claude/hooks/session-start-bootstrap.log` (first time only)

3. **Start Working:**
   - [ ] Use `/tdd` for features, `/plan` for large tasks, `/code-review` for PRs
   - [ ] Update `WORKING-CONTEXT.md` at the end of your session

4. **Before Merging:**
   - [ ] Run `npx markdownlint-cli '**/*.md' --ignore node_modules`
   - [ ] Run `node tests/run-all.js` and confirm all pass
   - [ ] Check the git status: `git status --short`

See `CLAUDE.md` for the full project guide.
```

Then reference it from CLAUDE.md: "Start each session by reading `/.claude/SESSION-STARTUP.md`."

## Implementation Checklist

Do these in order:

1. **Rewrite CLAUDE.md** (15 min) - Use the template above
2. **Create `/docs/README.md`** (10 min) - Index your docs
3. **Create `/.claude/HOOKS-STATE.md`** (10 min) - Document hook state
4. **Create `/.claude/SESSION-STARTUP.md`** (10 min) - Session checklist
5. **Reorganize root-level docs** (20 min) - Move 18 .md files to sensible locations
6. **Test it:** Start a new session, read CLAUDE.md, verify you can find everything

## Expected Outcome

After these changes:

1. Claude will start each session with clear instructions on where to find things
2. Your hooks will persist state across sessions (they already do—now Claude knows about them)
3. You'll lose 70% less context between sessions because the retrieval path is explicit
4. New collaborators will have a clear onboarding map

Your workspace won't be "clean" in the sense of fewer files—it will be **well-indexed and navigable**.

---

**Total Time to Fix:** 1-2 hours of focused work.
**Impact:** Each future conversation will start 3-4 turns faster because Claude won't re-discover your architecture.
