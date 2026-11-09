"use client";

import { Compass, ShieldCheck, Layers, HeartHandshake } from "lucide-react";

const BENEFITS = [
  {
    icon: Compass,
    title: "Thoughtful Design",
    description:
      "Minimalist Scandinavian aesthetics rooted in proportion, ergonomic comfort, and architectural stillness.",
  },
  {
    icon: Layers,
    title: "Quality Materials",
    description:
      "Solid quarter-sawn European oak, high-fire ceramic, borosilicate glass, and aerospace anodized aluminum.",
  },
  {
    icon: ShieldCheck,
    title: "Functional Living",
    description:
      "Engineered to solve everyday clutter with integrated cable routing, modular joinery, and durable finishes.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-First Experience",
    description:
      "30-day in-home trial, complimentary shipping on orders over $150, and human concierge support.",
  },
];

export function BrandBenefitsSection() {
  return (
    <section className="py-20 bg-white border-y border-[#1A1C18]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-2 font-sans">
            Our Commitments
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1C18]">
            Built with Intention for Modern Living
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-7 rounded-3xl bg-[#F4F0E8]/60 border border-[#1A1C18]/10 hover:bg-[#F4F0E8] transition-all hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#B78E69] mb-5 border border-[#1A1C18]/10">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1A1C18] mb-2">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A483E] leading-relaxed font-sans">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
