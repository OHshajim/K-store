import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
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
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <Text type="display-2" as="h2">
          Reviews
        </Text>
        <StarRating value={summary.average} showValue />
        {summary.count > 0 && (
          <Text type="supporting" color="secondary">
            {summary.count} review{summary.count > 1 ? "s" : ""}
          </Text>
        )}
        {mine && (
          <ReviewForm
            productId={mine.productId}
            orderId={mine.orderId}
            productName={product.name}
          />
        )}
      </HStack>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Bought this before? Sign in and share how it holds up."
        />
      ) : (
        reviews.map((review) => (
          <Card key={review.id} padding={4} variant="muted">
            <VStack gap={2}>
              <HStack gap={3} vAlign="center">
                <StarRating value={review.rating} />
                <Text type="label" weight="bold">
                  {review.reviewer_name ?? "Verified buyer"}
                </Text>
                <Text type="supporting" color="secondary">
                  {formatDate(review.created_at)}
                </Text>
              </HStack>
              {review.comment && (
                <>
                  <Divider />
                  <Text type="body">{review.comment}</Text>
                </>
              )}
            </VStack>
          </Card>
        ))
      )}
    </VStack>
  );
}
