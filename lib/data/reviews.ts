import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MOCK_REVIEWS } from "@/lib/data/mockData";
import { getOrdersForUser, SYSTEM_GUEST_USER_ID } from "@/lib/data/orders";
import type { Order, Review } from "@/lib/types";

declare global {
  var __kstore_memory_reviews__: Review[] | undefined;
}

const inMemoryReviews: Review[] =
  globalThis.__kstore_memory_reviews__ ??
  (globalThis.__kstore_memory_reviews__ = [...MOCK_REVIEWS]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RatingSummary = { average: number; count: number };

export type ReviewEligibility = {
  status:
    | "unauthenticated"
    | "eligible"
    | "already_reviewed"
    | "purchase_required";
  eligibleOrderId: string | null;
  eligibleOrderNumber: string | null;
};

export class ReviewEligibilityError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "ReviewEligibilityError";
    this.statusCode = statusCode;
  }
}

function isConnectivityError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("not configured") ||
    msg.includes("fetch failed") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused") ||
    msg.includes("network")
  );
}

async function attachReviewerNames(reviews: Review[]): Promise<Review[]> {
  const missingUserIds = Array.from(
    new Set(
      reviews
        .filter((r) => !r.reviewer_name && r.user_id && UUID_REGEX.test(r.user_id))
        .map((r) => r.user_id),
    ),
  );
  if (missingUserIds.length === 0) return reviews;

  try {
    const admin = createAdminClient();
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", missingUserIds);

    const nameMap = new Map<string, string>();
    for (const p of profiles ?? []) {
      if (p.id && p.full_name) {
        nameMap.set(p.id as string, p.full_name as string);
      }
    }

    return reviews.map((r) => ({
      ...r,
      reviewer_name: r.reviewer_name ?? nameMap.get(r.user_id) ?? null,
    }));
  } catch {
    return reviews;
  }
}

async function syncProductRatingStats(productId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_published", true);

    const ratings = (data ?? []).map((row) => Number(row.rating)).filter((n) => !Number.isNaN(n));
    const count = ratings.length;
    const average =
      count > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
        : null;

    await admin
      .from("products")
      .update({ rating: average, review_count: count })
      .eq("id", productId);
  } catch {
    // Non-fatal if rating columns differ
  }
}

async function fetchUserOrdersWithItems(
  userId: string,
  userEmail?: string | null,
): Promise<{ orders: Order[]; fromDatabase: boolean }> {
  const hasValidUuid = UUID_REGEX.test(userId);
  const normalizedEmail = userEmail?.trim().toLowerCase() || "";

  try {
    const admin = createAdminClient();
    const collected = new Map<string, Order>();

    if (hasValidUuid) {
      const { data: byUser, error } = await admin
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      for (const row of (byUser ?? []) as Order[]) {
        collected.set(row.id, row);
      }
    }

    if (normalizedEmail) {
      const { data: byEmail, error } = await admin
        .from("orders")
        .select("*, items:order_items(*)")
        .ilike("customer_email", normalizedEmail)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      for (const row of (byEmail ?? []) as Order[]) {
        const isOwnedOrGuest =
          row.user_id === userId ||
          !row.user_id ||
          row.user_id === SYSTEM_GUEST_USER_ID;
        if (isOwnedOrGuest) {
          collected.set(row.id, row);
        }
      }
    }

    return {
      orders: Array.from(collected.values()).sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      ),
      fromDatabase: true,
    };
  } catch (err) {
    if (!isConnectivityError(err)) {
      throw err;
    }
  }

  const memOrders = await getOrdersForUser(userId, userEmail);
  return { orders: memOrders, fromDatabase: false };
}

