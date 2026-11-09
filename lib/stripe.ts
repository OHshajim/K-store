import Stripe from "stripe";
import { requireServerEnv } from "@/lib/env";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"));
  }
  return client;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
