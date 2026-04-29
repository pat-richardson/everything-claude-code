---
name: icm-workspace
description: Scaffold and configure ICM workspaces with five-layer context hierarchy for focused AI workflows. Use when setting up project folder structures, creating CLAUDE.md and CONTEXT.md files, or organizing any repeatable workflow.
origin: ECC
---

# Interpretable Context Methodology (ICM) Workspace

ICM replaces code-based agent orchestration with a filesystem. Numbered folders represent stages, markdown files carry prompts and context, and the folder hierarchy is the coordination logic. For sequential, human-reviewed workflows, the filesystem already solves the orchestration problem.

## Five Design Principles

1. **One stage, one job** — each folder does exactly one thing
2. **Plain text as the interface** — markdown files are the coordination layer
3. **Layered context loading** — prevent the "lost in the middle" problem, don't compress it
4. **Every output is an edit surface** — review and modify between stages
5. **Configure the factory, not the product** — fix source files, not output files

---

## When to Activate

- Setting up a new project workspace or folder structure
- Restructuring an existing project for AI-assisted workflows
- User asks about folder organization, context files, or workspace layout
- User references ICM, context methodology, or five-layer hierarchy
- User wants to create CLAUDE.md and CONTEXT.md files for a project
- User is building a repeatable pipeline (content, code, research, client work)
- User has context window problems (model forgetting instructions, losing focus)

---

## Core Concepts

### The Five-Layer Context Hierarchy

This is the architectural heart of ICM. Each layer scopes what the model sees at any given moment.

| Layer | File(s) | Token Budget | Role |
|-------|---------|--------------|------|
| 0 | `CLAUDE.md` | ~800 | Workspace identity and routing table |
| 1 | Root `CONTEXT.md` | ~300 | Task routing across stages |
| 2 | Stage `CONTEXT.md` | ~200-500 each | Stage contract: Inputs/Process/Outputs/Verify |
| 3 | `references/`, `_config/` | varies | Stable reference material — "the factory" |
| 4 | `output/` | varies | Per-run working artifacts — "the product" |

**Context efficiency:** Each stage receives 2,000-8,000 focused tokens versus ~42,000 for a monolithic approach. This prevents the "lost in the middle" degradation where models lose track of relevant information buried in large contexts.

### Factory vs Product (Layer 3 vs Layer 4)

This is the most consequential distinction in ICM.

**Layer 3 — The Factory** (`references/`, `_config/`):
Stable material that does not change per-run. Voice guides, design systems, conventions, examples. These are internalized as constraints. They shape every run identically.

**Layer 4 — The Product** (`output/`):
Working artifacts that change every run. Output of stage N becomes input of stage N+1. These are processed as input, not constraints.

**Why it matters:** Mixing factory and product in the same context forces the model to sort them itself. It cannot reliably distinguish "this is how you should always write" from "this is what the last stage produced." Separating them eliminates this ambiguity.

### Stage Contracts

Every stage `CONTEXT.md` follows a contract format with four sections:

- **Inputs** — explicit table of which files and which sections to read
- **Process** — numbered steps describing what the agent does
- **Outputs** — exact file names, formats, and token ranges produced
- **Verify** — cross-stage consistency checks to catch drift

The Inputs table is the real control surface. It declares exactly what context the model loads — no more, no less. This makes context scoping editable and auditable rather than hidden in code.

### One Fact, One Location

Every piece of information lives in exactly one file. If your voice guidelines appear in both `_config/voice.md` and inside a stage `CONTEXT.md`, they will drift apart. When they contradict each other, the model picks one — and you cannot predict which. Deduplicate by putting the fact in one file and pointing to it from everywhere else via the Inputs table.

### New Sessions Start Clean

Every new conversation begins by reading `CLAUDE.md` fresh. The model has no memory of the previous session's discoveries, decisions, or context it loaded. This is a feature, not a limitation: it means `CLAUDE.md` and your routing table are the single source of truth for every session. If something matters across sessions, it must be in the files — not in conversational history.

---

## Archetype Selection

Choose the archetype closest to your workflow. Each workspace should represent a different mental mode — if you shift how you think between two types of tasks, those are two workspaces.

