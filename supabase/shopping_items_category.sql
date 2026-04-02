-- Optional category on shopping list items (kitchen). Run after schema.sql.

alter table public.shopping_items
  add column if not exists category text;
