import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { getOrderByTracking, getOrderById } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/catalog";
import { getSiteUrl } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const bodySchema = z.object({
  orderId: z.string(),
  trackingToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const settings = await getStoreSettings();
    if (!settings) throw new Error("Store is not configured yet");

    const profile = await getCurrentProfile();
    const order = body.trackingToken
      ? await getOrderByTracking(body.orderId, body.trackingToken)
      : profile
      ? await getOrderById(body.orderId, profile.id)
      : await getOrderById(body.orderId, undefined, true);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "This order is not awaiting payment" },
        { status: 400 },
      );
    }

    const site = getSiteUrl();

    // If Stripe is not configured with a valid secret key, provide a clearly labeled
    // test-mode simulator URL instead of failing
    if (!isStripeConfigured()) {
      return NextResponse.json({
        url: `${site}/api/checkout/stripe/confirm?demo_order_id=${order.id}&session_id=demo_stripe_${Date.now()}`,
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email,
      line_items: [
        ...(order.items ?? []).map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: settings.currency.toLowerCase(),
            unit_amount: item.unit_price_cents,
            product_data: { name: item.product_name },
          },
        })),
        {
          quantity: 1,
          price_data: {
            currency: settings.currency.toLowerCase(),
            unit_amount: order.shipping_cents,
            product_data: { name: "Delivery" },
          },
        },
      ],
      success_url: `${site}/api/checkout/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}${
        order.user_id
          ? `/orders/${order.id}`
          : `/track/${order.order_number}?t=${order.tracking_token}`
      }`,
      metadata: { order_id: order.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
