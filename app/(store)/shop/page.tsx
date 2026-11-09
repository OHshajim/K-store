import type { Metadata } from "next";
import { getCategories, getProducts, requireStoreSettings } from "@/lib/data/catalog";
import { ShopView } from "@/components/store/ShopView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop All Home & Living Essentials",
  description:
    "Explore our complete Scandinavian catalog of modular storage, architectural side tables, task luminaires, and kitchen stoneware.",
};

type SearchParams = Promise<{ category?: string; room?: string; q?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [settings, categories, products] = await Promise.all([
    requireStoreSettings(),
    getCategories(),
    getProducts(),
  ]);

  return (
    <ShopView
      initialProducts={products}
      categories={categories}
      settings={settings}
      initialCategory={params.category}
      initialRoom={params.room}
      initialQuery={params.q}
    />
  );
}
