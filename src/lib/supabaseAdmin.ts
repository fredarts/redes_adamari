import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  PRODUCTS,
  TACTEL_COLORS,
  SIZE_ORDER,
  type ProductId,
  type SizeCode,
} from "@/data/products";

export type PaymentStatus = "pending" | "approved" | "cancelled";
export type FulfillmentStatus =
  | "aguardando_pagamento"
  | "separando"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface InventoryItem {
  sku: string;
  productId: ProductId;
  productName: string;
  size: SizeCode;
  colorId: string;
  colorName: string;
  colorHex: string;
  stockQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  orderReference: string;
  sku: string;
  productId: ProductId;
  productName: string;
  size: SizeCode;
  colorId: string;
  colorName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddressRecord {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  uf: string;
}

export interface OrderRecord {
  id: string;
  orderReference: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  paymentMethod: "pix" | "card";
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: ShippingAddressRecord;
  city: string;
  uf: string;
  stockDeducted: boolean;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  city: string;
  uf: string;
  cep: string;
  totalSpent: number;
  ordersCount: number;
  acceptsMarketing: boolean;
  lastOrderDate: string;
  hasPendingPix: boolean;
}

export interface SocialPostRecord {
  id: string;
  prompt: string;
  caption: string;
  aspectRatio: "1:1" | "9:16" | "16:9";
  productId: ProductId;
  colorId: string;
  imageUrl: string;
  createdAt: string;
}

export function buildSku(
  productId: ProductId,
  size: SizeCode,
  colorId: string
): string {
  return `${productId}-${size}-${colorId}`;
}

// Singleton client for Supabase Server
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key || url.includes("seu-projeto")) {
    return null;
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClientInstance;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseServerClient() !== null;
}

// ============================================================================
// ESTADO PERSISTENTE EM MEMÓRIA (FALLBACK LOCAL QUANDO SUPABASE NÃO CONFIGURADO)
// ============================================================================
interface LocalStoreState {
  inventory: Map<string, InventoryItem>;
  orders: OrderRecord[];
  customers: CustomerRecord[];
  socialPosts: SocialPostRecord[];
}

const globalForAdmin = globalThis as unknown as {
  __adamariLocalStore?: LocalStoreState;
};

function createInitialInventoryMap(): Map<string, InventoryItem> {
  const map = new Map<string, InventoryItem>();
  const productIds: ProductId[] = ["rede-tradicional", "rede-mosquiteiro"];
  const now = new Date().toISOString();

  for (const productId of productIds) {
    const product = PRODUCTS[productId];
    for (const size of SIZE_ORDER) {
      for (const color of TACTEL_COLORS) {
        const sku = buildSku(productId, size, color.id);
        let defaultQty = 10;
        if (size === "GG") defaultQty = 15;
        else if (size === "G") defaultQty = 12;
        else if (size === "XGG") defaultQty = 8;

        // Deixa 2 variações com estoque baixo (2 un.) para demonstrar o alerta no Admin e na Loja
        if (
          (productId === "rede-tradicional" &&
            size === "GG" &&
            color.id === "azul-turquesa") ||
          (productId === "rede-mosquiteiro" &&
            size === "G" &&
            color.id === "verde-militar")
        ) {
          defaultQty = 2;
        }

        map.set(sku, {
          sku,
          productId,
          productName: product.shortName,
          size,
          colorId: color.id,
          colorName: color.name,
          colorHex: color.hex,
          stockQuantity: defaultQty,
          lowStockThreshold: 3,
          updatedAt: now,
        });
      }
    }
  }
  return map;
}

