import type { ReactNode } from "react";
import { StoreShell } from "@/components/store/StoreShell";
import { requireStoreSettings, getCategories, getBanners } from "@/lib/data/catalog";
import { getCurrentProfile } from "@/lib/data/auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, categories, promoBanners, profile] = await Promise.all([
    requireStoreSettings(),
    getCategories(),
    getBanners("promo"),
    getCurrentProfile(),
  ]);

  const activePromo = promoBanners[0];
  const promoMessage = activePromo
    ? activePromo.subtitle
      ? `${activePromo.title} — ${activePromo.subtitle}`
      : activePromo.title
    : undefined;

  return (
    <StoreShell
      storeName={settings.store_name}
      tagline={settings.tagline}
      supportEmail={settings.support_email}
      logoUrl={settings.logo_url}
      categories={categories}
      promoMessage={promoMessage}
      profile={profile}
    >
      {children}
    </StoreShell>
  );
}
