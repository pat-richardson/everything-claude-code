# YouTube Content Creator Workspace Setup

Perfect — you're describing a **Content Pipeline** workflow, and ICM is exactly designed for this. The problem you're facing (Claude forgetting your brand voice or context switching between stages) is the core problem ICM solves with the **five-layer context hierarchy**. Let me walk you through setting up a workspace that keeps your voice consistent across research, scripting, production, and distribution.

## What We'll Build

This is an Interpretable Context Methodology (ICM) workspace. It replaces scattered notes and fragmented prompts with a filesystem-based coordination layer:

- **Layer 0** — One routing file that tells Claude where to go for each task
- **Layer 1** — The handoff rules between stages  
- **Layers 2-4** — Four sequential stages (research → script → production → distribution), each with its own context file and memory
- **Layer 3** — Your brand voice and style guidelines, loaded consistently at every stage
- **Layer 4** — Your actual outputs: research findings, script drafts, production specs, distribution plans

The key insight: **each stage only sees the context it needs**. Your research stage doesn't load your brand voice and then immediately forget it 8,000 tokens later. You control what Claude sees at each step.

---

## Phase 1: Gathering Requirements

Before we scaffold the workspace, I need a few details:

**1. Project Name**  
What do you call this content operation? Examples: "AI-Tools-Channel", "VideoLab", "TechTubes". I'll use `youtube-content` as a placeholder.

**2. Archetype Confirmation**  
You've already picked the right one — **Content Pipeline**. This means:
- Research stage: Topic exploration, source gathering, key findings
- Script stage: Brainstorming, outlining, drafting, refining
- Production stage: Shot lists, editing notes, graphics specs, pacing
- Distribution stage: Thumbnails, titles, descriptions, scheduling

**3. Stages Customization**  
The default four above should work. Do you need:
- A pre-research "idea management" stage (brainstorming topics)?
- A post-distribution "analytics review" stage (tracking performance)?
- Changes to stage names?

For now, I'll assume the default four stages work.

**4. Brand Voice Details**  
How would you describe your voice? Examples:
- **Formality:** Conversational vs. Technical vs. Educational
- **Audience:** Absolute beginners vs. Tech-aware professionals
- **Personality:** Witty, authoritative, approachable, sarcastic?
- **Key phrases you always use:** "In this video, we explore...", specific catchphrases?
- **What to avoid:** Overly academic tone? Marketing jargon? Spoilers?

For this setup, I'll create a placeholder voice guide that you'll customize.

**5. Target Directory**  
Where should this live? I'll assume `~/Documents/youtube-content` or your preferred location.

---

## Phase 2: Directory Structure

I'm scaffolding a Content Pipeline workspace. Here's what we'll create:

```
youtube-content/
├── CLAUDE.md                          (Layer 0: routing table)
├── CONTEXT.md                         (Layer 1: execution flow)
├── _config/
│   ├── voice.md                       (Layer 3: brand voice & style)
│   └── workspace.md                   (Layer 3: scope & glossary)
├── research/
│   ├── CONTEXT.md                     (Layer 2: stage contract)
│   ├── references/                    (Layer 3: research templates, source guidelines)
│   └── output/                        (Layer 4: findings, notes, research outputs)
├── script-lab/
│   ├── CONTEXT.md                     (Layer 2: stage contract)
│   ├── references/                    (Layer 3: script templates, structure examples)
│   └── output/                        (Layer 4: brainstorms, drafts, outlines)
├── production/
│   ├── CONTEXT.md                     (Layer 2: stage contract)
│   ├── references/                    (Layer 3: shot list templates, pacing specs)
│   └── output/                        (Layer 4: specs, timing notes, graphics briefs)
└── distribution/
    ├── CONTEXT.md                     (Layer 2: stage contract)
    ├── references/                    (Layer 3: platform guidelines, upload checklists)
    └── output/                        (Layer 4: titles, descriptions, thumbnails, schedules)
```

---

## Phase 3: Layer 0 - CLAUDE.md (Root Routing File)

This is the first file Claude reads on every task. Keep it under one screen (~800 tokens).