function createInitialDemoOrders(): {
  orders: OrderRecord[];
  customers: CustomerRecord[];
} {
  const demoOrders: OrderRecord[] = [
    {
      id: "ord-1001",
      orderReference: "ADA-904812",
      customerId: "cust-1",
      customerName: "Mariana Albuquerque",
      customerEmail: "mariana.albuquerque@email.com.br",
      customerPhone: "85999123456",
      customerCpf: "04829183310",
      paymentMethod: "pix",
      paymentStatus: "approved",
      fulfillmentStatus: "separando",
      trackingCode: "",
      subtotal: 299.8,
      shippingCost: 0,
      totalAmount: 299.8,
      shippingAddress: {
        cep: "60165-121",
        street: "Av. Beira Mar",
        number: "1840",
        complement: "Apto 902",
        neighborhood: "Meireles",
        city: "Fortaleza",
        uf: "CE",
      },
      city: "Fortaleza",
      uf: "CE",
      stockDeducted: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      items: [
        {
          id: "item-101",
          orderId: "ord-1001",
          orderReference: "ADA-904812",
          sku: "rede-tradicional-GG-azul-royal",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "GG",
          colorId: "azul-royal",
          colorName: "Azul Royal Vibrante",
          quantity: 1,
          unitPrice: 129.9,
          totalPrice: 129.9,
        },
        {
          id: "item-102",
          orderId: "ord-1001",
          orderReference: "ADA-904812",
          sku: "rede-mosquiteiro-GG-verde-militar",
          productId: "rede-mosquiteiro",
          productName: "Rede c/ Mosquiteiro",
          size: "GG",
          colorId: "verde-militar",
          colorName: "Verde Militar",
          quantity: 1,
          unitPrice: 169.9,
          totalPrice: 169.9,
        },
      ],
    },
    {
      id: "ord-1002",
      orderReference: "ADA-893105",
      customerId: "cust-2",
      customerName: "Carlos Eduardo Mendes",
      customerEmail: "carlos.mendes@gmail.com",
      customerPhone: "11988451290",
      customerCpf: "31948271890",
      paymentMethod: "card",
      paymentStatus: "approved",
      fulfillmentStatus: "enviado",
      trackingCode: "AA784512963BR",
      subtotal: 317.8,
      shippingCost: 0,
      totalAmount: 317.8,
      shippingAddress: {
        cep: "04538-132",
        street: "Rua Gomes de Carvalho",
        number: "911",
        complement: "Casa 2",
        neighborhood: "Vila Olímpia",
        city: "São Paulo",
        uf: "SP",
      },
      city: "São Paulo",
      uf: "SP",
      stockDeducted: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      items: [
        {
          id: "item-103",
          orderId: "ord-1002",
          orderReference: "ADA-893105",
          sku: "rede-tradicional-XGG-azul-turquesa",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "XGG",
          colorId: "azul-turquesa",
          colorName: "Azul Turquesa Piscina",
          quantity: 2,
          unitPrice: 158.9,
          totalPrice: 317.8,
        },
      ],
    },
    {
      id: "ord-1003",
      orderReference: "ADA-881420",
      customerId: "cust-3",
      customerName: "Fernanda Costa Lima",
      customerEmail: "fernanda.lima@hotmail.com",
      customerPhone: "81997214455",
      customerCpf: "09418273451",
      paymentMethod: "pix",
      paymentStatus: "approved",
      fulfillmentStatus: "entregue",
      trackingCode: "AA512398741BR",
      subtotal: 259.8,
      shippingCost: 0,
      totalAmount: 259.8,
      shippingAddress: {
        cep: "51020-000",
        street: "Av. Boa Viagem",
        number: "3200",
        complement: "Apto 401",
        neighborhood: "Boa Viagem",
        city: "Recife",
        uf: "PE",
      },
      city: "Recife",
      uf: "PE",
      stockDeducted: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      items: [
        {
          id: "item-104",
          orderId: "ord-1003",
          orderReference: "ADA-881420",
          sku: "rede-tradicional-GG-vermelho-vivo",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "GG",
          colorId: "vermelho-vivo",
          colorName: "Vermelho Vivo",
          quantity: 1,
          unitPrice: 129.9,
          totalPrice: 129.9,
        },
        {
          id: "item-105",
          orderId: "ord-1003",
          orderReference: "ADA-881420",
          sku: "rede-tradicional-GG-amarelo-sol",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "GG",
          colorId: "amarelo-sol",
          colorName: "Amarelo Sol",
          quantity: 1,
          unitPrice: 129.9,
          totalPrice: 129.9,
        },
      ],
    },
    {
      id: "ord-1004",
      orderReference: "ADA-879012",
      customerId: "cust-4",
      customerName: "Roberto Nogueira",
      customerEmail: "roberto.nog@uol.com.br",
      customerPhone: "31991827364",
      customerCpf: "61728394102",
      paymentMethod: "pix",
      paymentStatus: "pending",
      fulfillmentStatus: "aguardando_pagamento",
      trackingCode: "",
      subtotal: 189.9,
      shippingCost: 26.9,
      totalAmount: 216.8,
      shippingAddress: {
        cep: "30140-071",
        street: "Rua dos Inconfidentes",
        number: "450",
        complement: "",
        neighborhood: "Savassi",
        city: "Belo Horizonte",
        uf: "MG",
      },
      city: "Belo Horizonte",
      uf: "MG",
      stockDeducted: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      items: [
        {
          id: "item-106",
          orderId: "ord-1004",
          orderReference: "ADA-879012",
          sku: "rede-mosquiteiro-XGG-azul-marinho",
          productId: "rede-mosquiteiro",
          productName: "Rede c/ Mosquiteiro",
          size: "XGG",
          colorId: "azul-marinho",
          colorName: "Azul Marinho Noite",
          quantity: 1,
          unitPrice: 189.9,
          totalPrice: 189.9,
        },
      ],
    },
    {
      id: "ord-1005",
      orderReference: "ADA-864310",
      customerId: "cust-5",
      customerName: "Juliana Ribeiro",
      customerEmail: "juliana.ribeiro@gmail.com",
      customerPhone: "88996541230",
      customerCpf: "48291038472",
      paymentMethod: "pix",
      paymentStatus: "approved",
      fulfillmentStatus: "entregue",
      trackingCode: "AA102938475BR",
      subtotal: 239.8,
      shippingCost: 19.9,
      totalAmount: 259.7,
      shippingAddress: {
        cep: "62960-000",
        street: "Rua Padre Clicério",
        number: "215",
        complement: "Centro",
        neighborhood: "Centro",
        city: "Tabuleiro do Norte",
        uf: "CE",
      },
      city: "Tabuleiro do Norte",
      uf: "CE",
      stockDeducted: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      items: [
        {
          id: "item-107",
          orderId: "ord-1005",
          orderReference: "ADA-864310",
          sku: "rede-tradicional-G-rosa-pink",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "G",
          colorId: "rosa-pink",
          colorName: "Rosa Pink",
          quantity: 1,
          unitPrice: 119.9,
          totalPrice: 119.9,
        },
        {
          id: "item-108",
          orderId: "ord-1005",
          orderReference: "ADA-864310",
          sku: "rede-tradicional-G-azul-royal",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "G",
          colorId: "azul-royal",
          colorName: "Azul Royal Vibrante",
          quantity: 1,
          unitPrice: 119.9,
          totalPrice: 119.9,
        },
      ],
    },
  ];

  const demoCustomers: CustomerRecord[] = demoOrders.map((ord) => ({
    id: ord.customerId,
    name: ord.customerName,
    email: ord.customerEmail,
    phone: ord.customerPhone,
    cpf: ord.customerCpf,
    city: ord.city,
    uf: ord.uf,
    cep: ord.shippingAddress.cep,
    totalSpent: ord.paymentStatus === "approved" ? ord.totalAmount : 0,
    ordersCount: 1,
    acceptsMarketing: true,
    lastOrderDate: ord.createdAt,
    hasPendingPix: ord.paymentStatus === "pending",
  }));

  return { orders: demoOrders, customers: demoCustomers };
}

