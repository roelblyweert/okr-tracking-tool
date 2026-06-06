-- ===========================================================================
-- Team OKR tracking tool — database schema + security.
-- Run this ONCE in your Supabase project: SQL Editor -> New query -> paste -> Run.
--
-- SECURITY MODEL (read before changing anything):
-- The GitHub Pages site is public, so the *database* is what protects the data.
-- Row-Level Security (RLS) below only allows access to signed-in users whose
-- email ends in @persgroep.net. Everyone on the team shares one set of OKRs.
-- NEVER disable RLS on these tables. See CLAUDE.md.
-- ===========================================================================

-- --- Tables ----------------------------------------------------------------
create table if not exists public.objectives (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  owner       text not null default '',
  quarter     text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.key_results (
  id            uuid primary key default gen_random_uuid(),
  objective_id  uuid not null references public.objectives (id) on delete cascade,
  title         text not null,
  target_value  numeric not null default 0,
  current_value numeric not null default 0,
  unit          text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists key_results_objective_id_idx
  on public.key_results (objective_id);

-- --- Row-Level Security ----------------------------------------------------
alter table public.objectives  enable row level security;
alter table public.key_results enable row level security;

-- Helper condition: the authenticated user's email is on the team domain.
-- (auth.jwt() ->> 'email') is the signed-in user's email.

-- Objectives: full access for team members only.
drop policy if exists "team access objectives" on public.objectives;
create policy "team access objectives"
  on public.objectives
  for all
  to authenticated
  using      ((auth.jwt() ->> 'email') like '%@persgroep.net')
  with check ((auth.jwt() ->> 'email') like '%@persgroep.net');

-- Key results: full access for team members only.
drop policy if exists "team access key_results" on public.key_results;
create policy "team access key_results"
  on public.key_results
  for all
  to authenticated
  using      ((auth.jwt() ->> 'email') like '%@persgroep.net')
  with check ((auth.jwt() ->> 'email') like '%@persgroep.net');
