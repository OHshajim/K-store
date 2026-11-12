import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_STORE_SETTINGS } from "../lib/data/mockData.ts";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const catMap = {
  "cat-living": "c0000000-0000-4000-8000-000000000001",
  "cat-workspace": "c0000000-0000-4000-8000-000000000002",
  "cat-kitchen": "c0000000-0000-4000-8000-000000000003",
  "cat-bedroom": "c0000000-0000-4000-8000-000000000004",
  "cat-bathroom": "c0000000-0000-4000-8000-000000000005",
  "cat-lighting": "c0000000-0000-4000-8000-000000000006",
};

async function seedDirect() {
  console.log("=== SEEDING CATEGORIES ===");
  for (const c of MOCK_CATEGORIES) {
    const uuid = catMap[c.id];
    const catData = {
      id: uuid,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sort_order: c.sort_order,
    };
    const { data, error } = await supabase.from("categories").upsert(catData, { onConflict: "slug" }).select();
    if (error) {
      console.error(`Failed category ${c.slug}:`, error.message);
    } else {
      console.log(`✅ Category seeded: ${c.name} (${c.slug})`);
    }
  }

  console.log("\n=== SEEDING PRODUCTS ===");
  for (let idx = 0; idx < MOCK_PRODUCTS.length; idx++) {
    const p = MOCK_PRODUCTS[idx];
    const uuid = `a0000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;
    const catUuid = catMap[p.category_id] || null;

    const prodData = {
      id: uuid,
      category_id: catUuid,
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
    };

    const { data, error } = await supabase.from("products").upsert(prodData, { onConflict: "slug" }).select();
    if (error) {
      console.error(`Failed product ${p.slug}:`, error.message);
    } else {
      console.log(`✅ Product seeded [${idx + 1}/30]: ${p.name}`);
    }
  }

  console.log("\n=== UPDATING STORE SETTINGS ===");
  const { data: settingData, error: settingError } = await supabase.from("store_settings").upsert({
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
  }, { onConflict: "id" }).select();

  if (settingError) {
    console.error("Failed to update store settings:", settingError.message);
  } else {
    console.log("✅ Store settings updated:", settingData);
  }

  console.log("\nDirect live seeding complete!");
}

seedDirect();

