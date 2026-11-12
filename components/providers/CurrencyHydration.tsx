"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/currency/store";

/**
 * Loads the persisted currency from localStorage after mount. The store starts
 * with `skipHydration: true` so server and client initial render match in USD,
 * then safely switches to the client's persisted currency without hydration mismatches.
 */
export function CurrencyHydration() {
  useEffect(() => {
    void useCurrencyStore.persist.rehydrate();
  }, []);

  return null;
}
