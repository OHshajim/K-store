import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

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
  logo_url: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    await requireAdminProfile();
    const body = bodySchema.parse(await request.json());

    const supabase = await createClient();
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
        logo_url: body.logo_url ?? null,
        favicon_url: body.favicon_url ?? null,
      })
      .eq("id", 1);

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
        })
        .eq("id", 1);
      error = res.error;
    }

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save settings";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
