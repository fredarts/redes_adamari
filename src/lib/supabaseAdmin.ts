import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ACCESSORY_PRODUCT_IDS,
  PRODUCTS,
  TACTEL_COLORS,
  SIZE_ORDER,
  isAccessoryProduct,
  resolveProductColor,
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
  address: ShippingAddressRecord;
  notes: string;
  tags: string[];
  totalSpent: number;
  ordersCount: number;
  totalUnitsBought: number;
  acceptsMarketing: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
  hasPendingPix: boolean;
  preferredPaymentMethod: "pix" | "card";
  purchaseHistory?: OrderRecord[];
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

  // Adiciona os 3 Acessórios de Instalação no mapa de estoque
  for (const accId of ACCESSORY_PRODUCT_IDS) {
    const product = PRODUCTS[accId];
    const color = resolveProductColor(accId, "padrao");
    const sku = buildSku(accId, "UNICO", "padrao");
    const initialQty = accId === "corda-nylon" ? 30 : 25;

    map.set(sku, {
      sku,
      productId: accId,
      productName: product.shortName,
      size: "UNICO",
      colorId: "padrao",
      colorName: color.name,
      colorHex: color.hex,
      stockQuantity: initialQty,
      lowStockThreshold: 4,
      updatedAt: now,
    });
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
      customerCpf: "048.291.833-10",
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
      customerCpf: "319.482.718-90",
      paymentMethod: "card",
      paymentStatus: "approved",
      fulfillmentStatus: "separando",
      trackingCode: "",
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
      customerCpf: "094.182.734-51",
      paymentMethod: "pix",
      paymentStatus: "approved",
      fulfillmentStatus: "separando",
      trackingCode: "",
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
      customerCpf: "617.283.941-02",
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
      customerCpf: "482.910.384-72",
      paymentMethod: "pix",
      paymentStatus: "approved",
      fulfillmentStatus: "separando",
      trackingCode: "",
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
    // Segunda compra histórica da Mariana Albuquerque para demonstrar histórico multi-compra!
    {
      id: "ord-1000",
      orderReference: "ADA-810294",
      customerId: "cust-1",
      customerName: "Mariana Albuquerque",
      customerEmail: "mariana.albuquerque@email.com.br",
      customerPhone: "85999123456",
      customerCpf: "048.291.833-10",
      paymentMethod: "card",
      paymentStatus: "approved",
      fulfillmentStatus: "separando",
      trackingCode: "",
      subtotal: 144.9,
      shippingCost: 19.9,
      totalAmount: 164.8,
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString(),
      items: [
        {
          id: "item-100",
          orderId: "ord-1000",
          orderReference: "ADA-810294",
          sku: "rede-tradicional-GG-laranja-tropical",
          productId: "rede-tradicional",
          productName: "Rede Tradicional",
          size: "GG",
          colorId: "laranja-tropical",
          colorName: "Laranja Tropical",
          quantity: 1,
          unitPrice: 144.9,
          totalPrice: 144.9,
        },
      ],
    },
  ];

  const customersMap = new Map<string, CustomerRecord>();

  for (const ord of demoOrders) {
    const existing = customersMap.get(ord.customerId);
    const ordUnits = ord.items.reduce((acc, i) => acc + i.quantity, 0);

    if (existing) {
      existing.ordersCount += 1;
      existing.totalUnitsBought += ordUnits;
      if (ord.paymentStatus === "approved") {
        existing.totalSpent = Number(
          (existing.totalSpent + ord.totalAmount).toFixed(2)
        );
      }
      if (ord.createdAt < existing.firstOrderDate) {
        existing.firstOrderDate = ord.createdAt;
      }
      if (ord.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = ord.createdAt;
      }
      if (existing.ordersCount >= 2 && !existing.tags.includes("Cliente VIP")) {
        existing.tags.push("Cliente VIP", "Recorrente");
      }
    } else {
      customersMap.set(ord.customerId, {
        id: ord.customerId,
        name: ord.customerName,
        email: ord.customerEmail,
        phone: ord.customerPhone,
        cpf: ord.customerCpf,
        city: ord.city,
        uf: ord.uf,
        cep: ord.shippingAddress.cep,
        address: { ...ord.shippingAddress },
        notes:
          ord.customerId === "cust-1"
            ? "Cliente fiel de Fortaleza/CE. Comprou para casa de praia e voltou para comprar mais duas redes GG."
            : ord.paymentStatus === "pending"
              ? "Aguardando confirmação do PIX. Entrar em contato pelo WhatsApp."
              : "Cliente cadastrado automaticamente via compra na loja online.",
        tags:
          ord.paymentStatus === "pending"
            ? ["Aguardando PIX"]
            : ["Compra Online"],
        totalSpent: ord.paymentStatus === "approved" ? ord.totalAmount : 0,
        ordersCount: 1,
        totalUnitsBought: ordUnits,
        acceptsMarketing: true,
        firstOrderDate: ord.createdAt,
        lastOrderDate: ord.createdAt,
        hasPendingPix: ord.paymentStatus === "pending",
        preferredPaymentMethod: ord.paymentMethod,
      });
    }
  }

  return {
    orders: demoOrders,
    customers: Array.from(customersMap.values()),
  };
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

