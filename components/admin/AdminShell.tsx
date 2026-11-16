"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@astryxdesign/core/AppShell";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  StarIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ReactNode } from "react";
import type { AdminCounts } from "@/lib/data/adminStats";
import type { Profile } from "@/lib/types";

export function AdminShell({
  children,
  storeName = "Kstore",
  logoUrl = null,
  counts,
  profile,
  currency = "USD",
}: {
  children: ReactNode;
  storeName?: string;
  logoUrl?: string | null;
  counts?: AdminCounts;
  profile?: Profile | null;
  currency?: string;
}) {
  const pathname = usePathname();

  return (
    <AppShell
      height="fill"
      variant="section"
      contentPadding={4}
      sideNav={
        <SideNav
          header={
            <SideNavHeading
              heading={storeName}
              subheading="Studio Administration"
              headingHref="/admin"
              icon={
                logoUrl ? (
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white/10 border border-white/15 shrink-0">
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      fill
                      sizes="28px"
                      className="object-contain p-0.5"
                    />
                  </div>
                ) : undefined
              }
            />
          }
          topContent={
            <div className="px-3 pt-3 pb-1">
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] text-[#D8C9B5]/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-white/90">Production CMS</span>
                </span>
                <span className="font-mono text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/80 font-bold">
                  v2.4
                </span>
              </div>
            </div>
          }
          footer={
            <div className="p-3 border-t border-white/10 bg-[#1A1C18] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#B78E69] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {profile?.full_name
                    ? profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "SA"}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">
                    {profile?.full_name || "Studio Architect"}
                  </div>
                  <div className="text-[10px] text-[#D8C9B5]/70 font-mono truncate">
                    {profile?.email || "admin@kstore.com"}
                  </div>
                </div>
              </div>
              <a
                href="/api/auth/logout"
                title="Sign out of administration"
                className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </a>
            </div>
          }
        >
          <SideNavSection title="COMMERCE">
            <SideNavItem
              label="Overview"
              href="/admin"
              icon={HomeIcon}
              isSelected={pathname === "/admin"}
              endContent={
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#D8C9B5]">
                  Live
                </span>
              }
            />
            <SideNavItem
              label="Products"
              href="/admin/products"
              icon={CubeIcon}
              isSelected={pathname.startsWith("/admin/products")}
              endContent={
                counts?.products !== undefined ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {counts.products}
                  </span>
                ) : null
              }
            />
            <SideNavItem
              label="Categories"
              href="/admin/categories"
              icon={Squares2X2Icon}
              isSelected={pathname.startsWith("/admin/categories")}
              endContent={
                counts?.categories !== undefined ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {counts.categories}
                  </span>
                ) : null
              }
            />
            <SideNavItem
              label="Orders"
              href="/admin/orders"
              icon={TruckIcon}
              isSelected={pathname.startsWith("/admin/orders")}
              endContent={
                counts?.orders !== undefined ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B78E69] text-white">
                    {counts.orders}
                  </span>
                ) : null
              }
            />
            <SideNavItem
              label="Coupons"
              href="/admin/coupons"
              icon={TagIcon}
              isSelected={pathname.startsWith("/admin/coupons")}
              endContent={
                counts?.coupons !== undefined && counts.coupons > 0 ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {counts.coupons}
                  </span>
                ) : null
              }
            />
          </SideNavSection>

          <SideNavSection title="MARKETING & FEEDBACK">
            <SideNavItem
              label="Hero Banners"
              href="/admin/banners"
              icon={MegaphoneIcon}
              isSelected={pathname.startsWith("/admin/banners")}
              endContent={
                counts?.activeBanners !== undefined && counts.activeBanners > 0 ? (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {counts.activeBanners} Live
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                    0
                  </span>
                )
              }
            />
            <SideNavItem
              label="Product Reviews"
              href="/admin/reviews"
              icon={StarIcon}
              isSelected={pathname.startsWith("/admin/reviews")}
              endContent={
                counts?.reviewsCount ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    ★ {counts.averageRating ?? 5.0} ({counts.reviewsCount})
                  </span>
                ) : null
              }
            />
            <SideNavItem
              label="Journal & Essays"
              href="/admin/journal"
              icon={BookOpenIcon}
              isSelected={pathname.startsWith("/admin/journal")}
              endContent={
                counts?.articles !== undefined && counts.articles > 0 ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {counts.articles}
                  </span>
                ) : null
              }
            />
          </SideNavSection>

          <SideNavSection title="SYSTEM">
            <SideNavItem
              label="Users & Managers"
              href="/admin/users"
              icon={UsersIcon}
              isSelected={pathname.startsWith("/admin/users")}
              endContent={
                counts?.users !== undefined ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {counts.users}
                  </span>
                ) : null
              }
            />
            <SideNavItem
              label="Store Settings"
              href="/admin/settings"
              icon={Cog6ToothIcon}
              isSelected={pathname.startsWith("/admin/settings")}
              endContent={
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#D8C9B5]">
                  {currency}
                </span>
              }
            />
            <SideNavItem
              label="Back to Storefront"
              href="/"
              icon={ArrowLeftIcon}
            />
          </SideNavSection>
        </SideNav>
      }
    >
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1C18]">
        {children}
      </div>
    </AppShell>
  );
}
