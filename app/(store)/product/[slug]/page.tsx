import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getProducts,
  requireStoreSettings,
} from "@/lib/data/catalog";
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
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    requireStoreSettings(),
  ]);

  if (!product) notFound();

  // Fetch related products in same category or room
  const allRelated = await getProducts({
    room: product.room,
    categorySlug: product.category?.slug,
    limit: 5,
  });

  const related = allRelated.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      settings={settings}
      relatedProducts={related}
    />
  );
}
