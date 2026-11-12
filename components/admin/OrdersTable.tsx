"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Truck,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { Order, StoreSettings } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { PaymentStatusBadge, DeliveryStatusLabel } from "@/components/shared/StatusBadge";

export function OrdersTable({
  orders: initialOrders,
  settings,
}: {
  orders: Order[];
  settings: StoreSettings;
}) {
  const [orders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_email.toLowerCase().includes(q) ||
        (order.shipping_city && order.shipping_city.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || order.delivery_status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const totalPaidRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((acc, o) => acc + o.total_cents, 0);

  const pendingCount = orders.filter(
    (o) => o.delivery_status === "pending" || o.delivery_status === "confirmed"
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <span>Fulfillment Pipeline</span>
            <span>·</span>
            <span>Live Dispatch Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            Orders &amp; Shipments
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Track customer checkouts, advance package statuses, and confirm payment settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors"
          >
            ← Back to Overview
          </Link>
        </div>
      </div>

      {/* 2. Orders Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-[#8A927A]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">{orders.length}</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">100% processed</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid Commercial Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">
            {formatMoney(totalPaidRevenue, settings.currency_symbol, settings.currency)}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono">Settled via Stripe &amp; COD</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active in Pipeline</span>
            <Clock className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">{pendingCount} Active</div>
          <div className="text-[10px] text-[#B78E69] font-mono">Requires warehouse dispatch</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">100%</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">Direct courier tracking</div>
        </div>
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A483E]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, customer name, email, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder:text-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A483E] hover:text-[#1A1C18]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF9F6] border border-[#1A1C18]/15 text-xs text-[#1A1C18] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="cod_pending">Cash on Delivery</option>
              <option value="pending">Awaiting Payment</option>
            </select>
          </div>
        </div>

        {/* Delivery Status Tab Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            { id: "pending", label: "Pending", count: orders.filter((o) => o.delivery_status === "pending").length },
            { id: "confirmed", label: "Confirmed", count: orders.filter((o) => o.delivery_status === "confirmed").length },
            { id: "packed", label: "Packed", count: orders.filter((o) => o.delivery_status === "packed").length },
            { id: "out_for_delivery", label: "Out for Delivery", count: orders.filter((o) => o.delivery_status === "out_for_delivery").length },
            { id: "delivered", label: "Delivered", count: orders.filter((o) => o.delivery_status === "delivered").length },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[#1A1C18] text-white"
                    : "bg-stone-100 text-[#4A483E] hover:bg-stone-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Orders Data Table */}
      <div className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1A1C18]/10 bg-[#FAF9F6] text-[#4A483E] uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-3">Order Details</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Delivery Destination</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Fulfillment Status</th>
                <th className="py-3.5 px-3 text-right">Total Amount</th>
                <th className="py-3.5 px-3 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1C18]/8">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#4A483E]">
                    <Truck className="w-8 h-8 mx-auto text-[#8A927A] mb-2" />
                    <div className="font-bold text-[#1A1C18]">No orders found</div>
                    <p className="text-xs text-[#4A483E]/70 mt-1">Try resetting the status filter or search parameters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPaymentFilter("all");
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#1A1C18] text-white text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const initials = order.customer_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const itemCount =
                    order.items?.reduce((acc, i) => acc + i.quantity, 0) || 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Order Number & Timestamp */}
                      <td className="py-3.5 pl-6 pr-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-xs text-[#1A1C18] hover:text-[#B78E69] hover:underline block"
                        >
                          {order.order_number}
                        </Link>
                        <span className="text-[10px] text-[#4A483E]/70 font-mono mt-0.5 block">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Customer Info with Avatar */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-stone-100 border border-[#1A1C18]/10 flex items-center justify-center text-[10px] font-bold text-[#1A1C18] shrink-0">
                            {initials || "CS"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[#1A1C18] block truncate">
                              {order.customer_name}
                            </span>
                            <span className="text-[10px] text-[#4A483E]/70 truncate block">
                              {order.customer_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#1A1C18]">
                          <MapPin className="w-3.5 h-3.5 text-[#8A927A] shrink-0" />
                          <span className="font-medium">{order.shipping_city || "Standard Delivery"}</span>
                        </div>
                        <span className="text-[10px] text-[#4A483E]/70 block mt-0.5">
                          {itemCount} {itemCount === 1 ? "essential" : "essentials"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3">
                        <PaymentStatusBadge status={order.payment_status} />
                        <span className="text-[10px] text-[#4A483E]/60 block font-mono mt-0.5 capitalize">
                          via {order.payment_method.replace("_", " ")}
                        </span>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-3">
                        <DeliveryStatusLabel status={order.delivery_status} />
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-mono font-bold text-xs text-[#1A1C18]">
                          {formatMoney(order.total_cents, settings.currency_symbol, settings.currency)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right pr-6">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#1A1C18] text-[#1A1C18] hover:text-white text-xs font-semibold transition-all"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#FAF9F6] border-t border-[#1A1C18]/10 flex items-center justify-between text-xs text-[#4A483E]">
          <span>
            Displaying <strong>{filteredOrders.length}</strong> orders in dispatch queue
          </span>
          <span className="text-[11px] font-mono text-[#8A927A]">
            Auto-synced with Stripe Webhooks &amp; COD Registry
          </span>
        </div>
      </div>
    </div>
  );
}
