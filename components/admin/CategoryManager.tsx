"use client";

import { useState, useMemo, useEffect } from "react";
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
  Search,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  Layers,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { slugify } from "@/lib/format";

const ROOM_DEFAULT_IMAGES: Record<string, string> = {
  living: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "living-room": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  workspace: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
  bedroom: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  bathroom: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  lighting: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
};

type Draft = {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  image_url: string;
};

export function CategoryManager({
  initialCategories,
  productCounts = {},
  totalProductsCount = 0,
}: {
  initialCategories: Category[];
  productCounts?: Record<string, number>;
  totalProductsCount?: number;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(
    [...initialCategories].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  // Aggregate stats
  const totalAssignedProducts = useMemo(() => {
    return categories.reduce(
      (sum, cat) => sum + (productCounts[cat.id] || 0),
      0,
    );
  }, [categories, productCounts]);

  const topCategory = useMemo(() => {
    if (categories.length === 0) return null;
    let top = categories[0];
    let maxCount = productCounts[top.id] || 0;
    for (const cat of categories) {
      const c = productCounts[cat.id] || 0;
      if (c > maxCount) {
        maxCount = c;
        top = cat;
      }
    }
    return { category: top, count: maxCount };
  }, [categories, productCounts]);

  // Close modal on Escape and lock body scroll
  useEffect(() => {
    if (!draft) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        setDraft(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draft, isSaving]);

  function handleCopySlug(slug: string) {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  function openCreate() {
    setEditing(null);
    setDraft({
      name: "",
      slug: "",
      description: "",
      sort_order: categories.length + 1,
      image_url: "",
    });
    setError(null);
    setIsCreating(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDraft({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sort_order: category.sort_order,
      image_url: category.image_url ?? "",
    });
    setError(null);
    setIsCreating(false);
  }

  async function handleMoveOrder(index: number, direction: "up" | "down") {
    if (isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = categories[index];
    const targetCat = categories[targetIndex];

    const currentOrder = currentCat.sort_order;
    const targetOrder = targetCat.sort_order;

    // New order: if they share the same sort_order, bump mathematically
    const newCurrentOrder =
      currentOrder === targetOrder
        ? direction === "up"
          ? targetOrder - 1
          : targetOrder + 1
        : targetOrder;
    const newTargetOrder = currentOrder;

    // Optimistic update
    const updated = [...categories];
    updated[index] = { ...currentCat, sort_order: newCurrentOrder };
    updated[targetIndex] = { ...targetCat, sort_order: newTargetOrder };
    updated.sort((a, b) => a.sort_order - b.sort_order);
    setCategories(updated);
    setIsReordering(true);

    try {
      await Promise.all([
        fetch(`/api/admin/categories/${currentCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newCurrentOrder }),
        }),
        fetch(`/api/admin/categories/${targetCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: newTargetOrder }),
        }),
      ]);
      router.refresh();
    } catch {
      // Revert if error
      setCategories(categories);
    } finally {
      setIsReordering(false);
    }
  }

  async function save() {
    if (!draft || !draft.name.trim()) {
      setError("Please provide a category name.");
      return;
    }
    setError(null);
    setIsSaving(true);

    const finalSlug = draft.slug.trim() || slugify(draft.name);

    try {
      const response = await fetch(
        isCreating
          ? "/api/admin/categories"
          : `/api/admin/categories/${editing!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name.trim(),
            slug: finalSlug,
            description: draft.description.trim() || null,
            sort_order: Number(draft.sort_order) || 0,
            image_url: draft.image_url.trim() || null,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save category");

      setDraft(null);
      setSuccess(
        isCreating
          ? `Created category "${draft.name}" successfully.`
          : `Updated category "${draft.name}" successfully.`,
      );
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  function initiateDelete(category: Category) {
    setCategoryToDelete(category);
  }

  async function executeDeleteCategory() {
    if (!categoryToDelete) return;

    setIsDeletingCategory(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete category");
      }
      const deletedName = categoryToDelete.name;
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      setSuccess(`Deleted category "${deletedName}".`);
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete category");
      setCategoryToDelete(null);
    } finally {
      setIsDeletingCategory(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Architectural Kicker & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#8A927A] uppercase tracking-wider mb-1.5">
            <Layers className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Spatial Taxonomy</span>
            <span>·</span>
            <span>Architectural Merchandising</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
            Category &amp; Room Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 max-w-2xl mt-1 leading-relaxed">
            Curate spatial living rooms, set display priority, and organize
            architectural home essentials across the storefront catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span style={{ color: "#FFFFFF" }}>Add Living Collection</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* 2. Key Performance Indicators (KPI Ribbon) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-[#8A927A] uppercase tracking-wider block font-semibold">
            Living Spaces
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#1A1C18]">
              {categories.length}
            </span>
            <span className="text-xs text-[#4A483E]/70 font-sans">
              Rooms Configured
            </span>
          </div>
        </div>

        {/* Assigned Products */}
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-[#8A927A] uppercase tracking-wider block font-semibold">
            Assigned Essentials
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-[#1A1C18]">
              {totalAssignedProducts}
            </span>
            <span className="text-xs text-[#4A483E]/70 font-sans">
              of {totalProductsCount} Catalog Items
            </span>
          </div>
        </div>

        {/* Largest Collection */}
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-[#8A927A] uppercase tracking-wider block font-semibold">
            Most Stocked Space
          </span>
          <div className="flex items-baseline gap-2 truncate">
            <span className="text-base font-bold text-[#1A1C18] truncate">
              {topCategory?.category.name || "None"}
            </span>
            <span className="text-xs font-mono font-bold text-[#B78E69]">
              ({topCategory?.count || 0} items)
            </span>
          </div>
        </div>

        {/* Storefront Status */}
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-[#8A927A] uppercase tracking-wider block font-semibold">
            Storefront Sync
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live &amp; Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter, Search & Layout Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A483E]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by collection, slug, description..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#4A483E]/50 hover:text-[#1A1C18]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher & Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-xs text-[#4A483E]/70 font-mono">
            Showing {filteredCategories.length} of {categories.length}{" "}
            environments
          </span>

          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F6] border border-[#1A1C18]/10">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#1A1C18] shadow-xs font-semibold"
                  : "text-[#4A483E]/60 hover:text-[#1A1C18]"
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#1A1C18] shadow-xs font-semibold"
                  : "text-[#4A483E]/60 hover:text-[#1A1C18]"
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content Area */}
      {filteredCategories.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border border-[#1A1C18]/10 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8A927A]/15 text-[#8A927A] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
              No Living Environments Found
            </h3>
            <p className="text-xs text-[#4A483E]/70 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword.`
                : "Your store does not have any room categories configured yet."}
            </p>
          </div>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-stone-50"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A]"
            >
              Create Your First Room
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Visual Cards Gallery Grid - Architectural Padded Framing */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => {
            const img =
              category.image_url ||
              ROOM_DEFAULT_IMAGES[category.slug] ||
              "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80";
            const itemCount = productCounts[category.id] || 0;

            return (
              <div
                key={category.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] hover:shadow-[0_8px_28px_rgba(26,28,24,0.08)] hover:border-[#1A1C18]/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* 1. Framed Lifestyle Photography (Clean & Unobstructed) */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/5">
                    <Image
                      src={img}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                    />

                    {/* Subtle Overlay Badge: Rank & Item Count */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1A1C18] text-[11px] font-mono font-bold shadow-xs">
                        № {String(category.sort_order).padStart(2, "0")}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-[#1A1C18]/85 backdrop-blur-md text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs border border-white/10">
                        <ShoppingBag className="w-3 h-3 text-[#D8C9B5]" />
                        <span>
                          {itemCount} {itemCount === 1 ? "Product" : "Products"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Structured Content Body */}
                  <div className="pt-4 pb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#8A927A]">
                        Living Space
                      </span>

                      <Link
                        href={`/shop?category=${category.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A927A] hover:text-[#1A1C18] transition-colors"
                      >
                        <span>Storefront</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] tracking-tight group-hover:text-[#B78E69] transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-xs text-[#4A483E]/80 leading-relaxed font-sans line-clamp-2 min-h-[2.5rem]">
                      {category.description ||
                        "Architectural essentials and thoughtful storage groupings designed for this living environment."}
                    </p>

                    {/* Route Slug Identifier with Copy Action */}
                    <div className="pt-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF9F6] border border-[#1A1C18]/8 text-[#4A483E] text-[11px] font-mono">
                        <span className="text-[#8A927A]">/shop?category=</span>
                        <span className="font-semibold text-[#1A1C18]">{category.slug}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySlug(category.slug)}
                          title="Copy storefront link slug"
                          className="p-0.5 text-stone-400 hover:text-[#1A1C18] transition-colors ml-0.5"
                        >
                          {copiedSlug === category.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Action & Tactile Reorder Toolbar */}
                <div className="pt-4 border-t border-[#1A1C18]/8 mt-3 flex items-center justify-between">
                  {/* Reorder Stepper Controls */}
                  <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#1A1C18]/10 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={index === 0 || isReordering}
                      onClick={() => handleMoveOrder(index, "up")}
                      title="Move earlier in store order"
                      className="p-1 rounded-lg text-stone-500 hover:text-[#1A1C18] hover:bg-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-stone-700 px-1.5 select-none">
                      Rank #{category.sort_order}
                    </span>
                    <button
                      type="button"
                      disabled={
                        index === filteredCategories.length - 1 || isReordering
                      }
                      onClick={() => handleMoveOrder(index, "down")}
                      title="Move later in store order"
                      className="p-1 rounded-lg text-stone-500 hover:text-[#1A1C18] hover:bg-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      data-btn="dark"
                      style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer"
                      title="Edit Category Details"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                      <span style={{ color: "#FFFFFF" }}>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => initiateDelete(category)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table List Mode */
        <div className="bg-white rounded-3xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1C18]/10 bg-[#FAF9F6] text-[11px] font-mono text-[#8A927A] uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold w-24">Order</th>
                  <th className="py-3.5 px-4 font-semibold">Living Environment</th>
                  <th className="py-3.5 px-4 font-semibold">Slug Identifier</th>
                  <th className="py-3.5 px-4 font-semibold">Catalog Items</th>
                  <th className="py-3.5 px-4 font-semibold">Storefront</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1C18]/8 text-xs">
                {filteredCategories.map((category, index) => {
                  const img =
                    category.image_url ||
                    ROOM_DEFAULT_IMAGES[category.slug] ||
                    "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80";
                  const itemCount = productCounts[category.id] || 0;

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-[#FAF9F6] transition-colors group"
                    >
                      {/* Sort Order & Arrows */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#1A1C18] w-6">
                            #{category.sort_order}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={index === 0 || isReordering}
                              onClick={() => handleMoveOrder(index, "up")}
                              className="text-stone-400 hover:text-[#1A1C18] disabled:opacity-20"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={
                                index === filteredCategories.length - 1 ||
                                isReordering
                              }
                              onClick={() => handleMoveOrder(index, "down")}
                              className="text-stone-400 hover:text-[#1A1C18] disabled:opacity-20"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Collection Thumbnail + Name + Description */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#1A1C18]/10 shadow-2xs">
                            <Image
                              src={img}
                              alt={category.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-editorial text-base font-bold text-[#1A1C18] truncate">
                              {category.name}
                            </h4>
                            <p className="text-[11px] text-[#4A483E]/70 truncate max-w-sm">
                              {category.description || "Living room collection."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug with Copy */}
                      <td className="py-4 px-4 font-mono text-[11px] text-[#8A927A]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-[#1A1C18]">
                            {category.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySlug(category.slug)}
                            title="Copy slug identifier"
                            className="p-1 text-stone-400 hover:text-[#1A1C18]"
                          >
                            {copiedSlug === category.slug ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Product Count Pill */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-[#1A1C18]/10 text-xs font-mono font-medium text-[#1A1C18]">
                          <ShoppingBag className="w-3 h-3 text-[#B78E69]" />
                          <span>{itemCount} Items</span>
                        </span>
                      </td>

                      {/* Storefront Link */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/shop?category=${category.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A927A] hover:text-[#1A1C18] transition-colors"
                        >
                          <span>Store Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(category)}
                            className="p-2 rounded-xl text-stone-500 hover:text-[#1A1C18] hover:bg-stone-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateDelete(category)}
                            className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Rich Category Modal Editor */}
      {draft && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1C18]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSaving) setDraft(null);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#1A1C18]/15 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8A927A]/15 text-[#8A927A] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-[#B78E69]" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
                    {isCreating
                      ? "Create Living Environment"
                      : "Edit Living Environment"}
                  </h3>
                  <span className="text-[11px] text-[#4A483E]/70 font-sans block">
                    Configure architectural space title, editorial summary &amp;
                    lifestyle photography.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="p-1.5 rounded-full text-[#4A483E] hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block font-sans">
                  Environment Title *
                </label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setDraft({
                      ...draft,
                      name,
                      slug: isCreating ? slugify(name) : draft.slug,
                    });
                  }}
                  placeholder="e.g. Living Room, Workspace, Atmospheric Lighting"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18] bg-[#FAF9F6]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block font-sans">
                    URL Slug Identifier
                  </label>
                  <span className="text-[10px] text-[#8A927A] font-mono">
                    /shop?category={draft.slug || "slug"}
                  </span>
                </div>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="e.g. living-room"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono focus:outline-none focus:ring-2 focus:ring-[#1A1C18] bg-[#FAF9F6]"
                />
              </div>

              {/* Lifestyle Image Upload & Preview */}
              <div className="space-y-1.5">
                <ImageUploadInput
                  bucket="product-images"
                  label="Lifestyle Photography (Supabase Storage)"
                  value={draft.image_url}
                  onChange={(url) => setDraft({ ...draft, image_url: url })}
                />
                {draft.image_url && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-[#1A1C18]/10 mt-2">
                    <Image
                      src={draft.image_url}
                      alt="Preview"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-mono text-white/90">
                        Live Image Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Editorial Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block font-sans">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Describe this spatial environment and the functional timber or lighting essentials crafted for it..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18] bg-[#FAF9F6]"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block font-sans">
                  Display Sort Priority (Lower appears first)
                </label>
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      sort_order: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono focus:outline-none focus:ring-2 focus:ring-[#1A1C18] bg-[#FAF9F6]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1C18]/10">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="px-5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={save}
                data-btn="dark"
                style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                className="px-6 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-colors shadow-sm cursor-pointer"
              >
                <span style={{ color: "#FFFFFF" }}>
                  {isSaving ? "Saving Environment..." : "Save Collection"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Modal */}
      {categoryToDelete && (
        <ConfirmationModal
          isOpen={!!categoryToDelete}
          onClose={() => {
            if (!isDeletingCategory) setCategoryToDelete(null);
          }}
          onConfirm={executeDeleteCategory}
          isLoading={isDeletingCategory}
          title="Delete Category"
          subtitle="Spatial Taxonomy Action"
          variant="danger"
          confirmText="Yes, Delete Category"
          cancelText="Keep Category"
          description={
            <div className="space-y-2">
              <p>
                Are you sure you want to delete <strong className="text-[#1A1C18]">&quot;{categoryToDelete.name}&quot;</strong>?
              </p>
              {(productCounts[categoryToDelete.id] || 0) > 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  <strong>Notice:</strong> This category currently contains{" "}
                  <strong>{productCounts[categoryToDelete.id]}</strong> assigned product(s). 
                  Deleting it will leave these products uncategorized in your store.
                </div>
              ) : (
                <p>
                  This action will immediately unlist this room collection from the customer storefront navigation.
                </p>
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
