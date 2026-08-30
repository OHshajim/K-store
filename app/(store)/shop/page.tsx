import { VStack } from "@astryxdesign/core/VStack";
import { Divider } from "@astryxdesign/core/Divider";
import { Text } from "@astryxdesign/core/Text";
import { CategoryChips } from "@/components/store/CategoryChips";
import { ProductGrid } from "@/components/store/ProductGrid";
import {
  getCategories,
  getProducts,
  getStoreSettings,
} from "@/lib/data/catalog";

export const revalidate = 60;

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [settings, categories, products] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProducts({
      categorySlug: params.category,
      query: params.q,
    }),
  ]);

  return (
    <VStack gap={5}>
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Shop
        </Text>
        <Text type="body" color="secondary">
          Every piece is made in small batches — checkout with transfer,
          mobile money, or cash on delivery.
        </Text>
      </VStack>
      <CategoryChips categories={categories} activeSlug={params.category} />
      <Divider />
      <ProductGrid products={products} settings={settings} />
    </VStack>
  );
}
