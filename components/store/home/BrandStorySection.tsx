"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";

export function BrandStorySection() {
  return (
    <section className="py-24 bg-[#D8C9B5]/25 border-y border-[#1A1C18]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Editorial Photography Composition */}
          <div className="relative">
            {/* Primary Large Image */}
            <div className="relative h-[480px] sm:h-[560px] rounded-3xl overflow-hidden shadow-xl border border-[#1A1C18]/12">
              <Image
                src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural timber joinery and craft workshop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            {/* Floating Inset Detail Card */}
            <div className="absolute -bottom-8 -right-4 sm:-right-8 w-64 bg-white p-5 rounded-2xl shadow-2xl border border-[#1A1C18]/10 hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A927A] block mb-1">
                Philosophy
              </span>
              <p className="font-editorial text-lg font-bold text-[#1A1C18] leading-snug">
                &ldquo;Simplicity is the deliberate removal of the unnecessary.&rdquo;
              </p>
              <span className="text-[11px] text-[#4A483E] mt-2 block font-sans font-medium">
                Kstore Design Manifesto
              </span>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              The Kstore Heritage
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1C18] leading-[1.12]">
              Designed with intention. Made for living.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4A483E] leading-relaxed font-sans">
              <p>
                Founded on the timeless Scandinavian conviction that home should be a calming sanctuary, Kstore crafts modern living essentials that balance architectural proportion with daily utility.
              </p>
              <p>
                Every timber shelf, task lamp, and modular tray originates in collaboration with master woodworkers and artisan ceramicists across Sweden, Denmark, and Vermont. We prioritize FSC-certified quarter-sawn white oak, high-fire stoneware, and machined solid brass over fleeting trends.
              </p>
              <p>
                By cutting out third-party wholesale distributors, we invest directly into zero-compromise materials, honest transparent pricing, and carbon-neutral direct shipping to your doorway.
              </p>
            </div>

            {/* Core Values Summary */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1A1C18]/10">
              <div>
                <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18]">100%</span>
                <p className="text-xs text-[#4A483E] font-medium mt-0.5">Sustainably Harvested FSC Timber</p>
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18]">30-Day</span>
                <p className="text-xs text-[#4A483E] font-medium mt-0.5">In-Home Architectural Trial</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1A1C18] text-white hover:bg-[#32362F] text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-xl cursor-pointer"
              >
                Read Our Story & Craft
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
