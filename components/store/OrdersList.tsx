"use client";

import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Button } from "@astryxdesign/core/Button";
import { List, ListItem } from "@astryxdesign/core/List";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import type { Order, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  DeliveryStatusLabel,
  PaymentStatusBadge,
} from "@/components/shared/StatusBadge";

export function OrdersList({
  orders,
  settings,
}: {
  orders: Order[];
  settings: StoreSettings;
}) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your completed orders will appear here."
        actions={<Button label="Shop products" href="/shop" variant="primary" />}
      />
    );
  }

  return (
    <List header="Orders" density="spacious" hasDividers>
      {orders.map((order) => (
        <ListItem
          key={order.id}
          label={`Order ${order.order_number}`}
          href={`/orders/${order.id}`}
          description={
            <HStack gap={2} wrap="wrap" vAlign="center">
              <Text type="supporting" color="secondary">
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
              <PaymentStatusBadge status={order.payment_status} />
              <DeliveryStatusLabel status={order.delivery_status} />
            </HStack>
          }
          endContent={
            <Text type="body" weight="bold">
              {formatMoney(
                order.total_cents,
                settings.currency_symbol,
                settings.currency,
              )}
            </Text>
          }
        />
      ))}
    </List>
  );
}
