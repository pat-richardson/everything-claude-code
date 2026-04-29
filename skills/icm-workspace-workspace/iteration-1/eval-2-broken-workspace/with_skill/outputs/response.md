# Fixing Your Workspace: Diagnosing the Mess and Restructuring for AI-Assisted Workflows

You're describing three classic workspace anti-patterns that compounds into one problem: **Claude keeps losing context because your workspace structure forces the model to sort constraints from working artifacts, and it can't reliably distinguish them anymore.**

Let me diagnose what's happening, explain why it breaks, and then show you a concrete restructuring plan.

---

## What's Actually Breaking

### Anti-Pattern 1: CLAUDE.md As a Manual, Not a Routing Table

When CLAUDE.md exceeds one screen (roughly 800 tokens), it stops being a routing table and becomes a manual. This does three bad things:

1. **Token bloat on every task** — Claude loads 3 pages of rules, conventions, and examples on every conversation, leaving fewer tokens for actual work
2. **Context loss after message 2-3** — The model loses track of specific instructions buried in the middle of a 2000-token file
3. **No clear routing** — Without a compact routing table, Claude either reads everything (wasting tokens) or guesses which sections matter (getting it wrong)

**Why it causes "forgetting":** Your instructions are competing with working artifacts for space in context. By message 3, the original CLAUDE.md is pushed out of the window.

### Anti-Pattern 2: Mixing Reference Material with Draft Outputs

When you store draft outputs, reference templates, and active work in the same directories, Claude cannot reliably distinguish:
- "This is how I should always write" (factory/constraints)
- "This is what I produced last run" (product/working artifact)

Example of the mess:
```
_config/
├── voice.md              (reference - correct)
├── last-run-script.md    (output - WRONG)
└── draft-findings.md     (output - WRONG)
```

**Why it breaks:** Each stage starts with higher context overhead as it tries to sort what is canonical vs. what is scratch. By stage 3, the model has internalized the wrong set of constraints from your prior outputs and ignores the actual rules.

### Anti-Pattern 3: No Explicit Routing Between Contexts

Without a routing table, each conversation forces Claude to:
1. Guess which files are relevant to this task
2. Load everything "just to be safe"
3. Forget earlier instructions when the context is full

Result: After message 2-3, Claude is working from assumptions, not your documented intentions.

---

## How ICM Fixes This: The Five-Layer Hierarchy

The Interpretable Context Methodology (ICM) separates your workspace into five layers, each with a specific purpose and token budget. This prevents the "lost in the middle" problem by making context scoping editable and auditable.

| Layer | File(s) | Token Budget | Role | The Problem It Solves |
|-------|---------|--------------|------|----------------------|
| 0 | `CLAUDE.md` | ~800 | Workspace identity and routing table | "Where do I go?" and "What are the rules?" |
| 1 | Root `CONTEXT.md` | ~300 | Task routing across stages | "How do the stages connect?" |
| 2 | Stage `CONTEXT.md` | ~200-500 each | Stage contract: what goes in, what comes out | "What do I do right now?" |
| 3 | `references/`, `_config/` | varies | Stable reference material (the factory) | "How should I always do this?" |
| 4 | `output/` | varies | Per-run working artifacts (the product) | "What did the last stage produce?" |

**Context efficiency:** Each stage receives 2,000-8,000 focused tokens versus ~42,000 for your current monolithic approach. The model stays in focus for longer.

**The critical distinction:** Layer 3 (the factory) contains immutable constraints and guides. Layer 4 (the product) contains working artifacts that change every run. By separating them completely, Claude no longer has to guess which files are canonical.

---

## Your Before-and-After Restructuring

### BEFORE: Current Mess

```
my-project/
├── CLAUDE.md                    (3+ pages of rules, examples, conventions, task descriptions)
├── notes.md                     (where did this come from? reference or draft?)
├── draft-findings.md            (output from 2 weeks ago)
├── templates/                   (reference material? or past outputs?)
│   └── proposal-draft.md
└── docs/                        (organizing by topic, not by stage)
    ├── architecture.md
    ├── decisions.md
    └── examples.md
```

**Problems:**
- No routing — Claude doesn't know where to look
- No stage boundaries — work gets mixed across contexts
- Mixed layers — can't tell reference from artifact
- Token overhead — CLAUDE.md loads on every task

### AFTER: ICM Structure

