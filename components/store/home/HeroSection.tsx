"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";

export function HeroSection({
  headline = "Make room for what matters.",
  description = "Thoughtfully designed essentials for a more organized, beautiful home.",
  primaryCta = "Explore Collection",
  secondaryCta = "Discover Our Story",
  imageUrl = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
}: {
  headline?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string;
}) {
  return (
    <section className="relative w-full min-h-[620px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-[#292B27]">
      {/* Background Lifestyle Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt="Warm minimalist Scandinavian interior living space with natural oak furnishings"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-102 transition-transform duration-1000 ease-out"
        />
        {/* Subtle Dark Editorial Gradient for guaranteed legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#292B27]/90 via-[#292B27]/40 to-[#292B27]/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center text-white">
        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium uppercase tracking-widest mb-6 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B78E69]" />
          Scandinavian Living Essentials
        </div>

        {/* Headline */}
        <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-4xl mx-auto">
          {headline}
        </h1>

        {/* Description */}
        <p className="font-sans text-base sm:text-lg lg:text-xl text-[#F4F0E8]/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            data-btn="light"
            style={{ color: "#1A1C18", backgroundColor: "#F4F0E8" }}
            className="w-full sm:w-auto px-8 py-4 bg-[#F4F0E8] text-[#1A1C18] hover:bg-white text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
          >
            <span style={{ color: "#1A1C18" }}>{primaryCta}</span>
            <ArrowRight className="w-4 h-4 text-[#1A1C18]" style={{ color: "#1A1C18" }} />
          </Link>

          <Link
            href="/about"
            style={{ color: "#FFFFFF" }}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-md border border-white/30 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            <span style={{ color: "#FFFFFF" }}>{secondaryCta}</span>
          </Link>

          <Link
            href="/fit-assistant"
            style={{ color: "#FFFFFF" }}
            className="w-full sm:w-auto px-6 py-4 bg-[#8A927A]/85 hover:bg-[#8A927A] text-white text-sm font-semibold rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            <span style={{ color: "#FFFFFF" }}>Fit Assistant</span>
          </Link>
        </div>

        {/* Value Micro-Pills */}
        <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#D8C9B5]">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A927A]" />
            <span>FSC-Certified Solid Timber</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B78E69]" />
            <span>Complimentary Over $150</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A927A]" />
            <span>30-Day Risk-Free Trial</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B78E69]" />
            <span>10-Year Craft Warranty</span>
          </div>
        </div>
      </div>
    </section>
  );
}

