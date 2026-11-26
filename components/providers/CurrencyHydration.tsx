"use client";

import { useEffect } from "react";

/**
 * Clears any legacy multi-currency localStorage/cookie selection so all prices
 * consistently display in the store's canonical USD ($) currency.
 */
export function CurrencyHydration() {
  useEffect(() => {
    try {
      window.localStorage.removeItem("kstore-currency");
      document.cookie = "kstore_currency=; path=/; max-age=0; SameSite=Lax";
    } catch {}
  }, []);

  return null;
}

