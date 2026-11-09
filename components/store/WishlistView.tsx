"use client";

import { useWishlistStore } from "@/lib/wishlist/store";
import { useCartStore } from "@/lib/cart/store";
import { ProductCard } from "@/components/store/ProductCard";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WishlistView() {
  const { items, clearWishlist } = useWishlistStore();
  const { addProduct } = useCartStore();

  const handleMoveAllToCart = () => {
    items.forEach((item) => addProduct(item, 1));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1A1C18]/10 pb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] block mb-2 font-sans">
            Personal Curation
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
            Saved Wishlist
          </h1>
          <p className="text-sm text-[#4A483E] mt-1 font-sans">
            {items.length === 1
              ? "1 essential saved for consideration"
              : `${items.length} essentials saved for consideration`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Move All to Cart
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="px-4 py-2.5 border border-[#1A1C18]/20 text-[#4A483E] hover:text-red-600 text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Grid of Wishlist Items */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#1A1C18]/10 shadow-xs max-w-xl mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#B78E69] mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] mb-2">
            Your Wishlist is Empty
          </h3>
          <p className="text-sm text-[#4A483E] mb-8 font-sans">
            Tap the heart icon on any product in our catalog to keep track of furniture and decor you love.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1C18] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-colors shadow-md"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