```markdown
# YouTube Content Workspace

A five-stage workspace for researching, scripting, producing, and distributing AI tool videos while maintaining consistent brand voice.

## Workspaces

- **/research** — Gather sources, extract key findings, build knowledge base
- **/script-lab** — Brainstorm ideas, write outlines, draft scripts
- **/production** — Create shot lists, edit specs, graphics briefs
- **/distribution** — Generate titles, descriptions, thumbnails, schedule uploads

## Routing

| Task | Go to | Read | What You'll Do |
|------|-------|------|----------------|
| Research a new AI tool or topic | /research | CONTEXT.md | Explore sources, take notes, distill findings |
| Brainstorm or draft a script | /script-lab | CONTEXT.md | Outline structure, write draft, refine language |
| Plan shots and editing | /production | CONTEXT.md | Create shot list, specify timing, brief graphics team |
| Prepare for upload | /distribution | CONTEXT.md | Write title/description, design thumbnail specs |

## Naming Conventions

- Research findings: `{topic}-findings.md` (e.g., `gpt4-findings.md`)
- Script drafts: `{topic}-script-v{n}.md` (e.g., `gpt4-script-v1.md`)
- Production specs: `{topic}-production-specs.md`
- Distribution assets: `{topic}-distribution.md`

## Rules

1. **Read this file first** on every new task — it routes you to the right stage.
2. **Do not create files outside the current stage** unless explicitly asked.
3. **Always load Layer 3 files** (_config/voice.md and _config/workspace.md) before writing.
4. **Review and edit outputs between stages** — the output of stage N becomes the input of stage N+1.
5. **Brand voice is non-negotiable** — if you're editing tone repeatedly in outputs, edit _config/voice.md instead.

## Current State

- Workspace: **Ready to use**
- Voice guide: **Needs your customization** (edit _config/voice.md with your actual tone and phrases)
- Workspace scope: **Defined** (see _config/workspace.md)
```

---

## Phase 4: Layer 1 - Root CONTEXT.md (Execution Flow)

This file lives at the workspace root. It defines the handoff rules between stages. Keep it under ~300 tokens.

```markdown
# Content Pipeline: Execution Flow

This file defines how work flows from research → script → production → distribution. Read this if you're unsure which stage is next or how to pass work between stages.

## Pipeline Flow

| Stage | Input Source | Output Destination | Review Gate | Typical Artifacts |
|-------|-------------|-------------------|-------------|-------------------|
| research | Your ideas, external sources | research/output/ | You review findings | findings.md, notes.md |
| script-lab | research/output/findings | script-lab/output/ | You refine the script | outline.md, script-v1.md, script-final.md |
| production | script-lab/output/script | production/output/ | You validate timing/specs | specs.md, shot-list.md |
| distribution | production/output/specs | distribution/output/ | You proof titles/descriptions | distribution.md with all assets |

## Handoff Rules

1. **Output of stage N becomes input of stage N+1** — always review and edit before passing forward
2. **Brand voice carries through** — every stage reads _config/voice.md to maintain consistency
3. **If you edit the same issue repeatedly** across multiple runs (e.g., tightening tone, reformatting sections, correcting terminology), the problem is in Layer 3 (_config/), not the output. Fix the source, not the artifact.
4. **Never skip the review gate** — each stage is a chance to catch issues before they propagate

## When to Return to Earlier Stages

- If production reveals script problems → go back to /script-lab, edit, then restart production
- If distribution reveals pacing issues → go back to /production, then /script-lab if needed
- Always re-run the current stage with the new input; don't skip ahead
```

---

## Phase 5: Layer 2 - Stage CONTEXT.md Files

Each stage has its own contract file that specifies:
- **Inputs** — exactly what context to read and from where
- **Process** — numbered steps for this stage
- **Outputs** — file names and formats produced
- **Verify** — consistency checks before moving to the next stage

### research/CONTEXT.md

