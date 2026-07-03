-- Run this in your Supabase SQL Editor
-- Adds access_code and config columns to the sites table

alter table sites add column if not exists access_code text;
alter table sites add column if not exists config jsonb default '{}'::jsonb;

-- Example: add your own site with an access code
-- insert into sites (site_id, plan, active, access_code)
-- values ('gdrock.com', 'pro', true, 'GDR-YOUR-CODE');
