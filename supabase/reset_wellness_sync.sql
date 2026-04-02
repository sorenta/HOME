-- RESET wellness + household water sync
-- Run this in Supabase SQL editor after schema.sql.

create table if not exists public.reset_wellness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_kind text not null check (goal_kind in ('quit', 'body')),
  quit_subkind text check (quit_subkind in ('sugar', 'coffee', 'smoking', 'custom')),
  custom_label text,
  started_at timestamptz,
  body_mode text check (body_mode in ('weight_loss', 'bulk', 'lean')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reset_body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area text not null check (area in ('waist', 'hips', 'chest', 'arm', 'thigh')),
  value_cm numeric not null,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.reset_weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kg numeric not null,
  weighed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.reset_training_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  training_week_index smallint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.household_water_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null default current_date,
  ml numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, user_id, logged_on)
);

create table if not exists public.household_water_medals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  gold_count integer not null default 0,
  silver_count integer not null default 0,
  bronze_count integer not null default 0,
  last_settled_on date,
  updated_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create or replace function public.add_household_water(
  p_household_id uuid,
  p_delta_ml numeric,
  p_logged_on date default current_date
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total numeric;
  v_previous numeric := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_household_member(p_household_id) then
    raise exception 'Not a household member';
  end if;

  select ml
  into v_previous
  from public.household_water_logs
  where household_id = p_household_id
    and user_id = v_user_id
    and logged_on = p_logged_on;

  insert into public.household_water_logs (
    household_id,
    user_id,
    logged_on,
    ml,
    updated_at
  )
  values (
    p_household_id,
    v_user_id,
    p_logged_on,
    greatest(0, p_delta_ml),
    now()
  )
  on conflict (household_id, user_id, logged_on) do update
    set ml = greatest(0, public.household_water_logs.ml + p_delta_ml),
        updated_at = now()
  returning ml into v_total;

  if coalesce(v_previous, 0) < 2000 and coalesce(v_total, 0) >= 2000 then
    insert into public.activity_feed (household_id, actor_id, module, action, target)
    values (
      p_household_id,
      v_user_id,
      'reset',
      'sasniedza dienas ūdens mērķi',
      concat(v_total::text, ' ml')
    );
  end if;

  return v_total;
end;
$$;

create or replace function public.settle_household_water_medals(
  p_household_id uuid,
  p_target_date date default current_date - 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_household_member(p_household_id) then
    raise exception 'Not a household member';
  end if;

  insert into public.household_water_medals (household_id, user_id)
  select hm.household_id, hm.user_id
  from public.household_members hm
  where hm.household_id = p_household_id
  on conflict (household_id, user_id) do nothing;

  if exists (
    select 1
    from public.household_water_medals
    where household_id = p_household_id
      and last_settled_on = p_target_date
  ) then
    return;
  end if;

  update public.household_water_medals
  set last_settled_on = p_target_date,
      updated_at = now()
  where household_id = p_household_id
    and coalesce(last_settled_on, date '1900-01-01') < p_target_date;

  with ranked as (
    select
      user_id,
      ml,
      dense_rank() over (order by ml desc) as rank_pos
    from public.household_water_logs
    where household_id = p_household_id
      and logged_on = p_target_date
      and ml > 0
  )
  update public.household_water_medals m
  set gold_count = m.gold_count + case when r.rank_pos = 1 then 1 else 0 end,
      silver_count = m.silver_count + case when r.rank_pos = 2 then 1 else 0 end,
      bronze_count = m.bronze_count + case when r.rank_pos = 3 then 1 else 0 end,
      updated_at = now()
  from ranked r
  where m.household_id = p_household_id
    and m.user_id = r.user_id;
end;
$$;

alter table public.reset_wellness_goals enable row level security;
alter table public.reset_body_measurements enable row level security;
alter table public.reset_weigh_ins enable row level security;
alter table public.reset_training_state enable row level security;
alter table public.household_water_logs enable row level security;
alter table public.household_water_medals enable row level security;

drop policy if exists "reset_wellness_goals_self_select" on public.reset_wellness_goals;
drop policy if exists "reset_wellness_goals_self_write" on public.reset_wellness_goals;
drop policy if exists "reset_body_measurements_self_select" on public.reset_body_measurements;
drop policy if exists "reset_body_measurements_self_write" on public.reset_body_measurements;
drop policy if exists "reset_weigh_ins_self_select" on public.reset_weigh_ins;
drop policy if exists "reset_weigh_ins_self_write" on public.reset_weigh_ins;
drop policy if exists "reset_training_state_self_select" on public.reset_training_state;
drop policy if exists "reset_training_state_self_write" on public.reset_training_state;
drop policy if exists "household_water_logs_member_select" on public.household_water_logs;
drop policy if exists "household_water_logs_self_insert" on public.household_water_logs;
drop policy if exists "household_water_logs_self_update" on public.household_water_logs;
drop policy if exists "household_water_medals_member_select" on public.household_water_medals;

create policy "reset_wellness_goals_self_select" on public.reset_wellness_goals
  for select using (user_id = auth.uid());
create policy "reset_wellness_goals_self_write" on public.reset_wellness_goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reset_body_measurements_self_select" on public.reset_body_measurements
  for select using (user_id = auth.uid());
create policy "reset_body_measurements_self_write" on public.reset_body_measurements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reset_weigh_ins_self_select" on public.reset_weigh_ins
  for select using (user_id = auth.uid());
create policy "reset_weigh_ins_self_write" on public.reset_weigh_ins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reset_training_state_self_select" on public.reset_training_state
  for select using (user_id = auth.uid());
create policy "reset_training_state_self_write" on public.reset_training_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "household_water_logs_member_select" on public.household_water_logs
  for select using (public.is_household_member(household_id));
create policy "household_water_logs_self_insert" on public.household_water_logs
  for insert to authenticated
  with check (public.is_household_member(household_id) and user_id = auth.uid());
create policy "household_water_logs_self_update" on public.household_water_logs
  for update to authenticated
  using (public.is_household_member(household_id) and user_id = auth.uid())
  with check (public.is_household_member(household_id) and user_id = auth.uid());

create policy "household_water_medals_member_select" on public.household_water_medals
  for select using (public.is_household_member(household_id));

grant execute on function public.add_household_water(uuid, numeric, date) to authenticated;
grant execute on function public.settle_household_water_medals(uuid, date) to authenticated;
