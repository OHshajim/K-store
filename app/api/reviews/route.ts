import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { createReview } from "@/lib/data/reviews";

const bodySchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Sign in to review your orders" },
        { status: 401 },
      );
    }

    const body = bodySchema.parse(await request.json());
    await createReview({
      userId: profile.id,
      productId: body.productId,
      orderId: body.orderId,
      rating: body.rating,
      comment: body.comment,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Only orders you paid for can be reviewed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
