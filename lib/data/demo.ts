import type { Category, Order, Product, Profile, StoreSettings } from "@/lib/types";

// Warm gradient placeholders matching the stone theme. Each product gets its
// own palette so the catalog doesn't render as identical gray boxes.
function placeholder(from: string, to: string, glyph: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="800" fill="url(#g)"/>` +
    `<circle cx="400" cy="360" r="150" fill="rgba(255,255,255,0.35)"/>` +
    `<text x="400" y="420" font-family="Georgia, serif" font-size="120" ` +
    `fill="rgba(60,45,30,0.55)" text-anchor="middle">${glyph}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PLACEHOLDERS = {
  mug: placeholder("#e8ded0", "#cdb9a0", "☕"),
  bowl: placeholder("#e3e0d4", "#b3bfa6", "◠"),
  towel: placeholder("#ede4d8", "#d3c3ae", "▤"),
  tray: placeholder("#e6d8c4", "#bfa081", "▭"),
  soap: placeholder("#e9e2d5", "#cfc0a8", "◍"),
  cloth: placeholder("#e5ddd2", "#c4b4a0", "▦"),
} as const;

export const DEMO_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "KStore",
  tagline: "Thoughtful goods, delivered by hand.",
  support_email: "hello@kstore.local",
  currency: "USD",
  currency_symbol: "$",
  shipping_flat_cents: 500,
  free_shipping_over_cents: 7500,
  payment_instructions:
    "Transfer the order total, then upload your payment proof. We confirm manually within 24 hours.",
  bank_name: "Demo National Bank",
  bank_account_name: "KStore Vendor",
  bank_account_number: "1234567890",
  mobile_money_number: "+1 555 0100",
  mobile_money_name: "KStore",
  delivery_notes:
    "We deliver manually in our service area. You will receive updates by email as your order moves.",
  about_html:
    "KStore is a single-vendor shop with manual payment confirmation and hand delivery — built for small teams on Supabase + Vercel free tiers.",
};

export const DEMO_CATEGORIES: Category[] = [
  {
    id: "cat-home",
    name: "Home",
    slug: "home",
    description: "Everyday objects for calmer rooms",
    sort_order: 1,
  },
  {
    id: "cat-kitchen",
    name: "Kitchen",
    slug: "kitchen",
    description: "Cook, pour, and serve",
    sort_order: 2,
  },
  {
    id: "cat-care",
    name: "Care",
    slug: "care",
    description: "Simple rituals",
    sort_order: 3,
  },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-kitchen",
    name: "Solstice Mug",
    slug: "solstice-mug",
    description:
      "A hand-thrown 12 oz mug with a quiet reactive glaze. Comfortable handle, chip-resistant finish.",
    details:
      "Stoneware · Dishwasher safe · Microwave safe\nHeight 9.5 cm · Capacity 350 ml",
    price_cents: 3200,
    compare_at_cents: 3900,
    stock: 24,
    images: [PLACEHOLDERS.mug, PLACEHOLDERS.bowl],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-2",
    category_id: "cat-kitchen",
    name: "Ember Bowl",
    slug: "ember-bowl",
    description: "A generous cereal bowl with a soft sage glaze that pools at the rim.",
    details: "Stoneware · 6 in diameter · Food-safe glaze",
    price_cents: 2800,
    compare_at_cents: null,
    stock: 18,
    images: [PLACEHOLDERS.bowl],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-3",
    category_id: "cat-home",
    name: "Linen Tea Towel",
    slug: "linen-tea-towel",
    description: "Stonewashed linen that softens with every wash. Hang loop included.",
    details: "100% linen · 50 × 70 cm · Machine wash cold",
    price_cents: 1800,
    compare_at_cents: null,
    stock: 40,
    images: [PLACEHOLDERS.towel],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-4",
    category_id: "cat-home",
    name: "Cedar Tray",
    slug: "cedar-tray",
    description: "A low tray for keys, candles, or a morning pour-over setup.",
    details: "Solid cedar · Natural oil finish · 30 × 20 cm",
    price_cents: 4500,
    compare_at_cents: 5200,
    stock: 12,
    images: [PLACEHOLDERS.tray],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-5",
    category_id: "cat-care",
    name: "Quiet Soap Bar",
    slug: "quiet-soap-bar",
    description: "Unscented olive oil soap for sensitive skin. Cast and cured in small batches.",
    details: "110 g · Plastic-free wrap",
    price_cents: 900,
    compare_at_cents: null,
    stock: 60,
    images: [PLACEHOLDERS.soap],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-6",
    category_id: "cat-care",
    name: "Cotton Washcloth Set",
    slug: "cotton-washcloth-set",
    description: "A set of three organic cotton washcloths in warm neutrals.",
    details: "Set of 3 · 30 × 30 cm · GOTS cotton",
    price_cents: 2200,
    compare_at_cents: null,
    stock: 30,
    images: [PLACEHOLDERS.cloth],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
].map((product) => ({
  ...product,
  category:
    DEMO_CATEGORIES.find((category) => category.id === product.category_id) ??
    null,
}));

export const DEMO_PROFILE: Profile = {
  id: "demo-user",
  email: "demo@kstore.local",
  full_name: "Demo Shopper",
  phone: "+1 555 0199",
  role: "customer",
  avatar_url: null,
};

export const DEMO_ADMIN: Profile = {
  id: "demo-admin",
  email: "admin@kstore.local",
  full_name: "Store Owner",
  phone: "+1 555 0100",
  role: "admin",
  avatar_url: null,
};

let demoOrders: Order[] = [];

export function getDemoOrders() {
  return demoOrders;
}

export function setDemoOrders(orders: Order[]) {
  demoOrders = orders;
}

export function upsertDemoOrder(order: Order) {
  const index = demoOrders.findIndex((item) => item.id === order.id);
  if (index >= 0) {
    demoOrders[index] = order;
  } else {
    demoOrders = [order, ...demoOrders];
  }
  return order;
}
