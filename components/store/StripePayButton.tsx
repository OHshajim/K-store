"use client";

import { useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { CreditCardIcon } from "@heroicons/react/24/outline";

export function StripePayButton({
  orderId,
  trackingToken,
}: {
  orderId: string;
  trackingToken?: string;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setIsBusy(true);
    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingToken }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start payment");
      }
      window.location.assign(data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payment failed");
      setIsBusy(false);
    }
  }

  return (
    <VStack gap={2}>
      <Button
        label="Pay now by card"
        variant="primary"
        icon={<CreditCardIcon />}
        isLoading={isBusy}
        onClick={pay}
      />
      {error && <Text type="supporting">{error}</Text>}
    </VStack>
  );
}
