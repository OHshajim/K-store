import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { code, subtotalCents = 0 } = await request.json();
    const cleanCode = String(code || "").trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { success: false, message: "Please provide a coupon code." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", cleanCode)
      .eq("is_active", true)
      .maybeSingle();

    // Fallback if table is not yet created in Supabase
    let matchedCoupon = coupon;
    if (error && error.code === "PGRST205") {
      const fallbackList = [
        { code: "NORDEN10", discount_percent: 10, min_spend_cents: 10000, is_active: true },
        { code: "WELCOME20", discount_percent: 20, min_spend_cents: 25000, is_active: true },
        { code: "SIMPLIFIED", discount_percent: 15, min_spend_cents: 0, is_active: true },
      ];
      matchedCoupon = fallbackList.find((c) => c.code === cleanCode) ?? null;
    }

    if (!matchedCoupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired promotional code." },
        { status: 404 }
      );
    }

    if (matchedCoupon.expires_at && new Date(matchedCoupon.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: "This promotional code has expired." },
        { status: 400 }
      );
    }

    if (subtotalCents < matchedCoupon.min_spend_cents) {
      const minSpendDollars = (matchedCoupon.min_spend_cents / 100).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order spend of $${minSpendDollars} required for this promotion.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${matchedCoupon.discount_percent}% promotional privilege applied!`,
      coupon: {
        code: matchedCoupon.code,
        discount_percent: matchedCoupon.discount_percent,
        min_spend_cents: matchedCoupon.min_spend_cents,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Coupon validation error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
