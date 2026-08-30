-- KStore single-vendor ecommerce schema (Supabase free-tier friendly)

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
  payment_instructions text not null default 'Transfer the order total and upload your payment proof. We confirm manually within 24 hours.',
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  mobile_money_number text,
  mobile_money_name text,
  delivery_notes text not null default 'We deliver manually in our service area. You will receive updates by email.',
  about_html text,
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

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index otp_codes_email_idx on public.otp_codes (email, created_at desc);

create type public.payment_method as enum ('bank_transfer', 'mobile_money', 'cash_on_delivery');
create type public.payment_status as enum ('awaiting_payment', 'proof_submitted', 'paid', 'cod_pending', 'refunded', 'cancelled');
create type public.delivery_status as enum ('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users (id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_notes text,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'awaiting_payment',
  delivery_status public.delivery_status not null default 'pending',
  payment_proof_url text,
  payment_reference text,
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

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null,
  message text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);

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

-- RLS
alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.otp_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Public catalog
create policy "settings_public_read" on public.store_settings
  for select using (true);
create policy "settings_admin_write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "categories_public_read" on public.categories
  for select using (true);
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- OTP only via service role
create policy "otp_no_client" on public.otp_codes
  for all using (false);

-- Orders
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_update_own_payment" on public.orders
  for update using (
    public.is_admin()
    or (
      auth.uid() = user_id
      and payment_status in ('awaiting_payment', 'cod_pending', 'proof_submitted')
    )
  );

create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_events_select" on public.order_events
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
create policy "order_events_insert_admin_or_owner" on public.order_events
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Storage buckets (run in dashboard or via API): product-images, payment-proofs
-- Example policies after creating buckets:
-- product-images: public read, admin write
-- payment-proofs: authenticated upload own folder, admin read

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_write"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "payment_proofs_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "payment_proofs_owner_or_admin_read"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
