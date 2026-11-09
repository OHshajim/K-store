"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Compass,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { useWishlistStore } from "@/lib/wishlist/store";
import { SearchModal } from "./SearchModal";
import { CartDrawer } from "./CartDrawer";
import { MOCK_CATEGORIES } from "@/lib/data/mockData";

export function StoreTopNav({ storeName = "Kstore" }: { storeName?: string }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);

  const { count, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = count();
  const wishlistCount = wishlistItems.length;

  const rooms = [
    { name: "Living Room", slug: "living", desc: "Modular seating & storage" },
    { name: "Workspace", slug: "workspace", desc: "Ergonomics & organization" },
    { name: "Kitchen", slug: "kitchen", desc: "Artisanal stoneware & canisters" },
    { name: "Bedroom", slug: "bedroom", desc: "Nightstands & linen storage" },
    { name: "Bathroom", slug: "bathroom", desc: "Teak shelving & vanity trays" },
    { name: "Lighting", slug: "lighting", desc: "Sculptural dimmable fixtures" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F4F0E8]/95 backdrop-blur-md border-b border-[#1A1C18]/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#1A1C18] hover:text-[#B78E69] focus:outline-none cursor-pointer"
                aria-label="Open mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="group flex flex-col items-start">
                <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18] group-hover:text-[#B78E69] transition-colors uppercase">
                  {storeName}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#4A483E] -mt-1 font-sans font-semibold">
                  Modern Living, Simplified
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              <Link
                href="/shop"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] ${
                  pathname === "/shop"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Shop
              </Link>

              {/* Collections Mega Menu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-[#1A1C18]/80 hover:text-[#B78E69] py-2 transition-colors cursor-pointer"
                >
                  Collections
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isMegaMenuOpen && (
                  <div className="absolute top-full -left-20 w-[640px] bg-white rounded-3xl shadow-2xl border border-[#1A1C18]/12 p-6 grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="col-span-2 pb-2 border-b border-[#1A1C18]/10 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4A483E]">
                        Featured Collections
                      </span>
                      <Link
                        href="/shop"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="text-xs text-[#B78E69] hover:underline font-semibold"
                      >
                        View All Collections →
                      </Link>
                    </div>

                    {MOCK_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="group/cat p-3 rounded-2xl hover:bg-[#F4F0E8] transition-colors"
                      >
                        <h4 className="text-sm font-bold text-[#1A1C18] group-hover/cat:text-[#B78E69] transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-[#4A483E] line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop by Room Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsRoomMenuOpen(true)}
                onMouseLeave={() => setIsRoomMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-[#1A1C18]/80 hover:text-[#B78E69] py-2 transition-colors cursor-pointer"
                >
                  Shop by Room
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isRoomMenuOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl border border-[#1A1C18]/12 py-2 animate-in fade-in zoom-in-95 duration-150">
                    {rooms.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/shop?room=${r.slug}`}
                        onClick={() => setIsRoomMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#F4F0E8] transition-colors"
                      >
                        <div className="text-xs font-bold text-[#1A1C18]">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-[#4A483E]">
                          {r.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Fit Assistant Feature Link */}
              <Link
                href="/fit-assistant"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#B78E69] ${
                  pathname === "/fit-assistant"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                <Compass className="w-4 h-4 text-[#8A927A]" />
                <span>Fit Assistant</span>
                <span className="text-[10px] bg-[#8A927A]/20 text-[#8A927A] font-bold px-1.5 py-0.5 rounded-full font-sans">
                  Interactive
                </span>
              </Link>

              <Link
                href="/about"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] ${
                  pathname === "/about"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Our Story
              </Link>

              <Link
                href="/journal"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] ${
                  pathname === "/journal"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Journal
              </Link>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#1A1C18] hover:text-[#B78E69] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                href="/wishlist"
                className="relative p-2 text-[#1A1C18] hover:text-[#B78E69] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="View wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#B78E69] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Link */}
              <Link
                href="/account"
                className="p-2 text-[#1A1C18] hover:text-[#B78E69] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Customer account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-2 px-3.5 py-2 bg-[#1A1C18] text-white rounded-xl hover:bg-[#32362F] transition-all shadow-xs cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="w-4 h-4 bg-[#B78E69] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1A1C18]/10 bg-[#F4F0E8] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-2">
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40"
              >
                Shop All Essentials
              </Link>
              <Link
                href="/fit-assistant"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#8A927A]" />
                  Fit Assistant
                </span>
                <span className="text-[10px] bg-[#8A927A]/20 text-[#8A927A] px-1.5 py-0.5 rounded-full font-bold">
                  Interactive
                </span>
              </Link>

              <div className="pt-2 border-t border-[#1A1C18]/10">
                <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#4A483E] block mb-1">
                  Rooms & Collections
                </span>
                {rooms.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/shop?room=${r.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-[#1A1C18] hover:bg-[#D8C9B5]/40 rounded-lg font-medium"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1A1C18]/10">
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#1A1C18] hover:bg-[#D8C9B5]/40 rounded-lg font-medium"
                >
                  Our Story & Philosophy
                </Link>
                <Link
                  href="/journal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#1A1C18] hover:bg-[#D8C9B5]/40 rounded-lg font-medium"
                >
                  Journal: The Art of Living Well
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#1A1C18] hover:bg-[#D8C9B5]/40 rounded-lg font-medium"
                >
                  Order Tracking
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#4A483E] hover:bg-[#D8C9B5]/40 rounded-lg font-medium"
                >
                  Store Administration
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CartDrawer />
    </>
  );
}