```markdown
# Research Stage

Explore sources, gather information, and distill key findings about your topic.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Audience, Personality | Understand your audience perspective |
| Layer 3 | _config/workspace.md | Scope, Glossary | Stay within research boundaries |
| Layer 4 | (if continuing prior research) | All sections | Prior research context |

## Process

1. Read _config/voice.md and _config/workspace.md to understand your brand and scope
2. Identify 3-5 primary sources (docs, papers, videos, hands-on trials)
3. Extract 5-10 key findings per source (what it does, why it matters, limitations)
4. Synthesize findings into a coherent narrative (connections, contradictions, gaps)
5. Capture any surprising insights or demo ideas
6. Write final findings to output/

## Outputs

- **output/{topic}-findings.md** — Key findings section (2-4 key insights), Why It Matters section, Limitations/Gotchas section (~800-1200 tokens)
- **output/{topic}-research-notes.md** — Raw notes, source links, direct quotes, ideas for scripts (~500-1000 tokens)

## Verify

- [ ] All findings align with "Audience" in _config/voice.md (not too academic, not too basic)
- [ ] Limitations are honestly stated (no marketing spin)
- [ ] Each finding references at least one source
- [ ] No contradictions between findings (or contradictions are explicitly noted)
```

### script-lab/CONTEXT.md

```markdown
# Script Lab Stage

Transform research findings into a compelling video script. This stage is where voice becomes critical.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | All sections (Tone, Phrases, Grammar) | Write in YOUR voice, not generic AI voice |
| Layer 3 | _config/workspace.md | Glossary, Scope | Consistency with brand vocabulary |
| Layer 4 | ../research/output/{topic}-findings.md | All sections | Source material for script |
| Layer 4 | ../research/output/{topic}-research-notes.md | "Surprising Insights" section | Hook ideas, demo concepts |

## Process

1. Read _config/voice.md completely — you are writing in this voice for the next two stages
2. Read research/output/ findings to internalize the content
3. Outline structure: Hook (0-10s), Problem (10-30s), Solution/Demo (30-120s), Key Takeaway (120-135s)
4. Draft script with your voice, not generic explanations (use phrases from voice.md, match formality level)
5. Read draft aloud (or imagine yourself narrating) — does it sound like YOU?
6. Refine tone, cut filler, tighten pacing
7. Mark [DEMO], [GRAPHIC], [CUTAWAY] in the draft where visuals will help
8. Write final version to output/

## Outputs

- **output/{topic}-outline.md** — Section titles and timing (~300 tokens)
- **output/{topic}-script-v1.md** — Full first draft with [DEMO], [GRAPHIC] markers (~1500-2000 tokens)
- **output/{topic}-script-final.md** — Polished, read-aloud version (~1500-2000 tokens)

## Verify

- [ ] Script matches voice.md Tone and uses approved Phrases
- [ ] No generic AI phrases (check for clichés like "Let's dive into", "It's important to note")
- [ ] Pacing aligns with outlined timing
- [ ] All key findings from research are represented
- [ ] Script assumes the Audience level from voice.md (not condescending, not too technical)
- [ ] Visual markers [DEMO], [GRAPHIC] are placed at specific moments (not every other sentence)
```

### production/CONTEXT.md

```markdown
# Production Stage

Translate the script into a detailed production specification with shot lists, timing, and graphics briefs.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Personality | Maintain voice in visual language |
| Layer 3 | _config/workspace.md | Glossary | Use consistent terminology in visuals |
| Layer 4 | ../script-lab/output/{topic}-script-final.md | All sections | Source script for timing and visual cues |
| Layer 4 | ../script-lab/output/{topic}-outline.md | Timing info | Pacing reference |

## Process

1. Read script-final.md and note all [DEMO], [GRAPHIC], [CUTAWAY] markers
2. Create a shot-by-shot breakdown (narrator on camera, screen capture, graphics, b-roll)
3. Time each segment (match script pacing, give editor clear in/out points)
4. For each [DEMO] marker: specify what tool, what action, expected duration
5. For each [GRAPHIC] marker: describe visual (type, data, design notes)
6. For each [CUTAWAY] marker: suggest stock footage or b-roll type
7. Add notes on color grading, music cues, transitions if relevant
8. Write specs to output/

## Outputs

- **output/{topic}-production-specs.md** — Master spec document with all timing, shot descriptions, graphics briefs (~2000-3000 tokens)
- **output/{topic}-shot-list.md** — Simple table: Time Range, Shot Type, Content, Duration, Notes (~800-1200 tokens)

## Verify

- [ ] Every [DEMO], [GRAPHIC], [CUTAWAY] from script has a spec entry
- [ ] Timings add up to target video length (check against outline)
- [ ] Terminology in graphics briefs matches _config/workspace.md Glossary
- [ ] Color/tone descriptors align with voice.md Personality (e.g., "professional but approachable" graphics)
- [ ] Shot list is production-ready (editor can follow it without asking questions)
```

