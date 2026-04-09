-- Settings preferences sync policies.
-- Run after schema.sql.

create unique index if not exists ai_preferences_user_provider_idx
  on public.ai_preferences (user_id, provider);

drop policy if exists "notification_preferences_self_insert" on public.notification_preferences;
drop policy if exists "notification_preferences_self_update" on public.notification_preferences;
drop policy if exists "ai_preferences_self_insert" on public.ai_preferences;
drop policy if exists "ai_preferences_self_update" on public.ai_preferences;

create policy "notification_preferences_self_insert" on public.notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "notification_preferences_self_update" on public.notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "ai_preferences_self_insert" on public.ai_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "ai_preferences_self_update" on public.ai_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
