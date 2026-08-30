import { redirect } from "next/navigation";
import { VStack } from "@astryxdesign/core/VStack";
import { Divider } from "@astryxdesign/core/Divider";
import { Text } from "@astryxdesign/core/Text";
import { getCurrentUser } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { getOrdersForUser } from "@/lib/data/orders";
import { OrdersList } from "@/components/store/OrdersList";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const [settings, orders] = await Promise.all([
    getStoreSettings(),
    getOrdersForUser(user.id),
  ]);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="display-2" as="h1">
          Your orders
        </Text>
        <Text type="body" color="secondary">
          Track payment confirmation and manual delivery updates.
        </Text>
      </VStack>
      <Divider />
      <OrdersList orders={orders} settings={settings} />
    </VStack>
  );
}
