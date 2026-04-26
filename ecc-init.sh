#!/usr/bin/env bash
# ecc-init.sh — bootstrap a project with a curated everything-claude-code install.

set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_NAME="ecc-init"

trap 'printf "[%s] ERROR: aborted at line %d (exit %d). Last command: %s\n" "$SCRIPT_NAME" "$LINENO" "$?" "$BASH_COMMAND" >&2' ERR
readonly DEFAULT_ECC_REPO="$HOME/Documents/development/personal-automation/pr-everything-claude-code"
readonly ECC_REPO="${ECC_REPO_PATH:-$DEFAULT_ECC_REPO}"

# Curated selections (from plan).
readonly AGENTS=(
  architect planner code-reviewer tdd-guide security-reviewer database-reviewer
  performance-optimizer build-error-resolver refactor-cleaner docs-lookup
  doc-updater chief-of-staff typescript-reviewer python-reviewer
)
readonly COMMANDS=(
  prp-prd prp-plan prp-implement prp-commit prp-pr
  tdd e2e test-coverage verify code-review build-fix
  multi-plan multi-backend multi-frontend multi-execute multi-workflow orchestrate
  gan-build gan-design loop-start loop-status aside
  checkpoint save-session resume-session sessions learn learn-eval
  rules-distill hookify hookify-configure hookify-list skill-create skill-health
  eval prompt-optimize model-route jira feature-dev
  quality-gate refactor-clean docs update-docs
)
readonly SKILLS=(
  frontend-patterns backend-patterns api-design nextjs-turbopack
  python-patterns python-testing django-patterns django-tdd django-security django-verification
  laravel-patterns laravel-tdd laravel-security laravel-verification
  tdd-workflow e2e-testing ai-regression-testing browser-qa verification-loop
  codebase-onboarding architecture-decision-records git-workflow
  agentic-engineering enterprise-agent-ops team-builder council
  gan-style-harness autonomous-agent-harness continuous-agent-loop autonomous-loops
  continuous-learning continuous-learning-v2 rules-distill hookify-rules
  configure-ecc strategic-compact context-budget token-budget-advisor
  claude-api mcp-server-patterns agent-eval agent-harness-construction
  cost-aware-llm-pipeline eval-harness prompt-optimizer iterative-retrieval
  search-first regex-vs-llm-structured-text postgres-patterns
  design-system frontend-design ui-demo click-path-audit jira-integration
  workspace-surface-audit dashboard-builder ralphinho-rfc-pipeline documentation-lookup
  docker-patterns dmux-workflows santa-method
)
readonly RULE_PACKS=(common typescript web python php)

# Flags.
DRY_RUN=0
FORCE=0
WITH_GAN=0
SKIP_VERIFY=0
TARGET=""

die() { printf '%s: error: %s\n' "$SCRIPT_NAME" "$*" >&2; exit 1; }
log() { printf '[%s] %s\n' "$SCRIPT_NAME" "$*"; }
warn() { printf '[%s] WARN: %s\n' "$SCRIPT_NAME" "$*" >&2; }

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME <target-project-path> [flags]

Scaffolds a curated everything-claude-code install into the target project.

Flags:
  --force         Overwrite existing .claude/ without backup (DANGEROUS)
  --dry-run       Print every action without writing anything
  --skip-verify   Skip post-install verification block
  --with-gan      Also install GAN harness (scripts/gan-harness.sh + related)
  -h, --help      Show this message

Env:
  ECC_REPO_PATH   Path to everything-claude-code repo (default: $DEFAULT_ECC_REPO)
EOF
}

# run CMD ... — skip when dry-run, else execute.
run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] %s\n' "$*"
  else
    "$@"
  fi
}

# write_file PATH <<'HEREDOC' — writes content to PATH, respecting dry-run.
write_file() {
  local dest="$1"
  local content
  content="$(cat)"
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] write %s (%d bytes)\n' "$dest" "${#content}"
  else
    mkdir -p "$(dirname "$dest")"
    printf '%s' "$content" > "$dest"
  fi
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --force) FORCE=1; shift ;;
      --dry-run) DRY_RUN=1; shift ;;
      --skip-verify) SKIP_VERIFY=1; shift ;;
      --with-gan) WITH_GAN=1; shift ;;
      -h|--help) usage; exit 0 ;;
      --) shift; break ;;
      -*) die "unknown flag: $1" ;;
      *)
        if [ -z "$TARGET" ]; then
          TARGET="$1"
        else
          die "unexpected positional arg: $1"
        fi
        shift
        ;;
    esac
  done
  [ -n "$TARGET" ] || { usage; die "target project path required"; }
}

