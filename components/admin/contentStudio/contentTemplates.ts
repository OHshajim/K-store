import type { FaqItem } from "@/lib/types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInline(str: string): string {
  // Bold **text**
  let result = str.replace(/\*\*(.*?)\*\*/g, "<strong class=\"font-bold text-[#1A1C18]\">$1</strong>");
  // Italic *text*
  result = result.replace(/\*(.*?)\*/g, "<em class=\"italic\">$1</em>");
  // Code `text`
  result = result.replace(/`(.*?)`/g, "<code class=\"font-mono px-1.5 py-0.5 rounded bg-[#F4F0E8] text-[#1A1C18] text-xs\">$1</code>");
  return result;
}

/**
 * Converts non-technical plain text / simple markdown into beautiful, styled storefront HTML
 */
export function friendlyTextToHtml(text: string): string {
  if (!text || !text.trim()) return "";

  // If text already contains full HTML blocks, preserve as-is
  if (/<(p|div|h[1-6]|ul|ol|table|section|blockquote)[^>]*>/i.test(text)) {
    return text.trim();
  }

  const blocks = text.split(/\n\s*\n/);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Heading 3
    if (/^###\s+(.+)$/m.test(trimmed)) {
      const heading = trimmed.replace(/^###\s+/, "");
      htmlBlocks.push(
        `<h4 class="font-editorial text-lg font-bold text-[#1A1C18] mt-6 mb-2">${formatInline(
          heading
        )}</h4>`
      );
      continue;
    }

    // Heading 2
    if (/^##\s+(.+)$/m.test(trimmed)) {
      const heading = trimmed.replace(/^##\s+/, "");
      htmlBlocks.push(
        `<h3 class="font-editorial text-xl font-bold text-[#1A1C18] mt-8 mb-3">${formatInline(
          heading
        )}</h3>`
      );
      continue;
    }

    // Heading 1
    if (/^#\s+(.+)$/m.test(trimmed)) {
      const heading = trimmed.replace(/^#\s+/, "");
      htmlBlocks.push(
        `<h2 class="font-editorial text-2xl font-bold text-[#1A1C18] mt-8 mb-4">${formatInline(
          heading
        )}</h2>`
      );
      continue;
    }

    // Bullet List (lines starting with - or *)
    if (/^[-*]\s+/m.test(trimmed)) {
      const items = trimmed
        .split(/\n/)
        .map((l) => l.trim())
        .filter((l) => /^[-*]\s+/.test(l))
        .map((l) => l.replace(/^[-*]\s+/, ""))
        .map((l) => `<li>${formatInline(l)}</li>`)
        .join("");
      htmlBlocks.push(
        `<ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#4A483E]/85 my-4">${items}</ul>`
      );
      continue;
    }

    // Quote / Callout (lines starting with >)
    if (/^>\s+/m.test(trimmed)) {
      const quote = trimmed.replace(/^>\s+/gm, "").trim();
      htmlBlocks.push(
        `<blockquote class="p-4 my-4 rounded-2xl bg-[#F4F0E8] border-l-4 border-[#B78E69] text-xs sm:text-sm italic text-[#1A1C18] font-serif leading-relaxed">${formatInline(
          quote
        )}</blockquote>`
      );
      continue;
    }

    // Standard paragraph
    htmlBlocks.push(
      `<p class="text-xs sm:text-sm leading-relaxed text-[#4A483E] mb-4">${formatInline(
        trimmed
      )}</p>`
    );
  }

  return htmlBlocks.join("\n");
}

/**
 * Converts stored HTML back into clean, friendly text for non-tech editing
 */
export function htmlToFriendlyText(html: string): string {
  if (!html) return "";
  let text = html;

  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  text = text.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**");
  text = text.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*");
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

/**
 * Compiles visual FAQ cards into categorized, accessible storefront HTML
 */
export function compileFaqHtml(items: FaqItem[]): string {
  if (!items || items.length === 0) return "";

  const categories = Array.from(
    new Set(items.map((i) => i.category?.trim() || "General Concierge"))
  );

  const categoryBlocks = categories.map((cat) => {
    const catItems = items.filter(
      (i) => (i.category?.trim() || "General Concierge") === cat
    );

    const questionsHtml = catItems
      .map(
        (item) => `
        <div class="p-5 rounded-2xl bg-[#FAF9F6] border border-[#1A1C18]/8 space-y-2 transition-all hover:bg-[#F4F0E8]/50">
          <h3 class="text-sm font-bold text-[#1A1C18] flex items-start gap-2">
            <span class="text-[#B78E69] font-mono text-xs mt-0.5 font-bold">Q:</span>
            <span>${escapeHtml(item.question)}</span>
          </h3>
          <p class="text-xs sm:text-sm text-[#4A483E]/85 leading-relaxed pl-5 font-sans">
            ${escapeHtml(item.answer)}
          </p>
        </div>`
      )
      .join("");

    return `
      <div class="space-y-4 mb-8">
        <div class="flex items-center gap-2.5 pb-2 border-b border-[#1A1C18]/10">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#8A927A]">${escapeHtml(
            cat
          )}</span>
        </div>
        <div class="space-y-4">
          ${questionsHtml}
        </div>
      </div>`;
  });

  return `<div class="space-y-8">${categoryBlocks.join("")}</div>`;
}

/**
 * Extracts FaqItems from an existing HTML string if available
 */
export function parseFaqItemsFromHtml(html: string): FaqItem[] {
  if (!html) return [];
  const items: FaqItem[] = [];

  // Match <h3>...</h3> followed by <p>...</p>
  const regex = /<h3[^>]*>(?:<span[^>]*>[\s\S]*?<\/span>)?\s*([\s\S]*?)\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const rawQ = match[1].replace(/<[^>]+>/g, "").trim();
    const rawA = match[2].replace(/<[^>]+>/g, "").trim();
    if (rawQ && rawA) {
      items.push({
        question: rawQ,
        answer: rawA,
        category: "General Concierge",
      });
    }
  }

  return items;
}

// -------------------------------------------------------------
// PRODUCTION TEMPLATES (Non-Tech Ready)
// -------------------------------------------------------------

export function getProductionBrandStoryTemplate(storeName: string): string {
  return `${storeName} was founded on a simple conviction: the physical objects that populate our daily rituals should bring enduring calm, effortless utility, and architectural stillness to the modern dwelling.

Frustrated by disposable flat-pack furniture that degraded after two moves, and luxury design galleries priced beyond reason, we set out to build an honest bridge. We collaborate directly with multi-generational timber workshops in Småland, Sweden, and Vermont, USA.

Every millimeter of our furniture is engineered against sensory distraction. From concealed wire channels to whisper-soft drawer runners, our pieces quiet the home environment.

## Our Three Foundational Commitments:
- **100% FSC-Certified Hardwoods:** We harvest exclusively from regenerative forests, working in kiln-dried solid white oak, plantation teak, and European ash. Never synthetic veneer or disposable fiberboard.
- **Direct Workshop Craft:** By bypassing wholesale markups and third-party distributors, we reinvest directly into master joinery, non-toxic plant-based finishes, and carbon-neutral transit.
- **Ten-Year Enduring Life:** We engineer each joint with mortise-and-tenon integrity so that our pieces become family heirlooms rather than landfill waste.

> "Good design is not what you add, but what can no longer be removed to achieve perfect stillness." — ${storeName} Design Studio`;
}

export function getProductionFaqTemplate(
  storeName: string,
  supportEmail: string = "concierge@kstore.com"
): FaqItem[] {
  return [
    {
      category: "White-Glove Shipping & Fulfillment",
      question: "What are your delivery schedules and shipping rates?",
      answer: `We provide complimentary white-glove shipping on all orders over $150 across the United States, Canada, and the United Kingdom. For smaller parcels, a flat delivery fee of $15 applies at checkout. In-stock timber furnishings typically arrive within 4 to 8 business days.`,
    },
    {
      category: "White-Glove Shipping & Fulfillment",
      question: "How does white-glove home placement work?",
      answer: `Our specialized couriers contact you 24 hours prior to schedule a 2-hour delivery window. Our team unpacks your furniture in your room of choice, inspects all joinery tolerances, and removes all protective packaging for eco-responsible recycling.`,
    },
    {
      category: "White-Glove Shipping & Fulfillment",
      question: "Can I inspect tracking milestones in real time?",
      answer: `Yes. Every order generates a persistent tracking permalink and tracking token. You can track real-time courier milestones anytime via our live tracking portal or your patron account dashboard.`,
    },
    {
      category: "Organic Timber & Material Care",
      question: "Where is your timber sourced, and is it FSC-certified?",
      answer: `100% of our architectural timber is sustainably harvested and FSC-certified from regenerative forests in North America and Scandinavia. We work exclusively with kiln-dried solid white oak, plantation teak, and European ash.`,
    },
    {
      category: "Organic Timber & Material Care",
      question: "How should I maintain and clean solid oak furniture?",
      answer: `Dust gently using a dry, soft microfiber cloth. For deeper cleansing, wipe along the grain with a slightly damp cloth and mild natural soap. Avoid harsh chemical polishes, acetone, or abrasive scrubbers. We recommend conditioning with organic beeswax twice yearly.`,
    },
    {
      category: "30-Day In-Home Trial & Returns",
      question: "How does the 30-day in-home trial work?",
      answer: `We encourage you to live with our pieces in your natural light for 30 full days. If an essential does not completely harmonize with your space, contact our concierge (${supportEmail}) to schedule a complimentary pickup. We provide a 100% refund to your original payment method.`,
    },
    {
      category: "30-Day In-Home Trial & Returns",
      question: "What condition must returned items be in?",
      answer: `Items must remain in clean, unblemished condition free of structural damage or liquid stains. Our couriers provide pickup crates, so you do not need to save bulky original boxes.`,
    },
    {
      category: "10-Year Craft Warranty",
      question: "What does the 10-year craft warranty cover?",
      answer: `Our warranty covers all structural mortise-and-tenon joinery, internal hardware, soft-close drawer runners, and natural timber frame integrity under normal residential usage for 10 years from the delivery date.`,
    },
  ];
}

export function getProductionPrivacyTemplate(
  storeName: string,
  supportEmail: string = "concierge@kstore.com"
): string {
  return `At ${storeName}, client privacy and data integrity are fundamental principles. This document outlines how we collect, safeguard, and respect your personal information across our storefront, fit assistant, and white-glove logistics.

## 1. Information We Collect
We collect only the information essential to providing exceptional architectural home goods:
- **Order & Delivery Details:** Your full name, delivery address, phone number, and email address to coordinate white-glove couriers and delivery alerts.
- **Secure Payment Information:** Payment credentials are processed directly through Stripe's certified Level 1 PCI-DSS infrastructure. We never store or view your full credit card numbers.
- **Spatial Dimensions (Fit Assistant):** Nook and room dimensions provided in the Fit Assistant are used exclusively in real time to calculate ergonomic clearances and are never sold.

## 2. Zero Third-Party Data Broker Sales
We maintain an uncompromising anti-tracking pledge:
- We never sell, monetize, rent, or trade your personal information, contact records, or browsing habits to third-party data brokers or advertising networks. Ever.

## 3. Cryptographic Security Standards
- All storefront interactions, credentials, and financial checkouts are encrypted using modern TLS 1.3 cryptographic protocols with HSTS enforcement.

## 4. Your Client Rights & Data Portability
- You possess the absolute right to inspect the personal data we store, request immediate correction, or request complete account erasure.
- To request data deletion or privacy inquiries, contact our Privacy Concierge anytime at **${supportEmail}**.`;
}

export function getProductionTermsTemplate(
  storeName: string,
  supportEmail: string = "concierge@kstore.com"
): string {
  return `Welcome to ${storeName}. These terms govern the acquisition, delivery, trial, and preservation of living essentials purchased through our catalog.

## 1. Acquisition & Commercial Orders
- By placing an order, you confirm you are at least 18 years of age and authorized to execute payment.
- All acquisitions are subject to stock availability and address verification. If any discrepancy occurs, our concierge will notify you within 24 hours.

## 2. Natural Material Characteristics
- Every piece of timber develops its own organic fingerprint. Natural variations in grain orientation, medullary rays, and warm honey undertones are authentic hallmarks of genuine solid hardwood, not manufacturing defects.

## 3. White-Glove Logistics & Inspection Protocols
- Timber furnishings are delivered via specialized white-glove couriers.
- Our team will place the piece in your room of choice and inspect joinery tolerances alongside you before completing sign-off.
- Any transit damage noted during unboxing will be resolved immediately with a priority replacement or repair.

## 4. 30-Day Complimentary In-Home Trial
- We encourage you to experience our pieces in your natural living environment for 30 full days.
- If you decide the piece does not suit your space, contact **${supportEmail}** to schedule complimentary pickup and receive a 100% refund.

## 5. Ten-Year Structural Craft Warranty
- All mortise-and-tenon structural joints, internal drawer runners, and timber frames are backed by our signature 10-year craft warranty against material defects under normal residential living conditions.`;
}