/**
 * Sincroniza e enriquece cada cliente com o histórico completo de pedidos dele
 */
function buildEnrichedCustomers(
  customers: CustomerRecord[],
  orders: OrderRecord[]
): CustomerRecord[] {
  return customers.map((cust) => {
    const cleanPhone = cust.phone.replace(/\D/g, "");
    const cleanCpf = (cust.cpf || "").replace(/\D/g, "");
    const cleanEmail = (cust.email || "").trim().toLowerCase();

    const customerOrders = orders
      .filter((o) => {
        if (o.customerId === cust.id) return true;
        if (cleanPhone && o.customerPhone.replace(/\D/g, "") === cleanPhone)
          return true;
        if (
          cleanCpf &&
          cleanCpf.length >= 11 &&
          (o.customerCpf || "").replace(/\D/g, "") === cleanCpf
        )
          return true;
        if (
          cleanEmail &&
          (o.customerEmail || "").trim().toLowerCase() === cleanEmail
        )
          return true;
        return false;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (customerOrders.length === 0) {
      return {
        ...cust,
        purchaseHistory: [],
      };
    }

    const approvedOrders = customerOrders.filter(
      (o) => o.paymentStatus === "approved"
    );
    const totalSpent = Number(
      approvedOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)
    );
    const totalUnitsBought = customerOrders
      .filter((o) => o.paymentStatus !== "cancelled")
      .reduce(
        (acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0),
        0
      );

    const hasPendingPix = customerOrders.some(
      (o) => o.paymentStatus === "pending"
    );
    const pixCount = customerOrders.filter(
      (o) => o.paymentMethod === "pix"
    ).length;
    const cardCount = customerOrders.filter(
      (o) => o.paymentMethod === "card"
    ).length;

    const latestOrder = customerOrders[0];
    const oldestOrder = customerOrders[customerOrders.length - 1];

    return {
      ...cust,
      totalSpent,
      ordersCount: customerOrders.length,
      totalUnitsBought,
      hasPendingPix,
      firstOrderDate: oldestOrder.createdAt,
      lastOrderDate: latestOrder.createdAt,
      preferredPaymentMethod: pixCount >= cardCount ? "pix" : "card",
      purchaseHistory: customerOrders,
    };
  });
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
        for (const row of data) {
          const productId = row.product_id as ProductId;
          const size = row.size as SizeCode;
          const colorId = row.color_id as string;
          const product = PRODUCTS[productId];
          const color = resolveProductColor(productId, colorId);

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
          localStore.inventory.set(item.sku, item);
        }

        const allItems = Array.from(localStore.inventory.values());
        const stockMap: Record<string, number> = {};
        for (const item of allItems) {
          stockMap[item.sku] = item.stockQuantity;
        }

        return { items: allItems, stockMap };
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

  for (const [sku, req] of Object.entries(neededBySku)) {
    const available = stockMap[sku] ?? 0;
    if (available < req.quantity) {
      const product = PRODUCTS[req.productId];
      const color = resolveProductColor(req.productId, req.colorId);
      const isAcc = isAccessoryProduct(req.productId);

      const message =
        available === 0
          ? isAcc
            ? `O item ${product.shortName} acabou de esgotar em nosso estoque.`
            : `A variação ${product.shortName} (Tam. ${req.size} • Cor ${color.name}) acabou de esgotar em nosso estoque. Por favor, escolha outra cor ou tamanho.`
          : isAcc
            ? `Temos apenas ${available} unidade(s) disponível(is) de ${product.shortName} em estoque.`
            : `Temos apenas ${available} unidade(s) disponível(is) de ${product.shortName} (Tam. ${req.size} • Cor ${color.name}) em estoque.`;

      return {
        ok: false,
        error: message,
        insufficientSku: sku,
        availableQuantity: available,
      };
    }
  }

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
// FUNÇÕES DE PEDIDOS, CLIENTES (CRM 360°) E DASHBOARD
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

  const cleanPhone = params.customer.phone.replace(/\D/g, "");
  const cleanCpf = (params.customer.cpf || "").replace(/\D/g, "");
  const existingCustomer = localStore.customers.find(
    (c) =>
      c.phone.replace(/\D/g, "") === cleanPhone ||
      (cleanCpf.length === 11 && c.cpf.replace(/\D/g, "") === cleanCpf) ||
      (params.customer.email &&
        c.email.toLowerCase() === params.customer.email.toLowerCase())
  );

  const customerId = existingCustomer
    ? existingCustomer.id
    : `cust-${Date.now()}`;

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

  localStore.orders.unshift(newOrder);
  const unitsBoughtNow = orderItems.reduce((acc, i) => acc + i.quantity, 0);

  if (existingCustomer) {
    existingCustomer.name = params.customer.name || existingCustomer.name;
    existingCustomer.email = params.customer.email || existingCustomer.email;
    existingCustomer.cpf = params.customer.cpf || existingCustomer.cpf;
    existingCustomer.address = { ...params.address };
    existingCustomer.city = params.address.city;
    existingCustomer.uf = params.address.uf.toUpperCase();
    existingCustomer.cep = params.address.cep;
    existingCustomer.ordersCount += 1;
    existingCustomer.totalUnitsBought += unitsBoughtNow;
    existingCustomer.lastOrderDate = now;
    existingCustomer.hasPendingPix = params.paymentMethod === "pix";
    if (
      existingCustomer.ordersCount >= 2 &&
      !existingCustomer.tags.includes("Cliente VIP")
    ) {
      existingCustomer.tags.push("Cliente VIP");
    }
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
      address: { ...params.address },
      notes: "Cadastrado automaticamente na finalização da compra.",
      tags: ["Compra Online"],
      totalSpent: 0,
      ordersCount: 1,
      totalUnitsBought: unitsBoughtNow,
      acceptsMarketing: true,
      firstOrderDate: now,
      lastOrderDate: now,
      hasPendingPix: params.paymentMethod === "pix",
      preferredPaymentMethod: params.paymentMethod,
    });
  }

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
          address: params.address,
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

