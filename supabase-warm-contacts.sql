-- GDRock warm contacts: people you already know. Run once in the Supabase SQL editor.
-- Idempotent: safe to re-run.
--
-- Store owners, agency people, Shopify/WordPress freelancers, SaaS founders and
-- businesses you buy from. Kept OUT of `outreach` on purpose: the cold-email agent
-- works from that table, and nobody on this list should ever get an automated email.
-- Nothing reads or writes this table automatically; you update it by hand.
--
-- Funnel: LISTED -> ASKED -> REPLIED -> CALL_BOOKED -> CALL_HELD -> PILOT -> WON | PASS
-- Someone they introduce gets their own row with referred_by pointing back.

create table if not exists warm_contacts (
  id            bigserial primary key,
  name          text not null,
  relationship  text,                              -- how you know them, one line
  segment       text,                              -- store | agency | saas | freelancer | vendor
  company       text,
  domain        text,                              -- their site, or a client site to scan live on the call
  email         text,
  phone         text,
  linkedin_url  text,
  channel       text,                              -- whatsapp | linkedin | email | phone | in_person
  stage         text not null default 'LISTED',
  asked_at      timestamptz,
  replied_at    timestamptz,
  call_at       timestamptz,
  hidden_cost   text,                              -- answer to "what would make it not worth it, even free?"
  intros        text,                              -- who they offered to introduce
  referred_by   bigint references warm_contacts(id),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists warm_contacts_stage_idx on warm_contacts (stage);

-- Personal data of people you know: RLS on with no policies, so the public anon key
-- reads nothing. The dashboard and the service-role key still see everything.
alter table warm_contacts enable row level security;

-- keep updated_at fresh on every change
create or replace function warm_contacts_touch() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists warm_contacts_touch_trg on warm_contacts;
create trigger warm_contacts_touch_trg before update on warm_contacts
  for each row execute function warm_contacts_touch();
