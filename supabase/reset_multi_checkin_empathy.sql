-- RESET: līdz 3 check-in vienā kalendāra dienā (pēc lokālā datuma no klienta) + empātijas saņēmēju UUID masīvs.
-- Palaid pēc reset_completion_sync.sql.

alter table public.reset_checkins
  add column if not exists logged_on_local date;

update public.reset_checkins
set logged_on_local = coalesce(
  logged_on_local,
  (happened_at at time zone 'UTC')::date
)
where logged_on_local is null;

create index if not exists reset_checkins_user_local_day_idx
  on public.reset_checkins (user_id, logged_on_local);

alter table public.notification_preferences
  add column if not exists reset_empathy_recipient_ids uuid[] not null default '{}';