### distribution/CONTEXT.md

```markdown
# Distribution Stage

Create all assets for uploading and sharing your video: titles, descriptions, thumbnails, scheduling notes.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Phrases, Tone | Title and description should sound like your video |
| Layer 3 | _config/workspace.md | Scope | Ensure category alignment (e.g., "AI tools" not "tech news") |
| Layer 4 | ../script-lab/output/{topic}-outline.md | Hook section | Basis for thumbnail/title hook |
| Layer 4 | ../production/output/{topic}-production-specs.md | All sections | Reference for visual style in thumbnail |

## Process

1. Read _config/voice.md to match tone in titles/descriptions (your voice, not algorithm-speak)
2. Extract hook from script outline — this is the basis for the title and thumbnail
3. Write 3 title options (curiosity hook, benefit hook, controversy hook)
4. Write description: intro (50 words), main points (3-5 bullets), resources, timestamps, CTA
5. Describe thumbnail: layout, text, colors (reference production specs for visual consistency)
6. Add scheduling notes (optimal upload time, series context, related videos)
7. Write all assets to output/

## Outputs

- **output/{topic}-distribution.md** — Complete package with titles, descriptions, thumbnail spec, scheduling notes (~1500-2000 tokens)

## Verify

- [ ] All three title options avoid clickbait; at least one matches voice.md Personality
- [ ] Description starts with a hook (first 10 words should intrigue)
- [ ] All key findings from research appear in description bullets
- [ ] Thumbnail description uses colors and style from production specs
- [ ] No phrases contradict voice.md Avoid list
- [ ] Timestamps align with production shot list
```

---

## Phase 6: Layer 3 - Factory Files (Your Immutable Rules)

These files are the **factory** — they don't change per run. Every stage loads them. Edit these when you want to change how ALL future videos are made.

### _config/voice.md

```markdown
# Brand Voice & Style

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Tone

- **Formality:** Conversational with technical precision (not academic, not oversimplified)
- **Audience:** Tech-aware professionals and curious learners (not beginners, not enterprise architects)
- **Personality:** Approachable, intellectually honest, occasionally witty but not comedic

## Phrases

**Use these:**
- "Let's see how X works..." (exploratory, not commanding)
- "This matters because..." (value-focused)
- "The catch is..." (honest about tradeoffs)
- "In practice, this means..." (grounded examples)

**Avoid these:**
- "It's important to note that..." (too formal)
- "Guys, you won't believe..." (clickbait energy)
- "Essentially..." (filler word)
- "Let's dive deep into..." (clichéd, overused)
- "As we all know..." (assumes knowledge)

## Grammar & Mechanics

- **Contractions:** YES (use "it's", "don't", "we're" — sounds natural)
- **Oxford comma:** YES
- **Abbreviations:** Spell out first use (e.g., "Artificial Intelligence (AI)"), then abbreviate
- **Sentence fragments:** OK if they land for emphasis ("This changes everything." / "Not really.")
- **Active voice:** Prefer "Claude writes code" over "Code is written by Claude"

## Opening Hook Structure

Every script opens with a question or statement that primes the topic:
- Question: "Ever wonder why Claude sometimes outperforms GPT-4 on specific tasks?"
- Statement: "I spent 8 hours testing the new Claude model. Here's what surprised me."

## Explanation Style

- Lead with the why, then the how
- Use analogies (especially tech-to-real-world)
- Show, don't tell (demos > descriptions)
- Acknowledge complexity without getting lost in it

## Visual Language Notes

- Title cards: Clean, readable font (no decorative fonts)
- Graphics: Minimal, focused (one concept per graphic)
- Color: Keep brand-consistent (define your primary/accent colors here if you have them)
- Pacing: Match script energy (slower for complex concepts, faster for excitement)
```

