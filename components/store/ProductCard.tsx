"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart/store";
import { useWishlistStore } from "@/lib/wishlist/store";
import { useCurrencyStore } from "@/lib/currency/store";

export function ProductCard({ product }: { product: Product }) {
  const { addProduct } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const isFavorited = isInWishlist(product.id);
  const [selectedColor, setSelectedColor] = useState(
    product.color_variants?.[0]?.name ?? null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const displayImage =
    isHovered && product.images.length > 1
      ? product.images[1]
      : product.images[0] ||
        "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80";

  const hasDiscount =
    Boolean(product.compare_at_cents && product.compare_at_cents > product.price_cents);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product, 1, { selectedColor: selectedColor ?? undefined });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-[#1A1C18]/12 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges & Wishlist */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-[#F7F5F0]"
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_bestseller && (
            <span className="px-2.5 py-1 bg-[#8A927A] text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-xs">
              Bestseller
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-[#B78E69] text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-xs">
              Save {formatPrice(product.compare_at_cents! - product.price_cents)}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2.5 py-1 bg-[#1A1C18]/85 text-white text-[10px] uppercase font-medium rounded-md backdrop-blur-xs">
              Only {product.stock} left
            </span>
          )}
          {product.stock <= 0 && (
            <span className="px-2.5 py-1 bg-red-800 text-white text-[10px] uppercase font-bold rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 cursor-pointer ${
            isFavorited
              ? "bg-[#B78E69] text-white shadow-md scale-110"
              : "bg-white/90 backdrop-blur-xs text-[#1A1C18] hover:bg-white hover:scale-110 shadow-xs border border-[#1A1C18]/10"
          }`}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              justAdded
                ? "bg-[#8A927A] text-white"
                : product.stock <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#1A1C18] text-white hover:bg-[#32362F]"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart
              </>
            ) : product.stock <= 0 ? (
              "Sold Out"
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Material / Category tag & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E] truncate max-w-[150px]">
              {product.material?.split("&")[0]?.trim() || product.room || "Living"}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#1A1C18] shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#B78E69] text-[#B78E69]" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-[#4A483E] font-normal text-[11px]">
                  ({product.review_count ?? 18})
                </span>
              </div>
            )}
          </div>

          {/* Product Name (2 lines comfortable space, never prematurely cut off) */}
          <Link
            href={`/product/${product.slug}`}
            className="block group-hover:text-[#B78E69] transition-colors"
          >
            <h3 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#1A1C18] line-clamp-2 min-h-[3rem] leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-[#4A483E] line-clamp-2 mt-1.5 leading-relaxed min-h-[2.25rem]">
            {product.description}
          </p>
        </div>

        {/* Color variants & Clean Price layout */}
        <div className="pt-3.5 mt-3 border-t border-[#1A1C18]/10 flex items-center justify-between gap-2">
          {/* Color Swatches */}
          <div className="flex items-center gap-1.5">
            {product.color_variants && product.color_variants.length > 0 ? (
              product.color_variants.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedColor(v.name)}
                  title={v.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    selectedColor === v.name
                      ? "ring-2 ring-[#1A1C18] ring-offset-1 border-transparent scale-110"
                      : "border-black/20 hover:scale-110"
                  }`}
                  style={{ backgroundColor: v.hex }}
                  aria-label={v.name}
                />
              ))
            ) : (
              <span className="text-[11px] font-medium text-[#4A483E]">Handcrafted</span>
            )}
          </div>

          {/* Price: Side-by-side with clear font weight */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="font-mono text-base sm:text-lg font-bold text-[#1A1C18]">
              {formatPrice(product.price_cents)}
            </span>
            {hasDiscount && (
              <span className="font-mono text-xs font-medium text-[#4A483E]/70 line-through">
                {formatPrice(product.compare_at_cents!)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Quick Add Button */}
        <div className="lg:hidden mt-3 pt-2">
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              justAdded
                ? "bg-[#8A927A] text-white"
                : product.stock <= 0
                ? "bg-gray-200 text-gray-500"
                : "bg-[#1A1C18] text-white hover:bg-[#32362F]"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
