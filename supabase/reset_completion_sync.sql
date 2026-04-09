-- RESET: check-in ieraksti + onboarding karogs. Palaist Supabase SQL Editor.

alter table public.reset_training_state
  add column if not exists wellness_onboarding_done boolean not null default false;

alter table public.reset_training_state
  add column if not exists wellness_onboarding_profile jsonb not null default '{}'::jsonb;

drop policy if exists "reset_checkins_self_insert" on public.reset_checkins;
create policy "reset_checkins_self_insert" on public.reset_checkins
  for insert to authenticated
  with check (user_id = auth.uid());
