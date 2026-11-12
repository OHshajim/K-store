import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <CategoryManager categories={categories} />
    </div>
  );
}