### _config/workspace.md

```markdown
# Workspace Constraints & Glossary

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Scope

- **In scope:** AI tools, LLMs, automation workflows, productivity apps, AI tool comparison/reviews
- **Out of scope:** General tech news, cryptocurrency, non-AI productivity, philosophical AI debates
- **Video length target:** 10-15 minutes (scripts roughly 1,500-2,000 words at natural speaking pace)
- **Upload cadence:** [Define your schedule, e.g., weekly Tuesdays]

## Glossary

- **AI tool:** Software that uses machine learning to perform tasks (LLMs, image generators, coding assistants)
- **LLM:** Large Language Model (ChatGPT, Claude, Gemini, etc.)
- **Prompt:** Instructions you give to an AI tool
- **Token:** Smallest unit of text the model processes (roughly 1 word = 1.3 tokens)
- **Demo:** Live walkthrough showing the tool in action (the audience sees your screen)

## Review Gates

| Stage Transition | Reviewer | What to Check |
|-----------------|----------|---------------|
| research → script | You | Does script cover all key findings? Does it match your voice? |
| script → production | You | Are timing and visuals clear? Can editor follow the shot list? |
| production → distribution | You | Does title hook match script? Does description match findings? |

## Platform Notes

- **YouTube Settings:** [HD upload, tags, category, thumbnail specs (1280x720px recommended)]
- **Serialization:** [Do videos form a series? How are they connected?]
- **Community Posts:** [Do you cross-promote? Link strategy?]

## Assumptions

- All videos will have captions (burned-in or auto-generated)
- All demos will be 4K screen captures with zoom to readable size
- All research is cited (URLs in description and/or on-screen)
- All scripts assume viewer has seen 0-3 prior videos (re-establish context)
```

---

## Phase 7: Initialize Layer 4 (Output Directories)

Create empty `output/` directories in each stage with `.keep` files so Git tracks them:

```bash
mkdir -p youtube-content/{research,script-lab,production,distribution}/output
touch youtube-content/research/output/.keep
touch youtube-content/script-lab/output/.keep
touch youtube-content/production/output/.keep
touch youtube-content/distribution/output/.keep
```

These directories will hold your actual research notes, script drafts, production specs, and distribution assets.

---

## Phase 8: Verification Checklist

Before declaring the workspace ready, verify:

### Directory Structure
- [ ] Root has `CLAUDE.md` and `CONTEXT.md`
- [ ] `_config/` has `voice.md` and `workspace.md`
- [ ] Each stage (research, script-lab, production, distribution) has its own `CONTEXT.md`
- [ ] Each stage has a `references/` directory (may be empty for now)
- [ ] Each stage has an `output/` directory with `.keep` file

### Token Budgets
- [ ] `CLAUDE.md` fits on one screen (~800 tokens) ✓
- [ ] Root `CONTEXT.md` is under ~300 tokens ✓
- [ ] Each stage `CONTEXT.md` is under ~500 tokens ✓

### Stage Contracts
- [ ] Every stage `CONTEXT.md` has an **Inputs** table with Source, File, Sections
- [ ] Every stage `CONTEXT.md` has a **Process** section (numbered steps)
- [ ] Every stage `CONTEXT.md` has an **Outputs** section (file names, formats)
- [ ] Every stage `CONTEXT.md` has a **Verify** section (consistency checks)

### Layer Separation
- [ ] `_config/` contains only stable material (voice.md, workspace.md)
- [ ] `references/` directories are empty or contain only templates
- [ ] `output/` directories are empty (except `.keep` files)
- [ ] No working artifacts in reference directories
- [ ] No reference material in output directories

### Routing & Navigation
- [ ] `CLAUDE.md` has a routing table covering all task types
- [ ] Every workspace listed in routing exists as a directory
- [ ] Naming conventions are documented in `CLAUDE.md`

