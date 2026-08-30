import { notFound } from "next/navigation";
import { VStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Text";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/data/catalog";
import { DEMO_PRODUCTS } from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function getProduct(id: string): Promise<Product | null> {
  if (isDemoMode()) {
    return DEMO_PRODUCTS.find((product) => product.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <VStack gap={4} maxWidth={720}>
      <Heading level={1}>Edit product</Heading>
      <ProductForm product={product} categories={categories} />
    </VStack>
  );
}
