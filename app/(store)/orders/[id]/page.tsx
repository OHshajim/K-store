import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { getOrderById } from "@/lib/data/orders";
import { OrderDetailView } from "@/components/store/OrderDetailView";

type Params = Promise<{ id: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${id}`);

  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";
  const [settings, order] = await Promise.all([
    getStoreSettings(),
    getOrderById(id, user.id, isAdmin),
  ]);

  if (!order) notFound();
  return (
    <OrderDetailView order={order} settings={settings} isAdmin={isAdmin} />
  );
}