async function getReviewedKeysForUser(
  userId: string,
  orderIds: string[],
  fromDatabase: boolean,
): Promise<{
  reviewedOrderProductCounts: Map<string, number>;
  legacyProductReviewCounts: Map<string, number>;
}> {
  const reviewedOrderProductCounts = new Map<string, number>();
  const legacyProductReviewCounts = new Map<string, number>();

  if (fromDatabase) {
    const admin = createAdminClient();
    const seenIds = new Set<string>();
    const rows: Array<{ id: string; order_id: string | null; product_id: string }> = [];

    if (UUID_REGEX.test(userId)) {
      const { data } = await admin
        .from("reviews")
        .select("id, order_id, product_id")
        .eq("user_id", userId);
      for (const r of data ?? []) {
        if (!seenIds.has(r.id as string)) {
          seenIds.add(r.id as string);
          rows.push(r as { id: string; order_id: string | null; product_id: string });
        }
      }
    }

    if (orderIds.length > 0) {
      const { data } = await admin
        .from("reviews")
        .select("id, order_id, product_id")
        .in("order_id", orderIds);
      for (const r of data ?? []) {
        if (!seenIds.has(r.id as string)) {
          seenIds.add(r.id as string);
          rows.push(r as { id: string; order_id: string | null; product_id: string });
        }
      }
    }

    for (const r of rows) {
      if (r.order_id) {
        const key = `${r.order_id}:${r.product_id}`;
        reviewedOrderProductCounts.set(
          key,
          (reviewedOrderProductCounts.get(key) ?? 0) + 1,
        );
      } else {
        legacyProductReviewCounts.set(
          r.product_id,
          (legacyProductReviewCounts.get(r.product_id) ?? 0) + 1,
        );
      }
    }

    return { reviewedOrderProductCounts, legacyProductReviewCounts };
  }

  for (const r of inMemoryReviews) {
    const matchesUser = r.user_id === userId;
    const matchesOrder = Boolean(r.order_id && orderIds.includes(r.order_id));
    if (!matchesUser && !matchesOrder) continue;
    if (r.order_id) {
      const key = `${r.order_id}:${r.product_id}`;
      reviewedOrderProductCounts.set(
        key,
        (reviewedOrderProductCounts.get(key) ?? 0) + 1,
      );
    } else {
      legacyProductReviewCounts.set(
        r.product_id,
        (legacyProductReviewCounts.get(r.product_id) ?? 0) + 1,
      );
    }
  }

  return { reviewedOrderProductCounts, legacyProductReviewCounts };
}

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
      .select("*")
      .eq("product_id", productId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && Array.isArray(data)) {
      return await attachReviewerNames(data as Review[]);
    }
  } catch {}

  return inMemoryReviews.filter(
    (r) =>
      (r.product_id === productId || r.product_id.includes(productId)) &&
      r.is_published,
  );
}

// Check whether a user can review a specific product on its product page.
export async function checkProductReviewEligibility(
  userId?: string | null,
  userEmail?: string | null,
  productId?: string,
): Promise<ReviewEligibility> {
  if (!userId || !productId) {
    return {
      status: "unauthenticated",
      eligibleOrderId: null,
      eligibleOrderNumber: null,
    };
  }

  try {
    const { orders, fromDatabase } = await fetchUserOrdersWithItems(
      userId,
      userEmail,
    );
    const qualifiedOrders = orders.filter(
      (order) =>
        (order.payment_status === "paid" || order.delivery_status === "delivered") &&
        (order.items ?? []).some((item) => item.product_id === productId),
    );

    if (qualifiedOrders.length === 0) {
      return {
        status: "purchase_required",
        eligibleOrderId: null,
        eligibleOrderNumber: null,
      };
    }

    const { reviewedOrderProductCounts, legacyProductReviewCounts } =
      await getReviewedKeysForUser(
        userId,
        qualifiedOrders.map((o) => o.id),
        fromDatabase,
      );

    const legacyCount = legacyProductReviewCounts.get(productId) ?? 0;
    const unreviewed = qualifiedOrders.filter((o) => {
      const itemCount = (o.items ?? []).filter(
        (item) => item.product_id === productId,
      ).length;
      const reviewedCount =
        reviewedOrderProductCounts.get(`${o.id}:${productId}`) ?? 0;
      return itemCount > reviewedCount;
    });

    if (unreviewed.length === 0 || (legacyCount >= unreviewed.length)) {
      return {
        status: "already_reviewed",
        eligibleOrderId: null,
        eligibleOrderNumber: null,
      };
    }

    return {
      status: "eligible",
      eligibleOrderId: unreviewed[0].id,
      eligibleOrderNumber: unreviewed[0].order_number,
    };
  } catch {
    return {
      status: "purchase_required",
      eligibleOrderId: null,
      eligibleOrderNumber: null,
    };
  }
}

