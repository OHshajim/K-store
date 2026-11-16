import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getAdminCounts } from "@/lib/data/adminStats";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Defense-in-depth: proxy.ts guards the routes first, but the layout must
  // not trust the matcher alone. Anything non-admin/non-manager never renders here.
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
    redirect("/login?next=/admin");
  }

  const [settings, counts] = await Promise.all([
    requireStoreSettings(),
    getAdminCounts(),
  ]);

  return (
    <AdminShell
      storeName={settings.store_name}
      logoUrl={settings.logo_url}
      counts={counts}
      profile={profile}
      currency={settings.currency || "USD"}
    >
      {children}
    </AdminShell>
  );
}
