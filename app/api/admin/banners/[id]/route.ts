import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  placement: z.enum(["hero", "promo"]).optional(),
  title: z.string().min(2).optional(),
  subtitle: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  cta_href: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());

    const supabase = await createClient();
    const { error } = await supabase
      .from("banners")
      .update(body)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update banner";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;

    const supabase = await createClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete banner";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
