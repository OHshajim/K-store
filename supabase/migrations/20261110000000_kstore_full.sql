-- Kstore Full Schema Migration
-- Includes: profiles, user_roles, categories, products, product_variants,
-- inventory, orders, order_items, order_events, reviews, coupons, wishlists,
-- newsletter_subscribers, store_settings.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Store settings (single row)
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
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

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

create index if not exists products_active_idx on public.products (is_active, created_at desc);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_room_idx on public.products (room);

-- Banners
create type public.banner_placement as enum ('hero', 'promo');

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

-- Payments and Orders
create type public.payment_method as enum ('stripe', 'cash_on_delivery');
create type public.payment_status as enum ('pending', 'paid', 'cod_pending', 'refunded', 'cancelled');
create type public.delivery_status as enum ('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled');

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

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null,
  message text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent int not null check (discount_percent between 1 and 100),
  min_spend_cents int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- Reviews
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

-- RLS Enablement
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.store_settings enable row level security;

-- Public read policies
create policy "Public can view active products" on public.products for select using (is_active = true or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Public can view categories" on public.categories for select using (true);
create policy "Public can view active banners" on public.banners for select using (is_active = true);
create policy "Public can view published reviews" on public.reviews for select using (is_published = true);
create policy "Public can view store settings" on public.store_settings for select using (true);

-- User policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id or tracking_token is not null);

