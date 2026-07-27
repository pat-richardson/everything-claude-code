# ECC Recon — Findings & Actionable Recommendations

**Target:** `everything-claude-code` (this repo, fork `pr-everything-claude-code`, branch `pr-ecc-version`)
**Date:** 2026-07-26
**Purpose:** Evaluate for (a) our day-to-day agentic development workflow and (b) our containerized agent sandbox at `~/Downloads/claude_remote_development_kb/cc_devcontainer`.
**Method:** Five parallel subagents (guides / security / portability / runtime / sandbox-audit) plus direct verification by the lead session.

---

## 0. Verification status — read this before trusting anything below

This report separates **what was verified by execution** from **what was read** from **what an agent asserted**. That distinction is the whole value of the exercise, because ECC's own documentation systematically blurs it.

| Claim class | Status |
|---|---|
| Component counts, file layout, adapter structure | **Verified by me** — direct `find`/`ls`/`node -e` on the tree |
| ECC test suite results | **Verified by me** — `node tests/run-all.js` executed in full |
| Hook wrapper + GateGuard internals | **Verified by me** — source read directly, including the `permissionDecision: 'deny'` call site |
| State-store paths and formats | **Verified by me** — `state-store/index.js`, `mcp-health-check.js`, `package.json` |
| Guides' methodology claims | Read from source docs by subagent; representative quotes checked |
| Security control enforcement levels | Subagent source review, then **corrected by me**: the enforced set is four hooks, not two — the subagent classified GateGuard as advisory when it hard-denies |
| **Sandbox test suite status** | **NOT verified — the audit agent ran nothing** and quoted `README.md:153-158`. Treat "all functional checks green" as a claim, not a fact. Re-run `test/verify.sh` before relying on it. |

**Verified scale of ECC:** 67 agents · 283 skill directories · 94 commands · 122 rule files · 49 hook scripts · 21 hook registrations across 7 events · 197 test files · 3,247 tests.

**Verified ECC test result:**

```
Total Tests: 3247   Passed: 3199 ✓   Failed: 48 ✗   (21 failing suites)
```

The 48 failures are almost entirely `ENOENT` assertions against files this fork intentionally strips (`.trae/`, `.github/workflows/`, `README.zh*`, `docs/zh-CN/`). **This is fork drift, not upstream breakage** — but it exposes a real property of ECC's test suite discussed in §5.3.

---

## 1. Executive verdict

ECC is three different-quality projects wearing one repo:

1. **The multi-CLI portability layer — genuinely good engineering.** A real adapter abstraction, schema-validated manifests, per-target install-state tracking, and an honest self-audited capability matrix. This is the part most worth stealing, and it is the part the marketing talks about least.
2. **The runtime hook layer — a few excellent, production-hardened hooks inside a large pile of advisory ones.** Of 21 hook registrations, exactly **four actually block a tool call**; the rest warn, observe, or format. Those four are worth porting close to verbatim, and the wrapper around them is better engineered than most of what it wraps.
3. **The security story — mostly prose.** The *guide* is a genuinely good threat-model education. The *enforcement* is two hooks. Everything else is either advisory markdown that a model may ignore, a roadmap item, or an external npm package (`ecc-agentshield`) invoked as a post-hoc scanner.

**For our sandbox specifically:** our `cc_devcontainer` is *ahead* of ECC on every control that matters at the container boundary (default-deny egress, capability drop, `no-new-privileges`, Keychain secret injection, `npm ignore-scripts`). ECC has nothing to teach us about isolation. What ECC has that we lack is everything *inside* the container: the agent configuration surface, multi-CLI support, and in-session guardrails.

The two systems are complementary, not competing. Our sandbox is a hardened box with almost nothing in it; ECC is a large pile of agent configuration with a weak box.

---

## 2. Agentic development patterns worth adopting

Ranked by value-to-effort. Effort is my estimate for adopting into our workflow, not ECC's.

### 2.1 GateGuard "fact-forcing" pre-tool gate — **highest-value single idea in the repo**

