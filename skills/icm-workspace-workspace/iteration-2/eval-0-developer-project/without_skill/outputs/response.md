# TypeScript API Project Setup Guide

## Project Structure

Here's a recommended folder organization for your Express + TypeScript + Postgres project that maintains context across Claude Code sessions:

```
my-api-project/
├── docs/
│   ├── ARCHITECTURE.md           # System design & component overview
│   ├── API-SPEC.md               # API endpoints & schemas
│   ├── DATABASE.md               # Schema, migrations, relationships
│   └── DECISIONS.md              # ADRs & design decisions
│
├── src/
│   ├── types/
│   │   ├── index.ts              # Shared types & interfaces
│   │   └── database.ts           # DB entity types
│   │
│   ├── db/
│   │   ├── migrations/           # SQL migration files
│   │   ├── seeds/                # Test data
│   │   └── client.ts             # Postgres connection & pool
│   │
│   ├── routes/
│   │   ├── index.ts              # Route registration
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   └── health.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── validation.ts
│   │
│   ├── services/
│   │   ├── user-service.ts
│   │   ├── post-service.ts
│   │   └── database-service.ts
│   │
│   ├── config/
│   │   ├── index.ts              # Environment & config loading
│   │   └── database.ts
│   │
│   └── index.ts                  # Main server entry point
│
├── tests/
│   ├── integration/              # Full endpoint tests
│   ├── unit/                     # Service & utility tests
│   └── fixtures/                 # Mock data & test helpers
│
├── migrations/                   # Alternative: top-level migrations (common pattern)
│
├── .env.example                  # Template for environment variables
├── .env.local                    # Local dev (git-ignored)
├── tsconfig.json
├── eslint.config.js
├── package.json
├── README.md                     # Getting started guide
└── CLAUDE.md                     # Claude-specific context & conventions
```

## Key Files to Create First

### 1. `CLAUDE.md` (Critical for context persistence)

```markdown
# Project Context for Claude Code

## Quick Reference

**Stack**: Node.js 18+, TypeScript, Express, PostgreSQL
**Package Manager**: npm
**Main Entry**: `src/index.ts`
**Test Command**: `npm test`
**Dev Server**: `npm run dev`

## Architecture Overview

- **routes/**: HTTP endpoint handlers
- **services/**: Business logic & database interactions
- **db/**: Database client, migrations, seeds
- **middleware/**: Auth, validation, error handling
- **types/**: Shared TypeScript interfaces

## Development Workflow

1. Create migration: `npm run migrate:create add_users_table`
2. Write service logic in `services/`
3. Add routes in `routes/`
4. Test with `npm test`
5. Update docs as API changes

## Database Connection

Database client exported from `src/db/client.ts`. All services import from here.

## When Switching Sessions

1. Read `docs/ARCHITECTURE.md` for system overview
2. Check `docs/DECISIONS.md` for context on recent changes
3. Review `docs/API-SPEC.md` for endpoint contracts
```

### 2. `docs/ARCHITECTURE.md`

Create a document describing:
- Data flow (requests → routes → services → database)
- Entity relationships (users, posts, comments, etc.)
- Authentication approach
- Current tables & their purposes
- Planned features

### 3. `docs/API-SPEC.md`

Document your endpoints:
```
GET /api/users          - List users
GET /api/users/:id      - Get single user
POST /api/users         - Create user (body: {name, email})
PUT /api/users/:id      - Update user
DELETE /api/users/:id   - Delete user
```

## Configuration Files

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "baseUrl": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### `package.json` (key scripts)
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "tsx node --test tests/**/*.test.ts",
    "lint": "eslint src tests",
    "migrate:latest": "node -r tsx src/db/migrate.ts",
    "migrate:create": "node -r tsx src/db/create-migration.ts",
    "db:seed": "node -r tsx src/db/seeds/index.ts"
  }
}
```

## Best Practices for Context Persistence

### 1. Keep Decisions in Writing
- **New feature?** Add to `docs/DECISIONS.md` with "why" not just "what"
- **Architecture change?** Update `docs/ARCHITECTURE.md`
- **Schema change?** Document in `docs/DATABASE.md`

### 2. Documentation-First Approach
When starting a session:
- Read docs first, not code
- Use comments in code for "why", not "what"
- Keep README updated with setup steps

### 3. Service Layer Pattern
All database operations go through services. This makes it easy to explain data flow:
- Routes → Services → Database
- Easy to trace a feature end-to-end

### 4. Migration-Based Schema Evolution
Store all schema changes as timestamped migrations:
```
src/db/migrations/
├── 001_create_users_table.sql
├── 002_create_posts_table.sql
└── 003_add_posts_user_id_index.sql
```
This way Claude can understand database evolution without reading code.

### 5. Type Definitions as Documentation
Group types by entity:
```typescript
// src/types/user.ts
export interface User {
  id: number;
  email: string;      // unique constraint
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
}
```

## Initial Setup Steps

1. **Create the folder structure** above
2. **Initialize npm**: `npm init -y`
3. **Install dependencies**:
   ```bash
   npm install express pg dotenv cors
   npm install -D typescript @types/node @types/express tsx ts-node eslint @eslint/js
   ```
4. **Create config files** (`tsconfig.json`, `.env.example`)
5. **Create `CLAUDE.md`** with your specific conventions
6. **Write `docs/ARCHITECTURE.md`** with initial design (even if minimal)
7. **Start with health check route** for quick iteration

## Context Switching Checklist

When you resume work in Claude Code:

- [ ] Read `CLAUDE.md` for project conventions
- [ ] Check `docs/ARCHITECTURE.md` for system overview
- [ ] Review `docs/DECISIONS.md` for recent context
- [ ] Check `docs/API-SPEC.md` to understand endpoint contracts
- [ ] Look at most recent migrations to see database state

## Why This Structure Works

1. **Separation of concerns**: Clear role for each directory
2. **Scalability**: Easy to add features without restructuring
3. **Testing**: Organized test mirrors source structure
4. **Documentation-centric**: Docs live at project root for visibility
5. **Claude-friendly**: Multiple entry points for understanding the system (types, architecture, decisions)
6. **Database-first**: Migrations are first-class, not an afterthought

This structure keeps Claude focused and prevents re-explaining context with each session switch.
