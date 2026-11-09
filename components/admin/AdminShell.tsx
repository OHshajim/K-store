"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@astryxdesign/core/AppShell";
import { SideNav, SideNavHeading, SideNavItem } from "@astryxdesign/core/SideNav";
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  StarIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell
      height="fill"
      variant="section"
      contentPadding={4}
      sideNav={
        <SideNav
          header={<SideNavHeading heading="Store admin" headingHref="/admin" />}
        >
          <SideNavItem
            label="Dashboard"
            href="/admin"
            icon={HomeIcon}
            isSelected={pathname === "/admin"}
          />
          <SideNavItem
            label="Products"
            href="/admin/products"
            icon={CubeIcon}
            isSelected={pathname.startsWith("/admin/products")}
          />
          <SideNavItem
            label="Categories"
            href="/admin/categories"
            icon={Squares2X2Icon}
            isSelected={pathname.startsWith("/admin/categories")}
          />
          <SideNavItem
            label="Banners"
            href="/admin/banners"
            icon={MegaphoneIcon}
            isSelected={pathname.startsWith("/admin/banners")}
          />
          <SideNavItem
            label="Orders"
            href="/admin/orders"
            icon={TruckIcon}
            isSelected={pathname.startsWith("/admin/orders")}
          />
          <SideNavItem
            label="Reviews"
            href="/admin/reviews"
            icon={StarIcon}
            isSelected={pathname.startsWith("/admin/reviews")}
          />
          <SideNavItem
            label="Users"
            href="/admin/users"
            icon={UsersIcon}
            isSelected={pathname.startsWith("/admin/users")}
          />
          <SideNavItem
            label="Settings"
            href="/admin/settings"
            icon={Cog6ToothIcon}
            isSelected={pathname.startsWith("/admin/settings")}
          />
          <SideNavItem label="Back to store" href="/" icon={ArrowLeftIcon} />
        </SideNav>
      }
    >
      {children}
    </AppShell>
  );
}
