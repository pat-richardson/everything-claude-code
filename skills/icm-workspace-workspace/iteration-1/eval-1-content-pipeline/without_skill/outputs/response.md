# Organizing Your YouTube Content Pipeline with Claude Code

I'll help you set up a production-ready workspace structure that keeps your research, scripts, and production files organized while maintaining consistency with your brand voice across every session.

---

## The Problem We're Solving

Without proper organization, Claude forgets your brand guidelines between sessions, duplicates research efforts, and loses track of which assets belong to which video. Your brand voice is inconsistent. Asset chains break. You spend time re-explaining context instead of creating.

With the right structure, your workspace becomes self-documenting. Claude automatically finds your voice guide, loads relevant research, maintains production checklists, and delivers consistent outputs.

---

## Solution: The Content Pipeline Architecture

We'll use the **Interpretable Context Methodology (ICM)** — a five-layer filesystem hierarchy that separates stable reference material from working outputs. This prevents context bloat while ensuring your brand voice is always loaded.

### The Five Layers

| Layer | File(s) | Role | Edits |
|-------|---------|------|-------|
| 0 | `CLAUDE.md` | Workspace routing table | Rarely |
| 1 | Root `CONTEXT.md` | Stage execution flow | Rarely |
| 2 | Stage `CONTEXT.md` | Stage contract (inputs/outputs) | Per-stage |
| 3 | `_config/` | Brand voice, templates, style guides | When brand changes |
| 4 | `output/` | Per-run working artifacts | Every run |

The key insight: **Layer 3 is the factory. Layer 4 is the product.** Your voice guide goes in Layer 3 (immutable constraints). This run's script goes in Layer 4 (working artifact). Claude learns to distinguish "this is how you always write" from "this is what you produced last session."

---

## Directory Structure

Create this structure at `~/Documents/YouTube-Content/` (or wherever you keep your content):

```
youtube-content/
├── CLAUDE.md                          (Layer 0: Routing & identity)
├── CONTEXT.md                         (Layer 1: Execution flow)
├── _config/                           (Layer 3: The factory)
│   ├── voice.md                       (Brand tone, phrases, style)
│   ├── formats.md                     (Video templates, segment rules)
│   ├── glossary.md                    (Your terminology, catchphrases)
│   └── production-checklist.md        (QA gates, asset requirements)
├── research/
│   ├── CONTEXT.md                     (Layer 2: Research stage contract)
│   ├── references/                    (Research templates, sources)
│   │   ├── source-template.md
│   │   └── research-methods.md
│   └── output/                        (Layer 4: This run's research)
│       └── .keep
├── script-lab/
│   ├── CONTEXT.md                     (Layer 2: Writing stage contract)
│   ├── references/                    (Script templates, examples)
│   │   ├── segment-types.md           (Intro, transition, CTA formats)
│   │   ├── tone-examples.md           (Good/bad examples in your voice)
│   │   └── script-template.md
│   └── output/                        (Layer 4: This run's scripts)
│       └── .keep
├── production/
│   ├── CONTEXT.md                     (Layer 2: Production stage contract)
│   ├── references/                    (Production specs, guides)
│   │   ├── b-roll-specs.md            (Resolution, timing, formats)
│   │   ├── graphics-spec.md           (Font, colors, sizing)
│   │   ├── audio-spec.md              (Levels, formats, music sources)
│   │   └── editing-templates.md       (DaVinci Resolve, Premiere settings)
│   └── output/                        (Layer 4: Assets, renders, timelines)
│       └── .keep
└── distribution/
    ├── CONTEXT.md                     (Layer 2: Publishing stage contract)
    ├── references/                    (Channel data, platform specs)
    │   ├── platform-specs.md          (YouTube, TikTok, LinkedIn formats)
    │   ├── channel-data.md            (Playlists, series, collaborators)
    │   └── promotion-templates.md     (Social posts, email, Discord)
    └── output/                        (Layer 4: Published links, metrics)
        └── .keep
```

