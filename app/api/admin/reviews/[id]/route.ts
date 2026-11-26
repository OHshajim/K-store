import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { setReviewPublished, deleteReview } from "@/lib/data/reviews";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ is_published: z.boolean() });

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    await setReviewPublished(id, body.is_published);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/shop", "page");
      revalidatePath("/product", "layout");
      revalidatePath("/admin/reviews", "page");
    } catch {}
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update review";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    await deleteReview(id);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/shop", "page");
      revalidatePath("/product", "layout");
      revalidatePath("/admin/reviews", "page");
    } catch {}
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete review";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
