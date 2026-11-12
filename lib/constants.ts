import type { DeliveryStatus, PaymentMethod, PaymentStatus } from "./types";

export const APP_NAME = "Kstore";
export const APP_TAGLINE = "Modern Living, Simplified.";
export const APP_DESCRIPTION =
  "Thoughtfully designed modern home organization, solid timber furniture, and architectural lighting essentials.";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Card (secure checkout)",
  cash_on_delivery: "Cash on delivery",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  cod_pending: "Cash on delivery",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const DELIVERY_FLOW: DeliveryStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
];

export const PRODUCTS_REVALIDATE_SECONDS = 60;