`scripts/hooks/gateguard-fact-force.js` (41 KB, vendored from `zunoworks/gateguard`). The insight, verbatim from its header:

```
 * Forces Claude to investigate before editing files or running commands.
 * Instead of asking "are you sure?" (which LLMs always answer "yes"),
 * this hook demands concrete facts: importers, public API, data schemas.
 *
 * The act of investigation creates awareness that self-evaluation never did.
```

This is a real behavioral-engineering insight, not a checklist. A confirmation prompt is a no-op against a model that always confirms; forcing the model to *produce specific facts* (who imports this, what's the public API, what's the rollback plan) changes what it knows before it acts. Gates differ by risk: Edit/Write demands importers + API impact; destructive Bash demands targets + rollback plan; routine Bash just demands the current instruction be quoted once per session.

**Adopt:** port the pattern (not necessarily the 41 KB file) as a PreToolUse hook. **Effort: medium.** This is also the single best candidate to bake into the sandbox image (§4.2).

### 2.2 Orchestrator → bounded subagents → files, with iterative retrieval

The stated model: subagents get **one** responsibility and a **constrained tool list**; the orchestrator never accepts the first answer at face value; intermediate output goes to **files, not back into context**; max ~3 refinement cycles.

I can confirm the failure mode this defends against from this very session: four of five subagents went idle *without delivering their reports*, and one asserted test results it had never run. Bounded scope plus explicit re-querying is not ceremony — it is the difference between a usable result and a confident fabrication.

**Adopt:** the file-handoff discipline and the "interrogate the subagent's return" habit. **Effort: low** (behavioral).

### 2.3 Runtime hook profiles instead of editing hook files

```bash
ECC_HOOK_PROFILE=minimal|standard|strict
ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

Implemented in `scripts/hooks/run-with-flags.js` + `scripts/lib/hook-flags.js`: every hook is invoked through one wrapper that decides whether to run it. This makes hooks **tunable per environment without editing config** — which is exactly what a container needs (strict inside the sandbox, minimal on the laptop).

The wrapper is also genuinely well-built — bounded 1 MB stdin, and a documented fix for output truncation:

```js
/**
 * Exit only after stdout and any previously queued stderr have drained.
 * `process.exit()` immediately after a stream write drops anything beyond
 * the OS pipe buffer, which cut large hook output mid-payload and made the
 * harness treat the hook as failed (#2222).
 */
```

**Adopt:** the single-wrapper + env-gate pattern for any hooks we write. **Effort: low.**

### 2.4 Continuous learning as "instincts" — real, not a stub

`skills/continuous-learning-v2/` is a working system, not documentation: a Python instinct CLI, observation hooks, a background observer agent (`agents/observer-loop.sh`, run on Haiku), confidence scoring (0.3–0.9), and project-scoped storage under `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects/<hash>/`.

The v2.1 design note is the interesting part — v2 moved observation from a Stop hook to PreToolUse/PostToolUse "(100% reliable)", and v2.1 added project scoping specifically because global instincts caused **cross-project contamination**. Both are lessons learned the hard way.

**Adopt with caution:** the *architecture* (atomic learned units + confidence + scoping + promotion to global only after seen in 2+ projects) is sound. Whether the extraction quality is worth the token cost is unproven and ECC offers no evidence. **Effort: high** to adopt wholesale; **low** to steal the scoping/confidence model for our own notes.

### 2.5 Model routing matrix

Explicit task→model routing (Haiku for exploration/docs, Sonnet default for coding, Opus for architecture/security/hard debugging), with "upgrade on first failure, 5+ files, or security."

**Caveat, flagged by the guides agent and correct:** the matrix predates current models and the guide's `pass@k` numbers (k=1→70%, k=3→91%) assume **independent failures**, which is false for systematic prompt bugs. Use the routing heuristic; ignore the arithmetic.

**Effort: low.**

### 2.6 Hook-craft details worth copying wholesale

Small, unglamorous, and the difference between hooks that work and hooks that corrupt sessions:

- **Dual-path execution.** Hooks export `module.exports.run(rawInput)` so the wrapper can call them **in-process**, falling back to `spawnSync` only for legacy hooks. Saves ~50–100 ms per hook — which compounds, since hooks fire per tool call.
- **Latency discipline at session start.** `scripts/lib/package-manager.js` detects npm/pnpm/yarn/bun by reading lock files **synchronously with zero child processes** — explicitly because session-start hooks must stay under ~100 ms. Resolution order: env var → project config → `package.json#packageManager` → lock file → global config → npm.
- **Stream-drain before exit** and **1 MB stdin cap with truncation suppression** (§2.3) — both are fixes for real corruption bugs.
- **Blocking hooks return structured decisions**, not just exit codes: `{permissionDecision: 'deny', permissionDecisionReason: ...}` with an optional recovery hint telling the model how to satisfy the gate.

