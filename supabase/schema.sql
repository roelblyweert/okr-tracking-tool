-- ===========================================================================
-- Team OKR tracking tool — database schema + security.
-- Run this ONCE in your Supabase project: SQL Editor -> New query -> paste -> Run.
--
-- NOTE: this script DROPs and recreates the tables. There is no backwards
-- compatibility requirement, so re-running it WILL delete all existing OKRs.
--
-- SECURITY MODEL (read before changing anything):
-- The GitHub Pages site is public, so the *database* is what protects the data.
-- Row-Level Security (RLS) below only allows access to signed-in users whose
-- email is on an explicit allowlist (see public.is_allowed() further down).
-- This is an allowlist of individual addresses — not a whole domain — so
-- personal accounts (e.g. a Gmail via Google sign-in) can be granted access
-- one at a time. Everyone on the list shares one set of OKRs.
-- NEVER disable RLS on these tables. See CLAUDE.md.
--
-- TIMELINE MODEL:
-- Both objectives and key results carry a month-level window: starts_on and
-- ends_on are DATEs pinned to the first of the month ('YYYY-MM-01'); ends_on is
-- the INCLUSIVE last month. A key result's window must fall fully inside its
-- parent objective's window — enforced here by a trigger (see below) and also
-- in the UI (KeyResultForm).
-- ===========================================================================

-- --- Tables ----------------------------------------------------------------
-- Recreate from scratch (drops existing data). key_results first because it
-- references objectives.
drop table if exists public.key_results cascade;
drop table if exists public.objectives  cascade;

create table public.objectives (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  owner       text not null default '',
  starts_on   date not null,
  ends_on     date not null,
  created_at  timestamptz not null default now(),
  constraint objectives_month_order check (ends_on >= starts_on)
);

create table public.key_results (
  id            uuid primary key default gen_random_uuid(),
  objective_id  uuid not null references public.objectives (id) on delete cascade,
  title         text not null,
  target_value  numeric not null default 0,
  current_value numeric not null default 0,
  unit          text not null default '',
  starts_on     date not null,
  ends_on       date not null,
  created_at    timestamptz not null default now(),
  constraint key_results_month_order check (ends_on >= starts_on)
);

create index if not exists key_results_objective_id_idx
  on public.key_results (objective_id);

-- --- Cross-table alignment -------------------------------------------------
-- A key result's [starts_on, ends_on] must fall fully inside its parent
-- objective's window. A plain CHECK can't reference another table, so this is
-- enforced with a BEFORE INSERT OR UPDATE trigger. Firing on UPDATE too means
-- moving a key result's window or its objective_id is re-validated.
create or replace function public.enforce_kr_within_objective()
returns trigger
language plpgsql
as $$
declare
  obj_start date;
  obj_end   date;
begin
  select starts_on, ends_on into obj_start, obj_end
  from public.objectives
  where id = new.objective_id;

  if obj_start is null then
    raise exception 'Parent objective % not found', new.objective_id;
  end if;

  if new.starts_on < obj_start or new.ends_on > obj_end then
    raise exception
      'Key result window (% to %) must fall within objective window (% to %)',
      new.starts_on, new.ends_on, obj_start, obj_end;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_kr_within_objective on public.key_results;
create trigger trg_kr_within_objective
  before insert or update on public.key_results
  for each row
  execute function public.enforce_kr_within_objective();

-- --- Row-Level Security ----------------------------------------------------
alter table public.objectives  enable row level security;
alter table public.key_results enable row level security;

-- Helper: is the signed-in user on the access allowlist?
-- (auth.jwt() ->> 'email') is the signed-in user's email; this is auth-method
-- agnostic, so it works for both Google sign-in and the email magic link. The
-- comparison is lower-cased on both sides so casing can never lock someone out.
--
-- TO ADD OR REMOVE SOMEONE: edit the list below (lower-case addresses only) and
-- re-run JUST this function in the Supabase SQL Editor. The policies reference
-- it, so nothing else needs to change.
create or replace function public.is_allowed()
returns boolean
language sql
stable
as $$
  select lower(auth.jwt() ->> 'email') in (
    'roel.blyweert1@persgroep.net',
    'blyweert.roel@gmail.com'
  );
$$;

-- Objectives: full access for allowlisted users only.
drop policy if exists "team access objectives" on public.objectives;
create policy "team access objectives"
  on public.objectives
  for all
  to authenticated
  using      (public.is_allowed())
  with check (public.is_allowed());

-- Key results: full access for allowlisted users only.
drop policy if exists "team access key_results" on public.key_results;
create policy "team access key_results"
  on public.key_results
  for all
  to authenticated
  using      (public.is_allowed())
  with check (public.is_allowed());
