import type { ReactNode } from "react";
import { StoreShell } from "@/components/store/StoreShell";
import { requireStoreSettings } from "@/lib/data/catalog";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await requireStoreSettings();
  return (
    <StoreShell
      storeName={settings.store_name}
      tagline={settings.tagline}
      supportEmail={settings.support_email}
      logoUrl={settings.logo_url}
    >
      {children}
    </StoreShell>
  );
}
