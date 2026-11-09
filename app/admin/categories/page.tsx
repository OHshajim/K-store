import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data/catalog";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoryManager categories={categories} />;
}