**Effort: low.** Copy the shape before writing our first hook, not after.

### 2.7 Confidence-gated agent review

The `code-reviewer` agent enforces a **>80% confidence threshold** plus a "Pre-Report Gate" — a finding may only be reported with a concrete line number, a stated failure mode, and surrounding context — backed by an explicit "Common False Positives" checklist. Its false-positive guards have 21 dedicated tests.

This is the right answer to the most common failure of AI code review: confident noise. **Effort: low** — it's prompt structure, and we can apply it to any reviewer agent we run.

### 2.8 Harness-aware state isolation

`scripts/lib/agent-data-home.js` resolves agent state to `~/.cursor/ecc` under Cursor and `~/.claude` under Claude Code (detected via `CURSOR_VERSION`/`CURSOR_PROJECT_DIR`), overridable with `ECC_AGENT_DATA_HOME`. Without this, two harnesses silently overwrite each other's session files and learned state.

Directly relevant if we ever put a second CLI in the sandbox. **Effort: low.**

### 2.9 Selective-install profiles as a context-budget tool

`manifests/install-profiles.json` defines `minimal / core / developer / frontend-quality / security / research / full` as module bundles. The reason this matters isn't packaging convenience — it's that **installed surface is context cost**. A profile is a context budget with a name.

**Effort: medium** (see §3 for the machinery).

---

## 3. The portability architecture — the best engineering here

This is the part I'd actually study. **Verified structure:**

```
      SOURCE OF TRUTH                        agents/*.md  commands/*.md  rules/**  skills/**
      (Markdown + YAML frontmatter)          hooks/hooks.json  .mcp.json
                    │
                    ├── build-time generators ──► .codex/agents/*.toml   (convert-agents-to-toml.js)
                    │   (npm prepack, checked in) .opencode/**           (build-opencode.js)
                    │                             .gemini/ tool remap    (gemini-adapt-agents.js)
                    │
                    └── install-time adapters ──► scripts/lib/install-targets/registry.js
                            │                          │
                            │                     createInstallTargetAdapter(config)
                            │                          │
        manifests/install-modules.json ────────────────┤  planOperations() → typed ops
        manifests/install-profiles.json                │  (copy | merge-json | flatten | scaffold)
                            │                          ▼
                            └──────────────────► <target>/ecc-install-state.json
                                                 (fileRegistry: path → module, strategy, ownership)
```

**Three design decisions worth copying:**

**3.1 An adapter factory, not per-vendor copy-paste.** I checked this specifically because 14 vendor directories smells like rot. It isn't. Most adapters are ~10 lines of declarative config:

```js
// scripts/lib/install-targets/qwen-home.js — the entire file
const { createInstallTargetAdapter } = require('./helpers');
module.exports = createInstallTargetAdapter({
  id: 'qwen-home', target: 'qwen', kind: 'home',
  rootSegments: ['.qwen'],
  installStatePathSegments: ['ecc-install-state.json'],
  nativeRootRelativePath: '.qwen',
});
```

Only Cursor (6.3 KB), OpenCode (3 KB) and Antigravity (2.5 KB) need custom `planOperations`. Adding a CLI costs ten lines unless it needs real transformation. `helpers.js` (11 KB) carries the shared logic. **This is the correct shape for a portability layer.**

