-- DELETE for calendar events and household tasks (run after events_tasks_sync.sql).

drop policy if exists "calendar_events_delete" on public.calendar_events;
create policy "calendar_events_delete" on public.calendar_events
  for delete to authenticated
  using (
    (visibility = 'household' and household_id is not null and public.is_household_member(household_id))
    or (visibility = 'individual' and user_id = auth.uid())
  );

drop policy if exists "household_tasks_member_delete" on public.household_tasks;
create policy "household_tasks_member_delete" on public.household_tasks
  for delete to authenticated
  using (public.is_household_member(household_id));
