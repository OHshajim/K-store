"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  AlertCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";

export function OrderLookupTracker({ defaultOrderNumber = "" }: { defaultOrderNumber?: string }) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter your Order Reference (e.g., KS-12345 or order ID).");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found. Please double-check your order number.");
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to look up order.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1C18]/10 shadow-[0_2px_16px_rgba(26,28,24,0.04)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A1C18]/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8A927A] font-semibold block mb-1">
            Instant Order Tracking
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18] tracking-tight">
            Find &amp; Track Your Delivery
          </h2>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 max-w-xl">
            Enter your order reference code from your receipt or confirmation email to check real-time dispatch milestones.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[#1A1C18]/8 text-[#4A483E] text-xs">
          <Truck className="w-4 h-4 text-[#B78E69]" />
          <span>White-Glove Live Timeline</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block">
              Order Reference / ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. KS-B12A89CD or Order UUID"
                className="w-full px-4 py-3 rounded-2xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block">
              Billing or Shipping Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#8A927A]">
            <ShieldCheck className="w-4 h-4 text-[#B78E69]" />
            <span>Direct lookup without requiring account registration</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Locating Order...</span>
            ) : (
              <>
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
