-- GDRock — fix Supabase Security Advisor error "Security Definer View"
-- on public.consent_logs_public  (run once in the Supabase SQL editor).
--
-- Background: consent_logs_public was created SECURITY DEFINER (the Postgres
-- default) so it could read consent_logs — which has RLS + no SELECT policy —
-- while exposing ONLY non-PII columns (ip / user_agent are never selected).
-- The linter flags every SECURITY DEFINER view because such views bypass the
-- *caller's* RLS. This migration switches the view to SECURITY INVOKER (clears
-- the error) and replaces the "owner can read everything" trick with proper
-- COLUMN-LEVEL privileges, so ip/user_agent stay unreadable by anon — even if
-- the base table is queried directly.

-- 1. View now runs with the caller's privileges/RLS (this clears the linter).
alter view public.consent_logs_public set (security_invoker = on);

-- 2. Let anon/authenticated read ONLY the 5 non-PII columns of the base table.
--    Column-level grants are the safety boundary: ip and user_agent are NOT
--    granted, so `select ip from consent_logs` is denied for these roles.
grant select (site_id, accepted, analytics, marketing, created_at)
  on public.consent_logs to anon, authenticated;

-- 3. RLS must permit the SELECT for the view to return rows. No PII is reachable
--    regardless, thanks to the column grant above. (The existing INSERT policy
--    that the Worker uses to write consent events is untouched.)
drop policy if exists consent_logs_public_select on public.consent_logs;
create policy consent_logs_public_select on public.consent_logs
  for select to anon, authenticated
  using (true);

-- 4. Keep the view itself granted (no-op if already granted).
grant select on public.consent_logs_public to anon, authenticated;

-- 5. Nudge PostgREST to reload so the API reflects the change immediately.
notify pgrst, 'reload schema';

-- Verify afterwards:
--   • Security Advisor -> "Rerun linter": the consent_logs_public error is gone.
--   • As anon, `select * from consent_logs_public` returns the 5 safe columns.
--   • As anon, `select ip from consent_logs` is DENIED (column privilege) -> PII safe.
