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
  Ruler,
  Palette,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Category, ColorVariant, Product } from "@/lib/types";
import { slugify } from "@/lib/format";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";

const ROOM_OPTIONS = [
  { value: "living", label: "Living Room", icon: "🛋️" },
  { value: "workspace", label: "Workspace & Studio", icon: "💻" },
  { value: "kitchen", label: "Kitchen & Dining", icon: "🍽️" },
  { value: "bedroom", label: "Bedroom Sanctuary", icon: "🛏️" },
  { value: "bathroom", label: "Bathroom & Spa", icon: "🚿" },
  { value: "lighting", label: "Atmospheric Lighting", icon: "✨" },
];

const PRESET_COLORS: Array<{ name: string; hex: string }> = [
  { name: "Natural Oak", hex: "#D8C9B5" },
  { name: "Matte Charcoal", hex: "#292B27" },
  { name: "American Walnut", hex: "#5C4033" },
  { name: "Sage Mist", hex: "#8A927A" },
  { name: "Chalk Linen", hex: "#EFECE6" },
  { name: "Brushed Brass", hex: "#B78E69" },
];

const PRESET_MATERIALS = [
  "Solid White Oak",
  "Solid Ash",
  "American Walnut",
  "Smoked Ash",
  "Brushed Brass",
  "Powder-Coated Steel",
  "Natural Travertine",
];

