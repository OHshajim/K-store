"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, Coupon } from "@/lib/types";

type CartState = {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addProduct: (
    product: Product,
    quantity?: number,
    options?: { selectedColor?: string; selectedMaterial?: string }
  ) => void;
  setQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  removeItem: (productId: string, variantKey?: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clear: () => void;
  count: () => number;
  subtotalCents: () => number;
  discountCents: () => number;
  shippingCents: () => number;
  totalCents: () => number;
  freeShippingProgress: () => { percent: number; remainingCents: number; qualified: boolean };
};

const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // $150.00
const STANDARD_SHIPPING_CENTS = 1500; // $15.00

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addProduct(product, quantity = 1, options) {
        set((state) => {
          const selectedColor = options?.selectedColor;
          const selectedMaterial = options?.selectedMaterial;

          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === product.id &&
              item.selectedColor === selectedColor &&
              item.selectedMaterial === selectedMaterial
          );

          if (existingIndex > -1) {
            const nextItems = [...state.items];
            const current = nextItems[existingIndex];
            nextItems[existingIndex] = {
              ...current,
              quantity: Math.min(product.stock, current.quantity + quantity),
            };
            return { items: nextItems, isCartOpen: true };
          }

          const newItem: CartItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.price_cents,
            image: product.images?.[0] ?? "",
            quantity: Math.min(product.stock, quantity),
            stock: product.stock,
            selectedColor,
            selectedMaterial,
          };

          return {
            items: [...state.items, newItem],
            isCartOpen: true,
          };
        });
      },

      setQuantity(productId, quantity, variantKey) {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => {
                  const matches =
                    item.productId === productId &&
                    (!variantKey || item.selectedColor === variantKey);
                  return !matches;
                })
              : state.items.map((item) => {
                  const matches =
                    item.productId === productId &&
                    (!variantKey || item.selectedColor === variantKey);
                  return matches
                    ? { ...item, quantity: Math.min(item.stock, quantity) }
                    : item;
                }),
        }));
      },

      removeItem(productId, variantKey) {
        set((state) => ({
          items: state.items.filter((item) => {
            const matches =
              item.productId === productId &&
              (!variantKey || item.selectedColor === variantKey);
            return !matches;
          }),
        }));
      },

      async applyCoupon(code) {
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode) {
          return { success: false, message: "Please enter a promotional code." };
        }

        const subtotal = get().subtotalCents();
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: cleanCode, subtotalCents: subtotal }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.coupon) {
            set({ appliedCoupon: data.coupon });
            return { success: true, message: data.message };
          }
          return {
            success: false,
            message: data.message || "Invalid or expired promotional code.",
          };
        } catch {
          return {
            success: false,
            message: "Unable to validate code at this moment.",
          };
        }
      },

      removeCoupon() {
        set({ appliedCoupon: null });
      },

      clear() {
        set({ items: [], appliedCoupon: null });
      },

      count() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotalCents() {
        return get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0
        );
      },

      discountCents() {
        const subtotal = get().subtotalCents();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        if (subtotal < coupon.min_spend_cents) return 0;
        return Math.round((subtotal * coupon.discount_percent) / 100);
      },

      shippingCents() {
        const subtotal = get().subtotalCents();
        if (subtotal === 0) return 0;
        if (subtotal >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
        return STANDARD_SHIPPING_CENTS;
      },

      totalCents() {
        const subtotal = get().subtotalCents();
        if (subtotal === 0) return 0;
        const discount = get().discountCents();
        const shipping = get().shippingCents();
        return Math.max(0, subtotal - discount + shipping);
      },

      freeShippingProgress() {
        const subtotal = get().subtotalCents();
        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);
        const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100));
        return {
          percent,
          remainingCents: remaining,
          qualified: remaining === 0 && subtotal > 0,
        };
      },
    }),
    {
      name: "kstore-cart-v2",
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
