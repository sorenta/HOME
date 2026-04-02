-- Shared events + household tasks sync.
-- Run after schema.sql.

create table if not exists public.household_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  assignee_user_id uuid references auth.users (id) on delete set null,
  title text not null,
  due_on date not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.household_tasks enable row level security;

drop policy if exists "calendar_events_insert" on public.calendar_events;
drop policy if exists "calendar_events_update" on public.calendar_events;
drop policy if exists "household_tasks_member_select" on public.household_tasks;
drop policy if exists "household_tasks_member_insert" on public.household_tasks;
drop policy if exists "household_tasks_member_update" on public.household_tasks;

create policy "calendar_events_insert" on public.calendar_events
  for insert to authenticated
  with check (
    (visibility = 'household' and household_id is not null and public.is_household_member(household_id))
    or (visibility = 'individual' and user_id = auth.uid())
  );

create policy "calendar_events_update" on public.calendar_events
  for update to authenticated
  using (
    (visibility = 'household' and household_id is not null and public.is_household_member(household_id))
    or (visibility = 'individual' and user_id = auth.uid())
  )
  with check (
    (visibility = 'household' and household_id is not null and public.is_household_member(household_id))
    or (visibility = 'individual' and user_id = auth.uid())
  );

create policy "household_tasks_member_select" on public.household_tasks
  for select using (public.is_household_member(household_id));

create policy "household_tasks_member_insert" on public.household_tasks
  for insert to authenticated
  with check (public.is_household_member(household_id));

create policy "household_tasks_member_update" on public.household_tasks
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
