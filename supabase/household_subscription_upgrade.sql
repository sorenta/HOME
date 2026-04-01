alter table public.households
  add column if not exists subscription_status text not null default 'active',
  add column if not exists billing_provider text,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists current_period_ends_at timestamptz;

create or replace function public.get_my_household_summary()
returns table (
  id uuid,
  name text,
  qr_code text,
  subscription_type text,
  subscription_status text,
  billing_provider text,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
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
    h.subscription_status,
    h.billing_provider,
    h.trial_ends_at,
    h.current_period_ends_at,
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

grant execute on function public.get_my_household_summary() to authenticated;
