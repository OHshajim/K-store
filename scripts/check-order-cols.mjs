import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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

async function checkOrderCols() {
  const testCols = [
    "id", "order_number", "user_id", "tracking_token", "customer_name",
    "customer_email", "customer_phone", "shipping_address", "shipping_city",
    "shipping_country", "shipping_postal_code", "shipping_notes",
    "payment_method", "payment_status", "stripe_session_id", "delivery_status",
    "subtotal_cents", "discount_cents", "coupon_code", "shipping_cents",
    "total_cents", "currency", "admin_notes", "created_at", "updated_at"
  ];

  for (const col of testCols) {
    const res = await supabase.from("orders").select(col).limit(0);
    if (res.error) {
      console.log(`orders column '${col}': NOT PRESENT (${res.error.message})`);
    } else {
      console.log(`orders column '${col}': OK`);
    }
  }

  const itemCols = [
    "id", "order_id", "product_id", "product_name", "product_slug",
    "unit_price_cents", "quantity", "selected_color", "selected_material",
    "image_url", "created_at"
  ];
  for (const col of itemCols) {
    const res = await supabase.from("order_items").select(col).limit(0);
    if (res.error) {
      console.log(`order_items column '${col}': NOT PRESENT (${res.error.message})`);
    } else {
      console.log(`order_items column '${col}': OK`);
    }
  }
}

checkOrderCols();

