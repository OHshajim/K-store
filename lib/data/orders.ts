import { randomUUID } from "crypto";
import {
  DEMO_PRODUCTS,
  getDemoOrders,
  upsertDemoOrder,
} from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { orderNumberFromId } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  CartItem,
  DeliveryStatus,
  Order,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";

export type CheckoutInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingNotes?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  shippingCents: number;
};

export async function createOrder(input: CheckoutInput): Promise<Order> {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const total = subtotal + input.shippingCents;
  const id = randomUUID();
  const orderNumber = orderNumberFromId(id);
  const paymentStatus: PaymentStatus =
    input.paymentMethod === "cash_on_delivery"
      ? "cod_pending"
      : "awaiting_payment";

  if (isDemoMode()) {
    const order: Order = {
      id,
      order_number: orderNumber,
      user_id: input.userId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      shipping_address: input.shippingAddress,
      shipping_city: input.shippingCity,
      shipping_notes: input.shippingNotes ?? null,
      payment_method: input.paymentMethod,
      payment_status: paymentStatus,
      delivery_status: "pending",
      payment_proof_url: null,
      payment_reference: null,
      subtotal_cents: subtotal,
      shipping_cents: input.shippingCents,
      total_cents: total,
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
          message: "Order placed",
          created_at: new Date().toISOString(),
        },
      ],
    };
    return upsertDemoOrder(order);
  }

  const supabase = await createClient();

  for (const item of input.items) {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, stock, is_active, name, slug, price_cents, images")
      .eq("id", item.productId)
      .maybeSingle();

    if (error || !product || !product.is_active) {
      throw new Error(`Product unavailable: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for ${product.name}`);
    }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id,
      order_number: orderNumber,
      user_id: input.userId,
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

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Could not create order");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
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

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  await supabase.from("order_events").insert({
    order_id: id,
    kind: "created",
    message: "Order placed",
    created_by: input.userId,
  });

  // Best-effort stock decrement via service role to keep RLS simple.
  try {
    const admin = createAdminClient();
    for (const item of input.items) {
      const product = DEMO_PRODUCTS.find((p) => p.id === item.productId);
      void product;
      const { data: current } = await admin
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();
      if (current) {
        await admin
          .from("products")
          .update({ stock: Math.max(0, current.stock - item.quantity) })
          .eq("id", item.productId);
      }
    }
  } catch {
    // Stock updates are best-effort on free tier / misconfigured service role.
  }

  return getOrderById(id, input.userId) as Promise<Order>;
}

export async function getOrderById(
  id: string,
  userId?: string,
  asAdmin = false,
): Promise<Order | null> {
  if (isDemoMode()) {
    const order = getDemoOrders().find((item) => item.id === id);
    if (!order) return null;
    if (!asAdmin && userId && order.user_id !== userId) return null;
    return order;
  }

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("id", id);

  if (!asAdmin && userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const order = data as Order & {
    items: Order["items"];
    events: Order["events"];
  };
  order.events = [...(order.events ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return order;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (isDemoMode()) {
    return getDemoOrders().filter((order) => order.user_id === userId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Order[];
}

export async function getAllOrders(): Promise<Order[]> {
  if (isDemoMode()) return getDemoOrders();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as Order[];
}

export async function submitPaymentProof(input: {
  orderId: string;
  userId: string;
  proofUrl: string;
  reference?: string;
}): Promise<Order> {
  if (isDemoMode()) {
    const existing = getDemoOrders().find((order) => order.id === input.orderId);
    if (!existing || existing.user_id !== input.userId) {
      throw new Error("Order not found");
    }
    return upsertDemoOrder({
      ...existing,
      payment_proof_url: input.proofUrl,
      payment_reference: input.reference ?? existing.payment_reference,
      payment_status: "proof_submitted",
      updated_at: new Date().toISOString(),
      events: [
        ...(existing.events ?? []),
        {
          id: randomUUID(),
          order_id: existing.id,
          kind: "payment_proof",
          message: "Payment proof submitted",
          created_at: new Date().toISOString(),
        },
      ],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_proof_url: input.proofUrl,
      payment_reference: input.reference ?? null,
      payment_status: "proof_submitted",
    })
    .eq("id", input.orderId)
    .eq("user_id", input.userId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Update failed");

  await supabase.from("order_events").insert({
    order_id: input.orderId,
    kind: "payment_proof",
    message: "Payment proof submitted",
    created_by: input.userId,
  });

  return (await getOrderById(input.orderId, input.userId))!;
}

export async function updateOrderStatus(input: {
  orderId: string;
  adminId: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  adminNotes?: string;
}): Promise<Order> {
  if (isDemoMode()) {
    const existing = getDemoOrders().find((order) => order.id === input.orderId);
    if (!existing) throw new Error("Order not found");
    const next: Order = {
      ...existing,
      payment_status: input.paymentStatus ?? existing.payment_status,
      delivery_status: input.deliveryStatus ?? existing.delivery_status,
      admin_notes: input.adminNotes ?? existing.admin_notes,
      updated_at: new Date().toISOString(),
      events: [
        ...(existing.events ?? []),
        {
          id: randomUUID(),
          order_id: existing.id,
          kind: "status",
          message: [
            input.paymentStatus
              ? `Payment → ${input.paymentStatus}`
              : null,
            input.deliveryStatus
              ? `Delivery → ${input.deliveryStatus}`
              : null,
          ]
            .filter(Boolean)
            .join(" · "),
          created_at: new Date().toISOString(),
        },
      ],
    };
    return upsertDemoOrder(next);
  }

  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.paymentStatus) patch.payment_status = input.paymentStatus;
  if (input.deliveryStatus) patch.delivery_status = input.deliveryStatus;
  if (input.adminNotes !== undefined) patch.admin_notes = input.adminNotes;

  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", input.orderId);

  if (error) throw new Error(error.message);

  await supabase.from("order_events").insert({
    order_id: input.orderId,
    kind: "status",
    message: [
      input.paymentStatus ? `Payment → ${input.paymentStatus}` : null,
      input.deliveryStatus ? `Delivery → ${input.deliveryStatus}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    created_by: input.adminId,
  });

  return (await getOrderById(input.orderId, undefined, true))!;
}
