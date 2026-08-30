import { VStack } from "@astryxdesign/core/VStack";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading, Text } from "@astryxdesign/core/Text";
import { CategoryChips } from "@/components/store/CategoryChips";
import { HomeHero } from "@/components/store/HomeHero";
import { ProductGrid } from "@/components/store/ProductGrid";
import {
  getCategories,
  getProducts,
  getStoreSettings,
} from "@/lib/data/catalog";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, featured] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProducts({ featured: true }),
  ]);
  const heroImage = featured.find((product) => product.images[0])?.images[0];

  return (
    <VStack gap={8}>
      <HomeHero
        storeName={settings.store_name}
        tagline={settings.tagline}
        image={heroImage}
      />
      <VStack gap={3}>
        <Text type="label" color="secondary">
          Shop by category
        </Text>
        <CategoryChips categories={categories} />
      </VStack>
      <Divider />
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Featured</Heading>
          <Text type="body" color="secondary">
            Fresh picks from the shop floor.
          </Text>
        </VStack>
        <ProductGrid products={featured} settings={settings} />
      </VStack>
    </VStack>
  );
}
