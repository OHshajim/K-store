-- KStore v2 schema: profiles, catalog, banners, orders (guest-capable),
-- reviews. Payments are Stripe (card) or cash on delivery — no manual
-- payment-proof flow. Run 20260803121030_policies.sql right after this.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table public.profiles (
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
create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'KStore',
  tagline text not null default 'Thoughtful goods, delivered by hand.',
  support_email text,
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  shipping_flat_cents int not null default 500,
  free_shipping_over_cents int,
  delivery_notes text not null default 'We deliver by hand in our service area. You will receive updates by email.',
  about_html text,
  terms_html text,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict do nothing;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_idx on public.products (is_active, created_at desc);
create index products_category_idx on public.products (category_id);
create index products_featured_idx on public.products (is_featured) where is_featured and is_active;

-- Admin-managed hero slides and promo banner
create type public.banner_placement as enum ('hero', 'promo');

create table public.banners (
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

create index banners_active_idx on public.banners (placement, sort_order) where is_active;

-- Payments: Stripe (card) or cash on delivery. 'pending' is the Stripe
-- pre-payment state; COD orders sit in 'cod_pending' until cash is collected.
create type public.payment_method as enum ('stripe', 'cash_on_delivery');
create type public.payment_status as enum ('pending', 'paid', 'cod_pending', 'refunded', 'cancelled');
create type public.delivery_status as enum ('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  tracking_token uuid not null default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_notes text,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  stripe_session_id text,
  delivery_status public.delivery_status not null default 'pending',
  subtotal_cents int not null,
  shipping_cents int not null default 0,
  total_cents int not null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (payment_status, delivery_status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price_cents int not null,
  quantity int not null check (quantity > 0),
  image_url text,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null,
  message text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);

-- One review per product per order, only from the order's owner
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index reviews_product_idx on public.reviews (product_id, is_published, created_at desc);
create index reviews_user_idx on public.reviews (user_id, created_at desc);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_updated before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger profiles_updated before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger banners_updated before update on public.banners
  for each row execute function public.touch_updated_at();
create trigger reviews_updated before update on public.reviews
  for each row execute function public.touch_updated_at();
