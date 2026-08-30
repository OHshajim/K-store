"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addProduct: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: () => number;
  subtotalCents: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct(product, quantity = 1) {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.stock,
                        item.quantity + quantity,
                      ),
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                image: product.images[0] ?? null,
                quantity: Math.min(product.stock, quantity),
                stock: product.stock,
              },
            ],
          };
        });
      },
      setQuantity(productId, quantity) {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId
                    ? {
                        ...item,
                        quantity: Math.min(item.stock, quantity),
                      }
                    : item,
                ),
        }));
      },
      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      clear() {
        set({ items: [] });
      },
      count() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      subtotalCents() {
        return get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0,
        );
      },
    }),
    {
      name: "kstore-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
