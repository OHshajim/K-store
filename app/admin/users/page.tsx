import { getCustomerSummaries } from "@/lib/data/orderAdmin";
import { getStoreSettings } from "@/lib/data/catalog";
import { UserManager } from "@/components/admin/UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [customers, settings] = await Promise.all([
    getCustomerSummaries(),
    getStoreSettings(),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <UserManager customers={customers} settings={settings} />
    </div>
  );
}
