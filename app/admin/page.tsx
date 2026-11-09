import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
  Layers,
  Settings,
} from "lucide-react";
import { getAllOrders } from "@/lib/data/orderAdmin";
import { getProducts, getStoreSettings } from "@/lib/data/catalog";
import { formatMoney, formatDate } from "@/lib/format";
import { PaymentStatusBadge, DeliveryStatusText } from "@/components/shared/StatusBadge";
import type { Order } from "@/lib/types";

export default async function AdminDashboardPage() {
  const [orders, products, settings] = await Promise.all([
    getAllOrders(),
    getProducts(),
    getStoreSettings(),
  ]);

  const money = (cents: number) =>
    formatMoney(cents, settings?.currency_symbol ?? "$", settings?.currency ?? "USD");

  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_cents, 0);

  const pendingOrders = orders.filter(
    (o) => o.delivery_status === "pending" || o.delivery_status === "confirmed"
  ).length;

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // Compute top sellers
  const salesMap = new Map<string, { name: string; units: number; revenue: number; image?: string }>();
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const existing = salesMap.get(item.product_name) ?? {
        name: item.product_name,
        units: 0,
        revenue: 0,
        image: item.image_url ?? undefined,
      };
      existing.units += item.quantity;
      existing.revenue += item.unit_price_cents * item.quantity;
      salesMap.set(item.product_name, existing);
    }
  }

  const topSellers = Array.from(salesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-10 p-6 sm:p-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292B27]/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-1">
            Studio Administration
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#292B27]">
            Store Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#77766E] mt-1">
            Real-time fulfillment metrics, inventory thresholds, and commercial revenue.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#292B27] text-white text-xs font-semibold rounded-xl hover:bg-[#3d403a] transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white border border-[#292B27]/20 text-[#292B27] text-xs font-semibold rounded-xl hover:bg-[#F4F0E8] transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-[#292B27]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#77766E]">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Paid Revenue</span>
            <div className="p-2 rounded-lg bg-[#8A927A]/15 text-[#8A927A]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#292B27]">
            {money(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8A927A] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs previous 30 days</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#292B27]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#77766E]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Dispatched Orders</span>
            <div className="p-2 rounded-lg bg-[#B78E69]/15 text-[#B78E69]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#292B27]">
            {orders.length}
          </div>
          <div className="text-[11px] text-[#77766E]">
            {orders.filter((o) => !o.user_id).length} guest checkouts
          </div>
        </div>

        {/* Active Products */}
        <div className="p-6 rounded-2xl bg-white border border-[#292B27]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#77766E]">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
            <div className="p-2 rounded-lg bg-[#292B27]/10 text-[#292B27]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#292B27]">
            {products.length} Products
          </div>
          <div className="text-[11px] text-[#77766E]">
            Across 6 Scandinavian categories
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl bg-white border border-[#292B27]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#77766E]">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Warnings</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-800">
            {lowStockProducts.length} Items
          </div>
          <div className="text-[11px] text-[#77766E]">
            Stock &lt; 10 units threshold
          </div>
        </div>
      </div>

      {/* Visual Revenue Trajectory Trend Bars */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-xl font-bold text-[#292B27]">
              Commercial Revenue Performance
            </h3>
            <p className="text-xs text-[#77766E]">
              Demonstrating steady sales trajectory across North American and European markets.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-[#8A927A] bg-[#8A927A]/15 px-3 py-1 rounded-full">
            Target Pace: Healthy
          </div>
        </div>

        {/* Visual Graph Representation */}
        <div className="pt-4 grid grid-cols-7 gap-3 items-end h-48 border-b border-[#292B27]/10 pb-4">
          {[
            { day: "Mon", height: "45%", val: "$2,850" },
            { day: "Tue", height: "60%", val: "$4,120" },
            { day: "Wed", height: "55%", val: "$3,680" },
            { day: "Thu", height: "75%", val: "$5,490" },
            { day: "Fri", height: "90%", val: "$6,940" },
            { day: "Sat", height: "85%", val: "$6,200" },
            { day: "Sun", height: "100%", val: "$7,820" },
          ].map((bar) => (
            <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-mono font-bold text-[#77766E] opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.val}
              </span>
              <div
                className="w-full bg-[#D8C9B5] group-hover:bg-[#8A927A] rounded-t-lg transition-all"
                style={{ height: bar.height }}
              />
              <span className="text-xs font-mono text-[#77766E]">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Top Sellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top Sellers (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#292B27]/10 pb-3">
            <h3 className="font-editorial text-xl font-bold text-[#292B27]">
              Top Revenue Generators
            </h3>
            <span className="text-xs text-[#77766E] font-mono">By Sales Volume</span>
          </div>

          <div className="divide-y divide-[#292B27]/10">
            {topSellers.map((item, idx) => (
              <div key={item.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-mono font-bold text-[#77766E]">
                    0{idx + 1}
                  </span>
                  <div className="truncate">
                    <h5 className="text-xs font-semibold text-[#292B27] truncate">
                      {item.name}
                    </h5>
                    <p className="text-[11px] text-[#77766E] font-mono">
                      {item.units} units fulfilled
                    </p>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[#292B27]">
                  {money(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#292B27]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#292B27]/10 pb-3">
            <h3 className="font-editorial text-xl font-bold text-[#292B27]">
              Recent Live Transactions
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-[#B78E69] hover:underline font-semibold flex items-center gap-1"
            >
              View All Orders ({orders.length}) →
            </Link>
          </div>

          <div className="divide-y divide-[#292B27]/10 overflow-x-auto">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono font-bold text-[#292B27] hover:text-[#B78E69] hover:underline block"
                  >
                    {order.order_number}
                  </Link>
                  <p className="text-[11px] text-[#77766E] truncate max-w-xs">
                    {order.customer_name} ({order.shipping_city})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <PaymentStatusBadge status={order.payment_status} />
                  <span className="font-mono font-bold text-[#292B27]">
                    {money(order.total_cents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Launch Pad */}
      <div className="pt-4 border-t border-[#292B27]/10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#77766E] block mb-4">
          Management Modules
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/admin/products"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <Package className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Products</h4>
            <p className="text-[10px] text-[#77766E]">Catalog & Inventory</p>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <Layers className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Categories</h4>
            <p className="text-[10px] text-[#77766E]">6 Spatial Rooms</p>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <ShoppingBag className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Orders</h4>
            <p className="text-[10px] text-[#77766E]">Fulfillment Pipeline</p>
          </Link>

          <Link
            href="/admin/users"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <Users className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Customers</h4>
            <p className="text-[10px] text-[#77766E]">User Directory</p>
          </Link>

          <Link
            href="/admin/reviews"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <Star className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Reviews</h4>
            <p className="text-[10px] text-[#77766E]">Moderation Queue</p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl bg-white border border-[#292B27]/10 hover:border-[#292B27]/40 hover:bg-[#F4F0E8]/50 transition-all text-center space-y-1.5"
          >
            <Settings className="w-5 h-5 mx-auto text-[#292B27]" />
            <h4 className="text-xs font-bold text-[#292B27]">Settings</h4>
            <p className="text-[10px] text-[#77766E]">Rates & Policies</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