function getLocalStore(): LocalStoreState {
  if (!globalForAdmin.__adamariLocalStore) {
    const { orders, customers } = createInitialDemoOrders();
    globalForAdmin.__adamariLocalStore = {
      inventory: createInitialInventoryMap(),
      orders,
      customers,
      socialPosts: [
        {
          id: "post-demo-1",
          prompt:
            "Rede Tradicional Azul Turquesa armada em varanda ensolarada de praia no Ceará com coqueiros ao fundo",
          caption:
            "🌊 Nada supera a brisa da tarde no conforto de uma Rede Adamari em tecido Tactel!\n\n✨ Não esquenta nas costas\n✨ Seca rapidinho\n✨ Bolsinho lateral integrado p/ celular\n✨ Cordas trançadas 2,50mm com proteção UV\n\n👉 Garanta a sua com desconto no PIX (link na bio)!\n#RedesAdamari #RedeDeDormir #RedeTactel #TabuleiroDoNorte #Ceara #DescansoPerfeito",
          aspectRatio: "1:1",
          productId: "rede-tradicional",
          colorId: "azul-turquesa",
          imageUrl: "/images/rede-turquesa-sol.jpg",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ],
    };
  }
  return globalForAdmin.__adamariLocalStore;
}

// ============================================================================
// FUNÇÕES DE ESTOQUE (INVENTORY)
// ============================================================================

export async function getAllInventory(): Promise<{
  items: InventoryItem[];
  stockMap: Record<string, number>;
}> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("sku", { ascending: true });

      if (!error && data && data.length > 0) {
        const items: InventoryItem[] = [];
        const stockMap: Record<string, number> = {};

        for (const row of data) {
          const productId = row.product_id as ProductId;
          const size = row.size as SizeCode;
          const colorId = row.color_id as string;
          const product = PRODUCTS[productId];
          const color =
            TACTEL_COLORS.find((c) => c.id === colorId) || TACTEL_COLORS[0];

          const item: InventoryItem = {
            sku: row.sku,
            productId,
            productName: product?.shortName || productId,
            size,
            colorId,
            colorName: color.name,
            colorHex: color.hex,
            stockQuantity: Number(row.stock_quantity) || 0,
            lowStockThreshold: Number(row.low_stock_threshold) || 3,
            updatedAt: row.updated_at || new Date().toISOString(),
          };
          items.push(item);
          stockMap[item.sku] = item.stockQuantity;
          localStore.inventory.set(item.sku, item);
        }

        return { items, stockMap };
      }
    } catch (err) {
      console.error("[Inventory Supabase Fallback]:", err);
    }
  }

  const items = Array.from(localStore.inventory.values());
  const stockMap: Record<string, number> = {};
  for (const item of items) {
    stockMap[item.sku] = item.stockQuantity;
  }
  return { items, stockMap };
}

