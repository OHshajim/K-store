-- Kstore: Add image_url to categories and logo_url/favicon_url to store_settings

alter table public.categories
  add column if not exists image_url text;

alter table public.store_settings
  add column if not exists logo_url text,
  add column if not exists favicon_url text;

