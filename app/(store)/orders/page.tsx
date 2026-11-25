import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getOrdersForUser } from "@/lib/data/orders";
import { OrdersList } from "@/components/store/OrdersList";
import { OrderLookupTracker } from "@/components/store/OrderLookupTracker";
import { LogIn, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const settings = await requireStoreSettings();

  const orders = user ? await getOrdersForUser(user.id, user.email) : [];

  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-10 min-h-[75vh]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#1A1C18] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#1A1C18] font-bold">Track &amp; Orders</span>
      </div>

      {/* Header */}
      <div className="border-b border-[#1A1C18]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] block mb-2 font-sans">
            Client Logistics
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
            Order Tracking &amp; History
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 font-sans">
            Track real-time fulfillment milestones, dispatch routes, and digital purchase receipts.
          </p>
        </div>

        {!user && (
          <Link
            href="/login?next=/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#FAF9F6] transition-all shadow-2xs self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Sign In to Your Account</span>
          </Link>
        )}
      </div>

      {/* 1. Instant Lookup Form (Always available to guests and registered users) */}
      <OrderLookupTracker />

      {/* 2. Registered Account Order History (If signed in) */}
      {user ? (
        <div className="space-y-4 pt-6 border-t border-[#1A1C18]/10">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold text-[#1A1C18]">
              Your Account Orders
            </h2>
            <span className="text-xs font-mono text-[#8A927A]">
              {orders.length} {orders.length === 1 ? "order" : "orders"} on file
            </span>
          </div>

          <OrdersList orders={orders} settings={settings} />
        </div>
      ) : (
        /* Guest Guidance Notice */
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-[#1A1C18]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-sm font-bold text-[#1A1C18] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B78E69]" />
              Checked out as a guest?
            </h3>
            <p className="text-xs text-[#4A483E]/80 leading-relaxed">
              Your tracking reference (e.g. <span className="font-mono font-bold text-[#1A1C18]">KS-XXXXXXXX</span>) was provided on your post-checkout screen and sent to your email. Enter it above to view full white-glove status without needing a password.
            </p>
          </div>

          <Link
            href="/login?next=/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B78E69] hover:underline shrink-0"
          >
            <span>Access Customer Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