### Portability
- [ ] No absolute paths in any file (all relative paths work from any machine)
- [ ] Git-compatible (`.keep` files in empty directories)
- [ ] Can be copied to another machine and used immediately

---

## How to Use Your Workspace

### Starting a New Video

1. **Open CLAUDE.md** — read the routing table
2. **Go to /research** — read `research/CONTEXT.md`
3. **Load your inputs:**
   - Read `_config/voice.md` (internalizes your brand voice)
   - Read `_config/workspace.md` (scope and glossary)
   - Read or create your research notes
4. **Follow the Process steps** — extract findings, take notes
5. **Generate outputs** — write findings to `output/{topic}-findings.md`
6. **Review & edit** — read your output, fix tone if needed
7. **Move to next stage** — copy `research/output/{topic}-findings.md` to your context for script-lab

### Between Stages

After completing each stage:
1. Review the stage output (read it aloud if it's a script)
2. Edit for clarity, tone, and accuracy
3. **Only then** move to the next stage with the edited output
4. Load that stage's `CONTEXT.md` and begin

### Editing the Factory (Not the Product)

If you find yourself editing the same issue repeatedly across multiple runs:
- **Tone drift** → Edit `_config/voice.md` (Phrases, Tone sections)
- **Structural issues** → Edit the relevant stage `CONTEXT.md` (Process section)
- **Scope creep** → Edit `_config/workspace.md` (Scope section)

**Example:** If you're repeatedly tightening "friendly" language in script outputs, edit `_config/voice.md` Phrases section to be more specific, then re-run the script stage with fresh input.

---

## Integration with Claude Code

Once this workspace is set up, you can:

1. **Start each session with:** "I'm working in /research on the [topic] video. Read CLAUDE.md and research/CONTEXT.md."
2. **Load your voice at every stage:** The voice.md file is always in your Inputs table
3. **Track progress:** Each stage's output becomes the next stage's input
4. **Fix problems upstream:** If a script doesn't sound right, edit voice.md, then re-run the script stage

---

## Quick Start: Setting Up Today

1. **Create the directory structure** — copy the scaffolding above
2. **Customize `_config/voice.md`** — replace placeholders with your actual brand voice, phrases, and style rules
3. **Customize `_config/workspace.md`** — define your scope, glossary, target length, and upload schedule
4. **Test the first stage** — pick one recent video you've made, run the research stage, and see if the outputs feel right
5. **Iterate on Layer 3** — if the outputs don't sound like you, adjust voice.md and try again

The workspace is ready for production once you've completed one full cycle (research → script → production → distribution) and verified all outputs match your expectations.

---

## Why This Works (And How It Solves Your Problem)

**Before ICM:** Claude context would jump between "here's my brand voice guide" (buried 40 KB ago) and "here's your research findings" (just loaded), and by the time you ask for a script, the model has lost sight of the voice constraints. You'd edit tone repeatedly, manually fixing the same issues every video.

**After ICM:** 
- **research/CONTEXT.md** loads voice.md in Inputs before asking for findings
- **script-lab/CONTEXT.md** loads voice.md first and makes it explicit: "You are writing in THIS voice"
- **production/CONTEXT.md** loads voice.md to ensure graphics briefs match personality
- **distribution/CONTEXT.md** loads voice.md to match description tone

Your voice is never forgotten. It's not buried in a large context. It's an explicit input at every stage.

**Result:** Consistent brand voice across all four stages, fewer rewrites, faster turnarounds, and Claude remembering what matters about your videos.

---

## Next Steps

1. Create the directory structure above
2. Copy the CLAUDE.md template and customize it with your project name
3. Copy the _config/voice.md and fill in your actual voice (tone, phrases, grammar preferences)
4. Copy the _config/workspace.md and define your scope, glossary, and upload schedule
5. Copy all four stage CONTEXT.md files into their respective directories
6. Create empty output/ directories with .keep files
7. Pick one topic and run through all four stages end-to-end
8. After completing the first cycle, review this file: "If I edited the same thing twice, update Layer 3 instead"

Your workspace is now a reusable machine for making videos with consistent voice, organized research, and Claude that doesn't forget your brand guidelines.
