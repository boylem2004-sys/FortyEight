-- FortyEight initial schema (PRD section 11).
--
-- Rules:
--   * Every table has row level security on.
--   * Users read and write only their own rows.
--   * Billing and usage rows (entitlements, usage_counters) are read-only for
--     users. Only the server (service role) writes them, so nobody can grant
--     themselves Pro or reset their plan count.
--   * provider_cache has no policies at all: service role only.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- preferences: onboarding answers, one row per user
-- ---------------------------------------------------------------------------

create table public.preferences (
  user_id uuid primary key references auth.users on delete cascade,
  location_label text,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  radius_miles int not null default 25 check (radius_miles in (5, 10, 25, 50)),
  interests text[] not null default '{}',
  interests_freeform text check (char_length(interests_freeform) <= 280),
  event_types text[] not null default '{}',
  group_size int not null default 1 check (group_size between 1 and 20),
  budget_min_cents int not null default 0 check (budget_min_cents >= 0),
  budget_max_cents int check (budget_max_cents is null or budget_max_cents >= budget_min_cents), -- null = no max
  updated_at timestamptz not null default now(),
  constraint preferences_lat_lng_together check ((lat is null) = (lng is null))
);

alter table public.preferences enable row level security;

create policy "preferences_select_own" on public.preferences
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "preferences_insert_own" on public.preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "preferences_update_own" on public.preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "preferences_delete_own" on public.preferences
  for delete to authenticated using ((select auth.uid()) = user_id);

create trigger preferences_set_updated_at
  before update on public.preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plans: one generated weekend plan
-- ---------------------------------------------------------------------------

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade, -- null for anonymous plans
  anon_id text,                                         -- device id for anonymous users
  input jsonb not null,                                 -- snapshot of the PlanRequest
  resolved_location jsonb,                              -- { label, lat, lng, approximate }
  meta jsonb not null default '{}',                     -- { candidateCount, usedWebResearch, fixtureData }
  date_start date not null,
  date_end date not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  constraint plans_owner_present check (user_id is not null or anon_id is not null),
  constraint plans_dates_ordered check (date_end >= date_start)
);

create index plans_user_created_idx on public.plans (user_id, created_at desc);
create index plans_anon_idx on public.plans (anon_id) where anon_id is not null;

alter table public.plans enable row level security;

-- Anonymous plans (user_id null) are only reachable through the server.
create policy "plans_select_own" on public.plans
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "plans_insert_own" on public.plans
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "plans_delete_own" on public.plans
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- plan_items: ranked suggestions inside a plan. Written by the pipeline
-- (service role). Users can read items of their own plans.
-- ---------------------------------------------------------------------------

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans on delete cascade,
  rank int not null check (rank >= 1),
  source text not null,                 -- ticketmaster | google_places | ai_web
  source_id text,
  title text not null,
  category text not null,
  starts_at timestamptz,
  venue_name text,
  lat double precision,
  lng double precision,
  distance_miles numeric,
  price_min_cents int check (price_min_cents >= 0),
  price_max_cents int check (price_max_cents >= 0),
  price_known boolean not null default true,
  price_estimated boolean not null default false, -- true when guessed from Google price level
  url text,
  image_url text,
  fit_score numeric check (fit_score between 0 and 100),
  fit_reason text,
  verified boolean not null default true,
  raw jsonb,
  constraint plan_items_rank_unique unique (plan_id, rank)
);

alter table public.plan_items enable row level security;

create policy "plan_items_select_own" on public.plan_items
  for select to authenticated using (
    exists (
      select 1 from public.plans p
      where p.id = plan_items.plan_id and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- saved_items: favorites
-- ---------------------------------------------------------------------------

create table public.saved_items (
  user_id uuid not null references auth.users on delete cascade,
  plan_item_id uuid not null references public.plan_items on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_item_id)
);

create index saved_items_plan_item_idx on public.saved_items (plan_item_id);

alter table public.saved_items enable row level security;

create policy "saved_items_select_own" on public.saved_items
  for select to authenticated using ((select auth.uid()) = user_id);

-- Users can only save items from their own plans.
create policy "saved_items_insert_own" on public.saved_items
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.plan_items i
      join public.plans p on p.id = i.plan_id
      where i.id = saved_items.plan_item_id and p.user_id = (select auth.uid())
    )
  );

create policy "saved_items_delete_own" on public.saved_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- provider_cache: raw provider responses keyed by area + dates.
-- Service role only (no policies on purpose).
-- ---------------------------------------------------------------------------

create table public.provider_cache (
  key text primary key, -- provider:geohash5:dateStart:dateEnd:category
  payload jsonb not null,
  expires_at timestamptz not null
);

create index provider_cache_expires_idx on public.provider_cache (expires_at);

alter table public.provider_cache enable row level security;
revoke all on public.provider_cache from anon, authenticated;

-- ---------------------------------------------------------------------------
-- entitlements: what a user has paid for. Payment-source agnostic
-- (Stripe now, Apple IAP later). The app checks this, never Stripe directly.
-- ---------------------------------------------------------------------------

create table public.entitlements (
  user_id uuid primary key references auth.users on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  source text check (source in ('stripe', 'apple', 'manual')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "entitlements_select_own" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- usage_counters: plans generated per calendar month, for the free tier limit.
-- ---------------------------------------------------------------------------

create table public.usage_counters (
  user_id uuid not null references auth.users on delete cascade,
  period text not null check (period ~ '^\d{4}-(0[1-9]|1[0-2])$'), -- '2026-11'
  plans_generated int not null default 0 check (plans_generated >= 0),
  primary key (user_id, period)
);

alter table public.usage_counters enable row level security;

create policy "usage_counters_select_own" on public.usage_counters
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- New user setup: profile + free entitlement row.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80)
  );
  insert into public.entitlements (user_id) values (new.id);
  return new;
end;
$$;

-- Only the auth trigger should run this.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