export async function updateInventoryUnits(
  updates: Array<{
    sku: string;
    stockQuantity: number;
    lowStockThreshold?: number;
  }>
): Promise<InventoryItem[]> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const updatedItems: InventoryItem[] = [];

  for (const u of updates) {
    const cleanQty = Math.max(0, Math.floor(Number(u.stockQuantity) || 0));
    const existing = localStore.inventory.get(u.sku);
    if (existing) {
      existing.stockQuantity = cleanQty;
      if (typeof u.lowStockThreshold === "number") {
        existing.lowStockThreshold = Math.max(0, u.lowStockThreshold);
      }
      existing.updatedAt = now;
      localStore.inventory.set(u.sku, existing);
      updatedItems.push(existing);
    }
  }

  if (supabase && updatedItems.length > 0) {
    try {
      const upsertRows = updatedItems.map((item) => ({
        sku: item.sku,
        product_id: item.productId,
        size: item.size,
        color_id: item.colorId,
        stock_quantity: item.stockQuantity,
        low_stock_threshold: item.lowStockThreshold,
        updated_at: item.updatedAt,
      }));
      await supabase.from("inventory").upsert(upsertRows, { onConflict: "sku" });
    } catch (err) {
      console.error("[Inventory Supabase Upsert Error]:", err);
    }
  }

  return updatedItems;
}

