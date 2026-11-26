import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { slugify } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

const colorVariantSchema = z.object({
  name: z.string().trim().min(1),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Invalid color hex code").default("#D8C9B5"),
  in_stock: z.boolean().default(true),
});

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
      const supabase = createAdminClient();
      let res = await supabase
        .from("products")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();

      if (res.error && res.error.code === "42703") {
        // Strip extended columns that might not exist yet
        const basePatch = { ...patch };
        delete (basePatch as Record<string, unknown>).material;
        delete (basePatch as Record<string, unknown>).room;
        delete (basePatch as Record<string, unknown>).sku;
        delete (basePatch as Record<string, unknown>).dimensions;
        delete (basePatch as Record<string, unknown>).weight_kg;
        delete (basePatch as Record<string, unknown>).color_variants;
        delete (basePatch as Record<string, unknown>).material_variants;
        delete (basePatch as Record<string, unknown>).specifications;
        delete (basePatch as Record<string, unknown>).care_instructions;
        delete (basePatch as Record<string, unknown>).is_bestseller;
        res = await supabase
          .from("products")
          .update(basePatch)
          .eq("id", id)
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
          revalidatePath(`/admin/products/${res.data.id}`, "page");
          if (res.data.slug) revalidatePath(`/product/${res.data.slug}`, "page");
        } catch {}
        return NextResponse.json({ product: res.data, id: res.data.id });
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

export async function DELETE(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const hardDelete = new URL(request.url).searchParams.get("hard") === "true";

    let deletedInDb = false;
    try {
      const supabase = createAdminClient();
      const res = hardDelete
        ? await supabase.from("products").delete().eq("id", id)
        : await supabase.from("products").update({ is_active: false }).eq("id", id);
      if (!res.error) {
        deletedInDb = true;
      }
    } catch {
      // Supabase offline; fall through to in-memory catalog update
    }

    if (!deletedInDb) {
      const { MOCK_PRODUCTS } = await import("@/lib/data/mockData");
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (hardDelete) {
        MOCK_PRODUCTS.splice(idx, 1);
      } else {
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], is_active: false };
      }
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/shop", "layout");
      revalidatePath("/admin/products", "page");
    } catch {}

    return NextResponse.json({ ok: true, hardDeleted: hardDelete });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete product";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
