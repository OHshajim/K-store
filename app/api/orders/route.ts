import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { createOrder } from "@/lib/data/orders";
import { resolvePricedItems, subtotalOfCents } from "@/lib/data/pricing";
import { sendOrderPlacedEmail } from "@/lib/email/mailer";

// The client only declares *what* it wants to buy. Prices, names, stock and
// images are re-resolved from the catalog server-side (lib/data/pricing.ts).
const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6),
  shipping_address: z.string().min(5),
  shipping_city: z.string().min(2),
  shipping_notes: z.string().nullable().optional(),
  payment_method: z.enum(["stripe", "cash_on_delivery"]),
  items: z.array(itemSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    const body = bodySchema.parse(await request.json());
    const settings = await getStoreSettings();
    if (!settings) {
      throw new Error("Store is not configured yet");
    }

    const items = await resolvePricedItems(body.items);
    const subtotal = subtotalOfCents(items);
    const shippingCents =
      settings.free_shipping_over_cents !== null &&
      subtotal >= settings.free_shipping_over_cents
        ? 0
        : settings.shipping_flat_cents;

    const order = await createOrder({
      userId: profile?.id ?? null,
      customerName: body.customer_name,
      customerEmail: body.customer_email,
      customerPhone: body.customer_phone,
      shippingAddress: body.shipping_address,
      shippingCity: body.shipping_city,
      shippingNotes: body.shipping_notes ?? undefined,
      paymentMethod: body.payment_method,
      items,
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
