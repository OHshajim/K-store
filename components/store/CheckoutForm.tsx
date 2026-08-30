"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Stack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import type { PaymentMethod, StoreSettings } from "@/lib/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";

const PAYMENT_ICONS: Record<PaymentMethod, typeof CreditCardIcon> = {
  bank_transfer: CreditCardIcon,
  mobile_money: DevicePhoneMobileIcon,
  cash_on_delivery: BanknotesIcon,
};

const PAYMENT_DESCRIPTIONS: Record<PaymentMethod, string> = {
  bank_transfer: "Transfer the total, then upload your receipt.",
  mobile_money: "Send via mobile money and share the reference.",
  cash_on_delivery: "Pay in cash when your order arrives.",
};

export function CheckoutForm({
  settings,
  userEmail,
  userName,
}: {
  settings: StoreSettings;
  userEmail?: string | null;
  userName?: string | null;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotalCents());
  const clear = useCartStore((state) => state.clear);
  const [name, setName] = useState(userName ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("bank_transfer");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shipping =
    settings.free_shipping_over_cents !== null &&
    subtotal >= settings.free_shipping_over_cents
      ? 0
      : settings.shipping_flat_cents;
  const total = subtotal + shipping;
  const canSubmit = Boolean(userEmail) && items.length > 0;

  async function submitOrder() {
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          shipping_address: address,
          shipping_city: city,
          shipping_notes: notes || null,
          payment_method: paymentMethod,
          items,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to create your order.");
      clear();
      router.push(`/orders/${data.order?.id ?? data.id}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create your order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={5}>
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Checkout
        </Text>
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <Text type="body" color="secondary">
            Manual payment confirmation and hand delivery — no card details
            collected.
          </Text>
        </HStack>
      </VStack>

      {!userEmail && (
        <Banner
          status="warning"
          title="Sign in to check out"
          description="Sign in so we can email your confirmation and delivery updates."
          endContent={
            <Button label="Sign in" href="/login?next=/checkout" size="sm" />
          }
        />
      )}
      {error && (
        <Banner status="error" title="Checkout failed" description={error} />
      )}

      <Stack
        direction={isMobile ? "vertical" : "horizontal"}
        gap={6}
        vAlign="start"
      >
        <StackItem size="fill">
          <VStack gap={6}>
            <VStack gap={3}>
              <Text type="large" weight="bold">
                Contact information
              </Text>
              <TextInput
                size="lg"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                isRequired
              />
              <Grid columns={2} gap={3}>
                <TextInput
                  size="lg"
                  label="Full name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={setName}
                  isRequired
                />
                <TextInput
                  size="lg"
                  label="Phone"
                  placeholder="+1 555 0100"
                  value={phone}
                  onChange={setPhone}
                  labelTooltip="We call or text delivery updates."
                  isRequired
                />
              </Grid>
            </VStack>

            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Icon icon={TruckIcon} size="sm" />
                <Text type="large" weight="bold">
                  Delivery address
                </Text>
              </HStack>
              <TextInput
                size="lg"
                label="Address"
                placeholder="Street, building, apartment"
                value={address}
                onChange={setAddress}
                isRequired
              />
              <Grid columns={2} gap={3}>
                <TextInput
                  size="lg"
                  label="City"
                  placeholder="City"
                  value={city}
                  onChange={setCity}
                  isRequired
                />
                <TextArea
                  label="Delivery notes"
                  placeholder="Landmark, preferred time…"
                  value={notes}
                  onChange={setNotes}
                  isOptional
                />
              </Grid>
            </VStack>

            <VStack gap={3}>
              <Text type="large" weight="bold">
                Payment method
              </Text>
              <RadioList
                label="Payment method"
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                {(
                  Object.entries(PAYMENT_METHOD_LABELS) as [
                    PaymentMethod,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <RadioListItem
                    key={value}
                    value={value}
                    label={label}
                    description={PAYMENT_DESCRIPTIONS[value]}
                  />
                ))}
              </RadioList>
              {paymentMethod !== "cash_on_delivery" && (
                <Card padding={4} variant="muted">
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={PAYMENT_ICONS[paymentMethod]} size="sm" />
                      <Text type="label">
                        {PAYMENT_METHOD_LABELS[paymentMethod]} instructions
                      </Text>
                    </HStack>
                    <Text type="body">{settings.payment_instructions}</Text>
                    {paymentMethod === "bank_transfer" &&
                      settings.bank_account_number && (
                        <Text type="supporting" color="secondary">
                          {settings.bank_name} · {settings.bank_account_name} ·{" "}
                          {settings.bank_account_number}
                        </Text>
                      )}
                    {paymentMethod === "mobile_money" &&
                      settings.mobile_money_number && (
                        <Text type="supporting" color="secondary">
                          {settings.mobile_money_name} ·{" "}
                          {settings.mobile_money_number}
                        </Text>
                      )}
                  </VStack>
                </Card>
              )}
            </VStack>
          </VStack>
        </StackItem>

        <StackItem size="fill">
          <Card padding={4}>
            <VStack gap={3}>
              <Text type="large" weight="bold">
                Order summary
              </Text>
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
                  <Text type="body">
                    {formatMoney(
                      item.priceCents * item.quantity,
                      settings.currency_symbol,
                      settings.currency,
                    )}
                  </Text>
                </HStack>
              ))}
              <Divider />
              <HStack hAlign="between">
                <Text type="body" color="secondary">
                  Subtotal
                </Text>
                <Text type="body">
                  {formatMoney(
                    subtotal,
                    settings.currency_symbol,
                    settings.currency,
                  )}
                </Text>
              </HStack>
              <HStack hAlign="between">
                <Text type="body" color="secondary">
                  Delivery
                </Text>
                <Text type="body">
                  {shipping === 0
                    ? "Free"
                    : formatMoney(
                        shipping,
                        settings.currency_symbol,
                        settings.currency,
                      )}
                </Text>
              </HStack>
              <HStack hAlign="between" vAlign="center">
                <Text type="large" weight="bold">
                  Total
                </Text>
                <Text type="large" weight="bold">
                  {formatMoney(
                    total,
                    settings.currency_symbol,
                    settings.currency,
                  )}
                </Text>
              </HStack>
              <Button
                label="Place order"
                variant="primary"
                size="lg"
                isDisabled={!canSubmit}
                isLoading={isSubmitting}
                onClick={submitOrder}
              />
              <Text type="supporting" color="secondary">
                You will upload payment proof after checkout if you chose
                transfer or mobile money.
              </Text>
            </VStack>
          </Card>
        </StackItem>
      </Stack>
    </VStack>
  );
}
