import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { getAllOrders } from "@/lib/data/orders";
import { getProducts, getStoreSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [orders, products, settings] = await Promise.all([
    getAllOrders(),
    getProducts(),
    getStoreSettings(),
  ]);

  const awaiting = orders.filter(
    (order) =>
      order.payment_status === "awaiting_payment" ||
      order.payment_status === "proof_submitted" ||
      order.payment_status === "cod_pending",
  ).length;
  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + order.total_cents, 0);

  const stats = [
    { label: "Products", value: String(products.length) },
    { label: "Orders", value: String(orders.length) },
    { label: "Needs attention", value: String(awaiting) },
    {
      label: "Paid revenue",
      value: formatMoney(revenue, settings.currency_symbol, settings.currency),
    },
  ];

  return (
    <VStack gap={5}>
      <VStack gap={1}>
        <Text type="display-2" as="h1">
          Vendor dashboard
        </Text>
        <Text type="body" color="secondary">
          Confirm payments manually and update delivery as you pack and ship.
        </Text>
      </VStack>
      <Grid columns={{ minWidth: 180, max: 4 }} gap={3}>
        {stats.map((stat) => (
          <Card key={stat.label} padding={4} variant="muted">
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                {stat.label}
              </Text>
              <Text type="display-2" as="p">
                {stat.value}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>
    </VStack>
  );
}
