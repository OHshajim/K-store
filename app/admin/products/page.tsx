import { getProducts, requireStoreSettings } from "@/lib/data/catalog";
import { ProductListManager } from "@/components/admin/ProductListManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    requireStoreSettings(),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <ProductListManager products={products} settings={settings} />
    </div>
  );
}
