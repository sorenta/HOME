-- Google Fit OAuth token storage
-- Run this migration to enable full Google Fit integration

create table if not exists public.user_google_fit_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  token_type text not null default 'Bearer',
  expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- RLS
alter table public.user_google_fit_tokens enable row level security;
alter table public.user_google_fit_tokens force row level security;

drop policy if exists "Users can read own Google Fit tokens" on public.user_google_fit_tokens;
drop policy if exists "Users can insert own Google Fit tokens" on public.user_google_fit_tokens;
drop policy if exists "Users can update own Google Fit tokens" on public.user_google_fit_tokens;
drop policy if exists "Users can delete own Google Fit tokens" on public.user_google_fit_tokens;

create policy "Users can read own Google Fit tokens"
  on public.user_google_fit_tokens
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own Google Fit tokens"
  on public.user_google_fit_tokens
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own Google Fit tokens"
  on public.user_google_fit_tokens
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own Google Fit tokens"
  on public.user_google_fit_tokens
  for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_google_fit_tokens_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger google_fit_tokens_updated_at
  before update on public.user_google_fit_tokens
  for each row execute function public.handle_google_fit_tokens_updated_at();
