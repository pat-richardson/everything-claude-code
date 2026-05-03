# Install Audit - May 2026

This audit compares the old `ecc-init.sh` curated arrays from `pr-ecc-version`
with the current manifest-driven `developer` profile.

## Summary

The `developer` profile covers the baseline installer surface through modules
instead of hardcoded file arrays:

- `rules-core`
- `agents-core`
- `commands-core`
- `hooks-runtime`
- `platform-configs`
- `workflow-quality`
- `framework-language`
- `database`
- `orchestration`

Most old `ecc-init.sh` selections are reachable through those modules, but the
old script also encoded fork-local product preferences that are broader than
the upstream developer profile.

## Covered By `developer`

- Core agents such as `architect`, `planner`, `code-reviewer`, `tdd-guide`,
  `security-reviewer`, `database-reviewer`, `build-error-resolver`,
  `refactor-cleaner`, `doc-updater`, `docs-lookup`, `typescript-reviewer`,
  and `python-reviewer` are covered by `agents-core`.
- Core workflow commands such as `tdd`, `e2e`, `test-coverage`, `verify`,
  `code-review`, `build-fix`, `multi-*`, `orchestrate`, `sessions`, and
  `refactor-clean` are covered by `commands-core` and `orchestration`.
- Engineering skills such as `frontend-patterns`, `backend-patterns`,
  `api-design`, `python-patterns`, `python-testing`, Django/Laravel guidance,
  `tdd-workflow`, `e2e-testing`, `verification-loop`, `mcp-server-patterns`,
  `postgres-patterns`, and `dmux-workflows` are covered by `framework-language`,
  `workflow-quality`, `database`, and `orchestration`.
- Rule packs for `common`, `typescript`, `web`, `python`, and `php` are covered
  by `rules-core`.

## Not Fully Represented By `developer`

These old curated selections are reachable only through non-developer modules
or new components:

- GAN-oriented commands and agents: `gan-build`, `gan-design`, `gan-planner`,
  `gan-generator`, and `gan-evaluator`. Use `capability:gan`.
- UI/product design extras: `design-system`, `ui-demo`, `browser-qa`, and
  click-path workflows. Use `capability:ui-ux` or `capability:media`.
- Agentic harness and prompt optimization extras: `agentic-engineering`,
  `enterprise-agent-ops`, `team-builder`, `council`, `agent-harness-construction`,
  `cost-aware-llm-pipeline`, `prompt-optimizer`, `iterative-retrieval`,
  `search-first`, and `regex-vs-llm-structured-text`. Use `capability:agentic`.
- Operator and SaaS workflow extras: `jira-integration`,
  `workspace-surface-audit`, `dashboard-builder`, and
  `ralphinho-rfc-pipeline`. Use `capability:operators` where available.
- Codex project role TOML generation is now handled by
  `scripts/codex/convert-agents-to-toml.js`; generated `.codex/agents/*.toml`
  is committed and checked for drift.

## Missing Or Renamed In Current Manifests

The old array referenced names that are not present as first-class manifest
entries in the current repo snapshot:

- `claude-api`
- `agent-eval`
- `frontend-design`
- `git-workflow`
- `gan-style-harness` as a developer-profile item
- `santa-method`

These should not be hardcoded back into `ecc-init.sh`. If they remain fork-local
product choices, add a fork-local profile or component that points to existing
repo paths.

## Decision

Keep `developer` conservative and manifest-driven. The new `ecc-init.sh` wrapper
uses `scripts/install-apply.js` with `claude-project`, `cursor`, and
`codex-project` targets by default, and optional extras are expressed through
components such as `capability:gan`, `capability:ui-ux`, `mcp:context7`, and
`mcp:playwright`.
