# Fixing a Broken Workspace: Diagnostic & Restructuring Plan

You've identified three critical problems that compound into context loss and confusion. Here's how to diagnose and fix each one.

---

## Problem 1: Bloated CLAUDE.md (3+ pages)

**What's happening:**
Your CLAUDE.md has merged two separate concerns:
- **Contextual instructions** (what Claude should know about your project)
- **Reference documentation** (background on architecture, dependencies, workflows)

This forces Claude to:
1. Re-read 3 pages every session start
2. Hold all of it in context even when only 2-3 lines are relevant
3. Lose track of specifics because they're buried in reference noise

**Diagnostic test:**
```
Does your CLAUDE.md contain:
- [ ] Full architecture diagrams or flowcharts?
- [ ] Dependency listings with explanations?
- [ ] Historical context ("we used to do X")?
- [ ] Long API documentation reproductions?
- [ ] Project history or changelog?
- [ ] Setup instructions for new developers?

If you checked 3+, your CLAUDE.md is doing too much.
```

**Fix: Split into layers**

Create a three-layer structure:

```
project-root/
├── CLAUDE.md (60-100 lines ONLY)
│   ├── Project name + one-sentence description
│   ├── 3-5 critical "always follow" items
│   ├── Location of detailed docs
│   └── How to run tests / build
│
├── docs/
│   ├── ARCHITECTURE.md (where your diagrams go)
│   ├── SETUP.md (for new developers)
│   ├── API-REFERENCE.md (or link to external docs)
│   ├── CONVENTIONS.md (coding standards, naming)
│   └── DECISIONS.md (why you made design choices)
│
└── .claude/
    └── rules/ (or rules.md)
        ├── language-specific.md
        ├── security-guardrails.md
        └── testing-requirements.md
```

**CLAUDE.md template (keep it short):**

```yaml
---
# CLAUDE.md - Project Context
---

# Project Name

One sentence: What does this do?

## Quick Start

```bash
# How to run tests
# How to build
# How to deploy
```

## Critical Rules

1. [Most important thing about code style]
2. [Most important architectural constraint]
3. [Most important security/compliance rule]

## Where to Find Things

- Architecture details → `docs/ARCHITECTURE.md`
- Setup for new developers → `docs/SETUP.md`
- Coding standards → `.claude/rules/`
- Tests → `tests/` (run with `npm test`)

## Current Focus

[Only include if you're mid-feature]
```

---

## Problem 2: Mixed Drafts & Reference Docs

**What's happening:**
Your file system doesn't distinguish between:
- **Authoritative docs** (checked in, reviewed, stable)
- **Working notes** (ephemeral, Claude output, WIP)
- **Artifacts** (generated, intended for external use)

Result: Claude doesn't know what's safe to reference vs. what to ignore.

**Diagnostic test:**
```
Are these files in the same folder?
- [ ] README.md + my-claude-session-notes-2026-04-20.md
- [ ] API spec + "api-spec-draft-2-backup.md"
- [ ] Architecture doc + claude-output-20260428.txt
- [ ] Production config + "old-config-before-refactor.json"

If yes, you have a mixing problem.
```

**Fix: Separate by lifecycle**

```
project-root/
│
├── docs/ (AUTHORITATIVE - version controlled, reviewed)
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── CONVENTIONS.md
│
├── .claude/ (CLAUDE-SPECIFIC - hooks, rules, prompts)
│   ├── rules/
│   ├── skills/
│   └── hooks/
│
├── .workspace/ (WORKING SESSION SPACE - gitignored)
│   ├── session-notes/
│   ├── drafts/
│   └── scratch/
│
└── .gitignore
    ```
    # Working session files - temporary
    .workspace/
    .claude/skills/generated/
    claude-*-output.md
    *-draft*.md
    session-*.txt
    ```
```

**Rule: All docs in `docs/` are permanent; everything in `.workspace/` is temporary.**

---

## Problem 3: Claude Losing Context (Forgets Previous Messages)

**What's happening:**
This is a combination of:
1. **CLAUDE.md overload** → key info is lost in noise
2. **No persistent instruction anchors** → Claude relies on chat history alone
3. **No state machine for multi-session work** → each session starts from scratch

**Diagnostic test:**
```
Does Claude frequently:
- [ ] Ask you to re-explain something you covered 3 messages ago?
- [ ] Ignore instructions you gave earlier in the same session?
- [ ] Forget which branch you're on or what feature you're building?
- [ ] Lose track of preferences you've set (coding style, commit format)?
- [ ] Make the same mistake twice in one session?

If you checked 3+, you have a memory leak.
```

**Root causes & fixes:**

### Fix A: Use `.claude/settings.json` for Persistent State

Don't rely on CLAUDE.md chat instructions. Use **project settings** instead:

```json
{
  "preferences": {
    "model": "claude-opus",
    "theme": "light"
  },
  "conventions": {
    "commits": "conventional",
    "namingStyle": "camelCase",
    "codeStyle": "airbnb"
  },
  "activeContext": {
    "currentBranch": "feat/auth-system",
    "focusArea": "login flow",
    "blockers": ["waiting on design review"]
  }
}
```

Claude can see and reference `.claude/settings.json` across sessions. **Chat history does not carry over**, but settings do.

### Fix B: Create Session Anchors (Persistent Notes)

