# FortyEight mobile (planned, Phase 3)

No code here yet. This folder holds the plan so the web build keeps the iOS move cheap.

## Stack

- **Expo** (latest stable SDK) with **Expo Router**
- **NativeWind v5** (Tailwind v4 based), importing the same tokens as web from
  `packages/config/tailwind/theme.css`. If NativeWind v5 is not stable yet when we start,
  use NativeWind v4 and generate a JS preset from that file.
- **TanStack Query** and **Zustand**, same as web
- **react-hook-form** + zod resolver, same as web
- **Supabase JS** for auth (email magic link, Google, Sign in with Apple)
- PostHog and Sentry React Native SDKs

## What it reuses

| Package                  | Used for                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@fortyeight/core`       | Every schema, type, and rule: onboarding step validation, budget presets, date helpers, result filters, price text. Pure TypeScript, no DOM or Node APIs.                                                             |
| `@fortyeight/api-client` | All server calls. Create it with the deployed URL and a token getter: `createApiClient({ baseUrl: "https://<app>", getToken: () => session?.access_token })`. The API accepts `Authorization: Bearer <supabase_jwt>`. |
| `@fortyeight/db`         | Generated database types, if the app ever reads Supabase directly. Prefer the API.                                                                                                                                    |
| `@fortyeight/config`     | tsconfig, ESLint, and Tailwind theme tokens.                                                                                                                                                                          |

## What it does not reuse

UI components. Web uses shadcn/ui on the DOM; mobile gets native screens. We share logic, not UI
(see PRD section 8). The screens mirror the web flow: onboarding (5 steps), dates, results.

## Payments

The app checks the `entitlements` table, never Stripe directly. In the US the app can link out to
Stripe web checkout. Elsewhere, Apple In-App Purchase (likely via RevenueCat) becomes a second writer
to the same table. See PRD section 10.

## Getting started (when Phase 3 begins)

```bash
pnpm dlx create-expo-app@latest apps/mobile --template default
```

Then add `@fortyeight/core` and `@fortyeight/api-client` as `workspace:*` dependencies and set up
Metro for the pnpm monorepo (Expo supports this out of the box in recent SDKs).
