-- MAJAS / HomeOS starter schema
-- Goal: support private + shared household data with granular visibility.

create extension if not exists "pgcrypto";

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qr_code text unique,
  subscription_type text not null default 'free',
  subscription_status text not null default 'active',
  billing_provider text,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  locale text not null default 'lv',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.households
  add column if not exists subscription_status text not null default 'active',
  add column if not exists billing_provider text,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists current_period_ends_at timestamptz;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid references public.households (id) on delete set null,
  display_name text,
  role_label text,
  avatar_url text,
  preferred_locale text not null default 'lv',
  theme_id text not null default 'lucent',
  reset_score numeric not null default 0,
  reset_privacy_level text not null default 'mood_only',
  birthday_at date,
  name_day_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists birthday_at date,
  add column if not exists name_day_at date;

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  membership_role text not null default 'member',
  can_see_finance boolean not null default true,
  can_see_kitchen boolean not null default true,
  can_see_pharmacy boolean not null default true,
  can_see_calendar boolean not null default true,
  can_see_reset_mood boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  invite_code text not null unique,
  expires_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  module text not null check (module in ('kitchen', 'pharmacy')),
  name text not null,
  category text,
  quantity numeric not null default 1,
  unit text,
  expiry_date date,
  status text not null default 'in_stock',
  owner_scope text not null check (owner_scope in ('household', 'individual')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_scope_check check (
    (owner_scope = 'household' and household_id is not null)
    or (owner_scope = 'individual' and user_id is not null)
  )
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  quantity numeric not null default 1,
  unit text,
  status text not null default 'open' check (status in ('open', 'picked', 'archived')),
  suggested_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  label text not null,
  amount numeric not null default 0,
  due_day smallint check (due_day between 1 and 31),
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  fixed_cost_id uuid references public.fixed_costs (id) on delete set null,
  direction text not null check (direction in ('income', 'expense')),
  amount numeric not null,
  label text not null,
  happened_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.reset_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  household_id uuid references public.households (id) on delete set null,
  score numeric not null default 0,
  mood text not null default 'steady' check (mood in ('low', 'steady', 'high')),
  summary text,
  private_notes text,
  happened_at timestamptz not null default now(),
  logged_on_local date
);

create index if not exists reset_checkins_user_local_day_idx
  on public.reset_checkins (user_id, logged_on_local);

create table if not exists public.reset_metrics (
  id uuid primary key default gen_random_uuid(),
  reset_checkin_id uuid not null references public.reset_checkins (id) on delete cascade,
  metric_key text not null,
  metric_value numeric,
  metric_unit text,
  visibility text not null default 'private' check (visibility in ('private', 'mood_only'))
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  event_type text not null default 'general',
  starts_on date not null,
  ends_on date,
  visibility text not null default 'household' check (visibility in ('household', 'individual')),
  celebration_style text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  module text not null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  finance_enabled boolean not null default true,
  pharmacy_enabled boolean not null default true,
  event_enabled boolean not null default true,
  reset_empathy_enabled boolean not null default true,
  reset_empathy_recipient_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  privacy_policy_version text not null,
  accepted_at timestamptz not null default now()
);

create unique index if not exists legal_consents_user_version_idx
  on public.legal_consents (user_id, privacy_policy_version);

create table if not exists public.ai_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('gemini', 'openai')),
  label text,
  is_enabled boolean not null default false,
  key_last_four text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ai_preferences_user_provider_idx
  on public.ai_preferences (user_id, provider);

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
  );
$$;

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

drop function if exists public.get_my_household_summary();

create function public.get_my_household_summary()
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

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.inventory_items enable row level security;
alter table public.shopping_items enable row level security;
alter table public.fixed_costs enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.reset_checkins enable row level security;
alter table public.reset_metrics enable row level security;
alter table public.calendar_events enable row level security;
alter table public.activity_feed enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.legal_consents enable row level security;
alter table public.ai_preferences enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
drop policy if exists "profiles_household_select" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_household_select" on public.profiles
  for select using (
    household_id is not null and public.is_household_member(household_id)
  );
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "households_member_select" on public.households;
create policy "households_member_select" on public.households
  for select using (public.is_household_member(id));

