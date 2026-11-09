import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  placement: z.enum(["hero", "promo"]).default("hero"),
  title: z.string().min(2),
  subtitle: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  cta_href: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .insert({
        placement: body.placement,
        title: body.title,
        subtitle: body.subtitle ?? null,
        image_url: body.image_url ?? null,
        cta_label: body.cta_label ?? null,
        cta_href: body.cta_href ?? null,
        sort_order: body.sort_order,
        is_active: body.is_active,
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Insert failed");
    return NextResponse.json({ banner: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create banner";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
