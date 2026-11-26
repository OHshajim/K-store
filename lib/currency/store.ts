"use client";

import { create } from "zustand";
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
    code: "USD",
    symbol: "$",
    rate: 1.0,
    label: "United States (USD)",
    flag: "🇺🇸",
  },
  GBP: {
    code: "USD",
    symbol: "$",
    rate: 1.0,
    label: "United States (USD)",
    flag: "🇺🇸",
  },
};

type CurrencyStore = {
  currency: SupportedCurrency;
  hasHydrated: boolean;
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (centsInUsd: number) => string;
  convertCents: (centsInUsd: number) => number;
};

export const useCurrencyStore = create<CurrencyStore>()(() => ({
  currency: "USD",
  hasHydrated: true,
  setCurrency: () => {},
  convertCents: (centsInUsd) => Math.round(centsInUsd),
  formatPrice: (centsInUsd) => {
    const amount = centsInUsd / 100;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  },
}));

