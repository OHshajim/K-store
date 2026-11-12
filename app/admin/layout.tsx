import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Defense-in-depth: proxy.ts guards the routes first, but the layout must
  // not trust the matcher alone. Anything non-admin never renders here.
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const settings = await requireStoreSettings();

  return (
    <AdminShell storeName={settings.store_name} logoUrl={settings.logo_url}>
      {children}
    </AdminShell>
  );
}