**3.2 Install-state tracking with ownership.** Every target writes `ecc-install-state.json` mapping each destination path to `{moduleId, strategy, ownership: managed|scaffold}`. This is what makes upgrade and uninstall non-destructive — managed files can be replaced, user-edited files are never clobbered. Schema-validated (`schemas/install-state.schema.json`).

**3.3 The capability matrix as a validated artifact.** `docs/architecture/harness-adapter-compliance.md` (verified to exist) is generated and checked by `scripts/lib/harness-adapter-compliance.js` (14.8 KB validator). Each harness is classified `Native | Adapter-backed | Instruction-backed | Reference-only` with required fields including `verification_commands`, `risk_notes`, `last_verified_at`, `owner`.

This is intellectually honest in a way the README is not: it says out loud that Gemini/Qwen/Kimi support is *instruction-backed* — i.e. documentation, not a tested integration. **Steal this pattern for any capability claim we make.**

**3.4 Adjacent finding — where runtime state actually lives.** Relevant to us because a container must decide what to persist across runs:

| State | Location | Format |
|---|---|---|
| Structured session/observation store | `~/.claude/ecc/state.db` | **sql.js** (in-memory SQLite compiled to WASM, persisted to disk) — dep `sql.js@1.14.1`, no native module |
| MCP health/backoff | `~/.claude/mcp-health-cache.json` | JSON, survives compaction and restart |
| Metrics | `.claude/metrics/tool-usage.jsonl`, `costs.jsonl` | NDJSON append |
| Learned instincts (project) | `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects/<git-hash>/` | JSONL + instinct records |
| Learned instincts (global) | `~/.claude/homunculus/` | promoted after 2+ projects |
| Session data / package-manager pref | `.claude/session-data/`, `.claude/package-manager.json` | Markdown / JSON |

The sql.js choice is notable: **no native compilation**, so state survives being moved between architectures and containers — a good property for an image we rebuild.

**Where it genuinely rots:** verification, not structure. There are **no end-to-end tests that launch any non-Claude CLI** and confirm the adapted config works. `scripts/sync-ecc-to-codex.sh` hand-merges TOML without a TOML parser and has no test at all. The two-tier reality is visible in the file counts: `.kiro` 153 files, `.opencode` 133, `.agents` 90, `.cursor` 69 — versus `.gemini`, `.qwen`, `.kimi`, `.zed`, `.openclaw`, `.hermes` at **exactly one file each**. Six of the fourteen "supported" CLIs are a single pointer document.

---

## 4. Security: what's enforced vs what's prose

### 4.1 Actually enforced in code (4 blocking controls)

Of 21 hook registrations, **four actually block**; the other seventeen advise, observe, or format.

| Control | File | Mechanism |
|---|---|---|
| **Git hook-bypass blocking** | `scripts/hooks/block-no-verify.js` (13.7 KB) | PreToolUse; full shell tokenization, detects `--no-verify`/`-n` and `-c core.hooksPath=`, handles comment stripping, quoting, command chains; **exit 2 = block**. Has integration tests. |
| **Fact-forcing gate** | `scripts/hooks/gateguard-fact-force.js` (41 KB) | PreToolUse on Write/Edit/MultiEdit + destructive Bash. **Verified: emits `permissionDecision: 'deny'` (line 1153)** — this is a real block, not a warning. Session-scoped state, 30-min timeout, bounded at 500 entries / 50 session keys. |
| **Linter-config protection** | `scripts/hooks/config-protection.js` (5.4 KB) | Blocks edits to `.eslintrc*`, `prettier.config.*`, `biome.json`, `.ruff.toml` etc. Allows first creation, blocks weakening. Fail-closed on stat error, `lstat` for symlinks. |
| **MCP health gate** | `scripts/hooks/mcp-health-check.js` (24 KB) | Reliability, not security: blocks calls to unhealthy MCP servers. Distinguishes transient (429/503) from permanent (401/403) failures; treats 401/403/406 as *healthy* since auth is gated separately. **Verified: persists to `~/.claude/mcp-health-cache.json` (line 51/98)**, so backoff survives compaction and restart. |