```
What is the primary workflow?
│
├── Building software?
│   └── CODE PROJECT
│       planning/, src/, docs/, ops/
│
├── Creating content (writing, video, audio)?
│   └── CONTENT PIPELINE
│       script-lab/, production/, distribution/
│
├── Managing multiple clients or engagements?
│   └── CLIENT MANAGEMENT
│       clients/{name}/, templates/, business-dev/
│
├── Research, writing papers, long-form analysis?
│   └── RESEARCH
│       sources/, analysis/, writing/, admin/
│
└── Business operations (non-technical)?
    └── SMALL BUSINESS
        communications/, planning/, clients/, resources/
```

### Directory Structures by Archetype

**Code Project:**

```
my-app/
├── CLAUDE.md
├── CONTEXT.md
├── _config/
│   ├── conventions.md
│   └── workspace.md
├── planning/
│   ├── CONTEXT.md
│   ├── specs/
│   ├── architecture/
│   └── decisions/
├── src/
│   ├── CONTEXT.md
│   └── [application code]
├── docs/
│   ├── CONTEXT.md
│   ├── api/
│   └── guides/
└── ops/
    ├── CONTEXT.md
    ├── deploy/
    └── monitoring/
```

**Content Pipeline** (start with 3 stages; add `research/` only when research becomes its own workflow):

```
my-content/
├── CLAUDE.md
├── CONTEXT.md
├── _config/
│   ├── voice.md
│   └── formats.md
├── script-lab/
│   ├── CONTEXT.md
│   ├── drafts/
│   └── output/
├── production/
│   ├── CONTEXT.md
│   ├── specs/
│   └── output/
└── distribution/
    ├── CONTEXT.md
    └── output/
```

**Client Management:**

```
my-practice/
├── CLAUDE.md
├── CONTEXT.md
├── _config/
│   └── engagement-process.md
├── clients/
│   ├── alpha/
│   │   ├── CONTEXT.md
│   │   ├── intake/
│   │   ├── deliverables/
│   │   └── communications/
│   └── beta/
│       ├── CONTEXT.md
│       └── [same structure]
├── templates/
│   ├── CONTEXT.md
│   ├── proposals/
│   └── reports/
└── business-dev/
    ├── CONTEXT.md
    ├── pipeline/
    └── case-studies/
```

**Research:**

```
my-research/
├── CLAUDE.md
├── CONTEXT.md
├── _config/
│   ├── citation-style.md
│   └── methodology.md
├── sources/
│   ├── CONTEXT.md
│   ├── papers/
│   └── notes/
├── analysis/
│   ├── CONTEXT.md
│   ├── themes/
│   └── outlines/
├── writing/
│   ├── CONTEXT.md
│   ├── drafts/
│   └── output/
└── admin/
    ├── CONTEXT.md
    └── submissions/
```

**Small Business:**

```
my-business/
├── CLAUDE.md
├── CONTEXT.md
├── _config/
│   ├── brand-voice.md
│   └── sops.md
├── communications/
│   ├── CONTEXT.md
│   ├── emails/
│   └── social/
├── planning/
│   ├── CONTEXT.md
│   ├── strategy/
│   └── decisions/
├── clients/
│   ├── CONTEXT.md
│   └── [per-client folders]
└── resources/
    ├── CONTEXT.md
    └── templates/
```

---

## Phased Workflow

Follow these phases in order. Each phase builds on the previous one.

### Phase 1: Gather Requirements

Ask the user:

1. **Project name** — what is this workspace called?
2. **Archetype** — which of the five archetypes fits? (present the decision tree)
3. **Stages** — what are the 2-4 workspaces? (suggest archetype defaults, let user customize)
4. **Voice/style** — does this project have a brand voice, writing style, or conventions?
5. **Target directory** — where should the workspace be created?

Start with 2-3 workspaces. Add more only when a type of work proves it needs its own context.

**Smallest version test:** If the user is new to ICM or unsure, suggest starting with just two folders — each with its own `CLAUDE.md` — to prove that separate context scoping works before committing to the full architecture. They can expand to the full five-layer hierarchy once they've experienced the benefit.

### Phase 2: Scaffold Directories

Create the directory structure based on the chosen archetype:

