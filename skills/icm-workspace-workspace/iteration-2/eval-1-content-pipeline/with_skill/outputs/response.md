# Building Your AI Tools YouTube Content Workspace

You're creating a **Content Pipeline** — a workflow where research becomes scripts, scripts become video assets, and assets become distributed content. Each stage needs its own focused context so Claude understands your brand voice, production constraints, and quality bar without forgetting between sessions.

Here's how to set this up using the Interpretable Context Methodology (ICM).

## Phase 1: Your Workflow Requirements

You've identified the core problem: **Claude must remember your brand voice, editorial standards, and style conventions across research → scripting → production → distribution.**

The ICM approach solves this by separating:
- **Factory** (Layer 3): Stable constraints — your voice guide, brand guidelines, format specs
- **Product** (Layer 4): Per-run artifacts — research notes, draft scripts, video specs, final deliverables

Instead of embedding voice guidelines inside every conversation, they live in `_config/` files that get loaded at the start of each stage. When Claude reads your CONTEXT.md for script-lab/, it loads voice.md automatically. When it moves to production/, it loads the same constraints plus production-specific specs.

## Phase 2: Your Workspace Structure

Start with three stages (add research as a fourth only if researching becomes its own day-long workflow):

```
youtube-content/
├── CLAUDE.md                          # Routing table (read this first)
├── CONTEXT.md                         # Execution flow across stages
├── _config/
│   ├── voice.md                       # Your brand voice, tone, phrases
│   ├── formats.md                     # Video formats, thumbnail specs, script structure
│   └── workspace.md                   # Scope, glossary, review gates
│
├── script-lab/
│   ├── CONTEXT.md                     # "Write or brainstorm scripts here"
│   ├── references/                    # Topic outlines, competitor analysis, examples
│   └── output/
│       └── .keep                      # Git marker
│
├── production/
│   ├── CONTEXT.md                     # "Build video assets here"
│   ├── references/                    # Remotion templates, design tokens, video specs
│   ├── specs/                         # Per-video specs (frame counts, transitions, music choices)
│   └── output/
│       └── .keep
│
└── distribution/
    ├── CONTEXT.md                     # "Publish and cross-promote here"
    ├── references/                    # Platform guidelines, thumbnail templates
    └── output/
        └── .keep
```

