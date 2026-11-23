import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { requireStoreSettings, getCategories } from "@/lib/data/catalog";
import { StoreShell } from "@/components/store/StoreShell";
import { OrderLookupTracker } from "@/components/store/OrderLookupTracker";

export const dynamic = "force-dynamic";

export default async function TrackLandingPage() {
  const [settings, categories] = await Promise.all([
    requireStoreSettings(),
    getCategories(),
  ]);

  return (
    <StoreShell
      storeName={settings.store_name}
      tagline={settings.tagline}
      supportEmail={settings.support_email}
      logoUrl={settings.logo_url}
      categories={categories}
    >
      <div className="max-w-4xl mx-auto py-12 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-8 min-h-[70vh]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1A1C18] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1A1C18] font-bold">Track Shipment</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] font-sans">
            Client Logistics Portal
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
            Track Your Dispatch
          </h1>
          <p className="text-sm text-[#4A483E] leading-relaxed">
            Enter your unique order reference code and the customer email associated with your commission to view real-time fulfillment and milestone history.
          </p>
        </div>

        {/* Tracker Form Component */}
        <div className="pt-4">
          <OrderLookupTracker />
        </div>

        {/* Assurance badges */}
        <div className="pt-8 border-t border-[#1A1C18]/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-[#4A483E]">
          <div className="space-y-1">
            <span className="font-bold text-[#1A1C18] block font-mono uppercase">Full Milestone Visibility</span>
            <p className="text-[11px] text-[#77766E]">Live updates from Småland fulfillment studio to doorstep.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#1A1C18] block font-mono uppercase">Capability Token Security</span>
            <p className="text-[11px] text-[#77766E]">Anti-imposter security protects customer privacy.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#1A1C18] block font-mono uppercase">Concierge Assistance</span>
            <p className="text-[11px] text-[#77766E]">Need rerouting or scheduling? Reach our concierge team anytime.</p>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
