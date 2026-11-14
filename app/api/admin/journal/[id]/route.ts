import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { saveArticle, deleteArticle } from "@/lib/data/editorial";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  category: z.string().optional(),
  readTime: z.string().optional(),
  date: z.string().optional(),
  summary: z.string().optional(),
  image: z.string().optional(),
  author_name: z.string().optional(),
  author_role: z.string().optional(),
  content: z.array(z.string()).optional(),
  keyTakeaways: z.array(z.string()).optional(),
  relatedProductSlugs: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());

    const saved = await saveArticle({
      id,
      title: body.title || "Untitled Essay",
      slug: body.slug,
      category: body.category,
      readTime: body.readTime,
      date: body.date,
      summary: body.summary,
      image: body.image,
      ...(body.author_name ? { author: { name: body.author_name, role: body.author_role || "Curator" } } : {}),
      content: body.content,
      keyTakeaways: body.keyTakeaways,
      relatedProductSlugs: body.relatedProductSlugs,
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/journal", "page");
      revalidatePath(`/journal/${saved.slug}`, "page");
      revalidatePath("/admin/journal", "page");
    } catch {}

    return NextResponse.json({ article: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update article";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    await deleteArticle(id);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/journal", "page");
      revalidatePath("/admin/journal", "page");
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete article";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
