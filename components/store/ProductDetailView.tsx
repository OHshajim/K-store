"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Check,
  ArrowRight,
  Share2,
} from "lucide-react";
import type { Product, StoreSettings, Review } from "@/lib/types";
import { useCartStore } from "@/lib/cart/store";
import { useWishlistStore } from "@/lib/wishlist/store";
import { useCurrencyStore } from "@/lib/currency/store";
import { ProductCard } from "@/components/store/ProductCard";
import { RecentlyViewed } from "@/components/store/RecentlyViewed";
import { recordRecentlyViewed } from "@/lib/storage/recentlyViewed";

export function ProductDetailView({
  product,
  relatedProducts = [],
  reviews = [],
}: {
  product: Product;
  settings?: StoreSettings;
  relatedProducts?: Product[];
  reviews?: Review[];
}) {
  const router = useRouter();
  const { addProduct } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>(reviews);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewNotice(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: userRating,
          comment: userComment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=/product/${product.slug}`);
          return;
        }
        throw new Error(data.error || "Review submission failed");
      }
      setReviewNotice("Thank you for sharing your impression! It has been recorded.");
      setReviewList((prev) => [
        {
          id: `rev-${Date.now()}`,
          product_id: product.id,
          order_id: "",
          user_id: "",
          rating: userRating,
          comment: userComment.trim() || null,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reviewer_name: "Verified Collector",
        },
        ...prev,
      ]);
      setUserComment("");
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewNotice(null);
      }, 2500);
    } catch (err) {
      setReviewNotice(err instanceof Error ? err.message : "Unable to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isFavorited = isInWishlist(product.id);
  const images = useMemo(
    () =>
      product.images.length > 0
        ? product.images
        : [
            "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80",
          ],
    [product.images]
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.color_variants?.[0]?.name ?? ""
  );
  const [selectedMaterial, setSelectedMaterial] = useState(
    product.material_variants?.[0] ?? product.material ?? "Solid Timber"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("dimensions");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const hasDiscount =
    product.compare_at_cents && product.compare_at_cents > product.price_cents;

  // Track recently viewed products in persistent storage
  useEffect(() => {
    recordRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_cents: product.price_cents,
      compare_at_cents: product.compare_at_cents,
      image: images[0] || product.images?.[0] || "",
      room: product.room,
      material: product.material,
    });
  }, [product, images]);

  // Handle native or clipboard sharing
  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Kstore`,
      text: `Explore ${product.name} crafted for modern living.`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareNotice("Direct piece link copied to clipboard");
      setTimeout(() => setShareNotice(null), 2500);
    }
  };

  // Calculate dynamic delivery window (3 to 5 business days from today)
  const getDeliveryEstimate = () => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);

    const formatOpts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString("en-US", formatOpts)} – ${end.toLocaleDateString("en-US", formatOpts)}`;
  };

  // Sticky bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 550);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close image lightbox on Escape and lock body scroll
  useEffect(() => {
    if (!isZoomOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen]);

  const handleAddToCart = () => {
    addProduct(product, quantity, {
      selectedColor: selectedColor || undefined,
      selectedMaterial: selectedMaterial || undefined,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    addProduct(product, quantity, {
      selectedColor: selectedColor || undefined,
      selectedMaterial: selectedMaterial || undefined,
    });
    router.push("/checkout");
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#4A483E] font-sans">
        <Link href="/" className="hover:text-[#1A1C18] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1A1C18] transition-colors">
          Catalog
        </Link>
        <span>/</span>
        {product.room && (
          <>
            <Link
              href={`/shop?room=${product.room}`}
              className="hover:text-[#1A1C18] transition-colors capitalize"
            >
              {product.room}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#1A1C18] font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Two-Column Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Gallery & Lightbox */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display with Zoom Trigger */}
          <div className="relative aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden bg-white border border-[#1A1C18]/10 shadow-xs group">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-all duration-300"
            />

            {/* Zoom / Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-3 bg-white/80 hover:bg-white text-[#1A1C18] rounded-xl backdrop-blur-md shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-105"
              aria-label="Enlarge image"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.is_bestseller && (
                <span className="px-3 py-1 bg-[#8A927A] text-white text-[11px] font-bold uppercase tracking-wider rounded-md shadow-xs">
                  Bestseller
                </span>
              )}
              {hasDiscount && (
                <span suppressHydrationWarning className="px-3 py-1 bg-[#B78E69] text-white text-[11px] font-bold uppercase tracking-wider rounded-md shadow-xs">
                  Save {formatPrice(product.compare_at_cents! - product.price_cents)}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${selectedImage === index
                    ? "border-[#1A1C18] ring-2 ring-[#1A1C18]/20 scale-102"
                    : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#4A483E] uppercase tracking-wider font-semibold">
              <span>SKU: {product.sku || "KS-ARCH-01"}</span>
              {product.rating && (
                <div className="flex items-center gap-1.5 text-[#1A1C18]">
                  <div className="flex text-[#B78E69]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span>{product.rating}</span>
                  <span className="text-[#4A483E]">({product.review_count ?? 28} Reviews)</span>
                </div>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1C18] leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-mono text-3xl font-bold text-[#1A1C18]" suppressHydrationWarning>
                {formatPrice(product.price_cents)}
              </span>
              {hasDiscount && (
                <span className="font-mono text-lg text-[#4A483E] line-through" suppressHydrationWarning>
                  {formatPrice(product.compare_at_cents!)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#4A483E] leading-relaxed font-sans border-t border-[#1A1C18]/10 pt-4">
            {product.description}
          </p>

          {/* Color Selection */}
          {product.color_variants && product.color_variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[#1A1C18]">
                  Color Finish: <span className="font-normal text-[#4A483E]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {product.color_variants.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedColor(v.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${selectedColor === v.name
                      ? "border-[#1A1C18] bg-white ring-1 ring-[#1A1C18]"
                      : "border-[#1A1C18]/15 bg-white/50 hover:bg-white text-[#4A483E]"
                      }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: v.hex }}
                    />
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material Selection */}
          {product.material_variants && product.material_variants.length > 0 && (
            <div className="space-y-2.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
                Timber / Material Option:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.material_variants.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${selectedMaterial === mat
                      ? "border-[#1A1C18] bg-[#1A1C18] text-white shadow-xs"
                      : "border-[#1A1C18]/20 bg-white text-[#1A1C18] hover:bg-[#F4F0E8]"
                      }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#1A1C18]">
                Quantity
              </span>
              <span
                className={`font-semibold ${product.stock > 5
                  ? "text-[#8A927A]"
                  : product.stock > 0
                    ? "text-amber-700"
                    : "text-red-600"
                  }`}
              >
                {product.stock > 5
                  ? "In Stock · Ready to Dispatch"
                  : product.stock > 0
                    ? `Low Stock · Only ${product.stock} Units Remaining`
                    : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#1A1C18]/20 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold text-[#1A1C18]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${isFavorited
                  ? "bg-[#B78E69] text-white border-transparent shadow-md"
                  : "border-[#1A1C18]/20 bg-white text-[#1A1C18] hover:bg-[#F4F0E8]"
                  }`}
                title={isFavorited ? "In Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>

              {/* Share Piece Button */}
              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-xl border border-[#1A1C18]/20 bg-white text-[#1A1C18] hover:bg-[#F4F0E8] transition-all cursor-pointer"
                title="Share this design"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Share Feedback Toast */}
            {shareNotice && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in duration-150">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{shareNotice}</span>
              </div>
            )}
          </div>

          {/* Dynamic Estimated Delivery & Production Urgency */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#1A1C18]/8 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#8A927A] shrink-0" />
              <div>
                <span className="font-semibold text-[#1A1C18] block">
                  Estimated Delivery: {getDeliveryEstimate()}
                </span>
                <span className="text-[11px] text-[#77766E]">
                  Complimentary white-glove courier dispatch
                </span>
              </div>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                Only {product.stock} Left
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              data-btn={addedFeedback ? "accent" : product.stock <= 0 ? undefined : "dark"}
              style={{ color: product.stock <= 0 ? "#6B7280" : "#FFFFFF" }}
              className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${addedFeedback
                ? "bg-[#8A927A] text-white"
                : product.stock <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#1A1C18] text-white hover:bg-[#3d403a]"
                }`}
            >
              {addedFeedback ? (
                <span className="flex items-center gap-1.5" style={{ color: "#FFFFFF" }}>
                  <Check className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} /> Added to Cart
                </span>
              ) : product.stock <= 0 ? (
                <span>Currently Sold Out</span>
              ) : (
                <span suppressHydrationWarning className="flex items-center gap-1.5" style={{ color: "#FFFFFF" }}>
                  <ShoppingBag className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} /> Add to Cart —{" "}
                  {formatPrice(product.price_cents * quantity)}
                </span>
              )}
            </button>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-white border border-[#1A1C18] text-[#1A1C18] hover:bg-[#F4F0E8] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Buy It Now (Fast Checkout)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Value Highlights */}
          <div className="pt-4 border-t border-[#1A1C18]/10 grid grid-cols-2 gap-3 text-xs text-[#4A483E]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8A927A]" />
              <span>Complimentary shipping over $150</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#8A927A]" />
              <span>30-day in-home risk-free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B78E69]" />
              <span>10-year craft integrity warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B78E69]" />
              <span>Carbon-neutral door delivery</span>
            </div>
          </div>

          {/* Expandable Accordion Tabs */}
          <div className="pt-6 border-t border-[#1A1C18]/10 divide-y divide-[#1A1C18]/10">
            {/* Tab 1: Dimensions & Specs */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "dimensions" ? "" : "dimensions")}
                className="w-full flex items-center justify-between text-sm font-bold text-[#1A1C18] text-left cursor-pointer"
              >
                <span>Dimensions & Architectural Specifications</span>
                {activeTab === "dimensions" ? (
                  <ChevronUp className="w-4 h-4 text-[#4A483E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4A483E]" />
                )}
              </button>
              {activeTab === "dimensions" && (
                <div className="pt-3 text-xs text-[#4A483E] space-y-2 font-mono">
                  {product.dimensions && (
                    <div className="flex justify-between py-1 border-b border-[#1A1C18]/5">
                      <span className="font-sans text-[#1A1C18]">Overall Dimensions:</span>
                      <span>{product.dimensions.text}</span>
                    </div>
                  )}
                  {product.weight_kg && (
                    <div className="flex justify-between py-1 border-b border-[#1A1C18]/5">
                      <span className="font-sans text-[#1A1C18]">Net Weight:</span>
                      <span>{product.weight_kg} kg ({(product.weight_kg * 2.205).toFixed(1)} lbs)</span>
                    </div>
                  )}
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-[#1A1C18]/5">
                        <span className="font-sans text-[#1A1C18]">{key}:</span>
                        <span>{val}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tab 2: Materials & Craft */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "craft" ? "" : "craft")}
                className="w-full flex items-center justify-between text-sm font-bold text-[#1A1C18] text-left cursor-pointer"
              >
                <span>Materials & Craftsmanship</span>
                {activeTab === "craft" ? (
                  <ChevronUp className="w-4 h-4 text-[#4A483E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4A483E]" />
                )}
              </button>
              {activeTab === "craft" && (
                <div className="pt-3 text-xs text-[#4A483E] space-y-2 font-sans leading-relaxed">
                  <p>
                    Engineered using {product.material}. Our timber components are milled from FSC-certified responsible forestry reserves in Sweden and Vermont, cured for 90 days to achieve moisture equilibrium.
                  </p>
                  <p>
                    Metal elements are cold-drawn and anodized with matte micro-bead blasting to prevent fingerprints and resist corrosion.
                  </p>
                </div>
              )}
            </div>

            {/* Tab 3: Care Instructions */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "care" ? "" : "care")}
                className="w-full flex items-center justify-between text-sm font-bold text-[#1A1C18] text-left cursor-pointer"
              >
                <span>Product Care & Longevity</span>
                {activeTab === "care" ? (
                  <ChevronUp className="w-4 h-4 text-[#4A483E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4A483E]" />
                )}
              </button>
              {activeTab === "care" && (
                <div className="pt-3 text-xs text-[#4A483E] font-sans leading-relaxed">
                  <p>{product.care_instructions || "Wipe clean with a damp lint-free cloth. Avoid chemical detergents or standing moisture."}</p>
                </div>
              )}
            </div>

            {/* Tab 4: Shipping & Returns */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "shipping" ? "" : "shipping")}
                className="w-full flex items-center justify-between text-sm font-bold text-[#1A1C18] text-left cursor-pointer"
              >
                <span>Delivery & 30-Day Returns</span>
                {activeTab === "shipping" ? (
                  <ChevronUp className="w-4 h-4 text-[#4A483E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4A483E]" />
                )}
              </button>
              {activeTab === "shipping" && (
                <div className="pt-3 text-xs text-[#4A483E] font-sans leading-relaxed space-y-2">
                  <p>
                    Dispatched within 24 hours from regional fulfillment hubs in Vermont (US), Ontario (CA), and London (UK).
                  </p>
                  <p>
                    Complimentary standard shipping applies on all orders exceeding $150 USD (or local currency equivalent). If you are not completely enchanted by how this piece settles into your living space, initiate a return within 30 days for a full refund.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Showcase */}
      <section className="pt-12 border-t border-[#1A1C18]/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-1">
              Verified Ownership
            </span>
            <h3 className="font-editorial text-3xl font-bold text-[#1A1C18]">
              Customer Impressions
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1C18]">
              <span className="text-xl font-mono font-bold">
                {reviewList.length > 0
                  ? (
                    reviewList.reduce((acc, r) => acc + r.rating, 0) /
                    reviewList.length
                  ).toFixed(1)
                  : product.rating ?? "4.9"}
              </span>
              <div className="flex text-[#B78E69]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[#4A483E]">
                ({reviewList.length > 0 ? reviewList.length : product.review_count ?? 32} reflections)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-all cursor-pointer shadow-2xs"
            >
              Share Reflection
            </button>
          </div>
        </div>

        {/* Review Submission Modal / Inline Form */}
        {showReviewModal && (
          <div className="mb-8 p-6 bg-white rounded-3xl border border-[#1A1C18]/15 shadow-sm space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
              <h4 className="font-editorial text-lg font-bold text-[#1A1C18]">
                Share Your Architectural Impression
              </h4>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-xs text-[#4A483E] hover:text-[#1A1C18] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {reviewNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl">
                {reviewNotice}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18] mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 text-[#B78E69] hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= userRating ? "fill-current" : "text-[#D8C9B5]"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[#1A1C18] ml-2">
                    {userRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18] mb-1.5">
                  Your Reflection &amp; Craft Details
                </label>
                <textarea
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share how this piece settles in your space, the timber tactile finish, or your living experience…"
                  className="w-full p-3.5 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-xl text-xs text-[#1A1C18] placeholder:text-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A483E] hover:text-[#1A1C18] cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                  className="px-6 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span style={{ color: "#FFFFFF" }}>
                    {isSubmittingReview ? "Submitting…" : "Publish Reflection"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewList.length > 0 ? (
            reviewList.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-[#1A1C18]/10 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-[#B78E69]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-[#D8C9B5]"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#4A483E]">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1C18]/90 italic leading-relaxed">
                  &ldquo;{rev.comment || "Exceptional Scandinavian design and finish."}&rdquo;
                </p>
                <div className="text-xs font-semibold text-[#1A1C18] pt-2 border-t border-[#1A1C18]/5 flex items-center justify-between">
                  <span>{rev.reviewer_name || "Verified Resident"}</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Ownership
                  </span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-[#1A1C18]/10 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#B78E69]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#4A483E]">2 weeks ago</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1C18]/90 italic leading-relaxed">
                  &ldquo;The proportion and precision of the {product.name} exceeded our expectations. The timber has a soft tactile oil finish that feels alive. Fits our living area with total quiet grace.&rdquo;
                </p>
                <div className="text-xs font-semibold text-[#1A1C18] pt-2 border-t border-[#1A1C18]/5">
                  Verified Homeowner · Brooklyn, NY
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#1A1C18]/10 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#B78E69]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#4A483E]">1 month ago</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1C18]/90 italic leading-relaxed">
                  &ldquo;Packaging was pristine and assembly took less than 15 minutes. Truly thoughtful design. Will be outfitting the rest of our study with Kstore.&rdquo;
                </p>
                <div className="text-xs font-semibold text-[#1A1C18] pt-2 border-t border-[#1A1C18]/5">
                  Architectural Designer · Toronto, ON
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#1A1C18]/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-1">
                Harmonious Pairs
              </span>
              <h3 className="font-editorial text-3xl font-bold text-[#1A1C18]">
                Related Essentials
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#1A1C18] hover:text-[#B78E69] flex items-center gap-1"
            >
              View Full Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Browsing History */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Sticky Bottom Purchase Bar (Desktop) */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#1A1C18]/15 py-3 px-6 z-40 shadow-2xl hidden md:flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/10">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-bold text-[#1A1C18]">
                {product.name}
              </h4>
              <div className="text-xs text-[#4A483E] font-mono">
                {formatPrice(product.price_cents)} · {selectedColor}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="px-6 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
              <span style={{ color: "#FFFFFF" }}>Add to Cart</span>
            </button>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              data-btn="accent"
              style={{ color: "#FFFFFF", backgroundColor: "#B78E69" }}
              className="px-5 py-2.5 bg-[#B78E69] text-white text-xs font-semibold rounded-xl hover:bg-[#a57d59] transition-all cursor-pointer shadow-md"
            >
              <span style={{ color: "#FFFFFF" }}>Buy Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1C18]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
