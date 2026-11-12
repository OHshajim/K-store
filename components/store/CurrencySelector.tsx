"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrencyStore, CURRENCIES } from "@/lib/currency/store";
import type { SupportedCurrency } from "@/lib/types";
import { ChevronDown, Globe, Check } from "lucide-react";

export function CurrencySelector({ variant = "header" }: { variant?: "header" | "footer" }) {
  const { currency, setCurrency } = useCurrencyStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = CURRENCIES[currency] ?? CURRENCIES.USD;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all whitespace-nowrap shrink-0 ${
          variant === "header"
            ? "text-white/90 hover:text-white px-2.5 py-1 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs shadow-2xs"
            : "text-[#4A483E] hover:text-[#1A1C18] p-1.5 rounded-lg hover:bg-black/5"
        }`}
        aria-label="Select currency and shipping region"
      >
        <span className="text-sm" suppressHydrationWarning>{currentConfig.flag}</span>
        <span className="font-semibold" suppressHydrationWarning>{currentConfig.code} ({currentConfig.symbol})</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div
          style={{ color: "#1A1C18" }}
          className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-[#1A1C18]/12 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div
            style={{ color: "#4A483E" }}
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b border-[#1A1C18]/10 flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#8A927A]" />
            <span>Market & Currency</span>
          </div>

          {(Object.keys(CURRENCIES) as SupportedCurrency[]).map((code) => {
            const config = CURRENCIES[code];
            const isSelected = currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                style={{ color: "#1A1C18" }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#F4F0E8] font-bold text-[#1A1C18]"
                    : "text-[#1A1C18] hover:bg-[#F4F0E8]/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{config.flag}</span>
                  <span className="font-semibold text-[#1A1C18]" style={{ color: "#1A1C18" }}>
                    {config.label}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[#4A483E] font-bold" style={{ color: "#4A483E" }}>
                    {config.symbol}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1A1C18]" style={{ color: "#1A1C18" }} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
