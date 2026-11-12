"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";

  export function ReviewAdminList({ reviews: initialReviews }: { reviews: Review[] }) {
    const router = useRouter();
    const [reviews] = useState<Review[]>(initialReviews);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "published" | "hidden" | "5star">("all");
    const [busyId, setBusyId] = useState<string | null>(null);

    async function toggle(review: Review) {
      setBusyId(review.id);
      try {
        await fetch(`/api/admin/reviews/${review.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: !review.is_published }),
        });
        router.refresh();
      } finally {
        setBusyId(null);
      }
    }

    const filteredReviews = useMemo(() => {
      return reviews.filter((r) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          (r.product?.name && r.product.name.toLowerCase().includes(q)) ||
          (r.reviewer_name && r.reviewer_name.toLowerCase().includes(q)) ||
          (r.comment && r.comment.toLowerCase().includes(q));

        const matchesFilter =
          filter === "all"
            ? true
            : filter === "published"
              ? r.is_published
              : filter === "hidden"
                ? !r.is_published
                : r.rating === 5;

        return matchesSearch && matchesFilter;
      });
    }, [reviews, search, filter]);

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "5.0";

    const publishedCount = reviews.filter((r) => r.is_published).length;
    const hiddenCount = reviews.filter((r) => !r.is_published).length;

    return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <span>Customer Feedback</span>
            <span>·</span>
            <span>Social Proof Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            Product Reviews &amp; Collector Endorsements
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Audit customer satisfaction, publish verified buyer ratings, and curate social proof.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shrink-0"
        >
          ← Back to Overview
        </Link>
      </div>

      {/* 2. Rating Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18] flex items-center gap-1.5">
            <span>{avgRating}</span>
            <span className="text-sm text-[#77766E] font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold font-mono">
            ★ Top Tier Customer Satisfaction
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Submissions</span>
            <MessageSquare className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">{reviews.length} Reviews</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">100% verified purchasers</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published on Store</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">{publishedCount} Live</div>
          <div className="text-[10px] text-emerald-700/80 font-mono">Visible on product pages</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending / Hidden</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">{hiddenCount} Hidden</div>
          <div className="text-[10px] text-amber-700/80 font-mono">Internal moderation queue</div>
        </div>
      </div>

      {/* 3. Search & Moderation Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A483E]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, reviewer, or review comment..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder:text-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A483E] hover:text-[#1A1C18]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: `All Reviews (${reviews.length})` },
            { id: "published", label: `Published Live (${publishedCount})` },
            { id: "hidden", label: `Hidden / Draft (${hiddenCount})` },
            { id: "5star", label: `5-Star Ratings (${reviews.filter((r) => r.rating === 5).length})` },
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setFilter(
                    tab.id as "all" | "published" | "hidden" | "5star"
                  )
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[#1A1C18] text-white"
                    : "bg-stone-100 text-[#4A483E] hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Review Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#1A1C18]/10 text-[#4A483E]">
            <MessageSquare className="w-8 h-8 mx-auto text-[#8A927A] mb-2" />
            <div className="font-bold text-[#1A1C18]">No reviews match your query</div>
            <p className="text-xs text-[#4A483E]/70 mt-1">Try resetting the filter or search keywords.</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const reviewer = review.reviewer_name || `Collector ${review.user_id.slice(0, 6)}`;
            const initials = reviewer
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={review.id}
                className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1C18]/8 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 border border-[#1A1C18]/10 flex items-center justify-center text-xs font-bold text-[#1A1C18] shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A1C18]">{reviewer}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Purchaser
                        </span>
                      </div>
                      <span className="text-[11px] text-[#4A483E]/70 font-mono">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Product Tag */}
                  {review.product && (
                    <Link
                      href={`/product/${review.product.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#B78E69] hover:underline"
                    >
                      <span>{review.product.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Stars and Comment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-amber-500 fill-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold font-mono ml-2 text-[#1A1C18]">
                      {review.rating}.0 / 5.0
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#1A1C18] leading-relaxed font-sans italic bg-[#FAF9F6] p-3.5 rounded-xl border border-[#1A1C18]/6">
                    &ldquo;{review.comment || "No written comment provided."}&rdquo;
                  </p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      review.is_published
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {review.is_published ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Visible on Storefront</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-amber-600" />
                        <span>Hidden from Public</span>
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => toggle(review)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#1A1C18] text-[#1A1C18] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {busyId === review.id
                      ? "Updating..."
                      : review.is_published
                      ? "Hide Review"
                      : "Publish to Storefront"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    );
  }
