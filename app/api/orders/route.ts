import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { createOrder } from "@/lib/data/orders";
import { sendOrderPlacedEmail } from "@/lib/email/mailer";

const itemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
  image: z.string().nullable(),
  quantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});

const bodySchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6),
  shipping_address: z.string().min(5),
  shipping_city: z.string().min(2),
  shipping_notes: z.string().nullable().optional(),
  payment_method: z.enum([
    "bank_transfer",
    "mobile_money",
    "cash_on_delivery",
  ]),
  items: z.array(itemSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in to place an order" },
        { status: 401 },
      );
    }

    const body = bodySchema.parse(await request.json());
    const settings = await getStoreSettings();
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    const shippingCents =
      settings.free_shipping_over_cents !== null &&
      subtotal >= settings.free_shipping_over_cents
        ? 0
        : settings.shipping_flat_cents;

    const order = await createOrder({
      userId: user.id,
      customerName: body.customer_name,
      customerEmail: body.customer_email,
      customerPhone: body.customer_phone,
      shippingAddress: body.shipping_address,
      shippingCity: body.shipping_city,
      shippingNotes: body.shipping_notes ?? undefined,
      paymentMethod: body.payment_method,
      items: body.items,
      shippingCents,
    });

    try {
      await sendOrderPlacedEmail(order, settings);
    } catch (error) {
      console.error("order email failed", error);
    }

    return NextResponse.json({ order, id: order.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
