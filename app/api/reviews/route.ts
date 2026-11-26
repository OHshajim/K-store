import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { createReview, ReviewEligibilityError } from "@/lib/data/reviews";

const bodySchema = z.object({
  productId: z.string(),
  orderId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Sign in to review your verified purchases" },
        { status: 401 },
      );
    }

    const body = bodySchema.parse(await request.json());
    const review = await createReview({
      userId: profile.id,
      userEmail: profile.email,
      reviewerName: profile.full_name,
      productId: body.productId,
      orderId: body.orderId,
      rating: body.rating,
      comment: body.comment,
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/shop", "page");
      revalidatePath("/account", "page");
      revalidatePath("/admin/reviews", "page");
      revalidatePath("/product", "layout");
    } catch {}

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    if (error instanceof ReviewEligibilityError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    const message =
      error instanceof Error
        ? error.message
        : "Only customers with a paid or delivered order containing this item can submit a review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
