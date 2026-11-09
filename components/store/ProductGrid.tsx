"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import type { Product, StoreSettings } from "@/lib/types";
import { ProductCard } from "@/components/store/ProductCard";

export function ProductGrid({
  products,
  settings,
  columns = 3,
}: {
  products: Product[];
  settings?: StoreSettings;
  columns?: 2 | 3 | 4;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#1A1C18]/10 my-6 shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F4F0E8] flex items-center justify-center text-[#4A483E] mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18] mb-2">
          No products match your criteria
        </h3>
        <p className="text-sm text-[#4A483E] max-w-md mx-auto mb-6 leading-relaxed">
          We could not find any essentials matching your current filter selection. Try resetting filters or exploring our full catalog.
        </p>
        <Link
          href="/shop"
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1C18] text-white text-sm font-semibold rounded-xl hover:bg-[#32362F] transition-colors shadow-sm"
        >
          <span style={{ color: "#FFFFFF" }}>View All Products</span>
          <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
        </Link>
      </div>
    );
  }

  const gridColsClass =
    columns === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
      : columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
      : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8";

  return (
    <div className={gridColsClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
