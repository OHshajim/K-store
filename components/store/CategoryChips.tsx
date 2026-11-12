"use client";

import Link from "next/link";
import { LayoutGrid, Tag } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href="/shop"
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
          !activeSlug
            ? "bg-[#1A1C18] text-white shadow-xs"
            : "bg-white border border-[#1A1C18]/15 text-[#4A483E] hover:bg-[#F4F0E8] hover:text-[#1A1C18]"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>All Essentials</span>
      </Link>

      {categories.map((category) => {
        const isActive = activeSlug === category.slug;
        return (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#1A1C18] text-white shadow-xs"
                : "bg-white border border-[#1A1C18]/15 text-[#4A483E] hover:bg-[#F4F0E8] hover:text-[#1A1C18]"
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
