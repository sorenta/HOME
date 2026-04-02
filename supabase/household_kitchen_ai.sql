-- One BYOK per household for Kitchen AI (any member can update). Run in Supabase SQL Editor.

create table if not exists public.household_kitchen_ai (
  household_id uuid primary key references public.households (id) on delete cascade,
  provider text not null check (provider in ('openai', 'gemini')),
  api_key text not null,
  key_last_four text,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.household_kitchen_ai enable row level security;

drop policy if exists "household_kitchen_ai_select" on public.household_kitchen_ai;
drop policy if exists "household_kitchen_ai_insert" on public.household_kitchen_ai;
drop policy if exists "household_kitchen_ai_update" on public.household_kitchen_ai;
drop policy if exists "household_kitchen_ai_delete" on public.household_kitchen_ai;

create policy "household_kitchen_ai_select" on public.household_kitchen_ai
  for select using (public.is_household_member(household_id));

create policy "household_kitchen_ai_insert" on public.household_kitchen_ai
  for insert to authenticated
  with check (public.is_household_member(household_id));

create policy "household_kitchen_ai_update" on public.household_kitchen_ai
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "household_kitchen_ai_delete" on public.household_kitchen_ai
  for delete to authenticated
  using (public.is_household_member(household_id));
