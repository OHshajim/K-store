import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderById } from "@/lib/data/orders";

const lookupSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { orderNumber, email } = lookupSchema.parse(json);

    const cleanNumber = orderNumber.trim();
    const order = await getOrderById(cleanNumber);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please verify the order number on your receipt." },
        { status: 404 }
      );
    }

    // If an email was provided, check whether it matches either customer_email or shipping
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const orderEmail = (order.customer_email || "").toLowerCase();
      if (orderEmail && orderEmail !== cleanEmail) {
        return NextResponse.json(
          { error: "The provided email address does not match this order's billing details." },
          { status: 403 }
        );
      }
    }

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
      },
      redirectUrl: `/orders/${order.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to look up order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
