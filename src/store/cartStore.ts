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
  openDrawer: () => void;
  closeDrawer: () => void;
  setPaymentMethod: (method: "pix" | "card") => void;
  addItem: (
    productId: ProductId,
    size: SizeCode,
    colorId: string,
    quantity?: number
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
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

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      paymentMethod: "pix",
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

      addItem: (productId, size, colorId, quantity = 1) => {
        const cartItemId = getCartItemKey(productId, size, colorId);
        const existing = get().items.find((i) => i.cartItemId === cartItemId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartItemId === cartItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
            isDrawerOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              { cartItemId, productId, size, colorId, quantity },
            ],
            isDrawerOpen: true,
          });
        }
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter((i) => i.cartItemId !== cartItemId),
          });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
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
 * Helper para enriquecer os itens da sacola com detalhes do produto estático
 */
export function resolveCartDetails(
  items: CartItem[],
  paymentMethod: "pix" | "card"
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

      const unitPrice =
        paymentMethod === "pix" ? sizeSpec.pricePix : sizeSpec.priceCard;
      const lineTotal = unitPrice * item.quantity;

      totalItemsCount += item.quantity;
      subtotalCard += sizeSpec.priceCard * item.quantity;
      subtotalPix += sizeSpec.pricePix * item.quantity;

      return {
        ...item,
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

