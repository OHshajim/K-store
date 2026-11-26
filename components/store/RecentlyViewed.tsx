"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, Trash2 } from "lucide-react";
import {
  getRecentlyViewed,
  getRecentlyViewedServerSnapshot,
  subscribeRecentlyViewed,
  clearRecentlyViewed,
} from "@/lib/storage/recentlyViewed";
import { useCurrencyStore } from "@/lib/currency/store";

export function RecentlyViewed({
  currentProductId,
  title = "Recently Viewed Essentials",
  subtitle = "Revisit handcrafted designs you previously inspected.",
}: {
  currentProductId?: string;
  title?: string;
  subtitle?: string;
}) {
  const { formatPrice } = useCurrencyStore();

  const rawList = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewed,
    getRecentlyViewedServerSnapshot
  );

  const items = currentProductId
    ? rawList.filter((p) => p.id !== currentProductId)
    : rawList;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="pt-12 border-t border-[#1A1C18]/10 font-sans">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A927A] uppercase tracking-widest mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Browsing Memory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1C18]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#77766E] mt-1">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => clearRecentlyViewed()}
          className="text-xs text-[#77766E] hover:text-[#1A1C18] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Clear browsing memory"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Grid of recently viewed pieces */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {items.slice(0, 5).map((item) => {
          const hasDiscount =
            item.compare_at_cents && item.compare_at_cents > item.price_cents;
          return (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="group flex flex-col rounded-2xl bg-white border border-[#1A1C18]/8 overflow-hidden hover:border-[#1A1C18]/25 hover:shadow-md transition-all duration-300"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square w-full bg-[#FAF9F5] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.room && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-medium text-[#1A1C18] capitalize">
                    {item.room}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-[#1A1C18] line-clamp-1 group-hover:text-[#B78E69] transition-colors">
                    {item.name}
                  </h3>
                  {item.material && (
                    <p className="text-[11px] text-[#77766E] line-clamp-1">
                      {item.material}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1A1C18]/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-[#1A1C18] font-mono">
                      {formatPrice(item.price_cents)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-stone-400 line-through font-mono">
                        {formatPrice(item.compare_at_cents!)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#B78E69] font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