---

## Layer 0: CLAUDE.md (Workspace Identity & Routing)

Save this at `youtube-content/CLAUDE.md`:

```markdown
# YouTube Content Studio

One-stop production pipeline for AI tool explainers with consistent brand voice.
Organizes research, scripts, production assets, and distribution across four stages.

## Workspaces

- `/research` — Topic research, source gathering, outline creation
- `/script-lab` — Script writing, timing, voice-over planning, revisions
- `/production` — B-roll gathering, graphics, audio mixing, editing, exports
- `/distribution` — Publishing, promotion, analytics tracking, playlist updates

## Routing Table

| Task | Go To | Read First | Next Stage |
|------|-------|-----------|------------|
| Start a new video | /research | CONTEXT.md | → script-lab |
| Research is done, need scripts | /script-lab | CONTEXT.md | → production |
| Scripts locked, ready to build | /production | CONTEXT.md | → distribution |
| Video complete, publish & promote | /distribution | CONTEXT.md | — |
| Need brand guidance | _config/voice.md | Always available | — |
| Stuck on tone/phrasing | _config/voice.md → script-lab | Read examples | Continue |
| Asset specs unclear | _config/production-checklist.md | Check before uploading | — |

## Naming Conventions

- Video folders: `YYYYMMDD-slug` (e.g., `20240515-claude-canvas-tutorial`)
- Script files: `[slug]-script-draft.md`, `[slug]-script-final.md`
- Asset folders: `video`, `audio`, `graphics`, `b-roll`
- Exports: `[slug]-[version]-[date].mp4`

## Rules

1. **Read this file first** on every new task to understand which workspace you need.
2. **Always load Layer 3** (_config/) before creating output. Your voice guide, formats, and checklists are non-negotiable constraints.
3. **Never edit output in _config/** — if you find yourself fixing the same phrasing issue repeatedly in scripts, the problem is in _config/voice.md, not the output.
4. **Stage gates** — Don't move to the next stage until the current one is reviewed. See CONTEXT.md for review criteria.
5. **Assets stay local** — Production files live in /production/output. Publish links go in /distribution/output. Never mix them.

## Current State

- [ ] Layer 0: CLAUDE.md — in progress
- [ ] Layer 1: Root CONTEXT.md — in progress
- [ ] Layer 3: Brand voice (_config/) — draft
- [ ] Layer 2+4: Stage structure — ready to scaffold
- Next: Define brand voice guidelines
```

---

## Layer 1: Root CONTEXT.md (Execution Flow)

Save this at `youtube-content/CONTEXT.md`:

```markdown
# Content Pipeline Execution

## Execution Flow

| Stage | Input Source | Output Destination | Review Gate |
|-------|-------------|-------------------|-------------|
| research | Topic, outline ideas | research/output/ | You review key points & sources |
| script-lab | research/output/ findings | script-lab/output/ | You read script aloud, check timing |
| production | script-lab/output/ final script | production/output/ | You review final video preview |
| distribution | production/output/ final MP4 | distribution/output/ | You verify links, thumbnail, metadata |

## Stage Transitions

**Research → Script-Lab:**
- Research output includes outline, key points, source list
- Read research summary before writing
- Verify all claims are sourced
- If research unclear, edit research/output and re-enter script-lab

**Script-Lab → Production:**
- Script is locked (no major rewrites after this)
- Timing marked on script (e.g., "0:00-0:15: intro")
- Voice-over notes included if you're recording yourself
- Review checklist in production/CONTEXT.md before handing off

**Production → Distribution:**
- Final MP4 exported and tested
- Metadata file created with title, description, tags
- Thumbnail finalized
- Upload checklist completed

**Distribution → Archive:**
- Published links verified
- Video saved to archive with metadata JSON
- Playlist/series updated if applicable

## Handoff Rules

- Output of stage N becomes input of stage N+1
- Review and edit output files before passing to next stage
- Use CONTEXT.md in each stage to understand what to produce
- If you edit the same thing repeatedly (tone, phrasing, format), fix _config/ instead

## Emergency Procedures

- **Need to rewrite script mid-production?** Update script-lab/output/, then update production/output/ with new timings
- **New brand voice mid-project?** Update _config/voice.md, then re-read script/production stage CONTEXT.md to propagate changes
- **Asset missing?** Check production/references/ for specs, then check references/ in each stage for templates
```

