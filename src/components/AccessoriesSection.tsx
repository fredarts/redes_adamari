"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ACCESSORY_LIST,
  formatBRL,
  type ProductDefinition,
} from "@/data/products";
import { getSkuKey, useCartStore } from "@/store/cartStore";
import {
  ShoppingBag,
  Check,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  PackageCheck,
  AlertTriangle,
  Info,
  X,
  Plus,
  Minus,
  ClipboardList,
} from "lucide-react";

export function AccessoriesSection() {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const stockMap = useCartStore((s) => s.stockMap);
  const stockLoaded = useCartStore((s) => s.stockLoaded);

  const [quantities, setQuantities] = useState<Record<string, number>>({
    "gancho-armador": 1,
    "mola-extensora": 1,
    "corda-nylon": 1,
  });
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [selectedModalProduct, setSelectedModalProduct] =
    useState<ProductDefinition | null>(null);

  useEffect(() => {
    if (!selectedModalProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedModalProduct(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModalProduct]);

  const getAccessoryStock = (productId: ProductDefinition["id"]) => {
    const sku = getSkuKey(productId, "UNICO", "padrao");
    if (!stockLoaded) return 25;
    return stockMap[sku] ?? 25;
  };

  const getInCartQty = (productId: ProductDefinition["id"]) => {
    const item = cartItems.find(
      (i) => i.productId === productId && i.size === "UNICO"
    );
    return item?.quantity || 0;
  };

  const handleSetQty = (productId: string, next: number, maxAllowed: number) => {
    const clamped = Math.max(1, Math.min(Math.max(1, maxAllowed), next));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const handleAddAccessory = (item: ProductDefinition) => {
    const stock = getAccessoryStock(item.id);
    const inCart = getInCartQty(item.id);
    const remaining = Math.max(0, stock - inCart);
    if (remaining <= 0) return;

    const qty = Math.min(quantities[item.id] || 1, remaining);
    addItem(item.id, "UNICO", "padrao", qty, stock);
    setAddedFeedback(item.id);
    setTimeout(() => {
      setAddedFeedback((prev) => (prev === item.id ? null : prev));
    }, 1800);
  };

  return (
    <section
      id="acessorios"
      className="scroll-mt-24 py-14 sm:py-18 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#E6DEC8]"
    >
      {/* Cabeçalho da Seção */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF3C7] text-[#9C5221] border border-[#FDE68A] text-xs font-extrabold uppercase tracking-wider mb-3">
          <Wrench className="w-3.5 h-3.5 text-[#D95D39]" />
          Instalação Prática, Firme e Segura
        </span>
        <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#2C1E18]">
          Complete sua Rede com os Acessórios de Instalação
        </h2>
        <p className="text-sm sm:text-base text-[#5C4438] mt-2 leading-relaxed">
          Adicione ao seu pedido o{" "}
          <strong className="text-[#2C1E18]">
            Par de Ganchos Armadores com Buchas e Parafusos
          </strong>
          , o{" "}
          <strong className="text-[#2C1E18]">
            Par de Molas Extensoras em Aço
          </strong>{" "}
          ou o{" "}
          <strong className="text-[#2C1E18]">
            Kit com 2 Cordas de Nylon de 2m
          </strong>{" "}
          e receba tudo pronto para instalar.
        </p>
      </div>

      {/* Grid dos 3 Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {ACCESSORY_LIST.map((item) => {
          const spec = item.sizes.UNICO;
          const totalStock = getAccessoryStock(item.id);
          const inCart = getInCartQty(item.id);
          const remaining = Math.max(0, totalStock - inCart);
          const isOutOfStock = totalStock <= 0;
          const isLowStock = totalStock > 0 && totalStock <= 4;
          const qty = Math.min(
            quantities[item.id] || 1,
            Math.max(1, remaining)
          );
          const isJustAdded = addedFeedback === item.id;
          const installmentVal = spec.priceCard / 3;

          return (
            <div
              key={item.id}
              className="rounded-[28px] bg-white border-2 border-[#E6DEC8] hover:border-[#D4C5A9] shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Imagem do Produto */}
                <div className="relative aspect-[4/3] bg-white border-b border-[#EFE8D8] p-5 flex items-center justify-center overflow-hidden group">
                  <img
                    src={item.coverPhoto}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    onClick={() => setSelectedModalProduct(item)}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                  <span className="absolute top-3.5 left-3.5 bg-[#2C1E18] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                  <span className="absolute top-3.5 right-3.5 bg-[#E9F3E8] text-[#1E4620] border border-[#C6E2C3] text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                    Até {spec.capacityKg} kg
                  </span>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#2C1E18] leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4438] mt-1.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Conteúdo da Embalagem */}
                  {item.packageContents && item.packageContents.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE8D8]">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A6252] block mb-1.5">
                        O que acompanha no kit:
                      </span>
                      <ul className="space-y-1">
                        {item.packageContents.map((content, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs font-bold text-[#2C1E18]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1E4620] shrink-0" />
                            <span>{content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Principais Benefícios */}
                  <ul className="space-y-1.5">
                    {item.highlights.slice(0, 3).map((hl, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-[#4A3728]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39] mt-1.5 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botão para abrir Ficha Técnica e Leia com Atenção */}
                  <button
                    type="button"
                    onClick={() => setSelectedModalProduct(item)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FDFBF7] hover:bg-[#F3ECE0] border border-[#D4C5A9] text-xs font-bold text-[#5C4438] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-[#D95D39] shrink-0" />
                    Ver Ficha Técnica & Instruções de Segurança
                  </button>
                </div>
              </div>

              {/* Rodapé do Card: Preço, Estoque e Botão de Compra */}
              <div className="p-5 sm:p-6 pt-0 space-y-3">
                {/* Bloco de Preço */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F4F9F3] via-[#ECF6EA] to-[#E3F1E0] border border-[#C6E2C3]">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E4620] block">
                        Valor com Desconto no PIX
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-serif-editorial text-2xl font-black text-[#1E4620]">
                          {formatBRL(spec.pricePix)}
                        </span>
                        <span className="text-xs text-[#7A6252] line-through">
                          {formatBRL(spec.priceCard)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#1E4620] bg-white/90 px-2.5 py-1 rounded-full border border-[#C6E2C3] shrink-0">
                      Kit Completo
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A3728] mt-1.5 pt-1.5 border-t border-[#C6E2C3]/70">
                    Ou <strong>{formatBRL(spec.priceCard)}</strong> no cartão em
                    até <strong>3x de {formatBRL(installmentVal)}</strong> sem
                    juros
                  </p>
                </div>

                {/* Status de Estoque */}
                {isOutOfStock ? (
                  <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Kit temporariamente esgotado</span>
                  </div>
                ) : isLowStock ? (
                  <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900 font-bold">
                    <span>🔥 Restam apenas {totalStock} kits!</span>
                    <span className="text-[10px] uppercase bg-amber-200/80 px-2 py-0.5 rounded-full">
                      Últimas Unidades
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-xl bg-[#E9F3E8]/80 border border-[#C6E2C3] flex items-center justify-between gap-2 text-xs text-[#1E4620] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 shrink-0" />
                      Pronta entrega ({totalStock} disponíveis)
                    </span>
                    <span className="text-[10px] font-bold bg-[#1E4620]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Envio Imediato
                    </span>
                  </div>
                )}

                {/* Seletor de Quantidade + Botão Colocar na Sacola */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center border border-[#D4C5A9] rounded-2xl bg-[#FAF6F0] p-1 shrink-0">
                    <button
                      type="button"
                      disabled={isOutOfStock || qty <= 1}
                      onClick={() => handleSetQty(item.id, qty - 1, remaining)}
                      className="w-9 h-10 rounded-xl flex items-center justify-center text-[#2C1E18] hover:bg-white disabled:opacity-40 transition cursor-pointer"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-sm text-[#2C1E18]">
                      {isOutOfStock ? 0 : qty}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock || qty >= remaining}
                      onClick={() => handleSetQty(item.id, qty + 1, remaining)}
                      className="w-9 h-10 rounded-xl flex items-center justify-center text-[#2C1E18] hover:bg-white disabled:opacity-40 transition cursor-pointer"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock || remaining <= 0}
                    onClick={() => handleAddAccessory(item)}
                    className={`flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isOutOfStock || remaining <= 0
                        ? "bg-[#D4C5A9] text-[#5C4438] cursor-not-allowed"
                        : "bg-solar-gradient active:scale-[0.99] text-white shadow-md shadow-[#D95D39]/25"
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Esgotado</span>
                    ) : remaining <= 0 ? (
                      <span>Limite na Sacola</span>
                    ) : isJustAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3] shrink-0" />
                        <span>Adicionado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        <span>Adicionar • {formatBRL(spec.pricePix * qty)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Ficha Técnica Completa e Avisos "LEIA COM ATENÇÃO" */}
      {selectedModalProduct &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedModalProduct(null)}
          >
            <div
              className="bg-[#FAF6F0] border-2 border-[#E6DEC8] rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Topo do Modal */}
              <div className="flex items-start justify-between gap-4 border-b border-[#E6DEC8] pb-4">
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[#2C1E18] text-white px-3 py-1 rounded-full mb-1.5">
                    {selectedModalProduct.badge}
                  </span>
                  <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
                    {selectedModalProduct.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedModalProduct(null)}
                  className="p-2 rounded-full bg-white border border-[#D4C5A9] text-[#2C1E18] hover:bg-[#F3ECE0] cursor-pointer shrink-0"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Imagem + Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-[#E6DEC8]">
                <div className="sm:col-span-5 aspect-square flex items-center justify-center p-2">
                  <img
                    src={selectedModalProduct.coverPhoto}
                    alt={selectedModalProduct.name}
                    className="max-h-48 w-auto object-contain"
                  />
                </div>
                <div className="sm:col-span-7 space-y-2.5">
                  <p className="text-xs sm:text-sm text-[#4A3728] leading-relaxed">
                    {selectedModalProduct.description}
                  </p>
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="font-serif-editorial text-2xl font-black text-[#1E4620]">
                      {formatBRL(selectedModalProduct.sizes.UNICO.pricePix)}
                    </span>
                    <span className="text-xs font-bold text-[#1E4620]">
                      no PIX
                    </span>
                    <span className="text-xs text-[#7A6252]">
                      (ou {formatBRL(selectedModalProduct.sizes.UNICO.priceCard)}{" "}
                      no cartão)
                    </span>
                  </div>
                </div>
              </div>

              {/* Conteúdo da Embalagem */}
              {selectedModalProduct.packageContents && (
                <div className="bg-white p-4 rounded-2xl border border-[#E6DEC8]">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2C1E18] mb-2 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-[#1E4620]" />
                    Conteúdo da Embalagem
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedModalProduct.packageContents.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2C1E18]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tabela de Especificações Técnicas */}
              {selectedModalProduct.technicalSpecs && (
                <div className="bg-white p-4 rounded-2xl border border-[#E6DEC8]">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2C1E18] mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-[#D95D39]" />
                    Especificações Técnicas
                  </h4>
                  <div className="divide-y divide-[#EFE8D8] text-xs sm:text-sm">
                    {Object.entries(selectedModalProduct.technicalSpecs).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="py-2 flex items-center justify-between gap-4"
                        >
                          <span className="font-semibold text-[#7A6252]">
                            {key}:
                          </span>
                          <span className="font-bold text-[#2C1E18] text-right">
                            {val}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Avisos Importantes / LEIA COM ATENÇÃO */}
              {selectedModalProduct.safetyWarnings &&
                selectedModalProduct.safetyWarnings.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#D95D39] shrink-0" />
                      Leia com Atenção — Recomendações de Instalação e Segurança
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                      {selectedModalProduct.safetyWarnings.map((warn, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-black text-[#D95D39]">•</span>
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Botão de Adicionar direto do Modal */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModalProduct(null)}
                  className="px-5 py-3 rounded-2xl border border-[#D4C5A9] bg-white text-xs font-bold text-[#5C4438] hover:bg-[#F3ECE0] cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddAccessory(selectedModalProduct);
                    setSelectedModalProduct(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-solar-gradient text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#D95D39]/25 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Colocar na Sacola •{" "}
                  {formatBRL(selectedModalProduct.sizes.UNICO.pricePix)}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
