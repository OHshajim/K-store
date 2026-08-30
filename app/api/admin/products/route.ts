import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { isDemoMode } from "@/lib/env";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { DEMO_PRODUCTS } from "@/lib/data/demo";
import { randomUUID } from "crypto";

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
  category_id: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());
    const slug = body.slug?.trim() || slugify(body.name);

    if (isDemoMode()) {
      const product = {
        id: randomUUID(),
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
        created_at: new Date().toISOString(),
      };
      DEMO_PRODUCTS.unshift(product);
      return NextResponse.json({ product, id: product.id });
    }

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
        category_id: body.category_id ?? null,
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Insert failed");
    return NextResponse.json({ product: data, id: data.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create product";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
