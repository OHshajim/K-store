import fs from "fs";
import {
  MOCK_STORE_SETTINGS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_BANNERS,
  MOCK_REVIEWS,
  MOCK_COUPONS,
} from "../lib/data/mockData.ts";

const catMap = {
  "cat-living": "c0000000-0000-4000-8000-000000000001",
  "cat-workspace": "c0000000-0000-4000-8000-000000000002",
  "cat-kitchen": "c0000000-0000-4000-8000-000000000003",
  "cat-bedroom": "c0000000-0000-4000-8000-000000000004",
  "cat-bathroom": "c0000000-0000-4000-8000-000000000005",
  "cat-lighting": "c0000000-0000-4000-8000-000000000006",
};

function esc(str) {
  if (str === null || str === undefined) return "null";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escArr(arr) {
  if (!arr || !arr.length) return "'{}'::text[]";
  return "array[" + arr.map((s) => esc(s)).join(", ") + "]::text[]";
}

function escJson(obj) {
  if (!obj) return "'{}'::jsonb";
  return esc(JSON.stringify(obj)) + "::jsonb";
}

let sql = `-- ==========================================================================
-- KSTORE COMPLETE PRODUCTION SCHEMA & FULL SEED MIGRATION
-- Copy and run this entire file in your Supabase Dashboard -> SQL Editor
-- ==========================================================================

create extension if not exists "pgcrypto";

-- 1. Store Settings Table
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Kstore',
  tagline text not null default 'Modern Living, Simplified.',
  support_email text default 'concierge@kstore.com',
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  shipping_flat_cents int not null default 1500,
  free_shipping_over_cents int default 15000,
  delivery_notes text not null default 'Complimentary white-glove packaging. Dispatched from Vermont & Copenhagen fulfillment centers.',
  about_html text,
  terms_html text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

alter table public.store_settings add column if not exists terms_html text;
alter table public.store_settings add column if not exists about_html text;
alter table public.store_settings add column if not exists support_email text default 'concierge@kstore.com';
alter table public.store_settings add column if not exists shipping_flat_cents int not null default 1500;
alter table public.store_settings add column if not exists free_shipping_over_cents int default 15000;
alter table public.store_settings add column if not exists delivery_notes text default 'Complimentary white-glove packaging. Dispatched from Vermont & Copenhagen fulfillment centers.';
alter table public.store_settings add column if not exists logo_url text;
alter table public.store_settings add column if not exists favicon_url text;

-- 2. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists sort_order int not null default 0;
alter table public.categories add column if not exists image_url text;

-- 3. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  details text,
  price_cents int not null check (price_cents >= 0),
  compare_at_cents int,
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  sku text,
  material text,
  room text,
  dimensions jsonb,
  weight_kg numeric,
  color_variants jsonb default '[]'::jsonb,
  material_variants text[] default '{}',
  specifications jsonb default '{}'::jsonb,
  care_instructions text,
  rating numeric default 4.8,
  review_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists details text;
alter table public.products add column if not exists compare_at_cents int;
alter table public.products add column if not exists is_bestseller boolean not null default false;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists material text;
alter table public.products add column if not exists room text;
alter table public.products add column if not exists dimensions jsonb;
alter table public.products add column if not exists weight_kg numeric;
alter table public.products add column if not exists color_variants jsonb default '[]'::jsonb;
alter table public.products add column if not exists material_variants text[] default '{}';
alter table public.products add column if not exists specifications jsonb default '{}'::jsonb;
alter table public.products add column if not exists care_instructions text;
alter table public.products add column if not exists rating numeric default 4.8;
alter table public.products add column if not exists review_count int default 0;

-- 4. Banners
do $$
begin
  if not exists (select 1 from pg_type where typname = 'banner_placement') then
    create type public.banner_placement as enum ('hero', 'promo');
  end if;
end$$;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  placement public.banner_placement not null default 'hero',
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Orders & Items
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('stripe', 'cash_on_delivery');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'paid', 'cod_pending', 'refunded', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'delivery_status') then
    create type public.delivery_status as enum ('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled');
  end if;
end$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  tracking_token uuid not null default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_country text not null default 'US',
  shipping_postal_code text not null default '',
  shipping_notes text,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  stripe_session_id text,
  delivery_status public.delivery_status not null default 'pending',
  subtotal_cents int not null,
  discount_cents int not null default 0,
  coupon_code text,
  shipping_cents int not null default 0,
  total_cents int not null,
  currency text not null default 'USD',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists tracking_token uuid not null default gen_random_uuid();
alter table public.orders add column if not exists shipping_country text not null default 'US';
alter table public.orders add column if not exists shipping_postal_code text not null default '';
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists discount_cents int not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists currency text not null default 'USD';

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  variant_color text,
  variant_material text,
  unit_price_cents int not null,
  quantity int not null check (quantity > 0),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.order_items add column if not exists variant_color text;
alter table public.order_items add column if not exists variant_material text;
alter table public.order_items add column if not exists selected_color text;
alter table public.order_items add column if not exists selected_material text;

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null,
  message text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 6. Reviews Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  reviewer_name text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Coupons Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent int not null check (discount_percent between 1 and 100),
  min_spend_cents int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 8. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- 9. Row Level Security Policies
alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Public can view store settings" on public.store_settings;
create policy "Public can view store settings" on public.store_settings for select using (true);

drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories" on public.categories for select using (true);

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select using (is_active = true or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Public can view active banners" on public.banners;
create policy "Public can view active banners" on public.banners for select using (is_active = true);

drop policy if exists "Public can view published reviews" on public.reviews;
create policy "Public can view published reviews" on public.reviews for select using (is_published = true);

drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons" on public.coupons for select using (is_active = true);

-- ==========================================================================
-- 10. SEED DATA POPULATION
-- ==========================================================================

-- Store Settings Seed
insert into public.store_settings (id, store_name, tagline, support_email, currency, currency_symbol, shipping_flat_cents, free_shipping_over_cents, delivery_notes, about_html, terms_html, logo_url, favicon_url)
values (1, ${esc(MOCK_STORE_SETTINGS.store_name)}, ${esc(MOCK_STORE_SETTINGS.tagline)}, ${esc(MOCK_STORE_SETTINGS.support_email)}, ${esc(MOCK_STORE_SETTINGS.currency)}, ${esc(MOCK_STORE_SETTINGS.currency_symbol)}, ${MOCK_STORE_SETTINGS.shipping_flat_cents}, ${MOCK_STORE_SETTINGS.free_shipping_over_cents}, ${esc(MOCK_STORE_SETTINGS.delivery_notes)}, ${esc(MOCK_STORE_SETTINGS.about_html)}, ${esc(MOCK_STORE_SETTINGS.terms_html)}, ${esc(MOCK_STORE_SETTINGS.logo_url)}, ${esc(MOCK_STORE_SETTINGS.favicon_url)})
on conflict (id) do update set
  store_name = excluded.store_name,
  tagline = excluded.tagline,
  support_email = excluded.support_email,
  shipping_flat_cents = excluded.shipping_flat_cents,
  free_shipping_over_cents = excluded.free_shipping_over_cents,
  delivery_notes = excluded.delivery_notes,
  about_html = excluded.about_html,
  terms_html = excluded.terms_html,
  logo_url = excluded.logo_url,
  favicon_url = excluded.favicon_url;

-- Categories Seed
insert into public.categories (id, name, slug, description, sort_order, image_url) values
${MOCK_CATEGORIES.map((c) => {
  const uuid = catMap[c.id];
  return `  ('${uuid}', ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.description)}, ${c.sort_order}, ${esc(c.image_url)})`;
}).join(",\n")}
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  image_url = excluded.image_url;

-- Products Seed (All 30 Living Essentials)
insert into public.products (
  id, category_id, name, slug, description, details, price_cents, compare_at_cents,
  stock, images, is_active, is_featured, is_bestseller, sku, material, room,
  dimensions, weight_kg, color_variants, specifications, rating, review_count
) values
${MOCK_PRODUCTS.map((p, idx) => {
  const uuid = `a0000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;
  const catUuid = catMap[p.category_id] ? `'${catMap[p.category_id]}'` : "null";
  return `  ('${uuid}', ${catUuid}, ${esc(p.name)}, ${esc(p.slug)}, ${esc(p.description)}, ${esc(p.details)}, ${p.price_cents}, ${p.compare_at_cents || "null"}, ${p.stock}, ${escArr(p.images)}, ${p.is_active}, ${p.is_featured}, ${p.is_bestseller}, ${esc(p.sku)}, ${esc(p.material)}, ${esc(p.room)}, ${escJson(p.dimensions)}, ${p.weight_kg || "null"}, ${escJson(p.color_variants)}, ${escJson(p.specifications)}, ${p.rating || 4.8}, ${p.review_count || 0})`;
}).join(",\n")}
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  details = excluded.details,
  price_cents = excluded.price_cents,
  compare_at_cents = excluded.compare_at_cents,
  stock = excluded.stock,
  images = excluded.images,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  is_bestseller = excluded.is_bestseller,
  sku = excluded.sku,
  material = excluded.material,
  room = excluded.room,
  dimensions = excluded.dimensions,
  weight_kg = excluded.weight_kg,
  color_variants = excluded.color_variants,
  specifications = excluded.specifications,
  rating = excluded.rating,
  review_count = excluded.review_count;

