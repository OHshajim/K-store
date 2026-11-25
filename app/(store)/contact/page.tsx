import { Metadata } from "next";
import { requireStoreSettings } from "@/lib/data/catalog";
import { ContactView } from "@/components/store/ContactView";

export const metadata: Metadata = {
  title: "Concierge & Client Services — Kstore",
  description:
    "Connect with our interior stylists, architectural trade consultants, and customer care concierge.",
};

export default async function ContactPage() {
  const settings = await requireStoreSettings();

  return <ContactView settings={settings} />;
}
