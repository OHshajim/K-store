import { NextResponse } from "next/server";
import { markOrderPaid, getOrderById } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/catalog";
import { sendOrderStatusEmail } from "@/lib/email/mailer";
import { getSiteUrl } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const SYSTEM_GUEST_USER_ID = "86f1777f-552c-4211-bfd4-8bffc3a77abb";

function destinationForOrder(order: {
  id: string;
  order_number: string;
  tracking_token: string;
  user_id: string | null;
}, extraQuery: string) {
  const isRegisteredUser =
    Boolean(order.user_id) && order.user_id !== SYSTEM_GUEST_USER_ID;
  return isRegisteredUser
    ? `/orders/${order.id}?${extraQuery}`
    : `/track/${order.order_number}?t=${order.tracking_token}&${extraQuery}`;
}

async function notifyPaymentConfirmed(order: Awaited<ReturnType<typeof getOrderById>>) {
  if (!order) return;
  try {
    const settings = await getStoreSettings();
    await sendOrderStatusEmail(
      order,
      settings,
      "Your card payment has been verified and your order is confirmed for studio preparation."
    );
  } catch (err) {
    console.warn("Stripe confirmation email notice:", err);
  }
}

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
      await notifyPaymentConfirmed(order);
      return NextResponse.redirect(`${site}${destinationForOrder(order, "paid=1&demo=1")}`);
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

    await notifyPaymentConfirmed(order);
    return NextResponse.redirect(`${site}${destinationForOrder(order, "paid=1")}`);
  } catch (error) {
    console.error("stripe confirm failed", error);
    return NextResponse.redirect(`${origin}/orders`);
  }
}