```
my-project/
├── CLAUDE.md                    (compact routing table, ~800 tokens)
├── CONTEXT.md                   (execution flow, ~300 tokens)
├── _config/                     (Layer 3 — the factory, immutable reference)
│   ├── conventions.md           ("How we always write, structure, and decide")
│   └── workspace.md             (scope, glossary, review gates)
│
├── planning/                    (Stage 1: spec and design)
│   ├── CONTEXT.md               (what planning does, inputs/outputs)
│   ├── references/              (decision frameworks, templates)
│   └── output/                  (active specs, design docs)
│       ├── .keep
│       └── [stage outputs after review]
│
├── research/                    (Stage 2: gather and analyze)
│   ├── CONTEXT.md
│   ├── references/              (methodology, citation style)
│   └── output/
│       ├── .keep
│       └── [findings, outlines]
│
└── writing/                     (Stage 3: draft and refine)
    ├── CONTEXT.md
    ├── references/              (voice guide, style examples)
    └── output/
        ├── .keep
        └── [final drafts]
```

**Benefits:**
- Routing is explicit in `CLAUDE.md` — Clara knows where to go
- Each stage has its own context contract — focused work
- Layers are separated — reference ≠ artifact
- Token-efficient — each stage loads only what it needs

---

## Step-by-Step Restructuring Plan

### Phase 1: Gather What You Have (15 min)

List your current situation:

1. **What types of work happen in this project?**
   - Planning / design / specs?
   - Research / analysis?
   - Writing / content creation?
   - Code development?
   - Reviewing / feedback?
   - Other?

2. **How many distinct mental contexts do you shift between?**
   - Each mental shift = one stage

3. **What conventions, voice, or style guides exist?**
   - Do you have a writing style you want to maintain?
   - Are there naming patterns, decision frameworks, or design principles?

4. **What files are references (immutable) vs. artifacts (per-run)?**
   - References: templates, methodology, voice guides, architectural principles
   - Artifacts: drafts, outputs, notes from prior runs, findings

### Phase 2: Choose Your Archetype (5 min)

Which category fits your project best?

- **Code Project** — Planning, implementation, docs, deployment
- **Content Pipeline** — Research, scriptwriting, production, distribution
- **Research** — Literature review, analysis, writing, admin
- **Client Management** — Per-client work, proposals, deliverables
- **Small Business** — Communications, planning, clients, resources

*(Most projects are Code or Content. Start there.)*

### Phase 3: Create the Directory Structure (10 min)

For a **Code Project** with stages: `planning/`, `src/`, `docs/`, `ops/`

```bash
# Create the structure
mkdir -p my-project/{_config,planning,src,docs,ops}

# For each stage
for stage in planning src docs ops; do
  mkdir -p my-project/$stage/{references,output}
  touch my-project/$stage/output/.keep
done
```

### Phase 4: Write Layer 0 — CLAUDE.md (10 min)

Keep it under one screen. This is a routing table, not a manual.

```markdown
# My Project

[One sentence: what this project does.]

## Stages

- `/planning` — Spec features and design
- `/src` — Write and review code
- `/docs` — Write and maintain documentation
- `/ops` — Deploy and monitor

## Routing

| Task | Go to | Read | Notes |
|------|-------|------|-------|
| Spec a new feature | /planning | CONTEXT.md | Design first |
| Write code | /src | CONTEXT.md | Follow code style from _config/ |
| Update docs | /docs | CONTEXT.md | Match voice in _config/ |
| Deploy | /ops | CONTEXT.md | Run verification checks |

## Naming Conventions

- Files: kebab-case (my-feature.md)
- Branches: feat/my-feature
- Commits: conventional (feat: add X, fix: resolve Y)

## Rules

- Read CLAUDE.md first on every new task
- Do not create files outside your current stage unless explicitly asked
- Output of stage N becomes input of stage N+1
- If you edit the same output repeatedly, edit _config/ instead
- Review all output before moving to the next stage

## Current State

- Planning: Complete
- Src: In progress (50%)
- Docs: Not started
- Ops: Not started
```

### Phase 5: Write Layer 1 — Root CONTEXT.md (5 min)

This shows how stages connect.

```markdown
# Workspace Routing and Execution Flow

## How Work Flows Through Stages

| Stage | Input Source | Output Destination | Review Gate |
|-------|-------------|-------------------|-------------|
| Planning | Initial requirements | /planning/output/ | You review before handoff |
| Src | /planning/output/ specs | /src/output/ | Code review before docs |
| Docs | /src/output/ code + /planning/output/ specs | /docs/output/ | You review before ops |
| Ops | /docs/output/ deployment docs | /ops/output/ | You verify deployment |

## Handoff Rules

- **Never skip a review gate.** Edit output before passing to the next stage.
- **Edit the factory, not the product.** If you fix the same thing in output files repeatedly, the problem is in `_config/` or the stage `CONTEXT.md`.
- **Stage context is focused.** Each stage loads only the inputs it needs — see the stage CONTEXT.md for the exact list.
- **Output becomes input.** The output of stage N is the specified input for stage N+1.
```

