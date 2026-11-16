import { getCategories, getProducts, getBanners, requireStoreSettings } from "@/lib/data/catalog";
import { getPublishedReviews } from "@/lib/data/reviews";
import { HeroSection } from "@/components/store/home/HeroSection";
import { FeaturedCollections } from "@/components/store/home/FeaturedCollections";
import { BestSellersSection } from "@/components/store/home/BestSellersSection";
import { BrandStorySection } from "@/components/store/home/BrandStorySection";
import { ShopByRoomSection } from "@/components/store/home/ShopByRoomSection";
import { BrandBenefitsSection } from "@/components/store/home/BrandBenefitsSection";
import { EditorialInspiration } from "@/components/store/home/EditorialInspiration";
import { CustomerReviewsSection } from "@/components/store/home/CustomerReviewsSection";
import { NewsletterSection } from "@/components/store/home/NewsletterSection";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, bestSellers, heroBanners, reviews, settings] = await Promise.all([
    getCategories(),
    getProducts({ bestsellers: true, limit: 8 }),
    getBanners("hero"),
    getPublishedReviews(24),
    requireStoreSettings(),
  ]);

  return (
    <div className="w-full space-y-0">
      {/* Section C: Hero Section Slider */}
      <HeroSection
        banners={heroBanners}
        tagline={settings.tagline || undefined}
        storeName={settings.store_name}
      />

      {/* Section D: Featured Collections */}
      <FeaturedCollections categories={categories} />

      {/* Section E: Best Sellers */}
      <BestSellersSection products={bestSellers} />

      {/* Section F: Brand Story (Admin Editable) */}
      <BrandStorySection
        storeName={settings.store_name}
        aboutHtml={settings.about_html}
      />

      {/* Section G: Shop by Room */}
      <ShopByRoomSection />

      {/* Section H: Brand Benefits */}
      <BrandBenefitsSection />

      {/* Section I: Editorial Inspiration */}
      <EditorialInspiration />

      {/* Section J: Customer Reviews */}
      <CustomerReviewsSection reviews={reviews} />

      {/* Section K: Newsletter */}
      <NewsletterSection />
    </div>
  );
}
