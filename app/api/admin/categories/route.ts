import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});

export async function GET() {
  try {
    await requireAdminProfile();
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load categories";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());
    const slug = body.slug?.trim() || slugify(body.name);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        slug,
        description: body.description ?? null,
        sort_order: body.sort_order ?? 0,
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Insert failed");
    return NextResponse.json({ category: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create category";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
