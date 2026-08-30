import type { ReactNode } from "react";
import { StoreShell } from "@/components/store/StoreShell";
import { getStoreSettings } from "@/lib/data/catalog";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getStoreSettings();
  return <StoreShell storeName={settings.store_name}>{children}</StoreShell>;
}
