import type { Metadata } from "next";
import { getProducts, requireStoreSettings } from "@/lib/data/catalog";
import { FitAssistantView } from "@/components/store/FitAssistantView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await requireStoreSettings();
  const storeName = settings.store_name || "Kstore";
  return {
    title: `${storeName} Fit Assistant — Find Your Perfect Fit`,
    description:
      `Interactive spatial clearance tool that determines exact dimensional fit, material harmony, and budget alignment for your home with ${storeName} essentials.`,
  };
}

export default async function FitAssistantPage() {
  const [allProducts, settings] = await Promise.all([
    getProducts(),
    requireStoreSettings(),
  ]);
  const storeName = settings.store_name || "Kstore";

  return <FitAssistantView allProducts={allProducts} storeName={storeName} />;
}
