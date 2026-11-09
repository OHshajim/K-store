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
  category_id: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    const patch = {
      ...body,
      slug: body.slug?.trim() || (body.name ? slugify(body.name) : undefined),
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Update failed");
    return NextResponse.json({ product: data, id: data.id });
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
