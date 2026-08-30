import { getStoreSettings } from "@/lib/data/catalog";
import { CartView } from "@/components/store/CartView";

export default async function CartPage() {
  const settings = await getStoreSettings();
  return <CartView settings={settings} />;
}
