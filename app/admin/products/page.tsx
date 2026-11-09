import { Button } from "@astryxdesign/core/Button";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Heading, Text } from "@astryxdesign/core/Text";
import { List, ListItem } from "@astryxdesign/core/List";
import { Badge } from "@astryxdesign/core/Badge";
import Link from "next/link";
import { requireStoreSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export default async function AdminProductsPage() {
  const [products, settings] = await Promise.all([
    getAdminProducts(),
    requireStoreSettings(),
  ]);

  return (
    <VStack gap={4}>
      <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>Products</Heading>
          <Text type="body" color="secondary">
            Manage catalog inventory for your single storefront.
          </Text>
        </VStack>
        <Link href="/admin/products/new">
          <Button label="Add product" variant="primary" />
        </Link>
      </HStack>
      <List header="Catalog" hasDividers density="compact">
        {products.map((product) => (
          <ListItem
            key={product.id}
            label={product.name}
            description={formatMoney(
              product.price_cents,
              settings.currency_symbol,
              settings.currency,
            )}
            href={`/admin/products/${product.id}`}
            endContent={
              <HStack gap={2}>
                {!product.is_active && (
                  <Badge label="Hidden" variant="warning" />
                )}
                <Text type="supporting">Stock {product.stock}</Text>
              </HStack>
            }
          />
        ))}
      </List>
    </VStack>
  );
}
