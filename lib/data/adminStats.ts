import { createAdminClient } from "@/lib/supabase/admin";

export type AdminCounts = {
  products: number;
  categories: number;
  orders: number;
  coupons?: number;
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
    coupons: 0,
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
      else {
        const { MOCK_PRODUCTS } = await import("@/lib/data/mockData");
        counts.products = MOCK_PRODUCTS.length;
      }
    } catch {
      const { MOCK_PRODUCTS } = await import("@/lib/data/mockData");
      counts.products = MOCK_PRODUCTS.length;
    }

    // 2. Categories Count
    try {
      const { count, error } = await admin
        .from("categories")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.categories = count;
      else {
        const { MOCK_CATEGORIES } = await import("@/lib/data/mockData");
        counts.categories = MOCK_CATEGORIES.length;
      }
    } catch {
      const { MOCK_CATEGORIES } = await import("@/lib/data/mockData");
      counts.categories = MOCK_CATEGORIES.length;
    }

    // 3. Orders Count
    try {
      const { count, error } = await admin
        .from("orders")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.orders = count;
      else {
        const { getAllOrders } = await import("@/lib/data/orderAdmin");
        counts.orders = (await getAllOrders()).length;
      }
    } catch {
      const { getAllOrders } = await import("@/lib/data/orderAdmin");
      counts.orders = (await getAllOrders()).length;
    }

    // 3b. Active Coupons Count
    try {
      const { count, error } = await admin
        .from("coupons")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (!error && count !== null) counts.coupons = count;
      else {
        const { MOCK_COUPONS } = await import("@/lib/data/mockData");
        counts.coupons = MOCK_COUPONS.filter((c) => c.is_active).length;
      }
    } catch {
      const { MOCK_COUPONS } = await import("@/lib/data/mockData");
      counts.coupons = MOCK_COUPONS.filter((c) => c.is_active).length;
    }

    // 4. Active Banners Count
    try {
      const { count, error } = await admin
        .from("banners")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (!error && count !== null) counts.activeBanners = count;
      else {
        const { MOCK_BANNERS } = await import("@/lib/data/mockData");
        counts.activeBanners = MOCK_BANNERS.filter((b) => b.is_active).length;
      }
    } catch {
      const { MOCK_BANNERS } = await import("@/lib/data/mockData");
      counts.activeBanners = MOCK_BANNERS.filter((b) => b.is_active).length;
    }

    // 5. Users / Profiles Count
    try {
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) counts.users = count;
      else {
        const { getCustomerSummaries } = await import("@/lib/data/orderAdmin");
        counts.users = (await getCustomerSummaries()).length;
      }
    } catch {
      const { getCustomerSummaries } = await import("@/lib/data/orderAdmin");
      counts.users = (await getCustomerSummaries()).length;
    }

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
      if (!error && Array.isArray(data)) {
        counts.reviewsCount = data.length;
        if (data.length > 0) {
          const total = data.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
          counts.averageRating = Number((total / data.length).toFixed(1));
        }
      } else {
        const { getAllReviews } = await import("@/lib/data/reviews");
        const revs = await getAllReviews();
        counts.reviewsCount = revs.length;
        if (revs.length > 0) {
          const total = revs.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
          counts.averageRating = Number((total / revs.length).toFixed(1));
        }
      }
    } catch {
      const { getAllReviews } = await import("@/lib/data/reviews");
      const revs = await getAllReviews();
      counts.reviewsCount = revs.length;
      if (revs.length > 0) {
        const total = revs.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        counts.averageRating = Number((total / revs.length).toFixed(1));
      }
    }

    return counts;
  } catch (err) {
    console.error("Error reading admin counts:", err);
    return counts;
  }
}
