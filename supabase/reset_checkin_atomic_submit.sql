-- Atomic RESET check-in: serialize per user+local day, enforce daily max, insert row,
-- recompute that day’s average score, update profiles.reset_score — single transaction.
-- Depends on: reset_completion_sync.sql, reset_multi_checkin_empathy.sql (logged_on_local column).
-- Run in Supabase SQL Editor (or migrate) before relying on submit_reset_checkin from the app.

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

  -- Serialize concurrent check-ins for the same user and local calendar day (tabs / devices).
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

  return jsonb_build_object(
    'ok', true,
    'reset_score', coalesce(v_avg, 0),
    'count_after', v_count + 1
  );
end;
$$;

revoke all on function public.submit_reset_checkin(uuid, numeric, text, date) from public;
grant execute on function public.submit_reset_checkin(uuid, numeric, text, date) to authenticated;
