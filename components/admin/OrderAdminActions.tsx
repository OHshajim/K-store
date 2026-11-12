"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  AlertCircle,
  Truck,
  CreditCard,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { DeliveryStatus, Order, PaymentStatus } from "@/lib/types";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  DELIVERY_FLOW,
} from "@/lib/constants";

export function OrderAdminActions({ order }: { order: Order }) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(order.delivery_status);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentFlowIndex = DELIVERY_FLOW.indexOf(deliveryStatus as (typeof DELIVERY_FLOW)[number]);

  async function save() {
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: paymentStatus,
          delivery_status: deliveryStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update order.");
      setSuccessMsg("Fulfillment & payment statuses successfully updated.");
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Update Failed</span>
            {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs sm:text-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Visual Delivery Stepper */}
      <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A927A] flex items-center gap-1.5 font-sans">
            <Truck className="w-3.5 h-3.5" />
            Live Delivery Progression
          </span>
          <span className="text-xs font-mono font-semibold text-[#1A1C18]">
            {DELIVERY_STATUS_LABELS[deliveryStatus] ?? deliveryStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {DELIVERY_FLOW.map((flowStep, idx) => {
            const isCompleted = currentFlowIndex >= idx;
            const isCurrent = currentFlowIndex === idx;

            return (
              <button
                key={flowStep}
                type="button"
                onClick={() => setDeliveryStatus(flowStep)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1A1C18] text-white border-[#1A1C18] shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                    : "bg-white text-[#4A483E] border-[#1A1C18]/10 hover:bg-[#F4F0E8]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isCurrent
                        ? "text-[#B78E69]"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-[#4A483E]/50"
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  {isCompleted && !isCurrent && (
                    <Check className="w-3 h-3 text-emerald-600" />
                  )}
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-[#B78E69] animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold truncate">
                  {DELIVERY_STATUS_LABELS[flowStep]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#B78E69]" />
            Payment Status
          </label>
          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full appearance-none px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-semibold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all cursor-pointer pr-10"
            >
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({value})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#4A483E]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Delivery Status Manual Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#8A927A]" />
            Fulfillment Stage
          </label>
          <div className="relative">
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
              className="w-full appearance-none px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-semibold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all cursor-pointer pr-10"
            >
              {Object.entries(DELIVERY_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#4A483E]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-[#4A483E]/70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
          Updates dispatch emails and customer tracking timelines automatically.
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={save}
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="px-6 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <span style={{ color: "#FFFFFF" }}>
            {isSaving ? "Updating Statuses…" : "Save Fulfillment Status"}
          </span>
        </button>
      </div>
    </div>
  );
}
