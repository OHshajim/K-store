import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getOrdersForUser } from "@/lib/data/orders";
import { OrdersList } from "@/components/store/OrdersList";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const [settings, orders] = await Promise.all([
    requireStoreSettings(),
    getOrdersForUser(user.id),
  ]);

  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-8 min-h-[75vh]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#1A1C18] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/account" className="hover:text-[#1A1C18] transition-colors">
          Account
        </Link>
        <span>/</span>
        <span className="text-[#1A1C18] font-bold">Orders</span>
      </div>

      {/* Header */}
      <div className="border-b border-[#1A1C18]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] block mb-2 font-sans">
            Client Archive
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
            Order History &amp; Logistics
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 font-sans">
            Track fulfillment status, package dispatch milestones, and digital tax receipts.
          </p>
        </div>
      </div>

      <OrdersList orders={orders} settings={settings} />
    </div>
  );
}
