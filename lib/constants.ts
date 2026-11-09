import type { DeliveryStatus, PaymentMethod, PaymentStatus } from "./types";

export const APP_NAME = "KStore";
export const APP_DESCRIPTION =
  "A single-vendor shop with hand delivery — pay by card or cash at the door.";

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
