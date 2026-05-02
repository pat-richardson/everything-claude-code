# Codex Agent Conversion

ECC supports a repo-native Codex conversion lane that turns markdown agents in `agents/*.md` into Codex role files in `.codex/agents/*.toml`.

This is a Codex adapter layer, not a new workflow source of truth. Skills remain the cross-harness workflow surface. If you want to change a generated Codex role, edit the markdown agent source, not the emitted TOML.

## Commands

Generate role files only:

```bash
node scripts/codex/convert-agents-to-toml.js \
  --source agents \
  --dest .codex/agents
```

Generate role files and wire `.codex/config.toml`:

```bash
node scripts/codex/convert-agents-to-toml.js \
  --source agents \
  --dest .codex/agents \
  --config .codex/config.toml \
  --wire-config
```

Useful modes:

- `--dry-run` previews writes without changing files.
- `--check` exits non-zero if generated TOML or config wiring has drifted.
- `--include <glob>` and `--exclude <glob>` limit which markdown agents are converted.
- `--fail-on-unsupported` upgrades dropped metadata warnings into a failure.

`scripts/sync-ecc-to-codex.sh` runs this converter before copying `.codex/agents/*.toml` into `~/.codex/agents`, so the supported sync path always starts from `agents/*.md`.

## Generated vs Manual

Generated:

- `.codex/agents/<markdown-agent>.toml`
- matching `[agents.<role>]` sections appended to `.codex/config.toml` when missing

Hand-maintained:

- existing sample roles such as `.codex/agents/explorer.toml`, `.codex/agents/reviewer.toml`, and `.codex/agents/docs-researcher.toml`
- any pre-existing `[agents.<name>]` config entries with custom `description` or `config_file` values

The converter is add-only for config wiring. It will not overwrite an existing `[agents.<name>]` description or `config_file`.

## Mapping Contract

The converter emits the required custom-agent fields plus a conservative subset of optional fields that ECC can derive reliably:

- `name`
- `description`
- `developer_instructions`
- `nickname_candidates`
- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills.config`

### `model`

- Uses a frontmatter model only when it already looks like a stable Codex/OpenAI model id.
- Maps known Claude model aliases to Codex model ids:
  - `opus` -> `gpt-5.5`
  - `sonnet` -> `gpt-5.4`
  - `haiku` -> `gpt-5.4-mini`
- Unknown harness-specific values are dropped with a warning.
- Default: `gpt-5.4`

### `model_reasoning_effort`

- Uses frontmatter only for supported values: `low`, `medium`, `high`, `xhigh`
- Otherwise defaults by role intent:
  - reviewer and security-heavy roles: `high`
  - explorer, docs, and research roles: `medium`
  - fallback: `medium`

### `sandbox_mode`

- Uses frontmatter only for `read-only` or `workspace-write`
- Otherwise infers conservatively from explicit tool ownership:
  - roles with `Write` or `Edit` tools become `workspace-write`
  - read/search-only roles stay `read-only`
  - fallback: `read-only`

### `developer_instructions`

- Built from the markdown body, not from raw frontmatter
- Preserves markdown structure, including headings, lists, tables, fenced code blocks, inline code spans, and output format templates
- Removes only targeted harness-specific clutter that would confuse Codex

Dropped content includes:

- targeted Claude-only operational references
- slash-command invocation lines
- hook mechanics that are not portable to Codex
- plugin install instructions
- decorative metadata such as `color`

### `name`

- Always generated because Codex requires it for custom agent files.
- Defaults to the markdown agent name normalized to underscore form so it matches `[agents.<name>]` sections in `.codex/config.toml`.

### `description`

- Always generated because Codex requires it for custom agent files.
- Uses frontmatter `description` when present.
- Falls back to the first sentence of the markdown body when description is missing.

### `nickname_candidates`

- Generated only when source frontmatter includes a non-empty unique string array.
- Values must stay within the Codex custom-agent nickname rules: ASCII letters, digits, spaces, hyphens, and underscores.

### `mcp_servers`

- Generated when the markdown agent’s declared tool list references MCP tools such as `mcp__context7__query-docs`.
- Server names are resolved from the MCP tool prefix and copied from the selected Codex config, typically `.codex/config.toml`.
- If an agent references an MCP server that is not present in the selected config, the converter warns and omits that server block.

### `skills.config`

- Generated when the markdown body explicitly references ECC Codex skills, for example `skill: \`security-review\`` or `skills/documentation-lookup`.
- Resolved skills are emitted as `[[skills.config]]` entries that point at `.agents/skills/<skill>/SKILL.md`.
- Only skills present in `.agents/skills/` are included. Missing skill references warn and are skipped.

## Config Wiring

When `--wire-config` is enabled:

- `[agents]` is created if missing
- existing `max_threads` and `max_depth` are preserved
- missing `max_threads` defaults to `6`
- missing `max_depth` defaults to `1`
- each converted role gets a missing `[agents.<role>]` section with:
  - `description`
  - `config_file = "agents/<slug>.toml"`

Descriptions come from frontmatter `description` when present. If missing, the converter uses the first sentence from the markdown body.

## Why This Is Conservative

Official Codex docs publicly confirm `config.toml`, project-scoped custom agent files, and the required custom-agent fields plus optional fields such as `nickname_candidates`, `mcp_servers`, and `skills.config`. ECC still keeps generation conservative where the docs stop short of prescribing adapter-specific defaults.

That is why this converter is intentionally lossy:

- Claude/Gemini/OpenCode-specific metadata does not round-trip
- unsupported frontmatter is warned and dropped
- generated defaults follow the repo baseline instead of auto-chasing newer model aliases
- skill references only resolve when a Codex-loadable skill exists under `.agents/skills/`

## Review Expectations

Human review is still needed when:

- a markdown agent mixes portable behavior with harness-specific operational detail
- a role should remain hand-maintained instead of generated
- a new Codex role field is introduced and ECC wants to adopt it deliberately

If you see unsupported metadata warnings during conversion, treat them as a prompt to confirm that the dropped field really should not participate in the Codex adapter.
