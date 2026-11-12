"use client";

import { Star, Quote, CheckCircle2 } from "lucide-react";
import type { Review } from "@/lib/types";

export function CustomerReviewsSection({
  reviews = [],
}: {
  reviews?: Review[];
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-[#F4F0E8] border-t border-[#1A1C18]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Customer Reflections
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1C18] mb-4">
            Resonating Across Living Spaces
          </h2>
          <p className="text-sm sm:text-base text-[#4A483E] font-sans leading-relaxed">
            Reflections from patrons and design enthusiasts who have welcomed Kstore essentials into their homes.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-7 rounded-3xl border border-[#1A1C18]/12 shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-[#B78E69]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#D8C9B5]" />
                </div>

                <p className="text-xs sm:text-sm text-[#1A1C18] leading-relaxed italic font-sans mb-6">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A1C18]/10">
                <div className="font-bold text-xs text-[#1A1C18]">
                  {review.reviewer_name?.split(",")[0] || "Verified Patron"}
                </div>
                <div className="text-[11px] text-[#4A483E] mt-0.5 font-medium">
                  {review.reviewer_name?.split(",")[1] || "Living Space Collector"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
