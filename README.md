# FortyEight

Weekend planner. Tell it where you are, what your group likes, how many of you there are, and what you want to spend. It returns a short, ranked list of things to do this weekend.

**Status: Phase 0 (foundation).** The whole flow works end to end with sample data. Real events, accounts, and payments come in later phases. See [`PRD.md`](./PRD.md).

## Run it locally

Requirements: Node 22.12+ and pnpm 10 (`corepack enable` sets up pnpm from `package.json`).

```bash
pnpm install
```

```bash
pnpm dev
```

Open http://localhost:3000. No env vars needed for Phase 0. To add them later, copy `.env.example` to `apps/web/.env.local`.

## Scripts

| Command                                  | What it does                                                       |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                               | Web app with hot reload                                            |
| `pnpm build`                             | Production build of everything                                     |
| `pnpm typecheck`                         | TypeScript across all packages                                     |
| `pnpm lint`                              | ESLint across all packages                                         |
| `pnpm test`                              | Vitest unit tests (`packages/*`)                                   |
| `pnpm test:e2e`                          | Playwright smoke tests for the web app                             |
| `pnpm format` / `pnpm format:check`      | Prettier                                                           |
| `pnpm db:start` / `db:stop` / `db:reset` | Local Supabase (needs Docker)                                      |
| `pnpm db:types`                          | Regenerate `packages/db/src/database.types.ts` from local Supabase |

First time running e2e tests on a new machine, install the browser:

```bash
pnpm --filter @fortyeight/web exec playwright install chromium
```

## Repo layout

```
apps/web            Next.js 16 app: UI + /api/v1 route handlers
apps/mobile         Expo app plan (Phase 3, README only)
packages/core       Schemas, types, pipeline, providers, ranking (pure TS)
packages/api-client Typed client for /api/v1 (web + mobile)
packages/db         Generated Supabase types + query helpers
packages/config     Shared tsconfig, ESLint, Prettier, Tailwind theme
supabase/           Supabase CLI config + SQL migrations
```

Rules for where code goes are in [`CLAUDE.md`](./CLAUDE.md).

## API (v1)

| Route                         | Notes                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET /api/v1/health`          | `{ ok: true, version, commit }`                                                                  |
| `POST /api/v1/plans`          | Body: `PlanRequest` (preferences, date range, time zone). Returns a ranked `Plan`. Anonymous OK. |
| `GET/PUT /api/v1/preferences` | Signed-in user's saved preferences. Returns 503 until Supabase is configured.                    |

Auth is either the Supabase session cookie (web) or `Authorization: Bearer <supabase_jwt>` (mobile). Schemas for every request and response live in `packages/core/src/schemas`.

## Database (Supabase)

The schema is in `supabase/migrations`. Every table has row level security. Users can only see their own rows; billing and usage rows are read-only for users; the provider cache is server-only.

**Local** (needs Docker):

```bash
pnpm db:start
```

```bash
pnpm db:reset
```

```bash
pnpm db:types
```

`db:start` prints a local URL and keys. Put them in `apps/web/.env.local` as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

**Hosted project:**

```bash
pnpm exec supabase login
```

```bash
pnpm exec supabase link --project-ref <your-project-ref>
```

```bash
pnpm exec supabase db push
```

Commit the regenerated `database.types.ts` with any migration that changes the schema.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`. Leave "Include files outside the root directory" on (the app imports `packages/*`).
3. Framework preset: Next.js. Vercel detects pnpm from the lockfile. No custom build command needed.
4. Add env vars from `.env.example` as you need them (none are required for Phase 0).
5. Every PR gets a preview deploy. Check `https://<preview-url>/api/v1/health`.

## CI

`.github/workflows/ci.yml` runs on every PR: format check, typecheck, lint, unit tests, and build, plus a separate Playwright smoke job. Vercel handles deploys.
