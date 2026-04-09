grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.create_household_for_current_user(text) to authenticated;
grant execute on function public.join_household_by_code(text) to authenticated;
grant execute on function public.get_my_household_summary() to authenticated;
grant execute on function public.get_my_household_members() to authenticated;
