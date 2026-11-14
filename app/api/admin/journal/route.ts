import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { getArticles, saveArticle } from "@/lib/data/editorial";

const bodySchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  category: z.string().default("Design Philosophy"),
  readTime: z.string().default("5 min read"),
  date: z.string().default("November 2026"),
  summary: z.string().min(10),
  image: z.string().url().or(z.string().startsWith("/")),
  author_name: z.string().default("Studio Curator"),
  author_role: z.string().default("Design Architect"),
  content: z.array(z.string()).min(1),
  keyTakeaways: z.array(z.string()).default([]),
  relatedProductSlugs: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    await requireAdminProfile();
    const articles = await getArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load articles";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());

    const saved = await saveArticle({
      title: body.title,
      slug: body.slug,
      category: body.category,
      readTime: body.readTime,
      date: body.date,
      summary: body.summary,
      image: body.image,
      author: {
        name: body.author_name,
        role: body.author_role,
      },
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
    const message = error instanceof Error ? error.message : "Unable to create article";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
