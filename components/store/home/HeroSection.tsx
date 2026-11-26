"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { Banner } from "@/lib/types";

export interface HeroSectionProps {
  banners?: Banner[];
  headline?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string;
  storeName?: string;
  tagline?: string;
}

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80";

export function HeroSection({
  banners = [],
  headline = "Make room for what matters.",
  description = "Thoughtfully designed essentials for a more organized, beautiful home.",
  primaryCta = "Explore Collection",
  secondaryCta = "Discover Our Story",
  imageUrl = DEFAULT_HERO_IMAGE,
  storeName = "Kstore",
  tagline,
}: HeroSectionProps) {
  // Filter active hero banners
  const activeBanners = banners.filter(
    (b) => b.placement === "hero" && b.is_active !== false,
  );

  // Normalize banners into a consistent slides array, falling back to defaults if empty
  const slides: HeroSlide[] =
    activeBanners.length > 0
      ? activeBanners.map((b, idx) => ({
          id: b.id || `banner-hero-${idx}`,
          title: b.title || headline,
          subtitle:
            b.subtitle ||
            tagline ||
            description ||
            "Thoughtfully designed essentials for a more organized, beautiful home.",
          imageUrl: b.image_url || imageUrl || DEFAULT_HERO_IMAGE,
          ctaLabel: b.cta_label || primaryCta || "Explore Collection",
          ctaHref: b.cta_href || "/shop",
        }))
      : [
          {
            id: "default-hero-slide",
            title: headline,
            subtitle: description,
            imageUrl: imageUrl || DEFAULT_HERO_IMAGE,
            ctaLabel: primaryCta,
            ctaHref: "/shop",
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);

  const isPaused = isHovered || isManualPaused;
  const isMultiple = slides.length > 1;

  // Next / Prev slide handlers with wrap-around
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Silky 6-second auto-advance timer (pauses on hover or manual pause)
  useEffect(() => {
    if (!isMultiple || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isMultiple, isPaused, slides.length, currentIndex]);

  // Touch Swipe gestures for smartphones and tablets
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current || !isMultiple) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  // Keyboard navigation when hero section is in view
  useEffect(() => {
    if (!isMultiple) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMultiple, nextSlide, prevSlide]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Storefront Hero Showcase"
      className="relative w-full min-h-[480px] sm:min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-[#292B27] select-none"
    >
      {/* Background Lifestyle Image Slides (Crossfade Transitions) */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-1 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center opacity-85 transition-transform duration-[6000ms] ease-out ${
                  isActive ? "scale-100" : "scale-104"
                }`}
              />
              {/* Subtle Dark Editorial Gradient for guaranteed legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#292B27]/95 via-[#292B27]/50 to-[#292B27]/30" />
            </div>
          );
        })}
      </div>

      {/* Floating Side Arrow Navigation (Desktop/Tablet only so it never overlaps mobile CTAs) */}
      {isMultiple && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous hero slide"
            title="Previous slide (Left Arrow)"
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/25 hover:bg-black/55 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next hero slide"
            title="Next slide (Right Arrow)"
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/25 hover:bg-black/55 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Hero Content Container */}
      <div
        key={`slide-content-${currentSlide.id}-${currentIndex}`}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-20 sm:py-20 text-center text-white animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out"
      >
        {/* Brand Kicker with Slide Counter */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium uppercase tracking-widest mb-4 sm:mb-6 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B78E69]" />
          <span>{storeName} Living Essentials</span>
          {isMultiple && (
            <>
              <span className="text-white/40">·</span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[#D8C9B5]">
                0{currentIndex + 1} / 0{slides.length}
              </span>
            </>
          )}
        </div>

        {/* Headline */}
        <h1 className="font-editorial text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-3.5 sm:mb-6 leading-[1.1] max-w-4xl mx-auto">
          {currentSlide.title}
        </h1>

        {/* Description */}
        <p className="font-sans text-sm sm:text-lg lg:text-xl text-[#F4F0E8]/90 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-light">
          {currentSlide.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
          <Link
            href={currentSlide.ctaHref}
            data-btn="light"
            style={{ color: "#1A1C18", backgroundColor: "#F4F0E8" }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#F4F0E8] text-[#1A1C18] hover:bg-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
          >
            <span style={{ color: "#1A1C18" }}>{currentSlide.ctaLabel}</span>
            <ArrowRight className="w-4 h-4 text-[#1A1C18]" style={{ color: "#1A1C18" }} />
          </Link>

          <Link
            href="/story"
            style={{ color: "#FFFFFF" }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md border border-white/30 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            <span style={{ color: "#FFFFFF" }}>{secondaryCta}</span>
          </Link>

          <Link
            href="/fit-assistant"
            style={{ color: "#FFFFFF" }}
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 bg-[#8A927A]/85 hover:bg-[#8A927A] text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            <span style={{ color: "#FFFFFF" }}>Fit Assistant</span>
          </Link>
        </div>

        {/* Value Micro-Pills */}
        <div className="mt-8 pt-5 sm:mt-14 sm:pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-[#D8C9B5]">
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

      {/* Bottom Slider Navigation Strip: Progress Bars & Play/Pause Controller */}
      {isMultiple && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
          {/* Slide Indicator Bars */}
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to hero slide ${idx + 1}: ${slide.title}`}
                  title={`Slide ${idx + 1} of ${slides.length}`}
                  className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "w-8 sm:w-10 bg-white shadow-xs"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>

          <div className="w-px h-3.5 bg-white/20" />

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={() => setIsManualPaused(!isManualPaused)}
            className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
            title={isManualPaused ? "Resume auto-slide" : "Pause auto-slide"}
            aria-label={isManualPaused ? "Resume auto-slide" : "Pause auto-slide"}
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-[#B78E69] fill-[#B78E69]" />
                <span className="hidden sm:inline text-amber-200">Paused</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-white/80" />
                <span className="hidden sm:inline text-white/75">Slide</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
