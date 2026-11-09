"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";

export function PromoBar({
  message = "Complimentary shipping on orders over $150.",
}: {
  message?: string;
}) {
  return (
    <div className="bg-[#1A1C18] text-white py-2.5 px-4 text-xs font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-white/70">
          <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
          <span>Thoughtfully designed essentials for modern living.</span>
        </div>

        <div className="flex-1 md:flex-none text-center flex items-center justify-center gap-3">
          <span className="font-medium tracking-wide">{message}</span>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-[#D8C9B5] hover:text-white underline underline-offset-4 font-semibold transition-colors"
          >
            Shop Now
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <CurrencySelector variant="header" />
        </div>
      </div>
    </div>
  );
}
