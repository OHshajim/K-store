export type UserRole = "customer" | "admin";

export type PaymentMethod = "stripe" | "cash_on_delivery";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "cod_pending"
  | "refunded"
  | "cancelled";

export type DeliveryStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type BannerPlacement = "hero" | "promo";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type ColorVariant = {
  name: string;
  hex: string;
  in_stock: boolean;
};

export type ProductDimensions = {
  width_cm: number;
  depth_cm: number;
  height_cm: number;
  text: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  details: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  is_bestseller?: boolean;
  created_at: string;
  category?: Category | null;
  sku?: string;
  material?: string;
  room?: "living" | "workspace" | "kitchen" | "bedroom" | "bathroom" | "lighting";
  dimensions?: ProductDimensions;
  weight_kg?: number;
  color_variants?: ColorVariant[];
  material_variants?: string[];
  specifications?: Record<string, string>;
  care_instructions?: string;
  rating?: number;
  review_count?: number;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  tagline: string;
  support_email: string | null;
  currency: string;
  currency_symbol: string;
  shipping_flat_cents: number;
  free_shipping_over_cents: number | null;
  delivery_notes: string;
  about_html: string | null;
  terms_html: string | null;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  unit_price_cents: number;
  quantity: number;
  image_url: string | null;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  kind: string;
  message: string;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  tracking_token: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  delivery_status: DeliveryStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
};

export type Review = {
  id: string;
  product_id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  reviewer_name?: string | null;
  product?: { name: string; slug: string } | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  stock: number;
  selectedColor?: string;
  selectedMaterial?: string;
};

export type SupportedCurrency = "USD" | "CAD" | "GBP";

export type CurrencyConfig = {
  code: SupportedCurrency;
  symbol: string;
  rate: number;
  label: string;
  flag: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  min_spend_cents: number;
  is_active: boolean;
  expires_at?: string | null;
};

export type NordenFitQuery = {
  roomType: string;
  availableWidthCm: number;
  availableHeightCm: number;
  preferredMaterial: string;
  preferredColor: string;
  budgetUsd: number;
};

export type FitRecommendation = {
  product: Product;
  matchScore: number;
  fitReasons: string[];
  dimensionsFit: boolean;
  materialMatch: boolean;
  colorMatch: boolean;
  budgetMatch: boolean;
};