Each stage has:
- **CONTEXT.md** — stage-specific contract (Inputs, Process, Outputs, Verify)
- **references/** — stage-specific reference material (examples, templates, prior decisions)
- **output/** — working artifacts (scripts, specs, thumbnails, posts)

## Phase 3: CLAUDE.md — Your Routing Table

This is the **first file Claude reads on every new session**. It's a routing table, not a manual.

```markdown
# YouTube Content Production Workspace

Create compelling, consistent AI-focused video content where research becomes scripts, scripts become assets, and assets become a distributed brand.

## Workspaces

- /script-lab — Research, brainstorm, write and refine video scripts
- /production — Build video assets (Remotion templates, animations, graphics)
- /distribution — Publish, optimize thumbnails, cross-promote across platforms

## Routing

| Task | Go to | Read | When |
|------|-------|------|------|
| Research a topic, brainstorm angles, write script draft | /script-lab | CONTEXT.md | Starting new video |
| Build assets, render animations, sync motion | /production | CONTEXT.md | Script is locked |
| Optimize for platforms, write descriptions, schedule | /distribution | CONTEXT.md | Assets are ready |

## Naming Conventions

- Scripts: `[topic]-script-[version].md` (e.g., `claude-api-script-v1.md`)
- Video specs: `[topic]-specs.md` (e.g., `claude-api-specs.md`)
- Assets: `[topic]-[asset-type]-[version]` (e.g., `claude-api-opener-v2.json`)
- Thumbnails: `[topic]-thumb-[platform].png` (e.g., `claude-api-thumb-youtube.png`)

## Rules

- **Read this file first on every new session** — CLAUDE.md is your routing table
- Load `_config/voice.md` first in script-lab to internalize your tone
- Load `_config/formats.md` first in production to lock layout and timing
- Review and edit output before passing to the next stage — never skip a review gate
- If you edit the same thing repeatedly across runs, fix `_config/` instead, not output
- Do not create files outside the current stage unless explicitly asked
- Output of stage N becomes input of stage N+1

## Current State

- script-lab: ready for brainstorming
- production: ready for asset building
- distribution: ready for publishing
```

## Phase 4: Root CONTEXT.md — Execution Flow

This is a **~300-token file** that describes how stages handoff to each other:

```markdown
# Execution Flow

Your content moves through three stages. Output of stage N becomes input of stage N+1. Review and edit at each handoff.

## Flow

| Stage | Input Source | Output Destination | Review |
|-------|-------------|-------------------|---------|
| script-lab | Research notes, topic ideas | script-lab/output/[topic]-script-vX.md | You review; lock script before → production |
| production | Locked script from script-lab | production/output/[topic]-assets.json | You review assets; lock before → distribution |
| distribution | Assets + script from production | distribution/output/[topic]-{post,thumb,description}.md | You schedule and publish |

## Handoff Rules

1. **script-lab → production**: Script must be "locked" — no more major edits. Add feedback to CONTEXT.md for next iteration if needed.
2. **production → distribution**: All assets must be rendered and tested. Platform specs must match.
3. **Each review gate is mandatory** — do not skip. Read the stage output, make edits in-place, then move to next stage.

## If You Repeat Edits

If you find yourself making the same change to scripts across three runs (e.g., "tighten the opening 30 seconds" or "use more analogies"), update `_config/voice.md` or `_config/formats.md` instead. Fix the factory, not the product.
```

## Phase 5: Stage CONTEXT.md Files

### script-lab/CONTEXT.md

This is where research becomes scripts. Load your voice guide first so Claude matches your tone throughout.

```markdown
# Script Lab

Research, brainstorm, write, and refine scripts. This stage locks the narrative, angles, and flow before production.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Phrases, Grammar, Audience | Style and voice constraints |
| Layer 3 | _config/formats.md | Script Structure, Opening Hook, Pacing | Format and length requirements |
| Layer 3 | references/[prior-scripts] | Any section | Learn from past successful scripts |
| Layer 4 | ../script-lab/output/ | Previous script versions | Build on prior iterations |

## Process

1. Read all Inputs in order above
2. If given a topic: brainstorm 3-5 angles (what makes this worth 10 minutes of viewer time?)
3. Pick the strongest angle and outline: Opening Hook (30s) → Problem (2-3 min) → Solution/Demo (4-5 min) → Takeaway (1-2 min)
4. Write full script, matching voice.md (tone, phrases, pacing)
5. Self-review: Does it match the format spec in formats.md? Does it feel like your voice? Would you watch it?
6. Write to output/ with version number

## Outputs

- **output/[topic]-script-v1.md** — Full script (~1,500-2,000 words for 8-10 min video). Includes: Opening Hook (verbatim), Sections (with timing), Callout (CTA at end). Tone matches voice.md. Pacing matches formats.md.
- **output/[topic]-research-notes.md** — Research summaries, angles considered, why the chosen angle won. Use for context handoff to production.

## Verify

- [ ] Script matches tone and phrases in _config/voice.md
- [ ] Script follows structure in _config/formats.md (opening, pacing, length)
- [ ] Opening hook is under 30 seconds and compelling
- [ ] Callout at end matches your standard CTA format
- [ ] Script feels like it would engage your audience
```

### production/CONTEXT.md

This is where scripts become assets. Load format specs and design tokens so every asset is on-brand.

```markdown
# Production

Build video assets (animations, graphics, code examples, Remotion templates). Render and export formats for all distribution platforms.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/formats.md | Video Specs, Aspect Ratios, Frame Rates, Export Formats | Technical requirements |
| Layer 3 | _config/voice.md | Visual Style, Color Palette, Typography | Design constraints |
| Layer 3 | references/[templates] | Remotion templates, design tokens | Reusable components |
| Layer 4 | ../script-lab/output/[topic]-script-vX.md | Full script + research notes | Source material for production |

## Process

1. Read all Inputs in order above
2. Break script into scenes (one scene per natural narrative beat)
3. For each scene, decide: is this voiceover + b-roll, code demo, animation, or graphic?
4. Build assets in Remotion or your motion tool, using design tokens from voice.md
5. Render each format from formats.md (YouTube 16:9, Shorts 9:16, thumbnail specs)
6. Export and validate: duration matches script, colors match brand, text is readable
7. Write to output/ with scene annotations

## Outputs

- **output/[topic]-assets.json** — Scene-by-scene breakdown. Each scene: type (voiceover, animation, demo), timing (start/end frames), assets (file names), notes. Format: JSON or markdown table. ~500-1000 words.
- **output/[topic]-exports/** — Rendered video files for each platform (YouTube MP4, Shorts MP4, Web WebM)
- **output/[topic]-thumbnails/** — Platform-specific thumbnails (YouTube 1280x720, thumbnail layers PSD)

## Verify

- [ ] Total video length matches script timing from script-lab
- [ ] All assets use colors and typography from _config/voice.md
- [ ] Aspect ratios match formats in _config/formats.md
- [ ] Exported files match platform requirements (codec, bitrate, fps)
- [ ] Thumbnail follows brand template and is readable at thumbnail size
```

### distribution/CONTEXT.md

This is where assets become published content. Load platform guidelines so descriptions and thumbnails are optimized.

```markdown
# Distribution

Publish video to platforms, optimize metadata, cross-promote. Write platform-specific descriptions and thumbnails.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Phrases, Tone | CTA and description voice |
| Layer 3 | references/platform-guidelines.md | YouTube SEO, Shorts tips, Twitter tags | Platform best practices |
| Layer 4 | ../production/output/[topic]-assets.json | Scene list, timing | For generating chapter timestamps |
| Layer 4 | ../production/output/[topic]-exports/ | Final video file | Upload destination |
| Layer 4 | ../script-lab/output/[topic]-script-vX.md | Opening hook, key topics | For description copy |

## Process

1. Read all Inputs in order above
2. Write YouTube description: hook (first 2 lines), chapters with timestamps, links, CTA
3. Write Shorts caption: 1-2 sentences, one actionable takeaway, hashtags
4. Write Twitter/X post: reference video, main insight, mention relevant accounts
5. Optimize thumbnail for platform (validate readability at small size)
6. Write to output/ and include platform-specific metadata (tags, category, thumbnail placement)

## Outputs

- **output/[topic]-youtube-metadata.md** — Title, Description (with chapters), Tags, Category, Playlist. Tone matches voice.md.
- **output/[topic]-shorts-caption.md** — Platform-specific caption, hashtags, CTA
- **output/[topic]-twitter-post.md** — Tweet text, alternative phrasings, mention suggestions
- **output/[topic]-thumbnail-placement.md** — Thumbnail file, platform, verification checklist

## Verify

- [ ] Description voice matches _config/voice.md (tone, phrases, CTA format)
- [ ] Chapter timestamps match script-lab timing exactly
- [ ] Thumbnail is readable at 280x158px and 1280x720px
- [ ] Links in description match your canonical URLs
- [ ] SEO tags reflect video topic and audience search intent
```

## Phase 6: Factory Files (Layer 3) — Your Brand Constraints

These files never change per-run. They are immutable reference material that shapes every video identically.

### _config/voice.md

```markdown
# Brand Voice and Style

> This is reference material (Layer 3).
> Edit this file to change how all future scripts sound.
> Do not edit stage outputs trying to fix voice — fix this file instead.

## Tone

- **Formality:** Conversational but credible (not "Hey guys!", not academic)
- **Audience:** Software developers, AI enthusiasts, technical builders (assume familiarity with basic ML concepts)
- **Personality:** Curious, practical, slightly irreverent (explain hard concepts in human terms)

## Phrases

**Use:**
- "Let's dive in" or "Let's explore"
- "Here's the thing:" (before an insight)
- "In plain English:" (before technical explanation)
- "I think about it like..." (analogies to common experiences)
- "This actually changes how I..." (personal relevance)

**Avoid:**
- "Literally" (overused)
- "Honestly" (undermines credibility)
- "Just" in passive voice ("is just a wrapper") — say what it *is* instead
- Unexplained acronyms on first mention
- Jargon without context

## Grammar

- **Oxford comma:** YES
- **Contractions:** YES ("it's", "you're" — matches conversational tone)
- **Abbreviations:** Spell out first use, then abbreviate (Claude API → Claude API, then API)
- **Sentence length:** Mix short and medium (~10-20 words average)

## Visual Style

- **Color palette:** [Your primary color], [secondary], [accent] (pick 3 maximum)
- **Typography:** [Font family for headers], [font for body] (system fonts preferred for readability)
- **Callout format:** Always end with "Subscribe for [topic]" or "Follow me for [topic]"
```

### _config/formats.md

```markdown
# Video Formats and Specs

> This is reference material (Layer 3).
> Edit this file to change format requirements for all future videos.

## Script Structure

- **Opening Hook:** 0:00-0:30 (verbatim, under 30 seconds, grabs attention)
- **Problem or Context:** 0:30-3:00 (why should someone watch? what's at stake?)
- **Solution / Demo / Explanation:** 3:00-8:00 (the meat; use analogies, examples, code if applicable)
- **Takeaway and CTA:** 8:00-10:00 (1-2 sentences summary, subscription CTA)

**Total target length:** 8-10 minutes (1,500-2,200 words at ~180 wpm speaking pace)

## Video Specs

- **Aspect ratio (YouTube):** 16:9 (1920x1080)
- **Aspect ratio (Shorts):** 9:16 (1080x1920)
- **Frame rate:** 30fps
- **Codec:** H.264
- **Bitrate:** 6-8 Mbps (YouTube recommended)
- **Audio:** Stereo, 128kbps AAC

## Export Formats

1. **YouTube:** MP4, 1920x1080, 30fps, H.264
2. **YouTube Shorts:** MP4, 1080x1920, 30fps, H.264
3. **Web (fallback):** WebM, VP9, 8 Mbps

## Thumbnail Specs

- **Resolution:** 1280x720px (16:9 ratio)
- **Safe area for text:** Inner 1024x576 (avoid edges)
- **Font:** Bold, high-contrast color on background
- **Required elements:** Your face or logo (top-left corner), main text (center), visual hook (right side)
- **Validation:** Must be readable at 280x158px (YouTube homepage size)

## Pacing Guidelines

- **Opening Hook:** Fast, punchy, unexpected
- **Problem section:** Build momentum, ask questions
- **Demo/Solution:** Balance pacing (3-5 minutes is long; vary between talking head, b-roll, graphics)
- **Callout:** Calm, conversational (like talking to a friend)

## Music and Sound

- **Intro music:** [Specify: royalty-free source, tempo, length]
- **Background music:** Low volume during explanation, muted during demo
- **Sound effects:** Minimal, used for emphasis only (not gratuitous)

## Metadata

- **YouTube category:** Technology or Science & Technology
- **Default language:** English (US)
- **Visibility:** Public (unless otherwise noted)
```

### _config/workspace.md

```markdown
# Workspace Constraints

> This is reference material (Layer 3).
> Edit this file to change scope, glossary, and review gates.

## Scope

- **In scope:** Videos about AI tools, APIs, workflows, and how they change how software engineers work
- **Out of scope:** General life advice, non-technical opinion, politics, unverified AI safety claims
- **Audience:** Software developers aged 25-45, curious about AI but skeptical of hype

## Glossary

- **"AI tools":** Claude, ChatGPT, Copilot, and purpose-built services (Perplexity, You.com, etc.)
- **"API":** Application Programming Interface (explain on first mention in script)
- **"Prompt":** Instructions you give to an AI model (be specific: "prompt" is the instruction, "prompt engineering" is crafting better instructions)

## Review Gates

| Transition | Reviewer | What to Check |
|-----------|----------|------------------|
| script-lab → production | You | Does script match voice? Is opening hook compelling? Does timing work? |
| production → distribution | You | Do assets look on-brand? Is thumbnail readable? Do renders match script length? |

## Questions to Ask Before Each Stage

### Before script-lab Output

- Would *I* watch this video?
- Does the opening hook stop me from scrolling?
- Is the problem relatable (not just interesting)?
- Did I explain *why* this matters?

### Before production Output

- Do assets distract from the message or enhance it?
- Is color consistent with brand?
- Did I vary the visual style enough to hold attention?
- Does the thumbnail make sense without the title?

### Before distribution Output

- Does the description make someone click?
- Are chapter timestamps accurate?
- Would I share this video in a Slack message?
```

## Phase 7: Implementation Checklist

Your workspace is now ready to use. Before you start your first video:

1. **Create the directory structure** (you have the full tree above)
2. **Copy the files** (CLAUDE.md, CONTEXT.md, stage CONTEXT.md files, _config/ files)
3. **Customize _config files:**
   - Add your actual brand colors, fonts, and tone examples
   - Update Glossary with terms specific to your niche
   - Replace [placeholders] with your real constraints

4. **Test with your first video:**
   - Put research notes in script-lab/references/
   - Read script-lab/CONTEXT.md
   - Ask Claude to brainstorm angles and write a script draft
   - Review the output, edit in-place, then move to production/
   - Repeat for each stage

## What Happens Now

Each time you start work on a video:

1. **Open CLAUDE.md first** — it tells you which stage you're in
2. **Read that stage's CONTEXT.md** — it loads the right inputs and describes the work
3. **Claude loads _config/voice.md and _config/formats.md automatically** — your brand voice is baked in
4. **You review and edit output before moving to the next stage** — no surprises at the end
5. **If Claude makes the same mistake three times, you fix _config/ instead of output** — the factory improves, not the product

## Why This Works for Your Content

- **Your voice stays consistent** because voice.md is the single source of truth
- **Stages don't forget context** because each one loads the right files from Layer 3
- **You catch issues early** because you review at each handoff, not after production is done
- **New seasons scale** because the factory is stable — only output changes per-video
- **Claude never has to guess** what matters because CONTEXT.md is explicit about Inputs, Process, and Outputs

This is built to scale from "one video a month" to "one video a week" without changing how you work.

---

## Next Step

Create the folder structure, copy these files, then start with a topic. Your first video might take a few extra minutes as you refine the _config files, but by video three, Claude will know your brand voice deeply enough that scripts just *feel* right on the first pass.
