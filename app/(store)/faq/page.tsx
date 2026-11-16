import type { Metadata } from "next";
import {
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Compass,
  Mail,
} from "lucide-react";
import { getStoreSettings } from "@/lib/data/catalog";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const storeName = settings?.store_name || "Kstore Modern Living";
  return {
    title: `Frequently Asked Questions (FAQ) — ${storeName}`,
    description: `Discover answers regarding white-glove shipping, solid oak timber maintenance, our 30-day in-home trial, and 10-year craft warranty at ${storeName}.`,
  };
}

const DEFAULT_FAQ_CATEGORIES = [
  {
    category: "White-Glove Shipping & Fulfillment",
    icon: Truck,
    questions: [
      {
        q: "What are your delivery schedules and shipping rates?",
        a: "We provide complimentary white-glove shipping on all orders over $150 across the United States, Canada, and the United Kingdom. For smaller orders, a flat delivery rate of $15 is calculated at checkout. In-stock timber furnishings typically arrive within 4 to 8 business days.",
      },
      {
        q: "How does white-glove home delivery work?",
        a: "Our logistics couriers contact you 24 hours prior to schedule a 2-hour delivery window. Our team unpacks your furniture in your room of choice, inspects all joinery tolerances, and removes all protective packaging for eco-responsible recycling.",
      },
      {
        q: "Can I inspect tracking milestones in real time?",
        a: "Yes. Every order generates a persistent tracking permalink and tracking token. You can track real-time courier milestones anytime via our live tracking portal or your patron account dashboard.",
      },
    ],
  },
  {
    category: "Organic Timber & Material Care",
    icon: Compass,
    questions: [
      {
        q: "Where is your timber sourced, and is it FSC-certified?",
        a: "100% of our architectural timber is sustainably harvested and FSC-certified from regenerative forests in North America and Scandinavia. We work exclusively with kiln-dried solid white oak, plantation teak, and European ash.",
      },
      {
        q: "How should I maintain and clean solid oak furniture?",
        a: "Dust gently using a dry, soft microfiber cloth. For deeper cleansing, wipe along the grain with a slightly damp cloth and mild natural soap. Avoid harsh chemical polishes, acetone, or abrasive scrubbers. We recommend conditioning with organic beeswax twice yearly.",
      },
      {
        q: "Are natural timber knots and grain variations normal?",
        a: "Yes. Because every tree develops its own organic signature, subtle variations in grain direction, medullary rays, and warm honey undertones are authentic hallmarks of genuine solid timber.",
      },
    ],
  },
  {
    category: "30-Day In-Home Trial & Returns",
    icon: RotateCcw,
    questions: [
      {
        q: "How does the 30-day in-home trial work?",
        a: "We encourage you to live with our pieces in your natural light for 30 full days. If an essential does not completely harmonize with your space, contact our concierge to schedule a complimentary pickup. We provide a 100% refund to your original payment method.",
      },
      {
        q: "What condition must returned items be in?",
        a: "Items must remain in clean, unblemished condition free of structural damage or liquid stains. Our couriers provide pickup crates, so you do not need to save bulky original boxes.",
      },
    ],
  },
  {
    category: "10-Year Craft Warranty",
    icon: ShieldCheck,
    questions: [
      {
        q: "What does the 10-year craft warranty cover?",
        a: "Our warranty covers all structural mortise-and-tenon joinery, internal hardware, soft-close drawer runners, and natural timber frame integrity under normal residential usage for 10 years from the delivery date.",
      },
      {
        q: "How do I file a warranty service request?",
        a: "Email our concierge with your order number and 2 to 3 photos of the affected piece. A master craftsman will evaluate the piece and arrange on-site repair, full replacement, or store credit within 48 hours.",
      },
    ],
  },
];

export default async function FaqPage() {
  const settings = await getStoreSettings();
  const storeName = settings?.store_name || "Kstore International";
  const supportEmail = settings?.support_email || "concierge@kstore.com";

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#1A1C18]/10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-mono font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#B78E69]" />
          <span>Client Concierge &amp; Inquiries</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans">
          Thoughtful answers regarding our white-glove logistics, timber joinery, 30-day trials, and sustainable craftsmanship at {storeName}.
        </p>
      </div>

      {/* 2. Key Pillars Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <Truck className="w-5 h-5 text-[#8A927A]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">White-Glove Delivery</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Unpacked in your room of choice with zero packaging waste left behind.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <RotateCcw className="w-5 h-5 text-[#B78E69]" />
          <h3 className="text-sm font-bold text-[#1A1C18]">30-Day In-Home Trial</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Live with our furnishings in your own natural light. Seamless complimentary returns.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-[#1A1C18]">10-Year Craft Warranty</h3>
          <p className="text-xs text-[#4A483E]/70 leading-relaxed">
            Kiln-dried solid hardwoods and precision joinery engineered to endure for decades.
          </p>
        </div>
      </div>

      {/* 3. Document Body: Admin Custom HTML or Default Categorized FAQ */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1C18]/10 shadow-xs space-y-10">
        {settings?.faq_html ? (
          <div
            className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: settings.faq_html }}
          />
        ) : (
          <div className="space-y-10">
            {DEFAULT_FAQ_CATEGORIES.map((catGroup) => {
              const Icon = catGroup.icon;
              return (
                <div key={catGroup.category} className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#1A1C18]/10">
                    <Icon className="w-4 h-4 text-[#B78E69]" />
                    <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1A1C18]">
                      {catGroup.category}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {catGroup.questions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#1A1C18]/8 space-y-2 transition-all hover:bg-[#F4F0E8]/50"
                      >
                        <h3 className="text-sm font-bold text-[#1A1C18] flex items-start gap-2">
                          <span className="text-[#B78E69] font-mono text-xs mt-0.5">Q:</span>
                          <span>{item.q}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4A483E]/85 leading-relaxed pl-5 font-sans">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Contact Concierge Card */}
        <div className="p-6 rounded-2xl bg-[#F4F0E8] border border-[#1A1C18]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1A1C18] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#B78E69]" />
              Still have questions about room fit or styling?
            </h4>
            <p className="text-xs text-[#4A483E]/80">
              Our design concierge responds within 24 business hours to assist with spatial advice.
            </p>
          </div>
          <a
            href={`mailto:${supportEmail}`}
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#32362F] transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <span style={{ color: "#FFFFFF" }}>Contact Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
