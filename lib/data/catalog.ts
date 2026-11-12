import { PRODUCTS_REVALIDATE_SECONDS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Banner, Category, Product, StoreSettings, NordenFitQuery, FitRecommendation } from "@/lib/types";
import {
  MOCK_BANNERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_STORE_SETTINGS,
} from "./mockData";

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      return data as StoreSettings;
    }
  } catch {
    // Fall back to robust defaults
  }
  return MOCK_STORE_SETTINGS;
}

export async function requireStoreSettings(): Promise<StoreSettings> {
  return await getStoreSettings();
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch {
    // Fall back to mock categories
  }
  return MOCK_CATEGORIES;
}

export async function getBanners(
  placement: Banner["placement"],
): Promise<Banner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Banner[];
    }
  } catch {
    // Fall back to mock banners
  }
  return MOCK_BANNERS.filter((b) => b.placement === placement && b.is_active);
}

export async function getProducts(options?: {
  categorySlug?: string;
  room?: string;
  featured?: boolean;
  bestsellers?: boolean;
  deals?: boolean;
  query?: string;
  sort?: "featured" | "bestseller" | "newest" | "price_asc" | "price_desc";
  minPriceCents?: number;
  maxPriceCents?: number;
  material?: string;
  color?: string;
  inStockOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true);

    if (options?.featured) query = query.eq("is_featured", true);
    if (options?.query) {
      query = query.or(
        `name.ilike.%${options.query}%,description.ilike.%${options.query}%`,
      );
    }
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      products = data as Product[];
    }
  } catch {
    // Supabase query failed or not active
  }

  // If database was empty or unreachable, use high-fidelity demonstration catalog
  if (products.length === 0) {
    products = MOCK_PRODUCTS.map((prod) => {
      const cat = MOCK_CATEGORIES.find((c) => c.id === prod.category_id);
      return { ...prod, category: cat ?? null };
    });
  }

  // Apply in-memory filtering for complete fidelity
  let filtered = [...products];

  if (options?.categorySlug) {
    filtered = filtered.filter(
      (p) => p.category?.slug === options.categorySlug || p.category_id === options.categorySlug
    );
  }

  if (options?.room) {
    filtered = filtered.filter(
      (p) => p.room?.toLowerCase() === options.room?.toLowerCase()
    );
  }

  if (options?.featured) {
    filtered = filtered.filter((p) => p.is_featured);
  }

  if (options?.bestsellers) {
    filtered = filtered.filter((p) => p.is_bestseller);
  }

  if (options?.deals) {
    filtered = filtered.filter(
      (p) => (p.compare_at_cents ?? 0) > p.price_cents
    );
  }

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }

  if (options?.minPriceCents !== undefined) {
    filtered = filtered.filter((p) => p.price_cents >= options.minPriceCents!);
  }

  if (options?.maxPriceCents !== undefined) {
    filtered = filtered.filter((p) => p.price_cents <= options.maxPriceCents!);
  }

  if (options?.material) {
    const mat = options.material.toLowerCase();
    filtered = filtered.filter((p) => p.material?.toLowerCase().includes(mat));
  }

  if (options?.color) {
    const col = options.color.toLowerCase();
    filtered = filtered.filter((p) =>
      p.color_variants?.some((v) => v.name.toLowerCase().includes(col))
    );
  }

  if (options?.inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // Apply sorting
  if (options?.sort) {
    switch (options.sort) {
      case "price_asc":
        filtered.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "bestseller":
        filtered.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
  }

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getProductById(id: string): Promise<Product | null> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    );
  try {
    const supabase = await createClient();
    const query = supabase
      .from("products")
      .select("*, category:categories(*)");

    const { data, error } = isUuid
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("slug", id).maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch {
    // Fall back
  }

  const found = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  if (!found) return null;
  const cat = MOCK_CATEGORIES.find((c) => c.id === found.category_id);
  return { ...found, category: cat ?? null };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch {
    // Fall back
  }

  const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!found) return null;
  const cat = MOCK_CATEGORIES.find((c) => c.id === found.category_id);
  return { ...found, category: cat ?? null };
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true)
      .limit(200);

    if (!error && data && data.length > 0) {
      return data.map((row) => row.slug as string);
    }
  } catch {
    // Fall back
  }

  return MOCK_PRODUCTS.map((p) => p.slug);
}

// Special Feature: NORDEN Fit Assistant deterministic space matcher
export async function getFitRecommendations(query: NordenFitQuery): Promise<FitRecommendation[]> {
  const allProducts = await getProducts();
  const recommendations: FitRecommendation[] = [];

  for (const product of allProducts) {
    const reasons: string[] = [];
    let matchScore = 0;

    // 1. Room Fit (30 points)
    const roomMatch = !query.roomType || query.roomType === "any" || product.room === query.roomType;
    if (roomMatch) {
      matchScore += 30;
      reasons.push(`Tailored specifically for ${query.roomType} atmospheres.`);
    }

    // 2. Dimensional Clearance (30 points)
    let dimensionsFit = true;
    if (product.dimensions) {
      const widthFits = query.availableWidthCm <= 0 || product.dimensions.width_cm <= query.availableWidthCm;
      const heightFits = query.availableHeightCm <= 0 || product.dimensions.height_cm <= query.availableHeightCm;

      if (widthFits && heightFits) {
        matchScore += 30;
        reasons.push(`Fits comfortably within your space (${product.dimensions.width_cm}cm width vs ${query.availableWidthCm}cm available).`);
      } else {
        dimensionsFit = false;
        reasons.push(`Exceeds specified boundary dimensions.`);
      }
    } else {
      matchScore += 20;
    }

    // 3. Material Match (20 points)
    let materialMatch = false;
    if (!query.preferredMaterial || query.preferredMaterial === "any") {
      materialMatch = true;
      matchScore += 20;
    } else if (product.material?.toLowerCase().includes(query.preferredMaterial.toLowerCase())) {
      materialMatch = true;
      matchScore += 20;
      reasons.push(`Features your preferred ${query.preferredMaterial} finish.`);
    }

    // 4. Color Match (10 points)
    let colorMatch = false;
    if (!query.preferredColor || query.preferredColor === "any") {
      colorMatch = true;
      matchScore += 10;
    } else if (product.color_variants?.some(v => v.name.toLowerCase().includes(query.preferredColor.toLowerCase()))) {
      colorMatch = true;
      matchScore += 10;
      reasons.push(`Available in your selected ${query.preferredColor} color palette.`);
    }

    // 5. Budget Match (10 points)
    let budgetMatch = true;
    if (query.budgetUsd > 0) {
      const priceUsd = product.price_cents / 100;
      if (priceUsd <= query.budgetUsd) {
        matchScore += 10;
        reasons.push(`Priced at $${priceUsd.toFixed(0)}, within your $${query.budgetUsd} budget.`);
      } else {
        budgetMatch = false;
      }
    } else {
      matchScore += 10;
    }

    if (matchScore >= 40) {
      recommendations.push({
        product,
        matchScore,
        fitReasons: reasons,
        dimensionsFit,
        materialMatch,
        colorMatch,
        budgetMatch,
      });
    }
  }

  // Sort by highest match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, 8);
}

export const catalogRevalidate = PRODUCTS_REVALIDATE_SECONDS;
