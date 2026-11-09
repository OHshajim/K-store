import type { Metadata } from "next";
import { getProducts } from "@/lib/data/catalog";
import { FitAssistantView } from "@/components/store/FitAssistantView";

export const metadata: Metadata = {
  title: "NORDEN Fit Assistant — Find Your Perfect Fit",
  description:
    "Interactive spatial clearance tool that determines exact dimensional fit, material harmony, and budget alignment for your home.",
};

export default async function FitAssistantPage() {
  const allProducts = await getProducts();
  return <FitAssistantView allProducts={allProducts} />;
}

