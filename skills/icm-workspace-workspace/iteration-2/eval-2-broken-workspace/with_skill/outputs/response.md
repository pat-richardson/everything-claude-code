# Fixing Your Workspace Organization

I can help you fix all three of those problems. They're symptoms of the same root cause: **you're trying to use a single context file and folder structure for too many different types of work**. When everything is mixed together, Claude loses track, and your CLAUDE.md explodes to page 3.

---

## Your Diagnosis: Three Specific Problems

### Problem 1: Giant CLAUDE.md
Your 3-page CLAUDE.md is trying to describe everything at once — routing for 5 different workflows, conventions for code AND content AND research, and edge cases for each. That's 2,000+ tokens of conflicting context in a single file. Claude's attention scatters.

**Why it happened:** You're putting instructions that should live in separate stage files (Layer 2) into the root routing file (Layer 0). CLAUDE.md should be a one-screen routing table, not a manual.

### Problem 2: Reference Docs Mixed with Draft Outputs
You have research notes living next to output from the last session in the same `references/` folder. Claude can't tell which files are "stable guides" (the factory) and which are "yesterday's working artifacts" (the product). It loads both as constraints.

**Why it happened:** You haven't separated Layer 3 (factory — `_config/`, `references/`) from Layer 4 (product — `output/`). Without this boundary, every session inherits the previous session's mess.

### Problem 3: Claude Loses Track Between Messages
Two messages later, Claude forgets what you told it because all the context lives in conversational history. When you start a new conversation, none of it exists anymore.

**Why it happened:** Critical information isn't stored in files. Each new session reads `CLAUDE.md` fresh and has no memory of what you discussed last time. If it matters, it must be in the files.

---

## The Fix: Interpretable Context Methodology (ICM)

ICM replaces conversational context management with a **five-layer filesystem hierarchy**. Each layer has a specific job:

| Layer | Where | What Goes Here | Token Budget |
|-------|-------|---|---|
| **0** | `CLAUDE.md` | Project identity + routing table only | ~800 tokens |
| **1** | Root `CONTEXT.md` | Task routing across stages (execution flow) | ~300 tokens |
| **2** | `[stage]/CONTEXT.md` | Stage contracts (inputs, process, outputs, verify) | ~500 tokens each |
| **3** | `_config/`, `references/` | Stable reference material (voice, conventions, examples) | varies |
| **4** | `output/` | Working artifacts from this run | varies |

The key principle: **Each piece of information lives in exactly one file**. When you see yourself repeating the same instruction in two places, that's a sign to pull it into Layer 3 and reference it from everywhere else.

---

## Your Restructuring Plan

### Step 1: Identify Your Archetypes (15 minutes)

First, ask yourself: **What are the fundamentally different types of work I do?** 

- Code projects (software, building)
- Content (writing, video, audio)
- Research (papers, analysis, long-form)
- Client work (engagements, deliverables)
- Operations (planning, management)

Do NOT create one massive workspace. Create separate workspaces for each archetype. Each one gets its own `CLAUDE.md` and folder structure.

**Example:** If you do both code development and content writing, you'll have:
```
my-work/
├── coding-projects/
│   ├── CLAUDE.md
│   ├── CONTEXT.md
│   ├── _config/
│   ├── planning/
│   ├── src/
│   └── docs/
└── content-pipeline/
    ├── CLAUDE.md
    ├── CONTEXT.md
    ├── _config/
    ├── script-lab/
    ├── production/
    └── distribution/
```

Each workspace is **self-contained and focused**. Claude loads only the relevant workspace for the task.

### Step 2: Trim CLAUDE.md to One Screen

Your new CLAUDE.md should be under 800 tokens (roughly this long). It answers only five questions:

1. **What is this project?** (1-2 sentences)
2. **What are the stages?** (list with 1-line description each)
3. **How do I route my work?** (routing table: Task → Stage → File to read)
4. **What naming conventions apply?** (file/folder patterns)
5. **What are the non-negotiable rules?** (3-4 critical constraints)

Everything else — detailed instructions, examples, conventions — goes in stage `CONTEXT.md` files or Layer 3 reference files.

**Template for your CLAUDE.md:**

```markdown
# [Project Name]

[One sentence describing what this project does and who it serves.]

## Stages

- /[stage-1] — [What happens here in one sentence]
- /[stage-2] — [What happens here in one sentence]
- /[stage-3] — [What happens here in one sentence]

## Routing

| Task | Go to | Read |
|------|-------|------|
| [Task type 1] | /[stage-1] | CONTEXT.md |
| [Task type 2] | /[stage-2] | CONTEXT.md |
| [Task type 3] | /[stage-3] | CONTEXT.md |

## Naming Conventions

- Files: lowercase-with-hyphens.md
- Folders: stage-name/

## Rules

- Read this file first on every new task.
- Edit source files (_config/), not output files.
- Every stage runs its CONTEXT.md independently.
```

