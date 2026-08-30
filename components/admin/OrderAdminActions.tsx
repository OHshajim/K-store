"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { VStack } from "@astryxdesign/core/Layout";
import type { DeliveryStatus, Order, PaymentStatus } from "@/lib/types";
import { DELIVERY_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

export function OrderAdminActions({ order }: { order: Order }) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(order.delivery_status);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: paymentStatus,
          delivery_status: deliveryStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update order.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack gap={3}>
      {error && <Banner status="error" title="Update failed" description={error} />}
      <Selector
        label="Payment status"
        value={paymentStatus}
        onChange={(value) => setPaymentStatus(value as PaymentStatus)}
        options={Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Selector
        label="Delivery status"
        value={deliveryStatus}
        onChange={(value) => setDeliveryStatus(value as DeliveryStatus)}
        options={Object.entries(DELIVERY_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Button label="Save statuses" isLoading={isSaving} onClick={save} />
    </VStack>
  );
}
