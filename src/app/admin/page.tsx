"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  Truck,
  Sparkles,
  Mail,
  MessageCircle,
  Printer,
  RefreshCw,
  Lock,
  CheckCircle2,
  Search,
  ExternalLink,
  Copy,
  Check,
  Download,
  Boxes,
  Plus,
  Minus,
  MapPin,
  TrendingUp,
  Palette,
  Ruler,
  Send,
  Users,
  Wand2,
  ArrowLeft,
  ShieldCheck,
  X,
  UserCheck,
  Phone,
  Edit3,
  ShoppingBag,
  Calendar,
  CreditCard,
  QrCode,
  FileText,
  UserPlus,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PRODUCTS,
  TACTEL_COLORS,
  SIZE_ORDER,
  formatBRL,
  type ProductId,
  type SizeCode,
} from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import type {
  FulfillmentStatus,
  InventoryItem,
  OrderRecord,
  PaymentStatus,
  CustomerRecord,
  SocialPostRecord,
  ShippingAddressRecord,
} from "@/lib/supabaseAdmin";

interface DashboardResponse {
  supabaseConnected: boolean;
  kpis: {
    totalRevenue: number;
    pendingRevenue: number;
    averageTicket: number;
    totalOrders: number;
    approvedOrdersCount: number;
    pendingOrdersCount: number;
    toShipCount: number;
    inTransitCount: number;
    deliveredCount: number;
    totalUnitsSold: number;
    totalStockUnits: number;
    outOfStockCount: number;
    lowStockCount: number;
  };
  rankings: {
    products: Array<{
      productId: ProductId;
      name: string;
      unitsSold: number;
      revenue: number;
    }>;
    sizes: Array<{
      size: SizeCode;
      label: string;
      unitsSold: number;
      revenue: number;
    }>;
    colors: Array<{
      colorId: string;
      colorName: string;
      hex: string;
      unitsSold: number;
      revenue: number;
      currentStock: number;
    }>;
    states: Array<{
      uf: string;
      ordersCount: number;
      unitsSold: number;
      revenue: number;
      cities: Array<{ city: string; count: number }>;
    }>;
  };
  orders: OrderRecord[];
  customers: CustomerRecord[];
  inventory: InventoryItem[];
  socialPosts: SocialPostRecord[];
}

type AdminTab =
  | "overview"
  | "orders"
  | "inventory"
  | "customers"
  | "marketing"
  | "social_studio";

type CustomerSubTab = "history" | "edit" | "contact";

