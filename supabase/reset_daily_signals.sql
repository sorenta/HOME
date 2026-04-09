-- RESET: privātie dienas signāli (soļi, ekrāns, meditācija) — tikai lietotājam; partneris redz tikai kopējo auru caur check-in.
-- Pēc reset_completion_sync.sql. Palaid Supabase SQL Editor.

create table if not exists public.reset_daily_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  steps integer check (steps is null or steps >= 0),
  screen_time_minutes integer check (screen_time_minutes is null or screen_time_minutes >= 0),
  meditation_minutes integer check (meditation_minutes is null or meditation_minutes >= 0),
  sleep_bedtime text check (sleep_bedtime is null or sleep_bedtime ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  sleep_wake_time text check (sleep_wake_time is null or sleep_wake_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  mood smallint check (mood is null or (mood between 1 and 5)),
  energy smallint check (energy is null or (energy between 1 and 5)),
  notes_private text,
  source text not null default 'manual' check (source in ('manual', 'import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, logged_on)
);

create index if not exists reset_daily_signals_user_logged_idx
  on public.reset_daily_signals (user_id, logged_on desc);

alter table public.reset_daily_signals enable row level security;
alter table public.reset_daily_signals force row level security;

drop policy if exists "reset_daily_signals_self_select" on public.reset_daily_signals;
drop policy if exists "reset_daily_signals_self_insert" on public.reset_daily_signals;
drop policy if exists "reset_daily_signals_self_update" on public.reset_daily_signals;
drop policy if exists "reset_daily_signals_self_delete" on public.reset_daily_signals;

create policy "reset_daily_signals_self_select" on public.reset_daily_signals
  for select using (user_id = auth.uid());

create policy "reset_daily_signals_self_insert" on public.reset_daily_signals
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "reset_daily_signals_self_update" on public.reset_daily_signals
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reset_daily_signals_self_delete" on public.reset_daily_signals
  for delete to authenticated
  using (user_id = auth.uid());

alter table public.reset_daily_signals
  add column if not exists sleep_bedtime text check (sleep_bedtime is null or sleep_bedtime ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

alter table public.reset_daily_signals
  add column if not exists sleep_wake_time text check (sleep_wake_time is null or sleep_wake_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
