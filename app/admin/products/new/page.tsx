import { VStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Text";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/data/catalog";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <VStack gap={4} maxWidth={720}>
      <Heading level={1}>New product</Heading>
      <ProductForm categories={categories} />
    </VStack>
  );
}
