-- KStore v2 seed: catalog, hero slides, promo banner, store settings.
-- Run after the init + policies migrations.

insert into public.categories (id, name, slug, description, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Home', 'home', 'Warm textures and quiet corners', 1),
  ('11111111-1111-1111-1111-111111111102', 'Kitchen', 'kitchen', 'Made to be used every day', 2),
  ('11111111-1111-1111-1111-111111111103', 'Care', 'care', 'Small rituals, gentle formulas', 3)
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, details, price_cents, compare_at_cents, stock, images, is_active, is_featured, category_id
) values
  (
    'Solstice Mug',
    'solstice-mug',
    'A hand-thrown 12 oz mug with a quiet reactive glaze — the kind that keeps coffee hot through a long morning. Comfortable handle, chip-resistant finish.',
    'Stoneware · Dishwasher & microwave safe
Height 9.5 cm · Capacity 350 ml',
    3200, 3900, 24,
    array['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Ember Bowl',
    'ember-bowl',
    'A generous cereal bowl with a soft sage glaze that pools darker at the rim. Heavy enough to feel steady, light enough for every day.',
    'Stoneware · 16 cm diameter · Food-safe glaze',
    2800, null, 18,
    array['https://images.unsplash.com/photo-1610128361323-6e941c97f023?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Pour-Over Coffee Set',
    'pour-over-coffee-set',
    'Everything for a slow brew: a ceramic dripper, matching carafe and reusable filter. Makes two cups and one very good smell.',
    'Ceramic dripper · 600 ml borosilicate carafe · Reusable steel filter',
    5400, 6200, 9,
    array['https://images.unsplash.com/photo-1758221052634-33f352d1318b?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Olive Wood Serving Board',
    'olive-wood-serving-board',
    'Cut from a single olive plank, grain swirling differently on every board. Serve bread and cheese on it — then hang it on the wall between dinners.',
    'Solid olive wood · 38 × 20 cm · Food-safe oil finish',
    4600, null, 7,
    array['https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Stoneware Dinner Plates',
    'stoneware-dinner-plates',
    'A set of four dinner plates with a hand-dipped edge — the glaze sits a little thicker where the maker''s fingers paused. Everyday tough, weekend pretty.',
    'Set of 4 · 27 cm diameter · Dishwasher safe',
    6800, null, 14,
    array['https://images.unsplash.com/photo-1551807306-4bcd16b92a41?auto=format&fit=crop&w=800&q=80']::text[],
    true, false,
    '11111111-1111-1111-1111-111111111102'
  ),
  (
    'Linen Tea Towel',
    'linen-tea-towel',
    'Stonewashed linen that gets softer with every wash. Dries glassware without lint, looks good thrown over the oven rail.',
    '100% linen · 50 × 70 cm · Machine wash cold',
    1800, null, 40,
    array['https://images.unsplash.com/photo-1596433904747-e8b061219a71?auto=format&fit=crop&w=800&q=80']::text[],
    true, false,
    '11111111-1111-1111-1111-111111111101'
  ),
  (
    'Cedar Valet Tray',
    'cedar-valet-tray',
    'A low cedar tray for keys, candles, or a morning pour-over setup. Smells like a walk through the woods for the first week.',
    'Solid cedar · Natural oil finish · 30 × 20 cm',
    4500, 5200, 12,
    array['https://images.unsplash.com/photo-1784901393087-988ae280ea4c?auto=format&fit=crop&w=800&q=80']::text[],
    true, false,
    '11111111-1111-1111-1111-111111111101'
  ),
  (
    'Hand-Poured Soy Candle',
    'hand-poured-soy-candle',
    'Forty hours of warm amber, cedar smoke and a little orange peel. Poured in small batches into a reusable glass vessel.',
    'Soy wax · 40 hr burn · 220 ml glass',
    2400, null, 3,
    array['https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111101'
  ),
  (
    'Woven Cotton Throw',
    'woven-cotton-throw',
    'Hand-loomed on wooden frames in warm neutrals, with a hand-knotted fringe. The couch upgrade that gets argued over in the evening.',
    '100% cotton · 130 × 170 cm · Hand-knotted fringe',
    7800, null, 6,
    array['https://images.unsplash.com/photo-1602706294170-1fed8eecd9f9?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111101'
  ),
  (
    'Quiet Soap Bar',
    'quiet-soap-bar',
    'Unscented olive oil soap for sensitive skin — cured for six weeks so it lasts twice as long in the dish.',
    '110 g · Olive oil base · Plastic-free wrap',
    900, null, 60,
    array['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80']::text[],
    true, false,
    '11111111-1111-1111-1111-111111111103'
  ),
  (
    'Cotton Washcloth Set',
    'cotton-washcloth-set',
    'Three organic cotton cloths in warm neutrals, woven dense enough to exfoliate and soft enough for daily use.',
    'Set of 3 · 30 × 30 cm · GOTS-certified cotton',
    2200, null, 30,
    array['https://images.unsplash.com/photo-1574421233376-06f2ccf017f7?auto=format&fit=crop&w=800&q=80']::text[],
    true, true,
    '11111111-1111-1111-1111-111111111103'
  ),
  (
    'Botanical Hand Balm',
    'botanical-hand-balm',
    'A rich balm of shea, calendula and a trace of rosemary — for hands that wash dishes and dig in garden beds. Sinks in without the slick.',
    '50 ml aluminium tin · Shea & calendula · Fragrance-free',
    1600, 1900, 4,
    array['https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80']::text[],
    true, false,
    '11111111-1111-1111-1111-111111111103'
  )
on conflict (slug) do nothing;

-- Hero slides and promo banner (edit or replace in Admin → Banners)
insert into public.banners (placement, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active) values
  (
    'hero',
    'Slow mornings, made by hand',
    'Small-batch ceramics, textiles and care goods — delivered to your door by ours.',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
    'Shop the collection',
    '/shop',
    1,
    true
  ),
  (
    'hero',
    'The winter table collection',
    'Stoneware that stacks, bowls that warm in the hand. Built for long dinners.',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
    'See Kitchen',
    '/shop?category=kitchen',
    2,
    true
  ),
  (
    'promo',
    'Free delivery on orders over $75',
    null,
    null,
    null,
    null,
    1,
    true
  )
on conflict do nothing;

update public.store_settings set
  store_name = 'KStore',
  tagline = 'Thoughtful goods for slow mornings, delivered by hand.',
  support_email = 'hello@kstore.shop',
  delivery_notes = 'Every order is delivered in person within our local service area — no couriers, no waiting rooms. You''ll get an email update at each step until it reaches your door.',
  about_html = 'KStore is a small studio shop for people who want fewer, better things. We source handmade ceramics, natural textiles and gentle self-care from independent makers, and hand-deliver each order ourselves. Pay by card online or cash at the door — either way, a person confirms every order.',
  terms_html = 'Orders are confirmed by email within minutes. Card payments are processed securely by Stripe; cash is collected on delivery. Items may be returned unused within 14 days — email our support address and we will arrange pickup. Delivery is available within our local service area only.'
where id = 1;
