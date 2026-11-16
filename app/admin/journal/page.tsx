import type { Metadata } from "next";
import { getArticles } from "@/lib/data/editorial";
import { JournalManager } from "@/components/admin/JournalManager";

export const metadata: Metadata = {
  title: "Journal & Essays — Studio Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const articles = await getArticles();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <JournalManager initialArticles={articles} />
    </div>
  );
}
