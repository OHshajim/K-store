import { PRODUCTS_REVALIDATE_SECONDS } from "@/lib/constants";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_SETTINGS,
} from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product, StoreSettings } from "@/lib/types";

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isDemoMode()) return DEMO_SETTINGS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEMO_SETTINGS;
  return data as StoreSettings;
}

export async function getCategories(): Promise<Category[]> {
  if (isDemoMode()) return DEMO_CATEGORIES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return DEMO_CATEGORIES;
  return data as Category[];
}

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  query?: string;
}): Promise<Product[]> {
  if (isDemoMode()) {
    let products = DEMO_PRODUCTS.filter((product) => product.is_active);
    if (options?.featured) {
      products = products.filter((product) => product.is_featured);
    }
    if (options?.categorySlug) {
      products = products.filter(
        (product) => product.category?.slug === options.categorySlug,
      );
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q),
      );
    }
    return products;
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  if (options?.query) {
    query = query.or(
      `name.ilike.%${options.query}%,description.ilike.%${options.query}%`,
    );
  }

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle();
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoMode()) {
    return DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as Product;
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (isDemoMode()) return DEMO_PRODUCTS.map((product) => product.slug);

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true)
    .limit(100);

  return (data ?? []).map((row) => row.slug as string);
}

export const catalogRevalidate = PRODUCTS_REVALIDATE_SECONDS;
