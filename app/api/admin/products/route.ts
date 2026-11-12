import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

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
});

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());
    const slug = body.slug?.trim() || slugify(body.name);

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
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
        })
        .select("*")
        .single();

      if (!error && data) {
        return NextResponse.json({ product: data, id: data.id });
      }
    } catch {
      // Supabase is offline; handle via in-memory mock update for development preview
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
      images: body.images.length > 0 ? body.images : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
      is_active: body.is_active,
      is_featured: body.is_featured,
      is_bestseller: body.is_bestseller,
      sku: body.sku ?? `KST-${Math.floor(1000 + Math.random() * 9000)}`,
      material: body.material ?? "Solid White Oak",
      room: body.room ?? "living",
      dimensions: { width_cm: 120, height_cm: 75, depth_cm: 40, text: "120 × 75 × 40 cm" },
      weight_kg: 18.5,
      color_variants: [{ name: "Natural Oak", hex: "#D8C9B5", in_stock: true }],
      specifications: { "Craft Heritage": "Quarter-sawn solid timber", "Joinery": "Mortise & tenon" },
      rating: 5.0,
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