---

## Layer 2: Stage CONTEXT Files

### Research Stage: `research/CONTEXT.md`

```markdown
# Research Stage

Gather sources, identify key points, create outline and talking points.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/glossary.md | All | Your terminology & catchphrases |
| Layer 3 | research/references/research-methods.md | Research Process | How to structure findings |
| Layer 3 | _config/voice.md | Tone, Audience | What angle to take |

## Process

1. Read all Inputs above
2. Research the topic using: articles, documentation, tutorials, GitHub repos, community discussions
3. Extract 5-8 key teaching points
4. Organize as: Title → Context → Key Points → Sources
5. Create talking points outline (rough timing: ~100 words per minute of video)
6. List all sources with URLs and author attribution
7. Flag any gaps or unclear points

## Outputs

- **output/research-notes.md** — Sources, quotes, key points (500-1500 words)
- **output/outline.md** — Teaching points in order, rough timing, visual ideas (~300 words)
- **output/sources.md** — URL list with authors, dates, reliability assessment

## Verify

- [ ] All sources cited with working URLs and attribution
- [ ] Key points align with your brand voice (check glossary)
- [ ] Outline matches your typical video length (e.g., 8-15 min)
- [ ] No contradictions between sources
- [ ] Unclear points flagged for script-lab clarification
```

### Script-Lab Stage: `script-lab/CONTEXT.md`

```markdown
# Script-Lab Stage

Transform research into a spoken script with your brand voice, timing, and personality.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | All | Your tone, phrases, style rules |
| Layer 3 | _config/glossary.md | All | Terminology & catchphrases |
| Layer 3 | script-lab/references/segment-types.md | Intro, CTA | Format templates |
| Layer 3 | script-lab/references/tone-examples.md | Good/Bad Examples | Your voice in practice |
| Layer 4 | ../research/output/outline.md | All | Teaching points, timing |
| Layer 4 | ../research/output/research-notes.md | Key Points | Deep context for ad-libs |

## Process

1. Read all Inputs in order above
2. Draft intro (10-15 seconds) in your voice
3. Write main segments in teaching-point order
4. Add transitions that match your personality
5. Write CTA (call-to-action) matching template
6. Mark timing on every segment (e.g., "0:00-0:15 INTRO")
7. Flag any ad-lib moments or jokes you'll add
8. Read script aloud to your audience and time it
9. Adjust pacing if video is too long/short

## Outputs

- **output/[slug]-script-draft.md** — Full script with timings, ~600-1500 words (~5-15 min video)
- **output/voice-notes.md** — Tone reminders, emphasis points, personality cues for voice-over
- **output/visual-planning.md** — Where B-roll goes, graphics moments, on-screen text callouts

## Verify

- [ ] Script sounds like you (matches voice.md examples)
- [ ] All terminology matches glossary.md
- [ ] Timing is accurate (read aloud and measure)
- [ ] All transitions smooth and natural
- [ ] CTA present and compelling
- [ ] No phrasing that contradicts recent brand voice updates
```

### Production Stage: `production/CONTEXT.md`

