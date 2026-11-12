"use client";

import { useState, useEffect } from "react";
import { Search, X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useCurrencyStore } from "@/lib/currency/store";

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredProducts = results;

  const popularSearches = [
    "Modular Storage Shelf",
    "Desk Organizer",
    "Minimal Table Lamp",
    "Solid White Oak",
    "Stoneware Canisters",
    "Floating Shelf",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A1C18]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-start justify-center pt-20 px-4 sm:px-6">
        <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#1A1C18]/12 animate-in fade-in zoom-in-95 duration-200">
          {/* Search Header */}
          <div className="p-4 sm:p-6 border-b border-[#1A1C18]/10 flex items-center gap-3 bg-[#F4F0E8]/40">
            <Search className="w-5 h-5 text-[#4A483E] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search living, workspace, lighting, or materials (e.g. Oak)..."
              className="w-full bg-transparent text-base sm:text-lg text-[#1A1C18] placeholder:text-[#4A483E]/70 focus:outline-none font-sans"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#B78E69] animate-spin shrink-0" />
            )}
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-[#4A483E] hover:text-[#1A1C18] rounded-full hover:bg-[#F4F0E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-xs text-[#4A483E] hover:text-[#1A1C18] font-mono border border-[#1A1C18]/20 px-2 py-0.5 rounded-md cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* Search Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {query.trim() === "" ? (
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4A483E] mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
                  Popular Inquiries
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 text-xs bg-[#F4F0E8] text-[#1A1C18] font-medium rounded-full hover:bg-[#D8C9B5]/70 transition-colors cursor-pointer border border-[#1A1C18]/10"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#1A1C18]/10 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A483E] block mb-3">
                    Browse Categories
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-[#1A1C18]">
                    <Link
                      href="/shop?room=living"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Living Room →
                    </Link>
                    <Link
                      href="/shop?room=workspace"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Workspace →
                    </Link>
                    <Link
                      href="/shop?room=kitchen"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Kitchen →
                    </Link>
                    <Link
                      href="/shop?room=bedroom"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Bedroom →
                    </Link>
                    <Link
                      href="/shop?room=bathroom"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Bathroom →
                    </Link>
                    <Link
                      href="/shop?room=lighting"
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors font-medium"
                    >
                      Lighting →
                    </Link>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A483E] mb-2">
                  Matching Essentials ({filteredProducts.length})
                </div>
                {filteredProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-[#F4F0E8] transition-colors group"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F4F0E8] shrink-0 border border-[#1A1C18]/10">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#1A1C18] truncate group-hover:text-[#B78E69] transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs text-[#4A483E] truncate">
                        {p.material} · {p.dimensions?.text}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-[#1A1C18]" suppressHydrationWarning>
                        {formatPrice(p.price_cents)}
                      </div>
                      {p.is_bestseller && (
                        <span className="text-[10px] uppercase font-bold text-[#8A927A]">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                <Link
                  href={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="mt-4 flex items-center justify-center gap-2 p-3 text-xs font-semibold text-[#1A1C18] bg-[#F4F0E8] rounded-xl hover:bg-[#D8C9B5]/50 transition-colors w-full"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#4A483E] mb-2 font-medium">
                  No products found matching &ldquo;{query}&rdquo;.
                </p>
                <p className="text-xs text-[#4A483E]">
                  Try searching for oak, lighting, shelf, or browse our{" "}
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="underline font-bold text-[#1A1C18]"
                  >
                    full catalog
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