-- Banners Seed
insert into public.banners (id, placement, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active) values
${MOCK_BANNERS.map((b, idx) => {
  const uuid = `b0000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;
  return `  ('${uuid}', '${b.placement}', ${esc(b.title)}, ${esc(b.subtitle)}, ${esc(b.image_url)}, ${esc(b.cta_label)}, ${esc(b.cta_href)}, ${b.sort_order}, ${b.is_active})`;
}).join(",\n")}
on conflict (id) do nothing;

-- Coupons Seed
insert into public.coupons (id, code, discount_percent, min_spend_cents, is_active) values
${MOCK_COUPONS.map((cp, idx) => {
  const uuid = `d0000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;
  return `  ('${uuid}', ${esc(cp.code)}, ${cp.discount_percent}, ${cp.min_spend_cents}, ${cp.is_active})`;
}).join(",\n")}
on conflict (code) do update set
  discount_percent = excluded.discount_percent,
  min_spend_cents = excluded.min_spend_cents;

-- Reviews Seed
insert into public.reviews (id, product_id, rating, comment, reviewer_name, is_published) values
${MOCK_REVIEWS.map((r, idx) => {
  const uuid = `e0000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;
  const prodUuid = `a0000000-0000-4000-8000-000000000001`;
  return `  ('${uuid}', '${prodUuid}', ${r.rating}, ${esc(r.comment)}, ${esc(r.reviewer_name)}, true)`;
}).join(",\n")}
on conflict (id) do nothing;
`;

fs.writeFileSync("supabase/kstore_complete_setup.sql", sql);
console.log("Successfully generated supabase/kstore_complete_setup.sql! Size:", sql.length);
