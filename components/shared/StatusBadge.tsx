"use client";

import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import type { DeliveryStatus, PaymentStatus } from "@/lib/types";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const label = PAYMENT_STATUS_LABELS[status] || status;

  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        {label}
      </span>
    );
  }

  if (status === "pending" || status === "cod_pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
      {label}
    </span>
  );
}

export function DeliveryStatusLabel({ status }: { status: DeliveryStatus }) {
  const label = DELIVERY_STATUS_LABELS[status] || status;

  let dotColor = "bg-stone-400";
  let pulse = false;

  switch (status) {
    case "delivered":
      dotColor = "bg-emerald-500";
      break;
    case "out_for_delivery":
      dotColor = "bg-sky-500";
      pulse = true;
      break;
    case "cancelled":
      dotColor = "bg-rose-500";
      break;
    case "packed":
    case "confirmed":
      dotColor = "bg-amber-500";
      break;
    default:
      dotColor = "bg-stone-400";
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#1A1C18]">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{label}</span>
    </span>
  );
}

export function DeliveryStatusText({ status }: { status: DeliveryStatus }) {
  return <DeliveryStatusLabel status={status} />;
}
