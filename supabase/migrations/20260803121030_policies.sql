-- KStore v2: row-level security + storage policies.
-- Run after 20260803121029_init.sql.

alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.reviews enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Public catalog + admin writes
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

create policy "banners_public_read" on public.banners
  for select using (is_active = true or public.is_admin());
create policy "banners_admin_write" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders: clients see their own; admins see all. Guest orders are written
-- and read through server routes (service role), never client RLS.
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin()
    or exists (
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

-- Reviews: anyone reads published; the order's owner may review a product
-- that was actually in a paid or delivered order of theirs, exactly once.
create policy "reviews_public_read" on public.reviews
  for select using (is_published = true or public.is_admin());
create policy "reviews_insert_verified_buyer" on public.reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and (
          o.payment_status = 'paid'
          or o.delivery_status = 'delivered'
        )
    )
    and exists (
      select 1 from public.order_items oi
      where oi.order_id = order_id and oi.product_id = product_id
    )
  );
create policy "reviews_update_own_or_admin" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "reviews_delete_admin" on public.reviews
  for delete using (public.is_admin());

-- Storage: product images + banners are public-read / admin-write.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_write"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "banners_public_read"
  on storage.objects for select
  using (bucket_id = 'banners');

create policy "banners_admin_write"
  on storage.objects for all
  using (bucket_id = 'banners' and public.is_admin())
  with check (bucket_id = 'banners' and public.is_admin());
