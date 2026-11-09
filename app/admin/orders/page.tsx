import { VStack } from "@astryxdesign/core/Layout";
import { Heading, Text } from "@astryxdesign/core/Text";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getAllOrders } from "@/lib/data/orderAdmin";
import { requireStoreSettings } from "@/lib/data/catalog";

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    getAllOrders(),
    requireStoreSettings(),
  ]);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Orders</Heading>
        <Text type="body" color="secondary">
          Confirm card payments and advance delivery statuses.
        </Text>
      </VStack>
      <OrdersTable orders={orders} settings={settings} />
    </VStack>
  );
}
