# CLAUDE.md

Rules for working in this repo. Read `PRD.md` for what we are building and which phase we are in.

## Where code goes

- Business logic goes in `packages/core`. Components only render and call hooks.
- Every API input and output is a zod schema in `packages/core`. Route handlers parse input with it, and send output through `jsonOk(schema, data)` in `apps/web/lib/server/http.ts`.
- Never import server-only code (Supabase service role, provider keys, Anthropic, Stripe secret) into client components. Server modules start with `import "server-only"`.
- All API routes live under `/api/v1`. Do not break existing contracts; add `v2` instead.
- Auth works by cookie (web) or `Authorization: Bearer <supabase_jwt>` (mobile). Use `getAuthContext(request)` from `apps/web/lib/server/auth.ts`. It returns a client that acts as the user, so RLS applies.
- Every new table gets RLS policies in the same migration. Billing and usage tables are read-only for users.
- Keep provider calls behind the `Provider` interface (`packages/core/src/providers/types.ts`). Always go through the cache (once it exists in Phase 1).
- AI ranking may only return IDs from the candidate list it was given. `applyRanking` enforces this; do not bypass it.
- Write a Vitest test for any new function in `packages/core`.
- Prefer small PRs, one feature per branch.

## Branches and previews

The full workflow is in `README.md` under "Working together".

- `main` is the live site (Vercel production). Never commit or push to `main` directly. Changes reach it only through a merged pull request.
- Michael works on the `michael` branch and Liam on the `liam` branch. Use the branch the user names. Before starting, merge the latest `origin/main` into it.
- Commit and push after each meaningful change so the branch preview updates. After pushing, give the user their preview link: `https://forty-eight-git-<branch>-boyle3.vercel.app`.
- Merge pull requests with a merge commit, never squash or rebase, and never delete the `michael` or `liam` branch.

## Package map

| Path                  | What it is                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`       | Pure TypeScript: zod schemas, types, pipeline, providers, ranking. No React, no Node APIs, no DOM. Runs on web, server, and React Native. |
| `packages/api-client` | Typed fetch client for `/api/v1`. Takes `baseUrl` + `getToken`. Shared by web and mobile.                                                 |
| `packages/db`         | Generated Supabase types (`database.types.ts`, do not hand-edit) + query helpers.                                                         |
| `packages/config`     | Shared tsconfig, ESLint, Prettier, and the Tailwind theme (`tailwind/theme.css`).                                                         |
| `apps/web`            | Next.js 16 App Router. UI plus `/api/v1` route handlers.                                                                                  |
| `apps/mobile`         | Placeholder for the Expo app (Phase 3).                                                                                                   |
| `supabase/`           | CLI config and SQL migrations.                                                                                                            |

## Commands

```bash
pnpm dev          # web app on http://localhost:3000
pnpm typecheck    # all packages
pnpm lint
pnpm test         # Vitest
pnpm test:e2e     # Playwright smoke tests (apps/web)
pnpm format       # Prettier
pnpm db:types     # regenerate packages/db/src/database.types.ts from local Supabase
```

Run `pnpm typecheck && pnpm lint && pnpm test` before you push.

## Conventions

- TypeScript strict, with `noUncheckedIndexedAccess`. Prefer `?? fallback` over `!`.
- Money is integer cents. Dates are `YYYY-MM-DD` strings in the user's time zone; instants are ISO strings. Use the helpers in `packages/core/src/dates.ts` (no date libraries).
- Model IDs come from env (`AI_MODEL_RANK`, `AI_MODEL_FAST`), never hardcoded.
- Client state that lives on the device (onboarding answers, recent plans) is Zustand with `persist`. Gate rendering on `useHydrated()` to avoid hydration mismatches.
- UI: Tailwind v4 + shadcn-style components in `apps/web/components/ui`. Use theme tokens (`bg-primary`, `text-muted-foreground`), not raw colors. Native form controls first; they are accessible for free.
- Accessibility: every input has a label, errors use `role="alert"` and `aria-describedby`, and pages have one `h1`.
