"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/Layout";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import type { DeliveryStatus, PaymentStatus } from "@/lib/types";

function paymentVariant(
  status: PaymentStatus,
): "neutral" | "info" | "success" | "warning" | "error" {
  switch (status) {
    case "paid":
      return "success";
    case "proof_submitted":
    case "cod_pending":
      return "warning";
    case "cancelled":
    case "refunded":
      return "error";
    default:
      return "info";
  }
}

function deliveryDot(
  status: DeliveryStatus,
): "neutral" | "accent" | "success" | "warning" | "error" {
  switch (status) {
    case "delivered":
      return "success";
    case "out_for_delivery":
      return "accent";
    case "cancelled":
      return "error";
    case "packed":
    case "confirmed":
      return "warning";
    default:
      return "neutral";
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      label={PAYMENT_STATUS_LABELS[status]}
      variant={paymentVariant(status)}
    />
  );
}

export function DeliveryStatusLabel({ status }: { status: DeliveryStatus }) {
  return (
    <StatusDot
      variant={deliveryDot(status)}
      label={DELIVERY_STATUS_LABELS[status]}
      isPulsing={status === "out_for_delivery"}
    />
  );
}

export function DeliveryStatusText({ status }: { status: DeliveryStatus }) {
  return (
    <HStack gap={2} vAlign="center">
      <DeliveryStatusLabel status={status} />
      <Text type="body">{DELIVERY_STATUS_LABELS[status]}</Text>
    </HStack>
  );
}