```bash
mkdir -p "$TARGET"/{_config,shared}
for stage in "${STAGES[@]}"; do
  mkdir -p "$TARGET/$stage"/{references,output}
done
```

Each stage directory gets: `CONTEXT.md`, `references/` (stage-specific Layer 3), `output/` (Layer 4).

### Phase 3: Generate Layer 0 (CLAUDE.md)

Write `CLAUDE.md` at the workspace root. Keep it under one screen (~800 tokens). Must include:

- Project identity (1-3 sentences)
- Workspaces list
- Routing table
- Naming conventions
- Rules and constraints

Use the Layer 0 template below. Fill in from user responses in Phase 1.

### Phase 4: Generate Layer 1 (Root CONTEXT.md)

Write root `CONTEXT.md`. Keep under ~300 tokens. Must include:

- Execution flow table (stage, input source, output destination, review gate)
- Handoff point specifications between stages
- Rules for stage transitions

### Phase 5: Generate Layer 2 (Stage CONTEXT.md Files)

For each stage, write a `CONTEXT.md` with the contract format:

- **Inputs table** — Source, File, Sections, Purpose columns
- **Process** — numbered steps
- **Outputs** — file names, format, token range
- **Verify** — cross-stage consistency checks

Keep each under ~500 tokens. The Inputs table must be explicit — name exact files and sections, never "everything relevant."

### Phase 6: Generate Layer 3 (Factory Files)

Create `_config/` files at the workspace root:

- `voice.md` or `conventions.md` — tone, style, phrases (if applicable)
- `workspace.md` — scope, glossary, assumptions, review gates

These files are immutable per-run. Mark them with a header note: "This is reference material. Edit to change all future runs."

### Phase 7: Initialize Layer 4 (Output Directories)

Create empty `output/` directories in each stage with `.keep` files so Git tracks them:

```bash
for stage in "${STAGES[@]}"; do
  touch "$TARGET/$stage/output/.keep"
done
```

### Phase 8: Verify

Run the verification checklist below. Fix any issues before declaring the workspace ready.

---

## Templates

### Layer 0: CLAUDE.md

```markdown
# [Project Name]

[One sentence: what this project does and who it serves.]

## Workspaces

- /[stage-1] — [What happens here]
- /[stage-2] — [What happens here]
- /[stage-3] — [What happens here]

## Routing

| Task | Go to | Read | Skills |
|------|-------|------|--------|
| [Task type 1] | /[stage-1] | CONTEXT.md | [skill or —] |
| [Task type 2] | /[stage-2] | CONTEXT.md | [skill or —] |
| [Task type 3] | /[stage-3] | CONTEXT.md | [skill or —] |

## Naming Conventions

- [Pattern]: [example]
- [Pattern]: [example]

## Rules

- Read this file first on every new task.
- Do not create files outside the current workspace unless explicitly asked.
- [Project-specific rules]

## Current State

- [What is working, in progress, or broken]
```

### Layer 1: Root CONTEXT.md

```markdown
# Workspace Routing

## Execution Flow

| Stage | Input Source | Output Destination | Review Gate |
|-------|-------------|-------------------|-------------|
| [stage-1] | [starting inputs] | [stage-1]/output/ | [who reviews] |
| [stage-2] | [stage-1]/output/ | [stage-2]/output/ | [who reviews] |
| [stage-3] | [stage-2]/output/ | [stage-3]/output/ | [who reviews] |

## Handoff Rules

- Output of stage N becomes input of stage N+1
- Review and edit output before passing to next stage
- Never skip a review gate
- If you edit output repeatedly across runs, edit the source (_config/) instead
```

### Layer 2: Stage CONTEXT.md

```markdown
# [Stage Name]

[One sentence: what this stage does.]

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Phrases | Style constraints |
| Layer 3 | references/[file].md | [Specific sections] | [Why needed] |
| Layer 4 | ../[prev-stage]/output/[file].md | [Specific sections] | Prior stage output |

## Process

1. Read all Inputs in the order listed above
2. [Specific step for this stage]
3. [Specific step for this stage]
4. [Specific step for this stage]
5. Write outputs to output/ directory

## Outputs

- **output/[deliverable].md** — [format description, ~token range]
- **output/[notes].md** — [what this captures]

## Verify

- [ ] [Cross-stage check: output matches prior stage decisions]
- [ ] [Constraint check: output respects Layer 3 guidelines]
- [ ] [Completeness check: all required sections present]
```

