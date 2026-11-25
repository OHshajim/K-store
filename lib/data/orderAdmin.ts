import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderById, getInMemoryOrdersList } from "@/lib/data/orders";
import { DELIVERY_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
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
        product_id: "a0000000-0000-4000-8000-000000000001",
        product_name: "Klinte Solid Oak Tambour Credenza",
        product_slug: "klinte-oak-tambour-credenza",
        unit_price_cents: 89000,
        quantity: 1,
        image_url: "/images/products/nordic-oak-tambour-credenza.jpg",
      },
      {
        id: "item-102",
        order_id: "ord-demo-101",
        product_id: "a0000000-0000-4000-8000-000000000002",
        product_name: "Södermalm Turned Ash Side Table",
        product_slug: "sodermalm-turned-ash-side-table",
        unit_price_cents: 24500,
        quantity: 1,
        image_url: "/images/products/aalto-turned-ash-side-table.jpg",
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
    subtotal_cents: 52000,
    shipping_cents: 0,
    total_cents: 52000,
    admin_notes: "Courier dispatched via Royal Mail Special Delivery.",
    created_at: "2026-03-03T09:40:00Z",
    updated_at: "2026-03-06T08:30:00Z",
    items: [
      {
        id: "item-103",
        order_id: "ord-demo-102",
        product_id: "a0000000-0000-4000-8000-000000000012",
        product_name: "Åre Carrera Marble Arc Floor Lamp",
        product_slug: "are-carrera-marble-floor-lamp",
        unit_price_cents: 52000,
        quantity: 1,
        image_url: "/images/products/are-marble-arch-floor-lamp.jpg",
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
    subtotal_cents: 28000,
    shipping_cents: 0,
    total_cents: 28000,
    admin_notes: "Collect exact cash at doorstep upon handover.",
    created_at: "2026-03-05T16:10:00Z",
    updated_at: "2026-03-06T10:00:00Z",
    items: [
      {
        id: "item-104",
        order_id: "ord-demo-103",
        product_id: "a0000000-0000-4000-8000-000000000011",
        product_name: "Kalmar Matte Architectural Task Lamp",
        product_slug: "kalmar-architectural-task-lamp",
        unit_price_cents: 16500,
        quantity: 1,
        image_url: "/images/products/kalmar-portable-brass-table-lamp.jpg",
      },
      {
        id: "item-105",
        order_id: "ord-demo-103",
        product_id: "a0000000-0000-4000-8000-000000000003",
        product_name: "Gotland Walnut & Wool Felt Desk Caddy",
        product_slug: "gotland-walnut-desk-caddy",
        unit_price_cents: 11500,
        quantity: 1,
        image_url: "/images/products/vermont-walnut-desk-valet.jpg",
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
    subtotal_cents: 39000,
    shipping_cents: 0,
    total_cents: 39000,
    admin_notes: "Awaiting final timber crate packaging.",
    created_at: "2026-03-06T11:25:00Z",
    updated_at: "2026-03-06T12:00:00Z",
    items: [
      {
        id: "item-106",
        order_id: "ord-demo-104",
        product_id: "a0000000-0000-4000-8000-000000000007",
        product_name: "Leksand Floating Oak Nightstand",
        product_slug: "leksand-floating-oak-nightstand",
        unit_price_cents: 39000,
        quantity: 1,
        image_url: "/images/products/leksand-floating-oak-nightstand.jpg",
      },
    ],
  },
];

export async function getAllOrders(): Promise<Order[]> {
  const memoryOrders = getInMemoryOrdersList();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && Array.isArray(data)) {
      const dbOrders = data as Order[];
      const seen = new Set(dbOrders.map((o) => o.id));
      const extras = memoryOrders.filter((o) => !seen.has(o.id));
      return [...extras, ...dbOrders];
    }
    if (error) {
      console.error("Error fetching orders from Supabase:", error);
    }
  } catch (err) {
    console.error("Supabase connection error in getAllOrders:", err);
  }

  return [...memoryOrders, ...DEMO_ADMIN_ORDERS];
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

    const { error } = await admin
      .from("orders")
      .update(patch)
      .eq("id", input.orderId);

    if (!error) {
      const eventRows: Array<{ order_id: string; kind: string; message: string }> = [];
      if (input.paymentStatus) {
        eventRows.push({
          order_id: input.orderId,
          kind: "payment",
          message: `Payment status updated to ${PAYMENT_STATUS_LABELS[input.paymentStatus] || input.paymentStatus}.`,
        });
      }
      if (input.deliveryStatus) {
        eventRows.push({
          order_id: input.orderId,
          kind: "delivery",
          message: `Fulfillment status updated to ${DELIVERY_STATUS_LABELS[input.deliveryStatus] || input.deliveryStatus}.`,
        });
      }
      if (eventRows.length > 0) {
        try {
          await admin.from("order_events").insert(eventRows);
        } catch {}
      }

      const full = await getOrderById(input.orderId, undefined, true);
      if (full) return full;
    }
  } catch {}

  const memOrder = getInMemoryOrdersList().find((o) => o.id === input.orderId);
  if (memOrder) {
    if (input.paymentStatus) memOrder.payment_status = input.paymentStatus;
    if (input.deliveryStatus) memOrder.delivery_status = input.deliveryStatus;
    if (input.adminNotes !== undefined) memOrder.admin_notes = input.adminNotes;
    memOrder.updated_at = new Date().toISOString();
    memOrder.events = memOrder.events || [];
    if (input.deliveryStatus) {
      memOrder.events.push({
        id: `ev-${Date.now()}`,
        order_id: memOrder.id,
        kind: "delivery",
        message: `Fulfillment status updated to ${DELIVERY_STATUS_LABELS[input.deliveryStatus] || input.deliveryStatus}.`,
        created_at: new Date().toISOString(),
      });
    }
    return memOrder;
  }

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
  try {
    const admin = createAdminClient();
    const [profilesRes, ordersRes] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("orders")
        .select("user_id, customer_email, total_cents, payment_status"),
    ]);

    if (profilesRes.data && profilesRes.data.length > 0) {
      const orders = ordersRes.data || [];
      return profilesRes.data.map((p) => {
        const userOrders = orders.filter(
          (o) =>
            o.user_id === p.id ||
            (o.customer_email &&
              p.email &&
              o.customer_email.toLowerCase() === p.email.toLowerCase())
        );
        const order_count = userOrders.length;
        const spent_cents = userOrders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + (o.total_cents || 0), 0);

        const normalizedRole: "admin" | "manager" | "customer" =
          p.role === "admin"
            ? "admin"
            : p.role === "manager"
            ? "manager"
            : "customer";

        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: normalizedRole,
          order_count,
          spent_cents,
          created_at: p.created_at,
        };
      });
    }
  } catch {}

  return [
    { id: "usr-1", email: "elena.rostova@archloft.design", full_name: "Elena Rostova", role: "customer" as const, order_count: 3, spent_cents: 102000, created_at: "2026-02-10T10:00:00Z" },
    { id: "usr-2", email: "m.davies@kensington.co.uk", full_name: "Marcus Davies", role: "customer" as const, order_count: 2, spent_cents: 49000, created_at: "2026-02-12T14:30:00Z" },
  ];
}
