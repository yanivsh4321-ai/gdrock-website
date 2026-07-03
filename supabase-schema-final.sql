-- GDRock — Complete Supabase Schema (matches gdrock-worker.js exactly)
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- Safe to re-run: uses CREATE IF NOT EXISTS and idempotent ALTER statements.

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- SITES
-- The canonical registry of every paying/active site.
-- site_id = the bare domain, e.g. "acme.com"
-- ─────────────────────────────────────────
create table if not exists public.sites (
  id           uuid        primary key default gen_random_uuid(),
  site_id      text        not null unique,        -- domain key used by the worker
  plan         text        not null default 'free' check (plan in ('free','core','care','enterprise')),
  active       boolean     not null default false,
  access_code  text,                               -- GDR-XXXX-XXXX code sent to the customer
  config       jsonb       not null default '{}',  -- theme, accent, policy fields, etc.
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists sites_site_id_idx  on public.sites (site_id);
create index if not exists sites_active_idx   on public.sites (active);
create index if not exists sites_plan_idx     on public.sites (plan);

-- auto-bump updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists sites_updated_at on public.sites;
create trigger sites_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- CONSENT LOGS
-- Written by the banner every time a visitor makes a choice.
-- site_id here is the bare domain text (matches what the worker sends).
-- ─────────────────────────────────────────
create table if not exists public.consent_logs (
  id         bigserial   primary key,
  site_id    text        not null,
  accepted   boolean     not null default false,
  analytics  boolean     not null default false,
  marketing  boolean     not null default false,
  ip         text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists consent_logs_site_id_idx  on public.consent_logs (site_id);
create index if not exists consent_logs_created_idx  on public.consent_logs (created_at desc);

-- ─────────────────────────────────────────
-- LEADS
-- Captured from the scanner, hero form, and checkout.
-- ─────────────────────────────────────────
create table if not exists public.leads (
  id          bigserial   primary key,
  source      text        not null default 'unknown',
  name        text,
  email       text        not null,
  website_url text,
  service     text,
  notes       text,
  plan        text,
  created_at  timestamptz not null default now()
);
create index if not exists leads_email_idx      on public.leads (email);
create index if not exists leads_created_idx    on public.leads (created_at desc);
create index if not exists leads_source_idx     on public.leads (source);

-- ─────────────────────────────────────────
-- SCAN RESULTS
-- Stores every GDPR scan so you can track conversion funnel.
-- ─────────────────────────────────────────
create table if not exists public.scan_results (
  id         bigserial   primary key,
  email      text,                        -- null if visitor didn't provide email
  domain     text        not null,
  score      integer     not null,
  summary    text,
  issues     jsonb       not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists scan_results_email_idx   on public.scan_results (email);
create index if not exists scan_results_domain_idx  on public.scan_results (domain);
create index if not exists scan_results_created_idx on public.scan_results (created_at desc);

-- ─────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- The worker runs with the ANON key (server-side CF Worker = safe).
-- Banner JS also calls /api/consent with the anon key path through the worker.
-- ─────────────────────────────────────────
alter table public.sites         enable row level security;
alter table public.consent_logs  enable row level security;
alter table public.leads         enable row level security;
alter table public.scan_results  enable row level security;

-- SITES: anon can read active configs (banner-config endpoint needs this).
-- Worker also upserts/patches sites on Paddle webhooks — allowed via anon.
drop policy if exists "sites_select_active" on public.sites;
create policy "sites_select_active"
  on public.sites for select
  using (active = true);

drop policy if exists "sites_insert_anon" on public.sites;
create policy "sites_insert_anon"
  on public.sites for insert
  with check (true);

drop policy if exists "sites_update_anon" on public.sites;
create policy "sites_update_anon"
  on public.sites for update
  using (true) with check (true);

-- CONSENT LOGS: anyone can insert (banner fires from the visitor's browser via worker).
drop policy if exists "consent_logs_insert" on public.consent_logs;
create policy "consent_logs_insert"
  on public.consent_logs for insert
  with check (true);

-- LEADS: anyone can insert (lead forms and scanner POST via worker).
drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert"
  on public.leads for insert
  with check (true);

-- SCAN RESULTS: anyone can insert.
drop policy if exists "scan_results_insert" on public.scan_results;
create policy "scan_results_insert"
  on public.scan_results for insert
  with check (true);

-- ─────────────────────────────────────────
-- DASHBOARD VIEWS (read-only analytics)
-- Query these from your Supabase dashboard or a future admin panel.
-- ─────────────────────────────────────────

-- Daily consent opt-in rate per site (last 90 days)
create or replace view public.v_consent_daily as
select
  site_id,
  date_trunc('day', created_at) as day,
  count(*)                      as total,
  sum(case when accepted then 1 else 0 end) as accepted_count,
  round(100.0 * sum(case when accepted then 1 else 0 end) / nullif(count(*), 0), 1) as accept_rate_pct
from public.consent_logs
where created_at >= now() - interval '90 days'
group by 1, 2
order by 1, 2 desc;

-- Lead funnel by source (last 30 days)
create or replace view public.v_lead_funnel as
select
  source,
  count(*)                     as total_leads,
  count(distinct email)        as unique_emails,
  max(created_at)              as last_seen
from public.leads
where created_at >= now() - interval '30 days'
group by 1
order by 2 desc;

-- Active subscribers summary
create or replace view public.v_active_sites as
select
  plan,
  count(*) as count
from public.sites
where active = true
group by 1
order by 2 desc;

-- Scanner conversion: who scanned and then became a lead
create or replace view public.v_scan_conversions as
select
  sr.email,
  sr.domain,
  sr.score,
  sr.created_at as scanned_at,
  l.created_at  as converted_at,
  l.plan        as converted_plan
from public.scan_results sr
left join public.leads l on lower(l.email) = lower(sr.email)
where sr.email is not null
order by sr.created_at desc;
