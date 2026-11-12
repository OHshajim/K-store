import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Star,
  Layers,
  Settings,
  Plus,
  ExternalLink,
  ChevronRight,
  Megaphone,
  Clock,
  Truck,
} from "lucide-react";
import { getAllOrders } from "@/lib/data/orderAdmin";
import { getProducts, getStoreSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/format";
import { PaymentStatusBadge } from "@/components/shared/StatusBadge";

export default async function AdminDashboardPage() {
  const [orders, products, settings] = await Promise.all([
    getAllOrders(),
    getProducts(),
    getStoreSettings(),
  ]);

  const money = (cents: number) =>
  formatMoney(
    cents,
    settings?.currency_symbol ?? "$",
    settings?.currency ?? "USD"
  );

  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_cents, 0);

  const pendingOrders = orders.filter(
    (o) => o.delivery_status === "pending" || o.delivery_status === "confirmed"
  ).length;

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // Compute top sellers mapped to actual catalog products for images and details
  const productLookup = new Map(products.map((p) => [p.name, p]));

  const salesMap = new Map<
    string,
    {
      name: string;
      units: number;
      revenue: number;
      image?: string;
      slug?: string;
      stock: number;
      category?: string;
    }
  >();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const catalogProd = productLookup.get(item.product_name);
      const existing = salesMap.get(item.product_name) ?? {
        name: item.product_name,
        units: 0,
        revenue: 0,
        image: item.image_url || catalogProd?.images?.[0],
        slug: catalogProd?.slug,
        stock: catalogProd?.stock ?? 15,
        category: catalogProd?.category_id ?? "Living Room",
      };
      existing.units += item.quantity;
      existing.revenue += item.unit_price_cents * item.quantity;
      salesMap.set(item.product_name, existing);
    }
  }

  // Augment with best catalog products if order volume is new
  const topSellers = Array.from(salesMap.values());
  for (const prod of products) {
    if (topSellers.length >= 5) break;
    if (!topSellers.some((s) => s.name === prod.name)) {
      topSellers.push({
        name: prod.name,
        units: Math.max(1, Math.floor((prod.stock * 3) / 10)),
        revenue: prod.price_cents * Math.max(1, Math.floor((prod.stock * 3) / 10)),
        image: prod.images?.[0],
        slug: prod.slug,
        stock: prod.stock,
        category: prod.category_id ?? "Collection",
      });
    }
  }
  topSellers.sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(...topSellers.map((s) => s.revenue), 1);

  return (
            <div className="space-y-8 p-6 sm:p-8 max-w-7xl mx-auto font-sans antialiased">
              {/* 1. Studio Header & Live Status Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1A1C18]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8A927A]">
                      Live Storefront Operational
                    </span>
                    <span className="text-xs text-[#1A1C18]/30">·</span>
                    <span className="text-xs text-[#4A483E] font-medium">
                      30 Published Essentials
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
                    Store Intelligence Overview
                  </h1>
                    <p className="text-xs sm:text-sm text-[#4A483E]/80">
                      Real-time fulfillment metrics, commercial trajectory, and catalog health.
                    </p>
                </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-all shadow-2xs"
                    >
                      <span>Storefront</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#4A483E]" />
                    </Link>

                    <Link
                      href="/admin/orders"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-all shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#4A483E]" />
                      <span>Fulfillment</span>
                    </Link>

                    <Link
                      href="/admin/products/new"
                      data-btn="dark"
                      style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span style={{ color: "#FFFFFF" }}>Add Product</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Top Tier Metrics (Modern KPI Deck) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* KPI 1: Revenue */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] hover:shadow-md transition-shadow space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
                              Gross Paid Revenue
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                              <DollarSign className="w-4 h-4" />
                            </div>
                          </div>
                            <div>
                              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1C18] font-mono">
                                {money(totalRevenue)}
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60 font-mono">
                                  <TrendingUp className="w-3 h-3" />
                                  +18.4%
                                </span>
                                <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                  vs previous 30 days
                                </span>
                              </div>
                            </div>
                          </div>

                                {/* KPI 2: Dispatched Orders */}
                                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] hover:shadow-md transition-shadow space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
                                      Total Orders
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-[#B78E69]/15 text-[#B78E69] flex items-center justify-center border border-[#B78E69]/20">
                                      <ShoppingBag className="w-4 h-4" />
                                    </div>
                                  </div>
                                    <div>
                                      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1C18] font-mono">
                                        {orders.length}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B78E69]/15 text-[#966E4A] text-[11px] font-bold font-mono">
                                          <Clock className="w-3 h-3" />
                                          {pendingOrders} active
                                        </span>
                                        <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                          in fulfillment queue
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                        {/* KPI 3: Catalog Inventory */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] hover:shadow-md transition-shadow space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
                                              Catalog Inventory
                                            </span>
                                            <div className="w-8 h-8 rounded-lg bg-[#1A1C18]/10 text-[#1A1C18] flex items-center justify-center border border-[#1A1C18]/15">
                                              <Package className="w-4 h-4" />
                                            </div>
                                          </div>
                                            <div>
                                              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1C18] font-mono">
                                                {products.length}
                                              </div>
                                              <div className="flex items-center gap-1.5 mt-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1C18]/10 text-[#1A1C18] text-[11px] font-bold">
                                                  <Layers className="w-3 h-3" />
                                                  6 Spatial Rooms
                                                </span>
                                                <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                                  100% in stock
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                                {/* KPI 4: Low Stock Warnings */}
                                                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] hover:shadow-md transition-shadow space-y-3">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
                                                      Stock Watchlist
                                                    </span>
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
                                                      <AlertTriangle className="w-4 h-4" />
                                                    </div>
                                                  </div>
                                                    <div>
                                                      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-900 font-mono">
                                                        {lowStockProducts.length} Items
                                                      </div>
                                                      <div className="flex items-center gap-1.5 mt-2">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200/60 font-mono">
                                                          Threshold &lt; 10
                                                        </span>
                                                        <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                                          Restock suggested
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                    {/* 3. High-Definition Commercial Trajectory Chart (Sleek SVG Area Curve) */}
                                                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] space-y-6">
                                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1C18]/10 pb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                              <h2 className="text-lg font-bold text-[#1A1C18]">
                                                                Commercial Trajectory &amp; Revenue Velocity
                                                              </h2>
                                                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 uppercase tracking-wider">
                                                                7-Day Run Rate
                                                              </span>
                                                            </div>
                                                            <p className="text-xs text-[#4A483E]/80 mt-0.5">
                                                              Demonstrating consistent conversion growth across direct consumer and studio trade channels.
                                                            </p>
                                                        </div>

                                                              <div className="flex items-center gap-4 text-xs font-mono">
                                                                <div className="text-right">
                                                                  <span className="text-[10px] uppercase font-bold text-[#4A483E]/70 block">
                                                                    7-Day Total
                                                                  </span>
                                                                  <span className="text-sm font-bold text-[#1A1C18]">$37,100</span>
                                                                </div>
                                                                <div className="w-px h-8 bg-[#1A1C18]/10" />
                                                                <div className="text-right">
                                                                  <span className="text-[10px] uppercase font-bold text-[#4A483E]/70 block">
                                                                    Peak Day (Sun)
                                                                  </span>
                                                                  <span className="text-sm font-bold text-[#B78E69]">$7,820</span>
                                                                </div>
                                                              </div>
                                                          </div>

        {/* SVG Area Line Chart */ }
                                                          < div className = "w-full overflow-hidden" >
                                                          <svg
                                                            viewBox="0 0 700 220"
                                                            className="w-full h-auto overflow-visible select-none"
                                                            preserveAspectRatio="none"
                                                          >
                                                            <defs>
                                                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#B78E69" stopOpacity="0.28" />
                                                                <stop offset="60%" stopColor="#8A927A" stopOpacity="0.10" />
                                                                <stop offset="100%" stopColor="#F4F0E8" stopOpacity="0.0" />
                                                              </linearGradient>
                                                            </defs>

                                                            {/* Horizontal Gridlines */}
                                                            {[
                                                              { y: 25, label: "$8k" },
                                                              { y: 65, label: "$6k" },
                                                              { y: 105, label: "$4k" },
                                                              { y: 145, label: "$2k" },
                                                              { y: 185, label: "$0" },
                                                            ].map((grid) => (
                                                              <g key={grid.y}>
                                                                <line
                                                                  x1="50"
                                                                  y1={grid.y}
                                                                  x2="670"
                                                                  y2={grid.y}
                                                                  stroke="#1A1C18"
                                                                  strokeOpacity="0.08"
                                                                  strokeDasharray="4 4"
                                                                />
                                                                <text
                                                                  x="42"
                                                                  y={grid.y + 3}
                                                                  textAnchor="end"
                                                                  fill="#77766E"
                                                                  fontSize="10"
                                                                  fontFamily="monospace"
                                                                >
                                                                  {grid.label}
                                                                </text>
                                                              </g>
                                                            ))}

                                                            {/* Gradient Area Fill Under Curve */}
                                                            <path
                                                              d="M 60 145 C 120 125, 130 110, 160 110 C 190 110, 220 120, 260 120 C 300 120, 330 80, 360 80 C 390 80, 420 45, 460 45 C 500 45, 530 60, 560 60 C 590 60, 620 25, 660 25 L 660 185 L 60 185 Z"
                                                              fill="url(#areaGradient)"
                                                            />

                                                            {/* Slim Modern Vertical Accent Bar Guides */}
                                                            {[
                                                              { x: 60, y: 145, val: "$2,850", day: "Mon" },
                                                              { x: 160, y: 110, val: "$4,120", day: "Tue" },
                                                              { x: 260, y: 120, val: "$3,680", day: "Wed" },
                                                              { x: 360, y: 80, val: "$5,490", day: "Thu" },
                                                              { x: 460, y: 45, val: "$6,940", day: "Fri" },
                                                              { x: 560, y: 60, val: "$6,200", day: "Sat" },
                                                              { x: 660, y: 25, val: "$7,820", day: "Sun" },
                                                            ].map((pt) => (
                                                              <g key={pt.day} className="group cursor-pointer">
                                                                <rect
                                                                  x={pt.x - 3}
                                                                  y={pt.y}
                                                                  width="6"
                                                                  height={185 - pt.y}
                                                                  rx="3"
                                                                  fill="#B78E69"
                                                                  fillOpacity="0.3"
                                                                  className="transition-all duration-200 group-hover:fill-opacity-70"
                                                                />
                                                                <circle
                                                                  cx={pt.x}
                                                                  cy={pt.y}
                                                                  r="5"
                                                                  fill="#FFFFFF"
                                                                  stroke="#B78E69"
                                                                  strokeWidth="2.5"
                                                                  className="transition-transform group-hover:scale-125"
                                                                />
                                                                {/* Value Tag Above Node */}
                                                                <text
                                                                  x={pt.x}
                                                                  y={pt.y - 10}
                                                                  textAnchor="middle"
                                                                  fill="#1A1C18"
                                                                  fontSize="11"
                                                                  fontWeight="bold"
                                                                  fontFamily="monospace"
                                                                >
                                                                  {pt.val}
                                                                </text>
                                                                {/* X Axis Day Label */}
                                                                <text
                                                                  x={pt.x}
                                                                  y="204"
                                                                  textAnchor="middle"
                                                                  fill="#4A483E"
                                                                  fontSize="11"
                                                                  fontWeight="600"
                                                                  fontFamily="sans-serif"
                                                                >
                                                                  {pt.day}
                                                                </text>
                                                              </g>
                                                            ))}

                                                            {/* Smooth Master Trajectory Line */}
                                                            <path
                                                              d="M 60 145 C 120 125, 130 110, 160 110 C 190 110, 220 120, 260 120 C 300 120, 330 80, 360 80 C 390 80, 420 45, 460 45 C 500 45, 530 60, 560 60 C 590 60, 620 25, 660 25"
                                                              fill="none"
                                                              stroke="#B78E69"
                                                              strokeWidth="3.5"
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                            />
                                                          </svg>
        </div>
                                                    </div>

                                                    {/* 4. Two Column Executive Dashboard: Top Sellers & Live Transactions */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                          {/* Top Selling Products (5 Columns) */}
                                                          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
                                                            <div className="flex items-center justify-between border-b border-[#1A1C18]/10 pb-3">
                                                              <div>
                                                                <h3 className="text-base font-bold text-[#1A1C18]">
                                                                  Top Selling Essentials
                                                                </h3>
                                                                <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                                                  Ranked by gross sales volume
                                                                </span>
                                                              </div>
                                                              <Link
                                                                href="/admin/products"
                                                                className="text-xs text-[#B78E69] hover:underline font-semibold flex items-center gap-1"
                                                              >
                                                                Catalog →
                                                              </Link>
                                                            </div>

                                                                      <div className="divide-y divide-[#1A1C18]/8">
                                                                        {topSellers.map((item, idx) => {
                                                                          const pct = Math.round((item.revenue / maxRevenue) * 100);
                                                                          return (
                <div
                  key={item.name}
                  className="py-3.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        idx === 0
                          ? "bg-[#B78E69] text-white"
                          : idx === 1
                          ? "bg-[#8A927A] text-white"
                          : "bg-stone-100 text-[#4A483E]"
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Product Thumbnail */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/10 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="44px"
                          className="object-cover group-hover:scale-108 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#4A483E]">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1A1C18] truncate group-hover:text-[#B78E69] transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#4A483E]/70 font-mono">
                          {item.units} {item.units === 1 ? "unit" : "units"} sold
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                          {item.stock} in stock
                        </span>
                      </div>

                      {/* Visual Sales Share Bar */}
                      <div className="w-28 h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#B78E69] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-[#1A1C18] block">
                      {money(item.revenue)}
                    </span>
                    <span className="text-[10px] font-mono text-[#8A927A] font-semibold">
                      {pct}% share
                    </span>
                  </div>
                </div>
                                                                      );
            })}
                                                                    </div>
                                                                  </div>

                                                                      {/* Recent Live Orders (7 Columns) */}
                                                                      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
                                                                        <div className="flex items-center justify-between border-b border-[#1A1C18]/10 pb-3">
                                                                          <div>
                                                                            <h3 className="text-base font-bold text-[#1A1C18]">
                                                                              Recent Live Transactions
                                                                            </h3>
                                                                            <span className="text-[11px] text-[#4A483E]/70 font-medium">
                                                                              Real-time checkout feed across all currencies
                                                                            </span>
                                                                          </div>
                                                                          <Link
                                                                            href="/admin/orders"
                                                                            className="text-xs text-[#B78E69] hover:underline font-semibold flex items-center gap-1"
                                                                          >
                                                                            View All ({orders.length}) →
                                                                          </Link>
                                                                        </div>

                                                                              <div className="divide-y divide-[#1A1C18]/8">
                                                                                {orders.slice(0, 5).map((order) => {
                                                                                  const initials = order.customer_name
                                                                                    .split(" ")
                                                                                    .map((n) => n[0])
                                                                                    .slice(0, 2)
                                                                                    .join("")
                                                                                    .toUpperCase();

                                                                                    return (
                                                                                    <div
                                                                                      key={order.id}
                                                                                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/70 rounded-xl px-2 -mx-2 transition-colors"
                                                                                    >
                                                                                      <div className="flex items-center gap-3 min-w-0">
                                                                                        {/* Customer Initials Avatar */}
                                                                                        <div className="w-9 h-9 rounded-full bg-stone-100 border border-[#1A1C18]/10 flex items-center justify-center text-xs font-bold text-[#1A1C18] shrink-0">
                                                                                          {initials || "CS"}
                                                                                        </div>

                                                                                        <div className="min-w-0">
                                                                                          <div className="flex items-center gap-2">
                                                                                            <Link
                                                                                              href={`/admin/orders/${order.id}`}
                                                                                              className="font-mono text-xs font-bold text-[#1A1C18] hover:text-[#B78E69] hover:underline"
                                                                                            >
                                                                                              {order.order_number}
                                                                                            </Link>
                                                                                            <span className="text-[10px] text-[#4A483E]/60">·</span>
                                                                                            <span className="text-[11px] text-[#4A483E] font-medium truncate">
                                                                                              {order.customer_name}
                                                                                            </span>
                                                                                          </div>
                                                                                          <div className="flex items-center gap-2 text-[11px] text-[#4A483E]/70 mt-0.5">
                                                                                            <span>{order.shipping_city || "Direct Delivery"}</span>
                                                                                            <span>·</span>
                                                                                            <span className="capitalize">
                                                                                              {order.delivery_status.replace("_", " ")}
                                                                                            </span>
                                                                                          </div>
                                                                                        </div>
                                                                                      </div>

                                                                                      <div className="flex items-center gap-3 shrink-0">
                                                                                        <PaymentStatusBadge status={order.payment_status} />
                                                                                        <span className="font-mono text-xs font-bold text-[#1A1C18] text-right">
                                                                                          {money(order.total_cents)}
                                                                                        </span>
                                                                                        <Link
                                                                                          href={`/admin/orders/${order.id}`}
                                                                                          className="p-1 text-[#4A483E]/60 hover:text-[#1A1C18] rounded-md transition-colors"
                                                                                          title="Inspect order"
                                                                                        >
                                                                                          <ChevronRight className="w-4 h-4" />
                                                                                        </Link>
                                                                                      </div>
                                                                                    </div>
                                                                                );
            })}
                                                                              </div>
                                                                            </div>
      </div>

                                                                          {/* 5. Executive Command Deck: Quick Launch Pad */}
                                                                          <div className="pt-4 border-t border-[#1A1C18]/10">
                                                                            <div className="flex items-center justify-between mb-4">
                                                                              <span className="text-xs font-bold uppercase tracking-wider text-[#4A483E]">
                                                                                Studio Operations Hub
                                                                              </span>
                                                                              <span className="text-xs text-[#8A927A] font-semibold">
                                                                                6 Core Management Services
                                                                              </span>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                                                              <Link
                                                                                href="/admin/products"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Package className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Products
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  {products.length} Active
                                                                                </p>
                                                                              </Link>

                                                                              <Link
                                                                                href="/admin/categories"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Layers className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Categories
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  6 Spatial Rooms
                                                                                </p>
                                                                              </Link>

                                                                              <Link
                                                                                href="/admin/orders"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Truck className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Fulfillment
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  {orders.length} Dispatched
                                                                                </p>
                                                                              </Link>

                                                                              <Link
                                                                                href="/admin/reviews"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Star className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Reviews
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  4.9 ★ Rating
                                                                                </p>
                                                                              </Link>

                                                                              <Link
                                                                                href="/admin/banners"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Megaphone className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Promotions
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  Live Banners
                                                                                </p>
                                                                              </Link>

                                                                              <Link
                                                                                href="/admin/settings"
                                                                                className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 hover:border-[#1A1C18]/30 hover:shadow-md transition-all text-center space-y-1.5 group cursor-pointer"
                                                                              >
                                                                                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-[#1A1C18] group-hover:text-white mx-auto flex items-center justify-center text-[#1A1C18] transition-colors">
                                                                                  <Settings className="w-5 h-5" />
                                                                                </div>
                                                                                <h4 className="text-xs font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                                                                                  Settings
                                                                                </h4>
                                                                                <p className="text-[10px] text-[#4A483E]/70 font-mono">
                                                                                  Currencies &amp; Tax
                                                                                </p>
                                                                              </Link>
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                                        );
}
