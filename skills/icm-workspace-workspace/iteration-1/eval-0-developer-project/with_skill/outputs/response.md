# TypeScript API Project with ICM Workspace

Absolutely! I'll help you set up an Interpretable Context Methodology (ICM) workspace that keeps context organized across planning and implementation phases. This approach prevents Claude from losing focus when switching between different parts of your project.

## What We're Building

Your workspace will have **three stages** (planning, code, and operations) with a clear folder hierarchy, context files, and routing rules. This way, when you switch to coding, Claude loads only what's relevant to that task—not all the architectural diagrams mixed with deployment scripts.

---

## Directory Structure

Here's your complete folder layout:

```
typescript-api/
├── CLAUDE.md                    # Workspace routing and rules
├── CONTEXT.md                   # Execution flow
├── _config/
│   ├── conventions.md           # TypeScript/Node.js code style
│   └── workspace.md             # Scope, glossary, review gates
├── planning/
│   ├── CONTEXT.md               # Planning stage contract
│   ├── references/
│   │   └── .keep
│   └── output/
│       └── .keep
├── src/
│   ├── CONTEXT.md               # Development stage contract
│   ├── references/
│   │   ├── api-design.md        # REST endpoints, request/response patterns
│   │   └── database-schema.md   # Postgres schema reference
│   └── output/
│       └── .keep
└── ops/
    ├── CONTEXT.md               # Operations stage contract
    ├── references/
    │   └── deployment-checklist.md
    └── output/
        └── .keep
```

---

## Phase 1: Layer 0 – CLAUDE.md (Workspace Identity)

Save this to `typescript-api/CLAUDE.md`:

```markdown
# TypeScript API with Express & Postgres

A modular REST API built with Express, TypeScript, and Postgres. This workspace routes planning, development, and operational tasks into separate contexts to prevent context loss during handoffs.

## Workspaces

- **/planning** — Define features, API contracts, and database schema
- **/src** — Write and test application code
- **/ops** — Deploy, monitor, and debug production

## Routing

| Task | Go to | Read | Skills |
|------|-------|------|--------|
| Spec a feature, design API | /planning | CONTEXT.md | -- |
| Write controller, service, migration | /src | CONTEXT.md | testing |
| Deploy, troubleshoot, monitor | /ops | CONTEXT.md | -- |

## Naming Conventions

- **Controllers**: `user.controller.ts`, `auth.controller.ts`
- **Services**: `user.service.ts`, `user.repository.ts`
- **Migrations**: `001_create_users_table.sql`
- **Tests**: `user.service.spec.ts` (mirror src/ structure)
- **Branches**: `feat/user-auth`, `fix/database-connection`
- **Commits**: `feat(auth): add JWT middleware`, `fix(users): correct email validation`

## Rules

- Read this file first on every new task.
- Do not create code in planning/; do not design in src/.
- Planning output (`planning/output/`) becomes src/ input.
- Review stage output before advancing to the next stage.
- For repeated fixes to output, edit the source (_config/) instead.
- Store all TypeScript code under `src/`; tests alongside source files.
- Track Postgres migrations in `src/migrations/`.

## Current State

- Workspace initialized, no code yet.
- Ready for Phase 1 (feature planning).
```

---

## Phase 2: Layer 1 – Root CONTEXT.md (Execution Flow)

Save this to `typescript-api/CONTEXT.md`:

```markdown
# Workspace Routing

## Execution Flow

| Stage | Input Source | Output Destination | Review Gate |
|-------|-------------|-------------------|-------------|
| planning | Starting requirements | planning/output/ | You review spec |
| src | planning/output/*.md | src/output/ (migrations, tests, code) | Run tests pass |
| ops | src/output/ + src/migrations/ | ops/output/ | Deployment checklist |

## Handoff Rules

- **Planning → Src**: Review the spec and API contract before coding. Ask Claude to clarify if needed.
- **Src → Ops**: All migrations must be idempotent. All tests must pass (`npm test`).
- **Ops → Monitoring**: After deploy, verify endpoints are responding.

Never skip a review gate. If you see the same issue in output three times, edit the source file (_config/) instead.
```

---

## Phase 3: Layer 2 – Stage CONTEXT.md Files

### 3a. Planning Stage

Save this to `typescript-api/planning/CONTEXT.md`:

```markdown
# Planning Stage

Define features, API endpoints, database schema, and validation rules. Output from this stage becomes the input for the development stage.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/workspace.md | Scope, Glossary | Project scope and terminology |
| User | (provided) | Feature requirements | What to build |

## Process

1. Read _config/workspace.md to understand scope and terminology
2. Ask clarifying questions if requirements are ambiguous
3. Design the REST API (endpoints, request/response schemas)
4. Design the database schema (tables, columns, relationships)
5. List validation rules and error cases
6. Write outputs to output/ directory

## Outputs

- **output/feature-spec.md** — What this feature does, acceptance criteria (~300 tokens)
- **output/api-design.md** — REST endpoints, request/response examples, status codes (~500 tokens)
- **output/schema-design.md** — SQL tables, columns, constraints, indexes (~400 tokens)

## Verify

- [ ] Feature spec matches user requirements
- [ ] API design is RESTful (follows HTTP conventions)
- [ ] Schema supports all API operations
- [ ] No contradictions between spec and schema
```

