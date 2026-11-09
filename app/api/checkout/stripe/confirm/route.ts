import { NextResponse } from "next/server";
import { markOrderPaid, getOrderById } from "@/lib/data/orders";
import { getSiteUrl } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const demoOrderId = searchParams.get("demo_order_id");
  const site = getSiteUrl();

  // Handle development / demonstration mode when Stripe keys are not set
  if (demoOrderId && (!isStripeConfigured() || sessionId?.startsWith("demo_stripe_"))) {
    const paidOrder = await markOrderPaid(demoOrderId, sessionId || `demo_${Date.now()}`);
    const order = paidOrder || (await getOrderById(demoOrderId, undefined, true));
    if (order) {
      const dest = order.user_id
        ? `/orders/${order.id}?paid=1&demo=1`
        : `/track/${order.order_number}?t=${order.tracking_token}&paid=1&demo=1`;
      return NextResponse.redirect(`${site}${dest}`);
    }
  }

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/orders`);
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.order_id;

    if (session.payment_status !== "paid" || !orderId) {
      return NextResponse.redirect(`${origin}/orders`);
    }

    const order = await markOrderPaid(orderId, session.id);
    if (!order) {
      return NextResponse.redirect(`${origin}/orders`);
    }

    const destination = order.user_id
      ? `/orders/${order.id}?paid=1`
      : `/track/${order.order_number}?t=${order.tracking_token}&paid=1`;
    return NextResponse.redirect(`${site}${destination}`);
  } catch (error) {
    console.error("stripe confirm failed", error);
    return NextResponse.redirect(`${origin}/orders`);
  }
}
