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
    <div className="bg-[#1A1C18] text-white py-2 px-3 sm:px-4 text-xs font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left tagline - only visible on wide screens (xl:) to protect center message from wrapping */}
        <div className="hidden xl:flex items-center gap-2 text-white/70 whitespace-nowrap shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
          <span>Thoughtfully designed essentials for modern living.</span>
        </div>

        {/* Center promotional notice */}
        <div className="flex-1 text-center flex items-center justify-center gap-2 sm:gap-3 min-w-0">
          <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis sm:overflow-visible">
            {message}
          </span>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-[#D8C9B5] hover:text-white underline underline-offset-4 font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Shop Now
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Right currency selector */}
        <div className="flex items-center gap-2 shrink-0">
          <CurrencySelector variant="header" />
        </div>
      </div>
    </div>
  );
}
