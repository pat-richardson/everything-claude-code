# TypeScript API Project Organization for Claude Code

I'll help you structure your Express + TypeScript + Postgres project so Claude maintains excellent context when switching between planning, implementation, and testing phases. The key is organizing files to keep related concerns together while making dependencies explicit.

## Recommended Folder Structure

```
my-api-project/
├── CLAUDE.md                          # Project context for Claude
├── README.md                           # Getting started guide
├── .claude/
│   ├── settings.json                  # Claude Code preferences
│   ├── rules/
│   │   └── typescript-api.md          # Project-specific TypeScript/API rules
│   └── skills/
│       └── (custom skills for this project)
├── .github/
│   └── workflows/                      # CI/CD pipelines
├── src/
│   ├── index.ts                       # Server entry point
│   ├── config/
│   │   ├── database.ts                # DB connection & pool setup
│   │   ├── environment.ts             # Environment validation
│   │   └── logger.ts                  # Logging configuration
│   ├── types/
│   │   ├── index.ts                   # Centralized type exports
│   │   ├── api.ts                     # API request/response types
│   │   ├── domain.ts                  # Business domain types
│   │   └── errors.ts                  # Error type definitions
│   ├── middleware/
│   │   ├── error-handler.ts           # Global error handling
│   │   ├── request-logger.ts          # Request/response logging
│   │   ├── validation.ts              # Input validation middleware
│   │   └── auth.ts                    # Authentication/authorization
│   ├── routes/
│   │   ├── index.ts                   # Route registry
│   │   ├── users.ts                   # User routes
│   │   ├── products.ts                # Product routes
│   │   └── [feature].ts               # Add routes per domain
│   ├── controllers/
│   │   ├── user-controller.ts         # User request handlers
│   │   ├── product-controller.ts      # Product request handlers
│   │   └── [feature]-controller.ts    # Add controllers per domain
│   ├── services/
│   │   ├── user-service.ts            # User business logic
│   │   ├── product-service.ts         # Product business logic
│   │   └── [feature]-service.ts       # Add services per domain
│   ├── repositories/
│   │   ├── user-repository.ts         # User data access
│   │   ├── product-repository.ts      # Product data access
│   │   └── base-repository.ts         # Shared repository patterns
│   ├── utils/
│   │   ├── validators.ts              # Validation helpers
│   │   ├── formatters.ts              # Response formatting
│   │   └── error-codes.ts             # Centralized error definitions
│   └── database/
│       ├── migrations/
│       │   ├── 001-initial-schema.ts  # Schema creation
│       │   └── 002-add-column.ts      # Schema modifications
│       └── seeds/
│           └── seed-data.ts           # Test/dev data
├── tests/
│   ├── setup.ts                       # Test utilities & fixtures
│   ├── integration/
│   │   ├── user.test.ts               # User API tests
│   │   ├── product.test.ts            # Product API tests
│   │   └── [feature].test.ts          # Add tests per domain
│   └── unit/
│       ├── services/
│       │   ├── user-service.test.ts
│       │   └── product-service.test.ts
│       └── utils/
│           └── validators.test.ts
├── docs/
│   ├── API.md                         # API endpoint documentation
│   ├── ARCHITECTURE.md                # System design and decisions
│   ├── DATABASE.md                    # DB schema & migrations
│   └── DEPLOYMENT.md                  # Deployment instructions
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .env.example                       # Environment template
├── .gitignore
└── .dockerignore                      # If using Docker
```

## Key Files to Create

### 1. CLAUDE.md (Project Context)

```markdown
# My TypeScript API Project

## Project Overview

Express.js + TypeScript REST API with Postgres database.
Organized for seamless context switching between planning and implementation.

## Architecture

- **Entry**: `src/index.ts` - Server bootstrap
- **Routes**: `src/routes/` - Endpoint definitions
- **Controllers**: `src/controllers/` - Request handlers
- **Services**: `src/services/` - Business logic
- **Repositories**: `src/repositories/` - Data access
- **Types**: `src/types/` - Centralized type definitions
- **Tests**: `tests/` - Unit and integration tests

## Key Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run all tests
- `npm run migrate` - Run database migrations
- `npm run lint` - Check code style

## File Naming Convention

- Files: lowercase with hyphens (e.g., `user-controller.ts`)
- Exports: PascalCase for classes/types, camelCase for functions

## Critical Rules

- Keep business logic in services, not controllers
- Types centralized in `src/types/` with clear exports
- Database access only through repositories
- All errors inherit from `AppError` in `src/types/errors.ts`
- Integration tests must use test database

## Postgres Notes

- Connection string from `.env` 
- Pool management in `src/config/database.ts`
- Migrations tracked in `src/database/migrations/`
- Schema changes require migration files before altering DB
```

