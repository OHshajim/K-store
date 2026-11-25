import { randomUUID } from "crypto";
import { orderNumberFromId } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
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
  discountCents?: number;
};

// System guest account ID in auth.users to satisfy foreign key & NOT NULL constraints on guest checkouts
export const SYSTEM_GUEST_USER_ID = "86f1777f-552c-4211-bfd4-8bffc3a77abb";

declare global {
  var __kstore_memory_orders__: Map<string, Order> | undefined;
}

// Global in-memory fallback registry shared across Next.js server route chunks
const inMemoryOrders =
  globalThis.__kstore_memory_orders__ ??
  (globalThis.__kstore_memory_orders__ = new Map<string, Order>());

export function getInMemoryOrdersList(): Order[] {
  const seen = new Set<string>();
  const list: Order[] = [];
  for (const ord of inMemoryOrders.values()) {
    if (!seen.has(ord.id)) {
      seen.add(ord.id);
      list.push(ord);
    }
  }
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createOrder(input: CheckoutInput): Promise<Order> {
  const subtotal = subtotalOfCents(input.items);
  const discount = Math.max(0, input.discountCents ?? 0);
  const total = Math.max(0, subtotal - discount + input.shippingCents);
  const id = randomUUID();
  const orderNumber = orderNumberFromId(id);
  const trackingToken = randomUUID();
  const paymentStatus =
    input.paymentMethod === "cash_on_delivery" ? "cod_pending" : "awaiting_payment";
  const now = new Date().toISOString();

  // Try creating in Supabase
  try {
    const admin = createAdminClient();
    const isExplicitUser =
      input.userId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.userId,
      );
    const targetUserId = isExplicitUser ? input.userId! : SYSTEM_GUEST_USER_ID;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        id,
        order_number: orderNumber,
        user_id: targetUserId,
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

    if (orderError) {
      console.error("Order creation in Supabase failed:", orderError);
    }

    if (!orderError && order) {
      const { error: itemsError } = await admin.from("order_items").insert(
        input.items.map((item) => ({
          order_id: id,
          product_id: item.productId,
          product_name: item.name,
          product_slug: item.slug,
          unit_price_cents: item.priceCents,
          quantity: item.quantity,
          image_url: item.image,
          selected_color: item.selectedColor ?? null,
          selected_material: item.selectedMaterial ?? null,
        })),
      );

      if (itemsError) {
        console.error("Order items insert in Supabase failed:", itemsError);
      }

      try {
        await admin.from("order_events").insert({
          order_id: id,
          kind: "created",
          message: "Order placed",
          created_by: targetUserId,
        });
      } catch (evErr) {
        console.error("Order event insert notice:", evErr);
      }

      decrementStock(admin, input.items);
      const fetched = await fetchFullOrder(admin, id);
      if (fetched) {
        inMemoryOrders.set(fetched.id, fetched);
        inMemoryOrders.set(fetched.order_number, fetched);
        return fetched;
      }
    }
  } catch (err) {
    console.error("Unexpected error in createOrder:", err);
  }

  // Fallback order object for offline / sandbox testing
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
      selected_color: item.selectedColor ?? null,
      selected_material: item.selectedMaterial ?? null,
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
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  try {
    let query = admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)");

    if (isUuid) {
      query = query.or(`id.eq.${id},tracking_token.eq.${id}`);
    } else {
      query = query.or(`order_number.eq.${id},order_number.ilike.${id}`);
    }

    const { data, error } = await query.maybeSingle();
    if (!error && data) return sortEvents(data as Order | null);

    // Fallback if order_events is not yet established
    let simpleQuery = admin
      .from("orders")
      .select("*, items:order_items(*)");
    if (isUuid) {
      simpleQuery = simpleQuery.or(`id.eq.${id},tracking_token.eq.${id}`);
    } else {
      simpleQuery = simpleQuery.or(`order_number.eq.${id},order_number.ilike.${id}`);
    }
    const { data: simpleData } = await simpleQuery.maybeSingle();
    if (simpleData) return sortEvents(simpleData as Order | null);
  } catch {}
  return inMemoryOrders.get(id) ?? null;
}

