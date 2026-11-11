# FortyEight: Product Requirements Document (v0.1, Foundation)

> Formerly "Weekender". Audience: Claude Code. This doc sets up the repo foundation. Build Phase 0 only (see section 12). Do not build features beyond Phase 0 unless asked.

---

## 1. Summary

FortyEight helps a person and their friend group decide what to do this weekend. The user gives a location, interests, budget, group size, and event types they like. FortyEight pulls real local options (events, places, activities), filters by price and distance, and ranks them with AI against the user's interests. It returns a short list of plans, not an endless feed.

Platform plan: web app first (Next.js on Vercel). iOS later (Expo / React Native). The foundation must make the iOS move cheap by keeping all business logic, types, and data access out of the web UI.

## 2. Goals and non-goals

### Goals (v1)

- Onboarding that captures: location, interests, budget, group size, liked event types.
- Generate 5 to 10 ranked suggestions for a chosen weekend, each with: title, category, date/time, venue, distance, price per person, why it fits, and a link out.
- Save preferences so repeat use is one tap.
- Save/favorite suggestions.
- Free tier with a monthly limit on generated plans; paid tier via Stripe.

### Non-goals (v1)

- Buying tickets inside the app (we link out).
- Group voting, shared plans, chat (Phase 3+).
- Full itinerary building with travel times (Phase 3+).
- Android (Expo makes this cheap later, but not in scope).

## 3. Target user

- Primary: 20s to early 30s, has a friend group of roughly 2 to 8 people, plans weekends on the fly, price aware.
- Core job: "It's Thursday night. What should we do this weekend that we'll all like and that fits our budget?"

## 4. User flow

1. Landing page -> "Plan my weekend".
2. Onboarding wizard (5 short steps, one question per screen, progress bar):
   1. **Location**: "Use my location" (browser geolocation) OR type city/ZIP. Plus travel radius (5, 10, 25, 50 miles).
   2. **Interests**: multi-select chips (e.g. live music, food and drink, outdoors, nightlife, arts, comedy, sports, fitness, gaming, markets, learning) plus free-text "anything else".
   3. **Event types you like**: multi-select (concerts, sports games, movies, theater, comedy shows, festivals, bars/breweries, restaurants, outdoor activities, classes/workshops).
   4. **Group size**: stepper, 1 to 20.
   5. **Budget**: per person, per weekend. Slider with presets: Free, Under $25, Under $50, Under $100, $100+. Store as min/max cents.
3. Pick dates: defaults to the upcoming Fri to Sun. Allow custom range up to 14 days out.
4. Results screen: ranked cards. Filters: category, max price, distance, day. Each card has "Why this fits" (1 to 2 sentences), price per person and total for group, and an outbound link.
5. Save a card, regenerate, or tweak preferences.
6. Auth prompt appears when the user tries to save or hits a second generation (anonymous first run is allowed).

## 5. Functional requirements

| ID  | Requirement                                                                       | Phase |
| --- | --------------------------------------------------------------------------------- | ----- |
| F1  | Capture and validate onboarding inputs (shared zod schema)                        | 0     |
| F2  | Store preferences per user (Supabase) and in local state for anon users           | 1     |
| F3  | Resolve location to lat/lng + display name (geolocation or geocoding)             | 1     |
| F4  | Fetch candidate items from providers (section 7) for location, radius, date range | 1     |
| F5  | Normalize all provider results into one `Suggestion` shape                        | 1     |
| F6  | Hard filters: date range, radius, price per person <= budget max                  | 1     |
| F7  | AI ranking + "why this fits" text using user interests and group size             | 1     |
| F8  | Cache provider results by area + date to protect API quotas                       | 1     |
| F9  | Save/unsave suggestions                                                           | 1     |
| F10 | Auth: email magic link, Google, Sign in with Apple                                | 1     |
| F11 | Usage limits: free tier N plans per month, tracked server side                    | 2     |
| F12 | Stripe subscription: Checkout, webhooks, Customer Portal                          | 2     |
| F13 | Entitlements table that is payment-source agnostic (Stripe now, Apple IAP later)  | 2     |

## 6. Non-functional requirements

