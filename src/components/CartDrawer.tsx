"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  QrCode,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  MapPin,
  Wrench,
} from "lucide-react";
import {
  ACCESSORY_LIST,
  FREE_SHIPPING_THRESHOLD,
  calculateShippingByUF,
  formatBRL,
  isAccessoryProduct,
} from "@/data/products";
import { useCartStore, resolveCartDetails, getSkuKey } from "@/store/cartStore";

interface SandboxResult {
  orderReference: string;
  totalAmount: number;
  shippingPrice: number;
  paymentMethod: "pix" | "card";
  successRedirectUrl: string;
  pixCopyPasteCode: string;
}

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    paymentMethod,
    address,
    customer,
    stockMap,
    stockLoaded,
    fetchStock,
    closeDrawer,
    setPaymentMethod,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setAddress,
    setCustomer,
  } = useCartStore();

  const [step, setStep] = useState<"cart" | "checkout" | "payment_preview">(
    "cart"
  );
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [sandboxData, setSandboxData] = useState<SandboxResult | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isDrawerOpen) return null;

  const {
    detailedItems,
    totalItemsCount,
    subtotalCard,
    subtotalPix,
    activeSubtotal,
    pixSavings,
  } = resolveCartDetails(items, paymentMethod, stockMap, stockLoaded);

  const missingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - activeSubtotal
  );
  const freeShippingProgress = Math.min(
    100,
    (activeSubtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const shippingInfo = address.uf
    ? calculateShippingByUF(address.uf, activeSubtotal)
    : null;

  const finalTotal =
    activeSubtotal + (shippingInfo ? shippingInfo.price : 0);

  const handleCepChange = async (rawVal: string) => {
    const digits = rawVal.replace(/\D/g, "").slice(0, 8);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setAddress({ cep: formatted });
    setCepError("");

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepError("CEP não encontrado. Verifique os números.");
        } else {
          setAddress({
            cep: formatted,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            uf: data.uf || "",
          });
        }
      } catch {
        setCepError("Não foi possível consultar o CEP automaticamente.");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !address.cep.trim() ||
      !address.street.trim() ||
      !address.number.trim() ||
      !address.city.trim() ||
      !address.uf.trim()
    ) {
      setCheckoutError(
        "Por favor, preencha seu nome, WhatsApp e endereço completo com número."
      );
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            colorId: i.colorId,
            quantity: i.quantity,
          })),
          paymentMethod,
          customer,
          address,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        await fetchStock();
        throw new Error(data.error || "Erro ao iniciar o pagamento.");
      }

      await fetchStock();

      if (data.mode === "mercadopago_live" && data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }

      setSandboxData(data);
      setStep("payment_preview");
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Erro ao processar pedido."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!sandboxData?.pixCopyPasteCode) return;
    navigator.clipboard.writeText(sandboxData.pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleConfirmSandboxOrder = () => {
    if (!sandboxData) return;
    const url = sandboxData.successRedirectUrl;
    clearCart();
    closeDrawer();
    setStep("cart");
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Quente */}
      <div
        className="fixed inset-0 bg-[#1A110D]/65 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Painel da Sacola com Estética Acolhedora Ateliê Adamari (Adaptado p/ Celular e Tablet) */}
      <div className="relative z-10 w-full max-w-md md:max-w-lg bg-[#FAF6F0] h-full flex flex-col shadow-2xl border-l border-[#E6DEC8]">
        {/* Header da Sacola em Tom Café / Madeira com a Logo Oficial */}
        <div className="px-5 py-4 border-b border-[#422F24] flex items-center justify-between bg-[#2C1E18] text-[#FAF6F0]">
          <div className="flex items-center gap-3">
            {step !== "cart" ? (
              <button
                type="button"
                onClick={() =>
                  setStep(step === "payment_preview" ? "checkout" : "cart")
                }
                className="p-2 rounded-full bg-[#3D2B22] hover:bg-[#4E382D] text-[#FAF6F0] transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#FAF6F0] p-0.5 flex items-center justify-center shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Ateliê Adamari"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            )}

            <div>
              <h2 className="font-serif-editorial font-bold text-base sm:text-lg leading-tight text-white">
                {step === "cart" && `Minha Sacola (${totalItemsCount})`}
                {step === "checkout" && "Dados de Entrega"}
                {step === "payment_preview" && "Pagamento Mercado Pago"}
              </h2>
              <p className="text-[11px] text-[#C9B89A]">
                Ateliê Adamari • Compra 100% Protegida
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-full text-[#C9B89A] hover:text-white hover:bg-[#3D2B22] transition cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso de Frete Grátis (Verde Folha) */}
        {detailedItems.length > 0 && step !== "payment_preview" && (
          <div className="bg-[#E9F3E8] border-b border-[#C6E2C3] px-5 py-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E4620] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#1E4620] shrink-0" />
                {missingForFreeShipping === 0 ? (
                  <strong className="text-[#1E4620]">
                    Parabéns! Você ganhou FRETE GRÁTIS!
                  </strong>
                ) : (
                  <span>
                    Faltam{" "}
                    <strong className="text-[#1E4620]">
                      {formatBRL(missingForFreeShipping)}
                    </strong>{" "}
                    para <strong>Frete Grátis</strong>!
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-[#C6E2C3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E4620] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* CONTEÚDO CENTRAL ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {detailedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-18 h-18 rounded-full bg-[#F3ECE0] border border-[#E6DEC8] flex items-center justify-center text-[#9C5221] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif-editorial text-xl font-bold text-[#2C1E18]">
                Sua sacola ainda está vazia
              </h3>
              <p className="text-sm text-[#5C4438] max-w-xs mt-1.5 mb-6 leading-relaxed">
                Escolha sua Rede Tradicional ou Rede com Mosquiteiro, toque na
                sua cor favorita de Tactel e selecione o tamanho!
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="px-7 py-3.5 rounded-full bg-solar-gradient text-white text-sm font-extrabold shadow-md transition cursor-pointer"
              >
                Escolher Minha Rede
              </button>
            </div>
          ) : step === "cart" ? (
            <>
              {/* Lista de Produtos na Sacola com Miniatura Fotográfica + Cor */}
              <div className="space-y-3">
                {detailedItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl border border-[#E6DEC8] bg-white shadow-warm flex gap-3.5 items-start"
                  >
                    {/* Miniatura da Foto Real + Selo de Cor/Tamanho */}
                    <div className="w-16 h-16 rounded-2xl shrink-0 relative overflow-hidden border border-[#E6DEC8] bg-white">
                      <img
                        src={
                          isAccessoryProduct(item.productId)
                            ? item.product.coverPhoto
                            : item.product.hasMosquitoNet
                              ? "/images/rede-mosquiteiro-verde.jpg"
                              : item.color.photoUrl
                        }
                        alt={item.product.shortName}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full ${
                          isAccessoryProduct(item.productId)
                            ? "object-contain p-1"
                            : "object-cover"
                        }`}
                      />
                      <span
                        className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs border border-white/30 tactel-swatch-sheen"
                        style={{ backgroundColor: item.color.hex }}
                      >
                        {item.size === "UNICO" ? "KIT" : item.size}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif-editorial font-bold text-sm sm:text-base text-[#2C1E18] leading-snug">
                          {item.product.shortName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-[#8C6D58] hover:text-red-600 p-1 cursor-pointer transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-[#5C4438]">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <span
                            className="w-3 h-3 rounded-full inline-block border border-black/20 tactel-swatch-sheen"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          {item.color.name}
                        </span>
                        {item.size !== "UNICO" && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-[#2C1E18]">
                              Tam. {item.size}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#D4C5A9] rounded-xl bg-[#FAF6F0]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-[#2C1E18] hover:bg-white rounded-l-xl cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold text-[#2C1E18]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.availableStock}
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId,
                                item.quantity + 1,
                                item.availableStock
                              )
                            }
                            title={
                              item.quantity >= item.availableStock
                                ? `Estoque máximo atingido (${item.availableStock} un.)`
                                : "Aumentar quantidade"
                            }
                            className="w-7 h-7 flex items-center justify-center text-[#2C1E18] hover:bg-white disabled:opacity-35 rounded-r-xl cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-[#1E4620]">
                            {formatBRL(item.lineTotal)}
                          </span>
                          <span className="block text-[10px] text-[#7A6252]">
                            {item.quantity >= item.availableStock
                              ? `Máx. estoque (${item.availableStock} un.)`
                              : paymentMethod === "pix"
                                ? "no PIX c/ desconto"
                                : "no Cartão"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sugestão Compre Junto (Order Bump de Acessórios) */}
              {(() => {
                const missingAccessories = ACCESSORY_LIST.filter(
                  (acc) => !items.some((it) => it.productId === acc.id)
                );
                if (missingAccessories.length === 0) return null;

                return (
                  <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-[#E6DEC8] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#2C1E18] flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-[#D95D39]" />
                        Complete sua Instalação (Compre Junto):
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C5221] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                        Envio no mesmo frete
                      </span>
                    </div>

                    <div className="space-y-2">
                      {missingAccessories.map((acc) => {
                        const sku = getSkuKey(acc.id, "UNICO", "padrao");
                        const stock = stockLoaded ? (stockMap[sku] ?? 25) : 25;
                        if (stock <= 0) return null;
                        const price =
                          paymentMethod === "pix"
                            ? acc.sizes.UNICO.pricePix
                            : acc.sizes.UNICO.priceCard;

                        return (
                          <div
                            key={acc.id}
                            className="p-2.5 rounded-xl bg-white border border-[#EFE8D8] flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={acc.coverPhoto}
                                alt={acc.shortName}
                                loading="lazy"
                                decoding="async"
                                className="w-11 h-11 rounded-lg object-contain border border-[#EFE8D8] bg-white p-0.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#2C1E18] truncate">
                                  {acc.shortName}
                                </p>
                                <p className="text-[11px] font-extrabold text-[#1E4620]">
                                  + {formatBRL(price)}{" "}
                                  <span className="text-[10px] font-normal text-[#7A6252]">
                                    ({acc.badge})
                                  </span>
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addItem(acc.id, "UNICO", "padrao", 1, stock)
                              }
                              className="px-3 py-1.5 rounded-xl bg-[#2C1E18] hover:bg-[#D95D39] text-white text-xs font-extrabold shrink-0 transition cursor-pointer"
                            >
                              + Levar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Seletor Rápido: PIX vs Cartão */}
              <div className="p-3.5 rounded-2xl bg-[#F3ECE0] border border-[#E6DEC8] space-y-2">
                <span className="text-xs font-bold text-[#2C1E18] block">
                  Forma de Pagamento (Mercado Pago):
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      paymentMethod === "pix"
                        ? "border-[#1E4620] bg-[#E9F3E8] text-[#1E4620] font-bold shadow-2xs"
                        : "border-[#E6DEC8] bg-white text-[#5C4438]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <QrCode className="w-4 h-4 text-[#1E4620]" />
                      PIX c/ Desconto
                    </div>
                    <p className="text-xs text-[#1E4620] mt-0.5 font-black">
                      {formatBRL(subtotalPix)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-[#2C1E18] bg-[#2C1E18] text-white font-bold shadow-2xs"
                        : "border-[#E6DEC8] bg-white text-[#5C4438]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <CreditCard className="w-4 h-4" />
                      Cartão até 3x
                    </div>
                    <p
                      className={`text-xs mt-0.5 font-black ${
                        paymentMethod === "card"
                          ? "text-amber-300"
                          : "text-[#2C1E18]"
                      }`}
                    >
                      {formatBRL(subtotalCard)}
                    </p>
                  </button>
                </div>
              </div>

              {/* Simulador de Frete por CEP */}
              <div className="p-4 rounded-2xl border border-[#E6DEC8] bg-white shadow-warm space-y-2.5">
                <label className="text-xs font-bold text-[#2C1E18] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D95D39]" />
                  Calcular Frete e Prazo de Entrega (CEP):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="flex-1 rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3.5 py-2 text-sm font-bold text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                  {cepLoading && (
                    <div className="flex items-center px-2 text-[#9C5221]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                {cepError && (
                  <p className="text-xs text-red-600 font-medium">{cepError}</p>
                )}
                {shippingInfo && address.city && (
                  <div className="p-2.5 rounded-xl bg-[#E9F3E8] border border-[#C6E2C3] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#2C1E18]">
                        {address.city} - {address.uf}
                      </p>
                      <p className="text-[#4A3728]">
                        Prazo estimado: {shippingInfo.days}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#1E4620] text-sm">
                      {shippingInfo.isFree
                        ? "FRETE GRÁTIS"
                        : formatBRL(shippingInfo.price)}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : step === "checkout" ? (
            /* FORMULÁRIO DE ENTREGA E IDENTIFICAÇÃO */
            <form
              id="checkout-form"
              onSubmit={handleCheckoutSubmit}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-white border border-[#E6DEC8] shadow-warm space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9C5221]">
                  1. Seus Dados para Envio e Rastreio
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      WhatsApp c/ DDD *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="(88) 99999-9999"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ phone: e.target.value })}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      CPF (Para nota/envio) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="000.000.000-00"
                      value={customer.cpf}
                      onChange={(e) => setCustomer({ cpf: e.target.value })}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] mb-1">
                    E-mail (Para comprovante Mercado Pago)
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E6DEC8] shadow-warm space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9C5221]">
                  2. Endereço de Entrega
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="00000-000"
                      value={address.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      Cidade / UF *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={Boolean(address.city && address.uf)}
                      placeholder="Cidade - UF"
                      value={
                        address.city
                          ? `${address.city} / ${address.uf}`
                          : address.uf
                      }
                      onChange={(e) => setAddress({ city: e.target.value })}
                      className="w-full rounded-xl border border-[#E6DEC8] bg-[#F3ECE0] px-3 py-2 text-sm text-[#2C1E18]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da rua"
                    value={address.street}
                    onChange={(e) => setAddress({ street: e.target.value })}
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nº 123"
                      value={address.number}
                      onChange={(e) => setAddress({ number: e.target.value })}
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A3728] mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      placeholder="Apto, Casa..."
                      value={address.complement}
                      onChange={(e) =>
                        setAddress({ complement: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu bairro"
                    value={address.neighborhood}
                    onChange={(e) =>
                      setAddress({ neighborhood: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D4C5A9] bg-[#FAF6F0] px-3 py-2 text-sm text-[#2C1E18] focus:outline-none focus:border-[#D95D39]"
                  />
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {checkoutError}
                </div>
              )}
            </form>
          ) : (
            /* TELA DE PAGAMENTO INTERATIVO MERCADO PAGO */
            sandboxData && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E9F3E8] border border-[#C6E2C3] text-xs text-[#1E4620] space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Pedido #{sandboxData.orderReference}</span>
                    <span className="bg-[#1E4620] text-white px-2.5 py-0.5 rounded-full text-[10px]">
                      Mercado Pago Checkout
                    </span>
                  </div>
                  <p>
                    Total c/ frete:{" "}
                    <strong className="text-sm font-black">
                      {formatBRL(sandboxData.totalAmount)}
                    </strong>
                  </p>
                </div>

                {sandboxData.paymentMethod === "pix" ? (
                  <div className="p-5 rounded-2xl border border-[#E6DEC8] bg-white shadow-warm text-center space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4620] bg-[#E9F3E8] px-3 py-1 rounded-full">
                      <QrCode className="w-4 h-4" /> PIX Instantâneo Mercado
                      Pago
                    </span>

                    <div className="w-44 h-44 mx-auto p-3 rounded-2xl border-2 border-[#1E4620] bg-white flex items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-[#2C1E18]"
                      >
                        <rect
                          x="5"
                          y="5"
                          width="26"
                          height="26"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                        />
                        <rect
                          x="13"
                          y="13"
                          width="10"
                          height="10"
                          fill="currentColor"
                        />
                        <rect
                          x="69"
                          y="5"
                          width="26"
                          height="26"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                        />
                        <rect
                          x="77"
                          y="13"
                          width="10"
                          height="10"
                          fill="currentColor"
                        />
                        <rect
                          x="5"
                          y="69"
                          width="26"
                          height="26"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                        />
                        <rect
                          x="13"
                          y="77"
                          width="10"
                          height="10"
                          fill="currentColor"
                        />
                        <rect
                          x="42"
                          y="12"
                          width="8"
                          height="8"
                          fill="currentColor"
                        />
                        <rect
                          x="54"
                          y="20"
                          width="8"
                          height="16"
                          fill="currentColor"
                        />
                        <rect
                          x="38"
                          y="42"
                          width="24"
                          height="20"
                          fill="currentColor"
                        />
                        <rect
                          x="12"
                          y="44"
                          width="16"
                          height="8"
                          fill="currentColor"
                        />
                        <rect
                          x="70"
                          y="46"
                          width="20"
                          height="12"
                          fill="currentColor"
                        />
                        <rect
                          x="44"
                          y="72"
                          width="14"
                          height="20"
                          fill="currentColor"
                        />
                        <rect
                          x="68"
                          y="70"
                          width="22"
                          height="22"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <p className="text-xs text-[#5C4438]">
                      Escaneie o QR Code no aplicativo do seu banco ou copie o
                      código PIX abaixo:
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#F3ECE0] hover:bg-[#E8DFCE] text-[#2C1E18] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-[#1E4620]" />
                          Código PIX Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Código PIX Copia e Cola
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-[#E6DEC8] bg-white shadow-warm space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9C5221] bg-[#F5E6D3] px-3 py-1 rounded-full">
                      <CreditCard className="w-4 h-4" /> Cartão de Crédito
                      (Mercado Pago)
                    </span>
                    <p className="text-xs text-[#5C4438] leading-relaxed">
                      Ambiente pronto para processar cartões em até 3x sem
                      juros. Ao inserir sua chave{" "}
                      <code className="bg-[#F3ECE0] px-1 rounded">
                        MP_ACCESS_TOKEN
                      </code>{" "}
                      no Cloudflare, o cliente será direcionado ao checkout
                      oficial do Mercado Pago.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmSandboxOrder}
                  className="w-full py-3.5 px-5 rounded-full bg-solar-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Pedido e Ver Comprovante
                </button>
              </div>
            )
          )}
        </div>

        {/* RODAPÉ FIXO DA SACOLA COM TOTAIS E BOTÃO DE AÇÃO */}
        {detailedItems.length > 0 && step !== "payment_preview" && (
          <div className="p-5 border-t border-[#E6DEC8] bg-white space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5C4438]">
                <span>Subtotal ({totalItemsCount} itens):</span>
                <span className="font-bold text-[#2C1E18]">
                  {formatBRL(activeSubtotal)}
                </span>
              </div>
              {paymentMethod === "pix" && pixSavings > 0 && (
                <div className="flex justify-between text-[#1E4620] font-bold">
                  <span>Desconto exclusivo PIX:</span>
                  <span>- {formatBRL(pixSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C4438]">
                <span>Frete ({address.uf || "Informe o CEP"}):</span>
                <span className="font-bold text-[#2C1E18]">
                  {shippingInfo
                    ? shippingInfo.isFree
                      ? "GRÁTIS"
                      : formatBRL(shippingInfo.price)
                    : "A calcular"}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#2C1E18] pt-2 border-t border-[#EFE8D8]">
                <span>Total a pagar:</span>
                <span className="text-[#1E4620]">
                  {formatBRL(finalTotal)}
                </span>
              </div>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full py-3.5 px-5 rounded-full bg-solar-gradient text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#D95D39]/25 transition cursor-pointer"
              >
                Continuar para Entrega
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={checkoutLoading}
                className="w-full py-3.5 px-5 rounded-full bg-[#1E4620] hover:bg-[#163617] disabled:opacity-60 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando ao Mercado Pago...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    Pagar {formatBRL(finalTotal)} no Mercado Pago
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