`block-no-verify.js` is the standout: it defends a real attack class (agent bypasses pre-commit hooks to make checks "pass") with correct shell parsing rather than a regex. **Port this.**

Everything else in the hook set is advisory: `doc-file-warning`, `suggest-compact`, `check-console-log`, `governance-capture`, the cost/activity trackers, and the desktop notifier. Useful, but do not count them as controls.

### 4.2 Prose that looks like control but isn't

The "Prompt Defense Baseline" block — the one prepended to `CLAUDE.md` and every file in `.claude/rules/` in this repo — is **model instruction, not enforcement**. Nothing intercepts a tool call based on it. It may bias the model; it cannot stop it. Same for the memory-hygiene guidance ("reset memory after untrusted runs") — no hook clears memory on detecting untrusted content.

The security guide's prompt-injection defenses (scan for zero-width Unicode, bidi overrides, base64, `curl|wget|nc|scp`; quarantine PDFs; parse untrusted content in an isolated agent and pass only a cleaned summary to a privileged one) are **good, concrete, and entirely unimplemented**. There is no sanitization hook in the repo. That's a build opportunity, not a finding against us.

`/security-scan` → `npx ecc-agentshield scan` is an **external package doing post-hoc auditing**, not a runtime gate. Do not mistake it for defense-in-depth.

### 4.3 Known-unfixed bugs in their own tree

