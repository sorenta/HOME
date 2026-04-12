-- [SEC-01] RLS Piekļuves Kontroles Labošana
-- Šis skripts ievieš granulāru piekļuves kontroli mājsaimniecības moduļiem.

-- 1. Paplašināta pārbaudes funkcija
create or replace function public.can_view_household_module(p_household_id uuid, p_module text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = auth.uid()
      and (
        (p_module = 'finance' and hm.can_see_finance = true) or
        (p_module = 'kitchen' and hm.can_see_kitchen = true) or
        (p_module = 'pharmacy' and hm.can_see_pharmacy = true) or
        (p_module = 'calendar' and hm.can_see_calendar = true) or
        (p_module = 'reset' and hm.can_see_reset_mood = true) or
        (p_module is null) -- Ja modulis nav norādīts, pietiek ar dalību (pamata datiem)
      )
  );
$$;

-- 2. Atjauninam polises FINANSĒM
drop policy if exists "fixed_costs_member_select" on public.fixed_costs;
create policy "fixed_costs_member_select" on public.fixed_costs
  for select using (public.can_view_household_module(household_id, 'finance'));

drop policy if exists "fixed_costs_member_insert" on public.fixed_costs;
create policy "fixed_costs_member_insert" on public.fixed_costs
  for insert to authenticated with check (public.can_view_household_module(household_id, 'finance'));

drop policy if exists "fixed_costs_member_update" on public.fixed_costs;
create policy "fixed_costs_member_update" on public.fixed_costs
  for update to authenticated using (public.can_view_household_module(household_id, 'finance'));

drop policy if exists "finance_transactions_member_select" on public.finance_transactions;
create policy "finance_transactions_member_select" on public.finance_transactions
  for select using (public.can_view_household_module(household_id, 'finance'));

drop policy if exists "finance_transactions_member_insert" on public.finance_transactions;
create policy "finance_transactions_member_insert" on public.finance_transactions
  for insert to authenticated with check (public.can_view_household_module(household_id, 'finance'));


-- 3. Atjauninam polises VIRTUVEI
drop policy if exists "inventory_kitchen_select" on public.inventory_items;
create policy "inventory_kitchen_select" on public.inventory_items
  for select using (
    (owner_scope = 'household' and module = 'kitchen' and public.can_view_household_module(household_id, 'kitchen'))
    or (owner_scope = 'individual' and user_id = auth.uid())
  );

drop policy if exists "inventory_household_insert" on public.inventory_items;
create policy "inventory_household_insert" on public.inventory_items
  for insert to authenticated with check (
    owner_scope = 'household' and module = 'kitchen' and public.can_view_household_module(household_id, 'kitchen')
  );

drop policy if exists "shopping_member_select" on public.shopping_items;
create policy "shopping_member_select" on public.shopping_items
  for select using (public.can_view_household_module(household_id, 'kitchen'));

drop policy if exists "shopping_member_insert" on public.shopping_items;
create policy "shopping_member_insert" on public.shopping_items
  for insert to authenticated with check (public.can_view_household_module(household_id, 'kitchen'));


-- 4. Atjauninam polises APTIECIŅAI (Pharmacy)
drop policy if exists "inventory_pharmacy_select" on public.inventory_items;
create policy "inventory_pharmacy_select" on public.inventory_items
  for select using (
    (owner_scope = 'household' and module = 'pharmacy' and public.can_view_household_module(household_id, 'pharmacy'))
    or (owner_scope = 'individual' and user_id = auth.uid())
  );

drop policy if exists "inventory_pharmacy_insert" on public.inventory_items;
create policy "inventory_pharmacy_insert" on public.inventory_items
  for insert to authenticated with check (
    owner_scope = 'household' and module = 'pharmacy' and public.can_view_household_module(household_id, 'pharmacy')
  );


-- 5. Atjauninam polises KALENDĀRAM
drop policy if exists "calendar_visible_events_select" on public.calendar_events;
create policy "calendar_visible_events_select" on public.calendar_events
  for select using (
    (visibility = 'household' and public.can_view_household_module(household_id, 'calendar'))
    or (visibility = 'individual' and user_id = auth.uid())
  );
