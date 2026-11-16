import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { savePersistedSettings } from "@/lib/data/storeContent";

const bodySchema = z.object({
  store_name: z.string().min(2),
  tagline: z.string().min(2),
  support_email: z.string().email().nullable().optional(),
  currency: z.string().min(3).max(3),
  currency_symbol: z.string().min(1).max(3),
  shipping_flat_cents: z.number().int().nonnegative(),
  free_shipping_over_cents: z.number().int().nonnegative().nullable().optional(),
  delivery_notes: z.string(),
  about_html: z.string().nullable().optional(),
  terms_html: z.string().nullable().optional(),
  privacy_html: z.string().nullable().optional(),
  faq_html: z.string().nullable().optional(),
  faq_items: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
      })
    )
    .nullable()
    .optional(),
  logo_url: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());

    // Always persist changes locally so edits are never lost
    savePersistedSettings(body);

    const supabase = createAdminClient();
    let { error } = await supabase
      .from("store_settings")
      .update({
        store_name: body.store_name,
        tagline: body.tagline,
        support_email: body.support_email ?? null,
        currency: body.currency.toUpperCase(),
        currency_symbol: body.currency_symbol,
        shipping_flat_cents: body.shipping_flat_cents,
        free_shipping_over_cents: body.free_shipping_over_cents ?? null,
        delivery_notes: body.delivery_notes,
        about_html: body.about_html ?? null,
        terms_html: body.terms_html ?? null,
        privacy_html: body.privacy_html ?? null,
        faq_html: body.faq_html ?? null,
        faq_items: body.faq_items ?? null,
        logo_url: body.logo_url ?? null,
        favicon_url: body.favicon_url ?? null,
      })
      .eq("id", 1);

    // If columns do not exist yet in Supabase schema (42703), update base columns
    if (error && error.code === "42703") {
      const res = await supabase
        .from("store_settings")
        .update({
          store_name: body.store_name,
          tagline: body.tagline,
          support_email: body.support_email ?? null,
          currency: body.currency.toUpperCase(),
          currency_symbol: body.currency_symbol,
          shipping_flat_cents: body.shipping_flat_cents,
          free_shipping_over_cents: body.free_shipping_over_cents ?? null,
          delivery_notes: body.delivery_notes,
          about_html: body.about_html ?? null,
          terms_html: body.terms_html ?? null,
        })
        .eq("id", 1);
      error = res.error;
    }

    if (error) {
      console.warn("Supabase update warning (local copy preserved):", error.message);
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/about", "page");
      revalidatePath("/story", "page");
      revalidatePath("/faq", "page");
      revalidatePath("/terms", "page");
      revalidatePath("/privacy", "page");
      revalidatePath("/admin/settings", "page");
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save settings";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
