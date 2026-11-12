"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import type { Banner as BannerType } from "@/lib/types";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

type Draft = {
  placement: "hero" | "promo";
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
};

const emptyDraft: Draft = {
  placement: "hero",
  title: "",
  subtitle: "",
  image_url: "",
  cta_label: "Explore Collection",
  cta_href: "/shop",
  sort_order: 0,
  is_active: true,
};

export function BannerManager({ banners }: { banners: BannerType[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BannerType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setDraft({ ...emptyDraft, sort_order: banners.length + 1 });
    setIsCreating(true);
  }

  function openEdit(banner: BannerType) {
    setEditing(banner);
    setDraft({
      placement: banner.placement,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      image_url: banner.image_url ?? "",
      cta_label: banner.cta_label ?? "Explore Collection",
      cta_href: banner.cta_href ?? "/shop",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setIsCreating(false);
  }

  async function save() {
    if (!draft) return;
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        subtitle: draft.subtitle || null,
        image_url: draft.image_url || null,
        cta_label: draft.cta_label || null,
        cta_href: draft.cta_href || null,
      };
      const response = await fetch(
        isCreating ? "/api/admin/banners" : `/api/admin/banners/${editing!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save");
      setDraft(null);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(banner: BannerType) {
    if (!confirm(`Are you sure you want to delete banner "${banner.title}"?`)) return;
    const response = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to delete");
      return;
    }
    router.refresh();
  }

  async function toggleActive(banner: BannerType) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <span>Marketing Campaigns</span>
            <span>·</span>
            <span>{banners.length} Active Slides &amp; Notices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            Banners &amp; Visual Hero Showcases
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Publish hero slides, manage top promotional tickers, and configure conversion CTAs.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span style={{ color: "#FFFFFF" }}>Add New Banner</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Visual Banner Preview Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((banner) => {
          const isHero = banner.placement === "hero";
          const img =
            banner.image_url ||
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80";

          return (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
            >
              <div>
                {/* Visual Real-Life Preview */}
                <div className="relative h-60 bg-[#292B27] overflow-hidden flex items-center justify-center p-6 text-center text-white">
                  {isHero && (
                    <>
                      <Image
                        src={img}
                        alt={banner.title}
                        fill
                        sizes="600px"
                        className="object-cover opacity-60 group-hover:scale-104 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    </>
                  )}

                  <div className="relative z-10 space-y-2 max-w-md mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white">
                      <Sparkles className="w-3 h-3 text-[#B78E69]" />
                      {banner.placement === "hero" ? "Hero Showcase" : "Top Promo Bar"}
                    </span>
                    <h3 className="font-editorial text-2xl font-bold leading-tight text-white">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-2 font-sans font-light">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.cta_label && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#F4F0E8] text-[#1A1C18] text-xs font-bold">
                          {banner.cta_label}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Metadata Info */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#4A483E]">
                    <span className="font-mono">Sort Order: #{banner.sort_order}</span>
                    <span className="font-mono text-[#8A927A]">Link: {banner.cta_href || "/shop"}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 border-t border-[#1A1C18]/8 bg-[#FAF9F6] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleActive(banner)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    banner.is_active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {banner.is_active ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live on Storefront</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    className="p-1.5 rounded-lg text-[#4A483E] hover:text-[#1A1C18] hover:bg-stone-200 transition-colors"
                    title="Edit banner"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(banner)}
                    className="p-1.5 rounded-lg text-[#4A483E] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Editor Modal Dialog */}
      {draft && (
        <div className="fixed inset-0 z-50 bg-[#1A1C18]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#1A1C18]/15 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
              <h3 className="text-lg font-bold text-[#1A1C18]">
                {isCreating ? "Create New Campaign Banner" : "Edit Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="p-1.5 rounded-full text-[#4A483E] hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, placement: "hero" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      draft.placement === "hero"
                        ? "bg-[#1A1C18] text-white border-[#1A1C18]"
                        : "bg-stone-50 border-stone-200 text-[#4A483E]"
                    }`}
                  >
                    Home Hero Showcase
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, placement: "promo" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      draft.placement === "promo"
                        ? "bg-[#1A1C18] text-white border-[#1A1C18]"
                        : "bg-stone-50 border-stone-200 text-[#4A483E]"
                    }`}
                  >
                    Top Announcement Bar
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Headline Title
                </label>
                <input
                  type="text"
                  required
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Make room for what matters."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  placeholder="Thoughtfully designed essentials for a more organized, beautiful home."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                />
              </div>

              {draft.placement === "hero" && (
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                    Lifestyle Photography Image URL
                  </label>
                  <ImageUploadInput
                    bucket="banners"
                    label="Upload Banner Photography"
                    value={draft.image_url}
                    onChange={(url) => setDraft({ ...draft, image_url: url })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={draft.cta_label}
                    onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
                    placeholder="Explore Collection"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={draft.cta_href}
                    onChange={(e) => setDraft({ ...draft, cta_href: e.target.value })}
                    placeholder="/shop"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1A1C18]/10">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="px-4 py-2 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={save}
                data-btn="dark"
                style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                className="px-5 py-2 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-colors"
              >
                <span style={{ color: "#FFFFFF" }}>{isSaving ? "Saving..." : "Save Banner"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
