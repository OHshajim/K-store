import fs from "fs";
import net from "net";
import { spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { MOCK_PRODUCTS } from "../lib/data/mockData.ts";

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

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      const port = typeof addr === "object" && addr ? addr.port : 3099;
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

let PORT = 3099;
let BASE = `http://127.0.0.1:${PORT}`;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const failures = [];
const checkedAssets = new Map();
const checkedLinks = new Map();
let tempOwnedOrder = null;

function decodeHtmlAttr(s) {
  return s.replaceAll("&amp;", "&");
}

async function verifyAsset(url) {
  if (checkedAssets.has(url)) return checkedAssets.get(url);
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    checkedAssets.set(url, { ok: true, status: 200 });
    return { ok: true, status: 200 };
  }
  const full = url.startsWith("/") ? `${BASE}${url}` : url;
  try {
    const res = await fetch(full, { method: "GET" });
    const out = { ok: res.status === 200, status: res.status };
    checkedAssets.set(url, out);
    return out;
  } catch (err) {
    const out = { ok: false, status: err?.message || "ERR" };
    checkedAssets.set(url, out);
    return out;
  }
}

async function checkPage(route, { headers = {}, expectStoreShell = false, expectAdminShell = false } = {}) {
  const res = await fetch(`${BASE}${route}`, { headers });
  const html = await res.text();
  const issues = [];

  if (res.status !== 200) issues.push(`HTTP ${res.status}`);
  if (
    html.includes("Application error") ||
    html.includes("NEXT_NOT_FOUND") ||
    html.includes("This page could not be found")
  ) {
    issues.push("Error boundary / 404 detected in HTML");
  }
  if (html.trim().length < 500) issues.push("Unexpectedly short HTML body");

  if (expectStoreShell) {
    const headerCount = (html.match(/<header\b/g) ?? []).length;
    const footerCount = (html.match(/<footer\b/g) ?? []).length;
    const mainCount = (html.match(/<main\b/g) ?? []).length;
    if (headerCount !== 1) issues.push(`Expected 1 <header>, got ${headerCount}`);
    if (footerCount !== 1) issues.push(`Expected 1 <footer>, got ${footerCount}`);
    if (mainCount !== 1) issues.push(`Expected 1 <main>, got ${mainCount}`);
    if (!html.includes("overflow-x-clip")) issues.push("Missing StoreShell overflow-x-clip");
  }

  if (expectAdminShell) {
    const shellCount = (html.match(/class="[^"]*\bastryx-app-shell(?=["\s])/g) ?? []).length;
    const sideNavCount = (html.match(/class="[^"]*\bastryx-side-nav(?=["\s])/g) ?? []).length;
    if (!html.includes("astryx-app-shell")) issues.push("Missing Astryx AppShell");
    if (sideNavCount !== 1) issues.push(`Expected 1 SideNav container, got ${sideNavCount}`);
    if (shellCount !== 1) issues.push(`Expected 1 AppShell container, got ${shellCount}`);
    if (!html.includes("p-6 sm:p-8 max-w-7xl mx-auto")) issues.push("Inconsistent admin outer container padding");
  }

  // Extract all <img src="..."> tags
  const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => decodeHtmlAttr(m[1]));
  for (const src of imgMatches) {
    const asset = await verifyAsset(src);
    if (!asset.ok) issues.push(`Broken <img> (${asset.status}): ${src}`);
  }

  // Extract internal product & journal links to catch dead routes
  const linkMatches = [...html.matchAll(/href="(\/(?:product|journal)\/[^"?#]+)"/g)].map((m) =>
    decodeHtmlAttr(m[1]),
  );
  for (const href of new Set(linkMatches)) {
    if (!checkedLinks.has(href)) {
      const lr = await fetch(`${BASE}${href}`);
      checkedLinks.set(href, lr.status);
    }
    if (checkedLinks.get(href) !== 200) {
      issues.push(`Broken link (${checkedLinks.get(href)}): ${href}`);
    }
  }

  if (issues.length === 0) {
    console.log(`  [PASS] ${route} (HTTP ${res.status}, ${imgMatches.length} imgs)`);
  } else {
    console.error(`  [FAIL] ${route} -> ${issues.join(" | ")}`);
    failures.push({ route, issues });
  }
}

async function main() {
  PORT = await getFreePort();
  BASE = `http://127.0.0.1:${PORT}`;
  const srv = spawn("bun", ["x", "next", "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: "pipe",
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Server startup timed out")), 20000);
      srv.stdout.on("data", (chunk) => {
        if (chunk.toString().includes("Ready")) {
          clearTimeout(timeout);
          resolve(true);
        }
      });
      srv.stderr.on("data", (chunk) => {
        const msg = chunk.toString();
        if (msg.trim()) process.stderr.write(`[srv] ${msg}`);
      });
    });

    console.log(`\nChecking ALL UI pages against ${BASE}...\n`);

    // 1. Create customer & admin cookies + a temp owned customer order so /orders/[id] & /track/[orderNumber] render real data
    const custLogin = await fetch(`${BASE}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "customer", email: "guest-checkout@kstore.internal" }),
    });
    const custCookie = (custLogin.headers.getSetCookie ? custLogin.headers.getSetCookie() : [])
      .map((c) => c.split(";")[0])
      .join("; ");

    const adminLogin = await fetch(`${BASE}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin", email: "ajshajimmax@gmail.com" }),
    });
    const adminCookie = (adminLogin.headers.getSetCookie ? adminLogin.headers.getSetCookie() : [])
      .map((c) => c.split(";")[0])
      .join("; ");

    const orderRes = await fetch(`${BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: custCookie },
      body: JSON.stringify({
        customer_name: "UI Audit Patron",
        customer_email: "guest-checkout@kstore.internal",
        customer_phone: "+1 555-010-2030",
        shipping_address: "120 Linen Street",
        shipping_city: "Copenhagen",
        payment_method: "cash_on_delivery",
        deliveryOption: "standard",
        items: [{ productId: "a0000000-0000-4000-8000-000000000001", quantity: 1 }],
      }),
    });
    const orderPayload = await orderRes.json();
    tempOwnedOrder = orderPayload.order;

    // Storefront pages (using StoreShell)
    const storeRoutes = [
      "/",
      "/shop",
      ...MOCK_PRODUCTS.map((p) => `/product/${p.slug}`),
      "/cart",
      "/checkout",
      "/wishlist",
      "/fit-assistant",
      "/journal",
      "/journal/principles-of-scandinavian-organization",
      "/journal/sculpting-with-indirect-light",
      "/journal/quiet-workspace-rituals",
      "/about",
      "/story",
      "/faq",
      "/contact",
      "/privacy",
      "/terms",
    ];
    for (const r of storeRoutes) {
      await checkPage(r, { expectStoreShell: true });
    }

    // Track pages & standalone UI shells
    await checkPage("/track", { expectStoreShell: true });
    if (tempOwnedOrder) {
      await checkPage(`/track/${tempOwnedOrder.order_number}?t=${tempOwnedOrder.tracking_token}`, {
        expectStoreShell: true,
      });
    }
    await checkPage("/~offline");
    await checkPage("/login");

    // Authenticated Customer routes
    await checkPage("/account", { headers: { Cookie: custCookie }, expectStoreShell: true });
    await checkPage("/orders", { headers: { Cookie: custCookie }, expectStoreShell: true });
    if (tempOwnedOrder) {
      await checkPage(`/orders/${tempOwnedOrder.id}`, {
        headers: { Cookie: custCookie },
        expectStoreShell: true,
      });
    }

    // Authenticated Admin routes
    const adminRoutes = [
      "/admin",
      "/admin/products",
      "/admin/products/new",
      "/admin/products/a0000000-0000-4000-8000-000000000001",
      "/admin/orders",
      ...(tempOwnedOrder ? [`/admin/orders/${tempOwnedOrder.id}`] : []),
      "/admin/categories",
      "/admin/coupons",
      "/admin/banners",
      "/admin/reviews",
      "/admin/journal",
      "/admin/users",
      "/admin/settings",
    ];
    for (const r of adminRoutes) {
      await checkPage(r, { headers: { Cookie: adminCookie }, expectAdminShell: true });
    }

    console.log(
      `\nChecked ${checkedAssets.size} unique rendered <img> assets & ${checkedLinks.size} product/journal links across all routes.`,
    );
  } finally {
    srv.kill();
    if (tempOwnedOrder?.id) {
      await supabase.from("order_events").delete().eq("order_id", tempOwnedOrder.id);
      await supabase.from("order_items").delete().eq("order_id", tempOwnedOrder.id);
      await supabase.from("orders").delete().eq("id", tempOwnedOrder.id);
      await supabase
        .from("products")
        .update({ stock: 7 })
        .eq("id", "a0000000-0000-4000-8000-000000000001");
    }
  }

  if (failures.length > 0) {
    console.error(`\nFAILED ROUTES (${failures.length}):`, failures);
    process.exit(1);
  }
  console.log("\nALL PAGES & IMAGES VERIFIED CLEAN (0 FAILURES)!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