validate_inputs() {
  [ -d "$ECC_REPO" ] || die "ECC repo not found at $ECC_REPO (set ECC_REPO_PATH to override)"
  [ -d "$ECC_REPO/agents" ] && [ -d "$ECC_REPO/scripts/hooks" ] \
    || die "$ECC_REPO does not look like the ECC repo (missing agents/ or scripts/hooks/)"
  [ -d "$TARGET" ] || die "target dir does not exist: $TARGET"
  local target_abs ecc_abs
  target_abs="$(cd "$TARGET" && pwd -P)"
  ecc_abs="$(cd "$ECC_REPO" && pwd -P)"
  [ "$target_abs" != "$ecc_abs" ] || die "refusing to install into the ECC repo itself"
  TARGET="$target_abs"
  if [ ! -d "$TARGET/.git" ]; then
    warn "target is not a git repo — backups and .gitignore appending still proceed"
  fi
  log "ECC repo:  $ECC_REPO"
  log "Target:    $TARGET"
  if [ "$DRY_RUN" -eq 1 ]; then
    log "Mode:      DRY-RUN (no files will be written)"
  fi
}

backup_existing() {
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local targets=(".claude" ".mcp.json" ".cursor" ".kiro" ".codex")
  for t in "${targets[@]}"; do
    local path="$TARGET/$t"
    if [ -e "$path" ]; then
      if [ "$FORCE" -eq 1 ]; then
        warn "--force: removing existing $t"
        run rm -rf "$path"
      else
        local bak="${path}.backup-${ts}"
        log "backing up existing $t → ${t}.backup-${ts}"
        run mv "$path" "$bak"
      fi
    fi
  done
}

scaffold_dirs() {
  log "scaffolding directories"
  run mkdir -p \
    "$TARGET/.claude/agents" \
    "$TARGET/.claude/commands" \
    "$TARGET/.claude/rules" \
    "$TARGET/.claude/skills" \
    "$TARGET/.claude/scripts" \
    "$TARGET/.cursor/agents" \
    "$TARGET/.cursor/commands" \
    "$TARGET/.cursor/rules" \
    "$TARGET/.cursor/skills" \
    "$TARGET/.kiro/agents" \
    "$TARGET/.kiro/commands" \
    "$TARGET/.kiro/skills" \
    "$TARGET/.kiro/steering" \
    "$TARGET/.codex/agents" \
    "$TARGET/.codex/rules" \
    "$TARGET/.codex/skills"
}

