drop policy if exists "shopping_member_update" on public.shopping_items;
create policy "shopping_member_update" on public.shopping_items
  for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "inventory_household_delete" on public.inventory_items;
create policy "inventory_household_delete" on public.inventory_items
  for delete to authenticated
  using (
    owner_scope = 'household'
    and module = 'kitchen'
    and public.is_household_member(household_id)
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inventory_items'
  ) then
    alter publication supabase_realtime add table public.inventory_items;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shopping_items'
  ) then
    alter publication supabase_realtime add table public.shopping_items;
  end if;
end $$;
