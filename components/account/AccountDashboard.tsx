"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Package,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Truck,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ReviewForm } from "@/components/store/ReviewForm";
import { StarRating } from "@/components/shared/StarRating";
import { PAYMENT_STATUS_LABELS, DELIVERY_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Profile, Review } from "@/lib/types";

export type AccountOrder = {
  id: string;
  order_number: string;
  payment_status: keyof typeof PAYMENT_STATUS_LABELS;
  delivery_status?: keyof typeof DELIVERY_STATUS_LABELS;
  total_cents: number;
  created_at?: string;
  item_count?: number;
};

export type ReviewableItem = {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
};

type TabType = "profile" | "security" | "orders" | "reviews";

export function AccountDashboard({
  profile,
  orders,
  reviewable,
  reviews,
  showResetNotice,
}: {
  profile: Profile;
  orders: AccountOrder[];
  reviewable: ReviewableItem[];
  reviews: Review[];
  showResetNotice: boolean;
}) {
  const [tab, setTab] = useState<TabType>("profile");

  const initials = (profile.full_name || profile.email || "KS")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalReviewsCount = reviewable.length + reviews.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#1A1C18] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="hover:text-[#1A1C18] transition-colors">Client Sanctuary</span>
        <span>/</span>
        <span className="text-[#1A1C18] font-bold">Account Overview</span>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1A1C18]/10">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar / Monogram */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1A1C18] to-[#2D302A] text-white flex items-center justify-center font-bold font-editorial text-2xl sm:text-3xl shadow-md border-2 border-[#B78E69]/40 shrink-0">
              <span>{initials}</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Profile Meta */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
                  {profile.full_name || "Resident Collector"}
                </h1>
                {profile.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A1C18] text-[#D8C9B5] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#B78E69]/30">
                    <Sparkles className="w-3 h-3 text-[#B78E69]" />
                    Studio Architect · Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8A927A]/15 text-[#3e4435] text-[10px] font-mono font-bold tracking-wider uppercase">
                    Verified Resident
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#4A483E]/80">
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#8A927A]" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#8A927A]" />
                      {profile.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1C18] text-white hover:bg-[#2D302A] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#B78E69]" />
                <span style={{ color: "#FFFFFF" }}>Studio CMS Admin</span>
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Quick Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#B78E69]" />
              <span>Orders Placed</span>
            </div>
            <div className="font-editorial text-xl font-bold text-[#1A1C18]">
              {orders.length} Dispatched
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#B78E69]" />
              <span>Reviews Shared</span>
            </div>
            <div className="font-editorial text-xl font-bold text-[#1A1C18]">
              {reviews.length} Published
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#8A927A]" />
              <span>Trial Period</span>
            </div>
            <div className="font-editorial text-xl font-bold text-[#1A1C18]">
              30-Day In-Home
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#8A927A]" />
              <span>Fulfillment Tier</span>
            </div>
            <div className="font-editorial text-xl font-bold text-[#1A1C18]">
              White-Glove
            </div>
          </div>
        </div>
      </div>

      {showResetNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Password reset verified successfully. Please configure your new credentials below in the Security tab.</span>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1A1C18]/10 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            tab === "profile"
              ? "bg-[#1A1C18] text-white shadow-xs"
              : "bg-white text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#F4F0E8] border border-[#1A1C18]/10"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("security")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            tab === "security"
              ? "bg-[#1A1C18] text-white shadow-xs"
              : "bg-white text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#F4F0E8] border border-[#1A1C18]/10"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security &amp; Password</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            tab === "orders"
              ? "bg-[#1A1C18] text-white shadow-xs"
              : "bg-white text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#F4F0E8] border border-[#1A1C18]/10"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Order History</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              tab === "orders" ? "bg-white/20 text-white" : "bg-[#F4F0E8] text-[#4A483E]"
            }`}
          >
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            tab === "reviews"
              ? "bg-[#1A1C18] text-white shadow-xs"
              : "bg-white text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#F4F0E8] border border-[#1A1C18]/10"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Product Reviews</span>
          {totalReviewsCount > 0 && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                tab === "reviews" ? "bg-white/20 text-white" : "bg-[#F4F0E8] text-[#4A483E]"
              }`}
            >
              {totalReviewsCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Panels */}
      <div>
        {tab === "profile" && <ProfileForm profile={profile} />}
        {tab === "security" && <SecurityForm />}
        {tab === "orders" && <OrdersPanel orders={orders} />}
        {tab === "reviews" && (
          <ReviewsPanel reviewable={reviewable} reviews={reviews} />
        )}
      </div>
    </div>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save profile");
      setNotice("Profile information saved successfully.");
      router.refresh();
      setTimeout(() => setNotice(null), 4000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Profile Form */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-6">
        <div className="border-b border-[#1A1C18]/10 pb-4">
          <h2 className="font-editorial text-xl font-bold text-[#1A1C18]">
            Personal Identity &amp; Contact Details
          </h2>
          <p className="text-xs text-[#4A483E]/80 mt-1">
            Update your registered name and contact telephone for order logistics.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={save} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
              />
              <User className="w-4 h-4 text-[#8A927A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full pl-10 pr-24 py-3 rounded-xl border border-[#1A1C18]/10 bg-[#F4F0E8]/50 text-xs text-[#4A483E] cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-[#8A927A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-[#4A483E]/70">
              Primary email used for order confirmations and tracking updates.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              Telephone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
              />
              <Phone className="w-4 h-4 text-[#8A927A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#4A483E]/70">
              Courier delivery contact for scheduled white-glove dispatches.
            </p>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span style={{ color: "#FFFFFF" }}>{isSaving ? "Saving Changes…" : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sanctuary Benefits Sidebar */}
      <div className="space-y-4">
        <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-[#1A1C18]/10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B78E69]" />
            <h3 className="font-editorial text-lg font-bold text-[#1A1C18]">
              Sanctuary Guarantees
            </h3>
          </div>
          <div className="space-y-3.5 text-xs text-[#4A483E] leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#B78E69]/15 text-[#B78E69] shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A1C18] block font-semibold">White-Glove Handling</strong>
                Custom wood crating and eco-friendly protective packaging on all architectural furniture.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#8A927A]/15 text-[#8A927A] shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A1C18] block font-semibold">30-Day In-Home Trial</strong>
                Live with any piece for a full month to experience its harmony in your personal space.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#B78E69]/15 text-[#B78E69] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A1C18] block font-semibold">10-Year Craft Warranty</strong>
                Solid white oak joinery and metal fittings engineered for lifelong structural integrity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setPassword("");
      setNotice("Your authentication password has been updated.");
      setTimeout(() => setNotice(null), 4000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update password");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-6">
      <div className="border-b border-[#1A1C18]/10 pb-4">
        <h2 className="font-editorial text-xl font-bold text-[#1A1C18]">
          Password &amp; Access Security
        </h2>
        <p className="text-xs text-[#4A483E]/80 mt-1">
          Set or change your secret password. Users authenticated via Google can also define a password here for direct email sign-in.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={save} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
            New Secret Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
            />
            <Lock className="w-4 h-4 text-[#8A927A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A483E] hover:text-[#1A1C18]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[#4A483E]/70">
            Must contain at least 8 characters. We recommend including numbers and symbols.
          </p>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isSaving || password.length < 8}
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span style={{ color: "#FFFFFF" }}>{isSaving ? "Updating Password…" : "Update Password"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function OrdersPanel({ orders }: { orders: AccountOrder[] }) {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#1A1C18]/10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F4F0E8] text-[#8A927A] flex items-center justify-center mx-auto border border-[#1A1C18]/10">
          <Package className="w-7 h-7 text-[#B78E69]" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-editorial text-2xl font-bold text-[#1A1C18]">
            No Orders Placed Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans max-w-sm mx-auto">
            Your architectural orders and live dispatch timelines will appear here. Explore our essentials to begin.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/shop"
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs"
          >
            <span style={{ color: "#FFFFFF" }}>Explore Living Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-mono uppercase text-[#8A927A] tracking-wider">
          {orders.length} Total Dispatched Orders
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isPaid = order.payment_status === "paid";
          const dateStr = order.created_at ? formatDate(order.created_at) : "Recent";

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#1A1C18] border border-[#1A1C18]/8 shrink-0">
                  <Package className="w-5 h-5 text-[#B78E69]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#1A1C18]">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4A483E]/80 flex items-center gap-2">
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span>{order.item_count ?? 1} items</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1A1C18]/8">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#8A927A] uppercase tracking-wider">
                    Total
                  </div>
                  <div className="font-editorial text-lg font-bold text-[#1A1C18]">
                    {formatMoney(order.total_cents)}
                  </div>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8A927A]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsPanel({
  reviewable,
  reviews,
}: {
  reviewable: ReviewableItem[];
  reviews: Review[];
}) {
  return (
    <div className="space-y-8">
      {/* Reviewable Items */}
      {reviewable.length > 0 && (
        <div className="bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10">
            <Sparkles className="w-4 h-4 text-[#B78E69]" />
            <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
              Essentials Awaiting Your Reflection ({reviewable.length})
            </h3>
          </div>
          <p className="text-xs text-[#4A483E]/80 leading-relaxed">
            Your candid impressions help our Scandinavian woodworking ateliers continually refine each piece.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {reviewable.map((item) => (
              <div
                key={`${item.orderId}-${item.productId}`}
                className="bg-white p-4 rounded-2xl border border-[#1A1C18]/10 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-[#1A1C18] line-clamp-1">
                    {item.productName}
                  </div>
                  <div className="text-[10px] font-mono text-[#8A927A]">
                    Order #{item.orderNumber}
                  </div>
                </div>
                <ReviewForm
                  productId={item.productId}
                  orderId={item.orderId}
                  productName={item.productName}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
          <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
            Your Published Reflections ({reviews.length})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#4A483E]/70 space-y-2">
            <Star className="w-8 h-8 text-[#D8C9B5] mx-auto" />
            <p>You haven&apos;t published any product reviews yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1A1C18]/8">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/product/${review.product?.slug ?? ""}`}
                    className="text-xs font-bold text-[#1A1C18] hover:text-[#B78E69] transition-colors"
                  >
                    {review.product?.name ?? "Curated Essential"}
                  </Link>
                  <StarRating value={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-xs text-[#4A483E] leading-relaxed italic bg-[#F4F0E8]/50 p-3 rounded-xl">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
                {review.created_at && (
                  <div className="text-[10px] font-mono text-[#8A927A]">
                    Published on {formatDate(review.created_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