### 3b. Development Stage

Save this to `typescript-api/src/CONTEXT.md`:

```markdown
# Development Stage

Write application code, tests, and database migrations. Implement the API design and schema from the planning stage.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/conventions.md | TypeScript Rules, Testing, Migrations | Code style constraints |
| Layer 3 | _config/workspace.md | Glossary, Error Cases | Domain language |
| Layer 4 | ../planning/output/api-design.md | "Endpoints", "Request/Response" | What to implement |
| Layer 4 | ../planning/output/schema-design.md | "Tables", "Relationships" | Database structure |

## Process

1. Read all Inputs in order (conventions first, then prior stage outputs)
2. Create Postgres migration file(s) under src/migrations/
3. Implement TypeScript controllers, services, repositories
4. Write unit tests (mirror src/ structure)
5. Run tests: `npm test` (must pass)
6. Write outputs to output/ directory

## Outputs

- **output/migrations/001_FEATURE.sql** — Idempotent migration, rollback included (~200 tokens)
- **output/implementation-notes.md** — What code was added, testing results (~300 tokens)

## Verify

- [ ] All tests pass (`npm test`)
- [ ] Migration is idempotent (safe to run twice)
- [ ] Code follows _config/conventions.md style rules
- [ ] Endpoints match api-design.md specification
- [ ] No unhandled errors
```

### 3c. Operations Stage

Save this to `typescript-api/ops/CONTEXT.md`:

```markdown
# Operations Stage

Deploy, verify, and monitor the application. Ensure migrations run and endpoints are live.

## Inputs

| Source | File | Sections | Purpose |
|--------|------|----------|---------|
| Layer 3 | _config/workspace.md | Review Gates | Deployment checklist |
| Layer 4 | ../src/output/migrations/ | All files | What to apply to production |
| Layer 4 | ../src/output/implementation-notes.md | "Testing Results" | Pre-deploy verification |

## Process

1. Read the deployment checklist from _config/workspace.md
2. Review migrations for safety (idempotent, rollback present)
3. Deploy to staging environment
4. Run smoke tests on all endpoints
5. Deploy to production
6. Verify endpoints respond
7. Write output

## Outputs

- **output/deployment-log.md** — Timestamp, migrations applied, endpoints verified (~200 tokens)

## Verify

- [ ] All migrations ran without error
- [ ] All endpoints respond (GET /users, POST /users, etc.)
- [ ] No errors in application logs
- [ ] Rollback plan documented if needed
```

---

## Phase 4: Layer 3 – Reference Files (_config/)

### 4a. Code Conventions

Save this to `typescript-api/_config/conventions.md`:

```markdown
# TypeScript & Node.js Conventions

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## TypeScript Rules

- Use strict mode: `"strict": true` in tsconfig.json
- Explicit return types on all functions
- No `any`; use `unknown` if type is truly unknown
- Interfaces for contracts; types for unions/aliases

Example controller:
```typescript
import express, { Request, Response } from 'express';

export class UserController {
  async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    // validation, business logic, response
    res.status(200).json({ id: userId });
  }
}
```

## Testing

- Test file location: mirror src/ structure with `.spec.ts` suffix
- Use Jest with `describe()` and `it()` blocks
- Test happy path, edge cases, and error cases
- Minimum 80% line coverage

Example test:
```typescript
describe('UserService', () => {
  it('should return user by id', async () => {
    const user = await userService.findById(1);
    expect(user.id).toBe(1);
  });
});
```

## Migrations

- File format: `NNN_description.sql` (NNN = zero-padded number)
- Idempotent: use `IF NOT EXISTS` and `IF EXISTS`
- Include rollback in comments
- One logical change per file

Example:
```sql
-- Up
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Down: DROP TABLE IF EXISTS users;
```

## Error Handling

- Use HTTP status codes correctly (400, 401, 404, 500)
- Validate all inputs before processing
- Never return stack traces to clients
- Log errors with context

## Dependencies

- **Framework**: Express.js
- **Database**: node-postgres (pg)
- **ORM** (optional): Typeorm or raw SQL with query builders
- **Validation**: zod or joi
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier (opinionated, run in pre-commit)

## package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node src/migrations/run.js",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```
```

### 4b. Workspace Constraints

Save this to `typescript-api/_config/workspace.md`:

```markdown
# Workspace Constraints

> This is reference material (Layer 3 — the factory).
> Edit this file to change all future runs.

## Scope

**In scope:**
- REST API endpoints (users, auth, etc.)
- Postgres database schema
- Unit and integration tests
- Deployment and monitoring

