import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1.5">
            <Link href="/admin/products" className="hover:text-[#1A1C18] transition-colors">
              Products
            </Link>
            <span>·</span>
            <span>Living Catalog</span>
            <span>·</span>
            <span className="text-[#1A1C18] font-bold">New Creation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18] font-editorial flex items-center gap-3">
            Add New Living Essential
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#B78E69]/15 text-[#B78E69] uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Studio Editor
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 mt-1 font-sans">
            Author an architectural furniture piece, define inventory stock, and upload lifestyle photography.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Products</span>
        </Link>
      </div>

      {/* 2. Responsive 2-Column Form */}
      <ProductForm categories={categories} />
    </div>
  );
}
