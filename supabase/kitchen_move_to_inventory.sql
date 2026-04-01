create or replace function public.move_shopping_item_to_inventory(
  p_item_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.shopping_items%rowtype;
  v_inventory_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_item
  from public.shopping_items
  where id = p_item_id
    and public.is_household_member(household_id)
  limit 1;

  if v_item.id is null then
    raise exception 'Shopping item not found';
  end if;

  if v_item.status = 'archived' then
    return v_item.id;
  end if;

  select id
  into v_inventory_id
  from public.inventory_items
  where household_id = v_item.household_id
    and module = 'kitchen'
    and owner_scope = 'household'
    and lower(name) = lower(v_item.title)
    and coalesce(unit, '') = coalesce(v_item.unit, '')
  order by created_at desc
  limit 1;

  if v_inventory_id is null then
    insert into public.inventory_items (
      household_id,
      module,
      name,
      quantity,
      unit,
      status,
      owner_scope
    )
    values (
      v_item.household_id,
      'kitchen',
      v_item.title,
      coalesce(v_item.quantity, 1),
      v_item.unit,
      'in_stock',
      'household'
    );
  else
    update public.inventory_items
    set quantity = coalesce(quantity, 0) + coalesce(v_item.quantity, 1),
        status = 'in_stock',
        updated_at = now()
    where id = v_inventory_id;
  end if;

  update public.shopping_items
  set status = 'archived',
      updated_at = now()
  where id = v_item.id;

  return v_item.id;
end;
$$;

grant execute on function public.move_shopping_item_to_inventory(uuid) to authenticated;
