"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<string, string> = {
  "living-room": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "workspace": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80",
  "kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
  "bedroom": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "bathroom": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  "lighting": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
};

export function FeaturedCollections({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-2 font-sans">
            Curated Spaces
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1C18]">
            Featured Collections
          </h2>
        </div>
        <p className="text-sm text-[#4A483E] max-w-md mt-4 md:mt-0 leading-relaxed font-sans">
          Purpose-driven furniture, quiet desk architecture, and warm luminaires engineered to harmonize modern homes.
        </p>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {categories.map((cat, index) => {
          const img =
            cat.image_url ||
            CATEGORY_IMAGES[cat.slug] ||
            "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80";

          return (
            <Link
              key={cat.id || cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-6 border border-[#1A1C18]/12"
            >
              {/* Background Lifestyle Image */}
              <div className="absolute inset-0 z-0 bg-[#D8C9B5]">
                <Image
                  src={img}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C18]/90 via-[#1A1C18]/40 to-transparent transition-opacity group-hover:opacity-95" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#D8C9B5] block mb-1">
                  Collection 0{index + 1}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-[#D8C9B5] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#F4F0E8]/85 line-clamp-2 mb-4 leading-relaxed font-sans">
                  {cat.description}
                </p>

                {/* Discover CTA */}
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-[#D8C9B5] group-hover:translate-x-1 transition-all">
                  <span>Discover {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
