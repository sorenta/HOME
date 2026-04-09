-- GDPR: pierādāma piekrišana privātuma politikai reģistrācijā (versija + laiks).
-- Palaid pēc galvenās shēmas.

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  privacy_policy_version text not null,
  accepted_at timestamptz not null default now()
);

create unique index if not exists legal_consents_user_version_idx
  on public.legal_consents (user_id, privacy_policy_version);

alter table public.legal_consents enable row level security;

drop policy if exists "legal_consents_self_insert" on public.legal_consents;
create policy "legal_consents_self_insert" on public.legal_consents
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "legal_consents_self_select" on public.legal_consents;
create policy "legal_consents_self_select" on public.legal_consents
  for select to authenticated
  using (auth.uid() = user_id);