export async function validateAndDeductStock(
  requestedItems: Array<{
    productId: ProductId;
    size: SizeCode;
    colorId: string;
    quantity: number;
  }>
): Promise<{
  ok: boolean;
  error?: string;
  insufficientSku?: string;
  availableQuantity?: number;
}> {
  const { stockMap } = await getAllInventory();

  // Agrupa quantidades caso o mesmo SKU apareça mais de uma vez
  const neededBySku: Record<
    string,
    {
      productId: ProductId;
      size: SizeCode;
      colorId: string;
      quantity: number;
    }
  > = {};

  for (const item of requestedItems) {
    const sku = buildSku(item.productId, item.size, item.colorId);
    if (!neededBySku[sku]) {
      neededBySku[sku] = { ...item, quantity: 0 };
    }
    neededBySku[sku].quantity += item.quantity;
  }

  // 1. Verifica se todos têm estoque suficiente
  for (const [sku, req] of Object.entries(neededBySku)) {
    const available = stockMap[sku] ?? 0;
    if (available < req.quantity) {
      const product = PRODUCTS[req.productId];
      const color =
        TACTEL_COLORS.find((c) => c.id === req.colorId) || TACTEL_COLORS[0];

      const message =
        available === 0
          ? `A variação ${product.shortName} (Tam. ${req.size} • Cor ${color.name}) acabou de esgotar em nosso estoque. Por favor, escolha outra cor ou tamanho.`
          : `Temos apenas ${available} unidade(s) disponível(is) de ${product.shortName} (Tam. ${req.size} • Cor ${color.name}) em estoque.`;

      return {
        ok: false,
        error: message,
        insufficientSku: sku,
        availableQuantity: available,
      };
    }
  }

  // 2. Abate do estoque
  const updates = Object.entries(neededBySku).map(([sku, req]) => ({
    sku,
    stockQuantity: Math.max(0, (stockMap[sku] ?? 0) - req.quantity),
  }));

  await updateInventoryUnits(updates);
  return { ok: true };
}

export async function restoreOrderStock(
  items: Array<{ sku: string; quantity: number }>
): Promise<void> {
  const { stockMap } = await getAllInventory();
  const updates = items.map((item) => ({
    sku: item.sku,
    stockQuantity: (stockMap[item.sku] ?? 0) + item.quantity,
  }));
  await updateInventoryUnits(updates);
}

// ============================================================================
// FUNÇÕES DE PEDIDOS, CLIENTES E DASHBOARD
// ============================================================================

