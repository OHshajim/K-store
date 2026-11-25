-- KStore v2 seed: real Scandinavian furniture & home living catalog (12 curated items),
-- categories, hero/promo banners, coupons, and store settings.
-- Run after schema + RLS migrations.

insert into public.categories (id, name, slug, description, sort_order) values
  ('c0000000-0000-4000-8000-000000000001', 'Living Room', 'living-room', 'Architectural storage, cantilevered side tables, and solid white oak credenzas for serene shared spaces.', 1),
  ('c0000000-0000-4000-8000-000000000002', 'Workspace', 'workspace', 'Quiet focus tools, CNC-milled walnut desk caddies, and curved beech monitor risers for calm productivity.', 2),
  ('c0000000-0000-4000-8000-000000000003', 'Kitchen', 'kitchen', 'Airtight glazed stoneware canisters and carved European walnut platters crafted for everyday culinary ritual.', 3),
  ('c0000000-0000-4000-8000-000000000004', 'Bedroom', 'bedroom', 'Floating solid oak nightstands and hand-woven Belgian linen storage baskets for restorative rest.', 4),
  ('c0000000-0000-4000-8000-000000000005', 'Bathroom', 'bathroom', 'Honed Italian travertine vanity ensembles and organic GOTS-certified Turkish cotton bath towels.', 5),
  ('c0000000-0000-4000-8000-000000000006', 'Lighting', 'lighting', 'Sculptural architectural task lamps and Carrara marble arc floor luminaires that cast warm glare-free light.', 6)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.products (
  id, category_id, name, slug, description, details, price_cents, compare_at_cents, stock, images, is_active, is_featured, is_bestseller, sku, material, room
) values
  (
    'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
    'Klinte Solid Oak Tambour Credenza', 'klinte-oak-tambour-credenza',
    'Low-profile European white oak media sideboard featuring vertical fluted sliding tambour doors and turned solid brass pulls.',
    'Precision-milled in Smaland from FSC-certified solid white oak with curved timber tambour tracks.',
    89000, 105000, 7,
    array['/images/products/nordic-oak-tambour-credenza.jpg', '/images/products/nordic-oak-tambour-credenza-2.jpg']::text[],
    true, true, true, 'KS-LR-101', 'FSC Solid White Oak & Brushed Brass', 'living'
  ),
  (
    'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
    'Södermalm Turned Ash Side Table', 'sodermalm-turned-ash-side-table',
    'Minimalist Scandinavian coffee and sofa-side accent table pairing a lathe-turned solid ash tray top with tapered powder-coated steel legs.',
    'Three-point tripod stance with raised gallery lip prevents spills.',
    24500, 29000, 12,
    array['/images/products/aalto-turned-ash-side-table.jpg']::text[],
    true, true, false, 'KS-LR-102', 'Turned Solid Ash & Powder-Coated Steel', 'living'
  ),
  (
    'a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
    'Gotland Walnut & Wool Felt Desk Caddy', 'gotland-walnut-desk-caddy',
    'CNC-milled solid American walnut desk organizer with merino wool felt dividers, brass pen groove, and wireless charging cable slot.',
    'Hand-rubbed plant oil finish protects the deep chocolate grain.',
    11500, 13500, 19,
    array['/images/products/vermont-walnut-desk-valet.jpg', '/images/products/vermont-walnut-desk-valet-2.jpg']::text[],
    true, true, true, 'KS-WS-201', 'Solid American Walnut & Merino Wool Felt', 'workspace'
  ),
  (
    'a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002',
    'Uppsala Curved Beech Monitor Riser', 'uppsala-curved-beech-monitor-riser',
    'Steam-bent laminated beechwood display shelf elevating dual monitors to eye level while stowing a mechanical keyboard underneath.',
    '9-ply beechwood arch tested to 25 kg static load with cork feet.',
    15800, null, 14,
    array['/images/products/bent-beech-monitor-riser.jpg']::text[],
    true, false, false, 'KS-WS-202', 'Steam-Bent 9-Ply Beech & Natural Cork', 'workspace'
  ),
  (
    'a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000003',
    'Vättern Glazed Stoneware Canister Trio', 'vattern-stoneware-canister-trio',
    'Set of three wheel-thrown matte cream stoneware storage vessels sealed with silicone-gasketed European beechwood lids.',
    'Sized for coffee beans (1.4L), loose-leaf tea (0.9L), and sea salt (0.5L).',
    12800, 15500, 22,
    array['/images/products/vattern-stoneware-canister-trio.jpg']::text[],
    true, true, true, 'KS-KT-301', 'Kiln-Fired Stoneware & European Beech', 'kitchen'
  ),
  (
    'a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003',
    'Dalarna Carved Walnut Serving Platter', 'dalarna-walnut-serving-board',
    'End-grain and live-edge European walnut carving and charcuterie board with integrated juice groove and chamfered underside grip.',
    'Seasoned with food-safe beeswax and walnut oil.',
    8800, null, 16,
    array['/images/products/dalarna-solid-walnut-serving-board.jpg', '/images/products/dalarna-solid-walnut-serving-board-2.jpg']::text[],
    true, false, false, 'KS-KT-302', 'Oiled European Walnut', 'kitchen'
  ),
  (
    'a0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000004',
    'Leksand Floating Oak Nightstand', 'leksand-floating-oak-nightstand',
    'Wall-mounted solid white oak bedside table with mitered waterfall corners, push-to-open soft-close drawer, and concealed cable pass-through.',
    'Cleat-mount French hanger supports up to 35 kg.',
    31000, 36000, 9,
    array['/images/products/leksand-floating-oak-nightstand.jpg']::text[],
    true, true, false, 'KS-BD-401', 'FSC Solid White Oak & Blum Soft-Close Hardware', 'bedroom'
  ),
  (
    'a0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000004',
    'Visby Braided Seagrass & Linen Basket', 'visby-braided-linen-basket',
    'Structured tall throw-blanket and laundry hamper hand-braided from sun-dried seagrass with removable heavy Belgian linen liner and saddle leather handles.',
    'Removable pre-shrunk flax liner keeps wool throws snag-free.',
    8400, null, 25,
    array['/images/products/visby-woven-linen-storage-basket.jpg']::text[],
    true, false, false, 'KS-BD-402', 'Natural Seagrass, Belgian Linen & Bridle Leather', 'bedroom'
  ),
  (
    'a0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000005',
    'Malmö Organic Turkish Bath Towel Trio', 'malmo-organic-bath-towel-trio',
    'Set of three 620 GSM GOTS-certified Aegean long-staple cotton towels loomed in sage green, warm ecru, and oat herringbone.',
    'Includes bath sheet (90 x 150 cm), hand towel (50 x 90 cm), and face cloth.',
    6800, 8200, 34,
    array['/images/products/malmo-organic-cotton-towel-trio.jpg']::text[],
    true, false, false, 'KS-BT-501', '100% GOTS Organic Aegean Cotton (620 GSM)', 'bathroom'
  ),
  (
    'a0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000005',
    'Trosa Travertine & Brass Vanity Set', 'trosa-travertine-vanity-set',
    'Four-piece bathroom countertop ensemble featuring a honed Italian travertine oval tray, refillable stoneware soap pump, tumbler, and brass-inset soap dish.',
    'Sealed natural travertine paired with 304 stainless brushed brass pump.',
    9400, null, 15,
    array['/images/products/trosa-travertine-vanity-set.jpg']::text[],
    true, true, false, 'KS-BT-502', 'Honed Italian Travertine, Stoneware & Brushed Brass', 'bathroom'
  ),
  (
    'a0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000006',
    'Kalmar Matte Architectural Task Lamp', 'kalmar-architectural-task-lamp',
    'Articulated spun-steel architectural desk and bedside lamp featuring a solid brass pivot joint, micro-step rotary dimmer, and warm 2700K LED optics.',
    'Zero-flicker CRI 95+ illumination rated for 40,000 hours.',
    16500, 19500, 11,
    array['/images/products/kalmar-portable-brass-table-lamp.jpg']::text[],
    true, true, true, 'KS-LT-601', 'Powder-Coated Spun Steel & Brass Hardware', 'lighting'
  ),
  (
    'a0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000006',
    'Åre Carrera Marble Arc Floor Lamp', 'are-carrera-marble-floor-lamp',
    'Cantilevered reading and lounge floor lamp anchored by a solid honed Carrera marble cylinder base and topped with a wide Belgian linen drum shade.',
    'Foot-operated brass floor dimmer switch included.',
    52000, 59500, 6,
    array['/images/products/are-marble-arch-floor-lamp.jpg']::text[],
    true, true, false, 'KS-LT-602', 'Honed Carrera Marble, Brushed Steel & Belgian Linen', 'lighting'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price_cents = excluded.price_cents,
  stock = excluded.stock,
  images = excluded.images,
  sku = excluded.sku,
  material = excluded.material,
  room = excluded.room;

-- Hero slides and promo banner
insert into public.banners (placement, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active) values
  (
    'hero',
    'Make room for what matters.',
    'Thoughtfully designed essentials for a more organized, beautiful home.',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80',
    'Explore Collection',
    '/shop',
    1,
    true
  ),
  (
    'hero',
    'Atmospheric Living, Simplified.',
    'Tactile timber joinery, quiet ambient lighting, and organic materials for intentional sanctuaries.',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
    'Shop Living Room',
    '/shop?room=living',
    2,
    true
  ),
  (
    'promo',
    'Complimentary delivery on orders over $150.',
    'Thoughtfully designed essentials for modern living.',
    null,
    'Shop Now',
    '/shop',
    1,
    true
  )
on conflict do nothing;

update public.store_settings set
  store_name = 'Kstore',
  tagline = 'Modern Living, Simplified.',
  support_email = 'concierge@kstore.com',
  delivery_notes = 'Complimentary white-glove packaging. Dispatched from our Vermont & Copenhagen fulfillment centers.',
  about_html = '<p>Kstore designs architectural furniture and living essentials built to endure generations. We believe the physical objects that populate our daily rituals should bring enduring calm, effortless utility, and architectural stillness to the modern dwelling.</p>',
  terms_html = '<p>30-day trial period on all home essentials with carbon-neutral complimentary returns. Kiln-dried solid timber and structural joinery engineered to endure for generations with a 10-year craft warranty.</p>'
where id = 1;