That's it. Move everything else.

### Step 3: Create Layer 2 — Stage Context Files

For each stage, create a `CONTEXT.md` with this structure:

```markdown
# [Stage Name]

[One sentence: what this stage does.]

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Phrases | Style constraints |
| Layer 3 | references/[name].md | [Specific section] | [Why needed] |
| Layer 4 | ../[prev-stage]/output/[file].md | [Section] | Prior stage output |

## Process

1. Read all Inputs in order listed above
2. [Specific step for this stage]
3. [Specific step for this stage]
4. Write to output/ directory

## Outputs

- **output/[deliverable].md** — [format, ~token range]

## Verify

- [ ] Output matches prior stage decisions
- [ ] Output respects Layer 3 guidelines
- [ ] All required sections present
```

This contract is explicit: Claude knows exactly what to read, in what order, and what to produce.

### Step 4: Separate Factory from Product

Create two directories at the root:

**`_config/`** (Layer 3 — The Factory, never changes per-run):
- `voice.md` — Your tone, phrases, grammar rules
- `workspace.md` — Scope, glossary, review gates
- `conventions.md` — Naming, style, patterns
- Mark these with: *"This is reference material. Edit to change all future runs."*

**`output/` or `[stage]/output/`** (Layer 4 — The Product, changes every run):
- Yesterday's research notes → move to Layer 3 or archive
- Draft outputs from last session → move to `stage/output/`
- Keep only current-run artifacts here

**Rule:** If a file doesn't change between runs, it's Layer 3. If it's specific to "this session's work," it's Layer 4.

### Step 5: Implement the Three-Stage Pattern

Start small. Most workspaces fit three stages:

**For Code Projects:**
```
my-app/
├── planning/          (specs, architecture)
├── src/               (implementation)
└── docs/              (documentation)
```

**For Content:**
```
my-content/
├── script-lab/        (drafting, ideation)
├── production/        (asset building)
└── distribution/      (publishing)
```

**For Research:**
```
my-research/
├── sources/           (papers, notes)
├── analysis/          (themes, outlines)
└── writing/           (drafts, final output)
```

Add a fourth stage only when you discover that a type of work genuinely needs isolation.

### Step 6: Create Your Routing Checklist

Add a `CONTEXT.md` at the root:

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
- Review and edit output before passing to the next stage
- If you're fixing the same thing every run, fix the source (_config/), not the output
```

This table is your insurance policy: it shows exactly how data flows from one stage to the next.

---

## Why This Works

1. **CLAUDE.md stays small** → Claude doesn't get lost in 3 pages of conflicting instructions
2. **Factory is separate from product** → Claude doesn't mistake yesterday's draft for a rule you live by
3. **Each new session reads the same file** → Your setup is consistent across conversations
4. **Context is modular** → You load only what's relevant for this task, staying under 8,000 tokens per stage
5. **Information lives in one place** → No drift, no contradictions between files

---

## Implementation Checklist

Before you declare your workspace ready:

- [ ] `CLAUDE.md` is under 800 tokens (one screen)
- [ ] Root `CONTEXT.md` has an execution flow table
- [ ] Each stage folder has its own `CONTEXT.md` with Inputs, Process, Outputs, Verify
- [ ] `_config/` contains only stable reference material (voice, conventions, workspace rules)
- [ ] `output/` directories contain only working artifacts from this run
- [ ] No reference material in `output/`
- [ ] No working artifacts in `_config/`
- [ ] Routing table in `CLAUDE.md` covers all your task types
- [ ] Every directory listed in the routing table exists

---

## Common Mistakes to Avoid

1. **Don't put detailed instructions in CLAUDE.md** — Move them to `[stage]/CONTEXT.md` or `_config/`
2. **Don't mix reference files and draft outputs** — Layer 3 is read-only. Layer 4 is working space.
3. **Don't make a vague Inputs table** — Say exactly what file and section, never "everything relevant"
4. **Don't skip the Verify section** — That's where you catch drift between stages
5. **Don't start with 6 stages** — Begin with 2-3. Add more only when a type of work proves it needs isolation

---

## Next Steps

1. Identify your archetypes (what fundamentally different types of work do you do?)
2. Pick one archetype and create a separate workspace directory for it
3. Write a one-screen `CLAUDE.md` for that workspace
4. Create 2-3 stage directories with `CONTEXT.md` files
5. Move your reference material to `_config/` and archives to `output/`
6. Test it: start a new conversation, open only that workspace's `CLAUDE.md`, and see if Claude stays focused

Once one workspace feels solid, build the second one. You'll be surprised how much clearer your work becomes.
