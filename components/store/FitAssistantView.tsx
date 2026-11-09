"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Maximize2,
  Ruler,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import type { Product, FitRecommendation } from "@/lib/types";
import { useCartStore } from "@/lib/cart/store";
import { useCurrencyStore } from "@/lib/currency/store";

const ROOM_OPTIONS = [
  { id: "living", name: "Living Room", icon: "🛋️", desc: "Shelving, side tables, credenzas" },
  { id: "workspace", name: "Workspace", icon: "💻", desc: "Desk stations, monitor risers, task lighting" },
  { id: "kitchen", name: "Kitchen & Dining", icon: "🍽️", desc: "Canisters, spice racks, serving trays" },
  { id: "bedroom", name: "Bedroom", icon: "🛏️", desc: "Nightstands, valet stands, bedside caddies" },
  { id: "bathroom", name: "Bathroom & Spa", icon: "🚿", desc: "Teak shelving, towel ladders, vanity trays" },
  { id: "lighting", name: "Atmospheric Lighting", icon: "✨", desc: "Portable mushroom lamps, pendants, floor lamps" },
];

const MATERIAL_OPTIONS = [
  { id: "any", name: "Any Material" },
  { id: "Oak", name: "Solid White Oak" },
  { id: "Aluminum", name: "Anodized Aluminum" },
  { id: "Ceramic", name: "High-Fire Ceramic / Stoneware" },
  { id: "Glass", name: "Borosilicate Glass" },
  { id: "Steel", name: "Stainless / Powder-Coated Steel" },
  { id: "Felt", name: "Merino Wool Felt" },
  { id: "Teak", name: "Plantation Teak" },
];

const COLOR_OPTIONS = [
  { id: "any", name: "Any Color", hex: "#E5E5E5" },
  { id: "Natural", name: "Natural Oak / Sand", hex: "#D8C9B5" },
  { id: "Charcoal", name: "Basalt Charcoal / Black", hex: "#292B27" },
  { id: "White", name: "Chalk Ivory / Bone", hex: "#F4F0E8" },
  { id: "Sage", name: "Sage Mist / Earthy Green", hex: "#8A927A" },
  { id: "Bronze", name: "Brushed Bronze / Brass", hex: "#B78E69" },
];

