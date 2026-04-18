-- ====================================================================================
-- FINANCE SAVINGS GOALS
-- ====================================================================================

create table if not exists public.finance_savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  label text not null,
  current_amount numeric not null default 0,
  target_amount numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.finance_savings_goals enable row level security;

-- Select policy: Household members can view goals
drop policy if exists "savings_goals_member_select" on public.finance_savings_goals;
create policy "savings_goals_member_select" on public.finance_savings_goals
  for select using (public.is_household_member(household_id));

-- Insert policy: Household members can add goals
drop policy if exists "savings_goals_member_insert" on public.finance_savings_goals;
create policy "savings_goals_member_insert" on public.finance_savings_goals
  for insert to authenticated
  with check (public.is_household_member(household_id));

-- Update policy: Household members can update goals
drop policy if exists "savings_goals_member_update" on public.finance_savings_goals;
create policy "savings_goals_member_update" on public.finance_savings_goals
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- Delete policy: Household members can delete goals
drop policy if exists "savings_goals_member_delete" on public.finance_savings_goals;
create policy "savings_goals_member_delete" on public.finance_savings_goals
  for delete to authenticated
  using (public.is_household_member(household_id));
