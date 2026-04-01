alter table public.profiles
  add column if not exists birthday_at date,
  add column if not exists name_day_at date;
