# FortyEight

Weekend planner. Tell it where you are, what your group likes, how many of you there are, and what you want to spend. It returns a short, ranked list of things to do this weekend.

**Status: Phase 0 (foundation).** The whole flow works end to end with sample data. Real events, accounts, and payments come in later phases. See [`PRD.md`](./PRD.md).

**Michael and Liam:** the day-to-day workflow (branches, preview links, putting changes live) is in [Working together](#working-together-michael-and-liam).

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

## Working together (Michael and Liam)

### The idea

```
michael branch ──push──► Michael's preview link ──┐
                                                  ├── pull request + merge ──► main ──► live site
liam branch ─────push──► Liam's preview link ─────┘
```

- **`main` is the live site.** Nobody edits it directly. Changes only reach it by merging a pull request.
- **`michael` and `liam` are each person's own working branch.** Change anything you want there. It never touches the live site.
- **Every push to a branch rebuilds that branch's preview link.** It takes about 30 seconds to 2 minutes.

### Links

| What              | Link                                              | Shows                          |
| ----------------- | ------------------------------------------------- | ------------------------------ |
| Live site         | (copy from Vercel: Project → Domains)             | Whatever is merged into `main` |
| Michael's preview | https://forty-eight-git-michael-boyle3.vercel.app | The latest push to `michael`   |
| Liam's preview    | https://forty-eight-git-liam-boyle3.vercel.app    | The latest push to `liam`      |

Bookmark your preview link on your phone and laptop. It never changes; just refresh it after each push. A preview link starts working after the first push to that branch.

Preview builds show a strip at the top: "Preview of michael, not the live site". If you see it, you are on a preview. The live site never shows it.

### Commit vs push (you need both)

- **Commit** saves a snapshot of your changes with a short note, like "Add a date filter". The commit stays where the code is being edited (your computer, or Claude's cloud session). Nobody else can see it yet, and Vercel does not know about it.
- **Push** uploads your commits to GitHub. **This is the step that updates your preview link.**
- So the order is always: **edit → commit → push → wait about a minute → refresh your preview link.**
- With Claude, just say "commit and push". It does both.

Two more words you will see:

- **Pull request (PR):** a request to copy one branch's changes into another (here: your branch into `main`). It is also where Vercel posts its comment.
- **Merge:** actually copying the changes into `main`. Merging into `main` updates the live site.

### Daily loop

1. **Start from the latest `main`**, so you have the other person's merged work. Tell Claude: "Update the `michael` branch with the latest `main`."
2. **Make changes.** Tell Claude what you want.
3. **Commit and push.** Tell Claude: "Commit and push to `michael`."
4. **Check your preview link** about a minute later. Repeat steps 2 to 4 as often as you like.

### The Vercel comment

Vercel only comments on pull requests, so keep one **draft** PR open from your branch into `main`:

1. On GitHub: **Pull requests → New pull request**. Set **base** to `main` and **compare** to your branch.
2. Choose **Create draft pull request**. (A draft means "not ready to merge yet".)
3. Within a minute, Vercel posts a comment with a **Preview** link and a status: Building, Ready, or Error. It edits that same comment on every push, so it is always current.

The draft PR is also where you see the CI checks (green check or red X) and where you will merge later. You can see your preview without a PR (the bookmarked link works on its own), but the PR shows whether the build worked.

### Putting changes live

1. Open your draft PR. Make sure the checks are green and the preview looks right. Ask the other person to open your preview too.
2. Click **Ready for review**, then **Merge pull request** with **Create a merge commit** (the default choice). Do not use "Squash and merge" or "Rebase and merge". With branches you keep reusing, those make old changes show up again in your next PR and cause conflicts.
3. If GitHub offers **Delete branch** after merging, do not click it. You keep using your branch.
4. The live site updates in about 1 to 2 minutes.
5. Tell the other person. Before their next push, they update their branch from `main` (step 1 of the daily loop).
6. Your next push to your branch needs a new draft PR, because the old one closed when it merged.

### When you both changed the same thing (conflicts)

If you both edited the same lines, GitHub says the PR "has conflicts" and won't let you merge. Tell Claude: "Update `liam` with the latest `main` and resolve the conflicts." Then check the preview again. Updating your branch from `main` often keeps conflicts small.

### Working with Claude Code

Cloud sessions start on their own branch (named like `claude/...`). At the start of each session, tell Claude which branch to use:

> Work on the `michael` branch. First update it with the latest `main`. Commit and push after each change, then give me my preview link.

Claude's cloud session can't open vercel.app links, so you check the preview yourself.

### Working with git on your own computer

You can also edit on your own computer. Run `pnpm dev` there to see each saved change instantly at http://localhost:3000, before you push.

```bash
# First time only: get the branches and switch to yours
git fetch origin
git switch michael

# Bring in the latest main (start of each work session)
git fetch origin
git merge origin/main

# Save and upload your work (updates your preview link)
git add -A
git commit -m "Describe the change"
git push
```

### One-time GitHub setup (Michael)

- **Protect `main`:** repo **Settings → Rules → Rulesets → New branch ruleset**. Target the default branch. Turn on: restrict deletions, block force pushes, require a pull request before merging (0 approvals is fine for two people), and require status checks to pass (add "Typecheck, lint, test, build" and "Playwright smoke"). Nobody can then break the live site by accident.
- **Only allow merge commits:** **Settings → General → Pull Requests**. Keep "Allow merge commits" on, and turn off squash and rebase merging. Leave "Automatically delete head branches" off.

### If something looks wrong

- **The preview shows the old version:** look at the Vercel comment on your PR. "Building" means wait. "Error" means the build failed. The live site and your previous preview are untouched. Ask Claude to run `pnpm typecheck && pnpm lint && pnpm build` and fix the error. (Only Michael can open the full Vercel build log, from the Vercel dashboard.)
- **The preview link says "not found":** that branch hasn't been pushed yet.
- **You don't see the other person's changes:** they are on their branch until merged. Open their preview link, or wait for them to merge and then update your branch from `main`.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`. Leave "Include files outside the root directory" on (the app imports `packages/*`).
3. Framework preset: Next.js. Vercel detects pnpm from the lockfile. No custom build command needed.
4. Add env vars from `.env.example` as you need them (none are required for Phase 0).
5. Every pushed branch gets its own preview link (see "Working together"). Check `https://<preview-url>/api/v1/health`.

## CI

`.github/workflows/ci.yml` runs on every PR: format check, typecheck, lint, unit tests, and build, plus a separate Playwright smoke job. Vercel handles deploys.
