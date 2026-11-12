import { createClient } from "@/lib/supabase/server";
import { BannerManager } from "@/components/admin/BannerManager";
import type { Banner } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });

  const defaultBanners: Banner[] = [
    {
      id: "hero-1",
      placement: "hero",
      title: "Make room for what matters.",
      subtitle: "Thoughtfully designed essentials for a more organized, beautiful home.",
      image_url:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
      cta_label: "Explore Collection",
      cta_href: "/shop",
      sort_order: 1,
      is_active: true,
    },
    {
      id: "promo-1",
      placement: "promo",
      title: "Complimentary shipping on orders over $150.",
      subtitle: "Thoughtfully designed essentials for modern living.",
      image_url: null,
      cta_label: "Shop Now",
      cta_href: "/shop",
      sort_order: 1,
      is_active: true,
    },
  ];

  const banners = (data && data.length > 0 ? (data as Banner[]) : defaultBanners);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <BannerManager banners={banners} />
    </div>
  );
}