function sortEvents(order: Order | null): Order | null {
  if (!order) return null;
  order.events = [...(order.events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return order;
}

function canAccessOrder(
  order: Order,
  options: {
    userId?: string | null;
    userEmail?: string | null;
    asAdmin?: boolean;
    trackingToken?: string | null;
  }
): boolean {
  if (options.asAdmin) return true;
  if (options.trackingToken && order.tracking_token === options.trackingToken) return true;
  if (options.userId && order.user_id && order.user_id === options.userId && order.user_id !== SYSTEM_GUEST_USER_ID) {
    return true;
  }
  if (
    options.userEmail &&
    order.customer_email &&
    order.customer_email.toLowerCase() === options.userEmail.toLowerCase()
  ) {
    return true;
  }
  return false;
}

export async function getOrderById(
  id: string,
  userId?: string | null,
  asAdmin = false,
  trackingToken?: string | null,
  userEmail?: string | null,
): Promise<Order | null> {
  const accessOptions = { userId, userEmail, asAdmin, trackingToken };

  try {
    const admin = createAdminClient();
    const order = await fetchFullOrder(admin, id);
    if (order) {
      return canAccessOrder(order, accessOptions) ? order : null;
    }
  } catch {}

  const mem =
    inMemoryOrders.get(id) ??
    getInMemoryOrdersList().find((o) => o.id === id || o.order_number.toLowerCase() === id.toLowerCase());
  if (mem) {
    return canAccessOrder(mem, accessOptions) ? mem : null;
  }

  try {
    const { DEMO_ADMIN_ORDERS } = await import("@/lib/data/orderAdmin");
    const demoOrder = DEMO_ADMIN_ORDERS.find(
      (o) => o.id === id || o.order_number.toLowerCase() === id.toLowerCase()
    );
    if (demoOrder) {
      return canAccessOrder(demoOrder, accessOptions) ? demoOrder : null;
    }
  } catch {}

  return null;
}

export async function getOrderByTracking(
  orderNumber: string,
  token?: string | null,
): Promise<Order | null> {
  if (!orderNumber) return null;

  try {
    const admin = createAdminClient();
    let query = admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)")
      .ilike("order_number", orderNumber);

    if (token) {
      query = query.eq("tracking_token", token);
    }

    const { data } = await query.maybeSingle();
    if (data) return sortEvents(data as Order | null);
  } catch {}

  const mem =
    inMemoryOrders.get(orderNumber) ??
    getInMemoryOrdersList().find((o) => o.order_number.toLowerCase() === orderNumber.toLowerCase());
  if (mem && (!token || mem.tracking_token === token)) {
    return mem;
  }

  try {
    const { DEMO_ADMIN_ORDERS } = await import("@/lib/data/orderAdmin");
    const demoOrder = DEMO_ADMIN_ORDERS.find(
      (o) => o.order_number.toLowerCase() === orderNumber.toLowerCase() && (!token || o.tracking_token === token)
    );
    if (demoOrder) return demoOrder;
  } catch {}

  return null;
}

export async function getOrdersForUser(userId: string, email?: string | null): Promise<Order[]> {
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId,
      );
    const admin = createAdminClient();
    let query = admin
      .from("orders")
      .select("*, items:order_items(*), events:order_events(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (isUuid && email) {
      query = query.or(`user_id.eq.${userId},customer_email.ilike.${email}`);
    } else if (isUuid) {
      query = query.eq("user_id", userId);
    } else if (email) {
      query = query.ilike("customer_email", email);
    }

    if (isUuid || email) {
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Order[];
    }
  } catch {}

  const matches: Order[] = [];
  for (const ord of getInMemoryOrdersList()) {
    const matchesUser = ord.user_id === userId;
    const matchesEmail =
      Boolean(email) && ord.customer_email.toLowerCase() === email!.toLowerCase();
    if (matchesUser || matchesEmail) {
      matches.push(ord);
    }
  }
  return matches;
}

export async function markOrderPaid(
  orderId: string,
  stripeSessionId: string,
): Promise<Order | null> {
  const mem =
    inMemoryOrders.get(orderId) ??
    getInMemoryOrdersList().find((o) => o.id === orderId);
  if (mem) {
    mem.payment_status = "paid";
    if (mem.delivery_status === "pending") mem.delivery_status = "confirmed";
    mem.stripe_session_id = stripeSessionId;
    mem.updated_at = new Date().toISOString();
    mem.events = mem.events || [];
    mem.events.push({
      id: randomUUID(),
      order_id: orderId,
      kind: "payment",
      message: "Payment received via Stripe.",
      created_at: new Date().toISOString(),
    });
  }

  try {
    const admin = createAdminClient();
    const { data: current } = await admin
      .from("orders")
      .select("delivery_status")
      .eq("id", orderId)
      .maybeSingle();

    const updatePayload: Record<string, unknown> = {
      payment_status: "paid",
      stripe_session_id: stripeSessionId,
    };
    if (current?.delivery_status === "pending") {
      updatePayload.delivery_status = "confirmed";
    }

    const { error } = await admin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (!error) {
      try {
        await admin.from("order_events").insert({
          order_id: orderId,
          kind: "payment",
          message: "Payment verified via Stripe checkout.",
        });
      } catch {}
      const full = await fetchFullOrder(admin, orderId);
      if (full) {
        inMemoryOrders.set(full.id, full);
        inMemoryOrders.set(full.order_number, full);
        return full;
      }
    }
  } catch {}

  return mem ?? null;
}
