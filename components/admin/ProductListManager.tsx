"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  ExternalLink,
  Edit3,
  Layers,
  AlertTriangle,
  Package,
  Eye,
  EyeOff,
  Star,
  DollarSign,
  Boxes,
  Grid,
  List as ListIcon,
} from "lucide-react";
import type { Product, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function ProductListManager({
  products: initialProducts,
  settings,
}: {
  products: Product[];
  settings: StoreSettings;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-desc" | "price-asc" | "stock-asc" | "name">("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
      else if (p.room) set.add(p.room);
    });
    return Array.from(set);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.material && p.material.toLowerCase().includes(query));

        const catName = p.category?.name || p.room || "";
        const matchesCategory =
          selectedCategory === "all" ||
          catName.toLowerCase() === selectedCategory.toLowerCase();

        const matchesStock =
          stockFilter === "all"
            ? true
            : stockFilter === "low"
              ? p.stock > 0 && p.stock <= 10
              : p.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-desc") return b.price_cents - a.price_cents;
        if (sortBy === "price-asc") return a.price_cents - b.price_cents;
        if (sortBy === "stock-asc") return a.stock - b.stock;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  // Aggregate telemetry
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const totalValuation = products.reduce((acc, p) => acc + p.price_cents * p.stock, 0);

  async function toggleStatus(productId: string, currentActive: boolean) {
    setTogglingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_active: !currentActive } : p))
        );
      }
    } catch {
      // Optimistic update rollback if needed
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <span>Catalog Operations</span>
            <span>·</span>
            <span>{products.length} Total Essentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            Product Catalog &amp; Inventory
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Publish, edit pricing, manage stock thresholds, and organize room collections.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span style={{ color: "#FFFFFF" }}>Add New Product</span>
        </Link>
      </div>

      {/* 2. Inventory Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog Size</span>
            <Package className="w-4 h-4 text-[#8A927A]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">{products.length} Items</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">100% mapped to collections</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Units</span>
            <Boxes className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">{totalStock} Units</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">Ready for fulfillment</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-800">{lowStockCount} Items</div>
          <div className="text-[10px] text-amber-700/80 font-mono">Stock threshold &lt; 10</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1C18]">
            {formatMoney(totalValuation, settings.currency_symbol, settings.currency)}
          </div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">At current retail prices</div>
        </div>
      </div>

      {/* 3. Search, Filter & View Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A483E]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, slug, material, room..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder:text-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A483E] hover:text-[#1A1C18]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value as "all" | "low" | "out")
              }
              className="px-3 py-2 bg-[#FAF9F6] border border-[#1A1C18]/15 text-xs text-[#1A1C18] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
            >
              <option value="all">All Inventory</option>
              <option value="low">Low Stock (≤10)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                  | "newest"
                  | "price-desc"
                  | "price-asc"
                  | "stock-asc"
                  | "name"
                )
              }
              className="px-3 py-2 bg-[#FAF9F6] border border-[#1A1C18]/15 text-xs text-[#1A1C18] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="stock-asc">Sort: Stock (Lowest First)</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "table"
                    ? "bg-white text-[#1A1C18] shadow-2xs font-bold"
                    : "text-[#4A483E]/70 hover:text-[#1A1C18]"
                  }`}
                title="Table View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "cards"
                    ? "bg-white text-[#1A1C18] shadow-2xs font-bold"
                    : "text-[#4A483E]/70 hover:text-[#1A1C18]"
                  }`}
                title="Gallery View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === "all"
                ? "bg-[#1A1C18] text-white"
                : "bg-stone-100 text-[#4A483E] hover:bg-stone-200"
              }`}
          >
            All Collections ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) =>
                (p.category?.name || p.room || "").toLowerCase() === cat.toLowerCase()
            ).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap capitalize cursor-pointer ${isSelected
                    ? "bg-[#1A1C18] text-white"
                    : "bg-stone-100 text-[#4A483E] hover:bg-stone-200"
                  }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Products Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1A1C18]/10 bg-[#FAF9F6] text-[#4A483E] uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6 pr-3">Product</th>
                  <th className="py-3.5 px-3">Room / Category</th>
                  <th className="py-3.5 px-3">Retail Price</th>
                  <th className="py-3.5 px-3">Stock Units</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1C18]/8">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#4A483E]">
                      <Package className="w-8 h-8 mx-auto text-[#8A927A] mb-2" />
                      <div className="font-bold text-[#1A1C18]">No products matched your filters</div>
                      <p className="text-xs text-[#4A483E]/70 mt-1">Try resetting search keywords or category filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSelectedCategory("all");
                          setStockFilter("all");
                        }}
                        className="mt-3 px-4 py-1.5 rounded-lg bg-[#1A1C18] text-white text-xs font-semibold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const img =
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=300&q=80";
                    const isLowStock = product.stock <= 10 && product.stock > 0;
                    const isOutOfStock = product.stock === 0;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-stone-50/80 transition-colors group"
                      >
                        {/* Product Title + Image */}
                        <td className="py-3 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/10 shrink-0">
                              <Image
                                src={img}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover group-hover:scale-108 transition-transform duration-300"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="font-bold text-xs text-[#1A1C18] hover:text-[#B78E69] hover:underline truncate block"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 text-[10px] text-[#4A483E]/70 font-mono mt-0.5">
                                <span>slug: {product.slug}</span>
                                {product.is_bestseller && (
                                  <span className="inline-flex items-center gap-0.5 text-[#B78E69] font-bold">
                                    <Star className="w-2.5 h-2.5 fill-[#B78E69]" /> Bestseller
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Room / Category */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-[#1A1C18] text-[11px] font-medium capitalize">
                            <Layers className="w-3 h-3 text-[#8A927A]" />
                            {product.category?.name || product.room || "Living"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-xs text-[#1A1C18]">
                            {formatMoney(product.price_cents, settings.currency_symbol, settings.currency)}
                          </div>
                          {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
                            <div className="text-[10px] text-[#4A483E]/60 line-through font-mono">
                              {formatMoney(product.compare_at_cents, settings.currency_symbol, settings.currency)}
                            </div>
                          )}
                        </td>

                        {/* Stock Level */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${isOutOfStock
                                  ? "bg-red-500"
                                  : isLowStock
                                    ? "bg-amber-500 animate-pulse"
                                    : "bg-emerald-500"
                                }`}
                            />
                            <span
                              className={`font-mono font-bold text-xs ${isOutOfStock
                                  ? "text-red-700"
                                  : isLowStock
                                    ? "text-amber-800"
                                    : "text-[#1A1C18]"
                                }`}
                            >
                              {product.stock} in stock
                            </span>
                          </div>
                          {isLowStock && (
                            <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                              Restock soon
                            </span>
                          )}
                        </td>

                        {/* Published Status Toggle */}
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            disabled={togglingId === product.id}
                            onClick={() => toggleStatus(product.id, product.is_active)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${product.is_active
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
                                : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                              }`}
                          >
                            {product.is_active ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-stone-400" />
                                <span>Draft / Hidden</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="p-1.5 text-[#4A483E] hover:text-[#1A1C18] hover:bg-stone-100 rounded-lg transition-colors"
                              title="View in storefront"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-1.5 text-[#4A483E] hover:text-[#1A1C18] hover:bg-stone-100 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination Strip */}
          <div className="p-4 bg-[#FAF9F6] border-t border-[#1A1C18]/10 flex items-center justify-between text-xs text-[#4A483E]">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> essentials
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8A927A] font-semibold">
                Catalog synchronized with Supabase database
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Gallery Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const img =
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=400&q=80";

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 bg-[#F4F0E8] overflow-hidden">
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-106 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#1A1C18]/85 text-white text-[10px] font-bold backdrop-blur-xs">
                        {product.category?.name || product.room || "Living"}
                      </span>
                      {product.stock <= 10 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                          Low: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-[#1A1C18] line-clamp-1 group-hover:text-[#B78E69] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#4A483E]/70 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="font-mono text-sm font-bold text-[#1A1C18]">
                      {formatMoney(product.price_cents, settings.currency_symbol, settings.currency)}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#1A1C18]/8 bg-[#FAF9F6] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#4A483E]">
                    {product.stock} units
                  </span>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1C18] hover:text-[#B78E69]"
                  >
                    <span>Edit Specs</span>
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}