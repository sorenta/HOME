create policy "inventory_household_insert" on public.inventory_items
  for insert to authenticated
  with check (
    owner_scope = 'household'
    and module = 'kitchen'
    and public.is_household_member(household_id)
  );

create policy "shopping_member_insert" on public.shopping_items
  for insert to authenticated
  with check (
    public.is_household_member(household_id)
  );

create policy "shopping_member_update" on public.shopping_items
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "inventory_household_delete" on public.inventory_items
  for delete to authenticated
  using (
    owner_scope = 'household'
    and module = 'kitchen'
    and public.is_household_member(household_id)
  );