### Layer 3: _config/voice.md

```markdown
# Voice and Style

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Tone

- **Formality:** [Formal / Conversational / Technical]
- **Audience:** [Who and what they know]
- **Personality:** [Authoritative / Friendly / Dry / etc.]

## Phrases

- Use: [preferred phrases]
- Avoid: [phrases to never use]

## Grammar

- Oxford comma: [YES/NO]
- Contractions: [YES/NO]
- Abbreviations: Spell out first use, then abbreviate
```

### Layer 3: _config/workspace.md

```markdown
# Workspace Constraints

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Scope

- **In scope:** [What this workspace covers]
- **Out of scope:** [What it deliberately excludes]

## Glossary

- **[Term]:** [Definition]
- **[Term]:** [Definition]

## Review Gates

| Stage Transition | Reviewer | What to Check |
|-----------------|----------|---------------|
| [stage-1] to [stage-2] | [Who] | [What] |
| [stage-2] to [stage-3] | [Who] | [What] |
```

### Archetype-Specific Routing Tables

**Code Project:**

| Task | Go to | Read | Skills |
|------|-------|------|--------|
| Spec a feature | /planning | CONTEXT.md | -- |
| Write code | /src | CONTEXT.md | testing |
| Write docs | /docs | CONTEXT.md | doc-authoring |
| Deploy or debug | /ops | CONTEXT.md | -- |

**Content Pipeline:**

| Task | Go to | Read | Skills |
|------|-------|------|--------|
| Write or brainstorm | /script-lab | CONTEXT.md | humanizer |
| Build assets | /production | CONTEXT.md | remotion |
| Publish | /distribution | CONTEXT.md | -- |

**Client Management:**

| Task | Go to | Read | Skills |
|------|-------|------|--------|
| Client work | /clients/[name] | CONTEXT.md | -- |
| New proposal | /templates then /clients/[name] | Both CONTEXT.md | -- |
| Business development | /business-dev | CONTEXT.md | -- |

---

## Anti-Patterns

### FAIL: Mixing Layer 3 and Layer 4

```
_config/
├── voice.md              (reference - correct)
├── last-run-script.md    (output - WRONG LOCATION)
└── draft-findings.md     (output - WRONG LOCATION)
```

Working artifacts in `_config/` contaminate the factory. The model cannot distinguish constraints from prior output.

**Fix:** Outputs go in `[stage]/output/` only. References go in `_config/` or `references/` only.

### FAIL: Vague Inputs Table

```markdown
| Source | File | Sections |
|--------|------|----------|
| Layer 3 | _config/ | Everything relevant |
| Layer 4 | ../research/ | The findings |
```

"Everything relevant" forces the model to guess. "The findings" is ambiguous.

**Fix:** Name exact files and sections:

```markdown
| Source | File | Sections |
|--------|------|----------|
| Layer 3 | _config/voice.md | Tone, Phrases |
| Layer 4 | ../research/output/findings.md | "Key Findings" section |
```

### FAIL: CLAUDE.md Longer Than One Screen

If your CLAUDE.md exceeds ~800 tokens, context files are hiding inside it. Pull detailed instructions into stage `CONTEXT.md` files and `_config/` references. CLAUDE.md is a routing table, not a manual.

### FAIL: No Routing Table

Without it, the model either reads everything (wasting tokens) or guesses which files matter (getting it wrong). The routing table eliminates both problems.

### FAIL: Missing Verify Section

Stage 3 drifts from stage 1 decisions. Nobody notices until the final output. Add explicit Verify checks to every stage contract: "Confirm output matches [specific prior stage decision]."

### FAIL: Editing Output Instead of Source

If you fix the same issue in output files every run — tightening tone, reformatting sections, correcting terminology — the problem is in your Layer 3 files, not the output.

**Fix:** After the third identical output edit, update `_config/voice.md` or the stage `CONTEXT.md` instead. Fix the factory, not the product.

