# Multi-Harness Install Alignment — Review of Codex Plan

## Context

`pr-everything-claude-code` is a fork that tracks an open-source upstream on `main` and applies fork-specific changes via rebase onto `pr-ecc-version`. The goal is to keep the rebase footprint small and uncontroversial while delivering the developer use-cases (multi-harness, per-project install, selective categories, sync, typed contracts).

The branch added a 585-line `ecc-init.sh` plus a 780-line `convert-agents-to-toml.js` and committed 51 generated TOML files. Codex's plan correctly identifies that `ecc-init.sh` reimplements machinery that already exists on main (`scripts/install-plan.js`, `scripts/install-apply.js`, `scripts/lib/install-manifests.js`, `scripts/lib/install-lifecycle.js`, `scripts/lib/install-state.js`, seven adapters under `scripts/lib/install-targets/`) and proposes treating it as a UX prototype to be replaced by a thin wrapper. The converter is genuinely net-new and worth adopting.

This plan refines Codex's direction with the gaps surfaced during review: selective install must flow through the config-merge step, `claude-project` adapter is a symmetric gap to `codex-project` and goes upstream, the curated bash arrays in the branch script are product knowledge that needs auditing before discard, and the upstream-vs-fork-local classification needs to be explicit.

## Decisions (locked with user)

- **Curated lists**: audit the branch's hardcoded arrays against existing manifest coverage before deciding port-vs-discard.
- **Upstream split**: only `claude-project` adapter goes upstream. Converter, `codex-project` adapter, curated profile, and `ecc-init` wrapper all stay fork-local on `pr-ecc-version`.
- **Generated TOML**: commit `.codex/agents/*.toml`, gate on CI drift check.
- **Merge selection**: `merge-codex-config.js` must honor converter include/exclude so selective install isn't defeated downstream.

## Agreement with Codex's plan

- Demote `ecc-init.sh` to a wrapper over the manifest installer. Main already centralizes backup, dry-run, verification, drift detection, AJV-validated install-state, doctor/repair, and operation planning — duplicating these in shell is the core problem.
- Adopt `scripts/codex/convert-agents-to-toml.js`. The file already supports `--check`, `--dry-run`, `--include`/`--exclude`, `--fail-on-unsupported`, model alias resolution, and MCP/skill ref inference — Codex's "must support" list is met by the file as shipped.
- Add `codex-project` target adapter. Main has `codex-home` (stub) only; the branch writes `.codex/` directly with no adapter.
- Drop unrelated branch churn (regional doc deletions, `.trae/`, `find-regional-dirs.sh`, GitHub workflow removals — ~147k lines, none install-related). Evaluate `find-regional-dirs.sh` separately on its own merits.
- Centralize backup/dry-run/verify/refresh/MCP/hook wiring in the manifest installer; never re-implement in scripts.

## Concerns Codex's plan missed

1. **`claude-project` adapter is a symmetric gap.** Main has `claude-home` only; the branch writes `.claude/` directly without an adapter. Same pattern, same fix, same tests as `codex-project`. Add both. (User decision: this one goes upstream, the codex one stays fork-local.)

2. **`merge-codex-config.js` auto-wires every generated agent.** The branch replaced a fixed list with `collectAgentTablePaths()` that pulls every `agents.*` subtable from the reference config. That defeats selective install one step downstream of conversion. The merge step must be filtered by the same include/exclude as the converter.

3. **The curated bash arrays are product knowledge.** Someone decided 10 agents / 54 commands / 49 skills / 5 rule packs are the right project default. If the wrapper just calls `--profile developer`, that opinion is lost. Audit first to see what overlaps with main's existing `developer` profile vs. what's genuinely unique fork curation.

4. **Component family `mcp:` doesn't exist on main.** Existing prefixes are `baseline:`, `lang:`, `framework:`, `capability:`, `agent:`, `skill:`. Either add `mcp:` to the family enum (preferred — explicit) or fold MCP servers into `capability:` (simpler — implicit). Pick one.

5. **Fork rebase strategy.** Every change should be classified upstream-bound vs fork-local so rebase pain is bounded. Resolved by user decisions above.

