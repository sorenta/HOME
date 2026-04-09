create or replace function public.get_my_household_members()
returns table (
  id uuid,
  display_name text,
  role_label text,
  is_me boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.role_label,
    p.id = auth.uid() as is_me
  from public.profiles p
  where p.household_id = (
    select household_id
    from public.profiles
    where id = auth.uid()
  )
  order by
    (p.id = auth.uid()) desc,
    coalesce(p.display_name, '') asc;
$$;
