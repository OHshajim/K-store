import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, ArrowRight } from "lucide-react";
import { getStoreSettings } from "@/lib/data/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy — Kstore Modern Living",
  description:
    "Learn how Kstore protects your personal data, secures your payment information, and honors your privacy across our architectural home catalog.",
};

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const storeName = settings?.store_name || "Kstore International";
  const supportEmail = settings?.support_email || "concierge@kstore.com";

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#1A1C18]/10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-mono font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B78E69]" />
          <span>Data Protection &amp; Client Privacy</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans">
          Our uncompromising pledge to protect your personal information, communications, and digital transactions at {storeName}.
        </p>
      </div>

      {/* 2. Key Pillars Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <Lock className="w-5 h-5 text-[#8A927A]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">End-to-End Encryption</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            All checkout transactions, credentials, and order histories are encrypted via TLS 1.3 and modern cryptographic standards.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <EyeOff className="w-5 h-5 text-[#B78E69]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">Zero Third-Party Data Sales</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            We never monetize, sell, or rent your contact details or browsing behaviors to advertising brokers. Ever.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <ShieldCheck className="w-5 h-5 text-[#8A927A]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">Full Subscriber Control</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Unsubscribe instantly with a single click from any dispatch, or request complete account erasure anytime.
          </p>
        </div>
      </div>

      {/* 3. Document Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1C18]/10 shadow-xs space-y-8 text-xs sm:text-sm text-[#4A483E] leading-relaxed">
        {settings?.privacy_html ? (
          <div
            className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: settings.privacy_html }}
          />
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                1. Information We Collect
              </h2>
              <p>
                When you interact with {storeName}, we collect only the information essential to providing exceptional architectural products and white-glove customer care:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#4A483E]/85">
                <li>
                  <strong>Direct Subscriptions:</strong> Your email address when subscribing to The Weekly Dispatch, seasonal furniture release previews, or architectural essays.
                </li>
                <li>
                  <strong>Commercial Fulfillment:</strong> Your name, delivery address, phone number, and billing details when purchasing furniture or design accessories.
                </li>
                <li>
                  <strong>Client Accounts:</strong> Saved preferences, room dimensions submitted to our {storeName} Fit Assistant, wishlists, and order verification history.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                2. How We Utilize Your Data
              </h2>
              <p>
                Your information serves strictly operational purposes: processing your orders, coordinating white-glove delivery couriers, notifying you of tracking milestones, and delivering curated design newsletters you explicitly opted into. We do not engage in behavioral cross-site retargeting or unprompted third-party promotional campaigns.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                3. Local Storage, Cookies &amp; Session Preferences
              </h2>
              <p>
                We utilize essential first-party cookies and browser local storage strictly to preserve your active shopping bag, wishlist items, and authenticated session. You can manage or disable cookie preferences via your browser settings at any time without forfeiting access to our public catalog.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                4. Email Dispatches &amp; Instant Opt-Out
              </h2>
              <p>
                Every newsletter or product preview email dispatched by {storeName} incorporates an automated, one-click unsubscribe mechanism in its footer. Upon confirming unsubscription, your email is immediately expunged from our marketing dispatch queue. You may also email{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-[#1A1C18] font-semibold underline hover:text-[#B78E69]"
                >
                  {supportEmail}
                </a>{" "}
                with the subject &ldquo;Unsubscribe&rdquo; or &ldquo;Data Deletion Request&rdquo; to have all personal records permanently deleted.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1A1C18] font-editorial">
                5. Payment Processing &amp; Security Compliance
              </h2>
              <p>
                Payment transactions are conducted securely through PCI-DSS Level 1 certified gateways including Stripe and major credit card networks. {storeName} never stores, records, or has direct access to raw credit card numbers or banking security codes on our servers.
              </p>
            </section>
          </>
        )}

        <div className="pt-6 border-t border-[#1A1C18]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A927A]">
          <span>Effective Date: November 2026 · {storeName} Privacy Office</span>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-[#1A1C18] font-semibold hover:text-[#B78E69] transition-colors inline-flex items-center gap-1"
            >
              <span>View Terms &amp; Conditions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