```markdown
# Production Stage

Assemble B-roll, graphics, audio, and effects into a polished video file.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/production-checklist.md | All | QA gates, asset specs |
| Layer 3 | production/references/b-roll-specs.md | Resolution, Timing | Video format requirements |
| Layer 3 | production/references/graphics-spec.md | Font, Colors, Sizing | Design consistency |
| Layer 3 | production/references/audio-spec.md | Levels, Format, Sources | Audio mixing rules |
| Layer 3 | production/references/editing-templates.md | Timeline presets, Effects | Editor settings |
| Layer 4 | ../script-lab/output/[slug]-script-final.md | Timings, Visual notes | Video structure |
| Layer 4 | ../script-lab/output/visual-planning.md | B-roll moments, Graphics | Asset placement map |

## Process

1. Read all Inputs above
2. Create video file structure: one folder per asset type (video, audio, graphics, music)
3. Gather/download B-roll matching visual-planning.md
4. Import graphics assets, check against graphics-spec.md
5. Record or import voice-over audio
6. Place on timeline matching script timings
7. Sync B-roll with voice-over
8. Add graphics and text callouts per visual-planning.md
9. Color correct and add effects
10. Render preview MP4 for review
11. Render final export with metadata

## Outputs

- **output/video/** — Organized B-roll, graphics, audio sources
- **output/timeline.xml** or **.aep** — Editing project (DaVinci/Premiere/Final Cut)
- **output/[slug]-preview.mp4** — Rough cut for feedback (~50MB)
- **output/[slug]-final.mp4** — Final export for distribution (~200-500MB)
- **output/metadata.json** — Title, description, tags, thumbnail notes

## Verify

- [ ] All graphics match graphics-spec.md (font, colors, sizing)
- [ ] Audio levels pass spec (check audio-spec.md)
- [ ] Video resolution matches b-roll-specs.md
- [ ] Timing matches script (no audio/video sync issues)
- [ ] All sources credited in metadata
- [ ] No copyrighted music without license
- [ ] No color grading or effects that clash with brand
```

### Distribution Stage: `distribution/CONTEXT.md`

```markdown
# Distribution Stage

Publish video to YouTube/platforms, create social promotions, track performance.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/voice.md | Tone, Phrases | Promotion copy tone |
| Layer 3 | distribution/references/platform-specs.md | All | Video specs, limits per platform |
| Layer 3 | distribution/references/promotion-templates.md | All | Social post templates |
| Layer 3 | distribution/references/channel-data.md | Playlists, Series | Metadata for YouTube |
| Layer 4 | ../production/output/metadata.json | All | Video title, description, tags |
| Layer 4 | ../production/output/[slug]-final.mp4 | — | Final video file |

## Process

1. Read all Inputs above
2. Create YouTube metadata: title (60 chars), description (2000 chars), tags (6-10)
3. Create custom thumbnail (matching brand colors/style)
4. Select playlist/series from channel-data.md
5. Write 3-5 social media promotions using promotion-templates.md
6. Customize for each platform: YouTube, LinkedIn, Twitter/X, TikTok
7. Schedule posts or publish immediately
8. Monitor first 24 hours for engagement and fix any errors
9. Update analytics spreadsheet with view count, watch time

## Outputs

- **output/[slug]-youtube-metadata.md** — Title, description, tags, playlist
- **output/[slug]-social-posts.md** — Per-platform promotion copy
- **output/[slug]-published.json** — Video URLs, timestamps, thumbnail URL
- **output/analytics-update.md** — Views, watch time, engagement at 24h, 7d, 30d

## Verify

- [ ] Title and description match channel voice (check voice.md)
- [ ] Tags are relevant and follow platform guidelines
- [ ] Thumbnail is readable at 100x100px
- [ ] Links in description are working
- [ ] Social posts are written in your voice
- [ ] Video duration matches metadata
- [ ] Playlist assignment is correct
```

---

## Layer 3: The Brand Factory

### `_config/voice.md` — Your Brand Voice Guide

