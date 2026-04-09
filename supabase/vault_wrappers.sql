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
begin
  -- Only allow service_role to execute this wrapper to prevent anon users from inserting secrets
  if current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' then
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
begin
  if current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' then
    raise exception 'Unauthorized';
  end if;

  perform vault.update_secret(secret_id, new_secret, new_name, new_description);
end;
$$;