### FAIL: Too Many Workspaces at Start

Start with 2-3 workspaces. Add more only when a type of work proves it needs its own context. Your first version should take 15 minutes, not an afternoon.

### FAIL: Context Describes AI, Not Work

```markdown
## Rules
- You are a helpful assistant that writes in a professional tone
- Always be thorough and check your work
- Think step by step before responding
```

This describes the AI's personality, not the project's work. Context files are not system prompts.

**Fix:** 80% of your context should describe the work — what the project does, what files go where, what quality looks like. 20% at most should describe behavioral instructions.

### FAIL: Context Files Never Updated

Context files are living documents, not one-time setup artifacts. When the project changes — new stages, renamed files, shifted priorities — the context files must change too.

**Fix:** Add a `Last updated: YYYY-MM-DD` line to `_config/workspace.md`. When you notice instructions that no longer match reality, update them immediately. Stale context actively misleads the model.

---

## Verification Checklist

### Directory Structure

- [ ] Root directory has `CLAUDE.md` and `CONTEXT.md`
- [ ] `_config/` directory exists at root with at least one reference file
- [ ] Each stage has its own `CONTEXT.md`
- [ ] Each stage has a `references/` directory (may be empty)
- [ ] Each stage has an `output/` directory with `.keep` file

### Token Budgets

- [ ] `CLAUDE.md` is under ~800 tokens (roughly one screen)
- [ ] Root `CONTEXT.md` is under ~300 tokens
- [ ] Each stage `CONTEXT.md` is under ~500 tokens
- [ ] No single stage loads more than ~8,000 tokens total (Inputs + Process + Outputs)

### Stage Contracts

- [ ] Every stage `CONTEXT.md` has an **Inputs** table with Source, File, Sections columns
- [ ] Every stage `CONTEXT.md` has a **Process** section with numbered steps
- [ ] Every stage `CONTEXT.md` has an **Outputs** section with file names and formats
- [ ] Every stage `CONTEXT.md` has a **Verify** section with cross-stage checks
- [ ] No Inputs table contains vague references ("everything," "as needed," "relevant files")

### Layer Separation

- [ ] `_config/` and `references/` contain only stable reference material (Layer 3)
- [ ] `output/` directories contain only working artifacts (Layer 4)
- [ ] No working artifacts in reference directories
- [ ] No reference material in output directories

### Routing and Navigation

- [ ] `CLAUDE.md` has a routing table covering all task types
- [ ] Every workspace listed in the routing table has a corresponding directory
- [ ] Every directory with a `CONTEXT.md` is listed in the routing table
- [ ] Naming conventions are documented in `CLAUDE.md`

### Portability

- [ ] Workspace can be copied to another machine and used immediately
- [ ] No absolute paths in any context file
- [ ] Git-compatible (`.keep` files in empty directories)

---

## Integration with ECC

### Workspace Surface Audit

After creating an ICM workspace, run `workspace-surface-audit` to verify the setup. The audit will check file existence, validate structure, and flag gaps.

### Git Workflow

ICM pairs with stage-based commits. After completing each stage:

1. Review and edit the stage output
2. Commit with a message referencing the stage: `feat(stage-02): complete script draft`
3. Move to the next stage

### Multi-Workspace Repos

For repositories containing multiple ICM workspaces:

```
my-repo/
├── CLAUDE.md                    (repo-level routing)
├── workspace-content/
│   ├── CLAUDE.md                (ICM workspace 1)
│   ├── CONTEXT.md
│   └── [stages...]
└── workspace-code/
    ├── CLAUDE.md                (ICM workspace 2)
    ├── CONTEXT.md
    └── [stages...]
```

The repo-level `CLAUDE.md` routes to the correct workspace. Each workspace is self-contained with its own five-layer hierarchy.

### Existing Workflow Starters

The clief-notes Vault contains production-ready templates for common archetypes. Use them as starting points and customize:

- Code project workflow starter
- Content pipeline workflow starter
- Client management workflow starter

---

## Related Skills

- `workspace-surface-audit` — verify workspace configuration
- `git-workflow` — stage-based commit conventions
- `coding-standards` — Layer 3 reference material for code projects
