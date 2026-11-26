"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Copy,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import type { Coupon } from "@/lib/types";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form draft state
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [minSpendDollars, setMinSpendDollars] = useState<string>("100");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nowMs] = useState(() => Date.now());

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.trim().toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.is_active).length;
  const avgDiscount =
    coupons.length > 0
      ? Math.round(
          coupons.reduce((sum, c) => sum + c.discount_percent, 0) / coupons.length
        )
      : 0;

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountPercent(15);
    setMinSpendDollars("100");
    setExpiresAt("");
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountPercent(coupon.discount_percent);
    setMinSpendDollars(String((coupon.min_spend_cents || 0) / 100));
    setExpiresAt(
      coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().split("T")[0]
        : ""
    );
    setIsActive(coupon.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const generateRandomCode = () => {
    const prefixes = ["KSTORE", "NORDEN", "VAULT", "STUDIO", "SPRING", "AUTUMN"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}${number}`);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError("Coupon code is required.");
      setIsSubmitting(false);
      return;
    }

    const minSpendCents = Math.round(Number(minSpendDollars || 0) * 100);
    const expirationIso = expiresAt ? new Date(expiresAt).toISOString() : null;

    try {
      if (editingCoupon) {
        // PATCH existing
        const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleanCode,
            discount_percent: Number(discountPercent),
            min_spend_cents: minSpendCents,
            is_active: isActive,
            expires_at: expirationIso,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update coupon");

        setCoupons((prev) =>
          prev.map((c) =>
            c.id === editingCoupon.id
              ? {
                  ...c,
                  code: cleanCode,
                  discount_percent: Number(discountPercent),
                  min_spend_cents: minSpendCents,
                  is_active: isActive,
                  expires_at: expirationIso,
                }
              : c
          )
        );
      } else {
        // POST new
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleanCode,
            discount_percent: Number(discountPercent),
            min_spend_cents: minSpendCents,
            is_active: isActive,
            expires_at: expirationIso,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create coupon");

        setCoupons((prev) => [data.coupon, ...prev]);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error saving coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const nextState = !coupon.is_active;
    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextState } : c))
    );

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextState }),
      });
      if (!res.ok) {
        // Revert on failure
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c
          )
        );
      }
    } catch {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c
        )
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete coupon");
      }
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete coupon");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1C18]/10 pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1C18] flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[#B78E69]" />
            Promotional Coupons &amp; Campaigns
          </h1>
          <p className="text-xs text-[#77766E] mt-1">
            Configure customer promotional codes, seasonal percentage discounts, and checkout spend thresholds.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1C18] text-white hover:bg-[#B78E69] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#1A1C18]/8">
          <div className="text-[11px] font-medium text-[#77766E] uppercase tracking-wider">
            Total Campaigns
          </div>
          <div className="text-2xl font-serif font-bold text-[#1A1C18] mt-1 font-mono">
            {coupons.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#1A1C18]/8">
          <div className="text-[11px] font-medium text-[#77766E] uppercase tracking-wider">
            Active at Checkout
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-1 font-mono flex items-center gap-2">
            <span>{activeCount}</span>
            <span className="text-xs font-sans font-normal text-emerald-600">codes</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#1A1C18]/8">
          <div className="text-[11px] font-medium text-[#77766E] uppercase tracking-wider">
            Average Discount
          </div>
          <div className="text-2xl font-serif font-bold text-[#B78E69] mt-1 font-mono">
            {avgDiscount}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#1A1C18]/8">
          <div className="text-[11px] font-medium text-[#77766E] uppercase tracking-wider">
            Checkout Engine
          </div>
          <div className="text-xs font-semibold text-[#1A1C18] mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-validation Active</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#77766E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon codes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#1A1C18]/15 bg-white text-xs text-[#1A1C18] placeholder:text-[#77766E] focus:outline-none focus:border-[#1A1C18]"
          />
        </div>
        <div className="text-xs text-[#77766E]">
          Showing {filteredCoupons.length} of {coupons.length} codes
        </div>
      </div>

      {/* 4. Coupons Table (Desktop) & Cards (Mobile/Tablet) */}
      <div className="rounded-2xl border border-[#1A1C18]/10 bg-white overflow-hidden shadow-xs">
        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden p-3 sm:p-4 space-y-3">
          {filteredCoupons.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#77766E]">
              <Tag className="w-8 h-8 text-[#1A1C18]/20 mx-auto mb-2" />
              <p className="text-sm font-medium">No coupon codes found.</p>
              <p className="text-xs text-[#77766E] mt-1">
                Create a promotional discount code to incentivize shoppers.
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isExpired =
                coupon.expires_at &&
                new Date(coupon.expires_at).getTime() < nowMs;
              return (
                <div
                  key={coupon.id}
                  className="rounded-xl border border-[#1A1C18]/10 bg-[#FAF9F6]/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#1A1C18]/12 text-[#1A1C18] text-xs font-mono font-bold tracking-wider truncate">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="p-1 text-[#77766E] hover:text-[#1A1C18] transition-colors rounded cursor-pointer shrink-0"
                        title="Copy code to clipboard"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#B78E69]/15 text-[#B78E69] font-bold text-[11px] shrink-0">
                      {coupon.discount_percent}% OFF
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#1A1C18]/8 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#77766E] block mb-0.5">
                        Min Spend
                      </span>
                      {coupon.min_spend_cents > 0 ? (
                        <span className="font-mono font-semibold text-[#1A1C18]">
                          ${(coupon.min_spend_cents / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-stone-400">No minimum</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#77766E] block mb-0.5">
                        Expiry
                      </span>
                      {coupon.expires_at ? (
                        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-[#77766E] shrink-0" />
                          <span className={isExpired ? "text-rose-600 font-bold" : "text-[#1A1C18]"}>
                            {new Date(coupon.expires_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                          {isExpired && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>No Expiry</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1A1C18]/8">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          coupon.is_active ? "bg-emerald-600" : "bg-stone-300"
                        }`}
                        title={
                          coupon.is_active ? "Click to Pause" : "Click to Activate"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            coupon.is_active ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[11px] font-medium text-[#4A483E]">
                        {coupon.is_active ? "Active" : "Paused"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(coupon)}
                        className="px-2.5 py-1 text-xs text-[#77766E] hover:text-[#1A1C18] border border-[#1A1C18]/10 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(coupon)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#1A1C18]/10 text-[#77766E] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Promo Code</th>
                <th className="px-5 py-3.5">Discount</th>
                <th className="px-5 py-3.5">Min Spend</th>
                <th className="px-5 py-3.5">Expiry</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1C18]/5">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#77766E]">
                    <Tag className="w-8 h-8 text-[#1A1C18]/20 mx-auto mb-2" />
                    <p className="text-sm font-medium">No coupon codes found.</p>
                    <p className="text-xs text-[#77766E] mt-1">
                      Create a promotional discount code to incentivize shoppers.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired =
                    coupon.expires_at &&
                    new Date(coupon.expires_at).getTime() < nowMs;
                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-[#FAF9F5] transition-colors"
                    >
                      {/* Code */}
                      <td className="px-5 py-4 font-mono font-bold text-[#1A1C18]">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#1A1C18]/12 text-[#1A1C18] text-xs font-mono tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 text-[#77766E] hover:text-[#1A1C18] transition-colors rounded cursor-pointer"
                            title="Copy code to clipboard"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-4 font-semibold text-[#1A1C18]">
                        <span className="px-2 py-0.5 rounded-full bg-[#B78E69]/15 text-[#B78E69] font-bold text-[11px]">
                          {coupon.discount_percent}% OFF
                        </span>
                      </td>

                      {/* Min Spend */}
                      <td className="px-5 py-4 text-[#77766E]">
                        {coupon.min_spend_cents > 0 ? (
                          <span className="font-mono text-[#1A1C18]">
                            ${(coupon.min_spend_cents / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-stone-400">No minimum</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4 text-[#77766E]">
                        {coupon.expires_at ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-[#77766E]" />
                            <span
                              className={isExpired ? "text-rose-600 font-bold" : ""}
                            >
                              {new Date(coupon.expires_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" }
                              )}
                            </span>
                            {isExpired && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>No Expiry</span>
                          </span>
                        )}
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            coupon.is_active ? "bg-emerald-600" : "bg-stone-300"
                          }`}
                          title={
                            coupon.is_active ? "Click to Pause" : "Click to Activate"
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              coupon.is_active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(coupon)}
                            className="px-2.5 py-1 text-xs text-[#77766E] hover:text-[#1A1C18] border border-[#1A1C18]/10 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#1A1C18]/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#1A1C18]/10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 font-sans">
              <h2 className="text-xl font-serif font-bold text-[#1A1C18] mb-1">
                {editingCoupon ? "Edit Promotional Coupon" : "Create Promotional Coupon"}
              </h2>
              <p className="text-xs text-[#77766E] mb-6">
                Specify promo code name, percentage discount, and checkout criteria.
              </p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                {/* Code with Generator button */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                      Coupon Code
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[11px] text-[#B78E69] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Suggest Code</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F5] text-sm font-mono font-bold text-[#1A1C18] uppercase tracking-wider focus:outline-none focus:border-[#1A1C18]"
                  />
                </div>

                {/* Discount % */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Discount Percentage (% Off)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F5] text-sm font-mono font-bold text-[#1A1C18] focus:outline-none focus:border-[#1A1C18]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#77766E] font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Minimum Spend ($) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Minimum Cart Spend ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#77766E] font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={minSpendDollars}
                      onChange={(e) => setMinSpendDollars(e.target.value)}
                      placeholder="0.00 for no minimum"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F5] text-sm font-mono text-[#1A1C18] focus:outline-none focus:border-[#1A1C18]"
                    />
                  </div>
                  <p className="text-[10px] text-[#77766E]">
                    Shopper must have at least this subtotal in cart to apply the voucher.
                  </p>
                </div>

                {/* Expiration Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F5] text-xs font-mono text-[#1A1C18] focus:outline-none focus:border-[#1A1C18]"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1A1C18] focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveCheckbox"
                    className="text-xs text-[#1A1C18] font-medium cursor-pointer"
                  >
                    Enable immediately for checkout patrons
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1C18]/10 mt-6">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#77766E] hover:text-[#1A1C18] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#1A1C18] text-white hover:bg-[#B78E69] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Publish Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Promotional Coupon"
          subtitle="Irreversible Action"
          description={
            <span>
              Are you sure you want to permanently delete coupon code{" "}
              <strong className="font-mono text-[#1A1C18]">
                &quot;{deleteTarget.code}&quot;
              </strong>
              ? Customers will no longer be able to apply this discount at checkout.
            </span>
          }
          confirmText="Delete Coupon"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
