import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  details: z.string().nullable().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  compare_at_cents: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_bestseller: z.boolean().optional(),
  category_id: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    const patch = {
      ...body,
      ...(body.slug?.trim()
        ? { slug: body.slug.trim() }
        : body.name
          ? { slug: slugify(body.name) }
          : {}),
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();

      if (!error && data) {
        return NextResponse.json({ product: data, id: data.id });
      }
    } catch {
      // Supabase is offline; handle via in-memory mock update for development preview
    }

    const { MOCK_PRODUCTS } = await import("@/lib/data/mockData");
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
    if (index !== -1) {
      MOCK_PRODUCTS[index] = {
        ...MOCK_PRODUCTS[index],
        ...patch,
        updated_at: new Date().toISOString(),
      } as (typeof MOCK_PRODUCTS)[number];
      return NextResponse.json({ product: MOCK_PRODUCTS[index], id: MOCK_PRODUCTS[index].id });
    }

    return NextResponse.json({ product: patch, id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update product";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete product";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