// Products from the user's paid or delivered orders that they haven't
// reviewed yet — the "To review" list on the account dashboard.
export async function getReviewableProducts(
  userId: string,
  userEmail?: string | null,
) {
  try {
    const { orders, fromDatabase } = await fetchUserOrdersWithItems(
      userId,
      userEmail,
    );
    const qualifiedOrders = orders.filter(
      (o) => o.payment_status === "paid" || o.delivery_status === "delivered",
    );

    const { reviewedOrderProductCounts } = await getReviewedKeysForUser(
      userId,
      qualifiedOrders.map((o) => o.id),
      fromDatabase,
    );

    return qualifiedOrders.flatMap((order) => {
      const skippedCounts = new Map<string, number>();
      const pendingItems: Array<{
        orderItemId: string;
        orderId: string;
        orderNumber: string;
        productId: string;
        productName: string;
        productSlug: string | null;
        variantLabel: string | null;
      }> = [];

      for (const item of order.items ?? []) {
        if (!item.product_id) continue;
        const key = `${order.id}:${item.product_id}`;
        const reviewedCount = reviewedOrderProductCounts.get(key) ?? 0;
        const alreadySkipped = skippedCounts.get(key) ?? 0;
        if (alreadySkipped < reviewedCount) {
          skippedCounts.set(key, alreadySkipped + 1);
          continue;
        }
        const variantLabel =
          [item.selected_color, item.selected_material]
            .filter(Boolean)
            .join(" · ") || null;
        pendingItems.push({
          orderItemId: item.id,
          orderId: order.id,
          orderNumber: order.order_number,
          productId: item.product_id,
          productName: item.product_name,
          productSlug: item.product_slug,
          variantLabel,
        });
      }

      return pendingItems;
    });
  } catch {
    return [];
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const isUuid = UUID_REGEX.test(userId);
  if (!isUuid) {
    return inMemoryReviews.filter((r) => r.user_id === userId);
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reviews")
      .select("*, product:products(name, slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && Array.isArray(data)) {
      return data as Review[];
    }
  } catch {}
  return inMemoryReviews.filter((r) => r.user_id === userId);
}

export async function createReview(input: {
  userId: string;
  userEmail?: string | null;
  reviewerName?: string | null;
  productId: string;
  orderId?: string | null;
  rating: number;
  comment?: string;
}): Promise<Review> {
  if (!input.userId) {
    throw new ReviewEligibilityError("Sign in to review your orders.", 401);
  }

  const { orders, fromDatabase } = await fetchUserOrdersWithItems(
    input.userId,
    input.userEmail,
  );

  const matchingOrders = orders.filter(
    (order) =>
      (order.payment_status === "paid" || order.delivery_status === "delivered") &&
      (order.items ?? []).some((item) => item.product_id === input.productId),
  );

  if (matchingOrders.length === 0) {
    throw new ReviewEligibilityError(
      "Only customers with a paid or delivered order containing this item can submit a review.",
      403,
    );
  }

  const { reviewedOrderProductCounts, legacyProductReviewCounts } =
    await getReviewedKeysForUser(
      input.userId,
      matchingOrders.map((o) => o.id),
      fromDatabase,
    );

  let verifiedOrder: Order | undefined;
  if (input.orderId) {
    verifiedOrder = matchingOrders.find((o) => o.id === input.orderId);
    if (!verifiedOrder) {
      throw new ReviewEligibilityError(
        "Only paid or delivered orders you placed containing this item can be reviewed.",
        403,
      );
    }
    const itemCount = (verifiedOrder.items ?? []).filter(
      (item) => item.product_id === input.productId,
    ).length;
    const reviewedCount =
      reviewedOrderProductCounts.get(`${verifiedOrder.id}:${input.productId}`) ??
      0;
    if (reviewedCount >= itemCount) {
      throw new ReviewEligibilityError(
        "You have already submitted a review for this item on this order.",
        409,
      );
    }
  } else {
    const unreviewedOrders = matchingOrders.filter((o) => {
      const itemCount = (o.items ?? []).filter(
        (item) => item.product_id === input.productId,
      ).length;
      const reviewedCount =
        reviewedOrderProductCounts.get(`${o.id}:${input.productId}`) ?? 0;
      return itemCount > reviewedCount;
    });
    const legacyCount = legacyProductReviewCounts.get(input.productId) ?? 0;
    if (unreviewedOrders.length === 0 || legacyCount >= unreviewedOrders.length) {
      throw new ReviewEligibilityError(
        "You have already reviewed your verified purchase of this product.",
        409,
      );
    }
    verifiedOrder = unreviewedOrders[0];
  }

  const displayName =
    input.reviewerName?.trim() ||
    input.userEmail?.split("@")[0] ||
    "Verified Resident";

  if (fromDatabase) {
    const admin = createAdminClient();
    let res = await admin
      .from("reviews")
      .insert({
        product_id: input.productId,
        order_id: verifiedOrder.id,
        user_id: UUID_REGEX.test(input.userId) ? input.userId : null,
        rating: input.rating,
        comment: input.comment?.trim() || null,
        reviewer_name: displayName,
        is_published: true,
      })
      .select("*")
      .single();

    if (res.error && res.error.code === "42703") {
      res = await admin
        .from("reviews")
        .insert({
          product_id: input.productId,
          order_id: verifiedOrder.id,
          user_id: UUID_REGEX.test(input.userId) ? input.userId : null,
          rating: input.rating,
          comment: input.comment?.trim() || null,
          is_published: true,
        })
        .select("*")
        .single();
    }

    if (res.error) {
      if (res.error.code === "23505") {
        throw new ReviewEligibilityError(
          "You have already submitted a review for this order item.",
          409,
        );
      }
      throw new Error(res.error.message);
    }

    await syncProductRatingStats(input.productId);

    const created = res.data as Review;
    return {
      ...created,
      reviewer_name: created.reviewer_name ?? displayName,
    };
  }

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    product_id: input.productId,
    order_id: verifiedOrder.id,
    user_id: input.userId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reviewer_name: displayName,
  };
  inMemoryReviews.unshift(newReview);
  return newReview;
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reviews")
      .select("*, product:products(name, slug)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && Array.isArray(data)) {
      return await attachReviewerNames(data as Review[]);
    }
  } catch {}
  return inMemoryReviews;
}

