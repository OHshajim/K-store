import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  ExternalLink,
  Receipt,
  Sparkles,
} from "lucide-react";
import { OrderAdminActions } from "@/components/admin/OrderAdminActions";
import { OrderDetailView } from "@/components/store/OrderDetailView";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getOrderById } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const [settings, order] = await Promise.all([
    requireStoreSettings(),
    getOrderById(id, undefined, true),
  ]);
  if (!order) notFound();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Breadcrumbs & Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1.5">
            <Link href="/admin/orders" className="hover:text-[#1A1C18] transition-colors">
              Orders
            </Link>
            <span>·</span>
            <span>Fulfillment Console</span>
            <span>·</span>
            <span className="text-[#1A1C18] font-bold">#{order.order_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18] font-editorial flex items-center gap-3">
            <span>Fulfill Order: #{order.order_number}</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] uppercase tracking-wider inline-flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Active Dispatch
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 font-sans">
            Review customer contact, packing list, delivery progression, and payment verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Orders</span>
          </Link>

          <Link
            href={`/orders/${order.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#B78E69] hover:text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Customer View</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 2. Admin Fulfillment & Status Control Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1C18]">
              Fulfillment &amp; Payment Stage Manager
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8A927A] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Instant Synced
          </span>
        </div>
        <OrderAdminActions order={order} />
      </div>

      {/* 3. Detailed Order Receipt & Breakdown */}
      <OrderDetailView order={order} settings={settings} isAdmin />
    </div>
  );
}
