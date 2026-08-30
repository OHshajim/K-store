"use client";

import { useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { List, ListItem } from "@astryxdesign/core/List";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Thumbnail } from "@astryxdesign/core/Thumbnail";
import { VStack } from "@astryxdesign/core/VStack";
import {
  CheckCircleIcon,
  CreditCardIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import type { Order, StoreSettings } from "@/lib/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import {
  DeliveryStatusLabel,
  PaymentStatusBadge,
} from "@/components/shared/StatusBadge";

export function OrderDetailView({
  order,
  settings,
  isAdmin = false,
}: {
  order: Order;
  settings: StoreSettings;
  isAdmin?: boolean;
}) {
  const [proof, setProof] = useState<File | null>(null);
  const [reference, setReference] = useState(order.payment_reference ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmitProof =
    order.payment_status === "awaiting_payment" &&
    order.payment_method !== "cash_on_delivery";

  async function submitProof() {
    if (!proof) {
      setError("Select your payment proof before submitting.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("proof", proof);
      formData.append("reference", reference);
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to submit payment proof.");
      window.location.reload();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to submit payment proof.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <HStack gap={2} wrap="wrap" vAlign="center">
          <Text type="display-2" as="h1">
            Order {order.order_number}
          </Text>
          <PaymentStatusBadge status={order.payment_status} />
        </HStack>
        <DeliveryStatusLabel status={order.delivery_status} />
        {isAdmin && (
          <Text type="supporting" color="secondary">
            Admin view
          </Text>
        )}
      </VStack>

      {error && (
        <Banner
          status="error"
          title="Payment proof not submitted"
          description={error}
        />
      )}

      <Grid columns={{ minWidth: 300, repeat: "fit" }} gap={4}>
        <Card padding={4}>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Icon icon={TruckIcon} size="sm" />
              <Text type="large" weight="bold">
                Customer &amp; delivery
              </Text>
            </HStack>
            <MetadataList>
              <MetadataListItem label="Customer">
                {order.customer_name}
              </MetadataListItem>
              <MetadataListItem label="Email">
                {order.customer_email}
              </MetadataListItem>
              <MetadataListItem label="Phone">
                {order.customer_phone}
              </MetadataListItem>
              <MetadataListItem label="Address">
                {order.shipping_address}, {order.shipping_city}
              </MetadataListItem>
              {order.shipping_notes && (
                <MetadataListItem label="Notes">
                  {order.shipping_notes}
                </MetadataListItem>
              )}
              <MetadataListItem label="Payment method">
                {PAYMENT_METHOD_LABELS[order.payment_method]}
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={3}>
            <Text type="large" weight="bold">
              Items
            </Text>
            <List header="Line items" density="compact" hasDividers>
              {(order.items ?? []).map((item) => (
                <ListItem
                  key={item.id}
                  label={item.product_name}
                  description={`${item.quantity} × ${formatMoney(
                    item.unit_price_cents,
                    settings.currency_symbol,
                    settings.currency,
                  )}`}
                  startContent={
                    <Thumbnail
                      src={item.image_url ?? undefined}
                      alt={item.product_name}
                      label={item.product_name}
                    />
                  }
                  endContent={
                    <Text type="body" weight="bold">
                      {formatMoney(
                        item.unit_price_cents * item.quantity,
                        settings.currency_symbol,
                        settings.currency,
                      )}
                    </Text>
                  }
                />
              ))}
            </List>
            <Divider />
            <HStack hAlign="between" vAlign="center">
              <Text type="large" weight="bold">
                Total
              </Text>
              <Text type="large" weight="bold">
                {formatMoney(
                  order.total_cents,
                  settings.currency_symbol,
                  settings.currency,
                )}
              </Text>
            </HStack>
          </VStack>
        </Card>
      </Grid>

      {canSubmitProof && (
        <Card padding={4} variant="muted">
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Icon icon={CreditCardIcon} size="sm" />
              <Text type="large" weight="bold">
                Submit payment proof
              </Text>
            </HStack>
            <Text type="body">{settings.payment_instructions}</Text>
            <FileInput
              label="Payment proof"
              value={proof}
              onChange={(file) =>
                setProof(Array.isArray(file) ? (file[0] ?? null) : file)
              }
              accept="image/*,application/pdf"
              maxSize={4 * 1024 * 1024}
              isRequired
            />
            <TextInput
              label="Payment reference"
              value={reference}
              onChange={setReference}
              isOptional
            />
            <Button
              label="Submit proof"
              variant="primary"
              isLoading={isSubmitting}
              onClick={submitProof}
            />
          </VStack>
        </Card>
      )}

      {order.payment_status === "paid" && (
        <Banner
          status="success"
          title="Payment confirmed"
          description="We are preparing your order for hand delivery."
        />
      )}

      <Card padding={4}>
        <VStack gap={3}>
          <Text type="large" weight="bold">
            Order timeline
          </Text>
          {(order.events ?? []).map((event) => (
            <HStack key={event.id} gap={3} vAlign="start">
              <Icon icon={CheckCircleIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <VStack gap={1}>
                  <Text type="body">{event.message}</Text>
                  <Text type="supporting" color="secondary">
                    {new Date(event.created_at).toLocaleString()}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}
