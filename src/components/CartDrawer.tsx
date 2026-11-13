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
} from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  calculateShippingByUF,
  formatBRL,
} from "@/data/products";
import { useCartStore, resolveCartDetails } from "@/store/cartStore";

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
    closeDrawer,
    setPaymentMethod,
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
  } = resolveCartDetails(items, paymentMethod);

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

  // Busca automática do endereço via API pública ViaCEP
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
        throw new Error(data.error || "Erro ao iniciar o pagamento.");
      }

      if (data.mode === "mercadopago_live" && data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }

      // Modo Demonstração Interativo (PIX / Cartão na tela)
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* Header da Sacola */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            {step !== "cart" && (
              <button
                type="button"
                onClick={() =>
                  setStep(step === "payment_preview" ? "checkout" : "cart")
                }
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-base leading-tight">
                {step === "cart" && `Minha Sacola (${totalItemsCount})`}
                {step === "checkout" && "Entrega e Pagamento"}
                {step === "payment_preview" && "Pagamento Mercado Pago"}
              </h2>
              <p className="text-[11px] text-slate-300">
                Redes Adamari • Compra 100% Segura
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso de Frete Grátis */}
        {detailedItems.length > 0 && step !== "payment_preview" && (
          <div className="bg-emerald-50/90 border-b border-emerald-200/70 px-5 py-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                {missingForFreeShipping === 0 ? (
                  <strong className="text-emerald-800">
                    Parabéns! Você ganhou FRETE GRÁTIS!
                  </strong>
                ) : (
                  <span>
                    Faltam{" "}
                    <strong className="text-emerald-800">
                      {formatBRL(missingForFreeShipping)}
                    </strong>{" "}
                    para <strong>Frete Grátis</strong>!
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* CONTEÚDO CENTRAL ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {detailedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Sua sacola está vazia
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1 mb-6">
                Escolha sua Rede Tradicional ou Rede com Mosquiteiro, selecione
                a cor do Tactel e o tamanho ideal!
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Escolher Minha Rede
              </button>
            </div>
          ) : step === "cart" ? (
            <>
              {/* Lista de Produtos na Sacola */}
              <div className="space-y-3">
                {detailedItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex gap-3 items-start"
                  >
                    {/* Amostra de Cor + Miniatura */}
                    <div
                      className="w-14 h-14 rounded-2xl shrink-0 flex flex-col items-center justify-center text-white shadow-inner border border-black/15 relative"
                      style={{ backgroundColor: item.color.hex }}
                    >
                      <span className="text-xs font-black tracking-tighter bg-black/35 px-1.5 py-0.5 rounded-md">
                        {item.size}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {item.product.shortName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          {item.color.name}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800">
                          Tam. {item.size}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-l-xl cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-r-xl cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatBRL(item.lineTotal)}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {paymentMethod === "pix"
                              ? "no PIX c/ desconto"
                              : "no Cartão"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seletor Rápido: PIX vs Cartão */}
              <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Preferência de Pagamento (Mercado Pago):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      paymentMethod === "pix"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      PIX c/ Desconto
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
                      {formatBRL(subtotalPix)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-slate-900 bg-slate-900 text-white font-bold"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CreditCard className="w-4 h-4" />
                      Cartão até 3x
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 font-semibold ${
                        paymentMethod === "card"
                          ? "text-amber-300"
                          : "text-slate-600"
                      }`}
                    >
                      {formatBRL(subtotalCard)}
                    </p>
                  </button>
                </div>
              </div>

              {/* Simulador de Frete por CEP */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  Calcular Frete e Prazo de Entrega (CEP):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  {cepLoading && (
                    <div className="flex items-center px-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                {cepError && (
                  <p className="text-xs text-red-600 font-medium">{cepError}</p>
                )}
                {shippingInfo && address.city && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {address.city} - {address.uf}
                      </p>
                      <p className="text-slate-600">
                        Prazo estimado: {shippingInfo.days}
                      </p>
                    </div>
                    <span className="font-extrabold text-emerald-700 text-sm">
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
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  1. Seus Dados para Nota e Rastreio
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp c/ DDD *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPF (Para envio/PIX) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="000.000.000-00"
                      value={customer.cpf}
                      onChange={(e) => setCustomer({ cpf: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail (Para comprovante Mercado Pago)
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  2. Endereço de Entrega
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="00000-000"
                      value={address.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                      className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da rua"
                    value={address.street}
                    onChange={(e) => setAddress({ street: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nº 123"
                      value={address.number}
                      onChange={(e) => setAddress({ number: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      placeholder="Apto, Bloco, Casa..."
                      value={address.complement}
                      onChange={(e) =>
                        setAddress({ complement: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
            /* TELA DE PAGAMENTO INTERATIVO MERCADO PAGO (SANDBOX / DEMO QUANDO SEM TOKEN) */
            sandboxData && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
                  <div className="flex items-center justify-between font-bold text-sky-900">
                    <span>Pedido #{sandboxData.orderReference}</span>
                    <span className="bg-sky-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                      Mercado Pago Checkout
                    </span>
                  </div>
                  <p className="text-sky-800">
                    Total c/ frete:{" "}
                    <strong className="text-sm">
                      {formatBRL(sandboxData.totalAmount)}
                    </strong>
                  </p>
                </div>

                {sandboxData.paymentMethod === "pix" ? (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      <QrCode className="w-4 h-4" /> PIX Instantâneo Mercado
                      Pago
                    </span>

                    {/* QR Code SVG Simulado */}
                    <div className="w-44 h-44 mx-auto p-3 rounded-2xl border-2 border-emerald-500 bg-white flex items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-slate-900"
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

                    <p className="text-xs text-slate-600">
                      Escaneie o QR Code no aplicativo do seu banco ou copie o
                      código PIX abaixo:
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
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
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      <CreditCard className="w-4 h-4" /> Cartão de Crédito
                      (Mercado Pago)
                    </span>
                    <p className="text-xs text-slate-600">
                      Ambiente pronto para processar cartões em até 3x sem
                      juros. Ao inserir sua chave{" "}
                      <code className="bg-slate-100 px-1 rounded">
                        MP_ACCESS_TOKEN
                      </code>{" "}
                      na Vercel, o cliente será direcionado ao ambiente oficial
                      do Mercado Pago.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmSandboxOrder}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Simular Pagamento Aprovado e Ver Comprovante
                </button>
              </div>
            )
          )}
        </div>

        {/* RODAPÉ FIXO DA SACOLA COM TOTAIS E BOTÃO DE AÇÃO */}
        {detailedItems.length > 0 && step !== "payment_preview" && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItemsCount} itens):</span>
                <span className="font-semibold text-slate-900">
                  {formatBRL(activeSubtotal)}
                </span>
              </div>
              {paymentMethod === "pix" && pixSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto exclusivo PIX:</span>
                  <span>- {formatBRL(pixSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frete ({address.uf || "Informe o CEP"}):</span>
                <span className="font-semibold text-slate-900">
                  {shippingInfo
                    ? shippingInfo.isFree
                      ? "GRÁTIS"
                      : formatBRL(shippingInfo.price)
                    : "A calcular"}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total a pagar:</span>
                <span className="text-emerald-700">
                  {formatBRL(finalTotal)}
                </span>
              </div>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                Continuar para Entrega
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={checkoutLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando ao Mercado Pago...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
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

