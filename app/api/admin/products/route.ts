import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { slugify } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";

const colorVariantSchema = z.object({
  name: z.string().trim().min(1),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Invalid color hex code").default("#D8C9B5"),
  in_stock: z.boolean().default(true),
});

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().default(""),
  details: z.string().nullable().optional(),
  price_cents: z.number().int().nonnegative(),
  compare_at_cents: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  category_id: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  room: z.enum(["living", "workspace", "kitchen", "bedroom", "bathroom", "lighting"]).nullable().optional(),
  sku: z.string().nullable().optional(),
  dimensions: z
    .object({
      width_cm: z.number().nonnegative(),
      depth_cm: z.number().nonnegative(),
      height_cm: z.number().nonnegative(),
      text: z.string(),
    })
    .nullable()
    .optional(),
  weight_kg: z.number().nonnegative().nullable().optional(),
  color_variants: z.array(colorVariantSchema).optional(),
  material_variants: z.array(z.string().trim().min(1)).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  care_instructions: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());
    const slug = body.slug?.trim() || slugify(body.name);

    try {
      const supabase = createAdminClient();
      let res = await supabase
        .from("products")
        .insert({
          name: body.name,
          slug,
          description: body.description,
          details: body.details ?? null,
          price_cents: body.price_cents,
          compare_at_cents: body.compare_at_cents ?? null,
          stock: body.stock,
          images: body.images,
          is_active: body.is_active,
          is_featured: body.is_featured,
          is_bestseller: body.is_bestseller,
          category_id: body.category_id ?? null,
          material: body.material ?? null,
          room: body.room ?? null,
          sku: body.sku ?? null,
          dimensions: body.dimensions ?? null,
          weight_kg: body.weight_kg ?? null,
          color_variants: body.color_variants ?? [],
          material_variants: body.material_variants ?? [],
          specifications: body.specifications ?? {},
          care_instructions: body.care_instructions ?? null,
          rating: null,
          review_count: 0,
        })
        .select("*")
        .single();

      if (res.error && res.error.code === "42703") {
        // Fall back to base columns if extended columns migration hasn't run yet
        res = await supabase
          .from("products")
          .insert({
            name: body.name,
            slug,
            description: body.description,
            details: body.details ?? null,
            price_cents: body.price_cents,
            compare_at_cents: body.compare_at_cents ?? null,
            stock: body.stock,
            images: body.images,
            is_active: body.is_active,
            is_featured: body.is_featured,
            category_id: body.category_id ?? null,
          })
          .select("*")
          .single();
      }

      if (res.error) {
        return NextResponse.json({ error: res.error.message }, { status: 400 });
      }

      if (res.data) {
        try {
          revalidatePath("/", "layout");
          revalidatePath("/shop", "layout");
          revalidatePath("/fit-assistant", "page");
          revalidatePath("/admin/products", "page");
          if (res.data.slug) revalidatePath(`/product/${res.data.slug}`, "page");
        } catch {}
        return NextResponse.json({ product: res.data, id: res.data.id });
      }
    } catch {
      // Supabase is offline or unconfigured; handle via in-memory mock update for development preview
    }

    const { MOCK_PRODUCTS } = await import("@/lib/data/mockData");
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      category_id: body.category_id ?? null,
      name: body.name,
      slug,
      description: body.description,
      details: body.details ?? null,
      price_cents: body.price_cents,
      compare_at_cents: body.compare_at_cents ?? null,
      stock: body.stock,
      images: body.images,
      is_active: body.is_active,
      is_featured: body.is_featured,
      is_bestseller: body.is_bestseller,
      sku: body.sku ?? `KST-${Math.floor(1000 + Math.random() * 9000)}`,
      material: body.material ?? "Solid White Oak",
      room: body.room ?? "living",
      dimensions: body.dimensions ?? undefined,
      weight_kg: body.weight_kg ?? undefined,
      color_variants: body.color_variants ?? [],
      material_variants: body.material_variants ?? [],
      specifications: body.specifications ?? {},
      care_instructions: body.care_instructions ?? undefined,
      rating: undefined,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_PRODUCTS.unshift(newProduct);

    return NextResponse.json({ product: newProduct, id: newProduct.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create product";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
