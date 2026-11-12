"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

const ROOM_IMAGES: Record<string, string> = {
  living: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  workspace: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
  bedroom: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=800&q=80",
  bathroom: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  lighting: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
};

type Draft = {
  name: string;
  description: string;
  sort_order: number;
  image_url: string;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setDraft({
      name: "",
      description: "",
      sort_order: categories.length + 1,
      image_url: "",
    });
    setIsCreating(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDraft({
      name: category.name,
      description: category.description ?? "",
      sort_order: category.sort_order,
      image_url: category.image_url ?? "",
    });
    setIsCreating(false);
  }

  async function save() {
    if (!draft) return;
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(
        isCreating
          ? "/api/admin/categories"
          : `/api/admin/categories/${editing!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
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

  async function remove(category: Category) {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    setError(null);
    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to delete");
      return;
    }
    router.refresh();
  }

  return (
      <div className="space-y-6">
        {/* 1. Header with Breadcrumbs & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
              <span>Spatial Taxonomy</span>
              <span>·</span>
              <span>{categories.length} Living Environments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
              Category &amp; Room Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#4A483E]/80">
              Define architectural room groupings, display order, and storefront collection descriptions.
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
          <span style={{ color: "#FFFFFF" }}>Add Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Visual Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const img =
            category.image_url ||
            ROOM_IMAGES[category.slug] ||
            "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80";

          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-44 bg-[#F4F0E8] overflow-hidden">
                  <Image
                    src={img}
                    alt={category.name}
                    fill
                    sizes="400px"
                    className="object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#1A1C18] text-[10px] font-bold font-mono">
                      Order: #{category.sort_order}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono text-[#D8C9B5] uppercase tracking-wider block">
                      slug: {category.slug}
                    </span>
                    <h3 className="text-xl font-bold font-editorial text-white leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Description Body */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[#4A483E] leading-relaxed line-clamp-3">
                    {category.description || "Thoughtfully designed essentials for this living space."}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 border-t border-[#1A1C18]/8 bg-[#FAF9F6] flex items-center justify-between">
                <Link
                  href={`/shop?category=${category.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A927A] hover:text-[#1A1C18] transition-colors"
                >
                  <span>View in Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="p-1.5 rounded-lg text-[#4A483E] hover:text-[#1A1C18] hover:bg-stone-200 transition-colors"
                    title="Edit category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    className="p-1.5 rounded-lg text-[#4A483E] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Modal Editor Dialog */ }
      { draft && (
        <div className="fixed inset-0 z-50 bg-[#1A1C18]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#1A1C18]/15 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
              <h3 className="text-lg font-bold text-[#1A1C18]">
                {isCreating ? "Create Category" : "Edit Category"}
              </h3>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="p-1.5 rounded-full text-[#4A483E] hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Living Room, Dining, Lighting"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                />
              </div>

              <div className="space-y-1.5">
                <ImageUploadInput
                  bucket="product-images"
                  label="Category Lifestyle Photography"
                  value={draft.image_url}
                  onChange={(url) => setDraft({ ...draft, image_url: url })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Describe this spatial environment and the essentials crafted for it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
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
                <span style={{ color: "#FFFFFF" }}>{isSaving ? "Saving..." : "Save Category"}</span>
              </button>
            </div>
          </div>
      </div>
      )}
    </div >
  );
}
