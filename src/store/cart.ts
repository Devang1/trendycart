"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
};

type CartState = {
  items: Array<CartProduct & { quantity: number }>;
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
              )
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
          )
        })),
      clear: () => set({ items: [] })
    }),
    { name: "trendycart-cart" }
  )
);