export async function updateCustomerRecord(
  customerId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    address?: ShippingAddressRecord;
    notes?: string;
    tags?: string[];
    acceptsMarketing?: boolean;
  }
): Promise<CustomerRecord | null> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();

  const cust = localStore.customers.find((c) => c.id === customerId);
  if (!cust) return null;

  if (typeof updates.name === "string" && updates.name.trim()) {
    cust.name = updates.name.trim();
  }
  if (typeof updates.email === "string") {
    cust.email = updates.email.trim();
  }
  if (typeof updates.phone === "string" && updates.phone.trim()) {
    cust.phone = updates.phone.trim();
  }
  if (typeof updates.cpf === "string") {
    cust.cpf = updates.cpf.trim();
  }
  if (updates.address) {
    cust.address = { ...cust.address, ...updates.address };
    cust.city = cust.address.city || cust.city;
    cust.uf = (cust.address.uf || cust.uf).toUpperCase();
    cust.cep = cust.address.cep || cust.cep;
  }
  if (typeof updates.notes === "string") {
    cust.notes = updates.notes;
  }
  if (Array.isArray(updates.tags)) {
    cust.tags = updates.tags;
  }
  if (typeof updates.acceptsMarketing === "boolean") {
    cust.acceptsMarketing = updates.acceptsMarketing;
  }

  // Sincroniza também os dados cadastrais nos pedidos vinculados a esse cliente
  for (const ord of localStore.orders) {
    if (ord.customerId === cust.id) {
      ord.customerName = cust.name;
      ord.customerEmail = cust.email;
      ord.customerPhone = cust.phone;
      ord.customerCpf = cust.cpf;
      if (updates.address) {
        ord.shippingAddress = { ...cust.address };
        ord.city = cust.city;
        ord.uf = cust.uf;
      }
    }
  }

  if (supabase) {
    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          customerId
        );
      if (isUuid) {
        await supabase
          .from("customers")
          .update({
            name: cust.name,
            email: cust.email || null,
            phone: cust.phone,
            cpf: cust.cpf || null,
            city: cust.city,
            uf: cust.uf,
            cep: cust.cep,
            address: cust.address,
            notes: cust.notes,
            tags: cust.tags,
            accepts_marketing: cust.acceptsMarketing,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      } else {
        await supabase
          .from("customers")
          .update({
            name: cust.name,
            email: cust.email || null,
            cpf: cust.cpf || null,
            city: cust.city,
            uf: cust.uf,
            cep: cust.cep,
            address: cust.address,
            notes: cust.notes,
            tags: cust.tags,
            accepts_marketing: cust.acceptsMarketing,
            updated_at: new Date().toISOString(),
          })
          .eq("phone", cust.phone);
      }
    } catch (err) {
      console.error("[Supabase Update Customer Error]:", err);
    }
  }

  return cust;
}

