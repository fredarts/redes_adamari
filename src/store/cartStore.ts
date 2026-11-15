"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PRODUCTS,
  TACTEL_COLORS,
  type ProductId,
  type SizeCode,
} from "@/data/products";

export interface CartItem {
  /** Chave única: ex. rede-mosquiteiro__GG__verde-militar */
  cartItemId: string;
  productId: ProductId;
  size: SizeCode;
  colorId: string;
  quantity: number;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface CartStoreState {
  items: CartItem[];
  isDrawerOpen: boolean;
  paymentMethod: "pix" | "card";
  address: ShippingAddress;
  customer: CustomerData;
  /** Mapa de estoque em tempo real: sku (productId-size-colorId) -> quantidade */
  stockMap: Record<string, number>;
  stockLoaded: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setPaymentMethod: (method: "pix" | "card") => void;
  setStockMap: (map: Record<string, number>) => void;
  fetchStock: () => Promise<void>;
  addItem: (
    productId: ProductId,
    size: SizeCode,
    colorId: string,
    quantity?: number,
    maxStock?: number
  ) => void;
  updateQuantity: (
    cartItemId: string,
    quantity: number,
    maxStock?: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setAddress: (partial: Partial<ShippingAddress>) => void;
  setCustomer: (partial: Partial<CustomerData>) => void;
}

export function getCartItemKey(
  productId: ProductId,
  size: SizeCode,
  colorId: string
): string {
  return `${productId}__${size}__${colorId}`;
}

export function getSkuKey(
  productId: ProductId,
  size: SizeCode,
  colorId: string
): string {
  return `${productId}-${size}-${colorId}`;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      paymentMethod: "pix",
      stockMap: {},
      stockLoaded: false,
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        uf: "",
      },
      customer: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setStockMap: (map) => set({ stockMap: map, stockLoaded: true }),

      fetchStock: async () => {
        try {
          const res = await fetch("/api/inventory", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.stockMap) {
              set({ stockMap: data.stockMap, stockLoaded: true });
            }
          }
        } catch {
          // Mantém estado anterior em caso de falha de rede
        }
      },

      addItem: (productId, size, colorId, quantity = 1, maxStock) => {
        const sku = getSkuKey(productId, size, colorId);
        const liveLimit =
          typeof maxStock === "number"
            ? maxStock
            : get().stockLoaded
              ? (get().stockMap[sku] ?? 10)
              : 50;

        if (liveLimit <= 0) {
          return;
        }

        const cartItemId = getCartItemKey(productId, size, colorId);
        const existing = get().items.find((i) => i.cartItemId === cartItemId);
        if (existing) {
          const nextQty = Math.min(liveLimit, existing.quantity + quantity);
          set({
            items: get().items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: nextQty } : i
            ),
            isDrawerOpen: true,
          });
        } else {
          const nextQty = Math.min(liveLimit, quantity);
          set({
            items: [
              ...get().items,
              { cartItemId, productId, size, colorId, quantity: nextQty },
            ],
            isDrawerOpen: true,
          });
        }
      },

      updateQuantity: (cartItemId, quantity, maxStock) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter((i) => i.cartItemId !== cartItemId),
          });
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.cartItemId !== cartItemId) return i;
            const sku = getSkuKey(i.productId, i.size, i.colorId);
            const limit =
              typeof maxStock === "number"
                ? maxStock
                : get().stockLoaded
                  ? (get().stockMap[sku] ?? 50)
                  : 50;
            return { ...i, quantity: Math.min(limit, quantity) };
          }),
        });
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter((i) => i.cartItemId !== cartItemId),
        });
      },

      clearCart: () => set({ items: [] }),

      setAddress: (partial) =>
        set((state) => ({
          address: { ...state.address, ...partial },
        })),

      setCustomer: (partial) =>
        set((state) => ({
          customer: { ...state.customer, ...partial },
        })),
    }),
    {
      name: "redes-adamari-cart-v1",
      partialize: (state) => ({
        items: state.items,
        paymentMethod: state.paymentMethod,
        address: state.address,
        customer: state.customer,
      }),
    }
  )
);

/**
 * Helper para enriquecer os itens da sacola com detalhes do produto estático + estoque
 */
export function resolveCartDetails(
  items: CartItem[],
  paymentMethod: "pix" | "card",
  stockMap?: Record<string, number>,
  stockLoaded?: boolean
) {
  let totalItemsCount = 0;
  let subtotalCard = 0;
  let subtotalPix = 0;

  const detailedItems = items
    .map((item) => {
      const product = PRODUCTS[item.productId];
      if (!product) return null;
      const sizeSpec = product.sizes[item.size];
      if (!sizeSpec) return null;
      const color =
        TACTEL_COLORS.find((c) => c.id === item.colorId) || TACTEL_COLORS[0];

      const sku = getSkuKey(item.productId, item.size, item.colorId);
      const availableStock =
        stockLoaded && stockMap ? (stockMap[sku] ?? 10) : 15;

      const unitPrice =
        paymentMethod === "pix" ? sizeSpec.pricePix : sizeSpec.priceCard;
      const lineTotal = unitPrice * item.quantity;

      totalItemsCount += item.quantity;
      subtotalCard += sizeSpec.priceCard * item.quantity;
      subtotalPix += sizeSpec.pricePix * item.quantity;

      return {
        ...item,
        sku,
        availableStock,
        product,
        sizeSpec,
        color,
        unitPrice,
        lineTotal,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const activeSubtotal = paymentMethod === "pix" ? subtotalPix : subtotalCard;
  const pixSavings = Math.max(0, subtotalCard - subtotalPix);

  return {
    detailedItems,
    totalItemsCount,
    subtotalCard,
    subtotalPix,
    activeSubtotal,
    pixSavings,
  };
}
