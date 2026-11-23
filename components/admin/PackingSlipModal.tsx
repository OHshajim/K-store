"use client";

import { useEffect } from "react";
import { Printer, X, CheckSquare, Package, Truck, MapPin } from "lucide-react";
import type { Order, StoreSettings } from "@/lib/types";
import { PAYMENT_METHOD_LABELS, DELIVERY_STATUS_LABELS } from "@/lib/constants";

export function PackingSlipModal({
  isOpen,
  onClose,
  order,
  settings,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  settings?: StoreSettings | null;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Screen Backdrop (Hidden in print) */}
      <div
        className="fixed inset-0 bg-[#1A1C18]/60 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 print:p-0 print:block">
        <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#1A1C18]/10 overflow-hidden font-sans print:shadow-none print:border-none print:rounded-none print:max-w-none">
          {/* Top Control Bar (Screen Only) */}
          <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#1A1C18]/10 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#B78E69]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
                Warehouse Packing Slip Preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1C18] text-white hover:bg-[#B78E69] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-500 hover:text-[#1A1C18] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Packing Slip Sheet */}
          <div className="p-8 sm:p-12 text-[#1A1C18] bg-white print:p-6">
            {/* Header with simulated Barcode */}
            <div className="flex items-start justify-between pb-8 border-b-2 border-[#1A1C18] gap-6">
              <div>
                <div className="text-2xl font-serif font-black tracking-tight text-[#1A1C18] uppercase">
                  {settings?.store_name || "Kstore"} Atelier
                </div>
                <div className="text-xs text-[#77766E] uppercase tracking-widest mt-0.5">
                  Warehouse Fulfillment &amp; Dispatch Order
                </div>
                <div className="text-xs text-[#77766E] mt-2">
                  <span>Support: {settings?.support_email || "concierge@kstore.com"}</span>
                </div>
              </div>

              {/* Simulated Barcode */}
              <div className="text-right flex flex-col items-end">
                <div className="text-xs font-mono font-bold text-[#1A1C18] tracking-widest mb-1">
                  ORDER #{order.order_number}
                </div>
                {/* CSS Barcode simulation */}
                <div className="flex items-center gap-[2px] h-10 px-2 py-1 bg-white border border-black/20" aria-hidden="true">
                  <span className="w-[2px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                  <span className="w-[3px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                  <span className="w-[2px] h-8 bg-black" />
                  <span className="w-[4px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                  <span className="w-[2px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                  <span className="w-[3px] h-8 bg-black" />
                  <span className="w-[2px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                  <span className="w-[4px] h-8 bg-black" />
                  <span className="w-[2px] h-8 bg-black" />
                  <span className="w-[1px] h-8 bg-black" />
                </div>
                <div className="text-[10px] font-mono text-[#77766E] mt-1">
                  ID: {order.id.slice(0, 18)}
                </div>
              </div>
            </div>

            {/* Logistics & Recipient Details */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-[#1A1C18]/15 text-xs">
              {/* Ship To */}
              <div className="space-y-1.5">
                <div className="font-bold uppercase tracking-wider text-[#77766E] text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B78E69]" />
                  <span>Ship To / Recipient</span>
                </div>
                <div className="text-sm font-bold text-[#1A1C18]">
                  {order.customer_name || "Valued Patron"}
                </div>
                <div className="text-[#4A483E] leading-relaxed">
                  <div>{order.shipping_address}</div>
                  <div className="font-semibold">{order.shipping_city}</div>
                  {order.customer_phone && (
                    <div className="mt-1 font-mono text-[11px] text-[#77766E]">
                      Phone: {order.customer_phone}
                    </div>
                  )}
                  {order.customer_email && (
                    <div className="font-mono text-[11px] text-[#77766E]">
                      Email: {order.customer_email}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Meta */}
              <div className="space-y-2">
                <div className="font-bold uppercase tracking-wider text-[#77766E] text-[10px] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#8A927A]" />
                  <span>Fulfillment Instructions</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#77766E] block text-[10px]">Order Date:</span>
                    <span className="font-mono font-semibold">{formattedDate}</span>
                  </div>
                  <div>
                    <span className="text-[#77766E] block text-[10px]">Service Level:</span>
                    <span className="font-semibold text-emerald-800">White Glove Delivery</span>
                  </div>
                  <div>
                    <span className="text-[#77766E] block text-[10px]">Payment Method:</span>
                    <span className="font-semibold capitalize">
                      {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77766E] block text-[10px]">Delivery State:</span>
                    <span className="font-mono font-semibold">
                      {DELIVERY_STATUS_LABELS[order.delivery_status] ?? order.delivery_status}
                    </span>
                  </div>
                </div>

                {/* Delivery Notes / Special Instructions Highlight Box */}
                {order.shipping_notes && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800">
                      Patron Delivery Notes:
                    </span>
                    <p className="mt-0.5 italic">&quot;{order.shipping_notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pick & Pack Checklist Table */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#8A927A]" />
                  <span>Items to Pick &amp; Pack ({order.items?.length || 0})</span>
                </span>
                <span className="text-xs text-[#77766E] font-mono">
                  Total Items: {order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0}
                </span>
              </div>

              <table className="w-full text-left text-xs border border-[#1A1C18]/15 rounded-xl overflow-hidden">
                <thead className="bg-[#FAF9F6] border-b border-[#1A1C18]/15 text-[#77766E] uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">Verify</th>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1C18]/10">
                  {(order.items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      {/* Checkbox square */}
                      <td className="px-4 py-3 text-center">
                        <div className="w-4 h-4 mx-auto rounded border-2 border-[#1A1C18] bg-white" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#1A1C18]">{item.product_name}</div>
                        {(item.selected_color || item.selected_material || item.product_slug) && (
                          <div className="text-[11px] text-[#77766E] font-mono mt-0.5 space-x-1">
                            {item.selected_color && <span>Color: {item.selected_color}</span>}
                            {item.selected_color && item.selected_material && <span>·</span>}
                            {item.selected_material && <span>Finish: {item.selected_material}</span>}
                            {item.product_slug && <span className="text-stone-400">({item.product_slug})</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#77766E]">
                        ${(item.unit_price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1C18]">
                        ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Dispatch Sign-Off */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#1A1C18]/15 text-xs">
              {/* Warehouse Signatures */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#77766E]">
                  Warehouse Quality Assurance
                </div>
                <div className="space-y-3 font-mono text-[11px] text-[#4A483E]">
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-[#77766E]">Inspected &amp; Packed By:</span>
                    <div className="border-b border-[#1A1C18]/30 flex-1 h-4" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-[#77766E]">Dispatch Date:</span>
                    <div className="border-b border-[#1A1C18]/30 flex-1 h-4" />
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-right font-mono text-xs">
                <div className="flex justify-between text-[#77766E]">
                  <span>Subtotal:</span>
                  <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#77766E]">
                  <span>Shipping:</span>
                  <span>
                    {order.shipping_cents === 0
                      ? "Complimentary"
                      : `$${(order.shipping_cents / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1A1C18] pt-2 border-t border-[#1A1C18]/15">
                  <span>Grand Total:</span>
                  <span>${(order.total_cents / 100).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-stone-500 pt-1">
                  Payment Status: <strong className="uppercase">{order.payment_status}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Warranty Statement */}
            <div className="mt-8 pt-4 border-t border-[#1A1C18]/10 text-center text-[10px] text-[#77766E] uppercase tracking-wider font-mono">
              Thank you for choosing {settings?.store_name || "Kstore"} · 10-Year Craft Integrity Warranty on all solid timber joinery.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
