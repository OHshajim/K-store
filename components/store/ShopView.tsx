"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import type { Category, Product, StoreSettings } from "@/lib/types";
import { ProductGrid } from "@/components/store/ProductGrid";
import { useCurrencyStore } from "@/lib/currency/store";

const SORT_OPTIONS = [
  { id: "featured", label: "Featured Picks" },
  { id: "bestseller", label: "Best Selling" },
  { id: "newest", label: "Newest Additions" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

const ROOM_OPTIONS = [
  { id: "living", label: "Living Room" },
  { id: "workspace", label: "Workspace" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bedroom", label: "Bedroom" },
  { id: "bathroom", label: "Bathroom" },
  { id: "lighting", label: "Lighting" },
];

const MATERIAL_OPTIONS = [
  "Solid White Oak",
  "Anodized Aluminum",
  "High-Fire Ceramic",
  "Borosilicate Glass",
  "Stainless Steel",
  "Wool Felt",
  "Plantation Teak",
  "Travertine Stone",
];

const COLOR_OPTIONS = [
  { name: "Natural Sand", hex: "#D8C9B5" },
  { name: "Matte Charcoal", hex: "#1A1C18" },
  { name: "Chalk White", hex: "#F4F0E8" },
  { name: "Sage Mist", hex: "#8A927A" },
  { name: "Brushed Bronze", hex: "#B78E69" },
];

export function ShopView({
  initialProducts,
  categories,
  settings,
  initialCategory,
  initialRoom,
  initialQuery,
}: {
  initialProducts: Product[];
  categories: Category[];
  settings?: StoreSettings;
  initialCategory?: string;
  initialRoom?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrencyStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom || "all");
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(750);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute filtered & sorted catalog
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory || p.category_id === selectedCategory
      );
    }

    // Room
    if (selectedRoom && selectedRoom !== "all") {
      result = result.filter((p) => p.room?.toLowerCase() === selectedRoom.toLowerCase());
    }

    // Material
    if (selectedMaterial && selectedMaterial !== "all") {
      const mat = selectedMaterial.toLowerCase();
      result = result.filter((p) => p.material?.toLowerCase().includes(mat));
    }

    // Color
    if (selectedColor && selectedColor !== "all") {
      const col = selectedColor.toLowerCase();
      result = result.filter((p) =>
        p.color_variants?.some((v) => v.name.toLowerCase().includes(col))
      );
    }

    // Max Price (USD dollars)
    if (maxPrice > 0) {
      result = result.filter((p) => p.price_cents / 100 <= maxPrice);
    }

    // In Stock Only
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (selectedSort) {
      case "price_asc":
        result.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case "price_desc":
        result.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "bestseller":
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedRoom,
    selectedMaterial,
    selectedColor,
    maxPrice,
    inStockOnly,
    selectedSort,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedRoom !== "all" ||
    selectedMaterial !== "all" ||
    selectedColor !== "all" ||
    inStockOnly ||
    maxPrice < 750;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRoom("all");
    setSelectedMaterial("all");
    setSelectedColor("all");
    setMaxPrice(750);
    setInStockOnly(false);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.id === selectedSort)?.label || "Featured Picks";

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-10 text-left border-b border-[#1A1C18]/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          The Complete Architecture Catalog
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1C18]">
          Home & Living Essentials
        </h1>
        <p className="text-sm sm:text-base text-[#4A483E] max-w-2xl mt-3 font-sans leading-relaxed">
          Explore thoughtful storage, quiet furniture, and warm lighting designed to elevate the modern dwelling.
        </p>
      </div>

      {/* Top Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        {/* Polished Architectural Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="flex items-center bg-white rounded-2xl border border-[#1A1C18]/15 px-4 py-2.5 shadow-xs transition-all focus-within:border-[#1A1C18] focus-within:ring-2 focus-within:ring-[#1A1C18]/10 hover:border-[#1A1C18]/30">
            <Search className="w-4 h-4 text-[#4A483E] shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timber, lamps, shelves, or name..."
              className="w-full bg-transparent text-sm text-[#1A1C18] placeholder:text-[#4A483E]/70 outline-none border-none focus:outline-none focus:ring-0"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#4A483E] hover:text-[#1A1C18] p-1 rounded-full hover:bg-[#F4F0E8] transition-colors cursor-pointer shrink-0 ml-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-[#4A483E]/60 bg-[#F4F0E8] border border-[#1A1C18]/10 shrink-0 ml-2">
                ESC
              </span>
            )}
          </div>
        </div>

        {/* Right actions: Mobile Filter Button & Custom Sort Dropdown */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1A1C18]/15 rounded-2xl text-xs font-semibold text-[#1A1C18] shadow-xs cursor-pointer hover:bg-[#F4F0E8] transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && "•"}
          </button>

          {/* Custom Styled Sort Dropdown */}
          <div className="relative inline-block text-left" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 bg-white border border-[#1A1C18]/15 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1C18] shadow-xs hover:border-[#1A1C18]/30 transition-all cursor-pointer"
            >
              <span className="text-[#4A483E] font-normal">Sort:</span>
              <span>{currentSortLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#4A483E] transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#1A1C18]/12 shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#4A483E]/70 border-b border-[#1A1C18]/10 mb-1">
                  Sort Order
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedSort(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                      selectedSort === opt.id
                        ? "bg-[#F4F0E8] font-bold text-[#1A1C18]"
                        : "text-[#4A483E] hover:bg-[#F4F0E8]/60 hover:text-[#1A1C18]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSort === opt.id && (
                      <Check className="w-3.5 h-3.5 text-[#1A1C18]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Navigation (High contrast, explicit borders and pill shapes) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedCategory === "all"
              ? "bg-[#1A1C18] text-white border border-[#1A1C18] shadow-sm"
              : "bg-white text-[#1A1C18] border border-[#1A1C18]/15 hover:border-[#1A1C18]/40 hover:bg-[#F4F0E8]"
          }`}
        >
          <span>All Collections</span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
              selectedCategory === "all"
                ? "bg-white/20 text-white"
                : "bg-[#F4F0E8] text-[#4A483E]"
            }`}
          >
            {initialProducts.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = initialProducts.filter(
            (p) => p.category?.slug === cat.slug || p.category_id === cat.id
          ).length;
          const isSelected = selectedCategory === cat.slug;

          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-[#1A1C18] text-white border border-[#1A1C18] shadow-sm"
                  : "bg-white text-[#1A1C18] border border-[#1A1C18]/15 hover:border-[#1A1C18]/40 hover:bg-[#F4F0E8]"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#F4F0E8] text-[#4A483E]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Catalog Layout with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-[#1A1C18]/12 h-fit sticky top-28 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
            <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8A927A]" />
              Filter Catalog
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[#B78E69] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Room Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A483E] mb-3">
              Room Atmosphere
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedRoom("all")}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedRoom === "all"
                    ? "bg-[#1A1C18] text-white font-semibold shadow-xs"
                    : "text-[#1A1C18] hover:bg-[#F4F0E8]"
                }`}
              >
                <span>All Rooms</span>
                {selectedRoom === "all" && <Check className="w-3.5 h-3.5" />}
              </button>
              {ROOM_OPTIONS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedRoom === room.id
                      ? "bg-[#1A1C18] text-white font-semibold shadow-xs"
                      : "text-[#1A1C18] hover:bg-[#F4F0E8]"
                  }`}
                >
                  <span>{room.label}</span>
                  {selectedRoom === room.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div className="pt-4 border-t border-[#1A1C18]/10">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A483E] mb-3">
              Core Material
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedMaterial("all")}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedMaterial === "all"
                    ? "bg-[#1A1C18] text-white font-semibold shadow-xs"
                    : "text-[#1A1C18] hover:bg-[#F4F0E8]"
                }`}
              >
                <span>All Materials</span>
                {selectedMaterial === "all" && <Check className="w-3.5 h-3.5" />}
              </button>
              {MATERIAL_OPTIONS.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterial(mat)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedMaterial === mat
                      ? "bg-[#1A1C18] text-white font-semibold shadow-xs"
                      : "text-[#1A1C18] hover:bg-[#F4F0E8]"
                  }`}
                >
                  <span>{mat}</span>
                  {selectedMaterial === mat && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pt-4 border-t border-[#1A1C18]/10">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A483E] mb-3">
              Color Finish
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedColor("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedColor === "all"
                    ? "bg-[#1A1C18] text-white border-transparent shadow-xs"
                    : "bg-white text-[#4A483E] border-[#1A1C18]/20 hover:bg-[#F4F0E8]"
                }`}
              >
                All
              </button>
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col.name)}
                  title={col.name}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                    selectedColor === col.name
                      ? "ring-2 ring-[#1A1C18] ring-offset-2 scale-110"
                      : "border-black/20 hover:scale-110"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  aria-label={col.name}
                />
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-[#1A1C18]/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#4A483E]">
                Max Budget
              </span>
              <span className="font-mono font-bold text-sm text-[#1A1C18]">
                ${maxPrice}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={750}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1A1C18] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#4A483E] font-mono">
              <span>$50</span>
              <span>$750+</span>
            </div>
          </div>

          {/* In-Stock Toggle Switch */}
          <div className="pt-4 border-t border-[#1A1C18]/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A1C18]">
                In Stock Only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  inStockOnly ? "bg-[#1A1C18]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Indicators & Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#4A483E] pb-2">
            <div>
              Showing <strong className="text-[#1A1C18] font-bold">{filteredProducts.length}</strong> of{" "}
              {initialProducts.length} curated essentials
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedRoom !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    Room: {selectedRoom}
                    <button
                      onClick={() => setSelectedRoom("all")}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedMaterial !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    Material: {selectedMaterial}
                    <button
                      onClick={() => setSelectedMaterial("all")}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedColor !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    Color: {selectedColor}
                    <button
                      onClick={() => setSelectedColor("all")}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {maxPrice < 750 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    Under ${maxPrice}
                    <button
                      onClick={() => setMaxPrice(750)}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#1A1C18]/15 rounded-full text-xs font-medium text-[#1A1C18] shadow-2xs">
                    In Stock Only
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-red-600 ml-1 text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#B78E69] hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* The Product Grid (3 generous columns next to sidebar) */}
          <ProductGrid products={filteredProducts} settings={settings} columns={3} />
        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1A1C18]/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
                <h3 className="font-editorial text-2xl font-bold text-[#1A1C18]">
                  Filter Catalog
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#4A483E] hover:text-[#1A1C18]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A483E] mb-2">
                  Room
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoom(r.id)}
                      className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                        selectedRoom === r.id
                          ? "border-[#1A1C18] bg-[#1A1C18] text-white font-bold"
                          : "border-[#1A1C18]/15 text-[#1A1C18] hover:bg-[#F4F0E8]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1A1C18]">
                  <span>Max Budget</span>
                  <span className="font-mono">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={750}
                  step={25}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1A1C18]"
                />
              </div>

              {/* In Stock */}
              <label className="flex items-center justify-between text-xs font-semibold text-[#1A1C18] cursor-pointer">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A1C18] accent-[#1A1C18]"
                />
              </label>
            </div>

            <div className="pt-6 border-t border-[#1A1C18]/10 flex gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-3 border border-[#1A1C18]/20 rounded-xl text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#1A1C18] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#32362F]"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