export async function createManualCustomer(input: {
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  address: ShippingAddressRecord;
  notes?: string;
  tags?: string[];
}): Promise<CustomerRecord> {
  const localStore = getLocalStore();
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  const newCustomer: CustomerRecord = {
    id: `cust-${Date.now()}`,
    name: input.name.trim(),
    email: (input.email || "").trim(),
    phone: input.phone.trim(),
    cpf: (input.cpf || "").trim(),
    city: input.address.city || "Tabuleiro do Norte",
    uf: (input.address.uf || "CE").toUpperCase(),
    cep: input.address.cep || "",
    address: input.address,
    notes: input.notes || "Cliente cadastrado manualmente pelo Painel Admin.",
    tags:
      input.tags && input.tags.length > 0 ? input.tags : ["Cadastro Manual"],
    totalSpent: 0,
    ordersCount: 0,
    totalUnitsBought: 0,
    acceptsMarketing: true,
    firstOrderDate: now,
    lastOrderDate: now,
    hasPendingPix: false,
    preferredPaymentMethod: "pix",
    purchaseHistory: [],
  };

  localStore.customers.unshift(newCustomer);

  if (supabase) {
    try {
      await supabase.from("customers").insert({
        name: newCustomer.name,
        email: newCustomer.email || null,
        phone: newCustomer.phone,
        cpf: newCustomer.cpf || null,
        city: newCustomer.city,
        uf: newCustomer.uf,
        cep: newCustomer.cep,
        address: newCustomer.address,
        notes: newCustomer.notes,
        tags: newCustomer.tags,
      });
    } catch (err) {
      console.error("[Supabase Create Customer Error]:", err);
    }
  }

  return newCustomer;
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

      const targetRef = order?.orderReference || orderIdentifier;
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          orderIdentifier
        );

      if (isUuid) {
        await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderIdentifier);
      } else {
        await supabase
          .from("orders")
          .update(updatePayload)
          .eq("order_reference", targetRef);
      }
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
  const supabase = getSupabaseServerClient();

  let orders = localStore.orders;
  let customers = localStore.customers;
  let socialPosts = localStore.socialPosts;

  if (supabase) {
    try {
      const { data: dbOrders, error: ordersErr } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (!ordersErr && dbOrders && dbOrders.length > 0) {
        orders = dbOrders.map((row: any) => ({
          id: row.id,
          orderReference: row.order_reference,
          customerId: row.customer_id || `cust-${row.id}`,
          customerName: row.customer_name,
          customerEmail: row.customer_email || "",
          customerPhone: row.customer_phone,
          customerCpf: row.customer_cpf || "",
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          fulfillmentStatus: row.fulfillment_status,
          trackingCode: row.tracking_code || "",
          subtotal: Number(row.subtotal),
          shippingCost: Number(row.shipping_cost),
          totalAmount: Number(row.total_amount),
          shippingAddress: row.shipping_address,
          city: row.city,
          uf: row.uf,
          stockDeducted: row.stock_deducted,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          items: (row.items || []).map((it: any) => ({
            id: it.id,
            orderId: it.order_id,
            orderReference: it.order_reference,
            sku: it.sku,
            productId: it.product_id,
            productName: it.product_name,
            size: it.size,
            colorId: it.color_id,
            colorName: it.color_name,
            quantity: it.quantity,
            unitPrice: Number(it.unit_price),
            totalPrice: Number(it.total_price),
          })),
        }));
        localStore.orders = orders;
      } else if (!ordersErr && dbOrders && dbOrders.length === 0 && localStore.orders.length > 0) {
        // O banco do Supabase está recém-criado (0 pedidos).
        // Sincroniza os pedidos iniciais para que passem a existir de verdade no Supabase!
        for (const ord of localStore.orders) {
          const { data: orderRow } = await supabase
            .from("orders")
            .insert({
              order_reference: ord.orderReference,
              customer_name: ord.customerName,
              customer_email: ord.customerEmail || null,
              customer_phone: ord.customerPhone,
              customer_cpf: ord.customerCpf || null,
              payment_method: ord.paymentMethod,
              payment_status: ord.paymentStatus,
              fulfillment_status: ord.fulfillmentStatus,
              tracking_code: ord.trackingCode || null,
              subtotal: ord.subtotal,
              shipping_cost: ord.shippingCost,
              total_amount: ord.totalAmount,
              shipping_address: ord.shippingAddress,
              city: ord.city,
              uf: ord.uf,
              stock_deducted: ord.stockDeducted,
              created_at: ord.createdAt,
              updated_at: ord.updatedAt,
            })
            .select("id")
            .single();

          if (orderRow?.id) {
            ord.id = orderRow.id;
            await supabase.from("order_items").insert(
              ord.items.map((it) => ({
                order_id: orderRow.id,
                order_reference: ord.orderReference,
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
        }

        for (const cust of localStore.customers) {
          await supabase.from("customers").insert({
            name: cust.name,
            email: cust.email || null,
            phone: cust.phone,
            cpf: cust.cpf || null,
            city: cust.city,
            uf: cust.uf,
            cep: cust.cep,
            address: cust.address,
            notes: cust.notes,
            tags: cust.tags,
            total_spent: cust.totalSpent,
            orders_count: cust.ordersCount,
            accepts_marketing: cust.acceptsMarketing,
          });
        }
      }

      const { data: dbCustomers, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!custErr && dbCustomers) {
        customers = dbCustomers.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email || "",
          phone: row.phone,
          cpf: row.cpf || "",
          city: row.city || "",
          uf: row.uf || "",
          cep: row.cep || "",
          address: row.address || {},
          notes: row.notes || "",
          tags: row.tags || [],
          totalSpent: Number(row.total_spent) || 0,
          ordersCount: Number(row.orders_count) || 0,
          totalUnitsBought: 0,
          acceptsMarketing: row.accepts_marketing ?? true,
          firstOrderDate: row.created_at,
          lastOrderDate: row.updated_at,
          hasPendingPix: false,
          preferredPaymentMethod: "pix",
        }));
        localStore.customers = customers;
      }

      const { data: dbPosts, error: postErr } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!postErr && dbPosts) {
        socialPosts = dbPosts.map((row: any) => ({
          id: row.id,
          prompt: row.prompt,
          caption: row.caption,
          aspectRatio: row.aspect_ratio,
          productId: row.product_id,
          colorId: row.color_id,
          imageUrl: row.image_url,
          createdAt: row.created_at,
        }));
        localStore.socialPosts = socialPosts;
      }
    } catch (err) {
      console.error("[getAdminDashboardAnalytics Supabase Error]:", err);
    }
  }
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

  // 1. Ranking por Modelo / Produto
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
    "gancho-armador": {
      productId: "gancho-armador",
      name: PRODUCTS["gancho-armador"].shortName,
      unitsSold: 0,
      revenue: 0,
    },
    "mola-extensora": {
      productId: "mola-extensora",
      name: PRODUCTS["mola-extensora"].shortName,
      unitsSold: 0,
      revenue: 0,
    },
    "corda-nylon": {
      productId: "corda-nylon",
      name: PRODUCTS["corda-nylon"].shortName,
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
    UNICO: {
      size: "UNICO",
      label: "Tamanho Único (Acessórios)",
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

  const enrichedCustomers = buildEnrichedCustomers(
    customers,
    orders
  );

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
    customers: enrichedCustomers,
    inventory: inventoryItems,
    socialPosts,
  };
}