### Phase 6: Write Layer 2 — Stage CONTEXT.md Files (20 min)

Write one for each stage. Here's an example for `/src` (code writing):

```markdown
# Code Implementation

Write production code that follows conventions and passes tests.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | Code Style, Testing | Style constraints |
| Layer 3 | _config/workspace.md | Glossary, Architecture | Context and naming |
| Layer 4 | ../planning/output/feature-spec.md | Requirements, Acceptance Criteria | What to build |

## Process

1. Read the Inputs table above in order
2. Review the feature spec and acceptance criteria
3. Write code that satisfies the spec and follows the style guide
4. Write tests for every public function
5. Run the test suite and verify all tests pass
6. Save code to output/ directory

## Outputs

- **output/[feature-name].js** — Production code (~500-2000 tokens depending on complexity)
- **output/[feature-name].test.js** — Test file with 80%+ coverage

## Verify

- [ ] Code follows conventions from _config/conventions.md
- [ ] All tests pass
- [ ] Feature satisfies spec from ../planning/output/feature-spec.md
- [ ] Output is ready for documentation
```

Do this for each of your stages. Keep each under ~500 tokens.

### Phase 7: Write Layer 3 — _config/ Files (15 min)

These are the constraints that never change (until you intentionally edit them).

**_config/conventions.md:**

```markdown
# Coding Conventions

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Code Style

- Language: JavaScript / Python / [your language]
- Formatter: [prettier / black / etc.]
- Linter: [eslint / flake8 / etc.]
- Indentation: 2 spaces (no tabs)

## Naming

- Variables and functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Classes: PascalCase
- Files: kebab-case

## Testing

- Test framework: Jest / pytest / [your choice]
- Minimum coverage: 80%
- Test files: `[feature].test.js` in same directory as source
- Naming: `describe()` blocks for modules, `it()` for specific tests
```

**_config/workspace.md:**

```markdown
# Workspace Constraints

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Scope

- **In scope:** [Features, systems, responsibilities]
- **Out of scope:** [What this project deliberately does not cover]

## Glossary

- **API**: The public interface all clients use
- **Service**: A deployable unit that may implement multiple API methods
- **[Term]**: [Definition]

## Architecture Decisions

- Monorepo: [Yes/No] and why
- Database: [Type and rationale]
- [Key decision]: [Rationale and constraints]

## Review Gates

| Stage Transition | Reviewer | What to Check |
|-----------------|----------|---------------|
| Planning to Src | You | Spec is complete and testable |
| Src to Docs | Code review | Tests pass, code follows conventions |
| Docs to Ops | You | Docs are clear and match implementation |
```

### Phase 8: Verify Your Structure (10 min)

Run through the verification checklist:

**Directory Structure**
- [ ] Root has `CLAUDE.md` and `CONTEXT.md`
- [ ] `_config/` exists with at least 2 reference files
- [ ] Each stage has a `CONTEXT.md`, `references/`, and `output/` directory
- [ ] Each `output/` has a `.keep` file

**Token Budgets**
- [ ] CLAUDE.md is under ~800 tokens (one screen)
- [ ] Root CONTEXT.md is under ~300 tokens
- [ ] Each stage CONTEXT.md is under ~500 tokens

**Stage Contracts**
- [ ] Every stage CONTEXT.md has an **Inputs** table with exact files and sections
- [ ] Every stage CONTEXT.md has a **Process** section with numbered steps
- [ ] Every stage CONTEXT.md has an **Outputs** section with file names and formats
- [ ] Every stage CONTEXT.md has a **Verify** section with cross-stage checks
- [ ] No Inputs table contains vague language ("everything," "as needed," "relevant files")

**Layer Separation**
- [ ] `_config/` and `references/` contain only reference material (never outputs)
- [ ] `output/` directories contain only working artifacts (never templates)
- [ ] No mixing of factory (Layer 3) and product (Layer 4)

**Routing and Navigation**
- [ ] CLAUDE.md has a routing table covering all task types
- [ ] Every workspace in the routing table has a corresponding directory
- [ ] Every directory has a `CONTEXT.md` and appears in routing

---

## Why This Fixes Your Problem

### Problem: "CLAUDE keeps forgetting what I told it"

**Root cause:** You're asking Claude to load a 3-page manual on every task, then carry context through 3-5 messages while competing with other information.

**ICM solution:** Each stage loads a focused ~500-token contract. Claude stays in focus because context is scoped by design, not by luck. By stage 3, it's still remembering what stage 1 decided because the stage `CONTEXT.md` files explicitly reference prior outputs.

### Problem: "Reference docs mixed with draft outputs"

**Root cause:** Claude can't tell which files are "how I should always do this" vs. "this is what I made last time." It internalized wrong constraints.

