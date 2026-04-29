# Summary: Interpretable Context Methodology (ICM)

## Core thesis

ICM replaces code-based agent orchestration frameworks (LangChain, CrewAI, AutoGen) with a filesystem. Numbered folders represent stages, markdown files carry prompts and context, and local scripts handle mechanical work. A single orchestrating agent reads different files at different moments — the folder hierarchy _is_ the coordination logic. The key claim: for sequential, human-reviewed workflows, framework-level orchestration is overkill and the filesystem already solves the problem.

## Five design principles

One stage, one job (Unix/Parnas). Plain text as the interface (Kernighan & Pike). Layered context loading (prevent the "lost in the middle" problem rather than compress it). Every output is an edit surface (mixed-initiative / direct manipulation). Configure the factory, not the product (set up workspace once, run pipeline many times).

## The five-layer context hierarchy

This is the architectural heart of the paper:

- **Layer 0** — `CLAUDE.md` — workspace identity/navigation (~800 tokens)
- **Layer 1** — root `CONTEXT.md` — task routing across stages (~300 tokens)
- **Layer 2** — stage `CONTEXT.md` — stage contract with Inputs/Process/Outputs (~200–500 tokens)
- **Layer 3** — `references/` and `_config/` — stable material (voice, design system, conventions) — _"the factory"_
- **Layer 4** — `output/` directories — per-run working artifacts — _"the product"_

The Layer 3 vs Layer 4 distinction is the most consequential idea in the paper. Reference material should be internalized as constraints; working artifacts should be processed as input. Mixing them in an undifferentiated context window forces the model to sort them itself.

## Architecture recommendations

Numbered folders (`01_research/`, `02_script/`, `03_production/`) encode execution order. Each stage directory has its own `CONTEXT.md`, `references/`, and `output/`. Stage contracts declare Inputs explicitly — _which_ Layer 3/4 files and _which sections_ — making context scoping editable and auditable rather than hidden in code. Output of stage _N_ becomes input of stage _N+1_, with a human review gate at every boundary. `_config/` and `shared/` hold workspace-wide reference material. Everything is Git-compatible and portable; handoff is copying a folder.

## Context efficiency claim

Each stage receives 2,000–8,000 focused tokens versus ~42,000 for a monolithic approach loading all stages, references, and prior outputs. Grounded in Liu et al.'s "lost in the middle" finding — models degrade when relevant info is buried. ICM prevents the problem rather than treating it with post-hoc compression (LLMLingua etc.).

## Where it fits vs where it doesn't

**Fits:** sequential, human-reviewed, repeatable workflows — content pipelines, deck generation, research synthesis, policy analysis. **Doesn't fit:** real-time multi-agent collaboration, high-concurrency multi-user systems, AI-driven mid-pipeline branching. The authors are honest that ICM is not a framework replacement across the board.

## Notable empirical observation

A U-shaped intervention pattern emerged across 33 practitioners: heavy editing at stage 1 (direction-setting), light editing in middle stages, heavy editing at final stage (alignment/debugging). Middle stages get trust because they're anchored by prior output plus stable reference material.

## Future directions worth flagging

The multi-pass compiler analogy is the most useful mental model the paper offers, and it drives the proposed roadmap: **output provenance** (embedding markers linking output sections to source instructions), **cross-stage verification** (a `Verify` section in stage contracts that checks consistency with earlier stages), and an **edit-source-not-output** discipline — tracking recurring output edits as diagnostic signals pointing to fixable source-level problems (contract amendments, voice guide gaps).

### Future Directions — In Plain Terms

The authors admit ICM has a real weakness: when something goes wrong in the final output, there's no easy way to find *why*. You can see every intermediate file, but you still have to read through them yourself and guess which one caused the problem. Their proposed fixes borrow ideas from how software compilers and debuggers have worked for decades.

### 1. Output provenance — "where did this sentence come from?"

Right now, if a phrase in your final video script sounds off, you have to open the stage 2 folder, read the script contract, open the voice guide, open the research output, and mentally trace which one steered the model wrong. That's detective work.

The proposal: have the agent tag each section of its output with a marker pointing back to the specific instruction or reference file that produced it. Think of it like footnotes the agent leaves for itself. You'd click (or grep) the bad phrase and immediately see "this came from the tone guidance in voice.md, section 3." Same idea as source maps in compiled JavaScript — they let you debug the original code instead of the compiled output.

### 2. Cross-stage verification — "does the end still match the beginning?"

A common ICM failure: stage 3 drifts away from what stage 2 decided. The script says "45 seconds on the intro," the animation spec ends up at 60. Nobody notices until the video is rendered.

The authors already use a workaround — an audit file that forces the agent to re-read both stages and flag mismatches. The proposal is to formalize this: every stage contract gets a new `Verify` section alongside Inputs/Process/Outputs. It would say things like "check that every scene in the animation spec corresponds to a paragraph in the script" or "confirm total runtime matches." The agent runs these checks automatically before you ever see the output. You'd catch drift at the stage that caused it, not three stages later.

### 3. Breakpoints in markdown — "pause and show me"

This is the most speculative one. In a real debugger, you set a breakpoint and the program pauses so you can inspect what's happening. The idea here is to do the same thing inside a `CONTEXT.md` file: drop a marker that says "after you follow this specific instruction, stop and show me what you produced before continuing."

Useful when a stage has a tricky constraint you're not sure the model handled correctly. Instead of running the whole stage and then hunting for whether the constraint was respected, you interrupt mid-stage and verify that piece first.

### 4. Edit the source, not the output

This is more of a philosophical shift than a feature. Right now ICM encourages you to fix problems by editing the stage output file before the next stage runs. That fixes *this* run. It doesn't fix the next one.

The argument: if you find yourself making the same edit every single run — always tightening the opening paragraph, always formalizing the tone — that's not a content problem, it's a *source* problem. Your voice guide is underspecified, or your stage contract emphasizes the wrong thing. Editing the output is patching the binary. Editing the source (the reference files, the stage contract) fixes every future run.

The proposed tooling: track output edits across runs, and when a pattern repeats, surface it and suggest a source-level change. "You've shortened the intro three runs in a row — want to add 'keep opening under three sentences' to the stage contract?"

### Why these matter together

Each one alone is useful. Together they describe a trajectory where ICM workspaces stop being static tools and start getting better with use. Provenance lets you find the problem. Verification catches problems automatically. Breakpoints let you inspect mid-stage. And the edit-source discipline means the fixes accumulate in the workspace itself instead of evaporating after each run.

For your own context — this maps directly onto what you're doing with Fastlane's knowledge-base pipeline and the Confluence-to-KB work. The "track recurring edits and suggest source-level changes" idea is essentially a feedback loop on the prompts themselves, and it's the kind of thing that's genuinely missing from most agent stacks right now.

## Caveats the paper names

All testing on a single model family (Opus 4.6 / Sonnet 4.6). No controlled comparison with monolithic prompting. Practitioner data is self-reported via conversation, not instrumented. Community is invite-only and self-selected. These limit how firmly the quality claims land, though the architectural pattern stands on its own.


The practical takeaway: if you've built a Claude skill or a folder-structured prompt workspace, you've already been doing informal ICM. The paper's contribution is naming the five-layer hierarchy explicitly — especially the Layer 3/4 factory-vs-product split — and making the case that stage contracts with explicit Inputs tables are the real control surface.