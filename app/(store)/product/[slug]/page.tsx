import { notFound } from "next/navigation";
import {
  getAllProductSlugs,
  getProductBySlug,
  getStoreSettings,
} from "@/lib/data/catalog";
import { ProductDetailView } from "@/components/store/ProductDetailView";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);
  if (!product) notFound();
  return <ProductDetailView product={product} settings={settings} />;
}