- **API first**: every feature works through versioned HTTP endpoints (`/api/v1/*`). The web UI is just one client. The iOS app will be the second.
- **No business logic in React components.** Logic lives in `packages/core`.
- **Shared types and validation** via zod schemas in `packages/core`, used by web, API, and later mobile.
- **Auth by bearer token**: API accepts Supabase JWT in `Authorization` header (not only cookies), so native clients work.
- **Secrets stay server side.** Provider keys, Anthropic key, Stripe secret, and Supabase service role key never ship to a client.
- **Row Level Security** on every user table.
- Results in under 10 seconds p50 for a cached area, under 20 seconds uncached. Stream partial results if possible.
- Mobile-first responsive web design.
- Accessible: WCAG 2.1 AA basics (labels, contrast, keyboard nav).

## 7. Data sources (the "research" layer)

This is the hardest part of the product. The plan is structured APIs first, AI web research second.

| Category                                                     | Source                               | Notes                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Concerts, sports, theater, comedy, family                    | **Ticketmaster Discovery API v2**    | Free key. Default 5,000 calls/day, 5 req/sec. Has price ranges, venue lat/lng, classifications. Primary event source. |
| Restaurants, bars, breweries, parks, attractions, activities | **Google Places API (New)**          | Text Search / Nearby Search with price level and ratings. Also use Google Geocoding for city/ZIP -> lat/lng.          |
| Movies                                                       | **Claude web search** fallback in v1 | Showtime APIs are paid (e.g. Gracenote). Revisit later.                                                               |
| Local/indie events (markets, festivals, small venues)        | **Claude web search** fallback       | Eventbrite removed public event search from its API in 2019, so do not plan on it.                                    |
| Future                                                       | SeatGeek, PredictHQ, Yelp            | Evaluate cost later. Leave a provider interface so these plug in.                                                     |

### Provider interface (in `packages/core/providers`)

```ts
interface Provider {
  id: "ticketmaster" | "google_places" | "ai_web" | string;
  supports(category: Category): boolean;
  search(input: ProviderSearchInput): Promise<RawItem[]>;
  normalize(raw: RawItem): Suggestion;
}
```

### Recommendation pipeline

1. Build query from preferences (location, radius, dates, categories).
2. Check cache (`provider_cache` table keyed by provider + geohash(5) + date range + category). TTL: events 6h, places 7d.
3. Fan out to providers in parallel. Respect rate limits.
4. Normalize to `Suggestion`. Dedupe by venue + date + fuzzy title.
5. Hard filter (date, distance, price per person). Unknown price = keep but flag.
6. AI rank: send the top ~40 candidates (compact JSON) plus user profile to Claude. Return top 5 to 10 with a fit score and 1 to 2 sentence reason. Use structured output (JSON schema). Model never invents items: it may only pick from the provided candidate IDs.
7. AI web research fallback: only if fewer than 5 good candidates OR the user selected movies/indie events. Use Claude with the web search tool, ask for structured results with source URLs, and mark them `source: 'ai_web'` and `verified: false` in the UI.
8. Store the plan in `plans` + `plan_items`.

### AI model choices

- Ranking + reasons: `claude-sonnet-5-5`.
- Cheap tasks (parsing free text interests, classifying): `claude-haiku-5-5`.
- Put model IDs in env/config, not hardcoded.

## 8. Tech stack

