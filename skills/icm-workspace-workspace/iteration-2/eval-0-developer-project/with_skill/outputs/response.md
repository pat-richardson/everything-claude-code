# Setting Up Your TypeScript API Project with ICM Workspace

Great! You're building a TypeScript Express + Postgres API, and you want Claude to maintain focus between planning and coding phases. I'll walk you through the Interpretable Context Methodology (ICM) workspace setup — this keeps your context organized so Claude reads only what's relevant at each stage.

## What You're Solving

Without structure, when you switch from "planning the API schema" to "implementing the auth middleware," Claude either:
- Loads everything (planning docs + old code attempts) and gets confused by contradictions
- Loads only recent files and forgets the design decisions you made
- Requires you to manually paste context every session

ICM solves this by organizing your workspace into **stages** (planning → src → docs → ops), each with its own **context file** that loads exactly what matters. You'll save ~20-30% of your token budget and stay focused.

---

## Your Workspace Structure

Based on your workflow (planning → code → documentation → deployment), here's the recommended structure:

```
my-api/
├── CLAUDE.md                    # Workspace identity (read first)
├── CONTEXT.md                   # Execution flow and handoff rules
├── _config/                     # Stable reference material (the factory)
│   ├── conventions.md           # TypeScript/Express patterns, naming rules
│   └── workspace.md             # Glossary, scope, review gates
├── planning/                    # Stage 1: API design & architecture
│   ├── CONTEXT.md
│   ├── references/              # Template specs, design patterns
│   └── output/                  # Generated specs, architecture docs
├── src/                         # Stage 2: Implementation
│   ├── CONTEXT.md
│   ├── references/              # Testing patterns, middleware examples
│   └── output/                  # Working code (mirrors your actual /src)
├── docs/                        # Stage 3: API documentation & guides
│   ├── CONTEXT.md
│   ├── references/              # Doc templates, API examples
│   └── output/                  # Generated API docs, guides
└── ops/                         # Stage 4: Deployment & monitoring
    ├── CONTEXT.md
    ├── references/              # Deployment checklists, config templates
    └── output/                  # Migration scripts, monitoring setup
```

---

## The Five-Layer Context Hierarchy Explained

This is the architecture that prevents "lost in the middle" problems:

