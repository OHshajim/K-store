"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Plus,
  Trash2,
  ImageIcon,
  DollarSign,
  Package,
  Layers,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/format";

const ROOM_OPTIONS = [
  { value: "living", label: "Living Room", icon: "🛋️" },
  { value: "workspace", label: "Workspace & Studio", icon: "💻" },
  { value: "kitchen", label: "Kitchen & Dining", icon: "🍽️" },
  { value: "bedroom", label: "Bedroom Sanctuary", icon: "🛏️" },
  { value: "bathroom", label: "Bathroom & Spa", icon: "🚿" },
  { value: "lighting", label: "Atmospheric Lighting", icon: "✨" },
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [isSlugLocked, setIsSlugLocked] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState(product?.details ?? "");

  // Pricing & Stock
  const [price, setPrice] = useState((product?.price_cents ?? 0) / 100);
  const [comparePrice, setComparePrice] = useState(
    product?.compare_at_cents ? product.compare_at_cents / 100 : 0
  );
  const [stock, setStock] = useState(product?.stock ?? 12);

  // Taxonomy & Specs
  const [sku, setSku] = useState(product?.sku ?? "");
  const [material, setMaterial] = useState(product?.material ?? "Solid White Oak");
  const [room, setRoom] = useState(product?.room ?? "living");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");

  // Toggles
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);

  // Image management
  const [imageList, setImageList] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-generate slug when name changes (if unlocked)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugLocked) {
      setSlug(slugify(val));
    }
  };

  // Upload handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setImageList((prev) => [...prev, data.url]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddImageUrl() {
    if (!newImageUrl.trim()) return;
    setImageList((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  }

  function handleRemoveImage(indexToRemove: number) {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleSetAsCover(index: number) {
    setImageList((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [item, ...rest];
    });
  }

  // Calculate promotional savings
  const savingsAmount = comparePrice > price ? comparePrice - price : 0;
  const savingsPercent = comparePrice > price ? Math.round((savingsAmount / comparePrice) * 100) : 0;

  // Save product
  async function saveProduct() {
    if (!name.trim()) {
      setError("Please provide a product title.");
      return;
    }
    if (price <= 0) {
      setError("Please set a valid retail price greater than zero.");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || slugify(name),
            description: description.trim(),
            details: details.trim() || null,
            price_cents: Math.round(price * 100),
            compare_at_cents: comparePrice > 0 ? Math.round(comparePrice * 100) : null,
            stock: Math.max(0, Math.floor(stock)),
            sku: sku.trim() || null,
            material: material.trim() || null,
            room: room || null,
            images: imageList,
            is_active: isActive,
            is_featured: isFeatured,
            is_bestseller: isBestseller,
            category_id: categoryId || null,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save product.");

      setSuccessMsg("Product specifications successfully saved and published!");
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  // Delete product
  async function deleteProduct() {
    if (!product) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete product.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete product.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Alert Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-900 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block">Action Required</span>
            {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-emerald-900 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-semibold">{successMsg}</div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Core Content & Photography (8 cols)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Identification & Narrative Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1C18] font-sans">
                    Product Identification &amp; Editorial
                  </h2>
                  <p className="text-xs text-[#4A483E]/70">
                    Public title, permalink handle, and Scandinavian design narrative.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A927A] px-2.5 py-1 bg-[#8A927A]/10 rounded-full font-bold">
                Catalog Core
              </span>
            </div>

            <div className="space-y-5">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-2 font-sans">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sculptural Lounge Armchair"
                  required
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-2xl text-sm font-semibold text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all"
                />
              </div>

              {/* Slug / Permlink */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                    URL Slug (Handle) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#8A927A] hover:text-[#1A1C18] transition-colors cursor-pointer"
                  >
                    {isSlugLocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-[#B78E69]" />
                        <span className="text-[#B78E69] font-bold">Unlocked</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center rounded-2xl border border-[#1A1C18]/15 bg-[#FDFBF7] overflow-hidden focus-within:ring-2 focus-within:ring-[#B78E69]/30 focus-within:border-[#B78E69]">
                  <span className="px-4 py-3 text-xs font-mono text-[#4A483E]/60 bg-[#F4F0E8] border-r border-[#1A1C18]/10 select-none">
                    /product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={isSlugLocked}
                    placeholder="sculptural-lounge-armchair"
                    className="flex-1 px-4 py-3 bg-transparent text-xs font-mono text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  {product && (
                    <Link
                      href={`/product/${product.slug}`}
                      target="_blank"
                      className="px-3.5 py-3 text-[#8A927A] hover:text-[#1A1C18] transition-colors"
                      title="Open storefront page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-[#4A483E]/70 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#8A927A]" />
                  Unique web address for shoppers, search engines, and social media previews.
                </p>
              </div>

              {/* Editorial Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                    Editorial Description <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#4A483E]/60">
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the architectural form, organic comfort, and functional purpose of this furniture piece..."
                  required
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-2xl text-xs sm:text-sm text-[#1A1C18] leading-relaxed placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all resize-y"
                />
              </div>

              {/* Craftsmanship & Specifications */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-2 font-sans">
                  Craftsmanship &amp; Material Specifications
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Crafted in Småland, Sweden. Precision mortise-and-tenon joinery with non-toxic natural beeswax oil finish..."
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-2xl text-xs sm:text-sm text-[#1A1C18] leading-relaxed placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* 2. Photography & Visual Assets Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#8A927A]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1C18] font-sans flex items-center gap-2">
                    Photography &amp; Gallery
                    <span className="text-xs font-normal text-[#8A927A] px-2 py-0.5 bg-[#8A927A]/10 rounded-full font-mono">
                      {imageList.length} {imageList.length === 1 ? "asset" : "assets"}
                    </span>
                  </h2>
                  <p className="text-xs text-[#4A483E]/70">
                    High-resolution imagery. The first photo serves as the storefront cover card.
                  </p>
                </div>
              </div>

              {/* Upload Trigger */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  data-btn="dark"
                  style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                  className="px-4 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-white" style={{ color: "#FFFFFF" }} />
                  <span style={{ color: "#FFFFFF" }}>
                    {isUploading ? "Uploading file…" : "Upload from Device"}
                  </span>
                </button>
              </div>
            </div>

            {/* Media Gallery Grid */}
            {imageList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageList.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#1A1C18]/15 bg-[#F4F0E8] shadow-2xs transition-all hover:shadow-md"
                  >
                    <Image
                      src={url}
                      alt={`Product photography asset ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Permanent Cover Badge on First Photo */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2.5 py-1 bg-[#1A1C18] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#B78E69]" />
                          Cover
                        </span>
                      </div>
                    )}

                    {/* Hover Controls Overlay */}
                    <div className="absolute inset-0 bg-[#1A1C18]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 z-20">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {idx !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(idx)}
                            className="px-2.5 py-1 bg-white text-[#1A1C18] text-[10px] font-bold rounded-lg hover:bg-[#F4F0E8] transition-colors cursor-pointer shadow-xs"
                          >
                            Set as Cover
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/80 font-mono">Primary</span>
                        )}
                        <span className="text-[10px] text-white/90 font-mono">#{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-[#1A1C18]/15 rounded-2xl text-center bg-[#FDFBF7] p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#B78E69]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1C18]">No Photography Added Yet</h4>
                <p className="text-xs text-[#4A483E]/70 max-w-sm mx-auto">
                  Upload crisp photos from your computer or paste CDN image URLs below.
                </p>
              </div>
            )}

            {/* Manual Image URL Adder */}
            <div className="pt-2 border-t border-[#1A1C18]/10">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A483E]/80 mb-2 font-sans">
                Or Link an External Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 bg-white border border-[#1A1C18]/20 text-[#1A1C18] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Pricing, Taxonomy, Status & Save (4 cols)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 3. Pricing & Stock Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10">
              <div className="w-7 h-7 rounded-lg bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1C18]">Pricing &amp; Inventory</h3>
            </div>

            <div className="space-y-4">
              {/* Retail Price */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-sans">
                  Current Retail Price ($) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-[#1A1C18]/15 bg-[#FDFBF7] focus-within:ring-2 focus-within:ring-[#B78E69]/30 focus-within:border-[#B78E69] overflow-hidden">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A483E]/60 select-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-transparent text-sm font-bold text-[#1A1C18] focus:outline-none"
                  />
                </div>
              </div>

              {/* Compare-at Price */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                    Compare-at / Original ($)
                  </label>
                  {savingsAmount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Save ${savingsAmount.toFixed(2)} ({savingsPercent}%)
                    </span>
                  )}
                </div>
                <div className="relative rounded-xl border border-[#1A1C18]/15 bg-[#FDFBF7] focus-within:ring-2 focus-within:ring-[#B78E69]/30 focus-within:border-[#B78E69] overflow-hidden">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A483E]/60 select-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={comparePrice}
                    onChange={(e) => setComparePrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-transparent text-sm font-bold text-[#1A1C18] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#4A483E]/60 mt-1">
                  If higher than retail price, a discount badge is displayed.
                </p>
              </div>

              {/* Inventory Stock Units */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                    Inventory Units
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      stock > 10
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : stock > 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="relative rounded-xl border border-[#1A1C18]/15 bg-[#FDFBF7] focus-within:ring-2 focus-within:ring-[#B78E69]/30 focus-within:border-[#B78E69] overflow-hidden">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 bg-transparent text-sm font-bold text-[#1A1C18] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Taxonomy & Environment Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10">
              <div className="w-7 h-7 rounded-lg bg-[#F4F0E8] flex items-center justify-center text-[#8A927A]">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1C18]">Taxonomy &amp; Environment</h3>
            </div>

            <div className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-sans">
                  Storefront Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-semibold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all cursor-pointer pr-10"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#4A483E]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Room Atmosphere */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-sans">
                  Living Space Atmosphere
                </label>
                <div className="relative">
                  <select
                    value={room}
                    onChange={(e) => setRoom((e.target.value as typeof room) || "living")}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-semibold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all cursor-pointer pr-10"
                  >
                    {ROOM_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.icon} {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#4A483E]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SKU Code */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-sans">
                  Inventory SKU Code
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. KST-1042"
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-mono text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all"
                />
              </div>

              {/* Core Material */}
              <div>
                <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-sans">
                  Primary Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Solid White Oak, Anodized Aluminum"
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-semibold text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all"
                />
              </div>
            </div>
          </div>

          {/* 5. Visibility & Badges Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A1C18] pb-3 border-b border-[#1A1C18]/10">
              Visibility &amp; Badges
            </h3>

            <div className="space-y-3">
              {/* Active Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/10 cursor-pointer hover:bg-[#F4F0E8]/50 transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#1A1C18] block">Active in Catalog</span>
                  <span className="text-[11px] text-[#4A483E]/70">Visible to customer shoppers</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#1A1C18] rounded-md accent-[#1A1C18] cursor-pointer"
                />
              </label>

              {/* Featured Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/10 cursor-pointer hover:bg-[#F4F0E8]/50 transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#1A1C18] block">Featured on Home</span>
                  <span className="text-[11px] text-[#4A483E]/70">Showcased in curations</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#1A1C18] rounded-md accent-[#1A1C18] cursor-pointer"
                />
              </label>

              {/* Bestseller Badge Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/10 cursor-pointer hover:bg-[#F4F0E8]/50 transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#1A1C18] block">Bestseller Badge</span>
                  <span className="text-[11px] text-[#4A483E]/70">Appends top emblem</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="w-4 h-4 text-[#1A1C18] rounded-md accent-[#1A1C18] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 6. Sticky Action Console */}
          <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-md space-y-3 sticky top-6 z-10">
            <button
              type="button"
              disabled={isSaving}
              onClick={saveProduct}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span style={{ color: "#FFFFFF" }}>
                {isSaving
                  ? "Saving Changes…"
                  : product
                  ? "Save & Publish Changes"
                  : "Create & Land Product"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="w-full py-3 px-4 rounded-2xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer text-center"
            >
              Cancel &amp; Return
            </button>

            {product && (
              <div className="pt-2 border-t border-[#1A1C18]/10 text-center">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                  >
                    Archive / Delete Product
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                    <p className="text-[11px] text-rose-900 font-semibold">
                      Are you sure you want to deactivate this product?
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={deleteProduct}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting…" : "Yes, Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] rounded-xl hover:bg-[#F4F0E8] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
