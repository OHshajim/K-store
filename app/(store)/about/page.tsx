import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass, ShieldCheck, Layers, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story & Philosophy — Kstore",
  description:
    "Thoughtfully designed essentials for better living. Discover the Scandinavian craft heritage and architectural conviction behind Kstore.",
};

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-20 font-sans">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          The Kstore Philosophy
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight text-[#292B27]">
          Thoughtfully Designed Essentials for Better Living
        </h1>
        <p className="text-base sm:text-lg text-[#77766E] leading-relaxed font-light">
          We believe the physical objects that populate our daily rituals should bring enduring calm, effortless utility, and architectural stillness to the modern dwelling.
        </p>
      </div>

      {/* Large Workshop Lifestyle Image */}
      <div className="relative h-[420px] sm:h-[540px] rounded-3xl overflow-hidden shadow-xl border border-[#292B27]/10">
        <Image
          src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1600&q=80"
          alt="Artisanal woodworking workshop with timber planks and precision hand tools"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#292B27]/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-white max-w-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8C9B5] block mb-1">
            Småland & Vermont Studios
          </span>
          <p className="font-editorial text-xl sm:text-2xl font-bold">
            Precision milling meets generations of timber craftsmanship.
          </p>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#292B27]/10 pt-16">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#292B27]">
            1. Intentional Stillness
          </h3>
          <p className="text-xs sm:text-sm text-[#77766E] leading-relaxed">
            Every millimeter is measured against sensory distraction. From concealed wire raceways to soft-close runners, our pieces quiet the home environment.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#8A927A]">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#292B27]">
            2. Honest Materials
          </h3>
          <p className="text-xs sm:text-sm text-[#77766E] leading-relaxed">
            We work exclusively with FSC-certified solid white oak, high-fire ceramic stoneware, and aerospace anodized aluminum. No disposable synthetic veneers.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#292B27]">
            3. Direct Craft Model
          </h3>
          <p className="text-xs sm:text-sm text-[#77766E] leading-relaxed">
            By operating directly between our regional workshops and your residence, we avoid exorbitant wholesale markups while upholding carbon-neutral logistics.
          </p>
        </div>
      </div>

      {/* The Origin Narrative */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#292B27]/10 shadow-sm space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block">
          Our Beginning
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#292B27] leading-tight">
          Born out of a simple desire for fewer, better essentials.
        </h2>
        <div className="space-y-4 text-sm sm:text-base text-[#77766E] leading-relaxed">
          <p>
            Kstore began in 2024 as a conversation between two architectural designers navigating cramped city lofts. Frustrated by flat-pack furniture that degraded after two moves and luxury galleries priced beyond reason, we set out to bridge the divide.
          </p>
          <p>
            Today, our collections serve thousands of residences across the United States, Canada, and the United Kingdom. Whether it is our signature Modular Storage Shelf or the tactile Turned Oak Desk Station, every product is engineered to last for decades.
          </p>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-all inline-flex items-center gap-2 shadow-md"
          >
            Explore The Living Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/fit-assistant"
            className="px-6 py-3.5 border border-[#292B27]/20 text-[#292B27] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors"
          >
            Launch Fit Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
