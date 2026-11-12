import Link from "next/link";
import { ArrowLeft, ShieldAlert, Sparkles } from "lucide-react";
import { getOrderByTracking } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/catalog";
import { OrderDetailView } from "@/components/store/OrderDetailView";

export const dynamic = "force-dynamic";

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<{ t?: string }>;

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orderNumber } = await params;
  const { t } = await searchParams;
  const [order, settings] = await Promise.all([
    getOrderByTracking(orderNumber, t ?? ""),
    getStoreSettings(),
  ]);

  if (!order || !settings) {
    return (
      <div className="py-20 px-4 sm:px-6 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#B78E69]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#8A927A] font-bold">
            Security &amp; Tracking Verification
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1C18]">
            Tracking Pass Expired or Invalid
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 max-w-md mx-auto leading-relaxed">
            Order #{orderNumber} could not be retrieved with the provided capability token. Please verify the link from your confirmation email or log in to your account.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orders"
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs"
          >
            <span style={{ color: "#FFFFFF" }}>View Your Account Orders</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-[75vh]">
      {/* Back to store navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A483E] hover:text-[#1A1C18] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
        <span className="text-xs font-mono text-[#8A927A] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#B78E69]" />
          Verified Secure Tracking
        </span>
      </div>

      <OrderDetailView order={order} settings={settings} trackingToken={t} />
    </div>
  );
}
