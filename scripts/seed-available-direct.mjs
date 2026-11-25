import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_STORE_SETTINGS,
  MOCK_BANNERS,
  MOCK_COUPONS,
  MOCK_REVIEWS,
} from "../lib/data/mockData.ts";

if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seedDirect() {
  console.log("=== 1. UPSERTING CATEGORIES ===");
  for (const c of MOCK_CATEGORIES) {
    const catData = {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sort_order: c.sort_order,
      image_url: c.image_url || null,
    };
    const { error } = await supabase
      .from("categories")
      .upsert(catData, { onConflict: "id" });
    if (error) {
      console.error(`Failed category ${c.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`  + Category: ${c.name} (${c.slug})`);
  }

  console.log("\n=== 2. REMOVING ALL OLD PRODUCTS ===");
  const { data: existingProducts, error: listErr } = await supabase
    .from("products")
    .select("id, slug, name");
  if (listErr) {
    console.error("Failed to list existing products:", listErr.message);
    process.exit(1);
  }

  const keepIds = new Set(MOCK_PRODUCTS.map((p) => p.id));
  const keepSlugs = new Set(MOCK_PRODUCTS.map((p) => p.slug));
  const toDeleteIds = (existingProducts ?? [])
    .filter((p) => !keepIds.has(p.id) || (keepSlugs.has(p.slug) && !keepIds.has(p.id)))
    .map((p) => p.id);

  // Clear review FK references on stale products before deletion
  if (toDeleteIds.length > 0) {
    await supabase.from("reviews").delete().in("product_id", toDeleteIds);
    // Preserve historical order_items text while removing stale FK reference if nullable
    await supabase
      .from("order_items")
      .update({ product_id: null })
      .in("product_id", toDeleteIds);

    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .in("id", toDeleteIds);
    if (delErr) {
      console.error("Failed removing stale products:", delErr.message);
      process.exit(1);
    }
    console.log(`  - Removed ${toDeleteIds.length} stale product(s).`);
  } else {
    console.log("  - No stale product IDs found.");
  }

  // Also ensure no duplicate slug conflicts remain on target IDs
  for (const p of MOCK_PRODUCTS) {
    await supabase
      .from("products")
      .delete()
      .eq("slug", p.slug)
      .neq("id", p.id);
  }

  console.log("\n=== 3. SEEDING 12 REAL PRODUCTS WITH REAL IMAGES ===");
  for (let idx = 0; idx < MOCK_PRODUCTS.length; idx++) {
    const p = MOCK_PRODUCTS[idx];
    const prodData = {
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      details: p.details || null,
      price_cents: p.price_cents,
      compare_at_cents: p.compare_at_cents || null,
      stock: p.stock,
      images: p.images,
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller ?? false,
      sku: p.sku || null,
      material: p.material || null,
      room: p.room || null,
      dimensions: p.dimensions || null,
      weight_kg: p.weight_kg ?? null,
      color_variants: p.color_variants ?? [],
      material_variants: p.material_variants ?? [],
      specifications: p.specifications ?? {},
      care_instructions: p.care_instructions || null,
      rating: p.rating ?? 5.0,
      review_count: p.review_count ?? 0,
    };

    const { error } = await supabase
      .from("products")
      .upsert(prodData, { onConflict: "id" });

    if (error) {
      console.error(`Failed product ${p.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`  + [${idx + 1}/${MOCK_PRODUCTS.length}] ${p.sku} · ${p.name} -> ${p.images.join(", ")}`);
  }

  console.log("\n=== 4. SYNCING BANNERS ===");
  await supabase.from("banners").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  for (const b of MOCK_BANNERS) {
    const { error: bErr } = await supabase.from("banners").insert({
      placement: b.placement,
      title: b.title,
      subtitle: b.subtitle,
      image_url: b.image_url,
      cta_label: b.cta_label,
      cta_href: b.cta_href,
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    if (bErr) {
      console.error(`Banner insert warning (${b.title}):`, bErr.message);
    }
  }
  console.log(`  + Synced ${MOCK_BANNERS.length} banners (all /shop links valid).`);

  console.log("\n=== 5. SYNCING COUPONS ===");
  for (const c of MOCK_COUPONS) {
    const discountPercent =
      "discount_percent" in c
        ? c.discount_percent
        : c.discount_value;
    const minSpendCents =
      "min_spend_cents" in c
        ? c.min_spend_cents
        : c.min_order_cents ?? 0;
    const { error: cErr } = await supabase.from("coupons").upsert(
      {
        code: c.code,
        discount_percent: discountPercent,
        min_spend_cents: minSpendCents,
        is_active: c.is_active,
        expires_at: c.expires_at,
      },
      { onConflict: "code" },
    );
    if (cErr) {
      console.error(`Coupon warning (${c.code}):`, cErr.message);
    }
  }
  console.log(`  + Synced ${MOCK_COUPONS.length} promo codes.`);

  console.log("\n=== 6. SYNCING STORE SETTINGS ===");
  const { error: settingError } = await supabase
    .from("store_settings")
    .upsert(
      {
        id: 1,
        store_name: MOCK_STORE_SETTINGS.store_name,
        tagline: MOCK_STORE_SETTINGS.tagline,
        support_email: MOCK_STORE_SETTINGS.support_email,
        currency: MOCK_STORE_SETTINGS.currency,
        currency_symbol: MOCK_STORE_SETTINGS.currency_symbol,
        shipping_flat_cents: MOCK_STORE_SETTINGS.shipping_flat_cents,
        free_shipping_over_cents: MOCK_STORE_SETTINGS.free_shipping_over_cents,
        delivery_notes: MOCK_STORE_SETTINGS.delivery_notes,
        about_html: MOCK_STORE_SETTINGS.about_html,
        terms_html: MOCK_STORE_SETTINGS.terms_html,
      },
      { onConflict: "id" },
    );
  if (settingError) {
    console.error("Failed to update store settings:", settingError.message);
  } else {
    console.log("  + Store settings synchronized.");
  }

  console.log("\n=== 7. SYNCING PRODUCT REVIEWS ===");
  const staleReviewIds = [
    "e0000000-0000-4000-8000-000000000001",
    "e0000000-0000-4000-8000-000000000002",
    "e0000000-0000-4000-8000-000000000003",
    "e0000000-0000-4000-8000-000000000004",
  ];
  await supabase.from("reviews").delete().in("id", staleReviewIds);

  const { data: existingReviews } = await supabase.from("reviews").select("id, product_id, comment");
  const existingComments = new Set((existingReviews ?? []).map((r) => `${r.product_id}:${r.comment}`));
  for (const r of MOCK_REVIEWS) {
    if (!existingComments.has(`${r.product_id}:${r.comment}`)) {
      const { error: rErr } = await supabase.from("reviews").insert({
        product_id: r.product_id,
        rating: r.rating,
        comment: r.comment,
        is_published: r.is_published,
      });
      if (rErr) {
        console.warn(`Review seed notice:`, rErr.message);
      }
    }
  }

  console.log("\n=== 8. LIVE VERIFICATION ===");
  const { data: verifyProducts, count: prodCount } = await supabase
    .from("products")
    .select("id, sku, name, price_cents, images", { count: "exact" })
    .order("sku", { ascending: true });

  console.log(`Live Supabase products count: ${prodCount}`);
  for (const vp of verifyProducts ?? []) {
    console.log(`  - ${vp.sku} | ${vp.name} | $${(vp.price_cents / 100).toFixed(2)} | ${vp.images?.[0]}`);
  }
}

seedDirect();
