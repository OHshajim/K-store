import type { Metadata } from "next";
import { getArticles } from "@/lib/data/editorial";
import { JournalManager } from "@/components/admin/JournalManager";

export const metadata: Metadata = {
  title: "Journal & Essays — Studio Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const articles = await getArticles();
  return <JournalManager initialArticles={articles} />;
}
