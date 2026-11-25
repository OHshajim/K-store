import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ products: [] });
    }

    const products = await getProducts({ query: q, limit: 8 });
    return NextResponse.json({ products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search query failed";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
