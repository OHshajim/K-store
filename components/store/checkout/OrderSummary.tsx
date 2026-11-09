"use client";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { ShieldCheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import type { CartItem, PaymentMethod, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function OrderSummary({
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  settings,
  canSubmit,
  isSubmitting,
  submitLabel = "Place order",
  paymentMethod,
  onSubmit,
}: {
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  settings: StoreSettings;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
  paymentMethod?: PaymentMethod;
  onSubmit: () => void;
}) {
  const money = (cents: number) =>
    formatMoney(cents, settings.currency_symbol, settings.currency);

  return (
    <Card padding={4} variant="muted" className="flex h-full flex-col">
      <VStack gap={4} className="flex-1">
        <HStack gap={2} vAlign="center">
          <Icon icon={ShoppingCartIcon} size="sm" />
          <Text type="large" weight="bold">
            Order summary
          </Text>
        </HStack>
        {items.map((item) => (
          <HStack
            key={item.productId}
            hAlign="between"
            vAlign="start"
            gap={3}
          >
            <StackItem size="fill">
              <Text type="body">
                {item.name} × {item.quantity}
              </Text>
            </StackItem>
            <Text type="body">{money(item.priceCents * item.quantity)}</Text>
          </HStack>
        ))}
        <Divider />
        <HStack hAlign="between">
          <Text type="body" color="secondary">
            Subtotal
          </Text>
          <Text type="body">{money(subtotalCents)}</Text>
        </HStack>
        <HStack hAlign="between">
          <Text type="body" color="secondary">
            Delivery
          </Text>
          <Text type="body">
            {shippingCents === 0 ? "Free" : money(shippingCents)}
          </Text>
        </HStack>
        <HStack
          hAlign="between"
          vAlign="center"
          className="rounded-lg bg-[var(--color-accent-muted)] p-3"
        >
          <Text type="large" weight="bold">
            Total
          </Text>
          <Text type="large" weight="bold" color="accent">
            {money(totalCents)}
          </Text>
        </HStack>
        <VStack gap={2} className="mt-auto">
          <Button
            label={submitLabel}
            variant="primary"
            size="lg"
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
            onClick={onSubmit}
          />
          <HStack gap={2} vAlign="center" hAlign="center">
            <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              {paymentMethod === "cash_on_delivery"
                ? "Pay in cash when your order arrives."
                : "Secure card payment — order confirmed instantly."}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Card>
  );
}
