import { MessageSquare } from "lucide-react";
import { StarRating } from "@/components/shared/StarRating";
import { ReviewForm } from "@/components/store/ReviewForm";
import { getCurrentProfile } from "@/lib/data/auth";
import {
  getProductRatingSummary,
  getProductReviews,
  getReviewableProducts,
} from "@/lib/data/reviews";
import { formatDate } from "@/lib/format";
import type { Product } from "@/lib/types";

// Server component: rating summary + published reviews + an eligibility-
// gated review form (only customers with this product in a paid order).
export async function ProductReviews({ product }: { product: Product }) {
  const [summary, reviews, profile] = await Promise.all([
    getProductRatingSummary(product.id),
    getProductReviews(product.id),
    getCurrentProfile(),
  ]);

  const reviewable = profile ? await getReviewableProducts(profile.id) : [];
  const mine = reviewable.find((item) => item.productId === product.id);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div className="flex items-center gap-3">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18]">
            Customer Reviews
          </h2>
          <StarRating value={summary.average} showValue />
          {summary.count > 0 && (
            <span className="text-xs text-[#8A927A] font-mono">
              ({summary.count} {summary.count > 1 ? "reviews" : "review"})
            </span>
          )}
        </div>

        {mine && (
          <ReviewForm
            productId={mine.productId}
            orderId={mine.orderId}
            productName={product.name}
          />
        )}
      </div>

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#B78E69]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1A1C18]">
            No Customer Reflections Yet
          </h3>
          <p className="text-xs text-[#4A483E]/70 max-w-sm mx-auto">
            Acquired this essential previously? Sign in and share how it performs in your daily living rituals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StarRating value={review.rating} />
                  <span className="text-xs font-bold text-[#1A1C18]">
                    {review.reviewer_name ?? "Verified Patron"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8A927A]">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="text-xs sm:text-sm text-[#4A483E] leading-relaxed pt-1 border-t border-[#1A1C18]/5">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