export function FitAssistantView({ allProducts }: { allProducts: Product[] }) {
  const [step, setStep] = useState(1);
  const [roomType, setRoomType] = useState("living");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [availableWidth, setAvailableWidth] = useState(120);
  const [availableHeight, setAvailableHeight] = useState(90);
  const [preferredMaterial, setPreferredMaterial] = useState("any");
  const [preferredColor, setPreferredColor] = useState("any");
  const [budgetUsd, setBudgetUsd] = useState(450);

  const [recommendations, setRecommendations] = useState<FitRecommendation[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { addProduct } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const handleCalculateFit = () => {
    setIsCalculating(true);

    const widthCm = unit === "in" ? availableWidth * 2.54 : availableWidth;
    const heightCm = unit === "in" ? availableHeight * 2.54 : availableHeight;

    setTimeout(() => {
      const results: FitRecommendation[] = [];

      for (const product of allProducts) {
        const reasons: string[] = [];
        let score = 0;

        // 1. Room Fit
        const matchesRoom = !roomType || roomType === "any" || product.room === roomType;
        if (matchesRoom) {
          score += 35;
          reasons.push(`Designed specifically for ${roomType} spaces`);
        }

        // 2. Dimensions Fit
        let dimensionsFit = true;
        if (product.dimensions) {
          const wFits = widthCm <= 0 || product.dimensions.width_cm <= widthCm;
          const hFits = heightCm <= 0 || product.dimensions.height_cm <= heightCm;

          if (wFits && hFits) {
            score += 30;
            const wDiff = (widthCm - product.dimensions.width_cm).toFixed(0);
            reasons.push(
              `Clearance: ${product.dimensions.width_cm} cm wide leaves ${wDiff} cm breathing room`
            );
          } else {
            dimensionsFit = false;
            reasons.push(
              `Exceeds boundary (${product.dimensions.width_cm} cm width vs ${widthCm.toFixed(0)} cm space)`
            );
          }
        } else {
          score += 20;
        }

        // 3. Material
        let materialMatch = false;
        if (preferredMaterial === "any") {
          materialMatch = true;
          score += 15;
        } else if (product.material?.toLowerCase().includes(preferredMaterial.toLowerCase())) {
          materialMatch = true;
          score += 20;
          reasons.push(`Crafted with your preferred ${preferredMaterial}`);
        }

        // 4. Color
        let colorMatch = false;
        if (preferredColor === "any") {
          colorMatch = true;
          score += 10;
        } else if (
          product.color_variants?.some((v) =>
            v.name.toLowerCase().includes(preferredColor.toLowerCase())
          )
        ) {
          colorMatch = true;
          score += 10;
          reasons.push(`Offered in ${preferredColor} finish`);
        }

        // 5. Budget
        let budgetMatch = true;
        const priceUsd = product.price_cents / 100;
        if (budgetUsd > 0) {
          if (priceUsd <= budgetUsd) {
            score += 10;
            reasons.push(`Priced at $${priceUsd.toFixed(0)}, comfortably inside your budget`);
          } else {
            budgetMatch = false;
          }
        } else {
          score += 10;
        }

        if (score >= 40) {
          results.push({
            product,
            matchScore: Math.min(100, score),
            fitReasons: reasons,
            dimensionsFit,
            materialMatch,
            colorMatch,
            budgetMatch,
          });
        }
      }

      results.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(results);
      setIsCalculating(false);
      setStep(4);
    }, 600);
  };

  const resetAssistant = () => {
    setStep(1);
    setRecommendations(null);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5" />
          Deterministic Spatial Matching Engine
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#292B27] mb-3">
          Find Your Perfect Fit
        </h1>
        <p className="text-sm sm:text-base text-[#77766E] font-sans">
          Provide your room dimensions, preferred aesthetic, and budget. Our studio engine determines exact clearance and recommends tailored essentials.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  step === s
                    ? "bg-[#292B27] text-white ring-4 ring-[#D8C9B5]/40"
                    : step > s
                    ? "bg-[#8A927A] text-white"
                    : "bg-white text-[#77766E] border border-[#292B27]/20"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-8 sm:w-12 h-0.5 bg-[#292B27]/15" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Room Selection */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#292B27]/10 shadow-lg animate-in fade-in duration-300">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#292B27] mb-2">
            Step 1: Which space are you designing?
          </h2>
          <p className="text-xs sm:text-sm text-[#77766E] mb-8 font-sans">
            Select the room type to calibrate ergonomic requirements and scale.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {ROOM_OPTIONS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setRoomType(room.id)}
                className={`p-5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                  roomType === room.id
                    ? "border-[#292B27] bg-[#F4F0E8] shadow-md"
                    : "border-[#292B27]/10 hover:border-[#292B27]/30 hover:bg-[#F4F0E8]/40"
                }`}
              >
                <div className="text-2xl mb-2">{room.icon}</div>
                <h3 className="font-editorial text-xl font-bold text-[#292B27]">
                  {room.name}
                </h3>
                <p className="text-xs text-[#77766E] mt-1 font-sans">
                  {room.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-8 py-3.5 bg-[#292B27] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              Next: Measure Space
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dimensions & Clearance */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#292B27]/10 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#292B27]">
              Step 2: Available Space Dimensions
            </h2>
            {/* Unit Toggle */}
            <div className="flex items-center bg-[#F4F0E8] p-1 rounded-lg border border-[#292B27]/10 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === "cm" ? "bg-white text-[#292B27] shadow-xs" : "text-[#77766E]"
                }`}
              >
                Centimeters (cm)
              </button>
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === "in" ? "bg-white text-[#292B27] shadow-xs" : "text-[#77766E]"
                }`}
              >
                Inches (in)
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#77766E] mb-8 font-sans">
            Specify the width and height of the nook, wall, or tabletop area you wish to fill.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Width Slider */}
            <div className="p-6 rounded-2xl bg-[#F4F0E8]/50 border border-[#292B27]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#292B27] flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#B78E69]" />
                  Available Width
                </span>
                <span className="font-mono text-base font-bold text-[#292B27]">
                  {availableWidth} {unit}
                </span>
              </div>
              <input
                type="range"
                min={unit === "cm" ? 30 : 12}
                max={unit === "cm" ? 220 : 86}
                value={availableWidth}
                onChange={(e) => setAvailableWidth(Number(e.target.value))}
                className="w-full accent-[#292B27] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#77766E] font-mono">
                <span>Compact ({unit === "cm" ? "30 cm" : "12 in"})</span>
                <span>Expansive ({unit === "cm" ? "220 cm" : "86 in"})</span>
              </div>
            </div>

            {/* Height Slider */}
            <div className="p-6 rounded-2xl bg-[#F4F0E8]/50 border border-[#292B27]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#292B27] flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#8A927A]" />
                  Available Height
                </span>
                <span className="font-mono text-base font-bold text-[#292B27]">
                  {availableHeight} {unit}
                </span>
              </div>
              <input
                type="range"
                min={unit === "cm" ? 20 : 8}
                max={unit === "cm" ? 180 : 70}
                value={availableHeight}
                onChange={(e) => setAvailableHeight(Number(e.target.value))}
                className="w-full accent-[#292B27] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#77766E] font-mono">
                <span>Low ({unit === "cm" ? "20 cm" : "8 in"})</span>
                <span>Tall ({unit === "cm" ? "180 cm" : "70 in"})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-[#292B27]/20 text-[#292B27] text-sm font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-8 py-3.5 bg-[#292B27] text-white text-sm font-semibold rounded-xl hover:bg-[#3d403a] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              Next: Material & Budget
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Material, Color & Budget */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#292B27]/10 shadow-lg animate-in fade-in duration-300">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#292B27] mb-2">
            Step 3: Materials, Palette & Budget
          </h2>
          <p className="text-xs sm:text-sm text-[#77766E] mb-8 font-sans">
            Refine your architectural finish preferences and investment ceiling.
          </p>

          <div className="space-y-8 mb-10">
            {/* Preferred Material */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#292B27] mb-3">
                Preferred Material
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MATERIAL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreferredMaterial(m.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border-2 transition-all cursor-pointer ${
                      preferredMaterial === m.id
                        ? "border-[#292B27] bg-[#F4F0E8] text-[#292B27] shadow-xs"
                        : "border-[#292B27]/10 text-[#77766E] hover:border-[#292B27]/30"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#292B27] mb-3">
                Preferred Color Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPreferredColor(c.id)}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-3 border-2 transition-all cursor-pointer ${
                      preferredColor === c.id
                        ? "border-[#292B27] bg-[#F4F0E8] text-[#292B27] shadow-xs"
                        : "border-[#292B27]/10 text-[#77766E] hover:border-[#292B27]/30"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="p-6 rounded-2xl bg-[#F4F0E8]/50 border border-[#292B27]/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#292B27]">
                  Maximum Target Budget (USD)
                </span>
                <span className="font-mono text-base font-bold text-[#292B27]">
                  ${budgetUsd}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={800}
                step={25}
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(Number(e.target.value))}
                className="w-full accent-[#292B27] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#77766E] font-mono">
                <span>$50</span>
                <span>$800+</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-[#292B27]/20 text-[#292B27] text-sm font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculateFit}
              className="px-10 py-4 bg-[#8A927A] hover:bg-[#7b836b] text-white text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              {isCalculating ? (
                <>Calculating Specifications...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate Match
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results & Recommendations */}
      {step === 4 && recommendations && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Summary Box */}
          <div className="bg-[#292B27] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D8C9B5] uppercase tracking-wider mb-1">
                <span>Evaluation Complete</span>
                <span>·</span>
                <span>{recommendations.length} Recommended Matches</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
                Tailored for your {roomType} space ({availableWidth}×{availableHeight} {unit})
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAssistant}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start New Search
            </button>
          </div>

          {/* Recommendations List */}
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#292B27]/10">
              <h3 className="font-editorial text-2xl font-bold text-[#292B27] mb-2">
                No exact fit found for these dimensions
              </h3>
              <p className="text-sm text-[#77766E] max-w-md mx-auto mb-6">
                Your available space ({availableWidth} × {availableHeight} {unit}) is either too compact or requires custom architectural modularity. Try expanding the dimensions or browsing all products.
              </p>
              <button
                type="button"
                onClick={resetAssistant}
                className="px-6 py-3 bg-[#292B27] text-white text-sm font-semibold rounded-xl"
              >
                Adjust Parameters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map(({ product, matchScore, fitReasons }) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#292B27]/10 shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 sm:gap-8 items-center"
                >
                  {/* Product Image */}
                  <div className="relative w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-[#F4F0E8] shrink-0 border border-[#292B27]/10">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 224px"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#8A927A] text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {matchScore}% Match
                    </div>
                  </div>

                  {/* Product Details & Fit Reasons */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-editorial text-2xl font-bold text-[#1A1C18] hover:text-[#B78E69] transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="font-mono text-xl font-bold text-[#1A1C18]">
                        {formatPrice(product.price_cents)}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A483E] leading-relaxed">
                      {product.description}
                    </p>

                    {/* Dimensions Comparison Pill */}
                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                      <span className="px-3 py-1 bg-[#F4F0E8] text-[#1A1C18] rounded-lg font-medium border border-[#1A1C18]/10">
                        Dimensions: {product.dimensions?.text}
                      </span>
                      <span className="px-3 py-1 bg-[#F4F0E8] text-[#1A1C18] rounded-lg font-medium border border-[#1A1C18]/10">
                        Material: {product.material}
                      </span>
                    </div>

                    {/* Deterministic Reasons */}
                    <div className="space-y-1.5 pt-2 border-t border-[#1A1C18]/10">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A927A] block">
                        Why It Fits:
                      </span>
                      {fitReasons.map((reason, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-[#1A1C18]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#8A927A] shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/product/${product.slug}`}
                        className="px-6 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        View Specifications
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => addProduct(product, 1)}
                        className="px-5 py-2.5 border border-[#1A1C18]/20 text-[#1A1C18] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Quick Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

