import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MOCK_REVIEWS } from "@/lib/data/mockData";
import type { Review } from "@/lib/types";

declare global {
  var __kstore_memory_reviews__: Review[] | undefined;
}

const inMemoryReviews: Review[] =
  globalThis.__kstore_memory_reviews__ ??
  (globalThis.__kstore_memory_reviews__ = [...MOCK_REVIEWS]);

export type RatingSummary = { average: number; count: number };

export async function getProductRatingSummary(
  productId: string,
): Promise<RatingSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_published", true);

  const ratings = (data ?? []).map((row) => row.rating as number);
  if (!ratings.length) return { average: 0, count: 0 };
  return {
    average:
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
      10,
    count: ratings.length,
  };
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, reviewer_name:profiles(full_name)")
      .eq("product_id", productId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      return ((data ?? []) as Array<Review & { reviewer_name: { full_name: string | null } | null }>).map(
        (review) => ({
          ...review,
          reviewer_name: review.reviewer_name?.full_name ?? null,
        }),
      );
    }
  } catch { }

  return inMemoryReviews.filter(
    (r) =>
      (r.product_id === productId || r.product_id.includes(productId)) &&
      r.is_published
  );
}

// Products from the user's paid or delivered orders that they haven't
// reviewed yet — the "To review" list on the account dashboard.
export async function getReviewableProducts(userId: string) {
  try {
    const supabase = await createClient();
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, payment_status, delivery_status, items:order_items(product_id, product_name, product_slug)")
      .eq("user_id", userId)
      .or("payment_status.eq.paid,delivery_status.eq.delivered")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: reviewed } = await supabase
      .from("reviews")
      .select("order_id, product_id")
      .eq("user_id", userId);

    const reviewedKeys = new Set(
      (reviewed ?? []).map((r) => `${r.order_id}:${r.product_id}`),
    );

    return (orders ?? []).flatMap((order) =>
      (order.items ?? [])
        .filter(
          (item) =>
            item.product_id &&
            !reviewedKeys.has(`${order.id}:${item.product_id}`),
        )
        .map((item) => ({
          orderId: order.id,
          orderNumber: order.order_number,
          productId: item.product_id!,
          productName: item.product_name,
          productSlug: item.product_slug,
        })),
    );
  } catch {
    return [];
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*, product:products(name, slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export async function createReview(input: {
  userId: string;
  productId: string;
  orderId?: string | null;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input.userId,
    );
  const isOrderUuid =
    input.orderId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.orderId,
      )
      ? input.orderId
      : null;

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    product_id: input.productId,
    order_id: isOrderUuid || "",
    user_id: input.userId || "anonymous",
    rating: input.rating,
    comment: input.comment || null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reviewer_name: "Verified Collector",
  };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("reviews").insert({
      product_id: input.productId,
      order_id: isOrderUuid,
      user_id: isUuid ? input.userId : null,
      rating: input.rating,
      comment: input.comment || null,
      is_published: true,
    });
    if (error) {
      console.warn("Reviews insert fallback:", error.message);
    }
  } catch (err) {
    console.warn("Reviews exception fallback:", err);
  }

  inMemoryReviews.unshift(newReview);
  return newReview;
}

export async function getAllReviews(): Promise<Review[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("*, product:products(name, slug), reviewer_name:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return ((data ?? []) as Array<Review & { reviewer_name: { full_name: string | null } | null }>).map(
    (review) => ({
      ...review,
      reviewer_name: review.reviewer_name?.full_name ?? null,
    }),
  );
}

export async function getPublishedReviews(limit = 24): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*, product:products(name, slug)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data && data.length > 0) return data as Review[];
  } catch { }
  return [];
}

export async function setReviewPublished(
  reviewId: string,
  isPublished: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ is_published: isPublished })
    .eq("id", reviewId);
  if (error) throw new Error(error.message);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .delete()
    .eq("id", reviewId);
  if (error) throw new Error(error.message);
}
