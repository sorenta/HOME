create or replace function public.create_household_for_current_user(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
  v_code text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.households (name, qr_code, created_by)
  values (trim(p_name), v_code, v_user_id)
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, membership_role)
  values (v_household_id, v_user_id, 'owner')
  on conflict (household_id, user_id) do update
    set membership_role = excluded.membership_role;

  update public.profiles
  set household_id = v_household_id
  where id = v_user_id;

  return v_household_id;
end;
$$;

create or replace function public.join_household_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id
  into v_household_id
  from public.households
  where upper(qr_code) = upper(trim(p_code))
  limit 1;

  if v_household_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.household_members (household_id, user_id, membership_role)
  values (v_household_id, v_user_id, 'member')
  on conflict (household_id, user_id) do nothing;

  update public.profiles
  set household_id = v_household_id
  where id = v_user_id;

  return v_household_id;
end;
$$;

drop policy if exists "profiles_household_select" on public.profiles;
create policy "profiles_household_select" on public.profiles
  for select using (
    household_id is not null and public.is_household_member(household_id)
  );
