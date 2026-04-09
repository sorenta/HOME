-- Per-user BYOK for AI (stored in Vault, one row per authenticated user).
-- Run in Supabase SQL Editor.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'household_kitchen_ai'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_kitchen_ai'
  ) then
    execute 'alter table public.household_kitchen_ai rename to household_kitchen_ai_legacy';
  end if;
end $$;

create table if not exists public.user_kitchen_ai (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('openai', 'gemini')),
  vault_secret_id uuid not null,
  key_last_four text,
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'household_kitchen_ai'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'household_kitchen_ai'
      and column_name = 'updated_by'
  ) then
    -- Backfill from the old table if it still exists (mixed migration states).
    insert into public.user_kitchen_ai (user_id, provider, vault_secret_id, key_last_four, updated_at)
    select
      hk.updated_by as user_id,
      hk.provider,
      hk.vault_secret_id,
      hk.key_last_four,
      coalesce(hk.updated_at, now()) as updated_at
    from public.household_kitchen_ai hk
    where hk.updated_by is not null
    on conflict (user_id) do update
    set
      provider = excluded.provider,
      vault_secret_id = excluded.vault_secret_id,
      key_last_four = excluded.key_last_four,
      updated_at = excluded.updated_at;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'household_kitchen_ai_legacy'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'household_kitchen_ai_legacy'
      and column_name = 'updated_by'
  ) then
    -- Best-effort backfill: if a legacy row has updated_by, keep that key for that user.
    insert into public.user_kitchen_ai (user_id, provider, vault_secret_id, key_last_four, updated_at)
    select
      hk.updated_by as user_id,
      hk.provider,
      hk.vault_secret_id,
      hk.key_last_four,
      coalesce(hk.updated_at, now()) as updated_at
    from public.household_kitchen_ai_legacy hk
    where hk.updated_by is not null
    on conflict (user_id) do update
    set
      provider = excluded.provider,
      vault_secret_id = excluded.vault_secret_id,
      key_last_four = excluded.key_last_four,
      updated_at = excluded.updated_at;
  end if;
end $$;

alter table public.user_kitchen_ai enable row level security;
alter table public.user_kitchen_ai force row level security;

drop policy if exists "user_kitchen_ai_select" on public.user_kitchen_ai;
drop policy if exists "user_kitchen_ai_insert" on public.user_kitchen_ai;
drop policy if exists "user_kitchen_ai_update" on public.user_kitchen_ai;
drop policy if exists "user_kitchen_ai_delete" on public.user_kitchen_ai;

create policy "user_kitchen_ai_select" on public.user_kitchen_ai
  for select to authenticated
  using (auth.uid() = user_id);

create policy "user_kitchen_ai_insert" on public.user_kitchen_ai
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_kitchen_ai_update" on public.user_kitchen_ai
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_kitchen_ai_delete" on public.user_kitchen_ai
  for delete to authenticated
  using (auth.uid() = user_id);
