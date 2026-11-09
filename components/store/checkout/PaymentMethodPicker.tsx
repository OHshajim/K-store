"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { BanknotesIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import type { PaymentMethod, StoreSettings } from "@/lib/types";

const METHOD_HINTS: Record<PaymentMethod, string> = {
  stripe: "Pay securely by card — order confirmed instantly.",
  cash_on_delivery: "Pay in cash when your order arrives at your door.",
};

export function PaymentMethodPicker({
  value,
  onChange,
  settings,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  settings: StoreSettings;
}) {
  return (
    <VStack gap={3}>
      <Text type="large" weight="bold">
        Payment method
      </Text>
      <RadioList
        label="Payment method"
        value={value}
        onChange={(next) => onChange(next as PaymentMethod)}
      >
        <RadioListItem
          value="stripe"
          label="Card (secure checkout)"
          description={METHOD_HINTS.stripe}
        />
        <RadioListItem
          value="cash_on_delivery"
          label="Cash on delivery"
          description={METHOD_HINTS.cash_on_delivery}
        />
      </RadioList>
      {value === "stripe" && (
        <Card padding={4} variant="muted">
          <HStack gap={2} vAlign="center">
            <Icon icon={CreditCardIcon} size="sm" />
            <Text type="supporting" color="secondary">
              You&apos;ll be redirected to Stripe&apos;s secure payment page and brought straight back after paying.
            </Text>
          </HStack>
        </Card>
      )}
      {value === "cash_on_delivery" && (
        <Card padding={4} variant="muted">
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={BanknotesIcon} size="sm" />
              <Text type="label">Cash on delivery</Text>
            </HStack>
            <Text type="body">{settings.delivery_notes}</Text>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}
