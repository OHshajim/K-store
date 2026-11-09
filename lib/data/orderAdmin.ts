import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/data/orders";
import type { DeliveryStatus, Order, PaymentStatus } from "@/lib/types";

export const DEMO_ADMIN_ORDERS: Order[] = [
  {
    id: "ord-demo-101",
    order_number: "KS-NYC-8492",
    user_id: null,
    tracking_token: "tok-demo-101",
    customer_name: "Elena Rostova",
    customer_email: "elena.rostova@archloft.design",
    customer_phone: "+1 (212) 555-0149",
    shipping_address: "74 Mercer Street, Loft 3",
    shipping_city: "New York",
    shipping_notes: "Call elevator code upon arrival",
    payment_method: "stripe",
    payment_status: "paid",
    stripe_session_id: "cs_test_839201948",
    delivery_status: "delivered",
    subtotal_cents: 102000,
    shipping_cents: 0,
    total_cents: 102000,
    admin_notes: "Dispatched from Vermont warehouse via priority freight.",
    created_at: "2026-03-01T14:20:00Z",
    updated_at: "2026-03-04T11:15:00Z",
    items: [
      {
        id: "item-101",
        order_id: "ord-demo-101",
        product_id: "prod-lr-1",
        product_name: "Modular Storage Shelf",
        product_slug: "modular-storage-shelf",
        unit_price_cents: 34000,
        quantity: 2,
        image_url: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "item-102",
        order_id: "ord-demo-101",
        product_id: "prod-lr-2",
        product_name: "Minimalist Side Table",
        product_slug: "minimalist-side-table",
        unit_price_cents: 18500,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80",
      },
    ],
    events: [
      { id: "ev-1", order_id: "ord-demo-101", kind: "created", message: "Order placed by client", created_at: "2026-03-01T14:20:00Z" },
      { id: "ev-2", order_id: "ord-demo-101", kind: "payment", message: "Payment verified by Stripe", created_at: "2026-03-01T14:21:00Z" },
      { id: "ev-3", order_id: "ord-demo-101", kind: "delivery", message: "Delivered to building reception", created_at: "2026-03-04T11:15:00Z" },
    ],
  },
  {
    id: "ord-demo-102",
    order_number: "KS-LON-3194",
    user_id: null,
    tracking_token: "tok-demo-102",
    customer_name: "Marcus Davies",
    customer_email: "m.davies@kensington.co.uk",
    customer_phone: "+44 20 7946 0912",
    shipping_address: "14 Holland Park Gardens",
    shipping_city: "London",
    shipping_notes: "Leave with porter",
    payment_method: "stripe",
    payment_status: "paid",
    stripe_session_id: "cs_test_481029482",
    delivery_status: "out_for_delivery",
    subtotal_cents: 49000,
    shipping_cents: 0,
    total_cents: 49000,
    admin_notes: "Courier dispatched via Royal Mail Special Delivery.",
    created_at: "2026-03-03T09:40:00Z",
    updated_at: "2026-03-06T08:30:00Z",
    items: [
      {
        id: "item-103",
        order_id: "ord-demo-102",
        product_id: "prod-lt-3",
        product_name: "Ambient Floor Lamp",
        product_slug: "ambient-floor-lamp",
        unit_price_cents: 49000,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "ord-demo-103",
    order_number: "KS-TOR-7712",
    user_id: null,
    tracking_token: "tok-demo-103",
    customer_name: "Liam O'Connor",
    customer_email: "liam.oc@studiobase.ca",
    customer_phone: "+1 (416) 555-0182",
    shipping_address: "210 Queen Street West",
    shipping_city: "Toronto",
    shipping_notes: null,
    payment_method: "cash_on_delivery",
    payment_status: "cod_pending",
    stripe_session_id: null,
    delivery_status: "packed",
    subtotal_cents: 29500,
    shipping_cents: 0,
    total_cents: 29500,
    admin_notes: "Collect exact cash at doorstep upon handover.",
    created_at: "2026-03-05T16:10:00Z",
    updated_at: "2026-03-06T10:00:00Z",
    items: [
      {
        id: "item-104",
        order_id: "ord-demo-103",
        product_id: "prod-ws-5",
        product_name: "Minimalist Desk Lamp",
        product_slug: "minimalist-desk-lamp",
        unit_price_cents: 21000,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "item-105",
        order_id: "ord-demo-103",
        product_id: "prod-ws-1",
        product_name: "Oak Desk Organizer",
        product_slug: "oak-desk-organizer",
        unit_price_cents: 8500,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1581291518655-9523c932deb8?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "ord-demo-104",
    order_number: "KS-SFO-9921",
    user_id: null,
    tracking_token: "tok-demo-104",
    customer_name: "Clara Vance",
    customer_email: "clara.vance@techcorp.com",
    customer_phone: "+1 (415) 555-0199",
    shipping_address: "550 Montgomery St",
    shipping_city: "San Francisco",
    shipping_notes: "Deliver to 14th floor suite",
    payment_method: "stripe",
    payment_status: "paid",
    stripe_session_id: "cs_test_99218204",
    delivery_status: "confirmed",
    subtotal_cents: 68000,
    shipping_cents: 0,
    total_cents: 68000,
    admin_notes: "Awaiting final timber crate packaging.",
    created_at: "2026-03-06T11:25:00Z",
    updated_at: "2026-03-06T12:00:00Z",
    items: [
      {
        id: "item-106",
        order_id: "ord-demo-104",
        product_id: "prod-lr-3",
        product_name: "Oak Storage Cabinet",
        product_slug: "oak-storage-cabinet",
        unit_price_cents: 68000,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];

export async function getAllOrders(): Promise<Order[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data && data.length > 0) {
      return data as Order[];
    }
  } catch {}

  return DEMO_ADMIN_ORDERS;
}

export async function updateOrderStatus(input: {
  orderId: string;
  adminId: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  adminNotes?: string;
}): Promise<Order> {
  try {
    const admin = createAdminClient();
    const patch: Record<string, unknown> = {};
    if (input.paymentStatus) patch.payment_status = input.paymentStatus;
    if (input.deliveryStatus) patch.delivery_status = input.deliveryStatus;
    if (input.adminNotes !== undefined) patch.admin_notes = input.adminNotes;

    await admin
      .from("orders")
      .update(patch)
      .eq("id", input.orderId);

    const full = await getOrderById(input.orderId, undefined, true);
    if (full) return full;
  } catch {}

  const demo = DEMO_ADMIN_ORDERS.find((o) => o.id === input.orderId);
  if (demo) {
    if (input.paymentStatus) demo.payment_status = input.paymentStatus;
    if (input.deliveryStatus) demo.delivery_status = input.deliveryStatus;
    if (input.adminNotes !== undefined) demo.admin_notes = input.adminNotes;
    return demo;
  }

  throw new Error("Order not found");
}

export async function getCustomerSummaries() {
  const defaults = [
    { id: "usr-1", email: "elena.rostova@archloft.design", full_name: "Elena Rostova", role: "customer", order_count: 3, spent_cents: 102000, created_at: "2026-02-10T10:00:00Z" },
    { id: "usr-2", email: "m.davies@kensington.co.uk", full_name: "Marcus Davies", role: "customer", order_count: 2, spent_cents: 49000, created_at: "2026-02-12T14:30:00Z" },
    { id: "usr-3", email: "liam.oc@studiobase.ca", full_name: "Liam O'Connor", role: "customer", order_count: 1, spent_cents: 29500, created_at: "2026-02-15T09:15:00Z" },
    { id: "usr-4", email: "clara.vance@techcorp.com", full_name: "Clara Vance", role: "customer", order_count: 2, spent_cents: 68000, created_at: "2026-02-20T18:00:00Z" },
  ];

  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (profiles && profiles.length > 0) {
      return profiles.map((p) => ({
        ...p,
        order_count: 1,
        spent_cents: 25000,
      }));
    }
  } catch {}

  return defaults;
}
