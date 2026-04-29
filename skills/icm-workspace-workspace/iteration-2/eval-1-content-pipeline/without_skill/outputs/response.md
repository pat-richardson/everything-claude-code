# YouTube Content Creation Workflow with Claude

## Challenge Summary

You're creating YouTube videos about AI tools and need to maintain consistency across:
- Research notes and source materials
- Video scripts and talking points
- Production files (thumbnails, graphics, metadata)
- Brand voice guidelines that Claude should reference throughout

Without proper organization, you risk inconsistency, losing context between sessions, and Claude forgetting your unique perspective and style.

---

## Solution: A Structured Content Pipeline

### 1. Directory Structure

Create this folder hierarchy to keep everything organized and discoverable:

```
YouTube-Content/
├── brand/                          # Your voice, rules, and standards
│   ├── brand-voice-guide.md       # Tone, vocabulary, humor style, audience
│   ├── video-format-guidelines.md # Length, pacing, thumbnail style, CTAs
│   └── values-and-topics.md       # What you care about, what to avoid
│
├── research/                       # Raw materials
│   ├── ai-tools-database.md       # Master list of tools (name, description, links)
│   ├── trends-and-news/           # Current AI developments by quarter
│   ├── competitor-analysis/       # What other creators are covering
│   └── source-library.md          # Important links, papers, docs
│
├── scripts/                        # Video scripts at various stages
│   ├── templates/                 # Script format template
│   ├── brainstorming/             # Raw video ideas (one file per concept)
│   ├── outlines/                  # Detailed outlines (video-name-outline.md)
│   ├── drafts/                    # Working scripts (video-name-draft.md)
│   └── final/                     # Published versions (video-name-final.md)
│
├── production/                     # Visual and metadata files
│   ├── thumbnails/                # Thumbnail templates, designs, specs
│   ├── graphics/                  # Logos, overlays, charts, screenshots
│   ├── video-metadata.csv         # Title, description, tags, timestamps
│   └── thumbnails-info.md         # Design guidelines, ratios, dos/don'ts
│
├── planning/                       # Project management
│   ├── content-calendar.md        # Publishing schedule
│   ├── series-plans/              # Multi-part video plans
│   └── quarterly-themes.md        # Focus areas per quarter
│
└── reference/                      # Quick lookup files
    ├── frequently-used-tools.md   # Top 5-10 tools you review often
    └── common-mistakes-to-avoid.md # Learnings from past videos
```

### 2. Brand Voice Reference (Critical for Claude)

Create `YouTube-Content/brand/brand-voice-guide.md` with sections like:

```markdown
# My Brand Voice Guide

## Tone
- Conversational but knowledgeable (expert who teaches, not talks down)
- Enthusiastic about AI potential, skeptical about overhype
- Practical: "Here's what you actually need to know"
- Mix of humor (self-deprecating is fine, cynical is not)

## Key Vocabulary
- Use: "AI tools," "generative models," "workflow," "integration"
- Avoid: "crypto," "blockchain," "moonshot" (unless relevant)
- Shorthand I use: "AI stack," "automation win," "real use case"

## Audience Perspective
- Target: Content creators, small business owners, developers (entry-level)
- Assume: They want results, not theory
- Avoid: Heavy math, academic papers without translation

## Signature Elements
- Always lead with the problem it solves
- Include a real-world workflow example
- End with a take-away the audience can use TODAY
- Use [format]: Problem → Tool → Walkthrough → Why It Matters

## What I Never Do
- Promote tools I haven't tested
- Make clickbait claims ("This AI Replaces You")
- Ignore limitations or trade-offs
```

### 3. Research Organization

Create `YouTube-Content/research/ai-tools-database.md`:

```markdown
# AI Tools Database

## Format for Each Tool
- **Name**: [Tool name]
- **Category**: [Image generation, Writing, Video, Code, etc.]
- **Use Case**: [One sentence on what problem it solves]
- **Status**: [Not tested / Tested / Reviewed on video]
- **Key Features**: [3-4 bullet points]
- **Link**: [Official site]
- **Last Updated**: [Date]
- **Notes**: [Anything Claude should know: pricing gotchas, limitations, best for X type of user]

## Example
- **Name**: Claude AI
- **Category**: Writing, Coding, Research
- **Use Case**: General-purpose AI assistant that understands context
- **Status**: Reviewed on video
- **Key Features**: Long context window, good code understanding, can summarize documents
- **Link**: https://claude.ai
- **Last Updated**: 2026-04-29
- **Notes**: Free tier is generous. API is reliable. Great for scripting but don't oversell it as "coding replacement"
```

### 4. Script Template

Create `YouTube-Content/scripts/templates/script-template.md`:

