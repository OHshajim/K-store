import { OrdersTable } from "@/components/admin/OrdersTable";
import { getAllOrders } from "@/lib/data/orderAdmin";
import { requireStoreSettings } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    getAllOrders(),
    requireStoreSettings(),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <OrdersTable orders={orders} settings={settings} />
    </div>
  );
}
