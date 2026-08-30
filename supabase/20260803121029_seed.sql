-- Optional seed after the timestamped init migration
insert into public.categories (id, name, slug, description, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Home', 'home', 'Everyday objects for calmer rooms', 1),
  ('11111111-1111-1111-1111-111111111102', 'Kitchen', 'kitchen', 'Cook, pour, and serve', 2),
  ('11111111-1111-1111-1111-111111111103', 'Care', 'care', 'Simple rituals', 3)
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, details, price_cents, compare_at_cents, stock, images, is_active, is_featured, category_id
) values
  (
    'Solstice Mug',
    'solstice-mug',
    'A hand-thrown 12 oz mug with a quiet reactive glaze.',
    'Stoneware · Dishwasher safe',
    3200, 3900, 24, array[]::text[], true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Ember Bowl',
    'ember-bowl',
    'A generous cereal bowl with a soft sage glaze.',
    'Stoneware · 6 in',
    2800, null, 18, array[]::text[], true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Linen Tea Towel',
    'linen-tea-towel',
    'Stonewashed linen that softens with every wash.',
    '100% linen · 50 × 70 cm',
    1800, null, 40, array[]::text[], true, true,
    '11111111-1111-1111-1111-111111111101'
  )
on conflict (slug) do nothing;

update public.store_settings set
  store_name = 'KStore',
  tagline = 'Thoughtful goods, delivered by hand.',
  payment_instructions = 'Transfer the order total, then upload your payment proof. We confirm manually within 24 hours.',
  bank_name = 'Demo National Bank',
  bank_account_name = 'KStore Vendor',
  bank_account_number = '1234567890',
  mobile_money_number = '+1 555 0100',
  mobile_money_name = 'KStore'
where id = 1;