export async function getPublishedReviews(limit = 24): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, product:products(name, slug)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data) && data.length > 0) {
      return await attachReviewerNames(data as Review[]);
    }
  } catch {}
  return inMemoryReviews.filter((r) => r.is_published).slice(0, limit);
}

export async function setReviewPublished(
  reviewId: string,
  isPublished: boolean,
): Promise<void> {
  const memIdx = inMemoryReviews.findIndex((r) => r.id === reviewId);
  if (memIdx !== -1) {
    inMemoryReviews[memIdx] = { ...inMemoryReviews[memIdx], is_published: isPublished };
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reviews")
      .update({ is_published: isPublished })
      .eq("id", reviewId)
      .select("product_id")
      .maybeSingle();
    if (error && memIdx === -1) throw new Error(error.message);
    if (data?.product_id) {
      await syncProductRatingStats(data.product_id as string);
    }
  } catch (err) {
    if (memIdx === -1) throw err;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const memIdx = inMemoryReviews.findIndex((r) => r.id === reviewId);
  if (memIdx !== -1) {
    inMemoryReviews.splice(memIdx, 1);
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .select("product_id")
      .maybeSingle();
    if (error && memIdx === -1) throw new Error(error.message);
    if (data?.product_id) {
      await syncProductRatingStats(data.product_id as string);
    }
  } catch (err) {
    if (memIdx === -1) throw err;
  }
}