### 2. .claude/settings.json (Claude Code Configuration)

```json
{
  "tools": {
    "bash": {
      "enabled": true,
      "permissions": [
        "npm run",
        "npm test",
        "npm run dev",
        "npx tsc"
      ]
    }
  },
  "hooks": {
    "onSessionStart": "echo 'Starting API project session'",
    "onBeforeEdit": "npx eslint --fix {file}"
  },
  "context": {
    "includePaths": [
      "src/",
      "tests/",
      ".claude/"
    ],
    "ignorePaths": [
      "node_modules/",
      "dist/",
      ".env"
    ]
  }
}
```

### 3. .claude/rules/typescript-api.md (API-Specific Rules)

```markdown
# TypeScript API Project Rules

## Code Organization

- Controllers: handle HTTP concerns only (status codes, headers)
- Services: contain all business logic
- Repositories: abstract database access
- Types: all types centralized in `src/types/`

## Error Handling

All errors must extend `AppError`:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

## Database Patterns

- Connection pool initialized in `src/config/database.ts`
- One repository per entity
- Queries parameterized to prevent SQL injection
- Migrations are immutable - no edits after deployed

## Testing Requirements

- Unit tests for services in `tests/unit/services/`
- Integration tests for routes in `tests/integration/`
- Test database separate from development
- Mocks for external services

## TypeScript Strictness

- `strict: true` in tsconfig.json
- No `any` types without explicit `// @ts-ignore` comment
- All function parameters typed
- Return types explicit for public functions
```

### 4. Package.json Scripts Setup

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "migrate": "ts-node src/database/migrations/run.ts",
    "seed": "ts-node src/database/seeds/seed-data.ts",
    "type-check": "tsc --noEmit"
  }
}
```

## How This Helps Claude Maintain Context

### During Planning Phase
- **CLAUDE.md** gives Claude the architecture overview immediately
- **src/types/** is the single source of truth for data models
- Clear separation means Claude knows where to look for each concern
- Rules file prevents repeating style/pattern guidance

### During Implementation Phase
- Controllers and services are colocated logically but separate physically
- Each file has a single responsibility, reducing cognitive load
- Routes registry shows all endpoints at a glance
- Utils and helpers are centralized (validators, formatters)

### During Testing Phase
- Test structure mirrors `src/` structure for easy navigation
- Integration tests show full request→response flows
- Unit tests focus on isolated service logic
- Test setup file is centralized in `tests/setup.ts`

### During Code Review/Debugging
- Related files are grouped by feature/domain (user, product, etc.)
- Type definitions are never scattered across files
- All error handling passes through middleware
- Database concerns isolated in repositories

## Context-Preserving Tips

1. **Add section comments to large files**:
   ```typescript
   // ============================================================
   // GET /users/:id - Fetch user by ID
   // ============================================================
   ```

2. **Keep domains grouped**: If you have Users and Products, keep all user files together, all product files together.

3. **Document decisions**: Add `ARCHITECTURE.md` with decision logs:
   ```
   ## Why Repository Pattern?
   - Isolates DB details from business logic
   - Enables testing services without a database
   - Makes switching databases easier
   ```

4. **Use TypeScript strict mode**: Prevents Claude from having to ask "what type is this?"

5. **Centralize constants**: Never hardcode strings like error codes or status messages:
   ```typescript
   // src/utils/error-codes.ts
   export const ERROR_CODES = {
     USER_NOT_FOUND: 'USER_NOT_FOUND',
     INVALID_EMAIL: 'INVALID_EMAIL',
   } as const;
   ```

## Getting Started

1. Create the folder structure above
2. Create CLAUDE.md with your specific decisions
3. Create `.claude/rules/typescript-api.md` with your project rules
4. Create `.claude/settings.json` with your Claude Code preferences
5. Set up tsconfig.json with `strict: true`
6. Create your first domain (e.g., Users) with:
   - `src/types/user.ts` (types)
   - `src/repositories/user-repository.ts` (data access)
   - `src/services/user-service.ts` (business logic)
   - `src/controllers/user-controller.ts` (HTTP handlers)
   - `src/routes/users.ts` (endpoint definitions)
   - `tests/integration/user.test.ts` (integration tests)

This structure keeps your project modular, testable, and most importantly, keeps Claude's context sharp across all phases of development.