| Layer                   | Choice                                                                                   | Why                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repo                    | **GitHub**, monorepo with **Turborepo + pnpm workspaces**                                | One repo holds web, future iOS, and shared code.                                                                                                             |
| Language                | **TypeScript** (strict) everywhere                                                       | Shared types across web, API, mobile.                                                                                                                        |
| Web app                 | **Next.js 16 (App Router)** in `apps/web`                                                | Best fit with Vercel. Route handlers act as the API.                                                                                                         |
| Hosting                 | **Vercel**                                                                               | Preview deploy per PR. Set Vercel root to `apps/web`.                                                                                                        |
| Database, auth, storage | **Supabase** (Postgres, Auth, RLS)                                                       | Has official JS client for both web and React Native.                                                                                                        |
| Payments                | **Stripe** (Checkout, Billing, Customer Portal, webhooks)                                | See section 10 for iOS rules.                                                                                                                                |
| AI                      | **Anthropic API** (Claude) via `@anthropic-ai/sdk`                                       | Ranking, reasons, web research fallback.                                                                                                                     |
| Validation              | **zod**                                                                                  | Shared schemas = shared contract.                                                                                                                            |
| Data fetching (client)  | **TanStack Query**                                                                       | Same library works in React Native later.                                                                                                                    |
| Client state            | **Zustand** (onboarding wizard state)                                                    | Tiny, works on web and native.                                                                                                                               |
| Forms                   | **react-hook-form** + zod resolver                                                       | Works on web and native.                                                                                                                                     |
| Web UI                  | **Tailwind CSS + shadcn/ui**                                                             | Fast to build, easy to theme.                                                                                                                                |
| Design tokens           | `packages/config/tailwind` shared preset                                                 | Reused later by **NativeWind** in Expo so styles match.                                                                                                      |
| Future iOS              | **Expo (latest stable SDK) + Expo Router + NativeWind** in `apps/mobile`                 | Reuses `packages/core` and `packages/api-client`. UI is rebuilt natively (do not try to share UI components between web and native in v1; share logic only). |
| Analytics               | **PostHog**                                                                              | SDKs for web and React Native.                                                                                                                               |
| Errors                  | **Sentry**                                                                               | SDKs for Next.js and Expo.                                                                                                                                   |
| Testing                 | **Vitest** (core, API) + **Playwright** (web e2e smoke)                                  |                                                                                                                                                              |
| Lint/format             | ESLint + Prettier                                                                        |                                                                                                                                                              |
| CI                      | **GitHub Actions**: typecheck, lint, test on every PR                                    | Vercel handles deploys.                                                                                                                                      |
| DB migrations           | **Supabase CLI** migrations in `supabase/migrations`, generated types into `packages/db` |                                                                                                                                                              |

### Why "share logic, not UI"

Sharing UI between Next.js and React Native (Solito / react-native-web) is possible, but it adds setup pain and slows down a web-first build. Sharing types, schemas, API client, and pipeline logic gets most of the benefit with little cost. Revisit only if the iOS app needs to match the web UI pixel for pixel.

## 9. Repo structure

```
fortyeight/
├─ apps/
│  ├─ web/                    # Next.js 16 app (UI + /api/v1 route handlers)
│  │  ├─ app/
│  │  │  ├─ (marketing)/page.tsx
│  │  │  ├─ onboarding/[step]/page.tsx
│  │  │  ├─ results/[planId]/page.tsx
│  │  │  ├─ saved/page.tsx
│  │  │  ├─ account/page.tsx
│  │  │  └─ api/v1/
│  │  │     ├─ health/route.ts
│  │  │     ├─ preferences/route.ts
│  │  │     ├─ plans/route.ts            # POST create plan, GET list
│  │  │     ├─ plans/[id]/route.ts
│  │  │     ├─ saved/route.ts
│  │  │     ├─ geocode/route.ts
│  │  │     ├─ billing/checkout/route.ts
│  │  │     ├─ billing/portal/route.ts
│  │  │     └─ webhooks/stripe/route.ts
│  │  ├─ components/
│  │  └─ lib/ (supabase server/client helpers, auth middleware)
│  └─ mobile/                 # placeholder only in Phase 0 (README explaining plan)
├─ packages/
│  ├─ core/                   # pure TS: zod schemas, types, pipeline, providers, ranking prompts
│  ├─ api-client/             # typed fetch client for /api/v1 (used by web + mobile)
│  ├─ db/                     # generated Supabase types + query helpers
│  └─ config/                 # tsconfig, eslint, tailwind preset
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ .github/workflows/ci.yml
├─ CLAUDE.md                  # coding rules for Claude Code (see section 13)
├─ PRD.md                     # this file
├─ .env.example
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

## 10. Payments and the iOS question

- Web: Stripe Checkout for subscriptions, Customer Portal for managing them, webhook updates the `entitlements` table.
- iOS later: in the US, Apple currently allows apps to link out to a web checkout (Stripe) for digital subscriptions, following the 2025 Epic v. Apple rulings. This is still moving in court. Outside the US, Apple In-App Purchase is generally required.
- Design rule: **the app checks `entitlements`, never Stripe directly.** Then adding Apple IAP (likely via RevenueCat) later is just another writer to the same table.
- Sign in with Apple must be offered on iOS if we offer Google sign-in. Set it up in Supabase Auth now so web and iOS share accounts.

### Pricing placeholder (to validate)

- Free: 3 plans per month.
- Pro: ~$4.99/month, unlimited plans, saved history, (later) group features.

## 11. Data model (Supabase / Postgres)

All tables have RLS on. Users can only read/write their own rows. `provider_cache` is service-role only.

```sql
-- profiles: 1:1 with auth.users
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table preferences (
  user_id uuid primary key references auth.users on delete cascade,
  location_label text,               -- "Blue Bell, PA"
  lat double precision,
  lng double precision,
  radius_miles int default 25,
  interests text[] default '{}',
  interests_freeform text,
  event_types text[] default '{}',
  group_size int default 1 check (group_size between 1 and 20),
  budget_min_cents int default 0,
  budget_max_cents int,              -- null = no max
  updated_at timestamptz default now()
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,  -- null for anon
  anon_id text,                                          -- device id for anon users
  input jsonb not null,             -- snapshot of preferences used
  date_start date not null,
  date_end date not null,
  status text not null default 'pending', -- pending | ready | failed
  created_at timestamptz default now()
);

