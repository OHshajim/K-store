import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { getOrderById } from "@/lib/data/orders";

const lookupSchema = z
  .object({
    orderNumber: z.string().min(1, "Order number is required"),
    email: z.string().optional(),
    customerEmail: z.string().optional(),
  })
  .transform((data) => ({
    orderNumber: data.orderNumber,
    email: (data.email || data.customerEmail || "").trim(),
  }));

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { orderNumber, email } = lookupSchema.parse(json);

    const profile = await getCurrentProfile();
    const isAdmin = profile?.role === "admin" || profile?.role === "manager";

    const cleanNumber = orderNumber.trim();
    const order = await getOrderById(cleanNumber, undefined, true);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please verify the order number on your receipt." },
        { status: 404 }
      );
    }

    const orderEmail = (order.customer_email || "").toLowerCase();
    const isOwnerBySession =
      Boolean(profile) &&
      (order.user_id === profile!.id ||
        (orderEmail && profile!.email?.toLowerCase() === orderEmail));

    // Guests or non-owners must supply a matching billing/shipping email
    if (!isAdmin && !isOwnerBySession) {
      if (!email) {
        return NextResponse.json(
          { error: "Please enter the billing or shipping email associated with this order." },
          { status: 400 }
        );
      }
      if (orderEmail && orderEmail !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "The provided email address does not match this order's billing details." },
          { status: 403 }
        );
      }
    } else if (email && orderEmail && orderEmail !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "The provided email address does not match this order's billing details." },
        { status: 403 }
      );
    }

    const redirectUrl =
      isAdmin || isOwnerBySession
        ? `/orders/${order.id}`
        : `/track/${order.order_number}?t=${order.tracking_token}`;

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        delivery_status: order.delivery_status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        total_cents: order.total_cents,
        item_count: order.items?.length ?? 0,
        events: order.events ?? [],
      },
      redirectUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to look up order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
