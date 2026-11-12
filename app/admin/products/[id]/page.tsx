import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Breadcrumbs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1.5">
            <Link href="/admin/products" className="hover:text-[#1A1C18] transition-colors">
              Products
            </Link>
            <span>·</span>
            <span>Living Catalog</span>
            <span>·</span>
            <span className="text-[#1A1C18] font-bold">Edit Specification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18] font-editorial flex items-center gap-3">
            <span>Edit: {product.name}</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live Spec
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 font-sans">
            Update pricing, promotional offers, living space taxonomy, and lifestyle photography.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Products</span>
          </Link>

          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#B78E69] hover:text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs"
          >
            <span>Storefront View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Responsive 2-Column Form */}
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
