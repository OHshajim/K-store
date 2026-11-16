import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminCoupons } from "@/lib/data/coupons";

const couponCreateSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(30, "Code cannot exceed 30 characters")
    .transform((val) => val.trim().toUpperCase()),
  discount_percent: z
    .number()
    .int("Discount percent must be an integer")
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%"),
  min_spend_cents: z
    .number()
    .int()
    .min(0, "Minimum spend cannot be negative")
    .default(0),
  is_active: z.boolean().default(true),
  expires_at: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdminProfile();
    const coupons = await getAdminCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve coupons";
    const status = message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const raw = await request.json();
    const body = couponCreateSchema.parse(raw);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: body.code,
        discount_percent: body.discount_percent,
        min_spend_cents: body.min_spend_cents,
        is_active: body.is_active,
        expires_at: body.expires_at || null,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Coupon code '${body.code}' already exists.` },
          { status: 409 }
        );
      }
      throw new Error(error.message);
    }

    try {
      revalidatePath("/admin/coupons", "page");
      revalidatePath("/cart", "page");
      revalidatePath("/checkout", "page");
    } catch {}

    return NextResponse.json({ coupon: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid coupon payload" },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Unable to create coupon";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