**ICM solution:** Layer 3 (`_config/`, `references/`) is strictly immutable reference material. Layer 4 (`output/`) is strictly working artifacts. The separation is filesystem-enforced, not honor-based.

### Problem: "My workspace is a mess"

**Root cause:** No structure = no coordination. Each new conversation, Claude starts fresh and guesses what matters.

**ICM solution:** CLAUDE.md is a routing table. Root CONTEXT.md shows execution flow. Each stage CONTEXT.md is a contract. The entire workspace becomes a self-documenting interface that any model can follow.

---

## Moving Your Existing Files

### What Goes Where

**Files to move to `_config/`:**
- Voice/style guides → `_config/voice.md` or `_config/conventions.md`
- Architecture principles → `_config/workspace.md`
- Design systems → `_config/design-system.md`
- Templates (stable ones) → `_config/templates/` (Layer 3)

**Files to move to `[stage]/references/`:**
- Stage-specific examples → `[stage]/references/examples.md`
- Stage-specific methodology → `[stage]/references/methodology.md`
- Checklists for this stage → `[stage]/references/checklist.md`

**Files to move to `[stage]/output/`:**
- Drafts from recent work → `[stage]/output/draft-[name].md`
- Prior stage outputs → `[stage]/output/[prior-output].md`
- Notes and findings → `[stage]/output/findings.md`

**Files to delete:**
- Anything not explicitly referenced in a CONTEXT.md file
- Old drafts and experiments not belonging to current work
- Redundant templates

---

## Quick Example: Before and After

### BEFORE
```
research-project/
├── CLAUDE.md                  (2000 words of rules)
├── notes.md                   (unclear: reference or draft?)
├── findings.md                (from 2 weeks ago)
├── methodology.md             (reference)
├── template-outline.md        (reference)
├── draft-paper-v1.md          (output)
├── draft-paper-v2.md          (output)
├── draft-paper-v3.md          (output)
└── docs/
    ├── sources.md
    ├── themes.md
    └── decisions.md
```

**What Claude has to figure out on every task:**
- Which files are constraints? (All of them, or just the methodology?)
- Which drafts are the latest? (Am I building on v3 or v1?)
- Is this about writing, analyzing, or planning? (Read CLAUDE.md?)
- Result: By message 3, Claude is guessing.

### AFTER
```
research-project/
├── CLAUDE.md                  (routing table, 500 words)
├── CONTEXT.md                 (execution flow, 200 words)
├── _config/
│   ├── conventions.md         (how to always write, cite, analyze)
│   └── workspace.md           (methodology, glossary, definitions)
│
├── research/
│   ├── CONTEXT.md             (what research stage does)
│   ├── references/            (citation style, templates)
│   └── output/                (findings, notes from THIS run)
│       ├── .keep
│       └── findings.md
│
├── analysis/
│   ├── CONTEXT.md
│   ├── references/            (analysis framework)
│   └── output/                (themes, outlines from THIS run)
│       ├── .keep
│       └── themes.md
│
└── writing/
    ├── CONTEXT.md
    ├── references/            (voice examples, structure templates)
    └── output/                (drafts from THIS run)
        ├── .keep
        └── draft-paper.md
```

**What Claude knows on every task:**
- "I'm in the research stage" (from directory context)
- "Read CONTEXT.md to see what I do here" (explicit)
- "The factory (how I should always work) is in _config/ and references/" (layer-based)
- "The product (what I made last run) is in output/" (layer-based)
- Result: By stage 3, Claude is executing with perfect continuity.

---

## Next Steps

1. **Pick your archetype** — Code, Content, Research, Client, or Small Business
2. **Create the directory structure** — 10 minutes with the bash commands above
3. **Write CLAUDE.md** — Use the template, keep it under one screen
4. **Write root CONTEXT.md** — Show how stages connect
5. **Write stage CONTEXT.md files** — One contract per stage
6. **Move existing files to _config/ and stage references/** — Factory vs. product separation
7. **Run the verification checklist** — Ensure everything is in place
8. **Test with a single stage** — Start a new conversation, read CLAUDE.md, then CONTEXT.md, then the stage CONTEXT.md, and work

After you complete these steps, Claude will stay focused and remember what you told it because the context is scoped by design, not by luck.

---

## One More Thing: If You're Already Partway There

If you've already started breaking work into stages or have some reference material separated:

1. **Don't reorganize everything at once.** Start with one stage.
2. **Write the CLAUDE.md routing table first.** This is your north star.
3. **Move files incrementally.** One layer at a time.
4. **Test after each layer.** Start a conversation, read the files, do one task, check if Claude stayed in focus.

The investment is 1-2 hours total. The payoff is "Claude never forgets again" for the lifetime of the project.
