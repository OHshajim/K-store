"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Camera,
  Upload,
  Trash2,
  Loader2,
  KeyRound,
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
  orderItemId?: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  variantLabel?: string | null;
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
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("profile");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = (profile.full_name || profile.email || "KS")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleAvatarUpload(file: File) {
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar");
      setAvatarUrl(data.avatar_url);
      setAvatarMessage({ type: "success", text: "Profile picture updated successfully." });
      router.refresh();
      setTimeout(() => setAvatarMessage(null), 4000);
    } catch (err) {
      setAvatarMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleAvatarDelete() {
    setIsUploadingAvatar(true);
    setAvatarMessage(null);
    try {
      const res = await fetch("/api/account/avatar", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove avatar");
      setAvatarUrl(null);
      setAvatarMessage({ type: "success", text: "Profile picture removed successfully." });
      router.refresh();
      setTimeout(() => setAvatarMessage(null), 4000);
    } catch (err) {
      setAvatarMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to remove avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

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
            {/* Avatar / Monogram with Interactive Camera Upload */}
            <div className="relative group shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1A1C18] to-[#2D302A] text-white flex items-center justify-center font-bold font-editorial text-2xl sm:text-3xl shadow-md border-2 border-[#B78E69]/40 overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={profile.full_name || "Profile"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}

                {/* Hover overlay for instant photo update */}
                <button
                  type="button"
                  onClick={() => heroFileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-[#1A1C18]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Upload profile picture"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#D8C9B5]" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-[#D8C9B5]" />
                      <span className="text-[9px] font-mono mt-0.5 font-bold uppercase tracking-wider">
                        {avatarUrl ? "Change" : "Upload"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Corner Camera Button Indicator */}
              <button
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1A1C18] text-white border-2 border-white flex items-center justify-center shadow-xs hover:bg-[#B78E69] transition-colors cursor-pointer"
                title="Upload or change profile picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : (
                  <Camera className="w-3 h-3 text-[#D8C9B5]" />
                )}
              </button>

              {/* Hidden File Input for Avatar Upload */}
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                className="hidden"
                disabled={isUploadingAvatar}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAvatarUpload(file);
                  }
                  e.target.value = "";
                }}
              />
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
                ) : profile.role === "manager" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B78E69]/15 text-[#8C6239] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#B78E69]/30">
                    <ShieldCheck className="w-3 h-3 text-[#B78E69]" />
                    Store Manager
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
            {(profile.role === "admin" || profile.role === "manager") && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1C18] text-white hover:bg-[#2D302A] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#B78E69]" />
                <span style={{ color: "#FFFFFF" }}>
                  {profile.role === "admin" ? "Studio CMS Admin" : "Store Manager CMS"}
                </span>
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Upload Status Alert if triggered from hero */}
        {avatarMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in ${
              avatarMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {avatarMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{avatarMessage.text}</span>
          </div>
        )}

        {/* Quick Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-sans">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8 min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#B78E69] shrink-0" />
              <span className="truncate">Orders Placed</span>
            </div>
            <div className="font-editorial text-base sm:text-xl font-bold text-[#1A1C18]">
              {orders.length} Dispatched
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8 min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#B78E69] shrink-0" />
              <span className="truncate">Reviews Shared</span>
            </div>
            <div className="font-editorial text-base sm:text-xl font-bold text-[#1A1C18]">
              {reviews.length} Published
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8 min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#8A927A] shrink-0" />
              <span className="truncate">Trial Period</span>
            </div>
            <div className="font-editorial text-base sm:text-xl font-bold text-[#1A1C18]">
              30-Day In-Home
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F4F0E8]/60 border border-[#1A1C18]/8 min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#8A927A] tracking-wider mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#8A927A] shrink-0" />
              <span className="truncate">Fulfillment Tier</span>
            </div>
            <div className="font-editorial text-base sm:text-xl font-bold text-[#1A1C18]">
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
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 border-b border-[#1A1C18]/10 pb-4">
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
        {tab === "profile" && (
          <ProfileForm
            profile={profile}
            avatarUrl={avatarUrl}
            onAvatarUpload={handleAvatarUpload}
            onAvatarDelete={handleAvatarDelete}
            isUploadingAvatar={isUploadingAvatar}
          />
        )}
        {tab === "security" && <SecurityForm userEmail={profile.email} />}
        {tab === "orders" && <OrdersPanel orders={orders} />}
        {tab === "reviews" && (
          <ReviewsPanel reviewable={reviewable} reviews={reviews} />
        )}
      </div>
    </div>
  );
}

function ProfileForm({
  profile,
  avatarUrl,
  onAvatarUpload,
  onAvatarDelete,
  isUploadingAvatar,
}: {
  profile: Profile;
  avatarUrl: string | null;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarDelete: () => Promise<void>;
  isUploadingAvatar: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initials = (profile.full_name || profile.email || "KS")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
            Update your profile photography, registered name, and contact telephone for order logistics.
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

        {/* Profile Avatar Upload & Management Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F0E8]/50 border border-[#1A1C18]/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
              <Camera className="w-3.5 h-3.5 text-[#B78E69]" />
              <span>Resident Profile Picture</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#1A1C18]/10 text-[#4A483E] font-medium">
              {avatarUrl ? "Custom Avatar" : "Monogram Initials"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#1A1C18] text-white flex items-center justify-center font-editorial font-bold text-2xl border-2 border-[#B78E69]/40 overflow-hidden shrink-0 shadow-xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile.full_name || "Profile"}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1C18] text-white hover:bg-[#2D302A] text-xs font-semibold cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#D8C9B5]" />
                  )}
                  <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  className="hidden"
                  disabled={isUploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onAvatarUpload(file);
                    }
                    e.target.value = "";
                  }}
                />

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={onAvatarDelete}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#4A483E]/70 leading-normal">
                Supported formats: PNG, JPG, WebP, AVIF, GIF (max 5MB). Photo appears in account sanctuary, top navigation, and reviews.
              </p>
            </div>
          </div>
        </div>

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

function SecurityForm({ userEmail }: { userEmail: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP workflow states
  const [otpStep, setOtpStep] = useState<"initial" | "otp_dispatched">("initial");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSendOtp() {
    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, intent: "password_change" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification code");

      setOtpStep("otp_dispatched");
      setCooldown(25);
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp);
      }
      setNotice(`A 6-digit security code has been sent to ${userEmail}. Code expires in 10 minutes.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dispatch verification code");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyAndUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/otp/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          otp: otp.trim(),
          newPassword,
          intent: "password_change",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setDebugOtp(null);
      setOtpStep("initial");
      setNotice("Your authentication password has been successfully updated via OTP verification.");
      setTimeout(() => setNotice(null), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-6">
      <div className="border-b border-[#1A1C18]/10 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B78E69]" />
          <h2 className="font-editorial text-xl font-bold text-[#1A1C18]">
            Two-Factor Password Authentication
          </h2>
        </div>
        <p className="text-xs text-[#4A483E]/80 mt-1">
          For your sanctuary security, password modifications require a one-time 6-digit verification code sent to your registered email (<strong className="text-[#1A1C18]">{userEmail}</strong>).
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

      {otpStep === "initial" ? (
        /* STEP 1: Define New Password & Confirm Password */
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              New Secret Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
              />
              <KeyRound className="w-4 h-4 text-[#8A927A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A483E] hover:text-[#1A1C18]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || newPassword.length < 8 || newPassword !== confirmPassword}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Sending Verification Code…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D8C9B5]" />
                  <span>Send 6-Digit OTP Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: Verify 6-digit OTP and update password */
        <form onSubmit={handleVerifyAndUpdatePassword} className="space-y-4 text-xs">
          {debugOtp && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Demo Mode Helper: OTP is <strong className="font-mono text-sm">{debugOtp}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(debugOtp)}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] transition-colors shrink-0"
              >
                Fill Code
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
              6-Digit Security Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="123456"
                autoFocus
                className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg py-3 rounded-xl border border-[#1A1C18]/20 text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#4A483E]/80 pt-1">
              <span>Code sent to {userEmail}</span>
              <button
                type="button"
                disabled={cooldown > 0 || isSendingOtp}
                onClick={handleSendOtp}
                className="text-[#1A1C18] font-bold underline hover:text-[#B78E69] disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Verifying Code &amp; Updating…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8C9B5]" />
                  <span>Verify OTP &amp; Confirm New Password</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpStep("initial");
                setOtp("");
                setError(null);
              }}
              className="px-4 py-3 rounded-xl border border-[#1A1C18]/15 text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#F4F0E8] text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Password Edit
            </button>
          </div>
        </form>
      )}
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
          const isNegativePayment =
            order.payment_status === "cancelled" ||
            order.payment_status === "refunded";
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1A1C18]">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : isNegativePayment
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                    </span>
                    {order.delivery_status && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          order.delivery_status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.delivery_status === "cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-stone-100 text-[#1A1C18]"
                        }`}
                      >
                        {DELIVERY_STATUS_LABELS[order.delivery_status] || order.delivery_status}
                      </span>
                    )}
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
            {reviewable.map((item, idx) => (
              <div
                key={item.orderItemId ?? `${item.orderId}-${item.productId}-${idx}`}
                className="bg-white p-4 rounded-2xl border border-[#1A1C18]/10 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1A1C18] line-clamp-1">
                    {item.productName}
                  </div>
                  <div className="text-[10px] font-mono text-[#8A927A] truncate">
                    Order #{item.orderNumber}
                    {item.variantLabel ? ` · ${item.variantLabel}` : ""}
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