export default function AdminDashboardPage() {
  const [adminKey, setAdminKey] = useState<string>("adamari2026");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<DashboardResponse | null>(null);

  // Estado da Aba de Pedidos & Etiquetas
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {}
  );
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [savedTrackingId, setSavedTrackingId] = useState<string | null>(null);
  const [labelOrder, setLabelOrder] = useState<OrderRecord | null>(null);

  // Estado da Aba de Controle de Estoque
  const [stockProductFilter, setStockProductFilter] =
    useState<ProductId>("rede-tradicional");
  const [editedStock, setEditedStock] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<boolean>(false);
  const [stockSavedFeedback, setStockSavedFeedback] = useState<string>("");

  // Estado da Aba 4: Gerenciamento de Clientes (CRM 360°)
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<
    "all" | "vip" | "pending_pix" | "approved"
  >("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSubTab, setCustomerSubTab] =
    useState<CustomerSubTab>("history");
  const [editCustName, setEditCustName] = useState<string>("");
  const [editCustEmail, setEditCustEmail] = useState<string>("");
  const [editCustPhone, setEditCustPhone] = useState<string>("");
  const [editCustCpf, setEditCustCpf] = useState<string>("");
  const [editCustAddress, setEditCustAddress] = useState<ShippingAddressRecord>(
    {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      uf: "",
    }
  );
  const [editCustNotes, setEditCustNotes] = useState<string>("");
  const [editCustTags, setEditCustTags] = useState<string[]>([]);
  const [savingCustomer, setSavingCustomer] = useState<boolean>(false);
  const [customerSavedNotice, setCustomerSavedNotice] = useState<string>("");
  const [copiedCustAddress, setCopiedCustAddress] = useState<boolean>(false);

  //Contato Individual do Cliente (Dentro da Ficha CRM)
  const [directWhatsMsg, setDirectWhatsMsg] = useState<string>("");
  const [directEmailSubject, setDirectEmailSubject] = useState<string>("");
  const [directEmailHeadline, setDirectEmailHeadline] = useState<string>("");
  const [directEmailBody, setDirectEmailBody] = useState<string>("");
  const [directEmailCoupon, setDirectEmailCoupon] = useState<string>("");
  const [sendingDirectEmail, setSendingDirectEmail] = useState<boolean>(false);
  const [directEmailFeedback, setDirectEmailFeedback] = useState<string>("");

  // Modal de Novo Cliente Manual
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] =
    useState<boolean>(false);
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    uf: "CE",
    notes: "",
  });

  // Estado da Aba de Marketing em Massa (E-mail & WhatsApp)
  const [mktSegment, setMktSegment] = useState<
    "all" | "pending_pix" | "approved"
  >("all");
  const [emailSubject, setEmailSubject] = useState<string>(
    "🌞 Novidade no Ateliê Adamari: Cores Vibrantes de Tactel Prontas para Envio!"
  );
  const [emailHeadline, setEmailHeadline] = useState<string>(
    "Sua varanda merece o conforto fresco da Rede Adamari!"
  );
  const [emailBody, setEmailBody] = useState<string>(
    "Olá {nome}, tudo bem?\n\nAcabamos de finalizar um lote novinho de Redes em Tecido Tactel com punhos reforçados 2,5mm c/ proteção UV aqui no nosso ateliê em Tabuleiro do Norte - CE.\n\nAproveite o desconto especial no PIX e Frete Grátis acima de R$ 249 para todo o Brasil!"
  );
  const [emailCoupon, setEmailCoupon] = useState<string>("ADAMARI10");
  const [emailCtaText, setEmailCtaText] = useState<string>(
    "Escolher Minha Rede com Desconto"
  );
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailResultNotice, setEmailResultNotice] = useState<string>("");
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(
    "Olá {nome}, tudo bem? Aqui é do Ateliê Redes Adamari! 🌞 Passando para avisar que temos pronta entrega das nossas redes em Tactel com desconto no PIX: https://redes-adamari.fredericomonteiromendesmaia.workers.dev"
  );

  // Estado da Aba Estúdio IA (Gemini Nano Banana)
  const [studioProduct, setStudioProduct] =
    useState<ProductId>("rede-tradicional");
  const [studioColorId, setStudioColorId] = useState<string>("azul-turquesa");
  const [studioAspectRatio, setStudioAspectRatio] = useState<
    "1:1" | "9:16" | "16:9"
  >("1:1");
  const [studioScene, setStudioScene] = useState<string>(
    "Varanda aconchegante de praia no Ceará com coqueiros ao fundo, mesa de madeira com água de coco e sol dourado da tarde"
  );
  const [studioCampaignFocus] = useState<string>(
    "Destaque para o tecido Tactel fresco que não esquenta nas costas, bolsinho lateral e desconto no PIX"
  );
  const [studioLoading, setStudioLoading] = useState<boolean>(false);
  const [studioResult, setStudioResult] = useState<{
    imageUrl: string;
    captions: string[];
    modelUsed: string;
    notice?: string;
  } | null>(null);
  const [copiedCaptionIdx, setCopiedCaptionIdx] = useState<number | null>(null);

  // Configuração da API do Google AI Studio (Gemini)
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState<boolean>(false);
  const [studioErrorNotice, setStudioErrorNotice] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const setGlobalStockMap = useCartStore((s) => s.setStockMap);

  const populateCustomerForm = useCallback((cust: CustomerRecord) => {
    setEditCustName(cust.name || "");
    setEditCustEmail(cust.email || "");
    setEditCustPhone(cust.phone || "");
    setEditCustCpf(cust.cpf || "");
    setEditCustAddress({
      cep: cust.address?.cep || cust.cep || "",
      street: cust.address?.street || "",
      number: cust.address?.number || "",
      complement: cust.address?.complement || "",
      neighborhood: cust.address?.neighborhood || "",
      city: cust.address?.city || cust.city || "",
      uf: cust.address?.uf || cust.uf || "CE",
    });
    setEditCustNotes(cust.notes || "");
    setEditCustTags(cust.tags || []);

    const firstName = cust.name.split(" ")[0] || "Cliente";
    const lastOrder = cust.purchaseHistory?.[0];
    const lastItemDesc = lastOrder?.items?.[0]
      ? `${lastOrder.items[0].productName} (${lastOrder.items[0].colorName} • Tam. ${lastOrder.items[0].size})`
      : "Rede Adamari em Tactel";

    setDirectWhatsMsg(
      cust.hasPendingPix
        ? `Olá ${firstName}, tudo bem? Aqui é do Ateliê Redes Adamari! 🌞 Vi que você escolheu sua ${lastItemDesc} no site. Ela já está separada aqui para você! Ficou alguma dúvida para concluir o pagamento no PIX?`
        : `Olá ${firstName}, tudo bem? Aqui é do Ateliê Redes Adamari! 🌞 Passando para agradecer pela compra da sua ${lastItemDesc} e saber como está sendo a experiência com ela! Qualquer dúvida estamos sempre à disposição.`
    );

    setDirectEmailSubject(
      `${firstName}, temos um presente especial para sua próxima Rede Adamari! 🌞`
    );
    setDirectEmailHeadline(
      `Obrigado por fazer parte da família Redes Adamari, ${firstName}!`
    );
    setDirectEmailBody(
      `Olá ${firstName}, tudo bem?\n\nÉ uma alegria ter você como cliente do nosso ateliê em Tabuleiro do Norte - CE (vimos no seu histórico a escolha da ${lastItemDesc}).\n\nLiberamos um cupom exclusivo caso queira presentear alguém ou escolher uma nova cor de Tactel com desconto extra no PIX!`
    );
    setDirectEmailCoupon("CLIENTEVIP10");
    setDirectEmailFeedback("");
    setCustomerSavedNotice("");
  }, []);

  const loadDashboard = useCallback(
    async (keyToUse: string) => {
      setLoading(true);
      setAuthError("");
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { "x-admin-key": keyToUse },
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          setIsAuthenticated(false);
          setAuthError(json.error || "Senha inválida.");
          return;
        }
        setData(json);
        setIsAuthenticated(true);

        const initialStock: Record<string, number> = {};
        for (const item of json.inventory || []) {
          initialStock[item.sku] = item.stockQuantity;
        }
        setEditedStock(initialStock);
        setGlobalStockMap(initialStock);

        const trackMap: Record<string, string> = {};
        for (const ord of json.orders || []) {
          trackMap[ord.id] = ord.trackingCode || "";
          trackMap[ord.orderReference] = ord.trackingCode || "";
        }
        setTrackingInputs(trackMap);

        if (json.customers && json.customers.length > 0) {
          setSelectedCustomerId((prev) => {
            const target =
              json.customers.find((c: CustomerRecord) => c.id === prev) ||
              json.customers[0];
            populateCustomerForm(target);
            return target.id;
          });
        }
      } catch {
        setAuthError("Erro de conexão ao carregar o painel.");
      } finally {
        setLoading(false);
      }
    },
    [setGlobalStockMap, populateCustomerForm]
  );

  useEffect(() => {
    const savedKey = sessionStorage.getItem("adamari_admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
      loadDashboard(savedKey);
    }
    if (typeof window !== "undefined") {
      const savedGeminiKey = localStorage.getItem("adamari_gemini_api_key");
      if (savedGeminiKey) {
        setGeminiApiKey(savedGeminiKey);
      }
    }
  }, [loadDashboard]);

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== "undefined") {
      if (key.trim()) {
        localStorage.setItem("adamari_gemini_api_key", key.trim());
      } else {
        localStorage.removeItem("adamari_gemini_api_key");
      }
      setApiKeySavedNotice(true);
      setTimeout(() => setApiKeySavedNotice(false), 3000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("adamari_admin_key", adminKey);
    await loadDashboard(adminKey);
  };

  // ==========================================================================
  // AÇÕES DE PEDIDOS E ENTREGAS
  // ==========================================================================
  const handleUpdateOrder = async (
    orderId: string,
    changes: {
      paymentStatus?: PaymentStatus;
      fulfillmentStatus?: FulfillmentStatus;
      trackingCode?: string;
    }
  ) => {
    setSavingOrderId(orderId);
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ orderId, ...changes }),
      });
      const json = await res.json();
      if (res.ok && json.analytics) {
        setData(json.analytics);
        const updatedStock: Record<string, number> = {};
        for (const item of json.analytics.inventory || []) {
          updatedStock[item.sku] = item.stockQuantity;
        }
        setEditedStock(updatedStock);
        setGlobalStockMap(updatedStock);

        if (json.analytics.orders) {
          setTrackingInputs((prev) => {
            const next = { ...prev };
            for (const o of json.analytics.orders) {
              next[o.id] = o.trackingCode || "";
              next[o.orderReference] = o.trackingCode || "";
            }
            return next;
          });
        }

        if (changes.trackingCode !== undefined) {
          setSavedTrackingId(orderId);
          setTimeout(() => setSavedTrackingId(null), 2500);
        }
      }
    } finally {
      setSavingOrderId(null);
    }
  };

  // ==========================================================================
  // AÇÕES DE CONTROLE DE ESTOQUE (GRADE CORES x TAMANHOS)
  // ==========================================================================
  const handleAdjustLocalSku = (sku: string, newQty: number) => {
    const clean = Math.max(0, Math.floor(Number(newQty) || 0));
    setEditedStock((prev) => ({ ...prev, [sku]: clean }));
  };

  const handleSaveStockChanges = async (
    customUpdates?: Array<{ sku: string; stockQuantity: number }>
  ) => {
    setSavingStock(true);
    setStockSavedFeedback("");
    try {
      const updates =
        customUpdates ||
        Object.entries(editedStock).map(([sku, stockQuantity]) => ({
          sku,
          stockQuantity,
        }));

      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ updates }),
      });

      const json = await res.json();
      if (res.ok && json.stockMap) {
        setEditedStock(json.stockMap);
        setGlobalStockMap(json.stockMap);
        await loadDashboard(adminKey);
        setStockSavedFeedback(
          "✓ Estoque salvo e sincronizado com a loja em tempo real!"
        );
        setTimeout(() => setStockSavedFeedback(""), 3500);
      }
    } finally {
      setSavingStock(false);
    }
  };

  const handleSetRowColorStock = async (
    productId: ProductId,
    colorId: string,
    qty: number
  ) => {
    const updates = SIZE_ORDER.map((size) => ({
      sku: `${productId}-${size}-${colorId}`,
      stockQuantity: qty,
    }));
    await handleSaveStockChanges(updates);
  };

  // ==========================================================================
  // AÇÕES DE GERENCIAMENTO DE CLIENTES (CRM 360°)
  // ==========================================================================
  const selectedCustomer =
    data?.customers.find((c) => c.id === selectedCustomerId) ||
    data?.customers[0] ||
    null;

  const handleSelectCustomer = (cust: CustomerRecord) => {
    setSelectedCustomerId(cust.id);
    populateCustomerForm(cust);
  };

  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSavingCustomer(true);
    setCustomerSavedNotice("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          name: editCustName,
          email: editCustEmail,
          phone: editCustPhone,
          cpf: editCustCpf,
          address: editCustAddress,
          notes: editCustNotes,
          tags: editCustTags,
        }),
      });
      const json = await res.json();
      if (res.ok && json.analytics) {
        setData(json.analytics);
        setCustomerSavedNotice(
          "✓ Dados, endereço e observações do cliente atualizados com sucesso!"
        );
        setTimeout(() => setCustomerSavedNotice(""), 3500);
      }
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleToggleCustomerTag = (tag: string) => {
    setEditCustTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleEditCepLookup = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, "").slice(0, 8);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setEditCustAddress((prev) => ({ ...prev, cep: formatted }));

    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const info = await res.json();
        if (!info.erro) {
          setEditCustAddress((prev) => ({
            ...prev,
            cep: formatted,
            street: info.logradouro || prev.street,
            neighborhood: info.bairro || prev.neighborhood,
            city: info.localidade || prev.city,
            uf: info.uf || prev.uf,
          }));
        }
      } catch {
        // Ignora falha silenciosamente
      }
    }
  };

  const handleCreateManualCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCustomer(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          name: newCustForm.name,
          phone: newCustForm.phone,
          email: newCustForm.email,
          cpf: newCustForm.cpf,
          address: {
            cep: newCustForm.cep,
            street: newCustForm.street,
            number: newCustForm.number,
            complement: newCustForm.complement,
            neighborhood: newCustForm.neighborhood,
            city: newCustForm.city || "Tabuleiro do Norte",
            uf: newCustForm.uf || "CE",
          },
          notes: newCustForm.notes,
          tags: ["Cadastro Manual"],
        }),
      });
      const json = await res.json();
      if (res.ok && json.analytics) {
        setData(json.analytics);
        if (json.customer) {
          setSelectedCustomerId(json.customer.id);
          populateCustomerForm(json.customer);
        }
        setIsNewCustomerModalOpen(false);
        setNewCustForm({
          name: "",
          phone: "",
          email: "",
          cpf: "",
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          uf: "CE",
          notes: "",
        });
      }
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleSendDirectCustomerEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !editCustEmail.includes("@")) {
      setDirectEmailFeedback(
        "Cadastre um e-mail válido na aba 'Editar Dados' antes de enviar."
      );
      return;
    }
    setSendingDirectEmail(true);
    setDirectEmailFeedback("");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          subject: directEmailSubject,
          headline: directEmailHeadline,
          messageBody: directEmailBody,
          couponCode: directEmailCoupon,
          ctaText: "Acessar Loja Redes Adamari",
          ctaUrl:
            "https://redes-adamari.fredericomonteiromendesmaia.workers.dev/#configurador",
          recipients: [{ name: editCustName, email: editCustEmail }],
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setDirectEmailFeedback(
          json.notice ||
            `✓ E-mail individual enviado com sucesso para ${editCustEmail}!`
        );
      } else {
        setDirectEmailFeedback(json.error || "Falha ao enviar e-mail.");
      }
    } finally {
      setSendingDirectEmail(false);
    }
  };

  const handleExportCustomersCsv = () => {
    const rows = [
      [
        "Nome",
        "WhatsApp",
        "Email",
        "CPF",
        "Cidade",
        "UF",
        "CEP",
        "Pedidos",
        "Redes Compradas",
        "Total Gasto (BRL)",
        "Tags",
      ],
      ...(data?.customers || []).map((c) => [
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        `"${c.cpf}"`,
        `"${c.city}"`,
        `"${c.uf}"`,
        `"${c.cep}"`,
        String(c.ordersCount),
        String(c.totalUnitsBought),
        String(c.totalSpent.toFixed(2)),
        `"${(c.tags || []).join(", ")}"`,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clientes-redes-adamari.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================================================
  // AÇÕES DE MARKETING EM MASSA (E-MAIL & WHATSAPP)
  // ==========================================================================
  const filteredCustomers = (data?.customers || []).filter((c) => {
    if (mktSegment === "pending_pix") return c.hasPendingPix;
    if (mktSegment === "approved") return !c.hasPendingPix && c.totalSpent > 0;
    return true;
  });

  const crmFilteredCustomers = (data?.customers || []).filter((c) => {
    if (customerFilter === "vip" && c.ordersCount < 2 && !c.tags.includes("Cliente VIP"))
      return false;
    if (customerFilter === "pending_pix" && !c.hasPendingPix) return false;
    if (customerFilter === "approved" && c.totalSpent <= 0) return false;

    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.cpf.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.uf.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const applyEmailTemplate = (type: "launch" | "pix_recovery" | "shipping") => {
    if (type === "launch") {
      setEmailSubject(
        "🌞 Lote Novo no Ateliê Adamari: Redes em Tactel c/ Desconto no PIX!"
      );
      setEmailHeadline(
        "Cores vibrantes e frescor garantido para o seu descanso"
      );
      setEmailBody(
        "Olá {nome}, tudo bem?\n\nAcabamos de repor o estoque das nossas Redes de Dormir Tradicionais e com Mosquiteiro em todas as 10 cores de Tactel!\n\nElas não esquentam nas costas, secam em minutos e têm punhos em corda 2,5mm com proteção solar UV."
      );
      setEmailCoupon("ADAMARI10");
      setEmailCtaText("Ver Cores Disponíveis no Site");
    } else if (type === "pix_recovery") {
      setEmailSubject(
        "⏰ {nome}, sua Rede Adamari ainda está reservada no estoque!"
      );
      setEmailHeadline("Separamos a sua rede aqui no Ateliê Adamari");
      setEmailBody(
        "Olá {nome}!\n\nVimos que você escolheu sua Rede Adamari no site, mas o pagamento via PIX ficou pendente.\n\nSua cor e tamanho ainda estão reservados no nosso estoque em Tabuleiro do Norte - CE! Finalize agora mesmo garantindo o desconto exclusivo à vista."
      );
      setEmailCoupon("PIXDESCONTO");
      setEmailCtaText("Concluir Meu Pedido Agora");
    } else {
      setEmailSubject(
        "🚚 Frete Grátis Especial Fim de Semana — Redes Adamari!"
      );
      setEmailHeadline("Leve 2 Redes Adamari e Ganhe Frete Grátis!");
      setEmailBody(
        "Olá {nome}!\n\nNeste fim de semana, todas as compras acima de R$ 249 ganham Frete Grátis automático para qualquer estado do Brasil.\n\nAproveite para garantir uma rede para a varanda e outra com mosquiteiro para viagens!"
      );
      setEmailCoupon("FRETEGRATIS");
      setEmailCtaText("Aproveitar Frete Grátis");
    }
  };

  const handleSendEmailCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailResultNotice("");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          subject: emailSubject,
          headline: emailHeadline,
          messageBody: emailBody,
          couponCode: emailCoupon,
          ctaText: emailCtaText,
          ctaUrl:
            "https://redes-adamari.fredericomonteiromendesmaia.workers.dev/#configurador",
          recipients: filteredCustomers.map((c) => ({
            name: c.name,
            email: c.email,
          })),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setEmailResultNotice(
          json.notice ||
            `Sucesso! ${json.sentCount} e-mail(s) enviados pela campanha.`
        );
      } else {
        setEmailResultNotice(json.error || "Erro ao enviar campanha.");
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // ==========================================================================
  // AÇÕES DO ESTÚDIO GEMINI NANO BANANA
  // ==========================================================================
  const handleGenerateStudioPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioLoading(true);
    setStudioErrorNotice(null);
    try {
      const res = await fetch("/api/admin/social-studio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          apiKey: geminiApiKey.trim() || undefined,
          productId: studioProduct,
          colorId: studioColorId,
          aspectRatio: studioAspectRatio,
          scenePrompt: studioScene,
          campaignFocus: studioCampaignFocus,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setStudioResult({
          imageUrl: json.imageUrl,
          captions: json.captions || [],
          modelUsed: json.modelUsed,
          notice: json.notice,
        });
        await loadDashboard(adminKey);
      } else {
        setStudioErrorNotice(json.error || "Erro ao gerar post no Estúdio IA.");
      }
    } catch (err: any) {
      setStudioErrorNotice("Falha ao comunicar com o Estúdio IA: " + (err?.message || "Erro de rede"));
    } finally {
      setStudioLoading(false);
    }
  };

  // ==========================================================================
  // TELA DE LOGIN DO ADMIN
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-[#E6DEC8] shadow-warm-lg p-7 sm:p-9 space-y-6">
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/logo.png"
              alt="Ateliê Adamari"
              className="w-20 h-20 object-contain rounded-full border-2 border-[#E6DEC8] shadow-sm mb-3"
            />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9C5221] bg-[#F5E6D3] px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Gestão Exclusiva • Tabuleiro do
              Norte/CE
            </span>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2C1E18] mt-2">
              Painel Admin Adamari
            </h1>
            <p className="text-xs sm:text-sm text-[#5C4438] mt-1">
              Controle de vendas, entregas, estoque, clientes (CRM 360°),
              marketing e Estúdio Gemini Nano Banana.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                Senha do Administrador:
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Digite a senha do painel"
                className="w-full rounded-2xl border border-[#D4C5A9] bg-[#FAF6F0] px-4 py-3 text-sm font-bold text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
              />
              <p className="text-[11px] text-[#7A6252] mt-1.5">
                * Senha inicial padrão:{" "}
                <code className="font-bold text-[#2C1E18] bg-[#F3ECE0] px-1.5 py-0.5 rounded">
                  adamari2026
                </code>{" "}
                (alterável via variável <code>ADMIN_PASSWORD</code>).
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-solar-gradient text-white font-extrabold text-sm shadow-lg shadow-[#D95D39]/25 hover:opacity-95 transition cursor-pointer"
            >
              {loading ? "Entrando no Painel..." : "Acessar Painel de Gestão"}
            </button>
          </form>

          <div className="pt-3 border-t border-[#EFE8D8] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C4438] hover:text-[#D95D39]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a Loja Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const rankings = data?.rankings;

  const filteredOrders = (data?.orders || []).filter((ord) => {
    if (orderFilter === "to_ship" && ord.fulfillmentStatus !== "separando")
      return false;
    if (orderFilter === "pending_pix" && ord.paymentStatus !== "pending")
      return false;
    if (orderFilter === "shipped" && ord.fulfillmentStatus !== "enviado")
      return false;
    if (orderFilter === "delivered" && ord.fulfillmentStatus !== "entregue")
      return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        ord.orderReference.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.city.toLowerCase().includes(q) ||
        ord.uf.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1E18] flex flex-col">
      {/* TOPBAR EXECUTIVA DO PAINEL ADMIN */}
      <header className="sticky top-0 z-30 bg-[#2C1E18] text-[#FAF6F0] border-b border-[#4A3728] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Ateliê Adamari"
              className="w-11 h-11 rounded-full bg-[#FAF6F0] p-0.5 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-editorial text-lg sm:text-xl font-bold text-white">
                  Redes Adamari • Central Admin
                </h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    data?.supabaseConnected
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {data?.supabaseConnected
                    ? "Supabase Conectado"
                    : "Banco Ativo (Modo Híbrido)"}
                </span>
              </div>
              <p className="text-xs text-[#C9B89A]">
                Expedição Tabuleiro do Norte – CE • Gestão de Vendas, Estoque,
                Clientes (CRM) & IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadDashboard(adminKey)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D2B22] hover:bg-[#4E382D] text-xs font-bold text-[#FAF6F0] border border-[#5C4438] transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar Dados
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-solar-gradient text-xs font-extrabold text-white shadow-sm"
            >
              Ver Loja <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* BARRA DE NAVEGAÇÃO DAS 6 ABAS */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-[#3D2B22] flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            {
              id: "overview",
              label: "Visão Geral",
              icon: BarChart3,
              badge: null,
            },
            {
              id: "orders",
              label: "Pedidos",
              icon: Truck,
              badge: kpis?.toShipCount ? `${kpis.toShipCount} p/ enviar` : null,
            },
            {
              id: "inventory",
              label: "Estoque",
              icon: Boxes,
              badge:
                kpis && kpis.outOfStockCount + kpis.lowStockCount > 0
                  ? `${kpis.outOfStockCount + kpis.lowStockCount} alertas`
                  : null,
            },
            {
              id: "customers",
              label: "Clientes",
              icon: Users,
              badge: data?.customers.length
                ? `${data.customers.length}`
                : null,
            },
            {
              id: "marketing",
              label: "Marketing",
              icon: Mail,
              badge: null,
            },
            {
              id: "social_studio",
              label: "Estúdio IA",
              icon: Sparkles,
              badge: "Nano Banana",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  active
                    ? "bg-[#FAF6F0] text-[#2C1E18] shadow-sm"
                    : "text-[#C9B89A] hover:text-white hover:bg-[#3D2B22]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    active ? "text-[#D95D39]" : "text-[#C9B89A]"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-black ${
                      active
                        ? "bg-[#D95D39] text-white"
                        : "bg-[#4E382D] text-amber-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ====================================================================
            ABA 1: VISÃO GERAL & RANKINGS (PRODUTO, TAMANHO, COR, ESTADO)
           ==================================================================== */}
        {activeTab === "overview" && kpis && rankings && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-[#E6DEC8] shadow-warm">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6252]">
                  <span>FATURAMENTO APROVADO</span>
                  <TrendingUp className="w-4 h-4 text-[#1E4620]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#1E4620] mt-2">
                  {formatBRL(kpis.totalRevenue)}
                </div>
                <p className="text-xs text-[#5C4438] mt-1">
                  Ticket Médio: <strong>{formatBRL(kpis.averageTicket)}</strong>{" "}
                  ({kpis.approvedOrdersCount} vendas pagas)
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E6DEC8] shadow-warm">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6252]">
                  <span>STATUS DE ENTREGAS</span>
                  <Truck className="w-4 h-4 text-[#D95D39]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#2C1E18] mt-2">
                  {kpis.toShipCount} p/ Despachar
                </div>
                <p className="text-xs text-[#5C4438] mt-1">
                  <strong>{kpis.inTransitCount}</strong> em trânsito •{" "}
                  <strong>{kpis.deliveredCount}</strong> entregues
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E6DEC8] shadow-warm">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6252]">
                  <span>AGUARDANDO PIX (RECUPERAR)</span>
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
                  {formatBRL(kpis.pendingRevenue)}
                </div>
                <p className="text-xs text-[#5C4438] mt-1">
                  <strong>{kpis.pendingOrdersCount}</strong> pedido(s)
                  aguardando pagamento
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E6DEC8] shadow-warm">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6252]">
                  <span>SAÚDE DO ESTOQUE (80 SKUs)</span>
                  <Boxes className="w-4 h-4 text-[#9C5221]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#2C1E18] mt-2">
                  {kpis.totalStockUnits} redes
                </div>
                <p className="text-xs text-[#5C4438] mt-1">
                  <strong className="text-red-600">
                    {kpis.outOfStockCount} esgotadas
                  </strong>{" "}
                  •{" "}
                  <strong className="text-amber-700">
                    {kpis.lowStockCount} estoque baixo
                  </strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D95D39]" />
                      Qual Modelo Vende Mais?
                    </h2>
                    <p className="text-xs text-[#7A6252]">
                      Comparativo de unidades vendidas e receita por modelo
                    </p>
                  </div>
                  <span className="text-xs font-extrabold bg-[#F5E6D3] text-[#9C5221] px-3 py-1 rounded-full">
                    {kpis.totalUnitsSold} redes vendidas
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {rankings.products.map((prod) => {
                    const pct =
                      kpis.totalUnitsSold > 0
                        ? Math.round(
                            (prod.unitsSold / kpis.totalUnitsSold) * 100
                          )
                        : 0;
                    return (
                      <div
                        key={prod.productId}
                        className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span>{prod.name}</span>
                          <span className="text-[#1E4620]">
                            {prod.unitsSold} un. ({pct}%) •{" "}
                            {formatBRL(prod.revenue)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-[#E6DEC8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-solar-gradient rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-4">
                <div>
                  <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-[#1E4620]" />
                    Qual Tamanho Vende Mais? (M, G, GG, XGG)
                  </h2>
                  <p className="text-xs text-[#7A6252]">
                    Ajuda a planejar o corte de tecido Tactel na fábrica
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {rankings.sizes.map((sz) => {
                    const pct =
                      kpis.totalUnitsSold > 0
                        ? Math.round((sz.unitsSold / kpis.totalUnitsSold) * 100)
                        : 0;
                    return (
                      <div key={sz.size} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#2C1E18]">{sz.label}</span>
                          <span className="text-[#5C4438]">
                            <strong>{sz.unitsSold} redes</strong> ({pct}%) •{" "}
                            {formatBRL(sz.revenue)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#EFE8D8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E4620] rounded-full"
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[#D95D39]" />
                      Ranking: Quais Cores de Tactel Vendem Mais?
                    </h2>
                    <p className="text-xs text-[#7A6252]">
                      Vendas acumuladas por cor vs. estoque atual disponível
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("inventory")}
                    className="text-xs font-bold text-[#D95D39] hover:underline cursor-pointer"
                  >
                    Gerenciar Estoque →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rankings.colors.map((c, idx) => {
                    const maxColorUnits = Math.max(
                      1,
                      rankings.colors[0]?.unitsSold || 1
                    );
                    const barWidth = Math.max(
                      6,
                      Math.round((c.unitsSold / maxColorUnits) * 100)
                    );
                    return (
                      <div
                        key={c.colorId}
                        className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] flex items-center gap-3"
                      >
                        <span className="w-6 text-xs font-black text-[#7A6252] text-center">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-7 h-7 rounded-full shrink-0 border border-black/20 shadow-xs tactel-swatch-sheen"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="truncate text-[#2C1E18]">
                              {c.colorName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#1E4620] font-black">
                                {c.unitsSold} vendidas
                              </span>
                              <span className="text-[11px] text-[#7A6252]">
                                ({formatBRL(c.revenue)})
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  c.currentStock === 0
                                    ? "bg-red-100 text-red-700"
                                    : c.currentStock <= 6
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-[#E9F3E8] text-[#1E4620]"
                                }`}
                              >
                                Estoque: {c.currentStock}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-[#E6DEC8] rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: c.hex,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-4">
                <div>
                  <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1E4620]" />
                    Para Onde Vendemos Mais? (UF)
                  </h2>
                  <p className="text-xs text-[#7A6252]">
                    Destinos campeões de pedidos expedidos de Tabuleiro do
                    Norte/CE
                  </p>
                </div>

                <div className="space-y-3">
                  {rankings.states.map((st, idx) => (
                    <div
                      key={st.uf}
                      className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-[#2C1E18] text-amber-300 font-black text-xs flex items-center justify-center">
                            {st.uf}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-[#2C1E18] block">
                              {idx + 1}º Lugar • Estado: {st.uf}
                            </span>
                            <span className="text-[11px] text-[#7A6252]">
                              Cidades:{" "}
                              {st.cities
                                .map((c) => `${c.city} (${c.count})`)
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#1E4620] block">
                            {formatBRL(st.revenue)}
                          </span>
                          <span className="text-[11px] font-bold text-[#5C4438]">
                            {st.ordersCount} pedido(s) • {st.unitsSold} rede(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 2: GESTÃO DE PEDIDOS, ENTREGAS, RASTREIO E ETIQUETA CORREIOS
           ==================================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6DEC8] shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "Todos os Pedidos" },
                  { id: "to_ship", label: "📦 Para Enviar (Pagos)" },
                  { id: "pending_pix", label: "⏳ Aguardando PIX" },
                  { id: "shipped", label: "🚚 Em Trânsito" },
                  { id: "delivered", label: "✅ Entregues" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      orderFilter === f.id
                        ? "bg-[#2C1E18] text-white"
                        : "bg-[#FAF6F0] text-[#5C4438] hover:bg-[#EFE8D8]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#7A6252] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cliente, #ADA ou cidade..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] text-xs font-semibold text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const cleanPhone = ord.customerPhone.replace(/\D/g, "");
                const whatsMsg = ord.trackingCode
                  ? `Olá ${ord.customerName.split(" ")[0]}! 🌞 Seu pedido *#${ord.orderReference}* da *Redes Adamari* já foi despachado de Tabuleiro do Norte/CE! Seu código de rastreio é: *${ord.trackingCode}*`
                  : ord.paymentStatus === "pending"
                    ? `Olá ${ord.customerName.split(" ")[0]}, tudo bem? Aqui é do Ateliê Redes Adamari! Vimos seu pedido *#${ord.orderReference}* e sua rede já está separada. Posso te ajudar a concluir o pagamento via PIX?`
                    : `Olá ${ord.customerName.split(" ")[0]}! Seu pedido *#${ord.orderReference}* da Redes Adamari foi confirmado e já está em separação no nosso ateliê!`;

                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6DEC8] shadow-warm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE8D8]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm bg-[#2C1E18] text-amber-300 px-3 py-1 rounded-xl">
                          #{ord.orderReference}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              const found = data?.customers.find(
                                (c) =>
                                  c.id === ord.customerId ||
                                  c.phone.replace(/\D/g, "") === cleanPhone
                              );
                              if (found) {
                                handleSelectCustomer(found);
                                setActiveTab("customers");
                              }
                            }}
                            className="font-bold text-base text-[#2C1E18] hover:text-[#D95D39] underline-offset-2 hover:underline text-left cursor-pointer"
                          >
                            {ord.customerName}
                          </button>
                          <span className="block text-xs text-[#7A6252]">
                            {new Date(ord.createdAt).toLocaleString("pt-BR")} •{" "}
                            {ord.city}/{ord.uf} • Pagamento:{" "}
                            <strong className="uppercase">
                              {ord.paymentMethod}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            ord.paymentStatus === "approved"
                              ? "bg-[#E9F3E8] text-[#1E4620]"
                              : ord.paymentStatus === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ord.paymentStatus === "approved"
                            ? "✓ Pagamento Aprovado"
                            : ord.paymentStatus === "pending"
                              ? "⏳ Aguardando PIX"
                              : "✕ Cancelado (Estoque Estornado)"}
                        </span>

                        <span className="text-lg font-black text-[#1E4620]">
                          {formatBRL(ord.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-6 space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9C5221]">
                          Redes para Separar e Embalar:
                        </span>
                        {ord.items.map((item) => {
                          const colorObj = TACTEL_COLORS.find(
                            (c) => c.id === item.colorId
                          );
                          return (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                  style={{
                                    backgroundColor: colorObj?.hex || "#1E56A0",
                                  }}
                                />
                                <div>
                                  <strong className="text-[#2C1E18]">
                                    {item.quantity}x {item.productName} (Tam.{" "}
                                    {item.size})
                                  </strong>
                                  <span className="block text-[#5C4438]">
                                    Cor: <strong>{item.colorName}</strong> •
                                    SKU: <code>{item.sku}</code>
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-[#1E4620]">
                                {formatBRL(item.totalPrice)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="lg:col-span-6 p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9C5221] block">
                          Endereço de Destino:
                        </span>
                        <p className="font-bold text-[#2C1E18]">
                          {ord.shippingAddress.street},{" "}
                          {ord.shippingAddress.number}{" "}
                          {ord.shippingAddress.complement
                            ? `(${ord.shippingAddress.complement})`
                            : ""}
                        </p>
                        <p className="text-[#5C4438]">
                          Bairro: {ord.shippingAddress.neighborhood} •{" "}
                          <strong>
                            {ord.city} / {ord.uf}
                          </strong>
                        </p>
                        <p className="font-mono font-bold text-[#2C1E18]">
                          CEP: {ord.shippingAddress.cep} • CPF:{" "}
                          {ord.customerCpf || "Não informado"}
                        </p>
                        <p className="text-[#5C4438]">
                          WhatsApp: {ord.customerPhone} • E-mail:{" "}
                          {ord.customerEmail || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EFE8D8] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={ord.paymentStatus}
                          disabled={savingOrderId === ord.id}
                          onChange={(e) =>
                            handleUpdateOrder(ord.id, {
                              paymentStatus: e.target.value as PaymentStatus,
                            })
                          }
                          className="rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#2C1E18]"
                        >
                          <option value="pending">Pgto: Pendente</option>
                          <option value="approved">Pgto: Aprovado</option>
                          <option value="cancelled">
                            Pgto: Cancelado (Estornar Estoque)
                          </option>
                        </select>

                        <select
                          value={ord.fulfillmentStatus}
                          disabled={savingOrderId === ord.id}
                          onChange={(e) =>
                            handleUpdateOrder(ord.id, {
                              fulfillmentStatus: e.target
                                .value as FulfillmentStatus,
                            })
                          }
                          className="rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#2C1E18]"
                        >
                          <option value="aguardando_pagamento">
                            Entrega: Aguardando Pagamento
                          </option>
                          <option value="separando">
                            Entrega: Em Separação no Ateliê
                          </option>
                          <option value="enviado">
                            Entrega: Enviado (Em Trânsito)
                          </option>
                          <option value="entregue">
                            Entrega: Entregue ao Cliente
                          </option>
                          <option value="cancelado">
                            Entrega: Cancelado (Devolve ao Estoque)
                          </option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Cód. Rastreio (ex: AA123456789BR)"
                            value={
                              trackingInputs[ord.id] ??
                              trackingInputs[ord.orderReference] ??
                              ord.trackingCode ??
                              ""
                            }
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [ord.id]: val,
                                [ord.orderReference]: val,
                              }));
                            }}
                            className="w-48 rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-mono font-bold uppercase text-[#2C1E18]"
                          />
                          <button
                            type="button"
                            disabled={savingOrderId === ord.id}
                            onClick={() => {
                              const code =
                                trackingInputs[ord.id] ??
                                trackingInputs[ord.orderReference] ??
                                ord.trackingCode ??
                                "";
                              handleUpdateOrder(ord.id, {
                                trackingCode: code,
                              });
                            }}
                            className="px-3 py-2 rounded-xl bg-[#2C1E18] text-white text-xs font-bold hover:bg-[#3D2B22] cursor-pointer disabled:opacity-50 transition"
                          >
                            {savingOrderId === ord.id ? (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Salvando...
                              </span>
                            ) : savedTrackingId === ord.id ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                Salvo!
                              </span>
                            ) : (
                              "Salvar Rastreio"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLabelOrder(ord)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5E6D3] hover:bg-[#EBD5B8] text-[#9C5221] text-xs font-extrabold transition cursor-pointer"
                        >
                          <Printer className="w-4 h-4" /> Imprimir Etiqueta
                        </button>

                        <a
                          href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                            whatsMsg
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4620] hover:bg-[#163617] text-white text-xs font-extrabold transition"
                        >
                          <MessageCircle className="w-4 h-4" /> Avisar no
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 3: CONTROLE DE ESTOQUE (MATRIZ 10 CORES × 4 TAMANHOS)
           ==================================================================== */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EFE8D8] pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1E4620] bg-[#E9F3E8] px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Proteção Anti-Venda
                    Sem Estoque Ativa
                  </span>
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#2C1E18] mt-2">
                    Grade de Estoque por Modelo, Cor e Tamanho
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C4438]">
                    Defina quantas redes você tem prontas em cada cor e tamanho.
                    Qualquer variação com{" "}
                    <strong className="text-red-700">estoque 0</strong> fica
                    automaticamente bloqueada como <strong>Esgotada</strong> na
                    loja!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(
                    [
                      "rede-tradicional",
                      "rede-mosquiteiro",
                    ] as ProductId[]
                  ).map((pid) => (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setStockProductFilter(pid)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border-2 transition cursor-pointer ${
                        stockProductFilter === pid
                          ? "border-[#D95D39] bg-[#2C1E18] text-white shadow-sm"
                          : "border-[#E6DEC8] bg-[#FAF6F0] text-[#5C4438]"
                      }`}
                    >
                      {PRODUCTS[pid].name}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={savingStock}
                    onClick={() => handleSaveStockChanges()}
                    className="px-5 py-2.5 rounded-2xl bg-solar-gradient text-white text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    {savingStock
                      ? "Salvando Estoque..."
                      : "Salvar Todas as Quantidades"}
                  </button>
                </div>
              </div>

              {stockSavedFeedback && (
                <div className="p-3.5 rounded-2xl bg-[#E9F3E8] border border-[#C6E2C3] text-xs font-extrabold text-[#1E4620] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {stockSavedFeedback}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#E6DEC8] text-xs uppercase tracking-wider text-[#7A6252]">
                      <th className="py-3 px-3">Cor do Tactel</th>
                      {SIZE_ORDER.map((sz) => (
                        <th key={sz} className="py-3 px-3 text-center">
                          Tamanho {sz}
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center">Total da Cor</th>
                      <th className="py-3 px-3 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8D8] text-sm">
                    {TACTEL_COLORS.map((color) => {
                      let rowTotal = 0;
                      for (const sz of SIZE_ORDER) {
                        const sku = `${stockProductFilter}-${sz}-${color.id}`;
                        rowTotal += editedStock[sku] ?? 0;
                      }

                      return (
                        <tr
                          key={color.id}
                          className="hover:bg-[#FAF6F0]/70 transition"
                        >
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-7 h-7 rounded-full border border-black/20 shrink-0 shadow-xs tactel-swatch-sheen"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div>
                                <span className="font-bold text-[#2C1E18] block">
                                  {color.name}
                                </span>
                                <span className="text-[11px] text-[#7A6252]">
                                  {color.profile}
                                </span>
                              </div>
                            </div>
                          </td>

                          {SIZE_ORDER.map((sz) => {
                            const sku = `${stockProductFilter}-${sz}-${color.id}`;
                            const qty = editedStock[sku] ?? 0;
                            const isZero = qty === 0;
                            const isLow = qty > 0 && qty <= 3;

                            return (
                              <td key={sz} className="py-3 px-2 text-center">
                                <div
                                  className={`inline-flex flex-col items-center p-2 rounded-2xl border ${
                                    isZero
                                      ? "bg-red-50 border-red-200"
                                      : isLow
                                        ? "bg-amber-50 border-amber-200"
                                        : "bg-[#FAF6F0] border-[#E6DEC8]"
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAdjustLocalSku(sku, qty - 1)
                                      }
                                      className="w-6 h-6 rounded-lg bg-white border border-[#D4C5A9] flex items-center justify-center text-[#2C1E18] hover:bg-[#F3ECE0] cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      value={qty}
                                      onChange={(e) =>
                                        handleAdjustLocalSku(
                                          sku,
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-12 text-center font-black text-sm text-[#2C1E18] bg-transparent focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAdjustLocalSku(sku, qty + 1)
                                      }
                                      className="w-6 h-6 rounded-lg bg-white border border-[#D4C5A9] flex items-center justify-center text-[#2C1E18] hover:bg-[#F3ECE0] cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span
                                    className={`text-[9px] font-extrabold uppercase mt-1 ${
                                      isZero
                                        ? "text-red-700"
                                        : isLow
                                          ? "text-amber-800"
                                          : "text-[#1E4620]"
                                    }`}
                                  >
                                    {isZero
                                      ? "Esgotado"
                                      : isLow
                                        ? "Estoque Baixo"
                                        : "Disponível"}
                                  </span>
                                </div>
                              </td>
                            );
                          })}

                          <td className="py-3 px-3 text-center">
                            <span className="font-black text-base text-[#2C1E18]">
                              {rowTotal} un.
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleSetRowColorStock(
                                  stockProductFilter,
                                  color.id,
                                  10
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-[#E9F3E8] text-[#1E4620] text-[11px] font-bold hover:opacity-85 cursor-pointer"
                            >
                              Definir 10 un.
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSetRowColorStock(
                                  stockProductFilter,
                                  color.id,
                                  0
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold hover:bg-red-100 cursor-pointer"
                            >
                              Zerar Cor
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 4: GERENCIAMENTO DE CLIENTES & HISTÓRICO DE COMPRAS 360° (CRM)
           ==================================================================== */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            {/* CABEÇALHO DO CRM + BOTÕES DE AÇÃO */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6DEC8] shadow-warm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1E4620] bg-[#E9F3E8] px-3 py-1 rounded-full">
                  <UserCheck className="w-3.5 h-3.5" /> Base de Clientes
                  Alimentada Automaticamente pelas Vendas
                </span>
                <h2 className="font-serif-editorial text-2xl font-bold text-[#2C1E18] mt-1.5">
                  Central de Clientes & Histórico de Compras (CRM 360°)
                </h2>
                <p className="text-xs sm:text-sm text-[#5C4438]">
                  Consulte quantas redes cada cliente comprou, quais cores e
                  tamanhos, datas, formas de pagamento, edite dados e entre em
                  contato por WhatsApp, E-mail ou Telefone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportCustomersCsv}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FAF6F0] hover:bg-[#EFE8D8] border border-[#D4C5A9] text-xs font-extrabold text-[#2C1E18] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#9C5221]" /> Exportar
                  Planilha (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-solar-gradient text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> + Cadastrar Cliente Manual
                </button>
              </div>
            </div>

            {/* LAYOUT MASTER-DETAIL: LISTA À ESQUERDA (5 COL) + FICHA 360° À DIREITA (7 COL) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* COLUNA ESQUERDA: BUSCA, FILTROS E LISTA DE CLIENTES */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#E6DEC8] shadow-warm space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#7A6252] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar nome, WhatsApp, CPF, e-mail ou cidade..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] text-xs font-bold text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "vip", label: "⭐ VIP / Recorrentes" },
                    { id: "approved", label: "✓ Pagos" },
                    { id: "pending_pix", label: "⏳ PIX Pendente" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setCustomerFilter(
                          f.id as "all" | "vip" | "pending_pix" | "approved"
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${
                        customerFilter === f.id
                          ? "bg-[#2C1E18] text-white"
                          : "bg-[#FAF6F0] text-[#5C4438] hover:bg-[#EFE8D8]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                  {crmFilteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                          isSelected
                            ? "border-[#D95D39] bg-[#FDF8F2] shadow-sm"
                            : "border-[#E6DEC8] bg-[#FAF6F0] hover:border-[#C9B89A]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-[#2C1E18]">
                              {cust.name}
                            </h3>
                            <span className="text-[11px] text-[#7A6252] block">
                              📍 {cust.city}/{cust.uf} • 📱 {cust.phone}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#1E4620] block">
                              {formatBRL(cust.totalSpent)}
                            </span>
                            <span className="text-[10px] font-bold text-[#5C4438]">
                              {cust.ordersCount} compra(s) •{" "}
                              {cust.totalUnitsBought} rede(s)
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E6DEC8]">
                          <div className="flex flex-wrap gap-1">
                            {cust.ordersCount >= 2 && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                                ⭐ Cliente Recorrente
                              </span>
                            )}
                            {cust.hasPendingPix && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                                ⏳ PIX Pendente
                              </span>
                            )}
                            {(cust.tags || []).slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-full bg-white border border-[#D4C5A9] text-[#5C4438] text-[10px] font-bold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold uppercase text-[#7A6252]">
                            Prefere {cust.preferredPaymentMethod}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLUNA DIREITA: PRONTUÁRIO / FICHA 360° DO CLIENTE SELECIONADO */}
              <div className="md:col-span-6 lg:col-span-7 space-y-6">
                {selectedCustomer ? (
                  <div className="bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-6">
                    {/* TOPO DA FICHA DO CLIENTE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFE8D8]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-[#2C1E18] text-amber-300 font-serif-editorial font-bold text-xl flex items-center justify-center shrink-0">
                          {selectedCustomer.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
                              {selectedCustomer.name}
                            </h3>
                            {selectedCustomer.ordersCount >= 2 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                                ⭐ Cliente VIP ({selectedCustomer.ordersCount}{" "}
                                compras)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#5C4438] mt-0.5">
                            CPF: <strong>{selectedCustomer.cpf || "—"}</strong>{" "}
                            • Cliente desde{" "}
                            {new Date(
                              selectedCustomer.firstOrderDate
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* Botões de Contato Imediato em 1 Clique */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`https://wa.me/55${selectedCustomer.phone.replace(
                            /\D/g,
                            ""
                          )}?text=${encodeURIComponent(directWhatsMsg)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4620] hover:bg-[#163617] text-white text-xs font-extrabold transition"
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>

                        <button
                          type="button"
                          onClick={() => setCustomerSubTab("contact")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-solar-gradient text-white text-xs font-extrabold cursor-pointer"
                        >
                          <Mail className="w-4 h-4" /> Enviar E-mail
                        </button>

                        <a
                          href={`tel:+55${selectedCustomer.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#D4C5A9] text-[#2C1E18] text-xs font-bold"
                          title="Ligar por telefone"
                        >
                          <Phone className="w-3.5 h-3.5" /> Ligar
                        </a>
                      </div>
                    </div>

                    {/* RESUMO DE MÉTRICAS DO CLIENTE */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8]">
                        <span className="text-[10px] font-extrabold uppercase text-[#7A6252] block">
                          Total Gasto (Aprovado)
                        </span>
                        <strong className="text-lg font-black text-[#1E4620]">
                          {formatBRL(selectedCustomer.totalSpent)}
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8]">
                        <span className="text-[10px] font-extrabold uppercase text-[#7A6252] block">
                          Pedidos Realizados
                        </span>
                        <strong className="text-lg font-black text-[#2C1E18]">
                          {selectedCustomer.ordersCount} pedido(s)
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8]">
                        <span className="text-[10px] font-extrabold uppercase text-[#7A6252] block">
                          Redes Compradas
                        </span>
                        <strong className="text-lg font-black text-[#D95D39]">
                          {selectedCustomer.totalUnitsBought} unidade(s)
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8]">
                        <span className="text-[10px] font-extrabold uppercase text-[#7A6252] block">
                          Pagamento Favorito
                        </span>
                        <strong className="text-sm font-black uppercase text-[#2C1E18] flex items-center gap-1 mt-1">
                          {selectedCustomer.preferredPaymentMethod === "pix" ? (
                            <>
                              <QrCode className="w-4 h-4 text-[#1E4620]" /> PIX
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 text-[#9C5221]" />{" "}
                              Cartão
                            </>
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* NAVEGAÇÃO INTERNA DA FICHA DO CLIENTE */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-[#EFE8D8] pb-3">
                      {[
                        {
                          id: "history",
                          label: `🛍️ Histórico de Compras (${
                            selectedCustomer.purchaseHistory?.length || 0
                          })`,
                          icon: ShoppingBag,
                        },
                        {
                          id: "edit",
                          label: "✏️ Editar Dados, Endereço & Notas",
                          icon: Edit3,
                        },
                        {
                          id: "contact",
                          label: "💬 Central de Contato (WhatsApp & E-mail)",
                          icon: MessageCircle,
                        },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            setCustomerSubTab(st.id as CustomerSubTab)
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            customerSubTab === st.id
                              ? "bg-[#2C1E18] text-white"
                              : "bg-[#FAF6F0] text-[#5C4438] hover:bg-[#EFE8D8]"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* SUB-ABA 1: HISTÓRICO DETALHADO DE COMPRAS DO CLIENTE */}
                    {customerSubTab === "history" && (
                      <div className="space-y-4">
                        {/* Card de Endereço Atual & Observação Rápida */}
                        <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9C5221] block">
                              Endereço de Entrega Cadastrado:
                            </span>
                            <p className="font-bold text-[#2C1E18]">
                              {selectedCustomer.address?.street || "—"},{" "}
                              {selectedCustomer.address?.number || "S/N"}{" "}
                              {selectedCustomer.address?.complement
                                ? `(${selectedCustomer.address.complement})`
                                : ""}{" "}
                              — Bairro{" "}
                              {selectedCustomer.address?.neighborhood || "—"}
                            </p>
                            <p className="text-[#5C4438]">
                              <strong>
                                {selectedCustomer.city} / {selectedCustomer.uf}
                              </strong>{" "}
                              • CEP:{" "}
                              <span className="font-mono font-bold">
                                {selectedCustomer.cep}
                              </span>{" "}
                              • E-mail: {selectedCustomer.email || "—"}
                            </p>
                            {selectedCustomer.notes && (
                              <p className="text-[#9C5221] bg-[#F5E6D3]/60 px-2.5 py-1 rounded-lg mt-1 font-medium">
                                📝 <strong>Nota:</strong>{" "}
                                {selectedCustomer.notes}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const fullAddr = `${selectedCustomer.name} | CPF: ${selectedCustomer.cpf} | Tel: ${selectedCustomer.phone} | Endereço: ${selectedCustomer.address?.street}, ${selectedCustomer.address?.number} ${selectedCustomer.address?.complement || ""} - ${selectedCustomer.address?.neighborhood}, ${selectedCustomer.city}/${selectedCustomer.uf} - CEP: ${selectedCustomer.cep}`;
                              navigator.clipboard.writeText(fullAddr);
                              setCopiedCustAddress(true);
                              setTimeout(
                                () => setCopiedCustAddress(false),
                                2000
                              );
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#D4C5A9] text-xs font-bold text-[#2C1E18] shrink-0 cursor-pointer"
                          >
                            {copiedCustAddress ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#1E4620]" />{" "}
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copiar Dados
                              </>
                            )}
                          </button>
                        </div>

                        {/* Linha do Tempo de Compras */}
                        {selectedCustomer.purchaseHistory &&
                        selectedCustomer.purchaseHistory.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#7A6252]">
                              Linha do Tempo de Pedidos deste Cliente:
                            </h4>
                            {selectedCustomer.purchaseHistory.map(
                              (ord, idx) => (
                                <div
                                  key={ord.id}
                                  className="p-4 rounded-2xl border border-[#E6DEC8] bg-white shadow-2xs space-y-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EFE8D8]">
                                    <div className="flex items-center gap-2.5">
                                      <span className="font-mono font-black text-xs bg-[#2C1E18] text-amber-300 px-2.5 py-1 rounded-lg">
                                        #{ord.orderReference}
                                      </span>
                                      <div>
                                        <span className="text-xs font-bold text-[#2C1E18] flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5 text-[#D95D39]" />
                                          {new Date(
                                            ord.createdAt
                                          ).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        <span className="text-[11px] text-[#7A6252]">
                                          {idx === 0
                                            ? "Compra mais recente"
                                            : `Compra anterior #${
                                                selectedCustomer.purchaseHistory!
                                                  .length - idx
                                              }`}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6F0] border border-[#D4C5A9] text-[11px] font-extrabold uppercase text-[#2C1E18]">
                                        {ord.paymentMethod === "pix"
                                          ? "💠 PIX à vista"
                                          : "💳 Cartão de Crédito"}
                                      </span>
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                          ord.paymentStatus === "approved"
                                            ? "bg-[#E9F3E8] text-[#1E4620]"
                                            : ord.paymentStatus === "pending"
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {ord.paymentStatus === "approved"
                                          ? "Pago"
                                          : ord.paymentStatus === "pending"
                                            ? "PIX Pendente"
                                            : "Cancelado"}
                                      </span>
                                      <strong className="text-sm font-black text-[#1E4620]">
                                        {formatBRL(ord.totalAmount)}
                                      </strong>
                                    </div>
                                  </div>

                                  {/* Quais Redes Comprou neste Pedido */}
                                  <div className="space-y-1.5">
                                    {ord.items.map((item) => {
                                      const colorObj = TACTEL_COLORS.find(
                                        (c) => c.id === item.colorId
                                      );
                                      return (
                                        <div
                                          key={item.id}
                                          className="p-2.5 rounded-xl bg-[#FAF6F0] flex items-center justify-between text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span
                                              className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                              style={{
                                                backgroundColor:
                                                  colorObj?.hex || "#1E56A0",
                                              }}
                                            />
                                            <span>
                                              <strong>
                                                {item.quantity}x{" "}
                                                {item.productName}
                                              </strong>{" "}
                                              • Tamanho{" "}
                                              <strong>{item.size}</strong> • Cor:{" "}
                                              <strong>{item.colorName}</strong>
                                            </span>
                                          </div>
                                          <span className="font-bold text-[#2C1E18]">
                                            {formatBRL(item.totalPrice)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#5C4438]">
                                    <span>
                                      Status da Entrega:{" "}
                                      <strong className="uppercase text-[#2C1E18]">
                                        {ord.fulfillmentStatus.replace(
                                          "_",
                                          " "
                                        )}
                                      </strong>
                                      {ord.trackingCode
                                        ? ` • Rastreio: ${ord.trackingCode}`
                                        : ""}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setLabelOrder(ord)}
                                      className="inline-flex items-center gap-1 font-bold text-[#9C5221] hover:underline cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5" />{" "}
                                      Etiqueta de Envio
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] text-center text-xs text-[#5C4438]">
                            Este cliente ainda não possui pedidos registrados.
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-ABA 2: EDITAR INFORMAÇÕES, ENDEREÇO E NOTAS DO CLIENTE */}
                    {customerSubTab === "edit" && (
                      <form
                        onSubmit={handleSaveCustomerEdit}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                              Nome Completo do Cliente *
                            </label>
                            <input
                              type="text"
                              required
                              value={editCustName}
                              onChange={(e) => setEditCustName(e.target.value)}
                              className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                              WhatsApp / Telefone *
                            </label>
                            <input
                              type="text"
                              required
                              value={editCustPhone}
                              onChange={(e) => setEditCustPhone(e.target.value)}
                              className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                              E-mail do Cliente
                            </label>
                            <input
                              type="email"
                              value={editCustEmail}
                              onChange={(e) => setEditCustEmail(e.target.value)}
                              className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                              CPF / CNPJ
                            </label>
                            <input
                              type="text"
                              value={editCustCpf}
                              onChange={(e) => setEditCustCpf(e.target.value)}
                              className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>
                        </div>

                        {/* Endereço Completo com Autopreenchimento ViaCEP */}
                        <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-3">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#9C5221] block">
                            Endereço de Entrega (Autopreenchimento por CEP):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                CEP
                              </label>
                              <input
                                type="text"
                                value={editCustAddress.cep}
                                onChange={(e) =>
                                  handleEditCepLookup(e.target.value)
                                }
                                className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                Rua / Avenida
                              </label>
                              <input
                                type="text"
                                value={editCustAddress.street}
                                onChange={(e) =>
                                  setEditCustAddress((prev) => ({
                                    ...prev,
                                    street: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                Número
                              </label>
                              <input
                                type="text"
                                value={editCustAddress.number}
                                onChange={(e) =>
                                  setEditCustAddress((prev) => ({
                                    ...prev,
                                    number: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                Complemento
                              </label>
                              <input
                                type="text"
                                value={editCustAddress.complement || ""}
                                onChange={(e) =>
                                  setEditCustAddress((prev) => ({
                                    ...prev,
                                    complement: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                Bairro
                              </label>
                              <input
                                type="text"
                                value={editCustAddress.neighborhood}
                                onChange={(e) =>
                                  setEditCustAddress((prev) => ({
                                    ...prev,
                                    neighborhood: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                                Cidade / UF
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={editCustAddress.city}
                                  onChange={(e) =>
                                    setEditCustAddress((prev) => ({
                                      ...prev,
                                      city: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-xl border border-[#D4C5A9] bg-white px-2.5 py-2 text-xs font-bold text-[#2C1E18]"
                                />
                                <input
                                  type="text"
                                  maxLength={2}
                                  value={editCustAddress.uf}
                                  onChange={(e) =>
                                    setEditCustAddress((prev) => ({
                                      ...prev,
                                      uf: e.target.value.toUpperCase(),
                                    }))
                                  }
                                  className="w-12 text-center rounded-xl border border-[#D4C5A9] bg-white py-2 text-xs font-black uppercase text-[#2C1E18]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tags de Classificação do Cliente */}
                        <div>
                          <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                            Etiquetas / Perfil do Cliente (Clique para marcar):
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Cliente VIP",
                              "Recorrente",
                              "Pousada / Atacado",
                              "Aguardando PIX",
                              "Indicação",
                              "Fã de Rede c/ Mosquiteiro",
                            ].map((tag) => {
                              const active = editCustTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleCustomerTag(tag)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                                    active
                                      ? "bg-[#2C1E18] text-amber-300 border-[#2C1E18]"
                                      : "bg-[#FAF6F0] text-[#5C4438] border-[#D4C5A9]"
                                  }`}
                                >
                                  {active ? `✓ ${tag}` : `+ ${tag}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Observações Internas do Vendedor */}
                        <div>
                          <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                            <FileText className="w-3.5 h-3.5 inline mr-1 text-[#D95D39]" />
                            Observações Internas sobre o Cliente:
                          </label>
                          <textarea
                            rows={3}
                            value={editCustNotes}
                            onChange={(e) => setEditCustNotes(e.target.value)}
                            placeholder="Ex: Cliente prefere entrega pela manhã, gostou muito da cor Azul Royal..."
                            className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] p-3 text-xs text-[#2C1E18]"
                          />
                        </div>

                        {customerSavedNotice && (
                          <div className="p-3 rounded-xl bg-[#E9F3E8] border border-[#C6E2C3] text-xs font-extrabold text-[#1E4620]">
                            {customerSavedNotice}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={savingCustomer}
                          className="w-full py-3.5 rounded-2xl bg-solar-gradient text-white font-extrabold text-sm shadow-md cursor-pointer"
                        >
                          {savingCustomer
                            ? "Salvando Alterações..."
                            : "Salvar Alterações do Cliente"}
                        </button>
                      </form>
                    )}

                    {/* SUB-ABA 3: CENTRAL DE CONTATO INDIVIDUAL (WHATSAPP + E-MAIL DIRETO) */}
                    {customerSubTab === "contact" && (
                      <div className="space-y-6">
                        {/* Bloco 1: WhatsApp Personalizado para este Cliente */}
                        <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#2C1E18] flex items-center gap-1.5">
                              <MessageCircle className="w-4 h-4 text-[#1E4620]" />
                              1. Mensagem Direta de WhatsApp para{" "}
                              {selectedCustomer.name.split(" ")[0]}
                            </h4>
                            <span className="text-xs font-mono font-bold text-[#5C4438]">
                              {selectedCustomer.phone}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              {
                                label: "👋 Pós-Venda / Saber se gostou",
                                text: `Olá ${
                                  selectedCustomer.name.split(" ")[0]
                                }, tudo bem? Aqui é do Ateliê Redes Adamari! 🌞 Passando para saber se você já recebeu e estreou sua rede e se gostou do conforto do tecido Tactel!`,
                              },
                              {
                                label: "⏳ Lembrete de PIX Pendente",
                                text: `Olá ${
                                  selectedCustomer.name.split(" ")[0]
                                }! Aqui é da Redes Adamari. Vimos que seu pedido ficou aguardando a confirmação do PIX. Sua rede continua reservada aqui em Tabuleiro do Norte/CE, posso te ajudar a concluir?`,
                              },
                              {
                                label: "🎁 Oferta VIP Recompra (Desconto)",
                                text: `Olá ${
                                  selectedCustomer.name.split(" ")[0]
                                }! Como você já é cliente especial da Redes Adamari, liberamos um desconto VIP caso queira escolher uma nova cor de Rede em Tactel para sua casa ou para presentear! 🌞`,
                              },
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setDirectWhatsMsg(preset.text)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#D4C5A9] text-[11px] font-bold text-[#2C1E18] hover:border-[#1E4620] cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <textarea
                            rows={3}
                            value={directWhatsMsg}
                            onChange={(e) => setDirectWhatsMsg(e.target.value)}
                            className="w-full rounded-xl border border-[#D4C5A9] bg-white p-3 text-xs text-[#2C1E18]"
                          />

                          <a
                            href={`https://wa.me/55${selectedCustomer.phone.replace(
                              /\D/g,
                              ""
                            )}?text=${encodeURIComponent(directWhatsMsg)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 rounded-xl bg-[#1E4620] hover:bg-[#163617] text-white font-extrabold text-xs flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" /> Abrir Conversa
                            no WhatsApp de {selectedCustomer.name.split(" ")[0]}
                          </a>
                        </div>

                        {/* Bloco 2: Enviar E-mail Individual para este Cliente */}
                        <form
                          onSubmit={handleSendDirectCustomerEmail}
                          className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#2C1E18] flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-[#D95D39]" />
                              2. Enviar E-mail Individual para{" "}
                              {selectedCustomer.name.split(" ")[0]}
                            </h4>
                            <span className="text-xs font-bold text-[#5C4438]">
                              Para: {editCustEmail || "Sem e-mail cadastrado"}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                              Assunto do E-mail:
                            </label>
                            <input
                              type="text"
                              required
                              value={directEmailSubject}
                              onChange={(e) =>
                                setDirectEmailSubject(e.target.value)
                              }
                              className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                              Título Principal:
                            </label>
                            <input
                              type="text"
                              required
                              value={directEmailHeadline}
                              onChange={(e) =>
                                setDirectEmailHeadline(e.target.value)
                              }
                              className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold text-[#2C1E18]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                              Mensagem Personalizada:
                            </label>
                            <textarea
                              rows={4}
                              required
                              value={directEmailBody}
                              onChange={(e) =>
                                setDirectEmailBody(e.target.value)
                              }
                              className="w-full rounded-xl border border-[#D4C5A9] bg-white p-3 text-xs text-[#2C1E18]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#5C4438] mb-1">
                              Cupom Exclusivo (Opcional):
                            </label>
                            <input
                              type="text"
                              value={directEmailCoupon}
                              onChange={(e) =>
                                setDirectEmailCoupon(e.target.value)
                              }
                              className="w-full rounded-xl border border-[#D4C5A9] bg-white px-3 py-2 text-xs font-bold uppercase text-[#D95D39]"
                            />
                          </div>

                          {directEmailFeedback && (
                            <div className="p-3 rounded-xl bg-[#E9F3E8] border border-[#C6E2C3] text-xs font-bold text-[#1E4620]">
                              {directEmailFeedback}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={sendingDirectEmail}
                            className="w-full py-3 rounded-xl bg-solar-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            {sendingDirectEmail
                              ? "Enviando E-mail..."
                              : `Disparar E-mail Individual para ${
                                  selectedCustomer.name.split(" ")[0]
                                }`}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 5: CENTRAL DE E-MAIL MARKETING & WHATSAPP MARKETING EM MASSA
           ==================================================================== */}
        {activeTab === "marketing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-5">
              <div className="flex items-center justify-between border-b border-[#EFE8D8] pb-4">
                <div>
                  <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#D95D39]" />
                    Disparador de E-mail Marketing em Massa (Resend)
                  </h2>
                  <p className="text-xs text-[#7A6252]">
                    Envie campanhas promocionais com a identidade visual do
                    Ateliê Adamari
                  </p>
                </div>
                <span className="text-xs font-extrabold bg-[#E9F3E8] text-[#1E4620] px-3 py-1 rounded-full">
                  {filteredCustomers.length} destinatários
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#5C4438]">
                  Carregar Modelo Pronto:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("launch")}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#D4C5A9] text-xs font-bold text-[#2C1E18] hover:border-[#D95D39] cursor-pointer"
                  >
                    🎨 Lote Novo / Cores
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("pix_recovery")}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#D4C5A9] text-xs font-bold text-[#2C1E18] hover:border-[#D95D39] cursor-pointer"
                  >
                    ⏳ Recuperação de PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("shipping")}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#D4C5A9] text-xs font-bold text-[#2C1E18] hover:border-[#D95D39] cursor-pointer"
                  >
                    🚚 Promoção Frete Grátis
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendEmailCampaign} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Segmento de Clientes:
                  </label>
                  <select
                    value={mktSegment}
                    onChange={(e) =>
                      setMktSegment(
                        e.target.value as "all" | "pending_pix" | "approved"
                      )
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2.5 text-xs font-bold text-[#2C1E18]"
                  >
                    <option value="all">
                      Todos os Clientes Cadastrados (
                      {data?.customers.length || 0})
                    </option>
                    <option value="pending_pix">
                      Apenas Clientes com PIX Pendente (Recuperação de Venda)
                    </option>
                    <option value="approved">
                      Apenas Clientes que Já Compraram (Recompra / Fidelização)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Assunto do E-mail:
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Título Interno (Headline):
                  </label>
                  <input
                    type="text"
                    required
                    value={emailHeadline}
                    onChange={(e) => setEmailHeadline(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Mensagem (Use <code>{"{nome}"}</code> para personalizar):
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] p-3 text-xs text-[#2C1E18] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                      Cupom de Destaque (Opcional):
                    </label>
                    <input
                      type="text"
                      value={emailCoupon}
                      onChange={(e) => setEmailCoupon(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold uppercase text-[#D95D39]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                      Texto do Botão:
                    </label>
                    <input
                      type="text"
                      value={emailCtaText}
                      onChange={(e) => setEmailCtaText(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#2C1E18]"
                    />
                  </div>
                </div>

                {emailResultNotice && (
                  <div className="p-3.5 rounded-2xl bg-[#E9F3E8] border border-[#C6E2C3] text-xs font-bold text-[#1E4620]">
                    {emailResultNotice}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="w-full py-3.5 rounded-2xl bg-solar-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {sendingEmail
                    ? "Disparando E-mails..."
                    : `Disparar E-mail para ${filteredCustomers.length} Cliente(s)`}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-4">
              <div>
                <h2 className="font-serif-editorial text-xl font-bold text-[#2C1E18] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#1E4620]" />
                  Lista de Disparo Rápido no WhatsApp
                </h2>
                <p className="text-xs text-[#7A6252]">
                  Envie mensagens personalizadas com 1 clique para cada cliente
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                  Texto da Mensagem de WhatsApp (com <code>{"{nome}"}</code>):
                </label>
                <textarea
                  rows={3}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] p-3 text-xs text-[#2C1E18]"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredCustomers.map((cust) => {
                  const firstName = cust.name.split(" ")[0] || "Cliente";
                  const personalizedMsg = whatsappTemplate.replace(
                    /\{nome\}/gi,
                    firstName
                  );
                  const cleanPhone = cust.phone.replace(/\D/g, "");

                  return (
                    <div
                      key={cust.id}
                      className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <strong className="text-[#2C1E18] block">
                          {cust.name}
                        </strong>
                        <span className="text-[11px] text-[#7A6252]">
                          {cust.city}/{cust.uf} • {cust.phone}
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                          personalizedMsg
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E4620] text-white font-extrabold hover:bg-[#163617] shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Enviar
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 6: ESTÚDIO CRIATIVO DE REDES SOCIAIS COM GEMINI NANO BANANA
           ==================================================================== */}
        {activeTab === "social_studio" && (
          <div className="space-y-6">
            {/* BARRA COMPACTA DO ESTÚDIO COM BOTÃO PARA ABRIR MODAL DA API */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-3xl p-4 sm:p-5 border border-[#E6DEC8] shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5E6D3] flex items-center justify-center text-[#9C5221] shrink-0">
                  <Sparkles className="w-5 h-5 text-[#D95D39]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#2C1E18]">
                      Estúdio Criativo IA (Nano Banana)
                    </h2>
                    {geminiApiKey.trim().length > 10 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E4620] bg-[#E9F3E8] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#1E4620]" /> Chave Conectada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#9C5221] bg-[#FDF8F2] border border-[#E6DEC8] px-2.5 py-0.5 rounded-full">
                        Modo Demonstração (Sem Chave)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C4438] mt-0.5">
                    Gere fotos publicitárias oficiais preservando o Tactel, bolsinho e cordas brancas 2,50mm + 3 legendas prontas!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE8D8] border border-[#D4C5A9] text-xs font-extrabold text-[#2C1E18] transition shrink-0 cursor-pointer shadow-sm self-start sm:self-auto"
              >
                <Key className="w-4 h-4 text-[#D95D39]" />
                <span>{geminiApiKey.trim().length > 10 ? "Alterar Chave Gemini" : "Configurar Chave Google AI"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#E6DEC8] shadow-warm space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9C5221] bg-[#F5E6D3] px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" /> Gemini
                  Nano Banana 2.1 Oficial
                </span>
                <h2 className="font-serif-editorial text-2xl font-bold text-[#2C1E18] mt-2">
                  Estúdio de Posts & Stories IA
                </h2>
                <p className="text-xs text-[#5C4438] mt-1">
                  Gera fotos publicitárias usando a foto real da sua rede como
                  referência (preservando o Tactel, bolsinho e cordas brancas
                  2,5mm) + 3 legendas prontas!
                </p>
              </div>

              <form onSubmit={handleGenerateStudioPost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                    1. Qual Rede Você Quer Divulgar?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "rede-tradicional",
                        "rede-mosquiteiro",
                      ] as ProductId[]
                    ).map((pid) => (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setStudioProduct(pid)}
                        className={`p-3 rounded-2xl border-2 text-left text-xs font-extrabold transition cursor-pointer ${
                          studioProduct === pid
                            ? "border-[#D95D39] bg-[#FDF8F2] text-[#2C1E18]"
                            : "border-[#E6DEC8] bg-[#FAF6F0] text-[#5C4438]"
                        }`}
                      >
                        {PRODUCTS[pid].shortName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                    2. Cor do Tecido Tactel:
                  </label>
                  <select
                    value={studioColorId}
                    onChange={(e) => setStudioColorId(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2.5 text-xs font-bold text-[#2C1E18]"
                  >
                    {TACTEL_COLORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.profile})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                    3. Formato para Rede Social:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "1:1", label: "Feed (1:1)" },
                      { id: "9:16", label: "Stories/Reels (9:16)" },
                      { id: "16:9", label: "Banner (16:9)" },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          setStudioAspectRatio(
                            fmt.id as "1:1" | "9:16" | "16:9"
                          )
                        }
                        className={`py-2.5 px-2 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                          studioAspectRatio === fmt.id
                            ? "border-[#2C1E18] bg-[#2C1E18] text-white"
                            : "border-[#E6DEC8] bg-[#FAF6F0] text-[#5C4438]"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1.5">
                    4. Cenário Desejado (ou clique numa sugestão abaixo):
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      "Varanda de praia no Ceará com coqueiros e sol da tarde",
                      "Jardim gramado entre duas árvores com livro e café",
                      "Acampamento na serra ao entardecer com natureza ao redor",
                      "Varanda gourmet de apartamento moderno e aconchegante",
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setStudioScene(preset)}
                        className="text-[11px] bg-[#FAF6F0] hover:bg-[#EFE8D8] border border-[#D4C5A9] px-2.5 py-1 rounded-lg text-[#5C4438] font-semibold cursor-pointer"
                      >
                        + {preset.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={studioScene}
                    onChange={(e) => setStudioScene(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] p-3 text-xs text-[#2C1E18]"
                  />
                </div>

                {studioErrorNotice && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{studioErrorNotice}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={studioLoading}
                  className="w-full py-3.5 rounded-2xl bg-solar-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  {studioLoading
                    ? "Gerando Imagem e Legendas no Gemini Nano Banana..."
                    : "Gerar Foto + 3 Legendas com IA"}
                </button>
              </form>
            </div>

            <div className="md:col-span-6 lg:col-span-7 space-y-6">
              {studioResult ? (
                <div className="bg-white rounded-3xl p-6 border border-[#E6DEC8] shadow-warm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#1E4620] bg-[#E9F3E8] px-3 py-1 rounded-full">
                        ✓ Criativo Pronto para Postar
                      </span>
                      <p className="text-[11px] text-[#7A6252] mt-1">
                        Modelo: {studioResult.modelUsed}
                      </p>
                    </div>
                    <a
                      href={studioResult.imageUrl}
                      download={`post-redes-adamari-${studioColorId}.jpg`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C1E18] text-white text-xs font-extrabold"
                    >
                      <Download className="w-4 h-4" /> Baixar Imagem
                    </a>
                  </div>

                  {studioResult.notice && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                      {studioResult.notice}
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden border border-[#E6DEC8] bg-[#FAF6F0] max-h-[460px] flex items-center justify-center">
                    <img
                      src={studioResult.imageUrl}
                      alt="Post Gerado Gemini Nano Banana"
                      className="w-full h-full object-contain max-h-[440px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif-editorial text-lg font-bold text-[#2C1E18]">
                      3 Sugestões de Legendas Prontas (Instagram, Facebook e
                      WhatsApp):
                    </h3>
                    {studioResult.captions.map((cap, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#9C5221]">
                            Opção de Legenda #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cap);
                              setCopiedCaptionIdx(idx);
                              setTimeout(() => setCopiedCaptionIdx(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#D4C5A9] text-xs font-bold text-[#2C1E18] cursor-pointer"
                          >
                            {copiedCaptionIdx === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#1E4620]" />{" "}
                                Copiada!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copiar Legenda
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#2C1E18] whitespace-pre-line leading-relaxed">
                          {cap}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-[#E6DEC8] shadow-warm text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-[#D95D39] mx-auto" />
                  <h3 className="font-serif-editorial text-xl font-bold text-[#2C1E18]">
                    Pronto para Criar Seu Post!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C4438] max-w-md mx-auto">
                    Selecione ao lado o modelo da rede, a cor do Tactel e o
                    cenário desejado. O <strong>Gemini Nano Banana</strong>{" "}
                    criará a arte visual e 3 legendas de alta conversão!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* ======================================================================
          MODAL DE CONFIGURAÇÃO DA CHAVE GOOGLE AI STUDIO (GEMINI)
         ====================================================================== */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE8D8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5E6D3] flex items-center justify-center text-[#9C5221]">
                  <Key className="w-5 h-5 text-[#D95D39]" />
                </div>
                <div>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#2C1E18]">
                    Configurar Google AI Studio
                  </h3>
                  <p className="text-[11px] text-[#7A6252]">
                    Fica salva com segurança no seu navegador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#5C4438]" />
              </button>
            </div>

            <p className="text-xs text-[#5C4438] leading-relaxed">
              Cole sua chave de API para habilitar as legendas persuasivas gratuitas e/ou imagens inéditas no <strong>Gemini Nano Banana</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C1E18]">
                Sua API Key do Google AI Studio:
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Cole aqui (ex: AIzaSy...)"
                  className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] pl-3.5 pr-10 py-2.5 text-xs font-mono text-[#2C1E18] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D95D39]"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6252] hover:text-[#2C1E18] cursor-pointer"
                  title={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#9C5221] hover:underline"
              >
                <span>Criar Chave Grátis no AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4C5A9] text-xs font-bold text-[#5C4438] hover:bg-[#FAF6F0] cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveGeminiKey(geminiApiKey);
                    setTimeout(() => setIsApiKeyModalOpen(false), 600);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2C1E18] hover:bg-[#3D2B22] text-white text-xs font-extrabold cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Salvar e Fechar
                </button>
              </div>
            </div>

            {apiKeySavedNotice && (
              <p className="text-[11px] font-bold text-[#1E4620] flex items-center gap-1 bg-[#E9F3E8] p-2.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E4620]" /> Chave salva com sucesso no navegador!
              </p>
            )}

            <div className="pt-3 border-t border-[#FAF6F0] flex items-start gap-2 text-[11px] text-[#7A6252]">
              <ShieldCheck className="w-4 h-4 text-[#D95D39] shrink-0 mt-0.5" />
              <span>
                <strong>Garantia Anti-Alucinação:</strong> O sistema sempre vincula as fotos reais do seu ateliê para garantir cordas brancas 2,50mm trançadas e tecido 100% Tactel com bolsinho lateral.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL DE CADASTRO MANUAL DE NOVO CLIENTE
         ====================================================================== */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE8D8] pb-3">
              <h3 className="font-serif-editorial text-xl font-bold text-[#2C1E18]">
                Cadastrar Novo Cliente Manualmente
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualCustomer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.name}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    WhatsApp c/ DDD *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(88) 99999-9999"
                    value={newCustForm.phone}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newCustForm.email}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    CPF / CNPJ
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cpf}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, cpf: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cep}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, cep: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={newCustForm.city}
                    onChange={(e) =>
                      setNewCustForm((p) => ({ ...p, city: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCustForm.uf}
                    onChange={(e) =>
                      setNewCustForm((p) => ({
                        ...p,
                        uf: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1E18] mb-1">
                  Observações do Cliente
                </label>
                <textarea
                  rows={2}
                  value={newCustForm.notes}
                  onChange={(e) =>
                    setNewCustForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4C5A9] text-xs font-bold text-[#5C4438] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="px-5 py-2.5 rounded-xl bg-solar-gradient text-white text-xs font-extrabold cursor-pointer"
                >
                  {savingCustomer ? "Salvando..." : "Salvar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL DE IMPRESSÃO DE ETIQUETA DE ENVIO (CORREIOS / TRANSPORTADORA)
         ====================================================================== */}
      {labelOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="font-serif-editorial text-lg font-bold text-[#2C1E18]">
                Etiqueta de Expedição #{labelOrder.orderReference}
              </h3>
              <button
                type="button"
                onClick={() => setLabelOrder(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-black p-5 rounded-xl space-y-4 text-black bg-white">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block">
                    EXPEDIÇÃO E-COMMERCE BRASIL
                  </span>
                  <strong className="text-lg font-black">
                    REDES ADAMARI (ATELIÊ ADAMARI)
                  </strong>
                </div>
                <div className="text-right font-mono text-xs font-bold">
                  PEDIDO: #{labelOrder.orderReference}
                  <br />
                  {labelOrder.trackingCode || "ENVIO IMEDIATO"}
                </div>
              </div>

              <div className="bg-gray-100 p-3.5 rounded-lg border border-black space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  DESTINATÁRIO
                </span>
                <p className="text-base font-black mt-1">
                  {labelOrder.customerName}
                </p>
                <p className="text-sm font-bold">
                  {labelOrder.shippingAddress.street},{" "}
                  {labelOrder.shippingAddress.number}{" "}
                  {labelOrder.shippingAddress.complement
                    ? `- ${labelOrder.shippingAddress.complement}`
                    : ""}
                </p>
                <p className="text-sm">
                  Bairro: {labelOrder.shippingAddress.neighborhood}
                </p>
                <p className="text-base font-black">
                  {labelOrder.city} / {labelOrder.uf}
                </p>
                <p className="text-xl font-mono font-black tracking-wider pt-1">
                  CEP: {labelOrder.shippingAddress.cep}
                </p>
                <p className="text-xs">Tel/WhatsApp: {labelOrder.customerPhone}</p>
              </div>

              <div className="text-xs border-t border-dashed border-black pt-3 space-y-1">
                <strong className="uppercase block">
                  REMETENTE: REDES ADAMARI CONFECÇÕES LTDA.
                </strong>
                <p>CNPJ: 52.148.963/0001-45 • Polo Industrial Artesanal</p>
                <p>Tabuleiro do Norte – Ceará • CEP: 62960-000</p>
              </div>

              <div className="text-xs border-t border-black pt-3">
                <strong className="uppercase block mb-1">
                  CONFERÊNCIA DE CONTEÚDO DO PACOTE:
                </strong>
                {labelOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between font-bold">
                    <span>
                      [ ] {it.quantity}x {it.productName} (Tam. {it.size}) — Cor:{" "}
                      {it.colorName}
                    </span>
                    <span>{formatBRL(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setLabelOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D4C5A9] text-xs font-bold text-[#5C4438] cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C1E18] text-white text-xs font-extrabold cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Etiqueta Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
