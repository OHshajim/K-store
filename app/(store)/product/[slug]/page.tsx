import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/data/auth";
import {
  getProductBySlug,
  getProducts,
  requireStoreSettings,
} from "@/lib/data/catalog";
import {
  checkProductReviewEligibility,
  getProductReviews,
} from "@/lib/data/reviews";
import { ProductDetailView } from "@/components/store/ProductDetailView";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Modern Living Essentials`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, settings, profile] = await Promise.all([
    getProductBySlug(slug),
    requireStoreSettings(),
    getCurrentProfile(),
  ]);

  if (!product) notFound();

  // Fetch reviews, verified buyer eligibility & related products
  const [reviews, allRelated, reviewEligibility] = await Promise.all([
    getProductReviews(product.id),
    getProducts({
      room: product.room,
      categorySlug: product.category?.slug,
      limit: 5,
    }),
    checkProductReviewEligibility(profile?.id, profile?.email, product.id),
  ]);

  const related = allRelated.filter((p) => p.id !== product.id).slice(0, 4);
  const effectiveReviewCount =
    reviews.length > 0 ? reviews.length : (product.review_count ?? 0);
  const effectiveRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : product.rating;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: "Kstore",
    },
    material: product.material,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kstore.com"}/product/${product.slug}`,
      priceCurrency: "USD",
      price: (product.price_cents / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(effectiveReviewCount > 0 && effectiveRating
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: effectiveRating.toFixed(1),
          reviewCount: effectiveReviewCount,
        },
      }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        settings={settings}
        relatedProducts={related}
        reviews={reviews}
        reviewEligibility={reviewEligibility}
      />
    </>
  );
}
