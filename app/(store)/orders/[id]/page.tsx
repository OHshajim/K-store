import { notFound } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getOrderById } from "@/lib/data/orders";
import { OrderDetailView } from "@/components/store/OrderDetailView";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ t?: string; canceled?: string }>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  const [settings, order] = await Promise.all([
    requireStoreSettings(),
    getOrderById(id, user?.id, isAdmin, t, user?.email),
  ]);

  if (!order) notFound();
  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-8 min-h-[75vh]">
      <OrderDetailView
        order={order}
        settings={settings}
        isAdmin={isAdmin}
        trackingToken={t || order.tracking_token}
      />
    </div>
  );
}
