-- Run this in Supabase SQL Editor
-- Creates the leads table to store all customer enquiries

create table if not exists leads (
  id          bigserial primary key,
  source      text not null,
  name        text,
  email       text not null,
  website_url text,
  service     text,
  notes       text,
  plan        text,
  created_at  timestamptz not null default now()
);

create index if not exists leads_email_idx       on leads (email);
create index if not exists leads_created_at_idx  on leads (created_at desc);
create index if not exists leads_source_idx      on leads (source);
