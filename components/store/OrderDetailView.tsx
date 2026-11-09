"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { List, ListItem } from "@astryxdesign/core/List";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Thumbnail } from "@astryxdesign/core/Thumbnail";
import { VStack } from "@astryxdesign/core/VStack";
import { CheckCircleIcon, TruckIcon } from "@heroicons/react/24/outline";
import type { Order, StoreSettings } from "@/lib/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  DeliveryStatusText,
  PaymentStatusBadge,
} from "@/components/shared/StatusBadge";
import { StripePayButton } from "@/components/store/StripePayButton";

function PaymentBanner({
  order,
  trackingToken,
}: {
  order: Order;
  trackingToken?: string;
}) {
  if (order.payment_status === "paid") {
    return (
      <Banner
        status="success"
        title="Payment confirmed"
        description="We are preparing your order for hand delivery."
      />
    );
  }
  if (order.payment_method === "cash_on_delivery") {
    return (
      <Banner
        status="info"
        title="Cash on delivery"
        description="Have the exact amount ready — we collect payment at your door."
      />
    );
  }
  return (
    <Banner
      status="warning"
      title="Awaiting payment"
      description="Complete card payment to start processing your order."
      endContent={
        <StripePayButton orderId={order.id} trackingToken={trackingToken} />
      }
    />
  );
}

export function OrderDetailView({
  order,
  settings,
  isAdmin = false,
  trackingToken,
}: {
  order: Order;
  settings: StoreSettings;
  isAdmin?: boolean;
  trackingToken?: string;
}) {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <HStack gap={2} wrap="wrap" vAlign="center">
          <Text type="display-2" as="h1">
            Order {order.order_number}
          </Text>
          <PaymentStatusBadge status={order.payment_status} />
        </HStack>
        <DeliveryStatusText status={order.delivery_status} />
        {isAdmin && (
          <Text type="supporting" color="secondary">
            Admin view
          </Text>
        )}
      </VStack>

      <PaymentBanner order={order} trackingToken={trackingToken} />

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
                    {formatDateTime(event.created_at)}
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
