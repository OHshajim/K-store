import fs from "fs";
import path from "path";
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

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const results = [];
let tempOrderId = null;
let tempStripeOrderId = null;
let tempProductId = null;
let tempCouponId = null;
let tempReviewId = null;
let tempUploadFilename = null;
const testNewsletterEmail = `e2e-customer-${Date.now()}@example.com`;
const initialStockCredenza = 7;
const initialStockDeskCaddy = 19;

function pass(section, name, details = "") {
  results.push({ section, name, ok: true, details });
  console.log(`  [PASS] ${section} :: ${name}${details ? ` — ${details}` : ""}`);
}

function fail(section, name, details = "") {
  results.push({ section, name, ok: false, details });
  console.error(`  [FAIL] ${section} :: ${name}${details ? ` — ${details}` : ""}`);
}

function extractCookies(res) {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function run() {
  console.log(`\nStarting End-to-End Verification against ${BASE}\n`);

  // =========================================================================
  // 1. CUSTOMER STOREFRONT & CATALOG ROUTES
  // =========================================================================
  const homeRes = await fetch(`${BASE}/`);
  const homeHtml = await homeRes.text();
  if (homeRes.status === 200 && homeHtml.includes("Klinte Solid Oak Tambour Credenza")) {
    pass("Customer Storefront", "GET / renders real product catalog");
  } else {
    fail("Customer Storefront", "GET / renders real product catalog", `status=${homeRes.status}`);
  }

  const forbiddenLegacyStrings = [
    'href="/products/',
    "/rooms?",
    "30 Published Essentials",
    "Modular Storage Shelf",
    "Ambient Floor Lamp",
  ];
  const staleHits = forbiddenLegacyStrings.filter((s) => homeHtml.includes(s));
  if (staleHits.length === 0) {
    pass("Customer Storefront", "Home HTML has zero stale routes or removed legacy products");
  } else {
    fail("Customer Storefront", "Home HTML clean check", `Found stale strings: ${staleHits.join(", ")}`);
  }

  const publicRoutes = [
    "/shop",
    "/shop?category=living-room",
    "/shop?room=workspace",
    "/shop?q=oak",
    "/fit-assistant",
    "/journal",
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/track",
    "/login",
  ];

  for (const route of publicRoutes) {
    const r = await fetch(`${BASE}${route}`);
    if (r.status === 200) pass("Customer Storefront", `GET ${route}`, "HTTP 200");
    else fail("Customer Storefront", `GET ${route}`, `HTTP ${r.status}`);
  }

  // Verify ALL 12 real products and all 15 product image assets
  for (const p of MOCK_PRODUCTS) {
    const pr = await fetch(`${BASE}/product/${p.slug}`);
    const pHtml = await pr.text();
    if (pr.status === 200 && pHtml.includes(p.name)) {
      pass("Catalog PDP", `GET /product/${p.slug}`, p.sku);
    } else {
      fail("Catalog PDP", `GET /product/${p.slug}`, `status=${pr.status}`);
    }
    for (const imgPath of p.images) {
      const ir = await fetch(`${BASE}${imgPath}`);
      if (ir.status === 200) {
        pass("Catalog Images", `GET ${imgPath}`, `${ir.headers.get("content-type")}`);
      } else {
        fail("Catalog Images", `GET ${imgPath}`, `HTTP ${ir.status}`);
      }
    }
  }

  // Search API (multi-word & material matching)
  const searchMarble = await fetch(`${BASE}/api/search?q=${encodeURIComponent("Marble Floor Lamp")}`).then((r) => r.json());
  if (searchMarble.products?.some((p) => p.slug === "are-carrera-marble-floor-lamp")) {
    pass("Search", "Multi-word search 'Marble Floor Lamp'", `matched ${searchMarble.products.length} item(s)`);
  } else {
    fail("Search", "Multi-word search 'Marble Floor Lamp'", JSON.stringify(searchMarble));
  }

  const searchMaterial = await fetch(`${BASE}/api/search?q=Travertine`).then((r) => r.json());
  if (searchMaterial.products?.some((p) => p.slug === "trosa-travertine-vanity-set")) {
    pass("Search", "Material search 'Travertine'", "matched Trosa Travertine & Brass Vanity Set");
  } else {
    fail("Search", "Material search 'Travertine'", JSON.stringify(searchMaterial));
  }

  // =========================================================================
  // 2. AUTHENTICATION & ACCESS CONTROL ISOLATION
  // =========================================================================
  const unauthAdminApi = await fetch(`${BASE}/api/admin/coupons`);
  if (unauthAdminApi.status === 403 || unauthAdminApi.status === 401) {
    pass("Security / RBAC", "Unauthenticated GET /api/admin/coupons blocked", `HTTP ${unauthAdminApi.status}`);
  } else {
    fail("Security / RBAC", "Unauthenticated GET /api/admin/coupons blocked", `HTTP ${unauthAdminApi.status}`);
  }

  const unauthAdminPage = await fetch(`${BASE}/admin`, { redirect: "manual" });
  if (unauthAdminPage.status === 307 || unauthAdminPage.status === 302) {
    pass("Security / RBAC", "Unauthenticated GET /admin redirected to login", `HTTP ${unauthAdminPage.status}`);
  } else {
    fail("Security / RBAC", "Unauthenticated GET /admin redirected", `HTTP ${unauthAdminPage.status}`);
  }

  const custLoginRes = await fetch(`${BASE}/api/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "customer", email: "guest-checkout@kstore.internal" }),
  });
  const customerCookie = extractCookies(custLoginRes);
  if (custLoginRes.status === 200 && customerCookie.includes("kstore_session")) {
    pass("Customer Auth", "Customer session created via /api/auth/demo-login");
  } else {
    fail("Customer Auth", "Customer session creation", `status=${custLoginRes.status}`);
  }

  const custToAdminApi = await fetch(`${BASE}/api/admin/coupons`, {
    headers: { Cookie: customerCookie },
  });
  if (custToAdminApi.status === 403) {
    pass("Security / RBAC", "Customer session blocked from /api/admin/coupons", "HTTP 403");
  } else {
    fail("Security / RBAC", "Customer session blocked from /api/admin/coupons", `HTTP ${custToAdminApi.status}`);
  }

  const accountPageRes = await fetch(`${BASE}/account`, { headers: { Cookie: customerCookie } });
  if (accountPageRes.status === 200) pass("Customer Account", "GET /account authenticated", "HTTP 200");
  else fail("Customer Account", "GET /account authenticated", `HTTP ${accountPageRes.status}`);

  const ordersPageRes = await fetch(`${BASE}/orders`, { headers: { Cookie: customerCookie } });
  if (ordersPageRes.status === 200) pass("Customer Account", "GET /orders authenticated", "HTTP 200");
  else fail("Customer Account", "GET /orders authenticated", `HTTP ${ordersPageRes.status}`);

  // =========================================================================
  // 3. CUSTOMER CHECKOUT, COUPONS, SHIPPING, TRACKING & EMAILS
  // =========================================================================
  // Check coupon validation API (if exists) + create order with WELCOME20 (20% off $890 = -$178 -> $712 + $25 express = $737 = 73700 cents)
  const orderCreateRes = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "E2E Customer Tester",
      customer_email: "e2e-buyer@example.com",
      customer_phone: "+1 555-019-2834",
      shipping_address: "420 Nordic Architecture Way",
      shipping_city: "Copenhagen",
      shipping_notes: "E2E verification order — safe to clean",
      payment_method: "cash_on_delivery",
      couponCode: "WELCOME20",
      deliveryOption: "express",
      items: [
        {
          productId: "a0000000-0000-4000-8000-000000000001",
          quantity: 1,
          selectedColor: "Natural White Oak",
        },
      ],
    }),
  });
  const orderData = await orderCreateRes.json();
  if (
    orderCreateRes.status === 200 &&
    orderData.order?.id &&
    orderData.order?.total_cents === 73700 &&
    orderData.order?.tracking_token
  ) {
    tempOrderId = orderData.order.id;
    pass(
      "Checkout & Pricing",
      "POST /api/orders with WELCOME20 + Express shipping",
      `Order #${orderData.order.order_number}, total=$${(orderData.order.total_cents / 100).toFixed(2)}`,
    );
  } else {
    fail(
      "Checkout & Pricing",
      "POST /api/orders with WELCOME20 + Express shipping",
      `status=${orderCreateRes.status}, body=${JSON.stringify(orderData)}`,
    );
  }

  if (orderData.order?.order_number && orderData.order?.tracking_token) {
    // Verify Lookup requires matching email
    const badLookup = await fetch(`${BASE}/api/orders/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: orderData.order.order_number,
        email: "wrong-person@example.com",
      }),
    });
    if (badLookup.status === 403 || badLookup.status === 404 || badLookup.status === 400) {
      pass("Order Privacy", "Lookup rejects mismatched email", `HTTP ${badLookup.status}`);
    } else {
      fail("Order Privacy", "Lookup rejects mismatched email", `HTTP ${badLookup.status}`);
    }

    const goodLookup = await fetch(`${BASE}/api/orders/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: orderData.order.order_number,
        email: "e2e-buyer@example.com",
      }),
    });
    const lookupBody = await goodLookup.json();
    if (
      goodLookup.status === 200 &&
      lookupBody.redirectUrl?.includes(orderData.order.tracking_token)
    ) {
      pass("Order Lookup", "Lookup succeeds with matching orderNumber + email", lookupBody.redirectUrl);
    } else {
      fail("Order Lookup", "Lookup succeeds with matching email", `status=${goodLookup.status}, ${JSON.stringify(lookupBody)}`);
    }

    const trackValid = await fetch(
      `${BASE}/track/${orderData.order.order_number}?t=${orderData.order.tracking_token}`,
    );
    const trackValidHtml = await trackValid.text();
    if (trackValid.status === 200 && trackValidHtml.includes(orderData.order.order_number)) {
      pass("Order Tracking", "GET /track/[orderNumber]?t=<valid>", "HTTP 200 shows order");
    } else {
      fail("Order Tracking", "GET /track/[orderNumber]?t=<valid>", `status=${trackValid.status}`);
    }

    const trackInvalid = await fetch(`${BASE}/track/${orderData.order.order_number}?t=wrongtoken`);
    const trackInvalidHtml = await trackInvalid.text();
    if (!trackInvalidHtml.includes("420 Nordic Architecture Way")) {
      pass("Order Privacy", "GET /track/[orderNumber]?t=wrongtoken hides order details");
    } else {
      fail("Order Privacy", "GET /track/[orderNumber]?t=wrongtoken leaked order details");
    }
  }

  // Coupon Validation API
  const validCouponRes = await fetch(`${BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "WELCOME20", subtotalCents: 30000 }),
  });
  const validCouponData = await validCouponRes.json();
  if (validCouponRes.ok && validCouponData.success && validCouponData.coupon?.discount_percent === 20) {
    pass("Coupons", "POST /api/coupons/validate (WELCOME20)", "20% discount verified");
  } else {
    fail("Coupons", "POST /api/coupons/validate (WELCOME20)", `status=${validCouponRes.status}, ${JSON.stringify(validCouponData)}`);
  }

  const invalidCouponRes = await fetch(`${BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "NOTAREALCODE99", subtotalCents: 30000 }),
  });
  if (invalidCouponRes.status === 404 || !invalidCouponRes.ok) {
    pass("Coupons", "POST /api/coupons/validate rejects invalid code", `HTTP ${invalidCouponRes.status}`);
  } else {
    fail("Coupons", "POST /api/coupons/validate rejects invalid code", `HTTP ${invalidCouponRes.status}`);
  }

  // Stripe Order + Checkout Session + Simulator/Live Confirmation
  const stripeOrderRes = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Stripe E2E Buyer",
      customer_email: "stripe-e2e@example.com",
      customer_phone: "+1 555-014-8821",
      shipping_address: "88 Design District Blvd",
      shipping_city: "Seattle",
      payment_method: "stripe",
      couponCode: "NORDEN10",
      deliveryOption: "standard",
      items: [
        {
          productId: "a0000000-0000-4000-8000-000000000003",
          quantity: 1,
          selectedColor: "American Walnut",
        },
      ],
    }),
  });
  const stripeOrderData = await stripeOrderRes.json();
  if (stripeOrderRes.ok && stripeOrderData.order?.id && stripeOrderData.order?.total_cents === 11850) {
    tempStripeOrderId = stripeOrderData.order.id;
    pass(
      "Stripe Checkout",
      "POST /api/orders (stripe + NORDEN10 + flat shipping)",
      `Order #${stripeOrderData.order.order_number}, total=$118.50`,
    );
    const sessionRes = await fetch(`${BASE}/api/checkout/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: tempStripeOrderId,
        trackingToken: stripeOrderData.order.tracking_token,
      }),
    });
    const sessionData = await sessionRes.json();
    if (sessionRes.ok && sessionData.url) {
      pass("Stripe Checkout", "POST /api/checkout/stripe creates checkout URL", sessionData.url.slice(0, 80));
      if (sessionData.url.includes("/api/checkout/stripe/confirm")) {
        const confirmRes = await fetch(sessionData.url, { redirect: "manual" });
        const { data: updatedStripeOrder } = await supabase
          .from("orders")
          .select("payment_status, delivery_status")
          .eq("id", tempStripeOrderId)
          .single();
        if (
          (confirmRes.status === 307 || confirmRes.status === 302) &&
          updatedStripeOrder?.payment_status === "paid" &&
          updatedStripeOrder?.delivery_status === "confirmed"
        ) {
          pass("Stripe Checkout", "GET /api/checkout/stripe/confirm marks paid & confirmed");
        } else {
          fail("Stripe Checkout", "GET /api/checkout/stripe/confirm", `status=${confirmRes.status}, order=${JSON.stringify(updatedStripeOrder)}`);
        }
      }
    } else {
      fail("Stripe Checkout", "POST /api/checkout/stripe", `status=${sessionRes.status}, ${JSON.stringify(sessionData)}`);
    }
  } else {
    fail("Stripe Checkout", "POST /api/orders (stripe)", `status=${stripeOrderRes.status}, ${JSON.stringify(stripeOrderData)}`);
  }

  // Customer Review submission
  const revComment = `E2E Verified Walnut finish check ${Date.now()}`;
  const reviewRes = await fetch(`${BASE}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: customerCookie,
    },
    body: JSON.stringify({
      productId: "a0000000-0000-4000-8000-000000000003",
      rating: 5,
      comment: revComment,
    }),
  });
  if (reviewRes.ok) {
    const { data: revRow } = await supabase
      .from("reviews")
      .select("id")
      .eq("comment", revComment)
      .maybeSingle();
    tempReviewId = revRow?.id ?? null;
    pass("Customer Reviews", "POST /api/reviews submits review", `id=${tempReviewId}`);
  } else {
    fail("Customer Reviews", "POST /api/reviews", `status=${reviewRes.status}`);
  }

  // Communication / Nodemailer Customer Endpoints
  const nlRes = await fetch(`${BASE}/api/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testNewsletterEmail }),
  });
  if (nlRes.status === 200) pass("Customer Email", "POST /api/newsletter", "HTTP 200");
  else fail("Customer Email", "POST /api/newsletter", `status=${nlRes.status}`);

  const contactRes = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Inquiry Tester",
      email: "e2e-inquiry@example.com",
      category: "Product Specification",
      subject: "Credenza finish inquiry",
      message: "Confirming whether custom brass pull sizing is available for trade orders.",
    }),
  });
  if (contactRes.status === 200) pass("Customer Email", "POST /api/contact", "HTTP 200");
  else fail("Customer Email", "POST /api/contact", `status=${contactRes.status}`);

  const otpRes = await fetch(`${BASE}/api/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "guest-checkout@kstore.internal", intent: "forgot_password" }),
  });
  const otpData = await otpRes.json();
  if (otpRes.status === 200 && otpData.success) {
    pass("Auth Recovery", "POST /api/auth/otp/send", "6-digit OTP generated & dispatched");
  } else {
    fail("Auth Recovery", "POST /api/auth/otp/send", `status=${otpRes.status}, ${JSON.stringify(otpData)}`);
  }

  // =========================================================================
  // 4. ADMIN WORKFLOWS: DASHBOARD, UPLOAD, PRODUCT CRUD, ORDER FULFILLMENT, COUPONS, SMTP TEST
  // =========================================================================
  const adminLoginRes = await fetch(`${BASE}/api/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin", email: "ajshajimmax@gmail.com" }),
  });
  const adminCookie = extractCookies(adminLoginRes);
  if (adminLoginRes.status === 200 && adminCookie.includes("kstore_session")) {
    pass("Admin Auth", "Admin session created via /api/auth/demo-login");
  } else {
    fail("Admin Auth", "Admin session creation", `status=${adminLoginRes.status}`);
  }

  const adminPages = [
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/admin/categories",
    "/admin/coupons",
    "/admin/banners",
    "/admin/reviews",
    "/admin/journal",
    "/admin/users",
    "/admin/settings",
  ];
  for (const page of adminPages) {
    const r = await fetch(`${BASE}${page}`, { headers: { Cookie: adminCookie } });
    const html = await r.text();
    if (r.status === 200) {
      if (page === "/admin") {
        if (/12(?:<!--\s*-->)?\s*Published Essentials/.test(html) && !html.includes("30 Published Essentials")) {
          pass("Admin Pages", `GET ${page}`, "HTTP 200 · dynamic '12 Published Essentials'");
        } else {
          fail("Admin Pages", `GET ${page} dynamic product count`, "Missing '12 Published Essentials'");
        }
      } else {
        pass("Admin Pages", `GET ${page}`, "HTTP 200");
      }
    } else {
      fail("Admin Pages", `GET ${page}`, `HTTP ${r.status}`);
    }
  }

  // Admin Image Upload
  const sampleImgBuffer = fs.readFileSync(
    path.join(process.cwd(), "public/images/products/aalto-turned-ash-side-table.jpg"),
  );
  const uploadForm = new FormData();
  uploadForm.append(
    "file",
    new Blob([sampleImgBuffer], { type: "image/jpeg" }),
    "e2e-upload-test.jpg",
  );
  const uploadRes = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { Cookie: adminCookie },
    body: uploadForm,
  });
  const uploadBody = await uploadRes.json();
  if (uploadRes.status === 200 && uploadBody.url) {
    tempUploadFilename = uploadBody.filename || null;
    pass("Admin Upload", "POST /api/admin/upload", `storage=${uploadBody.storage}, url=${uploadBody.url}`);
  } else {
    fail("Admin Upload", "POST /api/admin/upload", `status=${uploadRes.status}, ${JSON.stringify(uploadBody)}`);
  }

  // Admin Create -> Edit -> Archive -> Hard Delete Product
  const createProdRes = await fetch(`${BASE}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "Temp E2E Birch Stool",
      slug: `temp-e2e-birch-stool-${Date.now()}`,
      description: "Temporary automated verification product.",
      price_cents: 19900,
      stock: 5,
      images: [uploadBody.url || "/images/products/aalto-turned-ash-side-table.jpg"],
      is_active: true,
      is_featured: false,
      is_bestseller: false,
      material: "Solid Birch",
      room: "living",
      category_id: "c0000000-0000-4000-8000-000000000001",
    }),
  });
  const createProdBody = await createProdRes.json();
  if (createProdRes.status === 200 && createProdBody.id) {
    tempProductId = createProdBody.id;
    pass("Admin Products", "POST /api/admin/products (Create)", `id=${tempProductId}`);

    const patchProdRes = await fetch(`${BASE}/api/admin/products/${tempProductId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ price_cents: 21500, stock: 8, is_active: false }),
    });
    const patchProdBody = await patchProdRes.json();
    if (patchProdRes.status === 200 && patchProdBody.product?.price_cents === 21500) {
      pass("Admin Products", "PATCH /api/admin/products/[id] (Edit + Archive)", "price=21500, is_active=false");
    } else {
      fail("Admin Products", "PATCH /api/admin/products/[id]", `status=${patchProdRes.status}`);
    }

    // Verify archived product still appears in /admin/products thanks to getAdminProducts()
    const adminProdsHtml = await fetch(`${BASE}/admin/products`, { headers: { Cookie: adminCookie } }).then((r) => r.text());
    if (adminProdsHtml.includes("Temp E2E Birch Stool")) {
      pass("Admin Products", "Archived product remains visible in /admin/products");
    } else {
      fail("Admin Products", "Archived product missing from /admin/products");
    }

    const delProdRes = await fetch(`${BASE}/api/admin/products/${tempProductId}?hard=true`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    if (delProdRes.status === 200) {
      tempProductId = null;
      pass("Admin Products", "DELETE /api/admin/products/[id]?hard=true", "Temporary product removed cleanly");
    } else {
      fail("Admin Products", "DELETE /api/admin/products/[id]?hard=true", `status=${delProdRes.status}`);
    }
  } else {
    fail("Admin Products", "POST /api/admin/products", `status=${createProdRes.status}, ${JSON.stringify(createProdBody)}`);
  }

  // Admin Fulfillment Status Update + Timeline Event
  if (tempOrderId) {
    const patchOrderRes = await fetch(`${BASE}/api/admin/orders/${tempOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        delivery_status: "packed",
        payment_status: "paid",
        admin_notes: "E2E packed and verified",
      }),
    });
    const patchOrderBody = await patchOrderRes.json();
    if (
      patchOrderRes.status === 200 &&
      patchOrderBody.order?.delivery_status === "packed" &&
      patchOrderBody.order?.payment_status === "paid"
    ) {
      pass("Admin Orders", "PATCH /api/admin/orders/[id]", "delivery=packed, payment=paid");
    } else {
      fail("Admin Orders", "PATCH /api/admin/orders/[id]", `status=${patchOrderRes.status}, ${JSON.stringify(patchOrderBody)}`);
    }
  }

  // Admin Coupon Create + Delete
  const tempCode = `E2ETEST${String(Date.now()).slice(-4)}`;
  const createCouponRes = await fetch(`${BASE}/api/admin/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      code: tempCode,
      discount_percent: 25,
      min_spend_cents: 5000,
      is_active: true,
    }),
  });
  const createCouponBody = await createCouponRes.json();
  if (createCouponRes.ok && createCouponBody.coupon?.id) {
    tempCouponId = createCouponBody.coupon.id;
    pass("Admin Coupons", "POST /api/admin/coupons", `Created ${tempCode} (HTTP ${createCouponRes.status})`);
    const delCouponRes = await fetch(`${BASE}/api/admin/coupons/${tempCouponId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    if (delCouponRes.ok) {
      tempCouponId = null;
      pass("Admin Coupons", "DELETE /api/admin/coupons/[id]", "Cleaned temp coupon");
    } else {
      fail("Admin Coupons", "DELETE /api/admin/coupons/[id]", `status=${delCouponRes.status}`);
    }
  } else {
    fail("Admin Coupons", "POST /api/admin/coupons", `status=${createCouponRes.status}, ${JSON.stringify(createCouponBody)}`);
  }

  // Admin Reviews Moderate & Delete
  if (tempReviewId) {
    const hideRevRes = await fetch(`${BASE}/api/admin/reviews/${tempReviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ is_published: false }),
    });
    if (hideRevRes.ok) {
      pass("Admin Reviews", "PATCH /api/admin/reviews/[id] (Hide)", "is_published=false");
    } else {
      fail("Admin Reviews", "PATCH /api/admin/reviews/[id]", `status=${hideRevRes.status}`);
    }

    const delRevRes = await fetch(`${BASE}/api/admin/reviews/${tempReviewId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    if (delRevRes.ok) {
      tempReviewId = null;
      pass("Admin Reviews", "DELETE /api/admin/reviews/[id]", "Cleaned temp review");
    } else {
      fail("Admin Reviews", "DELETE /api/admin/reviews/[id]", `status=${delRevRes.status}`);
    }
  }

  // Admin Email Test Endpoint (Nodemailer)
  const emailTestRes = await fetch(`${BASE}/api/admin/email/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ email: "ajshajimmax@gmail.com" }),
  });
  const emailTestBody = await emailTestRes.json();
  if (emailTestRes.ok && emailTestBody.success) {
    pass("Admin Email", "POST /api/admin/email/test", `mode=${emailTestBody.details?.mode}, msg=${emailTestBody.message}`);
  } else {
    fail("Admin Email", "POST /api/admin/email/test", `status=${emailTestRes.status}, ${JSON.stringify(emailTestBody)}`);
  }

  // =========================================================================
  // 5. CLEANUP SYNTHETIC E2E ARTIFACTS IN SUPABASE & DISK
  // =========================================================================
  console.log("\n=== Cleaning up temporary E2E test records ===");
  if (tempProductId) {
    await supabase.from("products").delete().eq("id", tempProductId);
  }
  if (tempCouponId) {
    await supabase.from("coupons").delete().eq("id", tempCouponId);
  }
  if (tempReviewId) {
    await supabase.from("reviews").delete().eq("id", tempReviewId);
  }
  if (tempOrderId) {
    await supabase.from("order_events").delete().eq("order_id", tempOrderId);
    await supabase.from("order_items").delete().eq("order_id", tempOrderId);
    await supabase.from("orders").delete().eq("id", tempOrderId);
    await supabase
      .from("products")
      .update({ stock: initialStockCredenza })
      .eq("id", "a0000000-0000-4000-8000-000000000001");
  }
  if (tempStripeOrderId) {
    await supabase.from("order_events").delete().eq("order_id", tempStripeOrderId);
    await supabase.from("order_items").delete().eq("order_id", tempStripeOrderId);
    await supabase.from("orders").delete().eq("id", tempStripeOrderId);
    await supabase
      .from("products")
      .update({ stock: initialStockDeskCaddy })
      .eq("id", "a0000000-0000-4000-8000-000000000003");
  }
  await supabase.from("newsletter_subscribers").delete().eq("email", testNewsletterEmail);
  if (tempUploadFilename) {
    await supabase.storage.from("products").remove([tempUploadFilename]);
    await supabase.storage.from("product-images").remove([tempUploadFilename]);
    const localUploadPath = path.join(process.cwd(), "public", "uploads", tempUploadFilename);
    if (fs.existsSync(localUploadPath)) fs.unlinkSync(localUploadPath);
  }

  const { count: finalProdCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  console.log(`Post-cleanup Supabase products count: ${finalProdCount}`);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nE2E SUMMARY: ${passed} passed, ${failed} failed (total ${results.length} checks)\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("E2E runner error:", err);
  process.exit(1);
});
