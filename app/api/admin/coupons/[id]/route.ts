import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

const couponUpdateSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(30)
    .transform((val) => val.trim().toUpperCase())
    .optional(),
  discount_percent: z.number().int().min(1).max(100).optional(),
  min_spend_cents: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  expires_at: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const raw = await request.json();
    const body = couponUpdateSchema.parse(raw);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    try {
      revalidatePath("/admin/coupons", "page");
      revalidatePath("/cart", "page");
      revalidatePath("/checkout", "page");
    } catch {}

    return NextResponse.json({ ok: true, coupon: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid update payload" },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Unable to update coupon";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;

    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw new Error(error.message);

    try {
      revalidatePath("/admin/coupons", "page");
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete coupon";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
