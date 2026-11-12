"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";
import type { PaymentMethod, StoreSettings } from "@/lib/types";
import { useCartStore } from "@/lib/cart/store";
import { useCurrencyStore } from "@/lib/currency/store";

export function CheckoutForm({
  userEmail,
  userName,
}: {
  settings?: StoreSettings;
  userEmail?: string | null;
  userName?: string | null;
}) {
  const router = useRouter();
  const {
    items,
    clear,
    subtotalCents,
    discountCents,
    shippingCents,
    appliedCoupon,
  } = useCartStore();

  const { formatPrice, currency } = useCurrencyStore();

  // Multi-step state: 1: Contact, 2: Shipping, 3: Delivery Options, 4: Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [firstName, setFirstName] = useState(userName ? userName.split(" ")[0] : "");
  const [lastName, setLastName] = useState(userName ? userName.split(" ").slice(1).join(" ") : "");
  const [address, setAddress] = useState("452 Scandinavian Way, Suite 4B");
  const [city, setCity] = useState("New York");
  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("10012");
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");
  const [shippingNotes, setShippingNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = subtotalCents();
  const baseShipping = shippingCents();
  const deliveryExtra = deliveryOption === "express" ? 2500 : 0; // $25.00 for express
  const finalShipping = baseShipping + deliveryExtra;
  const discount = discountCents();
  const grandTotal = Math.max(0, subtotal - discount + finalShipping);

  const fullName = `${firstName} ${lastName}`.trim();

  const handleCreateOrder = async () => {
    if (!email.includes("@") || !fullName || !address || !city) {
      setError("Please complete all required shipping and contact details.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          shipping_address: `${address}, Postal: ${postalCode}, Country: ${country}`,
          shipping_city: city,
          shipping_notes: shippingNotes || (deliveryOption === "express" ? "Express White-Glove Request" : null),
          payment_method: paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedMaterial: i.selectedMaterial,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Unable to create your order.");
      }

      const order = data.order;

      if (paymentMethod === "stripe") {
        // Proceed to Stripe test payment or development checkout simulator
        const payRes = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            trackingToken: order.tracking_token,
          }),
        });

        const payData = await payRes.json();
        if (payRes.ok && payData.url) {
          clear();
          window.location.assign(payData.url);
          return;
        }
      }

      // Cash on delivery or direct confirmation
      clear();
      if (order.user_id) {
        router.push(`/orders/${order.id}?confirmed=1`);
      } else {
        router.push(`/track/${order.order_number}?t=${order.tracking_token}&confirmed=1`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating order";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="font-editorial text-2xl font-bold text-[#292B27] mb-2">
          Your cart is currently empty
        </h2>
        <p className="text-sm text-[#77766E] mb-6">
          Please select living essentials before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#292B27] text-white text-xs font-semibold rounded-xl"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left border-b border-[#292B27]/10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-1">
            256-Bit SSL Encrypted
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#292B27]">
            Secure Order Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#77766E]">
          <Lock className="w-4 h-4 text-[#8A927A]" />
          <span>Verified Merchant Protocol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Step Form Flow */}
        <div className="lg:col-span-7 space-y-8">
          {/* Progress Tabs */}
          <div className="flex items-center justify-between border-b border-[#292B27]/10 pb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                currentStep === 1 ? "text-[#292B27] font-bold" : "text-[#77766E]"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#292B27] text-white flex items-center justify-center text-[11px] font-mono">
                1
              </span>
              Contact
            </button>
            <div className="w-8 h-px bg-[#292B27]/20" />
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                currentStep === 2 ? "text-[#292B27] font-bold" : "text-[#77766E]"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#292B27] text-white flex items-center justify-center text-[11px] font-mono">
                2
              </span>
              Shipping
            </button>
            <div className="w-8 h-px bg-[#292B27]/20" />
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                currentStep === 3 ? "text-[#292B27] font-bold" : "text-[#77766E]"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#292B27] text-white flex items-center justify-center text-[11px] font-mono">
                3
              </span>
              Delivery
            </button>
            <div className="w-8 h-px bg-[#292B27]/20" />
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                currentStep === 4 ? "text-[#292B27] font-bold" : "text-[#77766E]"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#292B27] text-white flex items-center justify-center text-[11px] font-mono">
                4
              </span>
              Payment
            </button>
          </div>

          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-6 animate-in fade-in duration-200">
              <h2 className="font-editorial text-2xl font-bold text-[#292B27]">
                1. Contact Information
              </h2>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                    Email Address (for order tracking & digital receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                  />
                  <p className="text-[11px] text-[#77766E] mt-1">
                    Guest checkout supported. We will never share your contact details.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                    Mobile Phone (for delivery courier SMS updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3.5 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  Continue to Shipping Address
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Address */}
          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-6 animate-in fade-in duration-200">
              <h2 className="font-editorial text-2xl font-bold text-[#292B27]">
                2. Shipping Address
              </h2>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                    Street Address & Apartment/Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Living St, Apt 4"
                    className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                      Destination Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27] bg-white cursor-pointer"
                    >
                      <option value="United States">United States (USD)</option>
                      <option value="Canada">Canada (CAD)</option>
                      <option value="United Kingdom">United Kingdom (GBP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-4 py-3 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#292B27] mb-1.5 uppercase tracking-wider">
                    Courier Delivery Notes (Gate code, concierge instructions)
                  </label>
                  <textarea
                    rows={2}
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    placeholder="Leave with front desk / building buzzer 402"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#292B27]/20 focus:outline-none focus:ring-1 focus:ring-[#292B27]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#292B27]/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border border-[#292B27]/20 text-[#292B27] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Contact
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3.5 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  Continue to Delivery Method
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Delivery Options */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-6 animate-in fade-in duration-200">
              <h2 className="font-editorial text-2xl font-bold text-[#292B27]">
                3. Choose Delivery Method
              </h2>
              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryOption("standard")}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === "standard"
                      ? "border-[#292B27] bg-[#F4F0E8]/50 shadow-xs"
                      : "border-[#292B27]/10 hover:border-[#292B27]/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Truck className="w-6 h-6 text-[#8A927A]" />
                    <div>
                      <h4 className="font-semibold text-sm text-[#292B27]">
                        Standard Insured Ground
                      </h4>
                      <p className="text-xs text-[#77766E] mt-0.5">
                        Delivered in 3–5 business days with live tracking
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#292B27]">
                    {baseShipping === 0 ? "Complimentary" : formatPrice(baseShipping)}
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryOption("express")}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === "express"
                      ? "border-[#292B27] bg-[#F4F0E8]/50 shadow-xs"
                      : "border-[#292B27]/10 hover:border-[#292B27]/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-6 h-6 text-[#B78E69]" />
                    <div>
                      <h4 className="font-semibold text-sm text-[#292B27]">
                        Express White-Glove Air Service
                      </h4>
                      <p className="text-xs text-[#77766E] mt-0.5">
                        Delivered in 1–2 business days with prioritized dispatch
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#292B27]">
                    {formatPrice(baseShipping + 2500)}
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#292B27]/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 border border-[#292B27]/20 text-[#292B27] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3.5 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-6 animate-in fade-in duration-200">
              <h2 className="font-editorial text-2xl font-bold text-[#292B27]">
                4. Select Payment Method
              </h2>
              <div className="space-y-4">
                {/* Stripe Card Option */}
                <label
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                    paymentMethod === "stripe"
                      ? "border-[#292B27] bg-[#F4F0E8]/50 shadow-xs"
                      : "border-[#292B27]/10 hover:border-[#292B27]/30"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#292B27] mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-[#292B27]">
                        Credit / Debit Card (Stripe Test Mode)
                      </h4>
                      <span className="text-[10px] bg-[#8A927A]/20 text-[#8A927A] font-bold px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-[#77766E] mt-1">
                      Visa, Mastercard, American Express, Apple Pay. Verified server-side.
                    </p>
                  </div>
                </label>

                {/* Cash On Delivery Option */}
                <label
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                  className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                    paymentMethod === "cash_on_delivery"
                      ? "border-[#292B27] bg-[#F4F0E8]/50 shadow-xs"
                      : "border-[#292B27]/10 hover:border-[#292B27]/30"
                  }`}
                >
                  <Banknote className="w-6 h-6 text-[#292B27] mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#292B27]">
                      Cash on Delivery (White Glove Hand-Off)
                    </h4>
                    <p className="text-xs text-[#77766E] mt-1">
                      Pay our regional courier upon doorstep inspection of the pieces.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notice */}
              <div className="p-4 rounded-xl bg-[#F4F0E8] border border-[#292B27]/10 text-xs text-[#77766E] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
                <span>
                  For portfolio demonstration, you can test with any test card or complete via Cash on Delivery. Prices are securely recalculated on our server.
                </span>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#292B27]/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 border border-[#292B27]/20 text-[#292B27] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Delivery
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateOrder}
                  className="px-10 py-4 bg-[#292B27] hover:bg-[#3d403a] text-white text-sm font-semibold rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    "Processing Order..."
                  ) : (
                    <>
                      Place Order · <span suppressHydrationWarning>{formatPrice(grandTotal)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#292B27]/10 pb-4">
            <h3 className="font-editorial text-2xl font-bold text-[#292B27]">
              Order Summary
            </h3>
            <span className="text-xs font-mono text-[#77766E]">
              {items.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
          </div>

          {/* Mini Items List */}
          <div className="divide-y divide-[#292B27]/10 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor ?? "default"}`}
                className="py-3 flex items-center gap-3.5"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F4F0E8] shrink-0 border border-[#292B27]/10">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-[#292B27] truncate">
                    {item.name}
                  </h5>
                  <div className="text-[11px] text-[#77766E]">
                    Qty {item.quantity} {item.selectedColor ? `· ${item.selectedColor}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[#292B27]" suppressHydrationWarning>
                  {formatPrice(item.priceCents * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2.5 text-xs text-[#77766E] border-t border-[#292B27]/10 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-[#292B27] font-semibold" suppressHydrationWarning>
                {formatPrice(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promo Discount ({appliedCoupon?.code})</span>
                <span className="font-mono" suppressHydrationWarning>-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery & Handling</span>
              <span className="font-mono text-[#292B27]" suppressHydrationWarning>
                {finalShipping === 0 ? "Complimentary" : formatPrice(finalShipping)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-[#292B27] pt-3 border-t border-[#292B27]/10">
              <span>Total Due ({currency})</span>
              <span className="font-mono text-lg" suppressHydrationWarning>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#77766E] space-y-1">
            <p>✓ Complimentary 30-day trial period</p>
            <p>✓ Insured direct carriage</p>
            <p>✓ Carbon-neutral transport</p>
          </div>
        </div>
      </div>
    </div>
  );
}
