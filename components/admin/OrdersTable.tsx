"use client";

import { List, ListItem } from "@astryxdesign/core/List";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import type { Order, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { DeliveryStatusLabel, PaymentStatusBadge } from "@/components/shared/StatusBadge";

export function OrdersTable({
  orders,
  settings,
}: {
  orders: Order[];
  settings: StoreSettings;
}) {
  return (
    <List density="spacious">
      {orders.map((order) => (
        <ListItem
          key={order.id}
          href={`/admin/orders/${order.id}`}
          label={`${order.order_number} · ${order.customer_name}`}
          description={
            <VStack gap={1}>
              <Text type="supporting" color="secondary">{order.customer_email}</Text>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <PaymentStatusBadge status={order.payment_status} />
                <DeliveryStatusLabel status={order.delivery_status} />
              </HStack>
            </VStack>
          }
          endContent={
            <Text type="body" weight="bold">
              {formatMoney(order.total_cents, settings.currency_symbol, settings.currency)}
            </Text>
          }
        />
      ))}
    </List>
  );
}