drop policy if exists "household_members_member_select" on public.household_members;
create policy "household_members_member_select" on public.household_members
  for select using (public.is_household_member(household_id));

drop policy if exists "household_invites_member_select" on public.household_invites;
create policy "household_invites_member_select" on public.household_invites
  for select using (public.is_household_member(household_id));

drop policy if exists "inventory_shared_or_private_select" on public.inventory_items;
create policy "inventory_shared_or_private_select" on public.inventory_items
  for select using (
    (owner_scope = 'household' and public.is_household_member(household_id))
    or (owner_scope = 'individual' and user_id = auth.uid())
  );

drop policy if exists "inventory_household_insert" on public.inventory_items;
create policy "inventory_household_insert" on public.inventory_items
  for insert to authenticated
  with check (
    owner_scope = 'household'
    and module = 'kitchen'
    and public.is_household_member(household_id)
  );

drop policy if exists "shopping_member_select" on public.shopping_items;
create policy "shopping_member_select" on public.shopping_items
  for select using (public.is_household_member(household_id));

drop policy if exists "shopping_member_insert" on public.shopping_items;
create policy "shopping_member_insert" on public.shopping_items
  for insert to authenticated
  with check (public.is_household_member(household_id));

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

drop policy if exists "fixed_costs_member_select" on public.fixed_costs;
create policy "fixed_costs_member_select" on public.fixed_costs
  for select using (public.is_household_member(household_id));

drop policy if exists "finance_transactions_member_select" on public.finance_transactions;
create policy "finance_transactions_member_select" on public.finance_transactions
  for select using (public.is_household_member(household_id));

drop policy if exists "reset_self_select" on public.reset_checkins;
create policy "reset_self_select" on public.reset_checkins
  for select using (user_id = auth.uid());

drop policy if exists "reset_metrics_self_select" on public.reset_metrics;
create policy "reset_metrics_self_select" on public.reset_metrics
  for select using (
    exists (
      select 1
      from public.reset_checkins rc
      where rc.id = reset_metrics.reset_checkin_id
        and rc.user_id = auth.uid()
    )
  );

drop policy if exists "calendar_visible_events_select" on public.calendar_events;
create policy "calendar_visible_events_select" on public.calendar_events
  for select using (
    (visibility = 'household' and public.is_household_member(household_id))
    or (visibility = 'individual' and user_id = auth.uid())
  );

drop policy if exists "activity_feed_member_select" on public.activity_feed;
create policy "activity_feed_member_select" on public.activity_feed
  for select using (public.is_household_member(household_id));

drop policy if exists "notification_preferences_self_select" on public.notification_preferences;
drop policy if exists "notification_preferences_self_insert" on public.notification_preferences;
drop policy if exists "notification_preferences_self_update" on public.notification_preferences;
create policy "notification_preferences_self_select" on public.notification_preferences
  for select using (user_id = auth.uid());
create policy "notification_preferences_self_insert" on public.notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "notification_preferences_self_update" on public.notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "legal_consents_self_insert" on public.legal_consents;
drop policy if exists "legal_consents_self_select" on public.legal_consents;
create policy "legal_consents_self_insert" on public.legal_consents
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "legal_consents_self_select" on public.legal_consents
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_preferences_self_select" on public.ai_preferences;
drop policy if exists "ai_preferences_self_insert" on public.ai_preferences;
drop policy if exists "ai_preferences_self_update" on public.ai_preferences;
create policy "ai_preferences_self_select" on public.ai_preferences
  for select using (user_id = auth.uid());
create policy "ai_preferences_self_insert" on public.ai_preferences
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "ai_preferences_self_update" on public.ai_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