```markdown
# Brand Voice & Style Guide

> This is reference material (Layer 3 — the factory).
> Edit this file when your brand voice changes.
> All output will reflect these guidelines.

## Core Tone

**Formality:** Conversational, friendly, never corporate
**Audience:** Developers and product designers curious about AI tools
**Energy:** Enthusiastic but not hype; credible over trendy
**Personality:** Helpful teacher who's genuinely excited about the subject

## Your Phrases (What You Always Say)

Use these:
- "Let me show you..." (preferred intro)
- "Here's the thing..." (transition to key insight)
- "This is where it gets interesting..." (before best feature)
- "You can..." (when describing what viewers can do)
- "In practice..." (before real-world example)

Never use:
- "Obviously" (makes viewers feel dumb)
- "Just" (minimizes what you're teaching)
- "Honestly" (you should always be honest)
- "Basically" (lazy explanation)
- "Actually" (defensive)

## Grammar & Mechanics

- **Oxford comma:** YES (always)
- **Contractions:** YES (you're, it's, I'm — sounds natural)
- **Abbreviations:** Spell out on first use, then abbreviate (e.g., "Large Language Model (LLM)")
- **Pacing:** Use short sentences. Mix 5-word and 15-word sentences. 
- **Emphasis:** Use bold sparingly, **only for key terms**, not for emotion
- **Links:** Inline [like this](url) in scripts, not at the end

## Example: Good vs Bad

**Bad (stiff, corporate):**
> Artificial Intelligence tools have revolutionized the digital landscape in an unprecedented manner. Users may leverage such technologies to augment their productivity metrics.

**Good (your voice):**
> AI tools are changing how we work. You can use them to save hours every week on research, writing, and brainstorming.

**Bad (trying too hard):**
> OMG guys, this AI thing is literally INSANE and will blow your mind!

**Good (enthusiastic but credible):**
> This is one of the most practical AI features I've tested. You can actually use it today to ship code faster.

## Intro Formula

Your intros always follow this pattern:
1. Hook (one sentence about why to care)
2. What we're covering (2-3 items)
3. How long it takes (realistic time estimate)

Example:
> I'm going to show you how Claude Canvas can cut your design iteration time in half. We'll cover how it works, when to use it instead of the regular editor, and three real workflows where it changes the game. This takes about eight minutes.

## CTA (Call-to-Action) Formula

Your CTAs always:
1. Remind what you taught
2. Suggest next step
3. Invite follow-up/community

Example:
> You now know how to use Claude Canvas for rapid prototyping. Try it on your next design project and see how much faster iteration gets. Drop a comment if you hit any issues or discover a cool workflow.

## Brand Colors (for graphics/thumbnails)

- Primary: Your dominant color
- Secondary: Accent color
- Text: High contrast on thumbnails
- Avoid: Oversaturation, neon, clashing combos

## Tone Checklist Before Publishing

Read your final script and ask:
- [ ] Would I say this to a friend? (if not, rephrase)
- [ ] Did I avoid corporate jargon?
- [ ] Did I use at least one of my signature phrases?
- [ ] Are contractions there? (sounds natural, not robotic)
- [ ] Would my audience feel smart after watching? (not talked down to)
```

### `_config/formats.md` — Video Templates & Segment Rules

```markdown
# Video Formats & Segment Types

> This is reference material (Layer 3 — the factory).
> Edit when you change your standard segment patterns.

## Standard Video Length

- Short explainer: 5-8 minutes (optimal for YouTube algorithm)
- Deep dive: 12-15 minutes (explores tool thoroughly)
- Series episode: 8-10 minutes (consistent with your series)

## Intro Segment (Always 10-15 seconds)

- Hook: why this matters (1 sentence)
- What we'll cover (list 2-3 items)
- Time commitment ("this takes about 8 minutes")

Template:
```
[INTRO - 10-15 seconds]

I'm showing you [topic]. We'll cover [thing 1], [thing 2], and [thing 3]. This takes about [X] minutes.

