-- ===========================================================================
-- Migration 001 — harden the team-domain RLS check.
--
-- WHAT: replaces the loose `(auth.jwt() ->> 'email') like '%@persgroep.net'`
-- match with an exact, case-insensitive domain comparison. The old LIKE pattern
-- also accepted any address that merely ENDS in the literal string
-- "@persgroep.net" (e.g. "attacker@evil.com@persgroep.net") and was
-- case-sensitive. The new check compares only the domain part of the address.
--
-- WHY THIS FILE EXISTS: re-running the full `schema.sql` DROPs and recreates the
-- tables (deleting all OKRs). This migration only swaps the two RLS policies, so
-- it is SAFE to run on a populated database — no data loss.
--
-- HOW: Supabase -> SQL Editor -> New query -> paste this -> Run. Run once.
-- (A brand-new project created from `schema.sql` already has the hardened
-- policies and does NOT need this migration.)
-- ===========================================================================

drop policy if exists "team access objectives" on public.objectives;
create policy "team access objectives"
  on public.objectives
  for all
  to authenticated
  using      (lower(split_part(auth.jwt() ->> 'email', '@', 2)) = 'persgroep.net')
  with check (lower(split_part(auth.jwt() ->> 'email', '@', 2)) = 'persgroep.net');

drop policy if exists "team access key_results" on public.key_results;
create policy "team access key_results"
  on public.key_results
  for all
  to authenticated
  using      (lower(split_part(auth.jwt() ->> 'email', '@', 2)) = 'persgroep.net')
  with check (lower(split_part(auth.jwt() ->> 'email', '@', 2)) = 'persgroep.net');