export async function recordNewOrder(params: {
  orderReference: string;
  paymentMethod: "pix" | "card";
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: ShippingAddressRecord;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  mpPreferenceId?: string;
  items: Array<{
    productId: ProductId;
    productName: string;
    size: SizeCode;
    colorId: string;
    colorName: string;
    quantity: number;
    unitPrice: number;
  }>;
}): Promise<OrderRecord> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}`;
  const customerId = `cust-${Date.now()}`;

  const orderItems: OrderItemRecord[] = params.items.map((it, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    orderId,
    orderReference: params.orderReference,
    sku: buildSku(it.productId, it.size, it.colorId),
    productId: it.productId,
    productName: it.productName,
    size: it.size,
    colorId: it.colorId,
    colorName: it.colorName,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    totalPrice: Number((it.unitPrice * it.quantity).toFixed(2)),
  }));

  const newOrder: OrderRecord = {
    id: orderId,
    orderReference: params.orderReference,
    customerId,
    customerName: params.customer.name,
    customerEmail: params.customer.email || "",
    customerPhone: params.customer.phone,
    customerCpf: params.customer.cpf || "",
    paymentMethod: params.paymentMethod,
    paymentStatus: "pending",
    fulfillmentStatus: "aguardando_pagamento",
    trackingCode: "",
    subtotal: params.subtotal,
    shippingCost: params.shippingCost,
    totalAmount: params.totalAmount,
    shippingAddress: params.address,
    city: params.address.city,
    uf: params.address.uf.toUpperCase(),
    stockDeducted: true,
    createdAt: now,
    updatedAt: now,
    items: orderItems,
  };

  // Salva na memória local
  localStore.orders.unshift(newOrder);

  const cleanPhone = params.customer.phone.replace(/\D/g, "");
  const existingCustomer = localStore.customers.find(
    (c) =>
      c.phone.replace(/\D/g, "") === cleanPhone ||
      (params.customer.email &&
        c.email.toLowerCase() === params.customer.email.toLowerCase())
  );

  if (existingCustomer) {
    existingCustomer.ordersCount += 1;
    existingCustomer.lastOrderDate = now;
    existingCustomer.hasPendingPix = params.paymentMethod === "pix";
    existingCustomer.city = params.address.city;
    existingCustomer.uf = params.address.uf.toUpperCase();
  } else {
    localStore.customers.unshift({
      id: customerId,
      name: params.customer.name,
      email: params.customer.email || "",
      phone: params.customer.phone,
      cpf: params.customer.cpf || "",
      city: params.address.city,
      uf: params.address.uf.toUpperCase(),
      cep: params.address.cep,
      totalSpent: 0,
      ordersCount: 1,
      acceptsMarketing: true,
      lastOrderDate: now,
      hasPendingPix: params.paymentMethod === "pix",
    });
  }

  // Persiste no Supabase quando configurado
  if (supabase) {
    try {
      const { data: custRow } = await supabase
        .from("customers")
        .insert({
          name: params.customer.name,
          email: params.customer.email || null,
          phone: params.customer.phone,
          cpf: params.customer.cpf || null,
          city: params.address.city,
          uf: params.address.uf.toUpperCase(),
          cep: params.address.cep,
          orders_count: 1,
        })
        .select("id")
        .single();

      const { data: orderRow } = await supabase
        .from("orders")
        .insert({
          order_reference: params.orderReference,
          customer_id: custRow?.id || null,
          customer_name: params.customer.name,
          customer_email: params.customer.email || null,
          customer_phone: params.customer.phone,
          customer_cpf: params.customer.cpf || null,
          payment_method: params.paymentMethod,
          payment_status: "pending",
          fulfillment_status: "aguardando_pagamento",
          subtotal: params.subtotal,
          shipping_cost: params.shippingCost,
          total_amount: params.totalAmount,
          shipping_address: params.address,
          city: params.address.city,
          uf: params.address.uf.toUpperCase(),
          mp_preference_id: params.mpPreferenceId || null,
          stock_deducted: true,
        })
        .select("id")
        .single();

      if (orderRow?.id) {
        await supabase.from("order_items").insert(
          orderItems.map((it) => ({
            order_id: orderRow.id,
            order_reference: params.orderReference,
            sku: it.sku,
            product_id: it.productId,
            product_name: it.productName,
            size: it.size,
            color_id: it.colorId,
            color_name: it.colorName,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            total_price: it.totalPrice,
          }))
        );
      }
    } catch (err) {
      console.error("[Supabase Insert Order Error]:", err);
    }
  }

  return newOrder;
}

export async function updateOrderByRefOrId(
  orderIdentifier: string,
  changes: {
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    trackingCode?: string;
    mpPaymentId?: string;
  }
): Promise<OrderRecord | null> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  const order = localStore.orders.find(
    (o) => o.id === orderIdentifier || o.orderReference === orderIdentifier
  );

  if (order) {
    const wasApprovedBefore = order.paymentStatus === "approved";

    if (changes.paymentStatus) {
      order.paymentStatus = changes.paymentStatus;
      if (
        changes.paymentStatus === "approved" &&
        order.fulfillmentStatus === "aguardando_pagamento"
      ) {
        order.fulfillmentStatus = "separando";
      }
    }

    if (changes.fulfillmentStatus) {
      order.fulfillmentStatus = changes.fulfillmentStatus;
    }

    if (typeof changes.trackingCode === "string") {
      order.trackingCode = changes.trackingCode.trim().toUpperCase();
      if (
        order.trackingCode &&
        (order.fulfillmentStatus === "separando" ||
          order.fulfillmentStatus === "aguardando_pagamento")
      ) {
        order.fulfillmentStatus = "enviado";
      }
    }

    // Se pedido foi cancelado e o estoque havia sido abatido, estorna as unidades para o estoque!
    if (
      (order.paymentStatus === "cancelled" ||
        order.fulfillmentStatus === "cancelado") &&
      order.stockDeducted
    ) {
      order.stockDeducted = false;
      await restoreOrderStock(
        order.items.map((i) => ({ sku: i.sku, quantity: i.quantity }))
      );
    }

    // Atualiza total gasto do cliente se virou approved
    if (!wasApprovedBefore && order.paymentStatus === "approved") {
      const cust = localStore.customers.find(
        (c) =>
          c.id === order.customerId ||
          c.phone.replace(/\D/g, "") === order.customerPhone.replace(/\D/g, "")
      );
      if (cust) {
        cust.totalSpent = Number(
          (cust.totalSpent + order.totalAmount).toFixed(2)
        );
        cust.hasPendingPix = false;
      }
    }

    order.updatedAt = now;
  }

  if (supabase) {
    try {
      const updatePayload: Record<string, unknown> = { updated_at: now };
      if (changes.paymentStatus)
        updatePayload.payment_status = changes.paymentStatus;
      if (changes.fulfillmentStatus)
        updatePayload.fulfillment_status = changes.fulfillmentStatus;
      if (typeof changes.trackingCode === "string")
        updatePayload.tracking_code = changes.trackingCode.trim().toUpperCase();
      if (changes.mpPaymentId)
        updatePayload.mp_payment_id = changes.mpPaymentId;
      if (order) {
        updatePayload.stock_deducted = order.stockDeducted;
      }

      await supabase
        .from("orders")
        .update(updatePayload)
        .or(`id.eq.${orderIdentifier},order_reference.eq.${orderIdentifier}`);
    } catch (err) {
      console.error("[Supabase Update Order Error]:", err);
    }
  }

  return order || null;
}

export async function saveSocialPostRecord(
  post: Omit<SocialPostRecord, "id" | "createdAt">
): Promise<SocialPostRecord> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();
  const record: SocialPostRecord = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  localStore.socialPosts.unshift(record);

  if (supabase) {
    try {
      await supabase.from("social_posts").insert({
        prompt: record.prompt,
        caption: record.caption,
        aspect_ratio: record.aspectRatio,
        product_id: record.productId,
        color_id: record.colorId,
        image_url: record.imageUrl,
      });
    } catch (err) {
      console.error("[Supabase Insert Social Post Error]:", err);
    }
  }

  return record;
}

export async function getAdminDashboardAnalytics() {
  const localStore = getLocalStore();
  const { items: inventoryItems } = await getAllInventory();

  const orders = localStore.orders;
  const approvedOrders = orders.filter((o) => o.paymentStatus === "approved");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");

  const totalRevenue = approvedOrders.reduce(
    (acc, o) => acc + o.totalAmount,
    0
  );
  const pendingRevenue = pendingOrders.reduce(
    (acc, o) => acc + o.totalAmount,
    0
  );
  const averageTicket =
    approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  let totalUnitsSold = 0;

  // 1. Ranking por Modelo
  const byProduct: Record<
    ProductId,
    {
      productId: ProductId;
      name: string;
      unitsSold: number;
      revenue: number;
    }
  > = {
    "rede-tradicional": {
      productId: "rede-tradicional",
      name: PRODUCTS["rede-tradicional"].shortName,
      unitsSold: 0,
      revenue: 0,
    },
    "rede-mosquiteiro": {
      productId: "rede-mosquiteiro",
      name: PRODUCTS["rede-mosquiteiro"].shortName,
      unitsSold: 0,
      revenue: 0,
    },
  };

  // 2. Ranking por Tamanho (M, G, GG, XGG)
  const bySize: Record<
    SizeCode,
    { size: SizeCode; label: string; unitsSold: number; revenue: number }
  > = {
    M: { size: "M", label: "Tamanho M (Compacta)", unitsSold: 0, revenue: 0 },
    G: { size: "G", label: "Tamanho G (Padrão)", unitsSold: 0, revenue: 0 },
    GG: {
      size: "GG",
      label: "Tamanho GG (Casal / Mais Vendido)",
      unitsSold: 0,
      revenue: 0,
    },
    XGG: {
      size: "XGG",
      label: "Tamanho XGG (Família Gigante)",
      unitsSold: 0,
      revenue: 0,
    },
  };

  // 3. Ranking pelas 10 Cores de Tactel
  const byColorMap: Record<
    string,
    {
      colorId: string;
      colorName: string;
      hex: string;
      unitsSold: number;
      revenue: number;
      currentStock: number;
    }
  > = {};

  for (const c of TACTEL_COLORS) {
    const colorStock = inventoryItems
      .filter((inv) => inv.colorId === c.id)
      .reduce((acc, inv) => acc + inv.stockQuantity, 0);

    byColorMap[c.id] = {
      colorId: c.id,
      colorName: c.name,
      hex: c.hex,
      unitsSold: 0,
      revenue: 0,
      currentStock: colorStock,
    };
  }

  // 4. Ranking por Estado (UF) e Cidade
  const byStateMap: Record<
    string,
    {
      uf: string;
      ordersCount: number;
      unitsSold: number;
      revenue: number;
      topCities: Record<string, number>;
    }
  > = {};

  // Contabiliza a partir dos pedidos aprovados (ou todos não cancelados para visão comercial)
  const validOrders = orders.filter((o) => o.paymentStatus !== "cancelled");

  for (const ord of validOrders) {
    const uf = (ord.uf || "CE").toUpperCase();
    if (!byStateMap[uf]) {
      byStateMap[uf] = {
        uf,
        ordersCount: 0,
        unitsSold: 0,
        revenue: 0,
        topCities: {},
      };
    }
    byStateMap[uf].ordersCount += 1;
    byStateMap[uf].revenue += ord.totalAmount;
    byStateMap[uf].topCities[ord.city] =
      (byStateMap[uf].topCities[ord.city] || 0) + 1;

    for (const item of ord.items) {
      totalUnitsSold += item.quantity;
      byStateMap[uf].unitsSold += item.quantity;

      if (byProduct[item.productId]) {
        byProduct[item.productId].unitsSold += item.quantity;
        byProduct[item.productId].revenue += item.totalPrice;
      }

      if (bySize[item.size]) {
        bySize[item.size].unitsSold += item.quantity;
        bySize[item.size].revenue += item.totalPrice;
      }

      if (byColorMap[item.colorId]) {
        byColorMap[item.colorId].unitsSold += item.quantity;
        byColorMap[item.colorId].revenue += item.totalPrice;
      }
    }
  }

  // Resumo de Estoque
  const totalStockUnits = inventoryItems.reduce(
    (acc, i) => acc + i.stockQuantity,
    0
  );
  const outOfStockCount = inventoryItems.filter(
    (i) => i.stockQuantity === 0
  ).length;
  const lowStockCount = inventoryItems.filter(
    (i) => i.stockQuantity > 0 && i.stockQuantity <= i.lowStockThreshold
  ).length;

  return {
    supabaseConnected: isSupabaseConfigured(),
    kpis: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingRevenue: Number(pendingRevenue.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      totalOrders: orders.length,
      approvedOrdersCount: approvedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      toShipCount: orders.filter((o) => o.fulfillmentStatus === "separando")
        .length,
      inTransitCount: orders.filter((o) => o.fulfillmentStatus === "enviado")
        .length,
      deliveredCount: orders.filter((o) => o.fulfillmentStatus === "entregue")
        .length,
      totalUnitsSold,
      totalStockUnits,
      outOfStockCount,
      lowStockCount,
    },
    rankings: {
      products: Object.values(byProduct).sort(
        (a, b) => b.unitsSold - a.unitsSold
      ),
      sizes: SIZE_ORDER.map((s) => bySize[s]),
      colors: Object.values(byColorMap).sort(
        (a, b) => b.unitsSold - a.unitsSold
      ),
      states: Object.values(byStateMap)
        .map((st) => ({
          uf: st.uf,
          ordersCount: st.ordersCount,
          unitsSold: st.unitsSold,
          revenue: Number(st.revenue.toFixed(2)),
          cities: Object.entries(st.topCities)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count),
        }))
        .sort((a, b) => b.revenue - a.revenue),
    },
    orders,
    customers: localStore.customers,
    inventory: inventoryItems,
    socialPosts: localStore.socialPosts,
  };
}
