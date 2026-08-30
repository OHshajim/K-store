"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
} from "@astryxdesign/core/TopNav";
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/cart/store";

// Selector runs after the store has hydrated from localStorage; the SSR
// snapshot returns 0 so server and client markup match.
function useCartCount() {
  return useSyncExternalStore(
    useCartStore.subscribe,
    () =>
      useCartStore
        .getState()
        .items.reduce((sum, item) => sum + item.quantity, 0),
    () => 0,
  );
}

export function StoreTopNav({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCartCount();

  return (
    <TopNav
      label="Store navigation"
      heading={
        <TopNavHeading
          heading={storeName}
          logo={<NavIcon icon={<Icon icon={ShoppingBagIcon} size="sm" />} />}
          headingHref="/"
        />
      }
      startContent={
        <>
          <TopNavItem
            label="Shop"
            href="/shop"
            isSelected={pathname?.startsWith("/shop")}
          />
          <TopNavItem
            label="Orders"
            href="/orders"
            isSelected={pathname?.startsWith("/orders")}
          />
          <TopNavItem
            label="About"
            href="/about"
            isSelected={pathname === "/about"}
          />
        </>
      }
      endContent={
        <>
          <Button
            label="Cart"
            variant="ghost"
            icon={<Icon icon={ShoppingCartIcon} size="sm" />}
            endContent={count > 0 ? <Badge label={count} /> : undefined}
            onClick={() => router.push("/cart")}
          />
          <IconButton
            label="Account"
            tooltip="Account"
            variant="ghost"
            icon={<Icon icon={UserCircleIcon} size="sm" />}
            onClick={() => router.push("/account")}
          />
        </>
      }
    />
  );
}
