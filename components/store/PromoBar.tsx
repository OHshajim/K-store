"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";

export function PromoBar({
  message = "Complimentary shipping on orders over $150.",
}: {
  message?: string;
}) {
  const adMessages = [
    { text: message, href: "/shop", highlight: true },
    { text: "Complimentary worldwide express shipping on orders over $150", href: "/shop", highlight: false },
    { text: "30-Day in-home trial across all living environments", href: "/shop", highlight: false },
    { text: "10-Year craft warranty on kiln-dried timber joinery", href: "/shop", highlight: false },
    { text: "Spring 2026 Architectural Living Essentials drop live", href: "/shop", highlight: true },
    { text: "Personal interior concierge support 7 days a week", href: "/shop", highlight: false },
  ];

  // Duplicate for seamless 100% continuous infinite loop
  const marqueeItems = [...adMessages, ...adMessages];

  return (
    <div className="bg-[#1A1C18] text-white py-2 px-3 sm:px-4 text-xs font-sans border-b border-black/10 overflow-hidden relative select-none print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Kicker Emblem (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 text-white/80 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] font-mono tracking-widest uppercase text-[#D8C9B5]">
            <Sparkles className="w-3 h-3 text-[#B78E69]" />
            Live Dispatch
          </span>
        </div>

        {/* Center Infinitely Sliding Advertising Marquee */}
        <div className="flex-1 overflow-hidden relative mx-2 sm:mx-4">
          {/* Subtle edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1A1C18] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1A1C18] to-transparent z-10 pointer-events-none" />

          {/* Infinite sliding track */}
          <div
            className="animate-marquee flex items-center gap-8 sm:gap-12 whitespace-nowrap cursor-pointer py-0.5"
            title="Hover to pause announcement stream"
          >
            {marqueeItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="inline-flex items-center gap-2 group hover:text-[#D8C9B5] transition-colors"
              >
                <span className="text-[#B78E69] text-xs opacity-75 font-mono">✦</span>
                <span
                  className={`text-xs tracking-wide transition-colors ${
                    item.highlight ? "font-semibold text-white" : "font-normal text-white/85"
                  } group-hover:text-white group-hover:underline underline-offset-4`}
                >
                  {item.text}
                </span>
                <ArrowRight className="w-3 h-3 text-[#D8C9B5] opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Currency Selector */}
        <div className="flex items-center gap-2 shrink-0 z-20">
          <CurrencySelector variant="header" />
        </div>
      </div>
    </div>
  );
}
