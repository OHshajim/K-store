"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import { useCartStore } from "@/lib/cart/store";
import { useCurrencyStore } from "@/lib/currency/store";
import { MOCK_PRODUCTS } from "@/lib/data/mockData";

export function CartView({}: { settings?: StoreSettings | null }) {
  const {
    items,
    setQuantity,
    removeItem,
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    addProduct,
  } = useCartStore();

  const { formatPrice } = useCurrencyStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const { percent, remainingCents, qualified } = freeShippingProgress();
  const subtotal = subtotalCents();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponCode("");
  };

  // Recommended upsell items (items not yet in cart)
  const cartIds = items.map((i) => i.productId);
  const recommendations = MOCK_PRODUCTS.filter((p) => !cartIds.includes(p.id)).slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="py-20 px-4 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#77766E] mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#292B27] mb-3">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-[#77766E] max-w-md mx-auto mb-8 font-sans">
          Your living sanctuary awaits. Explore our collection of architectural furniture, desk stations, and lighting.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#292B27] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-all shadow-md"
        >
          Explore Collection
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Title */}
      <div className="border-b border-[#292B27]/10 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-1">
          Review Order
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#292B27]">
          Your Shopping Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Cart Items & Free Shipping Bar */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Progress Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#292B27]">
              {qualified ? (
                <span className="flex items-center gap-1.5 text-[#8A927A] font-bold">
                  <Sparkles className="w-4 h-4" />
                  Complimentary Shipping Unlocked!
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-[#292B27]">
                    {formatPrice(remainingCents)}
                  </strong>{" "}
                  more to unlock complimentary shipping ($150 minimum)
                </span>
              )}
              <span className="font-mono text-[#77766E]">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8A927A] transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-[#292B27]/10 divide-y divide-[#292B27]/10 shadow-xs overflow-hidden">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor ?? "default"}`}
                className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F4F0E8] shrink-0 border border-[#292B27]/10">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#77766E]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-editorial text-lg sm:text-xl font-bold text-[#292B27] hover:text-[#B78E69] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-[#77766E] font-mono">
                      {formatPrice(item.priceCents)} each
                    </div>
                    {item.selectedColor && (
                      <div className="text-xs text-[#77766E]">
                        Color: <span className="font-medium text-[#292B27]">{item.selectedColor}</span>
                      </div>
                    )}
                    {item.selectedMaterial && (
                      <div className="text-xs text-[#77766E]">
                        Material: <span className="font-medium text-[#292B27]">{item.selectedMaterial}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls & Subtotal */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-0 border-[#292B27]/5">
                  <div className="flex items-center border border-[#292B27]/20 rounded-xl bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1, item.selectedColor)
                      }
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#292B27] hover:bg-[#F4F0E8] rounded-lg cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-[#292B27]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1, item.selectedColor)
                      }
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#292B27] hover:bg-[#F4F0E8] rounded-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-[#292B27]">
                      {formatPrice(item.priceCents * item.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.selectedColor)}
                      className="text-xs text-[#77766E] hover:text-red-600 transition-colors inline-flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Curated Upsells Section */}
          {recommendations.length > 0 && (
            <div className="bg-[#F4F0E8]/60 p-6 rounded-2xl border border-[#292B27]/10 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#77766E] block">
                Recommended Additions for Your Space
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white p-3.5 rounded-xl border border-[#292B27]/10 flex flex-col justify-between"
                  >
                    <div className="flex gap-3 items-center mb-2">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F4F0E8] shrink-0">
                        <Image
                          src={rec.images[0]}
                          alt={rec.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-editorial text-sm font-bold text-[#292B27] truncate">
                          {rec.name}
                        </h5>
                        <p className="font-mono text-xs text-[#77766E]" suppressHydrationWarning>
                          {formatPrice(rec.price_cents)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProduct(rec, 1)}
                      className="w-full py-1.5 px-3 bg-[#F4F0E8] hover:bg-[#292B27] hover:text-white text-[#292B27] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add to Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-md space-y-6">
            <h2 className="font-editorial text-2xl font-bold text-[#292B27]">
              Order Summary
            </h2>

            {/* Coupon Box */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#F4F0E8] px-3.5 py-2.5 rounded-xl border border-[#8A927A]/30 text-xs">
                  <span className="text-[#8A927A] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {appliedCoupon.code} applied ({appliedCoupon.discount_percent}% off)
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promotional code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#292B27]/20 bg-[#F4F0E8]/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <p
                      className={`text-xs ${
                        couponMsg.isError ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Financial Line Items */}
            <div className="space-y-3 text-xs sm:text-sm text-[#77766E] border-t border-[#292B27]/10 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-[#292B27] font-semibold" suppressHydrationWarning>
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountCents() > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Discount</span>
                  <span className="font-mono" suppressHydrationWarning>-{formatPrice(discountCents())}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping & White Glove Delivery</span>
                <span className="font-mono text-[#292B27]" suppressHydrationWarning>
                  {shippingCents() === 0 ? "Complimentary" : formatPrice(shippingCents())}
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-bold text-[#292B27] pt-3 border-t border-[#292B27]/10">
                <span>Estimated Total</span>
                <span className="font-mono" suppressHydrationWarning>{formatPrice(totalCents())}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              className="w-full py-4 bg-[#292B27] text-white hover:bg-[#3d403a] text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 text-xs text-[#77766E] pt-2 border-t border-[#292B27]/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8A927A] shrink-0" />
                <span>30-Day Risk-Free In-Home Return Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8A927A] shrink-0" />
                <span>Fully Insured Carbon-Neutral Courier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
