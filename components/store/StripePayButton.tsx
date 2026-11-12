"use client";

import { useState } from "react";
import { CreditCard, AlertCircle } from "lucide-react";

export function StripePayButton({
  orderId,
  trackingToken,
}: {
  orderId: string;
  trackingToken?: string;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setIsBusy(true);
    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingToken }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start payment");
      }
      window.location.assign(data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payment failed");
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isBusy}
        onClick={pay}
        data-btn="dark"
        style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
        className="px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <CreditCard className="w-4 h-4 text-[#B78E69]" />
        <span style={{ color: "#FFFFFF" }}>
          {isBusy ? "Initiating Stripe Gateway…" : "Pay Now with Card"}
        </span>
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
