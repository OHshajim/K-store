import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAdminProducts, getCategories } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAdminProducts(),
  ]);

  const productCounts: Record<string, number> = {};
  for (const cat of categories) {
    productCounts[cat.id] = 0;
  }

  for (const prod of products) {
    if (prod.category_id && productCounts[prod.category_id] !== undefined) {
      productCounts[prod.category_id] += 1;
    } else if (prod.category?.id && productCounts[prod.category.id] !== undefined) {
      productCounts[prod.category.id] += 1;
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <CategoryManager
        initialCategories={categories}
        productCounts={productCounts}
        totalProductsCount={products.length}
      />
    </div>
  );
}
