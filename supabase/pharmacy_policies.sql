-- Pharmacy household inventory write access.
-- Run after schema.sql.

drop policy if exists "inventory_pharmacy_insert" on public.inventory_items;
drop policy if exists "inventory_pharmacy_update" on public.inventory_items;
drop policy if exists "inventory_pharmacy_delete" on public.inventory_items;

create policy "inventory_pharmacy_insert" on public.inventory_items
  for insert to authenticated
  with check (
    owner_scope = 'household'
    and module = 'pharmacy'
    and public.is_household_member(household_id)
  );

create policy "inventory_pharmacy_update" on public.inventory_items
  for update to authenticated
  using (
    owner_scope = 'household'
    and module = 'pharmacy'
    and public.is_household_member(household_id)
  )
  with check (
    owner_scope = 'household'
    and module = 'pharmacy'
    and public.is_household_member(household_id)
  );

create policy "inventory_pharmacy_delete" on public.inventory_items
  for delete to authenticated
  using (
    owner_scope = 'household'
    and module = 'pharmacy'
    and public.is_household_member(household_id)
  );
