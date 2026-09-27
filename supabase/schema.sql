-- TripSync AI — database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Access model: Row Level Security is enabled on every table with NO policies,
-- so the public anon key can read/write nothing. All access goes through the
-- Next.js server using the service_role key (which bypasses RLS).

-- 1. Trips ---------------------------------------------------------------
create table if not exists public.trips (
  id                  text primary key,                 -- short shareable code, e.g. "k7m2p9xq"
  name                text not null check (char_length(name) between 1 and 120),
  coordinator_name    text not null check (char_length(coordinator_name) between 1 and 60),
  expected_travellers integer not null check (expected_travellers between 1 and 50),
  currency            text not null default 'INR',
  created_at          timestamptz not null default now()
);

-- 2. Participants (one row per traveller in a trip) ----------------------
create table if not exists public.participants (
  id             uuid primary key default gen_random_uuid(),
  trip_id        text not null references public.trips(id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 60),
  name_key       text generated always as (lower(btrim(name))) stored,
  is_coordinator boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (trip_id, name_key)                             -- one "Riya" per trip
);
create index if not exists participants_trip_id_idx on public.participants(trip_id);

-- 3. Preferences (one row per participant who has responded) -------------
create table if not exists public.preferences (
  id                uuid primary key default gen_random_uuid(),
  participant_id    uuid not null unique references public.participants(id) on delete cascade,
  budget_max        integer not null check (budget_max > 0),
  available_start   date not null,
  available_end     date not null,
  destination_types text[] not null default '{}',
  trip_styles       text[] not null default '{}',
  must_haves        text not null default '',
  avoid             text not null default '',
  flexibility       text not null check (flexibility in ('low', 'medium', 'high')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (available_end >= available_start)
);

-- 4. AI analyses (every run is kept; the latest one is shown) ------------
create table if not exists public.analyses (
  id             uuid primary key default gen_random_uuid(),
  trip_id        text not null references public.trips(id) on delete cascade,
  result         jsonb not null,
  response_count integer not null,
  model          text,
  created_at     timestamptz not null default now()
);
create index if not exists analyses_trip_created_idx on public.analyses(trip_id, created_at desc);

-- Lock everything down to the server (service_role) -----------------------
alter table public.trips        enable row level security;
alter table public.participants enable row level security;
alter table public.preferences  enable row level security;
alter table public.analyses     enable row level security;
