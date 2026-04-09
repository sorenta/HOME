create or replace function public.get_my_household_summary()
returns table (
  id uuid,
  name text,
  qr_code text,
  subscription_type text,
  member_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    h.id,
    h.name,
    h.qr_code,
    h.subscription_type,
    (
      select count(*)
      from public.household_members hm
      where hm.household_id = h.id
    ) as member_count
  from public.profiles p
  join public.households h on h.id = p.household_id
  where p.id = auth.uid()
  limit 1;
$$;
