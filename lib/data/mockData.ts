import type { Category, Product, StoreSettings, Banner, Review, Coupon } from "@/lib/types";

export const MOCK_STORE_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "Kstore",
  tagline: "Modern Living, Simplified.",
  support_email: "concierge@kstore.com",
  currency: "USD",
  currency_symbol: "$",
  shipping_flat_cents: 1500,
  free_shipping_over_cents: 15000, // $150.00
  delivery_notes: "Complimentary white-glove packaging. Dispatched from our Vermont & Copenhagen fulfillment centers.",
  about_html: "<p>Kstore designs architectural furniture and living essentials built to endure generations.</p>",
  terms_html: "<p>30-day trial period on all home essentials with carbon-neutral complimentary returns.</p>",
  logo_url: null,
  favicon_url: "/icons/icon-192.png",
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-living",
    name: "Living Room",
    slug: "living-room",
    description: "Architectural storage, low-profile seating, and solid timber tables designed for serene shared spaces.",
    sort_order: 1,
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-workspace",
    name: "Workspace",
    slug: "workspace",
    description: "Quiet focus tools, precision desk organizers, and cable architecture for calm productivity.",
    sort_order: 2,
    image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-kitchen",
    name: "Kitchen",
    slug: "kitchen",
    description: "Modular pantry jars, tactile stoneware trays, and prep organization crafted for everyday ritual.",
    sort_order: 3,
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-bedroom",
    name: "Bedroom",
    slug: "bedroom",
    description: "Minimalist nightstands, soft linen baskets, and bedside sanctuaries designed for restorative rest.",
    sort_order: 4,
    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-bathroom",
    name: "Bathroom",
    slug: "bathroom",
    description: "Water-resistant timber shelving, matte stoneware canisters, and towel architecture for spa-like simplicity.",
    sort_order: 5,
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-lighting",
    name: "Lighting",
    slug: "lighting",
    description: "Sculptural luminaires and dimmable ambient lamps that cast warm, glare-free atmospheres.",
    sort_order: 6,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  // --- 1. LIVING ROOM ---
  {
    id: "prod-lr-1",
    category_id: "cat-living",
    name: "Modular Storage Shelf",
    slug: "modular-storage-shelf",
    description: "A flexible open shelving unit crafted from FSC-certified white oak with concealed aluminum brackets.",
    details: "Designed to adapt to living spaces of any scale. Precision-milled joints ensure seamless expansion horizontally or vertically without visible hardware.",
    price_cents: 34000,
    compare_at_cents: 39500,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    created_at: "2026-01-10T10:00:00Z",
    sku: "KS-LR-001",
    material: "FSC Solid White Oak & Anodized Aluminum",
    room: "living",
    dimensions: { width_cm: 120, depth_cm: 32, height_cm: 85, text: "120 × 32 × 85 cm (47.2\" × 12.6\" × 33.5\")" },
    weight_kg: 18.5,
    color_variants: [
      { name: "Natural White Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Smoked Charcoal", hex: "#292B27", in_stock: true },
      { name: "Bleached Ash", hex: "#F4F0E8", in_stock: true }
    ],
    material_variants: ["Solid White Oak", "Smoked Ash", "American Walnut"],
    specifications: {
      "Origin": "Crafted in Småland, Sweden",
      "Finish": "Low-VOC UV matte lacquer",
      "Assembly": "Tool-free click system (15 minutes)",
      "Max Shelf Load": "35 kg per tier"
    },
    care_instructions: "Wipe with a damp micro-fiber cloth. Avoid abrasive detergents and direct standing water.",
    rating: 4.9,
    review_count: 48,
  },
  {
    id: "prod-lr-2",
    category_id: "cat-living",
    name: "Minimalist Side Table",
    slug: "minimalist-side-table",
    description: "Sculptural cantilever side table in turned ash timber with a subtle lipped perimeter tray.",
    details: "The weighted steel base offers rock-solid balance while the slender silhouette glides easily over sofa edges for laptop or coffee placement.",
    price_cents: 18500,
    compare_at_cents: 22000,
    stock: 24,
    images: [
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-01-12T10:00:00Z",
    sku: "KS-LR-002",
    material: "Turned Ash Timber & Powder-Coated Steel",
    room: "living",
    dimensions: { width_cm: 45, depth_cm: 45, height_cm: 52, text: "45 × 45 × 52 cm (17.7\" × 17.7\" × 20.5\")" },
    weight_kg: 7.2,
    color_variants: [
      { name: "Natural Ash", hex: "#E5DDD3", in_stock: true },
      { name: "Matte Charcoal", hex: "#292B27", in_stock: true },
      { name: "Sage Mist", hex: "#8A927A", in_stock: true }
    ],
    material_variants: ["Solid Ash", "Solid Walnut"],
    specifications: {
      "Origin": "Designed in Copenhagen, Denmark",
      "Finish": "Hardwax-oil satin sheen",
      "Assembly": "Single hex-bolt attachment included"
    },
    care_instructions: "Treat with natural timber wax once annually to preserve moisture balance.",
    rating: 4.8,
    review_count: 36,
  },
  {
    id: "prod-lr-3",
    category_id: "cat-living",
    name: "Oak Storage Cabinet",
    slug: "oak-storage-cabinet",
    description: "Low-profile credenza featuring fluted sliding tambour doors and integrated wire routing channels.",
    details: "Crafted for media components or curated ceramic displays. Tambour doors glide effortlessly along curved tracks, eliminating door-swing clearances in compact rooms.",
    price_cents: 68000,
    compare_at_cents: 75000,
    stock: 9,
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-01-15T10:00:00Z",
    sku: "KS-LR-003",
    material: "Solid European White Oak & Brass Details",
    room: "living",
    dimensions: { width_cm: 160, depth_cm: 42, height_cm: 65, text: "160 × 42 × 65 cm (63\" × 16.5\" × 25.6\")" },
    weight_kg: 34.0,
    color_variants: [
      { name: "Nordic Natural Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Deep Smoked Oak", hex: "#3A352F", in_stock: true }
    ],
    specifications: {
      "Origin": "Hand-assembled in Porto, Portugal",
      "Doors": "Flexible solid oak tambour slatting",
      "Cable Outlets": "Rear cutouts for HDMI and power",
      "Warranty": "10-Year Structural Guarantee"
    },
    care_instructions: "Dust with soft dry cloth. Clean spills immediately with dry felt.",
    rating: 4.9,
    review_count: 22,
  },
  {
    id: "prod-lr-4",
    category_id: "cat-living",
    name: "Floating Wall Shelf",
    slug: "floating-wall-shelf",
    description: "Beveled edge floating ledge with hidden steel mounting bars for an effortless floating aesthetic.",
    details: "Precision CNC milled groove running along the surface accommodates framed photography, art prints, or daily items without slipping.",
    price_cents: 9500,
    compare_at_cents: 12000,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-01-18T10:00:00Z",
    sku: "KS-LR-004",
    material: "Solid Quarter-Sawn Oak",
    room: "living",
    dimensions: { width_cm: 90, depth_cm: 15, height_cm: 6, text: "90 × 15 × 6 cm (35.4\" × 5.9\" × 2.4\")" },
    weight_kg: 3.5,
    color_variants: [
      { name: "Natural Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Matte Black", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Origin": "Produced in Småland, Sweden",
      "Mounting": "Internal steel bracket (hardware included for drywall and masonry)",
      "Max Capacity": "18 kg when mounted to studs"
    },
    care_instructions: "Light dusting only.",
    rating: 4.7,
    review_count: 59,
  },
  {
    id: "prod-lr-5",
    category_id: "cat-living",
    name: "Modern Coffee Table",
    slug: "modern-coffee-table",
    description: "Softened triangular coffee table in oiled oak supported by rounded sculptural pedestal pillars.",
    details: "Generous organic curves soften linear seating arrangements. An unobtrusive low shelf provides a quiet resting spot for books and periodicals.",
    price_cents: 42000,
    compare_at_cents: 48000,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-01-20T10:00:00Z",
    sku: "KS-LR-005",
    material: "FSC Solid White Oak",
    room: "living",
    dimensions: { width_cm: 105, depth_cm: 75, height_cm: 38, text: "105 × 75 × 38 cm (41.3\" × 29.5\" × 15\")" },
    weight_kg: 21.0,
    color_variants: [
      { name: "Natural Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Warm Walnut", hex: "#6E5440", in_stock: true }
    ],
    specifications: {
      "Origin": "Designed in Stockholm",
      "Coating": "Matte water-based non-yellowing polyurethane",
      "Weight Capacity": "80 kg"
    },
    care_instructions: "Use coasters for ceramic mugs and glassware.",
    rating: 4.9,
    review_count: 27,
  },

  // --- 2. WORKSPACE ---
  {
    id: "prod-ws-1",
    category_id: "cat-workspace",
    name: "Oak Desk Organizer",
    slug: "oak-desk-organizer",
    description: "Modular desk station with magnetic pen troughs, phone charging dock, and note slot.",
    details: "Engineered from a single billet of Appalachian white oak. Concealed neodymium magnets link modules in linear or L-shaped configurations.",
    price_cents: 8500,
    compare_at_cents: 10500,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    created_at: "2026-01-22T10:00:00Z",
    sku: "KS-WS-001",
    material: "CNC Solid White Oak & Anodized Brass",
    room: "workspace",
    dimensions: { width_cm: 32, depth_cm: 12, height_cm: 4, text: "32 × 12 × 4 cm (12.6\" × 4.7\" × 1.6\")" },
    weight_kg: 1.1,
    color_variants: [
      { name: "Natural Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Charcoal Black", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Origin": "Vermont, USA",
      "Lining": "100% Merino wool felt",
      "Base": "Micro-suction anti-slip pads"
    },
    care_instructions: "Brush felt with lint roller; wipe wood with dry cloth.",
    rating: 4.8,
    review_count: 64,
  },
  {
    id: "prod-ws-2",
    category_id: "cat-workspace",
    name: "Minimal Monitor Stand",
    slug: "minimal-monitor-stand",
    description: "Ergonomic molded plywood monitor riser that elevates displays 9 cm while storing keyboards underneath.",
    details: "Relieves neck tension and doubles desk surface area. Wide enough to conceal full-size keyboards with numeric pads.",
    price_cents: 12000,
    compare_at_cents: 14000,
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-01-24T10:00:00Z",
    sku: "KS-WS-002",
    material: "Curved 9-Ply Beech & Oak Veneer",
    room: "workspace",
    dimensions: { width_cm: 54, depth_cm: 23, height_cm: 9, text: "54 × 23 × 9 cm (21.3\" × 9\" × 3.5\")" },
    weight_kg: 2.2,
    color_variants: [
      { name: "Nordic Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Smoked Walnut", hex: "#4A3B32", in_stock: true }
    ],
    specifications: {
      "Weight Capacity": "Holds displays up to 35 kg (including 34\" ultra-wides)",
      "Feet": "Cork non-scratch dampening pads"
    },
    care_instructions: "Wipe with damp cloth.",
    rating: 4.9,
    review_count: 41,
  },
  {
    id: "prod-ws-3",
    category_id: "cat-workspace",
    name: "Cable Management Box",
    slug: "cable-management-box",
    description: "Sculpted flame-retardant ABS cable organizer box topped with a magnetic solid ash lid.",
    details: "Hides messy power strips and oversized laptop adapters. Dual-sided ventilation slots allow efficient airflow and tangle-free routing.",
    price_cents: 4800,
    compare_at_cents: 6000,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-01-26T10:00:00Z",
    sku: "KS-WS-003",
    material: "Flame-Retardant Polymer & Solid Ash",
    room: "workspace",
    dimensions: { width_cm: 36, depth_cm: 15, height_cm: 13, text: "36 × 15 × 13 cm (14.2\" × 5.9\" × 5.1\")" },
    weight_kg: 0.9,
    color_variants: [
      { name: "Bone White", hex: "#F4F0E8", in_stock: true },
      { name: "Basalt Charcoal", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Capacity": "Accommodates 6-to-8 outlet surge protectors",
      "Safety": "UL94 V-0 flame rated enclosure"
    },
    care_instructions: "Wipe exterior clean with micro-fiber cloth.",
    rating: 4.7,
    review_count: 33,
  },
  {
    id: "prod-ws-4",
    category_id: "cat-workspace",
    name: "Desk Storage Tray",
    slug: "desk-storage-tray",
    description: "Tactile spun aluminum catchall with a removable vegetal-tanned Italian leather bottom lining.",
    details: "Subtle radius edges make picking up small stationery, USB drives, and fountain pens effortless.",
    price_cents: 6200,
    compare_at_cents: 7500,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-01-28T10:00:00Z",
    sku: "KS-WS-004",
    material: "Anodized Aerospace Aluminum & Tuscany Leather",
    room: "workspace",
    dimensions: { width_cm: 24, depth_cm: 16, height_cm: 2.5, text: "24 × 16 × 2.5 cm (9.4\" × 6.3\" × 1\")" },
    weight_kg: 0.45,
    color_variants: [
      { name: "Silver & Tan", hex: "#D8C9B5", in_stock: true },
      { name: "Matte Black & Noir", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Leather": "Vegetable-tanned Buttero leather from Conceria Walpier",
      "Origin": "Milan, Italy"
    },
    care_instructions: "Condition leather annually with organic beeswax balm.",
    rating: 4.9,
    review_count: 19,
  },
  {
    id: "prod-ws-5",
    category_id: "cat-workspace",
    name: "Minimalist Desk Lamp",
    slug: "minimalist-desk-lamp",
    description: "Rotatable counterbalanced architectural task lamp with continuous touch-dimming from 2700K to 4000K.",
    details: "A 95+ CRI warm LED strip renders documents and screen colors with true accuracy while eliminating screen reflection.",
    price_cents: 21000,
    compare_at_cents: 24500,
    stock: 16,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    created_at: "2026-01-30T10:00:00Z",
    sku: "KS-WS-005",
    material: "Cast Aluminum & Hand-Spun Brass Joints",
    room: "workspace",
    dimensions: { width_cm: 48, depth_cm: 18, height_cm: 44, text: "48 × 18 × 44 cm (18.9\" × 7.1\" × 17.3\")" },
    weight_kg: 3.1,
    color_variants: [
      { name: "Matte Charcoal", hex: "#292B27", in_stock: true },
      { name: "Warm Ivory", hex: "#F4F0E8", in_stock: true },
      { name: "Brushed Bronze", hex: "#B78E69", in_stock: true }
    ],
    specifications: {
      "Light Source": "Integrated 8W LED (50,000-hour rated)",
      "Color Temp": "Adjustable 2700K – 4000K",
      "CRI": "> 96 Ra",
      "Cord": "Braided 2.0m textile cord"
    },
    care_instructions: "Disconnect power before dusting with a soft microfiber cloth.",
    rating: 4.9,
    review_count: 52,
  },

  // --- 3. KITCHEN ---
  {
    id: "prod-kt-1",
    category_id: "cat-kitchen",
    name: "Kitchen Storage Set",
    slug: "kitchen-storage-set",
    description: "Set of three wheel-thrown matte stoneware canisters with airtight silicone-sealed oak tops.",
    details: "Designed to store coffee beans, organic grains, and loose leaf teas in climate-stable darkness to protect fresh aroma.",
    price_cents: 11000,
    compare_at_cents: 13500,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    created_at: "2026-02-01T10:00:00Z",
    sku: "KS-KT-001",
    material: "High-Fire Ceramic & Turned White Oak",
    room: "kitchen",
    dimensions: { width_cm: 32, depth_cm: 12, height_cm: 18, text: "Set of 3: 450ml, 900ml, 1400ml capacities" },
    weight_kg: 2.8,
    color_variants: [
      { name: "Chalk White", hex: "#FFFFFF", in_stock: true },
      { name: "Pebble Sand", hex: "#D8C9B5", in_stock: true },
      { name: "Moss Sage", hex: "#8A927A", in_stock: true }
    ],
    specifications: {
      "Origin": "Kyoto, Japan",
      "Food Safety": "Lead-free, cadmium-free glazed ceramic",
      "Dishwasher Safe": "Ceramic base is dishwasher safe; handwash wooden lids"
    },
    care_instructions: "Hand wash lids; canisters dishwasher safe.",
    rating: 4.8,
    review_count: 44,
  },
  {
    id: "prod-kt-2",
    category_id: "cat-kitchen",
    name: "Modular Spice Organizer",
    slug: "modular-spice-organizer",
    description: "Tiered angled solid beech drawer and countertop insert displaying 16 hand-blown glass jars.",
    details: "Precision 25-degree tilt ensures spice labels remain instantly readable from cooking height. Includes 48 minimalist water-resistant labels.",
    price_cents: 8900,
    compare_at_cents: 10500,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-03T10:00:00Z",
    sku: "KS-KT-002",
    material: "Solid Beech & Borosilicate Glass",
    room: "kitchen",
    dimensions: { width_cm: 38, depth_cm: 20, height_cm: 8, text: "38 × 20 × 8 cm (15\" × 7.9\" × 3.1\")" },
    weight_kg: 2.1,
    color_variants: [
      { name: "Natural Beech", hex: "#D8C9B5", in_stock: true },
      { name: "Charcoal Stain", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Jars": "16x 100ml borosilicate jars with dual shaker/pour inserts",
      "Seals": "Food-grade airtight silicone rings"
    },
    care_instructions: "Jars dishwasher safe. Wipe wooden rack with dry cloth.",
    rating: 4.9,
    review_count: 28,
  },
  {
    id: "prod-kt-3",
    category_id: "cat-kitchen",
    name: "Countertop Organizer",
    slug: "countertop-organizer",
    description: "Compact two-tier kitchen shelf with utensil caddy and integrated cutting board slot.",
    details: "Elevates oils, vinegar decanters, salt cellars, and pepper grinders off prep counters to maintain pristine workspace.",
    price_cents: 12500,
    compare_at_cents: 14500,
    stock: 19,
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-02-05T10:00:00Z",
    sku: "KS-KT-003",
    material: "Matte Stainless Steel & Oiled White Oak",
    room: "kitchen",
    dimensions: { width_cm: 42, depth_cm: 18, height_cm: 34, text: "42 × 18 × 34 cm (16.5\" × 7.1\" × 13.4\")" },
    weight_kg: 3.4,
    color_variants: [
      { name: "Brushed Steel & Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Matte Black & Oak", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Rust Resistance": "304 Marine Grade Stainless Steel frame",
      "Origin": "Germany"
    },
    care_instructions: "Wipe stainless steel with damp cloth; re-oil timber shelf as desired.",
    rating: 4.8,
    review_count: 37,
  },
  {
    id: "prod-kt-4",
    category_id: "cat-kitchen",
    name: "Wooden Serving Tray",
    slug: "wooden-serving-tray",
    description: "Hand-carved oval serving platter with recessed ergonomic finger handles and a raised spill rim.",
    details: "Milled from a single piece of kiln-dried European walnut. Perfect for morning tea ceremonies, artisanal bread, or tabletop centerpieces.",
    price_cents: 7200,
    compare_at_cents: 8800,
    stock: 31,
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-07T10:00:00Z",
    sku: "KS-KT-004",
    material: "100% Solid European Walnut",
    room: "kitchen",
    dimensions: { width_cm: 46, depth_cm: 30, height_cm: 3.5, text: "46 × 30 × 3.5 cm (18.1\" × 11.8\" × 1.4\")" },
    weight_kg: 1.4,
    color_variants: [
      { name: "Rich Walnut", hex: "#5C4033", in_stock: true },
      { name: "Pale Oak", hex: "#D8C9B5", in_stock: true }
    ],
    specifications: {
      "Finish": "Food-safe organic mineral oil & carnauba wax",
      "Handmade": "Subtle unique grain variations in each piece"
    },
    care_instructions: "Do not soak in water. Hand wash with mild soap and dry immediately.",
    rating: 4.9,
    review_count: 26,
  },
  {
    id: "prod-kt-5",
    category_id: "cat-kitchen",
    name: "Glass Storage Containers",
    slug: "glass-storage-containers",
    description: "Set of four stackable heat-resistant borosilicate glass jars topped with grooved acacia lids.",
    details: "Lids feature deep nesting ridges that lock containers into place when stacked vertically, optimizing shelf volume.",
    price_cents: 9200,
    compare_at_cents: 11000,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-02-09T10:00:00Z",
    sku: "KS-KT-005",
    material: "Borosilicate Glass & Acacia Wood",
    room: "kitchen",
    dimensions: { width_cm: 20, depth_cm: 20, height_cm: 28, text: "Set of 4: 500ml, 800ml, 1200ml, 1800ml" },
    weight_kg: 2.3,
    color_variants: [
      { name: "Clear & Acacia", hex: "#8A5A36", in_stock: true }
    ],
    specifications: {
      "Thermal Shock Range": "-20°C to 150°C (-4°F to 302°F)",
      "BPA Free": "100% toxic-free and odor resistant"
    },
    care_instructions: "Glass bodies are microwave and dishwasher safe. Handwash lids.",
    rating: 4.8,
    review_count: 51,
  },

  // --- 4. BEDROOM ---
  {
    id: "prod-bd-1",
    category_id: "cat-bedroom",
    name: "Bedside Organizer",
    slug: "bedside-organizer",
    description: "Padded wool felt caddy that anchors under mattresses with a weighted steel tongue to hold reading books, tablets, and eye masks.",
    details: "Keeps nighttime reading materials off crowded nightstands while providing discreet cord loops for morning phone charging.",
    price_cents: 5500,
    compare_at_cents: 6800,
    stock: 36,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-02-11T10:00:00Z",
    sku: "KS-BD-001",
    material: "100% German Wool Felt & Steel Insert",
    room: "bedroom",
    dimensions: { width_cm: 34, depth_cm: 10, height_cm: 26, text: "34 × 10 × 26 cm (13.4\" × 3.9\" × 10.2\")" },
    weight_kg: 0.8,
    color_variants: [
      { name: "Stone Heather", hex: "#D8C9B5", in_stock: true },
      { name: "Anthracite", hex: "#292B27", in_stock: true },
      { name: "Moss Green", hex: "#8A927A", in_stock: true }
    ],
    specifications: {
      "Origin": "Bavaria, Germany",
      "Thickness": "Heavyweight 4mm natural wool felt"
    },
    care_instructions: "Spot clean with wool detergent and cool water.",
    rating: 4.8,
    review_count: 42,
  },
  {
    id: "prod-bd-2",
    category_id: "cat-bedroom",
    name: "Minimal Nightstand",
    slug: "minimal-nightstand",
    description: "Compact floating bedside table with a soft-close dovetail drawer and open magazine shelf.",
    details: "Mounts directly to wall studs at custom mattress heights, keeping bedroom floors clear for effortless vacuuming and air circulation.",
    price_cents: 26000,
    compare_at_cents: 31000,
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-02-13T10:00:00Z",
    sku: "KS-BD-002",
    material: "FSC Solid White Oak & Blum Undermount Runners",
    room: "bedroom",
    dimensions: { width_cm: 45, depth_cm: 35, height_cm: 22, text: "45 × 35 × 22 cm (17.7\" × 13.8\" × 8.7\")" },
    weight_kg: 9.5,
    color_variants: [
      { name: "Nordic Oak", hex: "#D8C9B5", in_stock: true },
      { name: "Smoked Ash", hex: "#3A352F", in_stock: true }
    ],
    specifications: {
      "Hardware": "Integrated Blumotion soft-close concealed slides",
      "Mounting": "French cleat timber wall bracket included"
    },
    care_instructions: "Dust with dry cotton cloth.",
    rating: 4.9,
    review_count: 31,
  },
  {
    id: "prod-bd-3",
    category_id: "cat-bedroom",
    name: "Storage Basket",
    slug: "storage-basket",
    description: "Hand-braided sustainable palm leaf and organic linen storage bin with sturdy bridle leather handles.",
    details: "Subtle organic textures introduce warmth to bedroom corners. Stows throw blankets, seasonal knitwear, or extra pillows gracefully.",
    price_cents: 6800,
    compare_at_cents: 8200,
    stock: 27,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-02-15T10:00:00Z",
    sku: "KS-BD-003",
    material: "Natural Palm Leaf, Belgian Linen & Bridle Leather",
    room: "bedroom",
    dimensions: { width_cm: 42, depth_cm: 42, height_cm: 38, text: "42 × 42 × 38 cm (16.5\" × 16.5\" × 15\")" },
    weight_kg: 1.6,
    color_variants: [
      { name: "Natural Sand", hex: "#D8C9B5", in_stock: true },
      { name: "Bleached Flax", hex: "#F4F0E8", in_stock: true }
    ],
    specifications: {
      "Craft": "Hand-woven by female artisan cooperatives in Oaxaca",
      "Fair Trade": "Certified WFTO Fair Trade production"
    },
    care_instructions: "Gently shake outdoors or vacuum on low setting.",
    rating: 4.9,
    review_count: 55,
  },
  {
    id: "prod-bd-4",
    category_id: "cat-bedroom",
    name: "Bedside Table Lamp",
    slug: "bedside-table-lamp",
    description: "Travertine stone sphere base supporting an opal glass diffuser with integrated warm glow dimmer.",
    details: "Cast a soothing 2200K amber hue formulated to encourage melatonin production and peaceful nighttime transitions.",
    price_cents: 17500,
    compare_at_cents: 21000,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-02-17T10:00:00Z",
    sku: "KS-BD-004",
    material: "Unfilled Italian Travertine & Mouth-Blown Opal Glass",
    room: "bedroom",
    dimensions: { width_cm: 20, depth_cm: 20, height_cm: 26, text: "20 × 20 × 26 cm (7.9\" × 7.9\" × 10.2\")" },
    weight_kg: 4.2,
    color_variants: [
      { name: "Beige Travertine", hex: "#D8C9B5", in_stock: true },
      { name: "Nero Marquina", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Socket": "G9 base (warm 2700K dimmable LED bulb included)",
      "Dimmer": "Solid brass inline rotary dimmer switch"
    },
    care_instructions: "Wipe stone with dry cloth; do not expose travertine to acids.",
    rating: 4.9,
    review_count: 38,
  },
  {
    id: "prod-bd-5",
    category_id: "cat-bedroom",
    name: "Clothing Organizer",
    slug: "clothing-organizer",
    description: "Free-standing garment valet and mirror stand crafted from bent solid ash and brass accents.",
    details: "Offers dedicated perches for next-day jackets, trousers, watches, and cufflinks without wrinkling fine tailored garments.",
    price_cents: 29500,
    compare_at_cents: 34000,
    stock: 11,
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-19T10:00:00Z",
    sku: "KS-BD-005",
    material: "Steam-Bent Solid Ash & Solid Cast Brass",
    room: "bedroom",
    dimensions: { width_cm: 48, depth_cm: 36, height_cm: 125, text: "48 × 36 × 125 cm (18.9\" × 14.2\" × 49.2\")" },
    weight_kg: 8.8,
    color_variants: [
      { name: "Natural Ash", hex: "#D8C9B5", in_stock: true },
      { name: "Charcoal Ash", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Mirror": "Swiveling dual-sided distortion-free glass",
      "Origin": "Made in Denmark"
    },
    care_instructions: "Dust wood lightly; clean mirror with glass solution.",
    rating: 4.8,
    review_count: 17,
  },

  // --- 5. BATHROOM ---
  {
    id: "prod-bt-1",
    category_id: "cat-bathroom",
    name: "Bathroom Storage Shelf",
    slug: "bathroom-storage-shelf",
    description: "Naturally moisture-resistant certified teak wood shelf with slatted water-draining tiers.",
    details: "Sustainably harvested Indonesian teak rich in natural protective oils makes this three-tier shelf impervious to high humidity and steam.",
    price_cents: 19500,
    compare_at_cents: 23000,
    stock: 17,
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-02-21T10:00:00Z",
    sku: "KS-BT-001",
    material: "100% Plantation Teak Wood",
    room: "bathroom",
    dimensions: { width_cm: 60, depth_cm: 28, height_cm: 80, text: "60 × 28 × 80 cm (23.6\" × 11\" × 31.5\")" },
    weight_kg: 6.8,
    color_variants: [
      { name: "Golden Natural Teak", hex: "#C49A45", in_stock: true },
      { name: "Weathered Grey Teak", hex: "#D8C9B5", in_stock: true }
    ],
    specifications: {
      "Moisture Rating": "Waterproof for walk-in shower and spa environments",
      "Feet": "Adjustable non-slip silicone feet for tile floors"
    },
    care_instructions: "Rinse occasionally with clean water; apply teak oil annually if desired.",
    rating: 4.9,
    review_count: 39,
  },
  {
    id: "prod-bt-2",
    category_id: "cat-bathroom",
    name: "Minimal Towel Rack",
    slug: "minimal-towel-rack",
    description: "Floor-leaning architectural ladder rack in seamless brushed stainless steel with rubber wall stoppers.",
    details: "Allows oversized bath towels and linen waffle sheets to air dry rapidly without damp odor or mildew buildup.",
    price_cents: 13500,
    compare_at_cents: 16000,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-23T10:00:00Z",
    sku: "KS-BT-002",
    material: "304 Brushed Stainless Steel",
    room: "bathroom",
    dimensions: { width_cm: 50, depth_cm: 4, height_cm: 165, text: "50 × 4 × 165 cm (19.7\" × 1.6\" × 65\")" },
    weight_kg: 4.5,
    color_variants: [
      { name: "Brushed Nickel", hex: "#D8C9B5", in_stock: true },
      { name: "Matte Black PVD", hex: "#292B27", in_stock: true },
      { name: "Warm Bronze PVD", hex: "#B78E69", in_stock: true }
    ],
    specifications: {
      "Finish": "PVD physical vapor deposition anti-corrosion coating",
      "Installation": "No drilling required; rests securely against wall"
    },
    care_instructions: "Wipe with warm water and micro-fiber cloth.",
    rating: 4.8,
    review_count: 29,
  },
  {
    id: "prod-bt-3",
    category_id: "cat-bathroom",
    name: "Countertop Organizer",
    slug: "bathroom-countertop-organizer",
    description: "Fluted matte ceramic vanity tray paired with a soap dispenser and cotton jar with brass handles.",
    details: "Harmonizes facial serums, solid soaps, and linen washcloths into an uncluttered, serene wash basin setup.",
    price_cents: 7500,
    compare_at_cents: 9000,
    stock: 33,
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-25T10:00:00Z",
    sku: "KS-BT-003",
    material: "Matte Stoneware & Solid Brass Pump",
    room: "bathroom",
    dimensions: { width_cm: 28, depth_cm: 14, height_cm: 16, text: "Tray: 28 × 14 cm, Dispenser: 350ml" },
    weight_kg: 1.8,
    color_variants: [
      { name: "Chalk Ivory", hex: "#F4F0E8", in_stock: true },
      { name: "Basalt Charcoal", hex: "#292B27", in_stock: true },
      { name: "Earthy Sage", hex: "#8A927A", in_stock: true }
    ],
    specifications: {
      "Pump Mechanism": "Solid brass core pump with smooth non-clog valve",
      "Origin": "Kyoto, Japan"
    },
    care_instructions: "Rinse dispenser pump with warm water once quarterly.",
    rating: 4.7,
    review_count: 46,
  },
  {
    id: "prod-bt-4",
    category_id: "cat-bathroom",
    name: "Storage Containers",
    slug: "bathroom-storage-containers",
    description: "Set of three ribbed borosilicate apothecary jars with silicone-rimmed sandstone lids.",
    details: "Keeps cotton rounds, sea salts, and cosmetic swabs pristine and dry away from bathroom moisture.",
    price_cents: 5800,
    compare_at_cents: 7000,
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-02-27T10:00:00Z",
    sku: "KS-BT-004",
    material: "Ribbed Borosilicate Glass & Natural Sandstone",
    room: "bathroom",
    dimensions: { width_cm: 26, depth_cm: 9, height_cm: 12, text: "Set of 3: 250ml, 400ml, 600ml" },
    weight_kg: 1.2,
    color_variants: [
      { name: "Sandstone Beige", hex: "#D8C9B5", in_stock: true }
    ],
    specifications: {
      "Seals": "Airtight moisture-barrier food grade silicone",
      "Origin": "Portugal"
    },
    care_instructions: "Glass is dishwasher safe. Sandstone lids wipe clean.",
    rating: 4.9,
    review_count: 21,
  },
  {
    id: "prod-bt-5",
    category_id: "cat-bathroom",
    name: "Wall-Mounted Organizer",
    slug: "wall-mounted-organizer",
    description: "Anodized aluminum wall rail with magnetic cup holders and sliding brass pegs for loofahs and brushes.",
    details: "Mounts via heavy-duty waterproof 3M command adhesive or hidden stainless screws for tiles and painted surfaces.",
    price_cents: 8200,
    compare_at_cents: 9800,
    stock: 26,
    images: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-03-01T10:00:00Z",
    sku: "KS-BT-005",
    material: "Aerospace Anodized Aluminum & Solid Brass",
    room: "bathroom",
    dimensions: { width_cm: 55, depth_cm: 8, height_cm: 7, text: "55 × 8 × 7 cm (21.7\" × 3.1\" × 2.8\")" },
    weight_kg: 1.1,
    color_variants: [
      { name: "Matte Black", hex: "#292B27", in_stock: true },
      { name: "Brushed Aluminum", hex: "#D8C9B5", in_stock: true }
    ],
    specifications: {
      "Corrosion Warranty": "Lifetime anti-corrosion guarantee",
      "Mounting Method": "Dual-mode: No-drill waterproof adhesive or screws"
    },
    care_instructions: "Wipe with soft cloth and mild cleanser.",
    rating: 4.8,
    review_count: 34,
  },

  // --- 6. LIGHTING ---
  {
    id: "prod-lt-1",
    category_id: "cat-lighting",
    name: "Minimal Table Lamp",
    slug: "minimal-table-lamp",
    description: "Mushroom-silhouette portable lamp with an integrated 3-stage touch dimmer and magnetic induction base.",
    details: "Rechargeable 5200mAh battery delivers up to 24 hours of ambient 2700K illumination indoors or on covered garden terraces.",
    price_cents: 14500,
    compare_at_cents: 17500,
    stock: 32,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    created_at: "2026-03-03T10:00:00Z",
    sku: "KS-LT-001",
    material: "Spun Aluminum & Matte Powder Coating",
    room: "lighting",
    dimensions: { width_cm: 22, depth_cm: 22, height_cm: 30, text: "22 × 22 × 30 cm (8.7\" × 8.7\" × 11.8\")" },
    weight_kg: 1.5,
    color_variants: [
      { name: "Warm Ivory", hex: "#F4F0E8", in_stock: true },
      { name: "Sage Mist", hex: "#8A927A", in_stock: true },
      { name: "Muted Bronze", hex: "#B78E69", in_stock: true },
      { name: "Charcoal", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Battery Life": "8 hrs (100%), 16 hrs (50%), 24 hrs (25%)",
      "Charging": "USB-C fast charge (3 hours to full)",
      "Weather Rating": "IP44 splash resistant"
    },
    care_instructions: "Wipe with damp cloth. Do not submerge.",
    rating: 4.9,
    review_count: 73,
  },
  {
    id: "prod-lt-2",
    category_id: "cat-lighting",
    name: "Pendant Light",
    slug: "pendant-light",
    description: "Wide spun brass disc suspension pendant emitting glare-free indirect downlight over dining tables.",
    details: "The hand-brushed finish interacts with natural daylight while casting warm, golden reflections across dining gatherings at dusk.",
    price_cents: 28000,
    compare_at_cents: 33000,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-03-05T10:00:00Z",
    sku: "KS-LT-002",
    material: "Spun Solid Brass & Matte Diffuser",
    room: "lighting",
    dimensions: { width_cm: 45, depth_cm: 45, height_cm: 18, text: "45 × 45 × 18 cm (17.7\" × 17.7\" × 7.1\")" },
    weight_kg: 3.2,
    color_variants: [
      { name: "Brushed Brass", hex: "#B78E69", in_stock: true },
      { name: "Matte Black", hex: "#292B27", in_stock: true },
      { name: "Soft White", hex: "#FFFFFF", in_stock: true }
    ],
    specifications: {
      "Canopy": "Matching spun ceiling rose included",
      "Cable": "3.0m textile braided suspension wire",
      "Socket": "Standard E26 / E27 (dimmable bulb included)"
    },
    care_instructions: "Dust with soft dry cloth.",
    rating: 4.9,
    review_count: 24,
  },
  {
    id: "prod-lt-3",
    category_id: "cat-lighting",
    name: "Ambient Floor Lamp",
    slug: "ambient-floor-lamp",
    description: "Slender arched floor luminaire with a heavy honed Carrera marble base and linen drum shade.",
    details: "Sweeps softly over lounge armchairs to deliver warm reading light without intruding upon foot traffic.",
    price_cents: 49000,
    compare_at_cents: 56000,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: true,
    created_at: "2026-03-07T10:00:00Z",
    sku: "KS-LT-003",
    material: "Honed Carrera Marble, Steel & Belgian Linen",
    room: "lighting",
    dimensions: { width_cm: 65, depth_cm: 40, height_cm: 155, text: "65 × 40 × 155 cm (25.6\" × 15.7\" × 61\")" },
    weight_kg: 14.8,
    color_variants: [
      { name: "Carrera White & Brass", hex: "#F4F0E8", in_stock: true },
      { name: "Marquina Black & Steel", hex: "#292B27", in_stock: true }
    ],
    specifications: {
      "Foot Switch": "Solid brass floor foot pedal dimmer",
      "Origin": "Milan, Italy"
    },
    care_instructions: "Dust linen shade gently with soft brush.",
    rating: 4.8,
    review_count: 31,
  },
  {
    id: "prod-lt-4",
    category_id: "cat-lighting",
    name: "Wall Light",
    slug: "wall-light",
    description: "Architectural rotating wall sconce with 360-degree directional shade for bedside or reading nooks.",
    details: "Can be hardwired into standard junction boxes or plugged into nearby wall outlets with the included fabric cord.",
    price_cents: 16500,
    compare_at_cents: 19500,
    stock: 24,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    created_at: "2026-03-09T10:00:00Z",
    sku: "KS-LT-004",
    material: "Die-Cast Aluminum & Brass Detailing",
    room: "lighting",
    dimensions: { width_cm: 18, depth_cm: 28, height_cm: 22, text: "18 × 28 × 22 cm (7.1\" × 11\" × 8.7\")" },
    weight_kg: 1.6,
    color_variants: [
      { name: "Matte Charcoal", hex: "#292B27", in_stock: true },
      { name: "Sand Beige", hex: "#D8C9B5", in_stock: true }
    ],
    specifications: {
      "Dual Installation": "Plug-in or Hardwired (switch on backplate)",
      "Bulb": "E14 LED (2700K warm white included)"
    },
    care_instructions: "Disconnect power before dusting with a soft dry cloth.",
    rating: 4.8,
    review_count: 22,
  },
  {
    id: "prod-lt-5",
    category_id: "cat-lighting",
    name: "Decorative Lighting",
    slug: "decorative-lighting",
    description: "Sculptural hand-blown textured glass orb that diffuses gentle rhythmic light reminiscent of water ripples.",
    details: "Each piece is hand-blown into wooden molds by master glassmakers in the Czech Republic, rendering every subtle bubble unique.",
    price_cents: 19500,
    compare_at_cents: 23000,
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80"
    ],
    is_active: true,
    is_featured: true,
    is_bestseller: false,
    created_at: "2026-03-11T10:00:00Z",
    sku: "KS-LT-005",
    material: "Mouth-Blown Bohemian Glass & Turned Oak Base",
    room: "lighting",
    dimensions: { width_cm: 25, depth_cm: 25, height_cm: 27, text: "25 × 25 × 27 cm (9.8\" × 9.8\" × 10.6\")" },
    weight_kg: 2.8,
    color_variants: [
      { name: "Smoked Amber Glass", hex: "#B78E69", in_stock: true },
      { name: "Frosted Cloud Glass", hex: "#F4F0E8", in_stock: true }
    ],
    specifications: {
      "Origin": "Bohemia, Czech Republic",
      "Light Source": "Warm 2200K filament LED included"
    },
    care_instructions: "Wipe glass exterior with micro-fiber cloth.",
    rating: 4.9,
    review_count: 18,
  },
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: "banner-hero-1",
    placement: "hero",
    title: "Make room for what matters.",
    subtitle: "Thoughtfully designed essentials for a more organized, beautiful home.",
    image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
    cta_label: "Explore Collection",
    cta_href: "/shop",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "banner-promo-1",
    placement: "promo",
    title: "Complimentary shipping on orders over $150.",
    subtitle: "Automatic checkout credit applied across USA, Canada, and United Kingdom.",
    image_url: null,
    cta_label: "Shop Now",
    cta_href: "/shop",
    sort_order: 1,
    is_active: true,
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    product_id: "prod-lr-1",
    order_id: "ord-demo-1",
    user_id: "usr-demo-1",
    rating: 5,
    comment: "The Modular Storage Shelf arrived in perfect packaging. The solid white oak quality is phenomenal—far beyond mass retail furniture. Fits our Manhattan loft seamlessly.",
    is_published: true,
    created_at: "2026-02-14T14:32:00Z",
    updated_at: "2026-02-14T14:32:00Z",
    reviewer_name: "Elena Rostova, Interior Architect (New York)",
  },
  {
    id: "rev-2",
    product_id: "prod-ws-1",
    order_id: "ord-demo-2",
    user_id: "usr-demo-2",
    rating: 5,
    comment: "This desk organizer transformed my remote workspace. The felt lining protects my fountain pens, and the magnetic joinery is deeply satisfying.",
    is_published: true,
    created_at: "2026-02-18T09:15:00Z",
    updated_at: "2026-02-18T09:15:00Z",
    reviewer_name: "Marcus Vance, Software Architect (Toronto)",
  },
  {
    id: "rev-3",
    product_id: "prod-lt-1",
    order_id: "ord-demo-3",
    user_id: "usr-demo-3",
    rating: 5,
    comment: "The Minimal Table Lamp's touch dimmer is wonderful. We carry it between our dining room and our outdoor balcony in London during evening dinners.",
    is_published: true,
    created_at: "2026-02-22T20:45:00Z",
    updated_at: "2026-02-22T20:45:00Z",
    reviewer_name: "Charlotte Davies, Design Director (London)",
  },
  {
    id: "rev-4",
    product_id: "prod-kt-1",
    order_id: "ord-demo-4",
    user_id: "usr-demo-4",
    rating: 5,
    comment: "Stoneware canisters with real airtight oak lids. They keep our coffee fresh and look like sculptural pottery on the open shelf.",
    is_published: true,
    created_at: "2026-02-28T11:20:00Z",
    updated_at: "2026-02-28T11:20:00Z",
    reviewer_name: "Soren Lindqvist, Product Designer (Copenhagen)",
  },
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "NORDEN10",
    discount_percent: 10,
    min_spend_cents: 10000, // $100 min
    is_active: true,
  },
  {
    id: "coup-2",
    code: "WELCOME20",
    discount_percent: 20,
    min_spend_cents: 15000, // $150 min
    is_active: true,
  },
  {
    id: "coup-3",
    code: "SIMPLIFIED",
    discount_percent: 15,
    min_spend_cents: 12000, // $120 min
    is_active: true,
  },
];