copy_curated() {
  local src dest
  log "copying ${#AGENTS[@]} agents"
  for a in "${AGENTS[@]}"; do
    src="$ECC_REPO/agents/${a}.md"
    if [ -f "$src" ]; then
      run cp "$src" "$TARGET/.claude/agents/${a}.md"
      run cp "$src" "$TARGET/.cursor/agents/${a}.md"
      # Kiro has native .json agent format; fall back to .md if not present
      if [ -f "$ECC_REPO/.kiro/agents/${a}.json" ]; then
        run cp "$ECC_REPO/.kiro/agents/${a}.json" "$TARGET/.kiro/agents/${a}.json"
      else
        run cp "$src" "$TARGET/.kiro/agents/${a}.md"
      fi
    else
      warn "agent missing in ECC repo: $a"
    fi
  done
  # Codex agents use a different naming convention; copy the whole .codex/agents/ dir wholesale
  if [ -d "$ECC_REPO/.codex/agents" ]; then
    run rsync -a "$ECC_REPO/.codex/agents/" "$TARGET/.codex/agents/"
  fi
  [ -f "$ECC_REPO/.codex/config.toml" ] && run cp "$ECC_REPO/.codex/config.toml" "$TARGET/.codex/config.toml"
  [ -f "$ECC_REPO/.codex/AGENTS.md" ] && run cp "$ECC_REPO/.codex/AGENTS.md" "$TARGET/.codex/AGENTS.md"

  log "copying ${#COMMANDS[@]} commands"
  for c in "${COMMANDS[@]}"; do
    src="$ECC_REPO/commands/${c}.md"
    if [ -f "$src" ]; then
      run cp "$src" "$TARGET/.claude/commands/${c}.md"
      run cp "$src" "$TARGET/.cursor/commands/${c}.md"
      run cp "$src" "$TARGET/.kiro/commands/${c}.md"
      # Codex has no native commands format; skip
    else
      warn "command missing in ECC repo: $c"
    fi
  done

  log "copying ${#SKILLS[@]} skills"
  for s in "${SKILLS[@]}"; do
    src="$ECC_REPO/skills/${s}"
    if [ -d "$src" ]; then
      run rsync -a "$src/" "$TARGET/.claude/skills/${s}/"
      run rsync -a "$src/" "$TARGET/.cursor/skills/${s}/"
      # Kiro has native skill versions for a subset; prefer those when present
      if [ -d "$ECC_REPO/.kiro/skills/${s}" ]; then
        run rsync -a "$ECC_REPO/.kiro/skills/${s}/" "$TARGET/.kiro/skills/${s}/"
      else
        run rsync -a "$src/" "$TARGET/.kiro/skills/${s}/"
      fi
      run rsync -a "$src/" "$TARGET/.codex/skills/${s}/"
    else
      warn "skill missing in ECC repo: $s"
    fi
  done

  log "copying rule packs: ${RULE_PACKS[*]}"
  for r in "${RULE_PACKS[@]}"; do
    src="$ECC_REPO/rules/${r}"
    if [ -d "$src" ]; then
      run rsync -a "$src/" "$TARGET/.claude/rules/${r}/"
      run rsync -a "$src/" "$TARGET/.cursor/rules/${r}/"
      run rsync -a "$src/" "$TARGET/.kiro/steering/${r}/"
      run rsync -a "$src/" "$TARGET/.codex/rules/${r}/"
    else
      warn "rule pack missing: $r"
    fi
  done
}

vendor_hook_scripts() {
  log "vendoring ECC scripts/ → .claude/scripts/ (for hook self-containment)"
  run rsync -a --exclude='.DS_Store' --exclude='*.test.js' \
    "$ECC_REPO/scripts/" "$TARGET/.claude/scripts/"
}

install_gan() {
  [ "$WITH_GAN" -eq 1 ] || return 0
  log "--with-gan: installing GAN harness"
  if [ -f "$ECC_REPO/scripts/gan-harness.sh" ]; then
    run cp "$ECC_REPO/scripts/gan-harness.sh" "$TARGET/.claude/scripts/gan-harness.sh"
    run chmod +x "$TARGET/.claude/scripts/gan-harness.sh" 2>/dev/null || true
  fi
  for a in gan-planner gan-generator gan-evaluator harness-optimizer loop-operator; do
    [ -f "$ECC_REPO/agents/${a}.md" ] && run cp "$ECC_REPO/agents/${a}.md" "$TARGET/.claude/agents/${a}.md"
  done
}