From `docs/ECC-PRO-SECURITY-ROADMAP.md`: a **path-traversal** in continuous-learning storage (`shutil.rmtree(PROJECTS_DIR/project_id)` with no containment check, issue #2297) and a **registry-corruption race** (`_write_registry` without locking, #2294). Both acknowledged, both open. If we adopt `continuous-learning-v2`, we inherit these — sandbox the storage path or fix them first.

---

## 5. Gap analysis: ECC vs our agent-sandbox

### 5.1 Where our sandbox already wins (do not "improve" these)

Verified from `cc_devcontainer` source: default-deny iptables+ipset egress with fail-closed startup, per-ecosystem allowlists, IPv6 locked identically, DNS restricted to the parsed resolver only, `--cap-drop=ALL` plus `no-new-privileges`, `setpriv` clearing inheritable/ambient/**bounding** capability sets, digest-pinned base image, `/etc/npmrc ignore-scripts=true`, Keychain secrets injected per-container and never baked, and `sandbox.conf` **parsed rather than sourced** so a cloned repo can't execute code on the host.

ECC has no equivalent for any of these. Our container boundary is materially stronger than anything ECC ships or proposes.

### 5.2 Where ECC fills our real gaps

Our sandbox ships an *empty* agent configuration: `template/.claude/settings.json` has an **empty allow list and a deny list of `sudo/curl/wget/.env*/secrets/**`**, and that's it. Inside the box, the agent has no guardrails beyond per-action confirmation — which is precisely the "are you sure?" no-op GateGuard was built to replace.

| Gap in our sandbox | What ECC offers | Priority |
|---|---|---|
| No in-session behavioral guardrails | GateGuard fact-forcing gate; `block-no-verify`; `config-protection` | **High** |
| No hook infrastructure at all | `run-with-flags.js` wrapper + `ECC_HOOK_PROFILE` gating (a container is the ideal place for `strict`) | **High** |
| Claude-only; no multi-CLI story | Adapter registry — would let one sandbox serve Codex/Cursor/etc. | Medium |
| No prompt-injection handling for untrusted repo content | The security guide's sanitization design (unimplemented, but it's a spec) | Medium |
| No audit trail of agent actions inside the container | `session-activity-tracker.js`, `cost-tracker.js` (NDJSON to `.claude/metrics/*.jsonl`) | Medium |
| Empty allow list ⇒ constant confirmation prompts ⇒ prompt fatigue | ECC's disciplined per-project allowlists | Medium |
| No image rebuild on Claude Code / Node updates | — (ECC has nothing here either) | Low |

### 5.3 A caution ECC teaches by accident

**A large fraction of ECC's 3,247 "tests" are documentation-surface assertions** — they assert that a doc file exists and contains a string. That's why stripping regional docs and CI workflows in this fork broke 21 suites while the actual runtime logic kept passing. It's a defensible technique (docs can't silently rot) but it **inflates test counts and creates brittle coupling to file layout**. When we quote our own coverage numbers, exclude this class.

---

## 6. Prioritized backlog

| # | Action | Where | Effort | Why now |
|---|---|---|---|---|
| 1 | Port `block-no-verify.js` as a PreToolUse hook | Both | S | Highest-confidence control in the repo; blocks a real bypass class; already has tests |
| 2 | Port the GateGuard fact-forcing gate for Edit/Write + destructive Bash | Both (bake into image) | M | Converts useless confirmations into real investigation; biggest behavioral win — and it's a working `permissionDecision: 'deny'` hook, not a concept to build from scratch |
| 3 | Adopt the `run-with-flags` wrapper + `ECC_HOOK_PROFILE` pattern before writing any hooks | Sandbox first | S | Lets one image run `strict` in-container, `minimal` locally, no config edits |
| 4 | Fix the sandbox's empty allow list — add a curated per-project allowlist | Sandbox | S | Empty allow list is prompt fatigue, which trains us to approve blindly |
| 5 | **Re-run `test/verify.sh` and record real output** | Sandbox | S | Our "all green" status is currently an unverified README claim (§0) |
| 6 | Adopt the capability-matrix pattern with `last_verified_at` + `verification_commands` | Both | S | Cheap honesty mechanism; stops aspirational support claims |
| 7 | Add `config-protection`-style blocking for `Dockerfile`, `init-firewall.sh`, `allowed-domains.d/*`, workflow files | Sandbox | S | An agent editing its own firewall allowlist is the obvious escape path |
| 8 | Build the untrusted-content sanitization pass ECC specs but never implemented | Sandbox | M | Our sandbox exists to run agents on untrusted repos; this is the matching in-session control |
| 9 | Pilot install-profiles/manifest thinking as a **context budget**, not packaging | Workflow | M | Installed surface = context cost |
| 10 | Evaluate `continuous-learning-v2` in an isolated project — **patch #2297 path traversal first** | Workflow | L | Real system, unproven ROI, known unfixed bug |
| 11 | If we ever go multi-CLI: copy the adapter-factory + install-state shape, plus `agent-data-home` state isolation | Both | L | Correct architecture, already proven at 14 targets; without state isolation two harnesses silently clobber each other |
| 12 | Apply confidence-gating (>80% + concrete line/failure-mode/context) to any reviewer agent we run | Workflow | S | Directly targets the dominant failure of AI review: confident noise |

---

## 7. What not to copy

- **Scale for its own sake.** 283 skills and 67 agents with no automated quality gate, no deprecation path, and no usage telemetry on which ones actually fire. Marginal skill #200 is context cost with no evidence of return. Curate ruthlessly; ECC's own "10+ months of daily use" framing is unfalsifiable.
- **Doc-existence tests as a coverage metric** (§5.3).
- **The Prompt Defense Baseline boilerplate** prepended to every rules file. It's repeated in `CLAUDE.md`, `.claude/rules/node.md`, and `.claude/rules/everything-claude-code-guardrails.md` — three copies of the same ~200 tokens loaded every session, buying model suggestion, not enforcement. If we want the behavior, build the hook; if we want the reminder, say it once.
- **`sync-ecc-to-codex.sh`'s hand-rolled TOML merging** — no parser, no test.
- **Treating `ecc-agentshield` as a security control.** It's a post-hoc scanner.
- **The `pass@k` arithmetic** (assumes independent failures).
- **Cross-harness parity claims from the README.** Trust `docs/architecture/harness-adapter-compliance.md` instead — it's the honest version of the same information.

**Inherited defects to fix if we port the learning system:**

- `observations.jsonl` grows **unbounded per project** — no TTL, no GC, no archival policy documented. In a long-lived container this is a disk-fill vector.
- The state store is **synchronous sql.js**; large observation tables block the session thread.
- `ECC_HOOK_PROFILE` is an unvalidated string — a typo silently falls back to `standard` rather than erroring. If we adopt profile gating, validate the enum at load.
- `agent-data-home.js` deliberately duplicates `getHomeDir()` to dodge a circular require. Works, but the two copies will drift.
- Plus the two known-unfixed security bugs in §4.3.

---

## 8. Open questions for us

1. **Do we want the sandbox to be multi-CLI?** ECC's adapter layer makes it feasible, but each extra CLI is a new set of credentials, egress domains, and update cadence inside a box whose value is a tight allowlist. My inclination: stay Claude-only until there's a concrete second-CLI need.
2. **In-container audit trail — do we want one?** ECC writes NDJSON metrics. For a sandbox whose threat model is "the agent itself," an append-only action log on a host-side volume is arguably the missing forensic control.
3. **Where do hooks live for us** — baked into the image (uniform, tamper-resistant, requires rebuild) or mounted from the project (flexible, but the agent can edit them)? Recommend baked + read-only mount, with #7 above as backstop.

---

## Appendix: evidence log

| Check | Command / file | Result |
|---|---|---|
| Component counts | `find`/`ls` over tree | 67 agents, 283 skills, 94 commands, 122 rules, 49 hook scripts, 197 test files |
| Hook registrations | `node -e` over `hooks/hooks.json` | PreToolUse=8, Stop=6, SessionStart=2, PostToolUse=2, PreCompact=1, PostToolUseFailure=1, SessionEnd=1 |
| ECC test suite | `node tests/run-all.js` | 3247 total / 3199 pass / 48 fail / 21 suites failing |
| Failure cause | `grep ENOENT` over run log | Missing `.trae/`, `.github/workflows/`, `README.zh*`, `docs/zh-CN` — fork-stripped artifacts |
| Adapter factory | `scripts/lib/install-targets/*.js` | 15 files; 6 are ~10-line declarative configs; registry freezes a 14-adapter list |
| Capability matrix exists | `docs/architecture/harness-adapter-compliance.md` + `scripts/lib/harness-adapter-compliance.js` | Both present (7.7 KB doc, 14.8 KB validator) |
| Vendor-dir tiering | `find <dir> -type f \| wc -l` | `.kiro` 153, `.opencode` 133, `.agents` 90, `.cursor` 69 vs `.gemini`/`.qwen`/`.kimi`/`.zed`/`.openclaw`/`.hermes` = 1 each |
| Vendor-dir freshness | `git log -1` per dir | Most touched within ~1 month — actively maintained, not abandoned |
| GateGuard | `scripts/hooks/gateguard-fact-force.js` head | Vendored from `zunoworks/gateguard`; per-risk gate tiers; 30-min session state |
| GateGuard actually blocks | `gateguard-fact-force.js:1153` | `permissionDecision: 'deny'` — hard block, corrected my initial "advisory" read |
| MCP health persists | `mcp-health-check.js:51,98` | Writes `~/.claude/mcp-health-cache.json` — resolves a contradiction in the runtime agent's report (its "not persisted" red flag is wrong; dropped) |
| State store | `scripts/lib/state-store/index.js:12`, `package.json:466` | `.claude/ecc/state.db` via `sql.js@1.14.1` (WASM, no native build) |
| Hook wrapper quality | `scripts/hooks/run-with-flags.js` | 1 MB stdin cap; documented stdout-drain fix for issue #2222 |
| Learning loop is real | `skills/continuous-learning-v2/` | Python instinct CLI, observer agent, observe hook, project-scoped storage — not a stub |
| Sandbox test status | — | **Not run.** Audit agent confirmed it executed nothing; status quoted from `README.md:153-158` |
