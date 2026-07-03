-- GDRock outreach pipeline — run once in the Supabase SQL editor.
-- Separate from `leads` (which holds inbound enquiries). This tracks the
-- cold-outreach funnel: EMAILED -> REPLIED -> AUDIT_SENT.

create table if not exists outreach (
  id                bigserial primary key,
  domain            text unique not null,
  company           text,
  email             text not null,
  subject_line_used text,
  trackers_found    text,
  tracker_count     int,
  country           text,
  gap_score         int,
  stage             text not null default 'EMAILED',  -- EMAILED | REPLIED | AUDIT_SENT
  reply_text        text,
  sent_at           timestamptz,
  replied_at        timestamptz,
  audit_sent_at     timestamptz,
  updated_at        timestamptz not null default now()
);

create index if not exists outreach_stage_idx   on outreach (stage);
create index if not exists outreach_sent_at_idx  on outreach (sent_at desc);
create index if not exists outreach_email_idx    on outreach (email);

-- keep updated_at fresh on every change
create or replace function outreach_touch() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists outreach_touch_trg on outreach;
create trigger outreach_touch_trg before update on outreach
  for each row execute function outreach_touch();
