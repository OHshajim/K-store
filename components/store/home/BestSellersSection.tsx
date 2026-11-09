"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/store/ProductCard";

export function BestSellersSection({
  products,
}: {
  products: Product[];
}) {
  const displayProducts = products.slice(0, 8);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1A1C18]/10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B78E69] mb-2 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            Loved By Designers & Homeowners
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1C18]">
            Most Desired Essentials
          </h2>
        </div>

        <Link
          href="/shop?sort=bestseller"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1C18] hover:text-[#B78E69] mt-4 md:mt-0 group transition-colors"
        >
          <span>View All Best Sellers</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of 4-8 Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All CTA Footer Banner */}
      <div className="mt-14 pt-8 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1C18] text-white hover:bg-[#32362F] text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-xl cursor-pointer"
        >
          View All Products ({products.length > 8 ? "30+" : products.length} Essentials)
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