| Layer | Files | Role |
|-------|-------|------|
| **0** | `CLAUDE.md` | Workspace identity & routing table (~800 tokens) |
| **1** | Root `CONTEXT.md` | How stages connect & hand off (~300 tokens) |
| **2** | Stage `CONTEXT.md` | What this stage needs to know (~200-500 tokens each) |
| **3** | `_config/` + `references/` | Stable rules (conventions, patterns, templates) |
| **4** | `output/` dirs | Working artifacts (this run's specs, code, docs) |

The key principle: **factory vs. product**. Your `_config/` directory (Layer 3) contains your conventions — these never change. Your `output/` directories (Layer 4) contain this run's work. Claude never mixes them up because they're in different folders.

---

## What Goes Where

### Planning Stage (planning/)
You'll read this when you're designing the API.

**Inputs:** None (starting point)
**Process:** Sketch endpoints, database schema, authentication flow
**Outputs:** 
- `output/api-spec.md` — Endpoints, request/response shapes, status codes
- `output/db-schema.md` — Tables, relationships, migrations plan
- `output/architecture.md` — Module structure, dependency graph

**When you're done:** Review the spec. Does it match your vision? Edit before moving on.

### Src Stage (src/)
You'll read this when you're writing actual code.

**Inputs:** `planning/output/api-spec.md`, `planning/output/db-schema.md`, `_config/conventions.md`
**Process:** Implement routes, middleware, database models, tests
**Outputs:** Working TypeScript files

**When you're done:** Code review. Run tests. Then move to docs.

### Docs Stage (docs/)
You'll read this when writing API documentation.

**Inputs:** `src/output/` (your actual code), `planning/output/api-spec.md`
**Process:** Generate API reference, write getting-started guide, document error codes
**Outputs:** 
- `output/api-reference.md` — Auto-generated from code
- `output/getting-started.md` — Setup, first request, common patterns

**When you're done:** Review for accuracy against your code.

### Ops Stage (ops/)
You'll read this when deploying or setting up monitoring.

**Inputs:** `src/output/` (what you built), `planning/output/db-schema.md`
**Process:** Write migrations, set up environment configs, create deployment checklist
**Outputs:**
- `output/migration-plan.md` — SQL migrations
- `output/deployment-checklist.md` — Pre-deploy verification

---

## Setting It Up: Step by Step

### Step 1: Create the Directory Structure

```bash
cd ~/projects/my-api
mkdir -p _config planning/{references,output} src/{references,output} docs/{references,output} ops/{references,output}
touch planning/output/.keep src/output/.keep docs/output/.keep ops/output/.keep
```

### Step 2: Create CLAUDE.md (Layer 0)

This is your workspace identity. Claude reads it first on every new session. Keep it under one screen.

**File:** `CLAUDE.md`

```markdown
# TypeScript Express + Postgres API

A production API with strict type safety, database migrations, and comprehensive documentation. Built for extensibility and team collaboration.

## Workspaces

- `/planning` — Spec the API: endpoints, schema, architecture
- `/src` — Implement the API: routes, models, middleware
- `/docs` — Generate documentation: API reference, guides
- `/ops` — Deploy & monitor: migrations, monitoring, health checks

## Routing

| Task | Go to | Read | Focus |
|------|-------|------|-------|
| Design API schema | /planning | CONTEXT.md | Endpoints, database structure |
| Implement features | /src | CONTEXT.md | Write code, run tests |
| Write API docs | /docs | CONTEXT.md | Reference docs, guides |
| Deploy or migrate | /ops | CONTEXT.md | Deployment scripts, monitoring |

## Naming Conventions

- **Routes:** `/api/v1/[resource]/[action]` (e.g., `/api/v1/users/register`)
- **Middleware:** Named as `auth.ts`, `error-handler.ts` (kebab-case)
- **Models:** PascalCase (e.g., `User.ts`, `BlogPost.ts`)
- **Database:** snake_case tables (e.g., `user_accounts`, `blog_posts`)
- **Functions:** camelCase (e.g., `getUserById`, `validateEmail`)

## Rules

- Read this file first on every new session
- Do not edit stage outputs from a different stage (edit source files instead)
- Review all outputs before moving to the next stage
- If you edit the same thing repeatedly, update `_config/conventions.md` instead

## Current State

- [ ] Planning stage: API spec drafted
- [ ] Src stage: Core implementation
- [ ] Docs stage: API documentation
- [ ] Ops stage: Deployment ready
```

### Step 3: Create Root CONTEXT.md (Layer 1)

This shows how the stages connect.

**File:** `CONTEXT.md`

```markdown
# Workspace Execution Flow

How work moves between stages and who reviews at each handoff.

## Stage Sequence

| Stage | Input | Output | Review |
|-------|-------|--------|--------|
| Planning | None (start here) | `planning/output/api-spec.md` + schema | You: Does the design feel right? |
| Src | `planning/output/` | Working code in `src/output/` | Run tests, manual review |
| Docs | `src/output/` | `docs/output/api-reference.md` | Compare docs vs. actual code |
| Ops | `src/output/` + schema | `ops/output/deployment-checklist.md` | Pre-deploy verification |

## Handoff Rules

1. **Planning → Src:** Review your spec. Does it match your intent? Edit before coding.
2. **Src → Docs:** Ensure all code is tested and working. Docs generated from live code.
3. **Docs → Ops:** Verify docs are accurate. Then generate deployment artifacts.
4. **Ops → Deploy:** Run the checklist. Verify in staging before production.

## Key Principle

Output of stage N becomes input of stage N+1. If you need to fix stage 1 decisions while in stage 2, don't edit stage 2 output — go back and fix the source in `_config/` or `planning/output/`. This prevents drift.
```

### Step 4: Create Planning Stage Context (Layer 2)

**File:** `planning/CONTEXT.md`

```markdown
# Planning: API Design & Architecture

Specify the API contract, database schema, and module structure. This stage is your single source of truth for what the API does.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | Naming Conventions, Code Structure | How to name routes, models, tables |
| Layer 3 | _config/workspace.md | Glossary, Assumptions | Domain terms, technical constraints |

## Process

1. Read Layer 3 references (naming, scope, glossary)
2. Design endpoints: HTTP method, path, request/response shape
3. Design database schema: tables, columns, relationships, indices
4. Sketch module structure: directory layout, dependencies
5. Write all outputs to `output/` directory

## Outputs

- **output/api-spec.md** (~800-1200 tokens)
  - Endpoints table (method, path, auth, status codes)
  - Request/response examples for each endpoint
  - Error codes and meanings
  
- **output/db-schema.md** (~600-800 tokens)
  - Table definitions with columns, types, constraints
  - Foreign keys and relationships
  - Indices and performance notes
  
- **output/architecture.md** (~400-600 tokens)
  - Module structure (src/routes/, src/models/, src/middleware/)
  - Dependency graph
  - Third-party packages and why

## Verify

- [ ] All endpoints documented with examples
- [ ] Database schema covers all endpoints
- [ ] Naming follows conventions in `_config/conventions.md`
- [ ] No conflicting endpoint paths
- [ ] Authentication/authorization is specified for each endpoint
```

### Step 5: Create Src Stage Context (Layer 2)

**File:** `src/CONTEXT.md`

```markdown
# Src: Implementation

Write TypeScript code that implements the spec from Planning. This is where the API actually exists.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | All sections | TypeScript style, naming, testing |
| Layer 3 | references/testing-patterns.md | Unit Tests, Integration Tests | How to structure tests |
| Layer 4 | ../planning/output/api-spec.md | Endpoints section | What to implement |
| Layer 4 | ../planning/output/db-schema.md | Table definitions | Data models |
| Layer 4 | ../planning/output/architecture.md | Module structure | Where code goes |

## Process

1. Read all Inputs in order
2. Implement models (database layer)
3. Implement routes and middleware
4. Write unit and integration tests
5. Run full test suite: `npm test`
6. Ensure TypeScript has zero errors: `npx tsc --noEmit`
7. Commit working code to `output/` directory

## Outputs

- **Actual code in `src/` directory**
  - `routes/` — Express route handlers
  - `models/` — TypeScript types, database queries
  - `middleware/` — Auth, error handling, logging
  - `tests/` — Jest tests

- **output/implementation-summary.md** (~300 tokens)
  - What was implemented
  - Known limitations or TODOs
  - Test coverage summary

## Verify

- [ ] All endpoints from `api-spec.md` are implemented
- [ ] All database queries match `db-schema.md`
- [ ] TypeScript compiles with zero errors
- [ ] All tests pass: `npm test`
- [ ] Code follows conventions in `_config/conventions.md`
- [ ] Naming matches conventions (routes, functions, tables)
```

### Step 6: Create Docs Stage Context (Layer 2)

**File:** `docs/CONTEXT.md`

```markdown
# Docs: API Documentation

Generate API reference documentation and user guides from the implemented code.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | Documentation style | Voice, format preferences |
| Layer 4 | ../src/output/implementation-summary.md | All | What was implemented |
| Layer 4 | ../planning/output/api-spec.md | Endpoints section | API contract |

## Process

1. Read all Inputs in order
2. Generate API Reference: document each endpoint with examples
3. Write Getting Started guide: setup, first request, authentication
4. Document error codes and common patterns
5. Review generated docs against actual code
6. Write outputs to `output/` directory

## Outputs

- **output/api-reference.md** (~1200-1600 tokens)
  - One section per endpoint (method, path, description, auth)
  - Request and response examples
  - Status codes and error meanings
  
- **output/getting-started.md** (~600 tokens)
  - Setup and installation
  - Environment variables
  - First API request example
  - Common patterns (pagination, filtering, error handling)

## Verify

- [ ] Every endpoint from api-spec is documented
- [ ] Examples match actual request/response format
- [ ] Auth requirements are clear for each endpoint
- [ ] Error codes in docs match actual error handling in code
- [ ] Getting started guide is complete and testable
```

### Step 7: Create Ops Stage Context (Layer 2)

**File:** `ops/CONTEXT.md`

```markdown
# Ops: Deployment & Monitoring

Prepare the API for production: migrations, environment config, monitoring.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | Database, Environment | Naming, structure rules |
| Layer 4 | ../planning/output/db-schema.md | All | What schema to create |
| Layer 4 | ../src/output/implementation-summary.md | Known limitations | Edge cases to monitor |

## Process

1. Read all Inputs
2. Write database migration scripts (SQL)
3. Document environment variables (.env.example)
4. Create pre-deployment checklist
5. Write outputs to `output/` directory

## Outputs

- **output/migrations/ (directory)**
  - SQL migration files for each schema change
  - Numbered: 001-create-users.sql, 002-create-posts.sql

- **output/.env.example** (~100 tokens)
  - All environment variables
  - Example values
  - Documentation for each

- **output/deployment-checklist.md** (~400 tokens)
  - Pre-deploy verification steps
  - Monitoring endpoints to test
  - Rollback procedure

## Verify

- [ ] All tables from db-schema are created by migrations
- [ ] .env.example covers all config in code
- [ ] Deployment checklist is complete and executable
- [ ] No hardcoded secrets in any output files
```

### Step 8: Create Layer 3 Files (Factory)

These are stable reference files. Edit them once, and all future sessions use the updated version.

**File:** `_config/conventions.md`

```markdown
# TypeScript Express API Conventions

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## File Structure

```
src/
├── routes/          # Express route handlers
├── models/          # TypeScript types, database layer
├── middleware/      # Auth, logging, error handling
├── utils/           # Helpers, validation
├── tests/           # Jest test files
└── server.ts        # Express app setup
```

## Naming Rules

- **Files:** kebab-case (user-controller.ts, error-handler.ts)
- **Classes:** PascalCase (UserController, ErrorHandler)
- **Functions:** camelCase (getUserById, validateEmail)
- **Constants:** SCREAMING_SNAKE_CASE (API_VERSION, MAX_RETRIES)
- **Database tables:** snake_case (user_accounts, blog_posts)
- **Database columns:** snake_case (created_at, user_id)

## API Versioning

- All endpoints prefixed: `/api/v1/...`
- Future changes go to `/api/v2/...` (never breaking changes on v1)

## Response Format

```typescript
// Success
{ data: T, status: 200 }

// Error
{ error: { code: string, message: string }, status: number }
```

## Testing

- Test file for each model/route: `user.test.ts` alongside `user.ts`
- Jest syntax: describe(), it(), expect()
- Minimum coverage: 80% for src/
- Test database: separate instance, never production

## TypeScript

- Strict mode enabled
- No `any` types
- Interfaces over types for public APIs
- Enums for fixed sets (Role, Status)

## Database

- Migrations in `ops/output/migrations/`
- Numbered: 001-, 002-, etc.
- Never edit existing migrations
- Use ORM (TypeORM, Prisma, or Knex)

## Security

- Hash passwords (bcrypt)
- Validate all inputs
- Use helmet middleware
- CORS configured narrowly
- Environment variables for secrets
```

**File:** `_config/workspace.md`

```markdown
# Workspace Scope & Constraints

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.
> Last updated: 2026-04-29

## Scope

- **In scope:** API implementation, testing, documentation, deployment
- **Out of scope:** Client applications, frontend code, DevOps infrastructure (we specify it, don't build it)

## Assumptions

- TypeScript with strict mode
- Express.js for HTTP routing
- PostgreSQL for persistent storage
- Single-region deployment (initially)
- < 100k daily requests (no need for caching layer yet)

## Glossary

- **Resource:** Anything with a REST endpoint (User, Post, Comment)
- **Endpoint:** HTTP method + path combination
- **Middleware:** Function that runs before/after route handlers
- **Migration:** SQL script that changes the database schema
- **Deployment:** Moving code from dev → production

## Review Gates

| Transition | Reviewer | Checklist |
|-----------|----------|-----------|
| Planning → Src | You | Does the API spec feel complete? Any missing endpoints? |
| Src → Docs | You | Do all tests pass? Code compiles? Manual testing OK? |
| Docs → Ops | You | Do examples in docs match actual API? Anything out of sync? |
| Ops → Deploy | You | Can migrations be applied cleanly? Is monitoring set up? |

## Token Budget

- Each stage loads ~2,000-4,000 tokens
- Stage outputs should not exceed ~1,500 tokens each
- If a stage context file exceeds 500 tokens, split into sub-stages
```

---

## How to Use This Workspace

### Starting a Session

1. **Every new session:** Read `CLAUDE.md` first. It's your routing table.
2. **Pick your stage:** Use the routing table to find the right folder.
3. **Read stage CONTEXT.md:** It tells you exactly what to load and do.
4. **Read inputs in order:** The Inputs table lists files in priority order.
5. **Do the work:** Follow the Process steps.
6. **Write outputs:** Save to `output/` directory.

### Example: You Want to Design the API

```
1. Read my-api/CLAUDE.md (1 minute)
2. Read my-api/CONTEXT.md (2 minutes)
3. Go to my-api/planning/ and read CONTEXT.md (3 minutes)
4. Read _config/conventions.md and _config/workspace.md (5 minutes)
5. Start designing (30 minutes)
6. Write to planning/output/api-spec.md and planning/output/db-schema.md
7. Review. Done with this stage.
```

### Example: You Want to Implement a Feature

```
1. Read my-api/CLAUDE.md
2. Go to my-api/src/
3. Read planning/output/api-spec.md and db-schema.md
4. Read _config/conventions.md
5. Implement + test
6. Commit to src/output/ or your actual src/
7. Run full test suite
8. Move to docs stage
```

---

## Key Principles to Remember

1. **Factory vs. Product:** `_config/` never changes per-run. `output/` changes every run. Never mix them.

2. **One fact, one location:** If API naming appears in both `_config/conventions.md` AND `planning/output/api-spec.md`, they will drift. Put the fact in `_config/` and reference it.

3. **Read your inputs in order:** The Inputs table is not a suggestion — it's the exact scope of what Claude loads. If something important is missing from the table, add it.

4. **Review between stages:** Don't sprint through all four stages in one session. Review planning output before coding. Review code before documenting.

5. **Edit the factory, not the product:** If you're editing the same thing repeatedly in outputs, the problem is in `_config/` or the stage contract. Fix the source, not the output.

---

## Next Steps

1. **Copy the structure:** Create the directories and files above.
2. **Customize the conventions:** Edit `_config/conventions.md` to match your actual preferences.
3. **Start with planning:** Go to `/planning` and design your API.
4. **Review and move:** After planning, review before moving to `/src`.
5. **Iterate:** Each stage builds on the previous one.

---

## Why This Works

- **Context isolation:** Claude sees only 2,000-4,000 tokens per stage, not everything.
- **Explicit routing:** The CONTEXT.md files are your control surface — you can edit what Claude sees without code.
- **Reusable patterns:** Once you use it once, every stage follows the same contract format.
- **Session-independent:** Every new conversation reads the same CLAUDE.md and context files. No memory decay.
- **Review gates:** You own the decision to move between stages — Claude doesn't skip ahead.

This is the Interpretable Context Methodology. It's a filesystem-based solution to orchestration, and it eliminates "lost in the middle" degradation that happens when models see everything at once.
