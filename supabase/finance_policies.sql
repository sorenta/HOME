-- Finance write access for household members.
-- Run after schema.sql.

drop policy if exists "fixed_costs_member_insert" on public.fixed_costs;
drop policy if exists "fixed_costs_member_update" on public.fixed_costs;
drop policy if exists "finance_transactions_member_insert" on public.finance_transactions;

create policy "fixed_costs_member_insert" on public.fixed_costs
  for insert to authenticated
  with check (public.is_household_member(household_id));

create policy "fixed_costs_member_update" on public.fixed_costs
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "finance_transactions_member_insert" on public.finance_transactions
  for insert to authenticated
  with check (public.is_household_member(household_id));