```markdown
# Script Template: [Video Title]

## Metadata
- **Video Title**: [Your title here]
- **Target Length**: [5 min, 10 min, 15 min?]
- **Key Takeaway**: [One sentence: what should viewers walk away knowing?]
- **CTA**: [Subscribe, check description, test the tool]

## Hook (First 10 seconds)
[Open with problem or surprising fact. No "Hello everyone." Get straight to it.]

## Problem Setup
[Why should your audience care? What's the pain point?]

## Solution Demo
[Show or explain the tool. Walk through actual workflow.]

## Real Example
[Concrete use case from your experience or audience requests.]

## Comparison/Why This One
[Against alternatives. What makes it unique?]

## Limitations & Gotchas
[Be honest about trade-offs. This builds trust.]

## Your Take
[Your opinion. "I use this because..." or "Not for everyone, but great if you're trying to..."]

## Call to Action
[Specific, relevant CTA. Not generic.]

## Timestamps (Filled in During Editing)
- 0:00 - Hook
- 0:30 - Problem
- 2:15 - Demo starts
- etc.
```

### 5. Planning and Calendar

Create `YouTube-Content/planning/content-calendar.md`:

```markdown
# Content Calendar

## Q2 2026 Theme: "AI for Creators"

| Date | Video | Status | Research Done? | Script Status | Publish? |
|------|-------|--------|---|---|---|
| May 5 | "Top 5 AI Writing Tools for Scripts" | Brainstorm | No | - | - |
| May 12 | "Claude AI vs ChatGPT for Video Scripts" | Planning | Partial | Outline | - |
| May 19 | "Auto-generate Captions with AI" | - | No | - | - |

## Series: "Automation Deep Dives" (3-part series)
1. The Problem: Manual video editing wasted 20 hours/month
2. The Tool: [Specific AI tool for editing]
3. The Result: [Real metrics]
```

### 6. Metadata and Production Info

Create `YouTube-Content/production/video-metadata.csv`:

```
Video Title,Description Template,Tags,Thumbnail Notes,Upload Date
"Top 5 AI Writing Tools","In this video I test [tool] for [use case]... Here's what happened. 00:00 Hook 05:15 Demo...",ai tools writing tools productivity,Red background + tool logo,2026-05-05
```

---

## How to Use This with Claude

### Session 1: Script Development
Upload your brand-voice-guide.md at the start. Say:
> "I'm working on a script about [tool]. My brand guide is attached. Create an outline that matches my voice and structure."

### Session 2: Research Phase
Upload ai-tools-database.md and trends file. Say:
> "Help me research 5 new AI tools for [topic]. Check my database for what I've already covered, and suggest tools I should test."

### Session 3: Script Refinement
Upload brand guide + your script draft. Say:
> "Review my script draft for consistency with my brand voice. Does it follow my problem→solution→example format?"

### Session 4: Planning & Strategy
Upload content-calendar.md + competitor analysis. Say:
> "What topics should I prioritize next based on trends and what I've already covered?"

---

## Implementation Checklist

- [ ] Create the folder structure above
- [ ] Write your brand-voice-guide.md (this is the foundation)
- [ ] Create ai-tools-database.md and add 10 tools you've covered
- [ ] Save the script template and create 1 example outline
- [ ] Set up video-metadata.csv with your last 5 videos
- [ ] Add these files to a cloud folder (Google Drive, Dropbox) or keep in a git repo for version control
- [ ] At the start of each Claude session, upload the relevant files from your `/brand` folder

---

## Pro Tips

1. **Version Control**: Use a simple date system in your drafts folder: `script-tool-name-2026-04-29-v2.md`. Keep old versions for 2 weeks.

2. **Quick Lookup**: Keep a `frequently-used-tools.md` file with your top 5 tools so Claude can reference them without re-reading a 200-line database.

3. **One File Per Video**: In your outlines and drafts folders, one file = one video. This keeps files focused and searchable.

4. **Brand Evolution Log**: Add a section to brand-voice-guide.md called "Recent Updates" so Claude knows if your voice has shifted.

5. **Reusable Sections**: Create a `scripts/templates/common-segments.md` with recurring segments like your outro or tool comparison framework.

6. **Upload Once, Reference Often**: If you're in a session working on multiple scripts, upload your brand guide once at the start. Claude will remember it for the whole session.

---

## Expected Outcomes

With this system in place:

- Claude will maintain your brand voice consistently across scripts
- You'll never duplicate research or forget tools you've tested
- Planning becomes faster (you have a master calendar and database)
- Production metadata is ready to go (for YouTube, thumbnails, descriptions)
- Future you can jump into any video at any stage without context loss
- You can track what you've covered and identify gaps in your content strategy

---

## Next Steps

1. Create the folder structure today
2. Write your brand-voice-guide.md (30 minutes)
3. In your next Claude session, upload the guide and say: "Help me build my tools database"
4. Share the folder link with Claude at the start of each session, or upload key files (brand guide is most critical)

This structure scales: you can use it for 10 videos or 100 videos. The key is keeping your brand guide at the center—that's what makes Claude truly understand your perspective.
