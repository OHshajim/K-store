import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/data/auth";
import { requestOrderCancellation } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  reason: z.string().trim().max(500, "Reason must be under 500 characters").optional(),
  trackingToken: z.string().optional(),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const raw = await request.json().catch(() => ({}));
    const body = bodySchema.parse(raw);
    const user = await getCurrentUser();

    const order = await requestOrderCancellation({
      orderId: id,
      userId: user?.id,
      userEmail: user?.email,
      trackingToken: body.trackingToken,
      reason: body.reason,
    });

    try {
      revalidatePath("/orders", "layout");
      revalidatePath(`/orders/${order.id}`, "page");
      revalidatePath("/account", "page");
      revalidatePath("/track", "layout");
      revalidatePath(`/track/${order.order_number}`, "page");
      revalidatePath("/admin", "layout");
      revalidatePath("/admin/orders", "page");
      revalidatePath(`/admin/orders/${order.id}`, "page");
    } catch {}

    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid request"
        : error instanceof Error
        ? error.message
        : "Unable to submit cancellation request";
    const status = message.includes("access denied") || message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
