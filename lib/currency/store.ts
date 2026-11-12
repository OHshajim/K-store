"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedCurrency, CurrencyConfig } from "@/lib/types";

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    rate: 1.0,
    label: "United States (USD)",
    flag: "🇺🇸",
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    rate: 1.36,
    label: "Canada (CAD)",
    flag: "🇨🇦",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    rate: 0.79,
    label: "United Kingdom (GBP)",
    flag: "🇬🇧",
  },
};

type CurrencyStore = {
  currency: SupportedCurrency;
  hasHydrated: boolean;
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (centsInUsd: number) => string;
  convertCents: (centsInUsd: number) => number;
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      hasHydrated: false,
      setCurrency: (currency) => {
        set({ currency });
        if (typeof document !== "undefined") {
          document.cookie = `kstore_currency=${currency}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },
      convertCents: (centsInUsd) => {
        const curr = get().hasHydrated ? get().currency : "USD";
        const rate = CURRENCIES[curr]?.rate ?? 1.0;
        return Math.round(centsInUsd * rate);
      },
      formatPrice: (centsInUsd) => {
        const curr = get().hasHydrated ? get().currency : "USD";
        const config = CURRENCIES[curr] ?? CURRENCIES.USD;
        const converted = (centsInUsd * config.rate) / 100;
        try {
          return new Intl.NumberFormat(
            curr === "GBP" ? "en-GB" : curr === "CAD" ? "en-CA" : "en-US",
            {
              style: "currency",
              currency: curr,
              currencyDisplay: "symbol",
            }
          ).format(converted);
        } catch {
          return `${config.symbol}${converted.toFixed(2)}`;
        }
      },
    }),
    {
      name: "kstore-currency",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

