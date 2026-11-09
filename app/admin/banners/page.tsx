import { createClient } from "@/lib/supabase/server";
import { BannerManager } from "@/components/admin/BannerManager";
import type { Banner } from "@/lib/types";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });

  return <BannerManager banners={(data as Banner[]) ?? []} />;
}