create table plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans on delete cascade,
  rank int not null,
  source text not null,             -- ticketmaster | google_places | ai_web
  source_id text,
  title text not null,
  category text not null,
  starts_at timestamptz,
  venue_name text,
  lat double precision,
  lng double precision,
  distance_miles numeric,
  price_min_cents int,
  price_max_cents int,
  price_known boolean default true,
  url text,
  image_url text,
  fit_score numeric,
  fit_reason text,
  verified boolean default true,
  raw jsonb
);

create table saved_items (
  user_id uuid references auth.users on delete cascade,
  plan_item_id uuid references plan_items on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, plan_item_id)
);

create table provider_cache (
  key text primary key,             -- provider:geohash5:dateStart:dateEnd:category
  payload jsonb not null,
  expires_at timestamptz not null
);

create table entitlements (
  user_id uuid primary key references auth.users on delete cascade,
  tier text not null default 'free',   -- free | pro
  source text,                         -- stripe | apple | manual
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

create table usage_counters (
  user_id uuid references auth.users on delete cascade,
  period text not null,                -- '2026-11'
  plans_generated int default 0,
  primary key (user_id, period)
);
```

## 12. Build phases

### Phase 0: Foundation (BUILD THIS NOW)

Goal: a deployed, empty-but-real skeleton where every layer is wired.

1. Init Turborepo + pnpm monorepo with the structure in section 9. TypeScript strict.
2. `packages/config`: shared tsconfig, eslint, prettier, tailwind preset (colors, radius, spacing tokens).
3. `packages/core`: zod schemas and types for `Preferences`, `PlanRequest`, `Suggestion`, `Category`, `EventType`, `Interest` enums. `Provider` interface. Stub providers that return fixture data. Unit tests with Vitest.
4. `packages/api-client`: typed client for `/api/v1/health`, `/api/v1/preferences`, `/api/v1/plans`. Takes base URL + token getter so mobile can reuse it.
5. `apps/web`: Next.js 16 App Router, Tailwind, shadcn/ui init, TanStack Query provider, Zustand store for onboarding.
   - Landing page.
   - Onboarding wizard (3 screens covering the answers from section 4) with validation from `packages/core`. Saves to local state.
   - Results page that calls `POST /api/v1/plans` and renders fixture suggestions as cards.
6. `/api/v1/health` returns `{ ok: true, version }`. `/api/v1/plans` validates input with zod and returns fixture results from stub providers.
7. Supabase: init CLI, write migration for section 11 tables + RLS policies, generate types into `packages/db`. Add server and browser Supabase helpers. Auth middleware that accepts cookie OR bearer token.
8. `.env.example` with every key from section 14 (empty values).
9. GitHub Actions CI: install, typecheck, lint, test.
10. `apps/mobile/README.md` explaining the Expo plan and which packages it will reuse. No Expo code yet.
11. `CLAUDE.md` with the rules in section 13.
12. Root `README.md`: how to run locally, how to deploy to Vercel (root dir `apps/web`), how to run Supabase migrations.

**Phase 0 done when:** `pnpm dev` runs the web app, the onboarding flow works end to end with fixture results, CI is green, and the Vercel preview deploy loads.

### Phase 1: Real suggestions

Auth (magic link, Google, Apple), real Ticketmaster + Google Places providers, geocoding, cache, Claude ranking, save items.

### Phase 2: Monetization

Stripe Checkout, webhook, Customer Portal, entitlements, usage limits, paywall UI.

### Phase 3: Social and iOS

Expo app in `apps/mobile`, group invites and voting, shareable plan links, push reminders.

## 13. CLAUDE.md rules (create this file)

- Business logic goes in `packages/core`. Components only render and call hooks.
- Every API input and output is a zod schema in `packages/core`. Route handlers parse input with it.
- Never import server-only code (Supabase service role, provider keys, Anthropic, Stripe secret) into client components. Use `server-only` package.
- All API routes live under `/api/v1`. Do not break existing contracts; add `v2` instead.
- Auth works by cookie (web) or `Authorization: Bearer <supabase_jwt>` (mobile).
- Every new table gets RLS policies in the same migration.
- Keep provider calls behind the `Provider` interface. Always go through the cache.
- AI ranking may only return IDs from the candidate list it was given.
- Write a Vitest test for any new function in `packages/core`.
- Prefer small PRs, one feature per branch.

## 14. Environment variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
AI_MODEL_RANK=claude-sonnet-5-5
AI_MODEL_FAST=claude-haiku-5-5

# Providers
TICKETMASTER_API_KEY=
GOOGLE_MAPS_API_KEY=          # Places API (New) + Geocoding, server only

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=

# Observability
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
FREE_PLANS_PER_MONTH=3
```

## 15. Success metrics (v1)

- Activation: % of visitors who finish onboarding and see results.
- Quality: % of plans where the user saves or clicks out on at least 1 item.
- Retention: % of users who generate a plan in 2 different weekends within 30 days.
- Cost: average API + AI cost per plan (target under $0.05).
- Conversion: free -> Pro rate.

## 16. Risks and open questions

| Risk                                                       | Mitigation                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Thin data for small towns / indie events                   | AI web fallback, clearly labeled unverified.                                                    |
| Price data missing (bars, parks, many events)              | Show "price unknown", use Google price level as estimate, never hide the item silently.         |
| AI hallucinated events                                     | Ranking picks only from candidate IDs. Web results must include source URL.                     |
| Ticketmaster quota (5k/day)                                | Cache by area + date. Apply for higher limit once in production.                                |
| Google Places cost at scale                                | Field masks to request only needed fields. Cache 7 days.                                        |
| Apple payment rules change                                 | Entitlements table is source agnostic.                                                          |
| Commodity product (Google, Instagram, TikTok do discovery) | Differentiator must be group fit + budget fit + speed. Validate with real users before Phase 2. |

Open questions:

- Budget per person or total for the group? (v1 assumes per person, shows group total.)
- Launch market: one metro (e.g. Philadelphia area) first, or nationwide?
- Does the user plan for the group, or does each friend give input? (Changes Phase 3 a lot.)
- Is Pro worth paying for without group features?

---

## Appendix: Phase 0 implementation notes

Decisions made while building Phase 0 that differ from or add to the sections above.

- **Schema additions** (`supabase/migrations/20261108000000_init.sql`):
  - `plan_items.price_estimated` so a price guessed from Google price level is labeled as an estimate (section 16) instead of passing as a real price.
  - `plans.resolved_location` and `plans.meta` so a stored plan can be returned in the same shape as `POST /api/v1/plans`.
  - Check constraints (radius options, budget order, plan owner present, period format) and a sign-up trigger that creates `profiles` and a free `entitlements` row.
  - `plan_items`, `entitlements`, and `usage_counters` are read-only for users. The server writes them with the service role so nobody can edit their own rank, tier, or plan count.
- **Routes not built yet**: `plans/[id]`, `saved`, `geocode`, `billing/*`, `webhooks/stripe`, `saved/page`, and `account/page` belong to Phases 1 and 2. `plans` has POST only.
- **Plans are kept on the device** (localStorage) until Phase 1 persistence, so `/results/[planId]` works after a reload on the same device.
- **Phase 0 geocoding** uses a small fixture table (a dozen cities and ZIPs). Unknown places fall back to Philadelphia and the results page says so.
- **Default dates**: Mon to Thu picks the coming Fri to Sun. Friday and Saturday pick the rest of the current weekend. Sunday rolls to next weekend.
- **Web research trigger**: "movies/indie events" is read as the Movies or Festivals event type, or the Markets interest.
- **Pinned versions**: TypeScript 6.0 and ESLint 9, because typescript-eslint and the React/a11y lint plugins do not support TypeScript 7 or ESLint 10 yet.
