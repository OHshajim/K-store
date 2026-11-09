"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

/**
 * Loads the persisted cart from localStorage after mount. The store starts
 * with `skipHydration: true` so server and client render the same empty
 * cart first — this component then fills in the saved items.
 */
export function CartHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