write_settings_json() {
  log "writing .claude/settings.json (Standard hook posture)"
  # The vendored scripts expect CLAUDE_PLUGIN_ROOT to point at a dir containing
  # scripts/hooks/. We set it to ${CLAUDE_PROJECT_DIR}/.claude so the runner
  # resolves scripts/hooks/<name>.js under .claude/scripts/hooks/.
  local runner='node "${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js"'
  local content
  content=$(cat <<'JSON'
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "_comment": "Generated by ecc-init.sh — Standard hook posture. Disable any hook by adding its id to ECC_DISABLED_HOOKS (comma-separated).",
  "env": {
    "CLAUDE_PLUGIN_ROOT": "${CLAUDE_PROJECT_DIR}/.claude",
    "ECC_HOOK_PROFILE": "standard"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"pre:bash:commit-quality\" \"scripts/hooks/pre-bash-commit-quality.js\" \"standard\""
        }],
        "description": "Pre-commit quality: lint staged files, block console.log/secrets",
        "id": "pre:bash:commit-quality"
      },
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"pre:config-protection\" \"scripts/hooks/config-protection.js\" \"standard\"",
          "timeout": 5
        }],
        "description": "Block AI from weakening linter/formatter configs",
        "id": "pre:config-protection"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"post:quality-gate\" \"scripts/hooks/quality-gate.js\" \"standard\"",
          "async": true,
          "timeout": 30
        }],
        "description": "Async lint/typecheck after file edits",
        "id": "post:quality-gate"
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"stop:format-typecheck\" \"scripts/hooks/stop-format-typecheck.js\" \"standard\"",
          "timeout": 300
        }],
        "description": "Batch format + typecheck edited JS/TS at end of response",
        "id": "stop:format-typecheck"
      },
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"stop:session-end\" \"scripts/hooks/session-end.js\" \"standard\"",
          "async": true,
          "timeout": 10
        }],
        "description": "Persist session state for /resume-session",
        "id": "stop:session-end"
      },
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"stop:cost-tracker\" \"scripts/hooks/cost-tracker.js\" \"standard\"",
          "async": true,
          "timeout": 10
        }],
        "description": "Log per-session token and cost metrics",
        "id": "stop:cost-tracker"
      },
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/scripts/hooks/run-with-flags.js\" \"stop:desktop-notify\" \"scripts/hooks/desktop-notify.js\" \"standard\"",
          "async": true,
          "timeout": 10
        }],
        "description": "Desktop notification when response finishes (macOS/WSL)",
        "id": "stop:desktop-notify"
      }
    ]
  }
}
JSON
)
  write_file "$TARGET/.claude/settings.json" <<< "$content"
}

write_mcp_json() {
  log "writing .mcp.json (context7 + playwright)"
  local content
  content=$(cat <<'JSON'
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@2.1.4"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@0.0.69", "--extension"]
    }
  }
}
JSON
)
  write_file "$TARGET/.mcp.json" <<< "$content"
}

append_gitignore() {
  local gi="$TARGET/.gitignore"
  local marker="# --- ecc-init managed ---"
  log "appending ECC state paths to .gitignore"
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] append ecc block to %s\n' "$gi"
    return 0
  fi
  if [ -f "$gi" ] && grep -Fq "$marker" "$gi"; then
    log "  gitignore already has ECC block, skipping"
    return 0
  fi
  {
    printf '\n%s\n' "$marker"
    printf '.claude/sessions/\n'
    printf '.claude/metrics/\n'
    printf '.claude/cost-tracker.log\n'
    printf '.claude/bash-commands.log\n'
    printf '.claude.backup-*/\n'
    printf '# --- end ecc-init ---\n'
  } >> "$gi"
}

