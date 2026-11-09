import { Heading, Text } from "@astryxdesign/core/Text";
import { List, ListItem } from "@astryxdesign/core/List";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { getCustomerSummaries } from "@/lib/data/orderAdmin";
import { formatMoney } from "@/lib/format";
import { getStoreSettings } from "@/lib/data/catalog";

export default async function AdminUsersPage() {
  const [customers, settings] = await Promise.all([
    getCustomerSummaries(),
    getStoreSettings(),
  ]);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Users</Heading>
        <Text type="body" color="secondary">
          Registered accounts with their order activity.
        </Text>
      </VStack>
      <List header="Customers" hasDividers>
        {customers.map((customer) => (
          <ListItem
            key={customer.id}
            label={customer.full_name || customer.email}
            description={customer.email}
            endContent={
              <VStack gap={1} hAlign="end">
                <HStack gap={2}>
                  <Badge
                    label={customer.role === "admin" ? "Admin" : "Customer"}
                    variant={customer.role === "admin" ? "info" : "neutral"}
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  {customer.order_count} orders ·{" "}
                  {formatMoney(
                    customer.spent_cents,
                    settings?.currency_symbol ?? "$",
                    settings?.currency ?? "USD",
                  )}{" "}
                  paid
                </Text>
              </VStack>
            }
          />
        ))}
      </List>
    </VStack>
  );
}