[MAIN CONTENT]
```

## Main Content Segments (per teaching point)

Each major point follows this structure:
1. **Setup** — "Here's the thing..."
2. **Explanation** — Show the UI, demonstrate the feature
3. **Example** — "In practice, here's how you'd use this..."
4. **Connection** — "Why does this matter?" or "What makes this useful?"

## B-Roll Rules

- Always show the tool being used (not just your face)
- Change clips every 5-10 seconds (keeps visual interest)
- Audio leads B-roll by 1-2 seconds (tell them first, then show)
- Include at least one real-world example workflow

## Transition Segments (3-5 seconds each)

Use your signature transitions:
- "Here's the thing..." (moving to new point)
- "This is where it gets interesting..." (before highlight feature)
- "Let me show you..." (before demo)
- "In practice..." (before real example)

## CTA Segment (last 10 seconds)

- Recap what you taught (1 sentence)
- Next step suggestion (what should they try?)
- Community engagement (comment, subscribe, DM)

Template:
```
[CTA - 8-12 seconds]

You now know [main takeaway]. Try it on [use case] and let me know in the comments what you discover. Thanks for watching!
```

## Pacing Rules

- Average: 140 words per minute when spoken naturally
- Longer pauses for complex ideas (give viewers time to process)
- Shorter sentences for fast sections (e.g., feature walkthrough)
- Never read at 150+ WPM (sounds rushed)

## Series Structure (if applicable)

If you do a series on related topics:
- Intro consistent across series
- Middle section unique per episode
- Outro consistent ("Next time we'll cover...")

Example:
```
[SERIES INTRO - 10 sec - same every episode]
Welcome back to the [Series Name]. Last time we covered X. Today we're diving into Y.

[UNIQUE CONTENT - main section]

[SERIES OUTRO - 8 sec - same every episode]
Next time: [teaser]. Subscribe so you don't miss it!
```
```

### `_config/glossary.md` — Your Terminology & Catchphrases

```markdown
# Glossary & Catchphrases

> This is reference material (Layer 3 — the factory).
> Use this to keep your terminology consistent across all videos.

## Technical Terms (How You Refer To Them)

| Term | Your Version | Why |
|------|--------------|-----|
| Large Language Model | Claude, or "AI model" if generic | Specific > generic |
| User Interface | "UI" or "interface" | Never say "UX" when you mean UI |
| Application Programming Interface | "API" or "integration" | Depends on context |
| Machine Learning | "AI" or "ML" | Used interchangeably in your content |
| Feature | "feature" or "capability" | "Capability" emphasizes what user can do |

## Your Catchphrases

- "Let me show you..." — opening demos
- "Here's the thing..." — introducing a key insight
- "In practice..." — before real-world examples
- "This is where it gets interesting..." — before the cool part
- "You can..." — when describing user actions
- "[Tool] does X, but..." — comparing tools fairly

## Topics You Cover Frequently

- AI tools for developers → [your angle on it]
- Productivity with AI → [your take]
- AI safety/ethics → [your position, if you cover this]
- Industry trends → [how you frame them]

## Brands/Products You Mention

How to reference them:
- **Claude:** "Claude" or "Claude by Anthropic" (first mention)
- **ChatGPT:** "ChatGPT" (neutral, fair comparison)
- **Other tools:** [list your specific references]

## Phrases To Avoid

- "Obviously" — makes viewers feel dumb
- "Just" — minimizes the teaching
- "Basically" — lazy explanation
- "Actually" — defensive tone
- "Honestly" — implies you're not always honest
```

### `_config/production-checklist.md` — QA Gates Before Publishing