Add a `.claude/CURRENT-SESSION.md` that Claude updates:

```markdown
# Current Session Context

Last updated: 2026-04-29 10:30 AM

## What You're Working On
- Building auth system feature
- Currently on: login form validation

## What You Decided
- Use JWT, not sessions
- Frontend validation + backend validation
- Tests must cover edge cases

## What's Blocking You
- Design review pending (est. tomorrow)

## What's Next
1. Implement password validation rules
2. Add E2E test for happy path
3. Create PR when design approved

## Key Files to Remember
- `src/auth/login.js` - main login form
- `tests/auth.test.js` - test suite
- `docs/AUTH-DESIGN.md` - why these decisions
```

Claude can reference and update this file, maintaining continuity. Add to `.gitignore`:
```
.claude/CURRENT-SESSION.md
```

### Fix C: Use Hooks for Auto-Context

Instead of relying on Claude to remember, set up a **hook** that runs at session start:

`.claude/hooks/session-start.js` (pseudocode):

```javascript
// This runs automatically when you start Claude
// It loads and displays your current session state

const sessionFile = '.claude/CURRENT-SESSION.md';
const content = readFile(sessionFile);
console.log("Session loaded:\n" + content);
```

This way, every session automatically loads your context without you having to type it.

---

## Quick Restructuring Checklist

### Week 1: Immediate wins (2 hours)

- [ ] **Trim CLAUDE.md to 100 lines or less**
  - Keep only: project name, how to run tests, 3-5 critical rules
  - Move everything else to `docs/`

- [ ] **Create `.gitignore` section for working files**
  ```
  .workspace/
  *-draft*.md
  claude-*-output.md
  session-*.txt
  .claude/CURRENT-SESSION.md
  ```

- [ ] **Create `.claude/settings.json`**
  - Add your coding conventions
  - Add your naming preferences
  - List your active context (current feature, blockers)

- [ ] **Create `.claude/CURRENT-SESSION.md`**
  - Document what you're building
  - List key decisions
  - List next steps

- [ ] **Create `docs/` folder**
  - Move reference docs here
  - Create ARCHITECTURE.md with diagrams
  - Create CONVENTIONS.md with style rules

### Week 2: Automation (2-3 hours)

- [ ] **Create `.claude/hooks/session-start.js`**
  - Auto-load CURRENT-SESSION.md at start
  - Auto-display warnings if there are blockers

- [ ] **Set up a CLAUDE_SKIP list** (`.claude/settings.json`)
  ```json
  {
    "autoIgnore": [
      "node_modules/",
      ".git/",
      "dist/",
      "build/",
      "*-draft.md"
    ]
  }
  ```

---

## Success Criteria

After restructuring, you should be able to answer "yes" to all of these:

- [ ] **CLAUDE.md is under 100 lines** — I can read it in under 1 minute
- [ ] **Reference docs are separate** — Diagrams, architecture, and conventions live in `docs/`, not CLAUDE.md
- [ ] **Working files are isolated** — Drafts and session notes go in `.workspace/`, not the root
- [ ] **Settings are persistent** — My preferences and context live in `.claude/settings.json`, not chat history
- [ ] **Session state is documented** — What I'm building and why is in `.claude/CURRENT-SESSION.md`
- [ ] **Claude remembers across messages** — By session start, it loads my context without asking

---

## Why This Works

1. **Smaller CLAUDE.md** → Claude can fit your entire project context in memory at session start
2. **Separated concerns** → Claude knows what's reference (stable) vs. working (temporary)
3. **Persistent settings** → Your preferences and decisions survive chat restarts
4. **Session anchors** → You have a canonical source of truth for what you're building
5. **Hooks** → Context loads automatically, no manual re-explanation needed

---

## Common Pitfalls to Avoid

**DON'T:**
- Put generated Claude output in version control (it will pollute your docs)
- Use CLAUDE.md as a notepad (it grows forever)
- Rely on chat history for critical information (chats reset)
- Store active decisions in `docs/` as if they're permanent (they change)

**DO:**
- Version control only: source code, tests, architecture decisions, configuration
- Use `.workspace/` for anything you might delete later
- Update `.claude/CURRENT-SESSION.md` when your plans change
- Keep docs/ as your single source of truth for stable information

---

## Template: 30-Minute Setup

Run this to restructure immediately:

```bash
# 1. Create folders
mkdir -p docs .workspace/.claude/rules

# 2. Create minimal CLAUDE.md
cat > CLAUDE.md << 'EOF'
# [Project Name]

Brief description of what this does.

## Running Tests

```bash
npm test
```

## Critical Rules

1. Always write tests first
2. Use camelCase for files
3. Conventional commits (feat:, fix:, docs:)

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Setup: `docs/SETUP.md`
- Conventions: `.claude/rules/`

## Current Focus

[What you're building this week]
EOF

# 3. Create session context
cat > .claude/CURRENT-SESSION.md << 'EOF'
# Current Session

## What You're Working On
[Your feature/task]

## Next Steps
1. [Step 1]
2. [Step 2]

## Blockers
- None
EOF

# 4. Create .gitignore section
cat >> .gitignore << 'EOF'

# Claude working files
.workspace/
*-draft*.md
claude-*-output.md
session-*.txt
.claude/CURRENT-SESSION.md
EOF
```

That's it. You now have a clean, structured workspace that Claude can navigate with confidence.
