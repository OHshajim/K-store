-- ==========================================================================
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
values (1, 'Kstore', 'Modern Living, Simplified.', 'concierge@kstore.com', 'USD', '$', 1500, 15000, 'Complimentary white-glove packaging. Dispatched from our Vermont & Copenhagen fulfillment centers.', '<p>Kstore designs architectural furniture and living essentials built to endure generations.</p>', '<p>30-day trial period on all home essentials with carbon-neutral complimentary returns.</p>', null, '/icons/icon-192.png')
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
  ('c0000000-0000-4000-8000-000000000001', 'Living Room', 'living-room', 'Architectural storage, low-profile seating, and solid timber tables designed for serene shared spaces.', 1, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'),
  ('c0000000-0000-4000-8000-000000000002', 'Workspace', 'workspace', 'Quiet focus tools, precision desk organizers, and cable architecture for calm productivity.', 2, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80'),
  ('c0000000-0000-4000-8000-000000000003', 'Kitchen', 'kitchen', 'Modular pantry jars, tactile stoneware trays, and prep organization crafted for everyday ritual.', 3, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80'),
  ('c0000000-0000-4000-8000-000000000004', 'Bedroom', 'bedroom', 'Minimalist nightstands, soft linen baskets, and bedside sanctuaries designed for restorative rest.', 4, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'),
  ('c0000000-0000-4000-8000-000000000005', 'Bathroom', 'bathroom', 'Water-resistant timber shelving, matte stoneware canisters, and towel architecture for spa-like simplicity.', 5, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'),
  ('c0000000-0000-4000-8000-000000000006', 'Lighting', 'lighting', 'Sculptural luminaires and dimmable ambient lamps that cast warm, glare-free atmospheres.', 6, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80')
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
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Modular Storage Shelf', 'modular-storage-shelf', 'A flexible open shelving unit crafted from FSC-certified white oak with concealed aluminum brackets.', 'Designed to adapt to living spaces of any scale. Precision-milled joints ensure seamless expansion horizontally or vertically without visible hardware.', 34000, 39500, 18, array['https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80']::text[], true, true, true, 'KS-LR-001', 'FSC Solid White Oak & Anodized Aluminum', 'living', '{"width_cm":120,"depth_cm":32,"height_cm":85,"text":"120 × 32 × 85 cm (47.2\" × 12.6\" × 33.5\")"}'::jsonb, 18.5, '[{"name":"Natural White Oak","hex":"#D8C9B5","in_stock":true},{"name":"Smoked Charcoal","hex":"#292B27","in_stock":true},{"name":"Bleached Ash","hex":"#F4F0E8","in_stock":true}]'::jsonb, '{"Origin":"Crafted in Småland, Sweden","Finish":"Low-VOC UV matte lacquer","Assembly":"Tool-free click system (15 minutes)","Max Shelf Load":"35 kg per tier"}'::jsonb, 4.9, 48),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Minimalist Side Table', 'minimalist-side-table', 'Sculptural cantilever side table in turned ash timber with a subtle lipped perimeter tray.', 'The weighted steel base offers rock-solid balance while the slender silhouette glides easily over sofa edges for laptop or coffee placement.', 18500, 22000, 24, array['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-LR-002', 'Turned Ash Timber & Powder-Coated Steel', 'living', '{"width_cm":45,"depth_cm":45,"height_cm":52,"text":"45 × 45 × 52 cm (17.7\" × 17.7\" × 20.5\")"}'::jsonb, 7.2, '[{"name":"Natural Ash","hex":"#E5DDD3","in_stock":true},{"name":"Matte Charcoal","hex":"#292B27","in_stock":true},{"name":"Sage Mist","hex":"#8A927A","in_stock":true}]'::jsonb, '{"Origin":"Designed in Copenhagen, Denmark","Finish":"Hardwax-oil satin sheen","Assembly":"Single hex-bolt attachment included"}'::jsonb, 4.8, 36),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'Oak Storage Cabinet', 'oak-storage-cabinet', 'Low-profile credenza featuring fluted sliding tambour doors and integrated wire routing channels.', 'Crafted for media components or curated ceramic displays. Tambour doors glide effortlessly along curved tracks, eliminating door-swing clearances in compact rooms.', 68000, 75000, 9, array['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-LR-003', 'Solid European White Oak & Brass Details', 'living', '{"width_cm":160,"depth_cm":42,"height_cm":65,"text":"160 × 42 × 65 cm (63\" × 16.5\" × 25.6\")"}'::jsonb, 34, '[{"name":"Nordic Natural Oak","hex":"#D8C9B5","in_stock":true},{"name":"Deep Smoked Oak","hex":"#3A352F","in_stock":true}]'::jsonb, '{"Origin":"Hand-assembled in Porto, Portugal","Doors":"Flexible solid oak tambour slatting","Cable Outlets":"Rear cutouts for HDMI and power","Warranty":"10-Year Structural Guarantee"}'::jsonb, 4.9, 22),
  ('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'Floating Wall Shelf', 'floating-wall-shelf', 'Beveled edge floating ledge with hidden steel mounting bars for an effortless floating aesthetic.', 'Precision CNC milled groove running along the surface accommodates framed photography, art prints, or daily items without slipping.', 9500, 12000, 45, array['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-LR-004', 'Solid Quarter-Sawn Oak', 'living', '{"width_cm":90,"depth_cm":15,"height_cm":6,"text":"90 × 15 × 6 cm (35.4\" × 5.9\" × 2.4\")"}'::jsonb, 3.5, '[{"name":"Natural Oak","hex":"#D8C9B5","in_stock":true},{"name":"Matte Black","hex":"#292B27","in_stock":true}]'::jsonb, '{"Origin":"Produced in Småland, Sweden","Mounting":"Internal steel bracket (hardware included for drywall and masonry)","Max Capacity":"18 kg when mounted to studs"}'::jsonb, 4.7, 59),
  ('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000001', 'Modern Coffee Table', 'modern-coffee-table', 'Softened triangular coffee table in oiled oak supported by rounded sculptural pedestal pillars.', 'Generous organic curves soften linear seating arrangements. An unobtrusive low shelf provides a quiet resting spot for books and periodicals.', 42000, 48000, 12, array['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-LR-005', 'FSC Solid White Oak', 'living', '{"width_cm":105,"depth_cm":75,"height_cm":38,"text":"105 × 75 × 38 cm (41.3\" × 29.5\" × 15\")"}'::jsonb, 21, '[{"name":"Natural Oak","hex":"#D8C9B5","in_stock":true},{"name":"Warm Walnut","hex":"#6E5440","in_stock":true}]'::jsonb, '{"Origin":"Designed in Stockholm","Coating":"Matte water-based non-yellowing polyurethane","Weight Capacity":"80 kg"}'::jsonb, 4.9, 27),
  ('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'Oak Desk Organizer', 'oak-desk-organizer', 'Modular desk station with magnetic pen troughs, phone charging dock, and note slot.', 'Engineered from a single billet of Appalachian white oak. Concealed neodymium magnets link modules in linear or L-shaped configurations.', 8500, 10500, 35, array['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80']::text[], true, true, true, 'KS-WS-001', 'CNC Solid White Oak & Anodized Brass', 'workspace', '{"width_cm":32,"depth_cm":12,"height_cm":4,"text":"32 × 12 × 4 cm (12.6\" × 4.7\" × 1.6\")"}'::jsonb, 1.1, '[{"name":"Natural Oak","hex":"#D8C9B5","in_stock":true},{"name":"Charcoal Black","hex":"#292B27","in_stock":true}]'::jsonb, '{"Origin":"Vermont, USA","Lining":"100% Merino wool felt","Base":"Micro-suction anti-slip pads"}'::jsonb, 4.8, 64),
  ('a0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000002', 'Minimal Monitor Stand', 'minimal-monitor-stand', 'Ergonomic molded plywood monitor riser that elevates displays 9 cm while storing keyboards underneath.', 'Relieves neck tension and doubles desk surface area. Wide enough to conceal full-size keyboards with numeric pads.', 12000, 14000, 28, array['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-WS-002', 'Curved 9-Ply Beech & Oak Veneer', 'workspace', '{"width_cm":54,"depth_cm":23,"height_cm":9,"text":"54 × 23 × 9 cm (21.3\" × 9\" × 3.5\")"}'::jsonb, 2.2, '[{"name":"Nordic Oak","hex":"#D8C9B5","in_stock":true},{"name":"Smoked Walnut","hex":"#4A3B32","in_stock":true}]'::jsonb, '{"Weight Capacity":"Holds displays up to 35 kg (including 34\" ultra-wides)","Feet":"Cork non-scratch dampening pads"}'::jsonb, 4.9, 41),
  ('a0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000002', 'Cable Management Box', 'cable-management-box', 'Sculpted flame-retardant ABS cable organizer box topped with a magnetic solid ash lid.', 'Hides messy power strips and oversized laptop adapters. Dual-sided ventilation slots allow efficient airflow and tangle-free routing.', 4800, 6000, 50, array['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-WS-003', 'Flame-Retardant Polymer & Solid Ash', 'workspace', '{"width_cm":36,"depth_cm":15,"height_cm":13,"text":"36 × 15 × 13 cm (14.2\" × 5.9\" × 5.1\")"}'::jsonb, 0.9, '[{"name":"Bone White","hex":"#F4F0E8","in_stock":true},{"name":"Basalt Charcoal","hex":"#292B27","in_stock":true}]'::jsonb, '{"Capacity":"Accommodates 6-to-8 outlet surge protectors","Safety":"UL94 V-0 flame rated enclosure"}'::jsonb, 4.7, 33),
  ('a0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000002', 'Desk Storage Tray', 'desk-storage-tray', 'Tactile spun aluminum catchall with a removable vegetal-tanned Italian leather bottom lining.', 'Subtle radius edges make picking up small stationery, USB drives, and fountain pens effortless.', 6200, 7500, 30, array['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-WS-004', 'Anodized Aerospace Aluminum & Tuscany Leather', 'workspace', '{"width_cm":24,"depth_cm":16,"height_cm":2.5,"text":"24 × 16 × 2.5 cm (9.4\" × 6.3\" × 1\")"}'::jsonb, 0.45, '[{"name":"Silver & Tan","hex":"#D8C9B5","in_stock":true},{"name":"Matte Black & Noir","hex":"#292B27","in_stock":true}]'::jsonb, '{"Leather":"Vegetable-tanned Buttero leather from Conceria Walpier","Origin":"Milan, Italy"}'::jsonb, 4.9, 19),
  ('a0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000002', 'Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Rotatable counterbalanced architectural task lamp with continuous touch-dimming from 2700K to 4000K.', 'A 95+ CRI warm LED strip renders documents and screen colors with true accuracy while eliminating screen reflection.', 21000, 24500, 16, array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80']::text[], true, true, true, 'KS-WS-005', 'Cast Aluminum & Hand-Spun Brass Joints', 'workspace', '{"width_cm":48,"depth_cm":18,"height_cm":44,"text":"48 × 18 × 44 cm (18.9\" × 7.1\" × 17.3\")"}'::jsonb, 3.1, '[{"name":"Matte Charcoal","hex":"#292B27","in_stock":true},{"name":"Warm Ivory","hex":"#F4F0E8","in_stock":true},{"name":"Brushed Bronze","hex":"#B78E69","in_stock":true}]'::jsonb, '{"Light Source":"Integrated 8W LED (50,000-hour rated)","Color Temp":"Adjustable 2700K – 4000K","CRI":"> 96 Ra","Cord":"Braided 2.0m textile cord"}'::jsonb, 4.9, 52),
  ('a0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000003', 'Kitchen Storage Set', 'kitchen-storage-set', 'Set of three wheel-thrown matte stoneware canisters with airtight silicone-sealed oak tops.', 'Designed to store coffee beans, organic grains, and loose leaf teas in climate-stable darkness to protect fresh aroma.', 11000, 13500, 22, array['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80']::text[], true, true, true, 'KS-KT-001', 'High-Fire Ceramic & Turned White Oak', 'kitchen', '{"width_cm":32,"depth_cm":12,"height_cm":18,"text":"Set of 3: 450ml, 900ml, 1400ml capacities"}'::jsonb, 2.8, '[{"name":"Chalk White","hex":"#FFFFFF","in_stock":true},{"name":"Pebble Sand","hex":"#D8C9B5","in_stock":true},{"name":"Moss Sage","hex":"#8A927A","in_stock":true}]'::jsonb, '{"Origin":"Kyoto, Japan","Food Safety":"Lead-free, cadmium-free glazed ceramic","Dishwasher Safe":"Ceramic base is dishwasher safe; handwash wooden lids"}'::jsonb, 4.8, 44),
  ('a0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000003', 'Modular Spice Organizer', 'modular-spice-organizer', 'Tiered angled solid beech drawer and countertop insert displaying 16 hand-blown glass jars.', 'Precision 25-degree tilt ensures spice labels remain instantly readable from cooking height. Includes 48 minimalist water-resistant labels.', 8900, 10500, 25, array['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-KT-002', 'Solid Beech & Borosilicate Glass', 'kitchen', '{"width_cm":38,"depth_cm":20,"height_cm":8,"text":"38 × 20 × 8 cm (15\" × 7.9\" × 3.1\")"}'::jsonb, 2.1, '[{"name":"Natural Beech","hex":"#D8C9B5","in_stock":true},{"name":"Charcoal Stain","hex":"#292B27","in_stock":true}]'::jsonb, '{"Jars":"16x 100ml borosilicate jars with dual shaker/pour inserts","Seals":"Food-grade airtight silicone rings"}'::jsonb, 4.9, 28),
  ('a0000000-0000-4000-8000-000000000013', 'c0000000-0000-4000-8000-000000000003', 'Countertop Organizer', 'countertop-organizer', 'Compact two-tier kitchen shelf with utensil caddy and integrated cutting board slot.', 'Elevates oils, vinegar decanters, salt cellars, and pepper grinders off prep counters to maintain pristine workspace.', 12500, 14500, 19, array['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-KT-003', 'Matte Stainless Steel & Oiled White Oak', 'kitchen', '{"width_cm":42,"depth_cm":18,"height_cm":34,"text":"42 × 18 × 34 cm (16.5\" × 7.1\" × 13.4\")"}'::jsonb, 3.4, '[{"name":"Brushed Steel & Oak","hex":"#D8C9B5","in_stock":true},{"name":"Matte Black & Oak","hex":"#292B27","in_stock":true}]'::jsonb, '{"Rust Resistance":"304 Marine Grade Stainless Steel frame","Origin":"Germany"}'::jsonb, 4.8, 37),
  ('a0000000-0000-4000-8000-000000000014', 'c0000000-0000-4000-8000-000000000003', 'Wooden Serving Tray', 'wooden-serving-tray', 'Hand-carved oval serving platter with recessed ergonomic finger handles and a raised spill rim.', 'Milled from a single piece of kiln-dried European walnut. Perfect for morning tea ceremonies, artisanal bread, or tabletop centerpieces.', 7200, 8800, 31, array['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-KT-004', '100% Solid European Walnut', 'kitchen', '{"width_cm":46,"depth_cm":30,"height_cm":3.5,"text":"46 × 30 × 3.5 cm (18.1\" × 11.8\" × 1.4\")"}'::jsonb, 1.4, '[{"name":"Rich Walnut","hex":"#5C4033","in_stock":true},{"name":"Pale Oak","hex":"#D8C9B5","in_stock":true}]'::jsonb, '{"Finish":"Food-safe organic mineral oil & carnauba wax","Handmade":"Subtle unique grain variations in each piece"}'::jsonb, 4.9, 26),
  ('a0000000-0000-4000-8000-000000000015', 'c0000000-0000-4000-8000-000000000003', 'Glass Storage Containers', 'glass-storage-containers', 'Set of four stackable heat-resistant borosilicate glass jars topped with grooved acacia lids.', 'Lids feature deep nesting ridges that lock containers into place when stacked vertically, optimizing shelf volume.', 9200, 11000, 40, array['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-KT-005', 'Borosilicate Glass & Acacia Wood', 'kitchen', '{"width_cm":20,"depth_cm":20,"height_cm":28,"text":"Set of 4: 500ml, 800ml, 1200ml, 1800ml"}'::jsonb, 2.3, '[{"name":"Clear & Acacia","hex":"#8A5A36","in_stock":true}]'::jsonb, '{"Thermal Shock Range":"-20°C to 150°C (-4°F to 302°F)","BPA Free":"100% toxic-free and odor resistant"}'::jsonb, 4.8, 51),
  ('a0000000-0000-4000-8000-000000000016', 'c0000000-0000-4000-8000-000000000004', 'Bedside Organizer', 'bedside-organizer', 'Padded wool felt caddy that anchors under mattresses with a weighted steel tongue to hold reading books, tablets, and eye masks.', 'Keeps nighttime reading materials off crowded nightstands while providing discreet cord loops for morning phone charging.', 5500, 6800, 36, array['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-BD-001', '100% German Wool Felt & Steel Insert', 'bedroom', '{"width_cm":34,"depth_cm":10,"height_cm":26,"text":"34 × 10 × 26 cm (13.4\" × 3.9\" × 10.2\")"}'::jsonb, 0.8, '[{"name":"Stone Heather","hex":"#D8C9B5","in_stock":true},{"name":"Anthracite","hex":"#292B27","in_stock":true},{"name":"Moss Green","hex":"#8A927A","in_stock":true}]'::jsonb, '{"Origin":"Bavaria, Germany","Thickness":"Heavyweight 4mm natural wool felt"}'::jsonb, 4.8, 42),
  ('a0000000-0000-4000-8000-000000000017', 'c0000000-0000-4000-8000-000000000004', 'Minimal Nightstand', 'minimal-nightstand', 'Compact floating bedside table with a soft-close dovetail drawer and open magazine shelf.', 'Mounts directly to wall studs at custom mattress heights, keeping bedroom floors clear for effortless vacuuming and air circulation.', 26000, 31000, 14, array['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-BD-002', 'FSC Solid White Oak & Blum Undermount Runners', 'bedroom', '{"width_cm":45,"depth_cm":35,"height_cm":22,"text":"45 × 35 × 22 cm (17.7\" × 13.8\" × 8.7\")"}'::jsonb, 9.5, '[{"name":"Nordic Oak","hex":"#D8C9B5","in_stock":true},{"name":"Smoked Ash","hex":"#3A352F","in_stock":true}]'::jsonb, '{"Hardware":"Integrated Blumotion soft-close concealed slides","Mounting":"French cleat timber wall bracket included"}'::jsonb, 4.9, 31),
  ('a0000000-0000-4000-8000-000000000018', 'c0000000-0000-4000-8000-000000000004', 'Storage Basket', 'storage-basket', 'Hand-braided sustainable palm leaf and organic linen storage bin with sturdy bridle leather handles.', 'Subtle organic textures introduce warmth to bedroom corners. Stows throw blankets, seasonal knitwear, or extra pillows gracefully.', 6800, 8200, 27, array['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-BD-003', 'Natural Palm Leaf, Belgian Linen & Bridle Leather', 'bedroom', '{"width_cm":42,"depth_cm":42,"height_cm":38,"text":"42 × 42 × 38 cm (16.5\" × 16.5\" × 15\")"}'::jsonb, 1.6, '[{"name":"Natural Sand","hex":"#D8C9B5","in_stock":true},{"name":"Bleached Flax","hex":"#F4F0E8","in_stock":true}]'::jsonb, '{"Craft":"Hand-woven by female artisan cooperatives in Oaxaca","Fair Trade":"Certified WFTO Fair Trade production"}'::jsonb, 4.9, 55),
  ('a0000000-0000-4000-8000-000000000019', 'c0000000-0000-4000-8000-000000000004', 'Bedside Table Lamp', 'bedside-table-lamp', 'Travertine stone sphere base supporting an opal glass diffuser with integrated warm glow dimmer.', 'Cast a soothing 2200K amber hue formulated to encourage melatonin production and peaceful nighttime transitions.', 17500, 21000, 20, array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-BD-004', 'Unfilled Italian Travertine & Mouth-Blown Opal Glass', 'bedroom', '{"width_cm":20,"depth_cm":20,"height_cm":26,"text":"20 × 20 × 26 cm (7.9\" × 7.9\" × 10.2\")"}'::jsonb, 4.2, '[{"name":"Beige Travertine","hex":"#D8C9B5","in_stock":true},{"name":"Nero Marquina","hex":"#292B27","in_stock":true}]'::jsonb, '{"Socket":"G9 base (warm 2700K dimmable LED bulb included)","Dimmer":"Solid brass inline rotary dimmer switch"}'::jsonb, 4.9, 38),
  ('a0000000-0000-4000-8000-000000000020', 'c0000000-0000-4000-8000-000000000004', 'Clothing Organizer', 'clothing-organizer', 'Free-standing garment valet and mirror stand crafted from bent solid ash and brass accents.', 'Offers dedicated perches for next-day jackets, trousers, watches, and cufflinks without wrinkling fine tailored garments.', 29500, 34000, 11, array['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-BD-005', 'Steam-Bent Solid Ash & Solid Cast Brass', 'bedroom', '{"width_cm":48,"depth_cm":36,"height_cm":125,"text":"48 × 36 × 125 cm (18.9\" × 14.2\" × 49.2\")"}'::jsonb, 8.8, '[{"name":"Natural Ash","hex":"#D8C9B5","in_stock":true},{"name":"Charcoal Ash","hex":"#292B27","in_stock":true}]'::jsonb, '{"Mirror":"Swiveling dual-sided distortion-free glass","Origin":"Made in Denmark"}'::jsonb, 4.8, 17),
  ('a0000000-0000-4000-8000-000000000021', 'c0000000-0000-4000-8000-000000000005', 'Bathroom Storage Shelf', 'bathroom-storage-shelf', 'Naturally moisture-resistant certified teak wood shelf with slatted water-draining tiers.', 'Sustainably harvested Indonesian teak rich in natural protective oils makes this three-tier shelf impervious to high humidity and steam.', 19500, 23000, 17, array['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-BT-001', '100% Plantation Teak Wood', 'bathroom', '{"width_cm":60,"depth_cm":28,"height_cm":80,"text":"60 × 28 × 80 cm (23.6\" × 11\" × 31.5\")"}'::jsonb, 6.8, '[{"name":"Golden Natural Teak","hex":"#C49A45","in_stock":true},{"name":"Weathered Grey Teak","hex":"#D8C9B5","in_stock":true}]'::jsonb, '{"Moisture Rating":"Waterproof for walk-in shower and spa environments","Feet":"Adjustable non-slip silicone feet for tile floors"}'::jsonb, 4.9, 39),
  ('a0000000-0000-4000-8000-000000000022', 'c0000000-0000-4000-8000-000000000005', 'Minimal Towel Rack', 'minimal-towel-rack', 'Floor-leaning architectural ladder rack in seamless brushed stainless steel with rubber wall stoppers.', 'Allows oversized bath towels and linen waffle sheets to air dry rapidly without damp odor or mildew buildup.', 13500, 16000, 22, array['https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-BT-002', '304 Brushed Stainless Steel', 'bathroom', '{"width_cm":50,"depth_cm":4,"height_cm":165,"text":"50 × 4 × 165 cm (19.7\" × 1.6\" × 65\")"}'::jsonb, 4.5, '[{"name":"Brushed Nickel","hex":"#D8C9B5","in_stock":true},{"name":"Matte Black PVD","hex":"#292B27","in_stock":true},{"name":"Warm Bronze PVD","hex":"#B78E69","in_stock":true}]'::jsonb, '{"Finish":"PVD physical vapor deposition anti-corrosion coating","Installation":"No drilling required; rests securely against wall"}'::jsonb, 4.8, 29),
  ('a0000000-0000-4000-8000-000000000023', 'c0000000-0000-4000-8000-000000000005', 'Countertop Organizer', 'bathroom-countertop-organizer', 'Fluted matte ceramic vanity tray paired with a soap dispenser and cotton jar with brass handles.', 'Harmonizes facial serums, solid soaps, and linen washcloths into an uncluttered, serene wash basin setup.', 7500, 9000, 33, array['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-BT-003', 'Matte Stoneware & Solid Brass Pump', 'bathroom', '{"width_cm":28,"depth_cm":14,"height_cm":16,"text":"Tray: 28 × 14 cm, Dispenser: 350ml"}'::jsonb, 1.8, '[{"name":"Chalk Ivory","hex":"#F4F0E8","in_stock":true},{"name":"Basalt Charcoal","hex":"#292B27","in_stock":true},{"name":"Earthy Sage","hex":"#8A927A","in_stock":true}]'::jsonb, '{"Pump Mechanism":"Solid brass core pump with smooth non-clog valve","Origin":"Kyoto, Japan"}'::jsonb, 4.7, 46),
  ('a0000000-0000-4000-8000-000000000024', 'c0000000-0000-4000-8000-000000000005', 'Storage Containers', 'bathroom-storage-containers', 'Set of three ribbed borosilicate apothecary jars with silicone-rimmed sandstone lids.', 'Keeps cotton rounds, sea salts, and cosmetic swabs pristine and dry away from bathroom moisture.', 5800, 7000, 42, array['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-BT-004', 'Ribbed Borosilicate Glass & Natural Sandstone', 'bathroom', '{"width_cm":26,"depth_cm":9,"height_cm":12,"text":"Set of 3: 250ml, 400ml, 600ml"}'::jsonb, 1.2, '[{"name":"Sandstone Beige","hex":"#D8C9B5","in_stock":true}]'::jsonb, '{"Seals":"Airtight moisture-barrier food grade silicone","Origin":"Portugal"}'::jsonb, 4.9, 21),
  ('a0000000-0000-4000-8000-000000000025', 'c0000000-0000-4000-8000-000000000005', 'Wall-Mounted Organizer', 'wall-mounted-organizer', 'Anodized aluminum wall rail with magnetic cup holders and sliding brass pegs for loofahs and brushes.', 'Mounts via heavy-duty waterproof 3M command adhesive or hidden stainless screws for tiles and painted surfaces.', 8200, 9800, 26, array['https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-BT-005', 'Aerospace Anodized Aluminum & Solid Brass', 'bathroom', '{"width_cm":55,"depth_cm":8,"height_cm":7,"text":"55 × 8 × 7 cm (21.7\" × 3.1\" × 2.8\")"}'::jsonb, 1.1, '[{"name":"Matte Black","hex":"#292B27","in_stock":true},{"name":"Brushed Aluminum","hex":"#D8C9B5","in_stock":true}]'::jsonb, '{"Corrosion Warranty":"Lifetime anti-corrosion guarantee","Mounting Method":"Dual-mode: No-drill waterproof adhesive or screws"}'::jsonb, 4.8, 34),
  ('a0000000-0000-4000-8000-000000000026', 'c0000000-0000-4000-8000-000000000006', 'Minimal Table Lamp', 'minimal-table-lamp', 'Mushroom-silhouette portable lamp with an integrated 3-stage touch dimmer and magnetic induction base.', 'Rechargeable 5200mAh battery delivers up to 24 hours of ambient 2700K illumination indoors or on covered garden terraces.', 14500, 17500, 32, array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80']::text[], true, true, true, 'KS-LT-001', 'Spun Aluminum & Matte Powder Coating', 'lighting', '{"width_cm":22,"depth_cm":22,"height_cm":30,"text":"22 × 22 × 30 cm (8.7\" × 8.7\" × 11.8\")"}'::jsonb, 1.5, '[{"name":"Warm Ivory","hex":"#F4F0E8","in_stock":true},{"name":"Sage Mist","hex":"#8A927A","in_stock":true},{"name":"Muted Bronze","hex":"#B78E69","in_stock":true},{"name":"Charcoal","hex":"#292B27","in_stock":true}]'::jsonb, '{"Battery Life":"8 hrs (100%), 16 hrs (50%), 24 hrs (25%)","Charging":"USB-C fast charge (3 hours to full)","Weather Rating":"IP44 splash resistant"}'::jsonb, 4.9, 73),
  ('a0000000-0000-4000-8000-000000000027', 'c0000000-0000-4000-8000-000000000006', 'Pendant Light', 'pendant-light', 'Wide spun brass disc suspension pendant emitting glare-free indirect downlight over dining tables.', 'The hand-brushed finish interacts with natural daylight while casting warm, golden reflections across dining gatherings at dusk.', 28000, 33000, 15, array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-LT-002', 'Spun Solid Brass & Matte Diffuser', 'lighting', '{"width_cm":45,"depth_cm":45,"height_cm":18,"text":"45 × 45 × 18 cm (17.7\" × 17.7\" × 7.1\")"}'::jsonb, 3.2, '[{"name":"Brushed Brass","hex":"#B78E69","in_stock":true},{"name":"Matte Black","hex":"#292B27","in_stock":true},{"name":"Soft White","hex":"#FFFFFF","in_stock":true}]'::jsonb, '{"Canopy":"Matching spun ceiling rose included","Cable":"3.0m textile braided suspension wire","Socket":"Standard E26 / E27 (dimmable bulb included)"}'::jsonb, 4.9, 24),
  ('a0000000-0000-4000-8000-000000000028', 'c0000000-0000-4000-8000-000000000006', 'Ambient Floor Lamp', 'ambient-floor-lamp', 'Slender arched floor luminaire with a heavy honed Carrera marble base and linen drum shade.', 'Sweeps softly over lounge armchairs to deliver warm reading light without intruding upon foot traffic.', 49000, 56000, 8, array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80']::text[], true, false, true, 'KS-LT-003', 'Honed Carrera Marble, Steel & Belgian Linen', 'lighting', '{"width_cm":65,"depth_cm":40,"height_cm":155,"text":"65 × 40 × 155 cm (25.6\" × 15.7\" × 61\")"}'::jsonb, 14.8, '[{"name":"Carrera White & Brass","hex":"#F4F0E8","in_stock":true},{"name":"Marquina Black & Steel","hex":"#292B27","in_stock":true}]'::jsonb, '{"Foot Switch":"Solid brass floor foot pedal dimmer","Origin":"Milan, Italy"}'::jsonb, 4.8, 31),
  ('a0000000-0000-4000-8000-000000000029', 'c0000000-0000-4000-8000-000000000006', 'Wall Light', 'wall-light', 'Architectural rotating wall sconce with 360-degree directional shade for bedside or reading nooks.', 'Can be hardwired into standard junction boxes or plugged into nearby wall outlets with the included fabric cord.', 16500, 19500, 24, array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80']::text[], true, false, false, 'KS-LT-004', 'Die-Cast Aluminum & Brass Detailing', 'lighting', '{"width_cm":18,"depth_cm":28,"height_cm":22,"text":"18 × 28 × 22 cm (7.1\" × 11\" × 8.7\")"}'::jsonb, 1.6, '[{"name":"Matte Charcoal","hex":"#292B27","in_stock":true},{"name":"Sand Beige","hex":"#D8C9B5","in_stock":true}]'::jsonb, '{"Dual Installation":"Plug-in or Hardwired (switch on backplate)","Bulb":"E14 LED (2700K warm white included)"}'::jsonb, 4.8, 22),
  ('a0000000-0000-4000-8000-000000000030', 'c0000000-0000-4000-8000-000000000006', 'Decorative Lighting', 'decorative-lighting', 'Sculptural hand-blown textured glass orb that diffuses gentle rhythmic light reminiscent of water ripples.', 'Each piece is hand-blown into wooden molds by master glassmakers in the Czech Republic, rendering every subtle bubble unique.', 19500, 23000, 14, array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80']::text[], true, true, false, 'KS-LT-005', 'Mouth-Blown Bohemian Glass & Turned Oak Base', 'lighting', '{"width_cm":25,"depth_cm":25,"height_cm":27,"text":"25 × 25 × 27 cm (9.8\" × 9.8\" × 10.6\")"}'::jsonb, 2.8, '[{"name":"Smoked Amber Glass","hex":"#B78E69","in_stock":true},{"name":"Frosted Cloud Glass","hex":"#F4F0E8","in_stock":true}]'::jsonb, '{"Origin":"Bohemia, Czech Republic","Light Source":"Warm 2200K filament LED included"}'::jsonb, 4.9, 18)
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
  ('b0000000-0000-4000-8000-000000000001', 'hero', 'Make room for what matters.', 'Thoughtfully designed essentials for a more organized, beautiful home.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', 'Explore Collection', '/shop', 1, true),
  ('b0000000-0000-4000-8000-000000000002', 'promo', 'Complimentary shipping on orders over $150.', 'Automatic checkout credit applied across USA, Canada, and United Kingdom.', null, 'Shop Now', '/shop', 1, true)
on conflict (id) do nothing;

-- Coupons Seed
insert into public.coupons (id, code, discount_percent, min_spend_cents, is_active) values
  ('d0000000-0000-4000-8000-000000000001', 'NORDEN10', 10, 10000, true),
  ('d0000000-0000-4000-8000-000000000002', 'WELCOME20', 20, 15000, true),
  ('d0000000-0000-4000-8000-000000000003', 'SIMPLIFIED', 15, 12000, true)
on conflict (code) do update set
  discount_percent = excluded.discount_percent,
  min_spend_cents = excluded.min_spend_cents;

-- Reviews Seed
insert into public.reviews (id, product_id, rating, comment, reviewer_name, is_published) values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 5, 'The Modular Storage Shelf arrived in perfect packaging. The solid white oak quality is phenomenal—far beyond mass retail furniture. Fits our Manhattan loft seamlessly.', 'Elena Rostova, Interior Architect (New York)', true),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 5, 'This desk organizer transformed my remote workspace. The felt lining protects my fountain pens, and the magnetic joinery is deeply satisfying.', 'Marcus Vance, Software Architect (Toronto)', true),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 5, 'The Minimal Table Lamp''s touch dimmer is wonderful. We carry it between our dining room and our outdoor balcony in London during evening dinners.', 'Charlotte Davies, Design Director (London)', true),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 5, 'Stoneware canisters with real airtight oak lids. They keep our coffee fresh and look like sculptural pottery on the open shelf.', 'Soren Lindqvist, Product Designer (Copenhagen)', true)
on conflict (id) do nothing;
