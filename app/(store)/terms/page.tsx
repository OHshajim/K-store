import type { Metadata } from "next";
import Link from "next/link";
import { Truck, RotateCcw, Award, ArrowRight } from "lucide-react";
import { getStoreSettings } from "@/lib/data/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms & Conditions — Kstore Modern Living",
  description:
    "Review our transparent terms of purchase, white-glove delivery, 30-day in-home trial, and 10-year craft warranty.",
};

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const storeName = settings?.store_name || "Kstore International";

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#1A1C18]/10 max-w-2xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B78E69] font-bold">
          Studio Guidelines &amp; Client Agreement
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans">
          The foundational principles of acquiring, enjoying, and preserving living essentials from {storeName}.
        </p>
      </div>

      {/* 2. Key Pillars Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <Truck className="w-5 h-5 text-[#8A927A]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">White-Glove Delivery</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Carefully dispatched in custom protective crates across US, CA, and Europe.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <RotateCcw className="w-5 h-5 text-[#B78E69]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">30-Day In-Home Trial</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Experience our timber pieces in your own natural light. Easy returns if not completely suited.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <Award className="w-5 h-5 text-[#8A927A]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">10-Year Craft Warranty</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Kiln-dried solid timber and structural joinery engineered to endure for generations.
          </p>
        </div>
      </div>

      {/* 3. Document Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1C18]/10 shadow-xs space-y-8 text-xs sm:text-sm text-[#4A483E] leading-relaxed">
        {settings?.terms_html ? (
          <div
            className="prose prose-stone max-w-none text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: settings.terms_html }}
          />
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                1. Acquisition &amp; Commercial Orders
              </h2>
              <p>
                By placing an order through the {storeName} digital catalog, you confirm you are at least 18 years of age and authorized to execute payment. All orders are subject to availability and verification. We reserve the right to decline or cancel orders if fraud or inventory discrepancies are identified.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                2. Natural Material Characteristics
              </h2>
              <p>
                Our collections utilize quarter-sawn solid white oak, plantation teak, natural stonewares, and spun metals. Because timber and stone are living organic materials, subtle variations in grain pattern, medullary rays, knots, and tonal warmth are natural signatures of authenticity, not defects.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                3. Dispatch, Tracking &amp; Delivery
              </h2>
              <p>
                Complimentary shipping is extended to orders meeting our published thresholds. Standard delivery schedules range between 3 to 7 business days. Real-time fulfillment milestones are published to your customer account and verified tracking URLs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                4. 30-Day Returns &amp; Warranty Claim Procedure
              </h2>
              <p>
                If an essential does not harmonize with your interior space, initiate a return within 30 days of delivery receipt. Items must be in original condition with accompanying hardware and packaging. For warranty assessments regarding timber integrity or structural joinery, contact our concierge studio.
              </p>
            </section>
          </>
        )}

        <div className="pt-6 border-t border-[#1A1C18]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A927A]">
          <span>Effective Date: November 2026 · {storeName} Legal</span>
          <Link
            href="/about"
            className="text-[#1A1C18] font-semibold hover:text-[#B78E69] transition-colors inline-flex items-center gap-1"
          >
            <span>Learn About Our Studio Philosophy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
