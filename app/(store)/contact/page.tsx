import { Metadata } from "next";
import Link from "next/link";
import { requireStoreSettings, getCategories } from "@/lib/data/catalog";
import { StoreShell } from "@/components/store/StoreShell";
import { ContactView } from "@/components/store/ContactView";

export const metadata: Metadata = {
  title: "Concierge & Client Services — Kstore",
  description:
    "Connect with our interior stylists, architectural trade consultants, and customer care concierge.",
};

export default async function ContactPage() {
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
      <ContactView settings={settings} />
    </StoreShell>
  );
}
