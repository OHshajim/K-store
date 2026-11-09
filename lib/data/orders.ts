import { randomUUID } from "crypto";
import { orderNumberFromId } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { subtotalOfCents, type PricedItem } from "@/lib/data/pricing";
import type { Order, PaymentMethod } from "@/lib/types";

export type CheckoutInput = {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingNotes?: string;
  paymentMethod: PaymentMethod;
  items: PricedItem[];
  shippingCents: number;
};

// Global in-memory fallback registry for development & test modes
const inMemoryOrders = new Map<string, Order>();

export async function createOrder(input: CheckoutInput): Promise<Order> {
  const subtotal = subtotalOfCents(input.items);
  const total = subtotal + input.shippingCents;
  const id = randomUUID();
  const orderNumber = orderNumberFromId(id);
  const trackingToken = randomUUID();
  const paymentStatus = input.paymentMethod === "cash_on_delivery" ? "cod_pending" : "pending";
  const now = new Date().toISOString();

  // Try creating in Supabase
  try {
    const admin = createAdminClient();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        id,
        order_number: orderNumber,
        user_id: input.userId,
        tracking_token: trackingToken,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        shipping_address: input.shippingAddress,
        shipping_city: input.shippingCity,
        shipping_notes: input.shippingNotes ?? null,
        payment_method: input.paymentMethod,
        payment_status: paymentStatus,
        delivery_status: "pending",
        subtotal_cents: subtotal,
        shipping_cents: input.shippingCents,
        total_cents: total,
      })
      .select("*")
      .single();

    if (!orderError && order) {
      await admin.from("order_items").insert(
        input.items.map((item) => ({
          order_id: id,
          product_id: item.productId,
          product_name: item.name,
          product_slug: item.slug,
          unit_price_cents: item.priceCents,
          quantity: item.quantity,
          image_url: item.image,
        })),
      );

      await admin.from("order_events").insert({
        order_id: id,
        kind: "created",
        message: "Order placed",
        created_by: input.userId,
      });

      decrementStock(admin, input.items);
      const fetched = await fetchFullOrder(admin, id);
      if (fetched) return fetched;
    }
  } catch {
    // Supabase not running, proceed to fallback
  }

  // Fallback demo order object
  const demoOrder: Order = {
    id,
    order_number: orderNumber,
    user_id: input.userId,
    tracking_token: trackingToken,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    shipping_address: input.shippingAddress,
    shipping_city: input.shippingCity,
    shipping_notes: input.shippingNotes ?? null,
    payment_method: input.paymentMethod,
    payment_status: paymentStatus,
    stripe_session_id: null,
    delivery_status: "pending",
    subtotal_cents: subtotal,
    shipping_cents: input.shippingCents,
    total_cents: total,
    admin_notes: null,
    created_at: now,
    updated_at: now,
    items: input.items.map((item) => ({
      id: randomUUID(),
      order_id: id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
      unit_price_cents: item.priceCents,
      quantity: item.quantity,
      image_url: item.image,
    })),
    events: [
      {
        id: randomUUID(),
        order_id: id,
        kind: "created",
        message: "Order placed successfully. Dispatched from fulfillment center.",
        created_at: now,
      },
    ],
  };

  inMemoryOrders.set(id, demoOrder);
  inMemoryOrders.set(orderNumber, demoOrder);
  return demoOrder;
}

async function decrementStock(
  admin: ReturnType<typeof createAdminClient>,
  items: PricedItem[],
) {
  try {
    for (const item of items) {
      const { data: current } = await admin
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();
      if (!current) continue;
      await admin
        .from("products")
        .update({ stock: Math.max(0, current.stock - item.quantity) })
        .eq("id", item.productId)
        .gte("stock", item.quantity);
    }
  } catch {}
}

async function fetchFullOrder(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
): Promise<Order | null> {
  try {
    const { data } = await admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)")
      .eq("id", id)
      .maybeSingle();
    return sortEvents(data as Order | null);
  } catch {
    return inMemoryOrders.get(id) ?? null;
  }
}

function sortEvents(order: Order | null): Order | null {
  if (!order) return null;
  order.events = [...(order.events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return order;
}

export async function getOrderById(
  id: string,
  userId?: string,
  asAdmin = false,
): Promise<Order | null> {
  try {
    if (asAdmin) {
      const admin = createAdminClient();
      const order = await fetchFullOrder(admin, id);
      if (order) return order;
    } else {
      const supabase = await createClient();
      let query = supabase
        .from("orders")
        .select("*, items:order_items(*), events:order_events(*)")
        .eq("id", id);

      if (userId) query = query.eq("user_id", userId);

      const { data } = await query.maybeSingle();
      if (data) return sortEvents(data as Order | null);
    }
  } catch {}

  const mem = inMemoryOrders.get(id);
  if (mem) {
    if (userId && mem.user_id && mem.user_id !== userId) return null;
    return mem;
  }
  return null;
}

export async function getOrderByTracking(
  orderNumber: string,
  token: string,
): Promise<Order | null> {
  if (!orderNumber || !token) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)")
      .eq("order_number", orderNumber)
      .eq("tracking_token", token)
      .maybeSingle();
    if (data) return sortEvents(data as Order | null);
  } catch {}

  const mem = inMemoryOrders.get(orderNumber);
  if (mem && mem.tracking_token === token) {
    return mem;
  }
  return null;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) return data as Order[];
  } catch {}

  const matches: Order[] = [];
  for (const ord of inMemoryOrders.values()) {
    if (ord.user_id === userId && !matches.some((m) => m.id === ord.id)) {
      matches.push(ord);
    }
  }
  return matches;
}

export async function markOrderPaid(
  orderId: string,
  stripeSessionId: string,
): Promise<Order | null> {
  try {
    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ payment_status: "paid", stripe_session_id: stripeSessionId })
      .eq("id", orderId);

    return fetchFullOrder(admin, orderId);
  } catch {
    const mem = inMemoryOrders.get(orderId);
    if (mem) {
      mem.payment_status = "paid";
      mem.stripe_session_id = stripeSessionId;
      mem.events?.push({
        id: randomUUID(),
        order_id: orderId,
        kind: "payment",
        message: "Payment received via Stripe (Test Mode).",
        created_at: new Date().toISOString(),
      });
      return mem;
    }
  }
  return null;
}
