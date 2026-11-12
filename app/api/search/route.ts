import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ products: [] });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price_cents, images, stock, category:categories(name, slug)")
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(8);

    if (error) {
      throw error;
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search query failed";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