const PRESET_SPEC_KEYS = [
  "Origin",
  "Finish",
  "Joinery",
  "Assembly",
  "Max Load",
  "Light Source",
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

  // Variants, Care & Technical Specs
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>(
    Array.isArray(product?.color_variants) ? product.color_variants : []
  );
  const [materialVariants, setMaterialVariants] = useState<string[]>(
    Array.isArray(product?.material_variants) ? product.material_variants : []
  );
  const [newMaterialOption, setNewMaterialOption] = useState("");
  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>(
    product?.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value ?? ""),
        }))
      : []
  );
  const [careInstructions, setCareInstructions] = useState(
    product?.care_instructions ?? ""
  );

  // Architectural Dimensions & Weight (for Kstore Fit Assistant & Product Detail)
  const [widthCm, setWidthCm] = useState<number | "">(product?.dimensions?.width_cm ?? "");
  const [depthCm, setDepthCm] = useState<number | "">(product?.dimensions?.depth_cm ?? "");
  const [heightCm, setHeightCm] = useState<number | "">(product?.dimensions?.height_cm ?? "");
  const [weightKg, setWeightKg] = useState<number | "">(product?.weight_kg ?? "");

  // Toggles
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);

  // Image management
  const [imageList, setImageList] = useState<string[]>(
    product?.images && product.images.length > 0 ? product.images : []
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

  // Color finish variant handlers
  function addColorVariant(presetName = "", presetHex = "#D8C9B5") {
    if (
      presetName &&
      colorVariants.some(
        (v) => v.name.trim().toLowerCase() === presetName.trim().toLowerCase()
      )
    ) {
      return;
    }
    setColorVariants((prev) => [
      ...prev,
      { name: presetName, hex: presetHex, in_stock: true },
    ]);
  }

  function updateColorVariant(
    idx: number,
    patch: Partial<ColorVariant>
  ) {
    setColorVariants((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
  }

  function removeColorVariant(idx: number) {
    setColorVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  // Timber / material option handlers
  function addMaterialVariant(value?: string) {
    const candidate = (value ?? newMaterialOption).trim();
    if (!candidate) return;
    if (
      materialVariants.some(
        (m) => m.trim().toLowerCase() === candidate.toLowerCase()
      )
    ) {
      if (!value) setNewMaterialOption("");
      return;
    }
    setMaterialVariants((prev) => [...prev, candidate]);
    if (!value) setNewMaterialOption("");
  }

  function removeMaterialVariant(idx: number) {
    setMaterialVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  // Specification key-value handlers
  function addSpecRow(presetKey = "") {
    if (
      presetKey &&
      specRows.some(
        (row) => row.key.trim().toLowerCase() === presetKey.trim().toLowerCase()
      )
    ) {
      return;
    }
    setSpecRows((prev) => [...prev, { key: presetKey, value: "" }]);
  }

  function updateSpecRow(idx: number, field: "key" | "value", val: string) {
    setSpecRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  }

  function removeSpecRow(idx: number) {
    setSpecRows((prev) => prev.filter((_, i) => i !== idx));
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
    if (imageList.length === 0) {
      setError("Please upload or add at least one product image.");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const dimensions =
        typeof widthCm === "number" && widthCm > 0
          ? {
              width_cm: widthCm,
              depth_cm: typeof depthCm === "number" && depthCm > 0 ? depthCm : 0,
              height_cm: typeof heightCm === "number" && heightCm > 0 ? heightCm : 0,
              text: `${widthCm} × ${typeof depthCm === "number" && depthCm > 0 ? depthCm : 0} × ${
                typeof heightCm === "number" && heightCm > 0 ? heightCm : 0
              } cm (${(widthCm / 2.54).toFixed(1)}" × ${(
                (typeof depthCm === "number" && depthCm > 0 ? depthCm : 0) / 2.54
              ).toFixed(1)}" × ${(
                (typeof heightCm === "number" && heightCm > 0 ? heightCm : 0) / 2.54
              ).toFixed(1)}")`,
            }
          : null;

      const normalizedColors = colorVariants
        .map((c) => {
          const cleanHex = c.hex.trim();
          return {
            name: c.name.trim(),
            hex: /^#[0-9a-fA-F]{3,8}$/.test(cleanHex) ? cleanHex : "#D8C9B5",
            in_stock: Boolean(c.in_stock),
          };
        })
        .filter((c) => c.name.length > 0);

      const normalizedMaterials = materialVariants
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const normalizedSpecs: Record<string, string> = {};
      for (const row of specRows) {
        const cleanKey = row.key.trim();
        const cleanVal = row.value.trim();
        if (cleanKey && cleanVal) {
          normalizedSpecs[cleanKey] = cleanVal;
        }
      }

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
            dimensions,
            weight_kg: typeof weightKg === "number" && weightKg > 0 ? weightKg : null,
            color_variants: normalizedColors,
            material_variants: normalizedMaterials,
            specifications: normalizedSpecs,
            care_instructions: careInstructions.trim() || null,
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

          {/* 3. Color Finishes & Timber / Material Options Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1C18] font-sans flex items-center gap-2">
                    Color Finishes &amp; Material Options
                    <span className="text-xs font-normal text-[#8A927A] px-2 py-0.5 bg-[#8A927A]/10 rounded-full font-mono">
                      {colorVariants.length} colors · {materialVariants.length} materials
                    </span>
                  </h2>
                  <p className="text-xs text-[#4A483E]/70">
                    Define selectable swatches and timber/material options shown on product cards, Shop filters, and Fit Assistant.
                  </p>
                </div>
              </div>
            </div>

            {/* Color Variants Sub-Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                  Color Finishes (Swatches)
                </label>
                <button
                  type="button"
                  onClick={() => addColorVariant("", "#D8C9B5")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A1C18]/20 bg-[#FDFBF7] hover:bg-[#F4F0E8] text-xs font-semibold text-[#1A1C18] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B78E69]" />
                  <span>Add Custom Color</span>
                </button>
              </div>

              {/* Quick Finish Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A483E]/70 mr-1">
                  Quick Add:
                </span>
                {PRESET_COLORS.map((preset) => {
                  const alreadyAdded = colorVariants.some(
                    (c) => c.name.trim().toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addColorVariant(preset.name, preset.hex)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#1A1C18]/12 bg-[#FDFBF7] hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1A1C18] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {colorVariants.length > 0 ? (
                <div className="space-y-2.5">
                  {colorVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/12"
                    >
                      {/* Native Color Picker + Hex Code */}
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="color"
                          aria-label={`Color picker for ${variant.name || `finish ${idx + 1}`}`}
                          value={
                            /^#[0-9a-fA-F]{6}$/.test(variant.hex)
                              ? variant.hex
                              : "#D8C9B5"
                          }
                          onChange={(e) =>
                            updateColorVariant(idx, { hex: e.target.value.toUpperCase() })
                          }
                          className="w-8 h-8 rounded-lg border border-[#1A1C18]/20 bg-white p-0.5 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={variant.hex}
                          onChange={(e) =>
                            updateColorVariant(idx, { hex: e.target.value })
                          }
                          placeholder="#D8C9B5"
                          className="w-24 px-2.5 py-1.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-mono text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                        />
                      </div>

                      {/* Color Name */}
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          updateColorVariant(idx, { name: e.target.value })
                        }
                        placeholder="Finish name (e.g. Natural Ash & Charcoal)"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                      />

                      {/* Stock Toggle & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#1A1C18]/12 bg-white text-[11px] font-medium text-[#1A1C18] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.in_stock}
                            onChange={(e) =>
                              updateColorVariant(idx, { in_stock: e.target.checked })
                            }
                            className="w-3.5 h-3.5 accent-[#1A1C18] rounded cursor-pointer"
                          />
                          <span>In Stock</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeColorVariant(idx)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove color finish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#4A483E]/70 bg-[#FDFBF7] border border-dashed border-[#1A1C18]/15 rounded-2xl p-4">
                  No color finishes configured yet. Add one above so shoppers can choose color swatches on the storefront.
                </p>
              )}
            </div>

            {/* Material Variants Sub-Section */}
            <div className="pt-5 border-t border-[#1A1C18]/10 space-y-3.5">
              <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                Timber / Material Options
              </label>

              {materialVariants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {materialVariants.map((mat, idx) => (
                    <span
                      key={`${mat}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold"
                    >
                      <span>{mat}</span>
                      <button
                        type="button"
                        onClick={() => removeMaterialVariant(idx)}
                        className="p-0.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                        aria-label={`Remove ${mat}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMaterialOption}
                  onChange={(e) => setNewMaterialOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMaterialVariant();
                    }
                  }}
                  placeholder="Add timber or material option (e.g. Solid Ash, American Walnut)"
                  className="flex-1 px-4 py-2.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all"
                />
                <button
                  type="button"
                  onClick={() => addMaterialVariant()}
                  className="px-4 py-2.5 bg-white border border-[#1A1C18]/20 text-[#1A1C18] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A483E]/70 mr-1">
                  Quick Add:
                </span>
                {PRESET_MATERIALS.map((preset) => {
                  const alreadyAdded = materialVariants.some(
                    (m) => m.trim().toLowerCase() === preset.toLowerCase()
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addMaterialVariant(preset)}
                      className="px-2.5 py-1 rounded-lg border border-[#1A1C18]/12 bg-[#FDFBF7] hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1A1C18] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Architectural Specifications & Product Care Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#8A927A]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1C18] font-sans flex items-center gap-2">
                    Specifications &amp; Care Instructions
                    <span className="text-xs font-normal text-[#8A927A] px-2 py-0.5 bg-[#8A927A]/10 rounded-full font-mono">
                      {specRows.filter((r) => r.key.trim() && r.value.trim()).length} specs
                    </span>
                  </h2>
                  <p className="text-xs text-[#4A483E]/70">
                    Structured key-value details and maintenance guidance displayed inside the product page accordion.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => addSpecRow("")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A1C18]/20 bg-[#FDFBF7] hover:bg-[#F4F0E8] text-xs font-semibold text-[#1A1C18] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#B78E69]" />
                <span>Add Specification</span>
              </button>
            </div>

            {/* Key-Value Spec Rows */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A483E]/70 mr-1">
                  Suggested Keys:
                </span>
                {PRESET_SPEC_KEYS.map((presetKey) => {
                  const alreadyAdded = specRows.some(
                    (row) => row.key.trim().toLowerCase() === presetKey.toLowerCase()
                  );
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addSpecRow(presetKey)}
                      className="px-2.5 py-1 rounded-lg border border-[#1A1C18]/12 bg-[#FDFBF7] hover:bg-[#F4F0E8] text-[11px] font-medium text-[#1A1C18] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + {presetKey}
                    </button>
                  );
                })}
              </div>

              {specRows.length > 0 ? (
                <div className="space-y-2.5">
                  {specRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/12"
                    >
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => updateSpecRow(idx, "key", e.target.value)}
                        placeholder="Label (e.g. Origin)"
                        className="sm:col-span-4 px-3 py-2 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => updateSpecRow(idx, "value", e.target.value)}
                        placeholder="Value (e.g. Designed in Copenhagen, Denmark)"
                        className="sm:col-span-7 px-3 py-2 rounded-xl border border-[#1A1C18]/15 bg-white text-xs text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                      />
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeSpecRow(idx)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove specification row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#4A483E]/70 bg-[#FDFBF7] border border-dashed border-[#1A1C18]/15 rounded-2xl p-4">
                  No custom specifications added yet (Origin, Finish, Assembly, Max Load, etc.).
                </p>
              )}
            </div>

            {/* Care Instructions */}
            <div className="pt-4 border-t border-[#1A1C18]/10">
              <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-2 font-sans">
                Product Care &amp; Longevity Instructions
              </label>
              <textarea
                rows={3}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Wipe with a lightly dampened microfiber cloth along the grain. Refresh timber annually with natural hardwax oil."
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-2xl text-xs sm:text-sm text-[#1A1C18] leading-relaxed placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all resize-y"
              />
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

          {/* Architectural Dimensions Card (Fit Assistant Engine) */}
          <div className="bg-white rounded-3xl p-6 border border-[#1A1C18]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F4F0E8] flex items-center justify-center text-[#8A927A]">
                  <Ruler className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1A1C18]">Architectural Dimensions (cm)</h3>
              </div>
              <span className="text-[10px] font-mono text-[#8A927A] px-2 py-0.5 bg-[#8A927A]/10 rounded-full font-bold uppercase tracking-wider">
                Fit Engine
              </span>
            </div>

            <p className="text-xs text-[#4A483E]/70 font-sans">
              Enter physical dimensions to enable precise clearance &amp; breathing room calculations in the Kstore Fit Assistant.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1C18] uppercase tracking-wider mb-1 font-sans">
                  Width (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-mono font-bold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1A1C18] uppercase tracking-wider mb-1 font-sans">
                  Depth (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={depthCm}
                  onChange={(e) => setDepthCm(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 32"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-mono font-bold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1A1C18] uppercase tracking-wider mb-1 font-sans">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 85"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-mono font-bold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                  Net Weight (kg)
                </label>
                {typeof weightKg === "number" && weightKg > 0 && (
                  <span className="text-[10px] font-mono text-[#8A927A]">
                    {(weightKg * 2.205).toFixed(1)} lbs
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                placeholder="e.g. 7.2"
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs font-mono font-bold text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69]"
              />
            </div>

            {typeof widthCm === "number" && widthCm > 0 ? (
              <div className="p-2.5 rounded-xl bg-[#F4F0E8] text-[#1A1C18] text-[11px] font-mono flex items-center justify-between border border-[#1A1C18]/10">
                <span className="text-[#8A927A] font-bold">Auto Spec:</span>
                <span>
                  {widthCm} × {depthCm || 0} × {heightCm || 0} cm ({(widthCm / 2.54).toFixed(1)}&quot; × {(((depthCm as number) || 0) / 2.54).toFixed(1)}&quot; × {(((heightCm as number) || 0) / 2.54).toFixed(1)}&quot;)
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-[#4A483E]/60 italic">
                Leave empty for universal / tabletop accessories without rigid boundaries.
              </p>
            )}
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
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                >
                  Archive / Delete Product
                </button>

                <ConfirmationModal
                  isOpen={showDeleteConfirm}
                  onClose={() => {
                    if (!isDeleting) setShowDeleteConfirm(false);
                  }}
                  onConfirm={deleteProduct}
                  isLoading={isDeleting}
                  title="Archive / Delete Product"
                  subtitle="Catalog Inventory Action"
                  variant="danger"
                  confirmText="Yes, Delete Product"
                  cancelText="Keep Product"
                  description={
                    <div className="space-y-2">
                      <p>
                        Are you sure you want to delete <strong className="text-[#1A1C18]">&quot;{name || product.name}&quot;</strong>?
                      </p>
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
                        <strong>Permanent Action:</strong> This product will be deactivated and removed from the active catalog and customer room collections.
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
