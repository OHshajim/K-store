import { createAdminClient } from "@/lib/supabase/admin";

export type AdminCounts = {
  products: number;
  categories: number;
  orders: number;
  activeBanners: number;
  reviewsCount: number;
  averageRating: number | null;
  users: number;
  articles: number;
};

export async function getAdminCounts(): Promise<AdminCounts> {
  const counts: AdminCounts = {
    products: 0,
    categories: 0,
    orders: 0,
    activeBanners: 0,
    reviewsCount: 0,
    averageRating: null,
    users: 0,
    articles: 0,
  };

  try {
    const admin = createAdminClient();

    // 1. Products Count
    try {
      const { count, error } = await admin
        .from("products")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.products = count;
    } catch {}

    // 2. Categories Count
    try {
      const { count, error } = await admin
        .from("categories")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.categories = count;
    } catch {}

    // 3. Orders Count
    try {
      const { count, error } = await admin
        .from("orders")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.orders = count;
    } catch {}

    // 4. Active Banners Count
    try {
      const { count, error } = await admin
        .from("banners")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (!error && count !== null) counts.activeBanners = count;
    } catch {}

    // 5. Users / Profiles Count
    try {
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.users = count;
    } catch {}

    // 6. Journal Articles Count
    try {
      const { count, error } = await admin
        .from("articles")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) {
        counts.articles = count;
      } else {
        // Fallback to editorial articles list
        const { EDITORIAL_ARTICLES } = await import("@/lib/data/editorial");
        counts.articles = EDITORIAL_ARTICLES.length;
      }
    } catch {
      try {
        const { EDITORIAL_ARTICLES } = await import("@/lib/data/editorial");
        counts.articles = EDITORIAL_ARTICLES.length;
      } catch {}
    }

    // 7. Reviews Count & Average Rating
    try {
      const { data, error } = await admin
        .from("reviews")
        .select("rating");
      if (!error && data && data.length > 0) {
        counts.reviewsCount = data.length;
        const total = data.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        counts.averageRating = Number((total / data.length).toFixed(1));
      } else {
        // Default clean state if no reviews yet
        counts.reviewsCount = 0;
        counts.averageRating = null;
      }
    } catch {}

    return counts;
  } catch (err) {
    console.error("Error reading admin counts:", err);
    return counts;
  }
}
