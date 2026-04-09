-- Migration: rename every "aura" reference to "mood" across the RESET schema.
-- Run in Supabase SQL Editor (or via CLI migrate) BEFORE deploying the matching app code.
-- Safe to re-run: all operations are idempotent (IF EXISTS / OR REPLACE).

begin;

-- 1. reset_checkins: rename column aura → mood
alter table public.reset_checkins
  rename column aura to mood;

-- Re-create the check constraint with the new column name
alter table public.reset_checkins
  drop constraint if exists reset_checkins_aura_check;

alter table public.reset_checkins
  add constraint reset_checkins_mood_check
  check (mood in ('low', 'steady', 'high'));

-- 2. profiles: update default for reset_privacy_level ('aura_only' → 'mood_only')
alter table public.profiles
  alter column reset_privacy_level set default 'mood_only';

-- Migrate existing rows still on the old default
update public.profiles
  set reset_privacy_level = 'mood_only'
  where reset_privacy_level = 'aura_only';

-- 3. household_members: rename column can_see_reset_aura → can_see_reset_mood
alter table public.household_members
  rename column can_see_reset_aura to can_see_reset_mood;

-- 4. reset_metrics: update visibility check constraint ('aura_only' → 'mood_only')
alter table public.reset_metrics
  drop constraint if exists reset_metrics_visibility_check;

alter table public.reset_metrics
  add constraint reset_metrics_visibility_check
  check (visibility in ('private', 'mood_only'));

-- Migrate existing rows
update public.reset_metrics
  set visibility = 'mood_only'
  where visibility = 'aura_only';

-- 5. Recreate submit_reset_checkin with p_mood instead of p_aura
create or replace function public.submit_reset_checkin(
  p_household_id uuid,
  p_score numeric,
  p_mood text,
  p_logged_on_local date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
  v_avg numeric;
  v_max constant int := 3;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'AUTH');
  end if;

  if p_logged_on_local is null then
    return jsonb_build_object('ok', false, 'code', 'BAD_DAY');
  end if;

  if p_mood is null or p_mood not in ('low', 'steady', 'high') then
    return jsonb_build_object('ok', false, 'code', 'BAD_MOOD');
  end if;

  perform pg_advisory_xact_lock(
    hashtext('reset_checkin:' || v_uid::text),
    hashtext(p_logged_on_local::text)
  );

  select count(*)::int into v_count
  from public.reset_checkins
  where user_id = v_uid
    and logged_on_local = p_logged_on_local;

  if v_count >= v_max then
    return jsonb_build_object('ok', false, 'code', 'LIMIT');
  end if;

  insert into public.reset_checkins (user_id, household_id, score, mood, happened_at, logged_on_local)
  values (v_uid, p_household_id, p_score, p_mood, now(), p_logged_on_local);

  select round(avg(score))::numeric into v_avg
  from public.reset_checkins
  where user_id = v_uid
    and logged_on_local = p_logged_on_local;

  update public.profiles
  set reset_score = coalesce(v_avg, 0),
      updated_at = now()
  where id = v_uid;

  return jsonb_build_object('ok', true, 'count', v_count + 1, 'avg', v_avg);
end;
$$;

commit;
