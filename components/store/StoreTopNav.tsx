"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { useWishlistStore } from "@/lib/wishlist/store";
import { SearchModal } from "./SearchModal";
import { CartDrawer } from "./CartDrawer";
import { CurrencySelector } from "./CurrencySelector";
import { MOCK_CATEGORIES } from "@/lib/data/mockData";

export function StoreTopNav({
  storeName = "Kstore",
  logoUrl = null,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { count, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = count();
  const wishlistCount = wishlistItems.length;

  // Lock background scrolling when mobile navigation modal is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Mobile Hamburger & Brand Logo together */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#1A1C18] hover:text-[#B78E69] focus:outline-none cursor-pointer transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="group flex items-center gap-3">
                {logoUrl && (
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white/40 border border-[#1A1C18]/10 shrink-0">
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      fill
                      sizes="36px"
                      className="object-contain p-0.5"
                    />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18] group-hover:text-[#B78E69] transition-colors uppercase leading-none">
                    {storeName}
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#4A483E] mt-0.5 font-sans font-semibold">
                    Modern Living, Simplified
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links (All strictly whitespace-nowrap) */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-7 shrink-0">
              <Link
                href="/shop"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] whitespace-nowrap ${
                  pathname === "/shop"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Shop
              </Link>

              {/* Collections Mega Menu Trigger */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-[#1A1C18]/80 hover:text-[#B78E69] py-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
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
                className="relative shrink-0"
                onMouseEnter={() => setIsRoomMenuOpen(true)}
                onMouseLeave={() => setIsRoomMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-[#1A1C18]/80 hover:text-[#B78E69] py-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Shop by Room</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
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
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#B78E69] whitespace-nowrap shrink-0 ${
                  pathname === "/fit-assistant"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                <Compass className="w-4 h-4 text-[#8A927A] shrink-0" />
                <span className="whitespace-nowrap">Fit Assistant</span>
                <span className="text-[10px] bg-[#8A927A]/20 text-[#8A927A] font-bold px-1.5 py-0.5 rounded-full font-sans whitespace-nowrap">
                  Interactive
                </span>
              </Link>

              <Link
                href="/about"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] whitespace-nowrap shrink-0 ${
                  pathname === "/about"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Our Story
              </Link>

              <Link
                href="/journal"
                className={`text-sm font-semibold transition-colors hover:text-[#B78E69] whitespace-nowrap shrink-0 ${
                  pathname === "/journal"
                    ? "text-[#1A1C18] underline underline-offset-8"
                    : "text-[#1A1C18]/80"
                }`}
              >
                Journal
              </Link>
            </nav>

            {/* Right: Header Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
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
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#B78E69] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Customer Account Button (Visible from tablet up) */}
              <Link
                href="/account"
                className="hidden sm:inline-flex p-2 text-[#1A1C18] hover:text-[#B78E69] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Customer account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={openCart}
                data-btn="dark"
                style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#1A1C18] text-white rounded-xl hover:bg-[#32362F] transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide" style={{ color: "#FFFFFF" }}>
                  Cart
                </span>
                {isMounted && cartCount > 0 && (
                  <span
                    style={{ color: "#FFFFFF", backgroundColor: "#B78E69" }}
                    className="w-4 h-4 bg-[#B78E69] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Modal (Fixed Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur/Dim Overlay */}
          <div
            className="fixed inset-0 bg-[#1A1C18]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Drawer Content (Never pushes down page flow) */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-[#F4F0E8] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-r border-[#1A1C18]/15 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#1A1C18]/10 flex items-center justify-between bg-[#F4F0E8]">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-2.5"
              >
                {logoUrl && (
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white/40 border border-[#1A1C18]/10 shrink-0">
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      fill
                      sizes="32px"
                      className="object-contain p-0.5"
                    />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-editorial text-2xl font-bold tracking-tight text-[#1A1C18] uppercase leading-none">
                    {storeName}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-[#4A483E] mt-0.5 font-sans font-semibold">
                    Modern Living, Simplified
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-[#1A1C18] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-[#1A1C18]/12 text-xs text-[#4A483E] shadow-2xs hover:border-[#1A1C18]/30 transition-all cursor-pointer text-left"
              >
                <Search className="w-4 h-4 text-[#8A927A]" />
                <span>Search timber, lamps, shelves…</span>
              </button>

              {/* Core Store Routes */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A483E] px-2 block mb-2 font-mono">
                  Store Navigation
                </span>
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40 transition-colors"
                >
                  <span>Shop All Essentials</span>
                  <ArrowRight className="w-4 h-4 text-[#4A483E]/60" />
                </Link>
                <Link
                  href="/fit-assistant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#8A927A]" />
                    Fit Assistant
                  </span>
                  <span className="text-[10px] bg-[#8A927A]/20 text-[#8A927A] font-bold px-2 py-0.5 rounded-full font-mono">
                    Interactive
                  </span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40 transition-colors"
                >
                  <span>Our Story &amp; Philosophy</span>
                </Link>
                <Link
                  href="/journal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40 transition-colors"
                >
                  <span>Journal: The Art of Living Well</span>
                </Link>
              </div>

              {/* Rooms & Environments */}
              <div className="pt-4 border-t border-[#1A1C18]/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A483E] px-2 block mb-2 font-mono">
                  Rooms &amp; Environments
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {rooms.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/shop?room=${r.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-white/60 hover:bg-white text-xs font-semibold text-[#1A1C18] border border-[#1A1C18]/8 transition-all block"
                    >
                      <div className="font-bold">{r.name}</div>
                      <div className="text-[10px] text-[#4A483E] font-normal truncate mt-0.5">{r.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Customer Account & Administration */}
              <div className="pt-4 border-t border-[#1A1C18]/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A483E] px-2 block mb-2 font-mono">
                  Account &amp; Services
                </span>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40"
                >
                  <User className="w-4 h-4 text-[#4A483E]" />
                  <span>Customer Account</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#4A483E]" />
                    <span>Saved Wishlist</span>
                  </span>
                  {isMounted && wishlistCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B78E69] text-white font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1C18] hover:bg-[#D8C9B5]/40"
                >
                  <Compass className="w-4 h-4 text-[#4A483E]" />
                  <span>Order Tracking &amp; Delivery</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#4A483E] hover:text-[#1A1C18] hover:bg-[#D8C9B5]/40"
                >
                  <span>Store Administration (CMS)</span>
                </Link>
              </div>
            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-5 border-t border-[#1A1C18]/10 bg-white/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4A483E] font-medium">Currency &amp; Region:</span>
                <CurrencySelector variant="footer" />
              </div>
              <div className="text-[10px] text-[#4A483E]/80 text-center font-sans">
                Complimentary shipping on orders over $150
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CartDrawer />
    </>
  );
}