write_claude_md_stub() {
  local dest="$TARGET/.claude/CLAUDE.md"
  if [ -f "$dest" ] && [ "$FORCE" -eq 0 ]; then
    log "CLAUDE.md already exists, leaving untouched"
    return 0
  fi
  log "writing .claude/CLAUDE.md stub"
  local agents_list commands_list skills_list
  agents_list="$(printf -- '- %s\n' "${AGENTS[@]}")"
  commands_list="$(printf -- '- /%s\n' "${COMMANDS[@]}")"
  skills_list="$(printf -- '- %s\n' "${SKILLS[@]}")"
  local content
  content=$(cat <<EOF
# Project — ECC Bootstrap

Generated by \`ecc-init.sh\`. Edit freely; this stub lists what ECC installed.

## Installed agents (\`.claude/agents/\`)

$agents_list

## Installed commands (\`.claude/commands/\`)

$commands_list

## Installed skills (\`.claude/skills/\`)

$skills_list

## Cross-Tool Mirroring

All agents, commands, skills, and rules are mirrored across tools:

- **Claude** (\`.claude/\`) — Full install: agents/, commands/, skills/, rules/, scripts/
- **Cursor** (\`.cursor/\`) — agents/, commands/, skills/, rules/
- **Kiro** (\`.kiro/\`) — agents/, commands/, skills/, steering/ (rules)
- **Codex** (\`.codex/\`) — agents/, commands/, skills/, rules/

## Hooks

Standard posture wired in \`.claude/settings.json\`. Disable any hook at runtime:

\`\`\`bash
ECC_DISABLED_HOOKS=stop:desktop-notify,post:quality-gate claude
\`\`\`

## MCP

\`.mcp.json\` ships \`context7\` + \`playwright\`. Both use npx on first run.

## Cost tracking

Token usage logs to \`~/.claude/cost-tracker.log\`. Check before running any GAN-style autonomous loops.

## Regenerating

Re-run \`ecc-init <this-project>\` to refresh. Existing config gets backed up to \`.claude.backup-<timestamp>/\`.
EOF
)
  write_file "$dest" <<< "$content"
}

verify_install() {
  if [ "$SKIP_VERIFY" -eq 1 ]; then
    log "skipping verification (--skip-verify)"
    return 0
  fi
  if [ "$DRY_RUN" -eq 1 ]; then
    log "skipping verification (dry-run)"
    return 0
  fi

  log "verifying install"
  local errors=0

  # Existence checks.
  for f in \
    ".claude/agents/architect.md" \
    ".claude/agents/typescript-reviewer.md" \
    ".claude/commands/tdd.md" \
    ".claude/commands/prp-plan.md" \
    ".claude/skills/backend-patterns" \
    ".claude/rules/common" \
    ".claude/rules/python" \
    ".claude/scripts/hooks/run-with-flags.js" \
    ".claude/scripts/hooks/session-end.js" \
    ".claude/scripts/hooks/cost-tracker.js" \
    ".claude/settings.json" \
    ".mcp.json" \
    ".cursor/agents/architect.md" \
    ".cursor/commands/tdd.md" \
    ".cursor/skills/backend-patterns" \
    ".cursor/rules/typescript" \
    ".kiro/agents/architect.json" \
    ".kiro/commands/tdd.md" \
    ".kiro/skills/backend-patterns" \
    ".kiro/steering/python" \
    ".codex/agents" \
    ".codex/config.toml" \
    ".codex/skills/backend-patterns" \
    ".codex/rules/php"; do
    if [ ! -e "$TARGET/$f" ]; then
      warn "MISSING: $f"
      errors=$((errors + 1))
    fi
  done

  # JSON validity.
  jq -e . "$TARGET/.claude/settings.json" >/dev/null 2>&1 \
    || { warn "INVALID JSON: .claude/settings.json"; errors=$((errors + 1)); }
  jq -e . "$TARGET/.mcp.json" >/dev/null 2>&1 \
    || { warn "INVALID JSON: .mcp.json"; errors=$((errors + 1)); }

  # Runner parses (syntax-only check; do not execute — top-level reads stdin).
  if ! node --check "$TARGET/.claude/scripts/hooks/run-with-flags.js" >/dev/null 2>&1; then
    warn "run-with-flags.js failed node --check"
    errors=$((errors + 1))
  fi

  if [ "$errors" -eq 0 ]; then
    log "verification PASSED"
  else
    warn "verification found $errors issue(s) — inspect above"
    return 1
  fi
}

print_next_steps() {
  cat <<EOF

$SCRIPT_NAME: done.

Next steps (run in target project $TARGET):

  # Claude Code
  claude
  # then: /agents    → should list 14 curated agents
  #       /help      → should list curated commands
  #       /prp-plan  → quick sanity smoke
  #       /resume-session (after first session ends)

  # Cursor — just open the folder; .cursor/rules/ is picked up automatically.
  # Kiro   — open the folder; .kiro/steering/ is picked up automatically.
  # Codex  — codex config reads .codex/

Cost tracker log: ~/.claude/cost-tracker.log
Disable a hook at runtime: ECC_DISABLED_HOOKS=<hook-id>[,<hook-id>] claude

Before first GAN run (if --with-gan): start with
  GAN_MAX_ITERATIONS=3 GAN_MODEL=claude-sonnet-4-5 bash .claude/scripts/gan-harness.sh ...

EOF
}

main() {
  parse_args "$@"
  validate_inputs
  backup_existing
  scaffold_dirs
  copy_curated
  vendor_hook_scripts
  install_gan
  write_settings_json
  write_mcp_json
  append_gitignore
  write_claude_md_stub
  verify_install
  print_next_steps
}

main "$@"