6. **Migration for existing fork users.** Anyone already running `ecc-init.sh` against a project has uncatalogued copies. The wrapper must produce a layout that either (a) is byte-compatible with the prior script, or (b) ships a one-shot `claim` step that writes `ecc-install.json` against the existing files.

7. **CLI surface.** Codex proposed `ecc init`. Main has `ecc install`. Decide: alias or new subcommand. Recommendation: `ecc install --scope project` (no new verb).

## Recommended Approach

### Phase 0 — Audit (no code changes)

- Diff the bash arrays in `ecc-init.sh` (lines 16–51) against the modules referenced by the existing `developer` profile in `manifests/install-profiles.json` and `manifests/install-modules.json`.
- Output: a delta list of agents/commands/skills/rule-packs that are in the script but not reachable through the `developer` profile + components. This is the audit Codex's plan skipped.
- File to write: `docs/install-audit-2026-05.md` (audit only; not part of the runtime).

### Phase 1 — Upstream-bound (lands in main, fork diff shrinks)

- **`claude-project` target adapter**: new file `scripts/lib/install-targets/claude-project.js`, mirrors `cursor-project.js` shape. Register in `scripts/lib/install-targets/registry.js`.
- **Tests**: `tests/lib/install-targets.test.js` — add cases for `claude-project` validation, root resolution, and `planOperations`.
- **Manifest schema doc**: if `mcp:` family is adopted, extend the family enum in whatever schema validates `manifests/install-components.json` (look in `schemas/` and `tests/lib/install-manifests.test.js`).

### Phase 2 — Fork-local on `pr-ecc-version`

- **`codex-project` target adapter**: `scripts/lib/install-targets/codex-project.js`, plus registry registration. Writes `.codex/`, project-level `AGENTS.md` supplement, selected `.codex/agents/*.toml`, and selected MCP config. Same shape as `claude-project`.
- **Adopt `scripts/codex/convert-agents-to-toml.js`** as-is from the branch. Source of truth: `agents/*.md`. Output: `.codex/agents/*.toml`. Honor existing flags. Already correct.
- **Filter `merge-codex-config.js::collectAgentTablePaths()`** to only collect agent tables matching the active install selection (pass include/exclude into the function or read them from the resolved install state). This is the missed concern from Codex's plan.
- **Curated `developer-project` profile** (after audit): port the unique curation from `ecc-init.sh` arrays into `manifests/install-profiles.json` as a new profile. If the audit shows full overlap with `developer`, skip this and use `developer` directly.
- **Strip `ecc-init.sh` to a wrapper.** Replace the body with a single invocation: `node scripts/install-apply.js --scope project --target claude,codex,cursor --profile developer-project --with lang:typescript --with capability:ui` (flags driven by detection or CLI args). Preserve `--dry-run`, `--force`, `--with-gan`, `--skip-verify` as pass-throughs. Forbid direct `cp`/`rsync`/`mv`/`rm` calls in the wrapper.
- **Migration**: add `--claim` flag to wrapper (or to `scripts/ecc.js install`) that detects existing fork-installed `.claude/` and `.codex/` files and writes a synthetic `ecc-install.json` so they're tracked going forward.
- **Keep `scripts/sync-ecc-to-codex.sh`** branch additions as-is (the +20 lines that invoke the converter before sync — this is correct).
- **Preserve intentional fork deletions and tooling.** The regional doc deletions (ja/zh/etc.), `.trae/` removal, GitHub workflow removals, and `find-regional-dirs.sh` are intentional fork preferences and stay on `pr-ecc-version`. They are out of scope for this install refactor — neither carry them into `main` nor revert them on the branch.

### Phase 3 — Typed contracts

- Reuse the existing AJV pattern (`scripts/lib/install-state.js` already validates against `schemas/install-state.schema.json`).
- Add schemas: `schemas/install-manifest.schema.json` (validates manifest JSON files), `schemas/codex-agent-toml.schema.json` (validates generated TOML metadata), `schemas/ecc-install-config.schema.json` (validates project-level `ecc-install.json`).
- Add `.d.ts` files mirroring the pattern of `scripts/lib/utils.d.ts` and `scripts/lib/package-manager.d.ts`: `scripts/lib/install-target.d.ts` for adapter operation shapes.
- CI: extend `tests/docs/install-identifiers.test.js` and the existing schema-driven tests to cover the new schemas.