```markdown
# Production Checklist

> This is reference material (Layer 3 — the factory).
> Check this before uploading any video.

## Final Script Review (Before Production)

- [ ] Script reads naturally aloud (tested by reading it out loud)
- [ ] Timing is accurate (within 10 seconds of script estimate)
- [ ] No filler words ("um," "uh," "like") in transcript
- [ ] All claims sourced (research/output/sources.md)
- [ ] Intro hook is compelling
- [ ] CTA is clear and actionable
- [ ] Voice guide checklist passed (corporate jargon, contractions, tone)

## Audio Review (Before Final Export)

- [ ] Voice-over is clear (no background noise)
- [ ] Levels consistent throughout (-6dB to -3dB peak)
- [ ] Background music matches tone (not distracting)
- [ ] No harsh plosives or mouth clicks
- [ ] Audio sync to video is perfect (check at 0:00, middle, end)

## Visual Review (Before Final Export)

- [ ] B-roll matches spoken content (shows what you're describing)
- [ ] Graphics are legible at 100x100px (YouTube thumbnail size)
- [ ] Colors match brand guidelines (check _config/)
- [ ] Text on screen is readable (minimum 24pt font)
- [ ] No flickering or jarring transitions
- [ ] Frame rate consistent (24, 30, or 60 fps — not mixed)

## Metadata Review (Before Upload)

- [ ] Title is compelling and under 60 characters
- [ ] Description is accurate and under 2000 characters
- [ ] Tags are relevant (check distribution/references/platform-specs.md)
- [ ] Thumbnail is readable and matches brand
- [ ] Category is correct (Technology, Education, etc.)
- [ ] Playlist assignment is correct (if part of series)

## Compliance Review

- [ ] All music and B-roll properly licensed or attributed
- [ ] No copyrighted content used without permission
- [ ] No trademarks used in misleading way
- [ ] Links in description all work and are correct
- [ ] No broken timestamps

## Final Check

- [ ] Video duration matches metadata
- [ ] Watch the whole thing once (catch anything you missed)
- [ ] Ask: Would I click on this if I saw it in my feed?
```

---

## How to Use This Workspace in Practice

### When Starting a New Video

1. **Go to `/research` workspace**
2. Read `CONTEXT.md` (50 seconds)
3. Read `_config/voice.md` (brand tone reminder)
4. Start researching your topic
5. Output to `research/output/`

### When Ready to Write

1. **Go to `/script-lab` workspace**
2. Read `/script-lab/CONTEXT.md` (understand inputs and outputs)
3. Read `_config/voice.md` again (internalize your tone)
4. Read `_config/glossary.md` (terminology consistency)
5. Read research/output/ files from previous stage
6. Write script to `script-lab/output/`
7. Read script aloud and time it
8. Check against `_config/voice.md` examples

### When Ready to Produce

1. **Go to `/production` workspace**
2. Read all `production/CONTEXT.md` and reference files
3. Check `_config/production-checklist.md` requirements
4. Build your timeline
5. Export preview, review, iterate
6. Export final MP4
7. Create metadata.json

### When Publishing

1. **Go to `/distribution` workspace**
2. Read `distribution/CONTEXT.md`
3. Create YouTube metadata from template
4. Write social posts using your voice
5. Publish and track analytics

---

## Why This Structure Works

**Prevents Lost Context**
- Your brand voice (Layer 3) is always available and consistent
- Stage CONTEXT files spell out exactly what to produce
- No hunting through old videos to remember your style

**Eliminates Rework**
- You're not explaining your brand voice every session
- Reference materials (templates, specs) are standardized
- Handoffs between stages are clear and documented

**Makes Revision Easy**
- Need to tweak your voice? Edit `_config/voice.md` once
- All future scripts automatically reflect the change
- No need to rewrite old scripts (fix the factory, not the product)

**Scales With Your Channel**
- Start with 2-3 videos using this structure
- After 10 videos, you have a production template
- After 50, you barely need Claude — the workflow is self-documenting

**Multi-Device Friendly**
- Keep everything in cloud storage (Google Drive, Dropbox, iCloud)
- Edit in your favorite editor on any device
- CLAUDE.md and _config/ are plain Markdown (portable)

---

## Next Steps

