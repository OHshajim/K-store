export type UserRole = "customer" | "admin";

export type PaymentMethod =
  | "bank_transfer"
  | "mobile_money"
  | "cash_on_delivery";

export type PaymentStatus =
  | "awaiting_payment"
  | "proof_submitted"
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
  created_at: string;
  category?: Category | null;
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
  payment_instructions: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  mobile_money_number: string | null;
  mobile_money_name: string | null;
  delivery_notes: string;
  about_html: string | null;
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
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  payment_proof_url: string | null;
  payment_reference: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  stock: number;
};