## Critical Files

**Read-and-understand-first**:

- `scripts/install-apply.js` — main entrypoint, mode dispatch
- `scripts/lib/install-manifests.js` — manifest loader and resolver
- `scripts/lib/install-lifecycle.js` — central lifecycle (backup, verify, doctor, repair, drift)
- `scripts/lib/install-state.js` — schema-validated state I/O
- `scripts/lib/install-targets/registry.js` — adapter registration
- `scripts/lib/install-targets/cursor-project.js` — closest existing pattern to copy for new project-scope adapters
- `scripts/codex/merge-codex-config.js` — needs the include/exclude filtering change

**To create**:

- `scripts/lib/install-targets/claude-project.js` (upstream)
- `scripts/lib/install-targets/codex-project.js` (fork-local)
- `schemas/install-manifest.schema.json`, `schemas/codex-agent-toml.schema.json`, `schemas/ecc-install-config.schema.json`
- `scripts/lib/install-target.d.ts`

**To modify**:

- `manifests/install-profiles.json` (add `developer-project` if audit shows unique curation)
- `manifests/install-components.json` (add `mcp:` family entries if family is adopted)
- `scripts/lib/install-targets/registry.js` (register new adapters)
- `scripts/codex/merge-codex-config.js` (filter `collectAgentTablePaths()` by selection)
- `ecc-init.sh` (strip to wrapper; max 60 lines)

**To adopt unchanged from branch**:

- `scripts/codex/convert-agents-to-toml.js` (780 lines, already correct)
- Branch additions to `scripts/sync-ecc-to-codex.sh` (+20 lines)
- `tests/scripts/convert-agents-to-toml.test.js` (541 lines)
- `tests/codex-config.test.js` additions (+48 lines)
- 51 generated `.codex/agents/*.toml` files

## Verification

1. **Manifest audit**: produce `docs/install-audit-2026-05.md` showing the delta between `ecc-init.sh` curation and existing `developer` profile.
2. **Run `node tests/run-all.js`** — all existing install/codex/lifecycle tests must pass.
3. **New unit tests**:
   - `tests/lib/install-targets.test.js`: `claude-project` and `codex-project` adapter validation, root resolution, `planOperations`.
   - `tests/scripts/merge-codex-config.test.js` (new or extended): selection-aware `collectAgentTablePaths()` returns filtered set.
   - `tests/scripts/ecc-init.test.js` (new): asserts the wrapper script contains no direct `cp`/`rsync`/`mv`/`rm` install logic — Codex's "regression-test the wrapper stays a wrapper" is correct.
4. **Drift gate**: extend or add a CI test that runs `convert-agents-to-toml.js --check` and fails when committed `.codex/agents/*.toml` is stale relative to `agents/*.md`.
5. **End-to-end install smoke test** (new under `tests/scripts/install-e2e.test.js`): in a tmpdir, run the wrapper with `--profile developer-project --target claude,codex,cursor --dry-run`, then apply, then assert that `.claude/`, `.codex/`, `.cursor/`, `.mcp.json`, and `ecc-install.json` exist with the expected operations recorded — this is what's actually missing in Codex's test plan.
6. **Selective-install assertion**: install with `--without skill:ui-demo`, verify (a) the skill file is absent and (b) any agent that referenced it has its TOML role wired without that skill in `merge-codex-config.js` output.
7. **Migration smoke**: run the wrapper against a tmpdir prepared by the *old* `ecc-init.sh`, with `--claim`, and confirm `ecc-install.json` is produced with the correct operation records.

## Out of scope

- Regional doc deletions (ja/zh) and `.trae/` removal — intentional fork preference, leave as-is on `pr-ecc-version`.
- `find-regional-dirs.sh` — intentional fork tooling, leave as-is on `pr-ecc-version`.
- `gan-harness.sh` and the `--with-gan` flag — pass through unchanged on the wrapper, no semantic change.
- Skill evolution / improvement subsystems — already on main, untouched.
