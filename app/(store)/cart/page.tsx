import { getStoreSettings, getProducts } from "@/lib/data/catalog";
import { CartView } from "@/components/store/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [settings, recommendations] = await Promise.all([
    getStoreSettings(),
    getProducts({ featured: true, limit: 6 }),
  ]);
  return <CartView settings={settings} recommendations={recommendations} />;
}
