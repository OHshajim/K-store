-- Kstore: Add privacy_html and faq_html to store_settings for CMS editing
alter table public.store_settings
  add column if not exists privacy_html text,
  add column if not exists faq_html text;
