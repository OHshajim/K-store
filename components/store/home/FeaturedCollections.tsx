"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import type { Category } from "@/lib/types";

const CATEGORY_EDITORIAL: Record<
  string,
  {
    image: string;
    kicker: string;
    highlights: string[];
    pieceCount: number;
    material: string;
  }
> = {
  "living-room": {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 01 · Living Sanctuary",
    highlights: ["Modular Storage", "Side Tables", "Solid Oak"],
    pieceCount: 8,
    material: "Solid White Oak",
  },
  workspace: {
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 02 · Studio & Focus",
    highlights: ["Desk Organizers", "Cable Routing", "Solid Timber"],
    pieceCount: 6,
    material: "FSC Oak & Anodized Metal",
  },
  kitchen: {
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 03 · Kitchen & Pantry",
    highlights: ["Stoneware Canisters", "Pantry Architecture", "Trays"],
    pieceCount: 5,
    material: "Matte Stoneware & Beech",
  },
  bedroom: {
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 04 · Rest & Bedside",
    highlights: ["Floating Nightstands", "Linen Baskets", "Bedside Trays"],
    pieceCount: 5,
    material: "White Ash & Natural Linen",
  },
  bathroom: {
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 05 · Bath & Spa",
    highlights: ["Teak Shelving", "Matte Dispensers", "Storage"],
    pieceCount: 4,
    material: "Moisture-Cured Teak",
  },
  lighting: {
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85",
    kicker: "Space 06 · Atmospheric Light",
    highlights: ["Sculptural Luminaires", "Desk Lamps", "Ambient Dimmers"],
    pieceCount: 6,
    material: "Micro-Bead Blasted Metal",
  },
};

export function FeaturedCollections({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts?: Record<string, number>;
}) {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Architectural Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Curated Spaces · 2026 Spatial Edition</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1C18] leading-[1.08]">
            Featured Collections
          </h2>

          <p className="text-sm sm:text-base text-[#4A483E]/85 leading-relaxed font-sans font-light">
            Purpose-driven furniture, quiet desk architecture, and warm luminaires
            engineered to bring tactile calm and structural harmony to modern homes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#1A1C18] hover:text-white transition-all shadow-2xs group"
          >
            <span>Explore All Essentials</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8A927A] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* 2. Luxury Architectural Gallery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {
            categories.map((cat, index) => {
              const editorial = CATEGORY_EDITORIAL[cat.slug] ?? {
                image:
                  cat.image_url ||
                  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
                kicker: `Space 0${index + 1} · Architectural Living`,
                highlights: ["Architectural Joinery", "Nordic Living"],
                pieceCount: 6,
                material: "Solid Timber",
              };

              // Guarantee valid image URL (replace broken 404 unsplash ids)
              const isBroken =
                !cat.image_url || cat.image_url.includes("photo-1540518614846");
              const img: string =
                (isBroken ? editorial.image : cat.image_url) || editorial.image;

              const count =
                productCounts?.[cat.slug] ??
                productCounts?.[cat.id] ??
                editorial.pieceCount;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative h-[480px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#1A1C18]/10 shadow-[0_4px_24px_rgba(26,28,24,0.04)] hover:shadow-[0_20px_48px_rgba(26,28,24,0.12)] transition-all duration-500 flex flex-col justify-between"
                >
                  {/* Lifestyle Image Background with Subtle Clean Vignette */}
                  <div className="absolute inset-0 z-0 bg-[#E8E4DC]">
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    {/* Soft top gradient for badge contrast + gentle bottom shadow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/25 pointer-events-none" />
                  </div>

                  {/* Floating Top Header Badges */}
                  <div className="relative z-10 p-5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1C18]/75 backdrop-blur-md text-[#F4F0E8] text-[10px] font-mono font-bold tracking-widest uppercase border border-white/10 shadow-xs">
                      <Layers className="w-3 h-3 text-[#B78E69]" />
                      <span>0{index + 1} · {cat.name}</span>
                    </span>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[#1A1C18] text-[10px] font-mono font-bold tracking-wider border border-[#1A1C18]/10 shadow-xs">
                      {count} {count === 1 ? "Essential" : "Essentials"}
                    </span>
                  </div>

                  {/* Floating Architectural White Card at Bottom */}
                  <div className="relative z-10 m-3 sm:m-4 p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-[#1A1C18]/10 shadow-[0_8px_30px_rgba(26,28,24,0.08)] group-hover:border-[#B78E69]/40 group-hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A927A] block">
                          {editorial.material}
                        </span>

                        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors truncate">
                          {cat.name}
                        </h3>

                        <p className="text-xs text-[#4A483E]/80 line-clamp-2 leading-relaxed font-sans font-light">
                          {cat.description}
                        </p>
                      </div>

                      {/* Circular Arrow Button */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A1C18] text-white flex items-center justify-center group-hover:bg-[#B78E69] group-hover:translate-x-1 transition-all shadow-xs shrink-0 mt-1">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Highlights Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-[#1A1C18]/8">
                      {editorial.highlights.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[#F4F0E8] text-[#4A483E] text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })
          }
      </div>
    </section>
  );
}
