"use client";

import Link from "next/link";
import { Package, ExternalLink, ArrowRight } from "lucide-react";
import type { Order, StoreSettings } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import {
  DeliveryStatusLabel,
  PaymentStatusBadge,
} from "@/components/shared/StatusBadge";

export function OrdersList({
  orders,
  settings,
}: {
  orders: Order[];
  settings: StoreSettings;
}) {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#1A1C18]/10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F4F0E8] text-[#8A927A] flex items-center justify-center mx-auto border border-[#1A1C18]/10">
          <Package className="w-7 h-7 text-[#B78E69]" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-editorial text-2xl font-bold text-[#1A1C18]">
            No Orders Placed Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans max-w-sm mx-auto">
            Your architectural orders and live dispatch timelines will appear here. Explore our essentials to begin.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/shop"
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs"
          >
            <span style={{ color: "#FFFFFF" }}>Explore Living Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#1A1C18] border border-[#1A1C18]/8 shrink-0">
              <Package className="w-5 h-5 text-[#B78E69]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-[#1A1C18]">
                  #{order.order_number}
                </span>
                <PaymentStatusBadge status={order.payment_status} />
                <DeliveryStatusLabel status={order.delivery_status} />
              </div>
              <div className="text-[11px] text-[#4A483E]/80 flex items-center gap-2 font-mono">
                <span>{formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1A1C18]/8">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#8A927A] uppercase tracking-wider">
                Total
              </div>
              <div className="font-editorial text-xl font-bold text-[#1A1C18]">
                {formatMoney(
                  order.total_cents,
                  settings.currency_symbol,
                  settings.currency,
                )}
              </div>
            </div>

            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors"
            >
              <span>View Order</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8A927A]" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
