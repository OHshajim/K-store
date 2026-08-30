import { notFound } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Text";
import { OrderAdminActions } from "@/components/admin/OrderAdminActions";
import { OrderDetailView } from "@/components/store/OrderDetailView";
import { getStoreSettings } from "@/lib/data/catalog";
import { getOrderById } from "@/lib/data/orders";

type Params = Promise<{ id: string }>;

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const [settings, order] = await Promise.all([
    getStoreSettings(),
    getOrderById(id, undefined, true),
  ]);
  if (!order) notFound();

  return (
    <VStack gap={5}>
      <Heading level={1}>Fulfill order</Heading>
      <Card padding={4}>
        <OrderAdminActions order={order} />
      </Card>
      <OrderDetailView order={order} settings={settings} isAdmin />
    </VStack>
  );
}
