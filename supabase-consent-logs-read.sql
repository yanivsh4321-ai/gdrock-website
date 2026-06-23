-- GDRock — public, PII-free read path for consent events
-- ──────────────────────────────────────────────────────────────────
-- The consent_logs table has RLS enabled with an INSERT policy but NO SELECT
-- policy, so the Worker's anon key cannot read it directly. That is by design:
-- the table stores `ip` and `user_agent`, which are personal data under the
-- GDPR and must never be exposed through a public, site_id-keyed endpoint.
--
-- This view exposes ONLY non-PII columns. Postgres views run with the view
-- owner's privileges (security-definer semantics, the default), so the view can
-- read the base table without a broad SELECT policy that would also leak IPs.
--
-- The Compliance Console (app.html → GET https://cdn.gdrock.com/api/consent-logs)
-- reads this view through the Worker.
--
-- Run once in the Supabase SQL editor (which executes as the postgres owner).

create or replace view public.consent_logs_public as
  select site_id, accepted, analytics, marketing, created_at
  from public.consent_logs;

-- Expose the view to the anon role the Worker authenticates with. Only the five
-- columns above are reachable — ip and user_agent are never selectable here.
grant select on public.consent_logs_public to anon, authenticated;

-- If the endpoint 404s right after running this, nudge PostgREST to reload:
--   notify pgrst, 'reload schema';
