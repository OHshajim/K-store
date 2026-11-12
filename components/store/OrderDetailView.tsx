"use client";

import Image from "next/image";
import {
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { Order, StoreSettings } from "@/lib/types";
import { PAYMENT_METHOD_LABELS, DELIVERY_FLOW, DELIVERY_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StripePayButton } from "@/components/store/StripePayButton";

function PaymentNotice({
  order,
  trackingToken,
}: {
  order: Order;
  trackingToken?: string;
}) {
  if (order.payment_status === "paid") {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              Payment Confirmed &amp; Dispatched
            </h4>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Your transaction has settled. Our workshop is preparing your items for delivery.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 bg-emerald-200/60 text-emerald-800 rounded-full shrink-0">
          Settled
        </span>
      </div>
    );
  }

  if (order.payment_method === "cash_on_delivery") {
    return (
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950">Cash on Delivery</h4>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Please have the exact cash amount ready upon white-glove arrival at your door.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 bg-amber-200/60 text-amber-900 rounded-full shrink-0">
          Due on Arrival
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#B78E69]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#B78E69]/15 flex items-center justify-center text-[#B78E69] shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#1A1C18]">Payment Pending</h4>
          <p className="text-xs text-[#4A483E]/80 mt-0.5">
            Complete your card checkout to release this order to the workshop.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <StripePayButton orderId={order.id} trackingToken={trackingToken} />
      </div>
    </div>
  );
}

export function OrderDetailView({
  order,
  settings,
  isAdmin = false,
  trackingToken,
}: {
  order: Order;
  settings: StoreSettings;
  isAdmin?: boolean;
  trackingToken?: string;
}) {
  const currentFlowIndex = DELIVERY_FLOW.indexOf(
    order.delivery_status as (typeof DELIVERY_FLOW)[number]
  );

  return (
    <div className="space-y-8">
      {/* 1. Header & Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
              <span>Order Receipt</span>
              <span>·</span>
              <span className="text-[#1A1C18] font-bold">#{order.order_number}</span>
              {isAdmin && (
                <>
                  <span>·</span>
                  <span className="text-[#B78E69] font-bold px-2 py-0.5 bg-[#B78E69]/10 rounded-md">
                    Admin View
                  </span>
                </>
              )}
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
              Order #{order.order_number}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 flex items-center gap-1.5 font-sans">
              <Calendar className="w-3.5 h-3.5 text-[#8A927A]" />
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Badge */}
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                order.payment_status === "paid"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : order.payment_status === "cod_pending"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-stone-100 text-stone-700 border border-stone-200"
              }`}
            >
              {order.payment_status === "paid"
                ? "Paid"
                : order.payment_status === "cod_pending"
                ? "COD Due"
                : "Payment Pending"}
            </span>

            {/* Delivery Badge */}
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                order.delivery_status === "delivered"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : order.delivery_status === "out_for_delivery"
                  ? "bg-sky-50 text-sky-800 border border-sky-200"
                  : "bg-[#1A1C18] text-white"
              }`}
            >
              {DELIVERY_STATUS_LABELS[order.delivery_status] ?? order.delivery_status}
            </span>
          </div>
        </div>

        {/* 2. Visual Progress Bar */}
        <div className="pt-4 border-t border-[#1A1C18]/10">
          <div className="flex items-center justify-between text-xs font-bold text-[#8A927A] uppercase tracking-wider mb-3 font-sans">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              White-Glove Delivery Flow
            </span>
            <span className="font-mono text-[#1A1C18]">
              {DELIVERY_STATUS_LABELS[order.delivery_status] ?? order.delivery_status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DELIVERY_FLOW.map((flowStep, idx) => {
              const isCompleted = currentFlowIndex >= idx;
              const isCurrent = currentFlowIndex === idx;

              return (
                <div
                  key={flowStep}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-[#1A1C18] text-white border-[#1A1C18] shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50/80 text-emerald-950 border-emerald-200"
                      : "bg-[#FDFBF7] text-[#4A483E]/60 border-[#1A1C18]/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isCurrent
                          ? "text-[#B78E69]"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-[#4A483E]/40"
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    {isCompleted && !isCurrent && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#B78E69] animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs font-bold truncate">
                    {DELIVERY_STATUS_LABELS[flowStep]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Action / Notice */}
      <PaymentNotice order={order} trackingToken={trackingToken} />

      {/* 2-Column Receipt Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items & Totals (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
              <h3 className="text-base font-bold text-[#1A1C18] flex items-center gap-2 font-sans">
                <ShoppingBag className="w-4 h-4 text-[#B78E69]" />
                Purchased Living Essentials ({order.items?.length ?? 0})
              </h3>
              <span className="text-xs font-mono text-[#8A927A]">
                {order.items?.reduce((sum, item) => sum + item.quantity, 0)} total units
              </span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-[#1A1C18]/10">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/10 shrink-0">
                    <Image
                      src={
                        item.image_url ||
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={item.product_name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#1A1C18] truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-[#4A483E]/70 mt-0.5">
                      Quantity: <span className="font-semibold text-[#1A1C18]">{item.quantity}</span> ×{" "}
                      {formatMoney(
                        item.unit_price_cents,
                        settings.currency_symbol,
                        settings.currency
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#1A1C18]">
                      {formatMoney(
                        item.unit_price_cents * item.quantity,
                        settings.currency_symbol,
                        settings.currency
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="pt-4 border-t border-[#1A1C18]/10 space-y-2.5">
              <div className="flex justify-between text-xs text-[#4A483E]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#1A1C18]">
                  {formatMoney(
                    order.subtotal_cents,
                    settings.currency_symbol,
                    settings.currency
                  )}
                </span>
              </div>

              <div className="flex justify-between text-xs text-[#4A483E]">
                <span>White-Glove Shipping</span>
                <span className="font-semibold text-emerald-700">
                  {order.shipping_cents === 0
                    ? "Complimentary ($0.00)"
                    : formatMoney(
                        order.shipping_cents,
                        settings.currency_symbol,
                        settings.currency
                      )}
                </span>
              </div>

              {order.subtotal_cents + order.shipping_cents > order.total_cents && (
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Promotional Savings</span>
                  <span className="font-semibold">
                    -
                    {formatMoney(
                      order.subtotal_cents + order.shipping_cents - order.total_cents,
                      settings.currency_symbol,
                      settings.currency
                    )}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1A1C18]/10 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-[#1A1C18] block">Total Amount</span>
                  <span className="text-[10px] text-[#4A483E]/70 font-mono">Includes all applicable duties</span>
                </div>
                <span className="font-editorial text-2xl font-bold text-[#1A1C18]">
                  {formatMoney(
                    order.total_cents,
                    settings.currency_symbol,
                    settings.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Destination & Contact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#1A1C18] flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10 font-sans">
              <MapPin className="w-4 h-4 text-[#8A927A]" />
              Shipping Destination
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1C18] block">{order.customer_name}</span>
                  <span className="text-[#4A483E]/70">Recipient</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1C18] block">{order.customer_email}</span>
                  <span className="text-[#4A483E]/70">Tracking notifications sent here</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1C18] block">{order.customer_phone}</span>
                  <span className="text-[#4A483E]/70">Delivery courier contact</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1C18] block leading-relaxed">
                    {order.shipping_address}
                  </span>
                  <span className="text-[#4A483E]/70">{order.shipping_city}</span>
                </div>
              </div>

              {order.shipping_notes && (
                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#1A1C18]/10 text-xs">
                  <span className="font-bold text-[#1A1C18] block mb-1">Delivery Notes:</span>
                  <p className="text-[#4A483E] italic">&ldquo;{order.shipping_notes}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Security Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1A1C18] flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10 font-sans">
              <CreditCard className="w-4 h-4 text-[#B78E69]" />
              Payment Verification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#4A483E]">Payment Method</span>
                <span className="font-bold text-[#1A1C18]">
                  {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#4A483E]">Security Verification</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Encrypted SSL
                </span>
              </div>
            </div>
          </div>

          {/* Historical Timeline if present */}
          {order.events && order.events.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A1C18] flex items-center gap-2 pb-2 border-b border-[#1A1C18]/10 font-sans">
                <Clock className="w-4 h-4 text-[#8A927A]" />
                Event Log History
              </h3>

              <div className="space-y-3">
                {order.events.map((event) => (
                  <div key={event.id} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-[#8A927A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#1A1C18] block">{event.message}</span>
                      <span className="text-[10px] text-[#4A483E]/60 font-mono">
                        {formatDateTime(event.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
