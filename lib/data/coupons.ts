import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/lib/types";

export const FALLBACK_COUPONS: Coupon[] = [
  {
    id: "d0000000-0000-4000-8000-000000000001",
    code: "NORDEN10",
    discount_percent: 10,
    min_spend_cents: 10000,
    is_active: true,
    expires_at: null,
  },
  {
    id: "d0000000-0000-4000-8000-000000000002",
    code: "WELCOME20",
    discount_percent: 20,
    min_spend_cents: 25000,
    is_active: true,
    expires_at: null,
  },
  {
    id: "d0000000-0000-4000-8000-000000000003",
    code: "SIMPLIFIED",
    discount_percent: 15,
    min_spend_cents: 0,
    is_active: true,
    expires_at: null,
  },
  {
    id: "d0000000-0000-4000-8000-000000000004",
    code: "KSTORE10",
    discount_percent: 10,
    min_spend_cents: 8000,
    is_active: true,
    expires_at: null,
  },
];

export async function getAdminCoupons(): Promise<Coupon[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Unable to fetch coupons from database, using fallbacks:", error.message);
      return FALLBACK_COUPONS;
    }

    if (!data || data.length === 0) {
      return FALLBACK_COUPONS;
    }

    return data as Coupon[];
  } catch (err) {
    console.warn("Coupons query exception, using fallbacks:", err);
    return FALLBACK_COUPONS;
  }
}

export async function validateCouponCode(
  code: string,
  subtotalCents: number
): Promise<{
  valid: boolean;
  message: string;
  coupon?: Coupon;
  discountCents?: number;
}> {
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: "Please provide a coupon code." };
  }

  const coupons = await getAdminCoupons();
  const matched = coupons.find(
    (c) => c.code.toUpperCase() === cleanCode && c.is_active
  );

  if (!matched) {
    return { valid: false, message: "Invalid or expired promotional code." };
  }

  if (matched.expires_at && new Date(matched.expires_at).getTime() < Date.now()) {
    return { valid: false, message: "This promotional code has expired." };
  }

  if (subtotalCents < matched.min_spend_cents) {
    const minDollars = (matched.min_spend_cents / 100).toFixed(2);
    return {
      valid: false,
      message: `Minimum order spend of $${minDollars} required for this promotion.`,
    };
  }

  const discountCents = Math.round((subtotalCents * matched.discount_percent) / 100);

  return {
    valid: true,
    message: `${matched.discount_percent}% promotional privilege applied!`,
    coupon: matched,
    discountCents,
  };
}
