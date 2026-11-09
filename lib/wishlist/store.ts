"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

type WishlistStore = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().items.some((i) => i.id === product.id)) {
          set({ items: [product, ...get().items] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },
      toggleItem: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== product.id) });
        } else {
          set({ items: [product, ...get().items] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "kstore-wishlist",
    }
  )
);