**Out of scope:**
- Frontend (separate project)
- Authentication service (assume JWT with middleware)
- Load balancing (use environment config)

## Glossary

- **Controller**: HTTP request handler. Takes req, calls service, returns response.
- **Service**: Business logic. Calls repositories, applies rules, returns data.
- **Repository**: Data access. Queries Postgres, returns results.
- **Migration**: SQL change applied to Postgres in order (up) or reversed (down).
- **Spec**: Feature requirements and API contract (output from planning stage).

## Review Gates

| Stage Transition | Reviewer | What to Check |
|-----------------|----------|---------------|
| Planning → Src | You | API design is RESTful; schema is normalized; no contradictions |
| Src → Ops | You | Tests pass; migrations are idempotent; code follows conventions |
| Ops → Live | You | All endpoints respond; no errors in logs; rollback plan in place |

## Assumptions

- Node.js 18+, PostgreSQL 13+
- Environment variables for DB connection, PORT, etc.
- Pre-existing JWT middleware (or add it as first feature)
- Team can deploy to staging/production (via CI/CD or manual)
```

---

## Phase 5: Initialize Output Directories

Create the directory structure on disk. If you're doing this in a terminal:

```bash
mkdir -p typescript-api/{planning,src,ops}/{references,output}
mkdir -p typescript-api/_config

# Create .keep files to track empty directories in Git
touch typescript-api/planning/references/.keep
touch typescript-api/planning/output/.keep
touch typescript-api/src/references/.keep
touch typescript-api/src/output/.keep
touch typescript-api/ops/references/.keep
touch typescript-api/ops/output/.keep
```

---

## Phase 6: Set Up Git

Initialize a git repository and commit the scaffold:

```bash
cd typescript-api
git init
git add CLAUDE.md CONTEXT.md _config/ planning/ src/ ops/
git commit -m "chore: initialize ICM workspace for TypeScript API"
```

---

## How to Use This Workspace

### When You Start a New Feature

1. **Go to /planning**. Read `planning/CONTEXT.md`.
2. Tell Claude your feature requirement.
3. Claude reads the spec, API design, and schema outputs and creates a detailed plan.
4. Review the outputs. Ask for clarification if needed.
5. Commit: `git add planning/output/; git commit -m "feat(planning): spec user auth"`

### When You Code

1. **Go to /src**. Read `src/CONTEXT.md`.
2. Tell Claude "implement the API design from planning/output/api-design.md".
3. Claude reads conventions.md, the prior-stage spec, and generates:
   - Migration file(s)
   - Implementation code
   - Tests
4. Run `npm test` to verify.
5. Review the code. Ask Claude to refactor if needed.
6. Commit: `git add src/output/; git commit -m "feat(users): add user creation endpoint"`

### When You Deploy

1. **Go to /ops**. Read `ops/CONTEXT.md`.
2. Tell Claude "deploy the migrations and verify endpoints".
3. Claude reads the migration checklist and deployment steps.
4. Follow the prompts to run migrations, test, and go live.
5. Commit: `git add ops/output/; git commit -m "ops(deploy): release user auth to production"`

---

## Context Efficiency

Here's why this structure keeps Claude focused:

- **Planning stage** loads ~1,200 tokens (workspace rules + your requirements)
- **Src stage** loads ~2,500 tokens (conventions + prior stage spec)
- **Ops stage** loads ~1,800 tokens (migrations + checklist)

Compare that to showing Claude the entire project at once (>5,000 tokens just to orient). By splitting work across stages, each conversation is tight and focused.

---

## Anti-Patterns to Avoid

1. **Don't mix planning and code.** The output/ of planning becomes input/ of src. Keep them separate.
2. **Don't put working artifacts in _config/.** If you find yourself editing `_config/conventions.md` every run, you're fixing the factory when you should be fixing output.
3. **Don't have vague Inputs tables.** "Read the relevant files" forces Claude to guess. Name exact files and sections.
4. **Don't skip review gates.** Before moving from planning to src, verify the spec is complete.

---

## Verification Checklist

Before you start coding, verify:

- [ ] Root directory has `CLAUDE.md` and `CONTEXT.md`
- [ ] `_config/` has `conventions.md` and `workspace.md`
- [ ] All three stages (planning, src, ops) have their own `CONTEXT.md`
- [ ] Each stage has `references/` and `output/` directories with `.keep` files
- [ ] No code or working artifacts in `_config/`
- [ ] `CLAUDE.md` is less than one screen
- [ ] Routing table in `CLAUDE.md` covers all task types

---

## Next Steps

1. **Copy this structure** to your machine.
2. **Adjust the stages** if you want to add testing, documentation, or a fourth phase.
3. **Update _config/conventions.md** if you have specific linting rules or team standards.
4. **Start with planning**: tell Claude "I need to add user authentication to my API" and let it guide you through the spec.

This setup ensures that when you switch between planning and coding, Claude has a clear entry point and doesn't waste tokens re-reading decisions you already made.
