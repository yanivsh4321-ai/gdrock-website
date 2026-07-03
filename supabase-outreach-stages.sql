-- GDRock outreach — extend the funnel for cal.com booked calls + win/loss.
-- Run once in the Supabase SQL editor, AFTER supabase-outreach-table.sql.
-- Idempotent: safe to re-run.
--
-- The `stage` column is free text (no CHECK), so these new stage values work
-- immediately; this migration just adds the timestamp columns the later stages
-- write to. Full funnel:
--   NEW -> EMAILED -> FOLLOWUP_1/2 -> REPLIED -> AUDIT_SENT -> CALL_BOOKED -> WON | LOST

alter table outreach add column if not exists followup_1_at timestamptz;
alter table outreach add column if not exists followup_2_at timestamptz;
alter table outreach add column if not exists cal_booked_at timestamptz;
alter table outreach add column if not exists won_at        timestamptz;
alter table outreach add column if not exists lost_at       timestamptz;

comment on column outreach.stage is
  'NEW | EMAILED | FOLLOWUP_1 | FOLLOWUP_2 | REPLIED | AUDIT_SENT | CALL_BOOKED | WON | LOST';
