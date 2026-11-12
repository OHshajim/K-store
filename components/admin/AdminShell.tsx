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
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  StarIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ReactNode } from "react";

export function AdminShell({
  children,
  storeName = "Kstore",
  logoUrl = null,
}: {
  children: ReactNode;
  storeName?: string;
  logoUrl?: string | null;
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
                  SA
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">
                    Studio Architect
                  </div>
                  <div className="text-[10px] text-[#D8C9B5]/70 font-mono truncate">
                    admin@kstore.com
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
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                  30
                </span>
              }
            />
            <SideNavItem
              label="Categories"
              href="/admin/categories"
              icon={Squares2X2Icon}
              isSelected={pathname.startsWith("/admin/categories")}
              endContent={
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                  6
                </span>
              }
            />
            <SideNavItem
              label="Orders"
              href="/admin/orders"
              icon={TruckIcon}
              isSelected={pathname.startsWith("/admin/orders")}
              endContent={
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B78E69] text-white">
                  4
                </span>
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
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Active
                </span>
              }
            />
            <SideNavItem
              label="Product Reviews"
              href="/admin/reviews"
              icon={StarIcon}
              isSelected={pathname.startsWith("/admin/reviews")}
              endContent={
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                  ★ 4.9
                </span>
              }
            />
          </SideNavSection>

          <SideNavSection title="SYSTEM">
            <SideNavItem
              label="Users & Staff"
              href="/admin/users"
              icon={UsersIcon}
              isSelected={pathname.startsWith("/admin/users")}
              endContent={
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                  5
                </span>
              }
            />
            <SideNavItem
              label="Store Settings"
              href="/admin/settings"
              icon={Cog6ToothIcon}
              isSelected={pathname.startsWith("/admin/settings")}
              endContent={
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#D8C9B5]">
                  USD/CAD/GBP
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
