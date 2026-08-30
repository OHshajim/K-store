import type { DeliveryStatus, PaymentMethod, PaymentStatus } from "./types";

export const APP_NAME = "KStore";
export const APP_DESCRIPTION =
  "A single-vendor store with manual payment confirmation and hand delivery.";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  mobile_money: "Mobile money",
  cash_on_delivery: "Cash on delivery",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  awaiting_payment: "Awaiting payment",
  proof_submitted: "Proof submitted",
  paid: "Paid",
  cod_pending: "COD pending",
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

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const PRODUCTS_REVALIDATE_SECONDS = 60;
