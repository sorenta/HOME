-- Supabase Vault wrapper functions for PostgREST
-- Run this in the Supabase SQL Editor to allow the API to manage user AI keys.

create or replace function public.create_vault_secret(
  secret text,
  name text,
  description text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret_id uuid;
  request_role text;
begin
  -- Only allow service_role to execute this wrapper to prevent anon users from inserting secrets
  request_role := coalesce((coalesce(current_setting('request.jwt.claims', true), '{}'))::jsonb->>'role', '');
  if request_role not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'Unauthorized';
  end if;

  select vault.create_secret(secret, name, description) into secret_id;
  return secret_id;
end;
$$;

create or replace function public.update_vault_secret(
  secret_id uuid,
  new_secret text,
  new_name text,
  new_description text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_role text;
begin
  request_role := coalesce((coalesce(current_setting('request.jwt.claims', true), '{}'))::jsonb->>'role', '');
  if request_role not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'Unauthorized';
  end if;

  perform vault.update_secret(secret_id, new_secret, new_name, new_description);
end;
$$;

create or replace function public.read_vault_secret(
  secret_id uuid
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret_value text;
  request_role text;
begin
  request_role := coalesce((coalesce(current_setting('request.jwt.claims', true), '{}'))::jsonb->>'role', '');
  if request_role not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'Unauthorized';
  end if;

  select decrypted_secret into secret_value
  from vault.decrypted_secrets
  where id = secret_id;

  return secret_value;
end;
$$;

grant execute on function public.create_vault_secret(text, text, text) to service_role;
grant execute on function public.update_vault_secret(uuid, text, text, text) to service_role;
grant execute on function public.read_vault_secret(uuid) to service_role;