1. **Create the directory structure** (10 minutes)
   ```bash
   mkdir -p ~/Documents/YouTube-Content/{_config,research/{references,output},script-lab/{references,output},production/{references,output},distribution/{references,output}}
   touch ~/Documents/YouTube-Content/**/.keep
   ```

2. **Fill in Layer 0 & 1** (15 minutes)
   - Copy CLAUDE.md and root CONTEXT.md above into place
   - Customize project name, video length, and workflow stages if needed

3. **Define Your Brand Voice** (30-60 minutes)
   - Customize `_config/voice.md` with your actual tone, phrases, and examples
   - This is the most important file — invest time here

4. **Create Stage Reference Files** (45 minutes)
   - Customize `_config/glossary.md` with your terminology
   - Create segment templates in `script-lab/references/`
   - Add your production specs in `production/references/`

5. **Test With One Video** (1-2 hours)
   - Create your next video using this structure
   - Notice where the workflow feels smooth vs bumpy
   - Edit CONTEXT.md files to match your actual process

6. **Load the Workspace in Claude Code**
   - When you open the workspace in Claude Code, this structure becomes self-evident
   - Claude loads CLAUDE.md first, understands your routing, reads relevant stage files
   - Your brand voice is always loaded from Layer 3

---

## Key Principles

**One stage = One Claude session**
Don't try to research, write, and produce in a single session. Your context window has limits. Each stage is a focused conversation.

**The factory runs itself**
Once `_config/` is complete, you rarely edit it. It shapes every output automatically.

**Handoff, then review**
Output from stage N is input to stage N+1. Review it before passing it forward. This is where quality control happens.

**Fix the factory, not the product**
If you're rewriting the same phrasing issue in every script, the problem is in `_config/voice.md`. Update the constraint, not the output.

**Start small**
Create this structure with 2-3 reference files. As you create videos, the structure grows naturally. Don't over-engineer before your first video.

---

## Customization Notes

### If You Work With a Team

Add a `_config/approval-gates.md` documenting who reviews each stage before handoff.

### If You Collaborate With Claude

Load the `CLAUDE.md` at the start of each session. Claude will automatically understand your routing, load relevant stage files, and maintain consistency.

### If You Publish Across Multiple Platforms

Expand `distribution/references/` with platform-specific templates (YouTube, TikTok, LinkedIn formats differ).

### If You Do Multiple Series

Add `_config/series-templates.md` with per-series intros, outros, and running themes.

---

## File Checklist

Before your first video, verify you have:

```
youtube-content/
├── CLAUDE.md                                    ✓
├── CONTEXT.md                                   ✓
├── _config/
│   ├── voice.md                                 ✓
│   ├── glossary.md                              ✓
│   ├── formats.md                               ✓
│   └── production-checklist.md                  ✓
├── research/
│   ├── CONTEXT.md                               ✓
│   ├── references/
│   │   └── [optional: research templates]
│   └── output/.keep                             ✓
├── script-lab/
│   ├── CONTEXT.md                               ✓
│   ├── references/
│   │   ├── segment-types.md                     ✓
│   │   └── tone-examples.md                     ✓
│   └── output/.keep                             ✓
├── production/
│   ├── CONTEXT.md                               ✓
│   ├── references/
│   │   ├── b-roll-specs.md                      ✓
│   │   └── [other specs as needed]
│   └── output/.keep                             ✓
└── distribution/
    ├── CONTEXT.md                               ✓
    ├── references/
    │   ├── platform-specs.md                    ✓
    │   └── promotion-templates.md               ✓
    └── output/.keep                             ✓
```

---

## Final Note

This workspace structure solves the core problem: **Claude forgets your brand between sessions.**

With proper organization, your voice guide, formats, and production specs are always available. Claude loads them automatically. Every stage hands off clearly to the next. You spend time creating, not re-explaining context.

Your brand voice becomes a decision made once (in `_config/voice.md`), then applied consistently across 50+ videos without repetition.

Welcome to consistent, scalable video production. Your future self will thank you.
