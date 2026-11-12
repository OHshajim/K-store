"use client";

import { useCartStore } from "@/lib/cart/store";
import { useCurrencyStore } from "@/lib/currency/store";
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
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
  } = useCartStore();

  const { formatPrice } = useCurrencyStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; err: boolean } | null>(null);

  if (!isCartOpen) return null;

  const { percent, remainingCents, qualified } = freeShippingProgress();
  const subtotal = subtotalCents();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    setCouponFeedback({ msg: res.message, err: !res.success });
    if (res.success) setCouponInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1C18]/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1A1C18]/10 flex items-center justify-between bg-[#F4F0E8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1A1C18]" />
              <h2 className="font-editorial text-2xl font-bold tracking-tight text-[#1A1C18]">
                Shopping Cart
              </h2>
              <span
                data-btn="dark"
                style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                className="text-xs bg-[#1A1C18] text-white px-2 py-0.5 rounded-full font-mono"
              >
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#4A483E] hover:text-[#1A1C18] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#D8C9B5]/30 px-6 py-3 border-b border-[#1A1C18]/10">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#1A1C18]">
              {qualified ? (
                <span className="flex items-center gap-1.5 text-[#8A927A] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  You&apos;ve unlocked Complimentary Express Shipping!
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-[#1A1C18] font-semibold" suppressHydrationWarning>
                    {formatPrice(remainingCents)}
                  </strong>{" "}
                  more for complimentary shipping
                </span>
              )}
              <span className="font-mono text-[#4A483E]">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#D8C9B5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8A927A] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#1A1C18]/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F4F0E8] flex items-center justify-center mb-4 text-[#4A483E]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-[#4A483E] max-w-xs mb-6">
                  Discover our thoughtfully curated furniture, organizers, and decorative lighting.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  data-btn="dark"
                  style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1C18] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-colors shadow-sm"
                >
                  <span style={{ color: "#FFFFFF" }}>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.selectedColor ?? "default"}`} className="py-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[#F4F0E8] shrink-0 border border-[#1A1C18]/10">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#4A483E]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-[#1A1C18] hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedColor)}
                          className="text-[#4A483E] hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.selectedColor && (
                        <p className="text-xs text-[#4A483E] mt-0.5">
                          Color: {item.selectedColor}
                        </p>
                      )}
                      {item.selectedMaterial && (
                        <p className="text-xs text-[#4A483E]">
                          Material: {item.selectedMaterial}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-[#1A1C18]/20 rounded bg-white">
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1, item.selectedColor)
                          }
                          className="px-2.5 py-1 text-sm text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-[#1A1C18]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1, item.selectedColor)
                          }
                          className="px-2.5 py-1 text-sm text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-sm font-semibold text-[#1A1C18]">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-[#1A1C18]/10 p-6 bg-[#F4F0E8] space-y-4">
              {/* Coupon input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-[#8A927A]/30 text-xs">
                    <span className="text-[#8A927A] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Promo {appliedCoupon.code} ({appliedCoupon.discount_percent}% off)
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. NORDEN10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-md border border-[#1A1C18]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1C18]"
                    />
                    <button
                      type="submit"
                      data-btn="dark"
                      style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                      className="px-4 py-2 bg-[#1A1C18] text-white text-xs font-semibold rounded-md hover:bg-[#3d403a] transition-colors cursor-pointer"
                    >
                      <span style={{ color: "#FFFFFF" }}>Apply</span>
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1 ${
                      couponFeedback.err ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </div>

              {/* Subtotal calculation */}
              <div className="space-y-1.5 text-xs text-[#4A483E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#1A1C18] font-medium" suppressHydrationWarning>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discountCents() > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono font-medium" suppressHydrationWarning>
                      -{formatPrice(discountCents())}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-[#1A1C18] font-medium" suppressHydrationWarning>
                    {shippingCents() === 0 ? "Complimentary" : formatPrice(shippingCents())}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#1A1C18] pt-2 border-t border-[#1A1C18]/10">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base" suppressHydrationWarning>{formatPrice(totalCents())}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  data-btn="dark"
                  style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A1C18] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-all shadow-md cursor-pointer"
                >
                  <span style={{ color: "#FFFFFF" }}>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center py-2.5 text-xs font-medium text-[#1A1C18] hover:underline"
                >
                  View Full Cart & Details
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#4A483E] pt-1">
                <ShieldCheck className="w-4 h-4 text-[#8A927A]" />
                <span>30-Day Risk-Free In-Home Trial · Carbon Neutral Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

