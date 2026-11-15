"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  ShoppingBag,
  Sparkles,
  Shield,
  Ruler,
  QrCode,
  CreditCard,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";
import {
  PRODUCTS,
  SIZE_ORDER,
  TACTEL_COLORS,
  formatBRL,
  type ProductId,
  type SizeCode,
} from "@/data/products";
import { useCartStore, getSkuKey } from "@/store/cartStore";
import { HammockVisualizer } from "./HammockVisualizer";

export function ProductConfigurator() {
  const [selectedProductId, setSelectedProductId] =
    useState<ProductId>("rede-tradicional");
  const [selectedSizeCode, setSelectedSizeCode] = useState<SizeCode>("GG");
  const [selectedColorId, setSelectedColorId] = useState<string>(
    TACTEL_COLORS[0].id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const addItem = useCartStore((s) => s.addItem);
  const stockMap = useCartStore((s) => s.stockMap);
  const stockLoaded = useCartStore((s) => s.stockLoaded);
  const fetchStock = useCartStore((s) => s.fetchStock);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const product = PRODUCTS[selectedProductId];
  const sizeSpec = product.sizes[selectedSizeCode];
  const selectedColor =
    TACTEL_COLORS.find((c) => c.id === selectedColorId) || TACTEL_COLORS[0];

  const currentSku = getSkuKey(
    selectedProductId,
    selectedSizeCode,
    selectedColorId
  );
  const totalSkuStock = stockLoaded ? (stockMap[currentSku] ?? 10) : 10;

  // Quantidade que o cliente já colocou na sacola desta mesma variação
  const inCartQty =
    cartItems.find(
      (i) =>
        i.productId === selectedProductId &&
        i.size === selectedSizeCode &&
        i.colorId === selectedColorId
    )?.quantity || 0;

  const remainingToAdd = Math.max(0, totalSkuStock - inCartQty);
  const isOutOfStock = totalSkuStock <= 0;
  const isLowStock = totalSkuStock > 0 && totalSkuStock <= 3;

  // Garante que o seletor de quantidade nunca ultrapasse o saldo disponível
  useEffect(() => {
    if (remainingToAdd > 0 && quantity > remainingToAdd) {
      setQuantity(remainingToAdd);
    } else if (remainingToAdd === 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [remainingToAdd, quantity]);

  const installmentValue = sizeSpec.priceCard / 3;
  const pixDiscountPercent = Math.round(
    ((sizeSpec.priceCard - sizeSpec.pricePix) / sizeSpec.priceCard) * 100
  );

  const handleAddToCart = () => {
    if (isOutOfStock || remainingToAdd <= 0) return;
    const safeQty = Math.min(quantity, remainingToAdd);
    addItem(
      selectedProductId,
      selectedSizeCode,
      selectedColorId,
      safeQty,
      totalSkuStock
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <section
      id="configurador"
      className="relative scroll-mt-24 py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      {/* Brilho solar sutil de fundo */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[85%] h-72 rounded-full bg-gradient-to-r from-amber-300/15 via-orange-300/15 to-rose-300/10 blur-3xl -z-10" />

      {/* Cabeçalho Acolhedor da Seção */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F5E6D3] to-[#F9EFE2] border border-[#E6D2B5] text-[#9C5221] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" /> Escolha do Seu
          Jeito
        </span>
        <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#2C1E18] tracking-tight">
          Monte sua Rede Adamari em 3 passos simples
        </h2>
        <p className="text-sm sm:text-base text-[#5C4438] mt-2">
          Escolha entre a{" "}
          <strong className="text-[#2C1E18]">Rede Tradicional</strong> ou a{" "}
          <strong className="text-[#2C1E18]">Rede com Mosquiteiro</strong>,
          toque na sua cor favorita do Tactel e selecione o tamanho ideal (M, G,
          GG ou XGG).
        </p>
      </div>

      {/* PASSO 1: SELETOR DOS 2 MODELOS COM FOTOS REAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {(["rede-tradicional", "rede-mosquiteiro"] as ProductId[]).map((id) => {
          const item = PRODUCTS[id];
          const isSelected = selectedProductId === id;
          const startingPix = item.sizes.M.pricePix;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSelectedProductId(id);
                if (id === "rede-mosquiteiro") {
                  setSelectedColorId("verde-militar");
                }
              }}
              className={`group text-left rounded-[28px] overflow-hidden border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-stretch ${
                isSelected
                  ? "border-[#D95D39] bg-white shadow-warm-lg ring-4 ring-[#D95D39]/15"
                  : "border-[#E6DEC8] bg-[#FDFBF7] hover:border-[#D4C5A9] shadow-warm"
              }`}
            >
              {/* Foto Real na lateral/topo do Card */}
              <div className="sm:w-46 h-46 sm:h-auto relative shrink-0 overflow-hidden bg-[#F5EFE6]">
                <img
                  src={item.coverPhoto}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                    isSelected
                      ? "bg-solar-gradient text-white"
                      : "bg-white/95 text-[#2C1E18]"
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Conteúdo do Modelo */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#2C1E18]">
                      {item.name}
                    </h3>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        isSelected
                          ? "bg-[#D95D39] border-[#D95D39] text-white shadow-xs"
                          : "border-[#D4C5A9] text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C4438] mt-1.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFE8D8] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#7A6252]">
                    Tamanhos M, G, GG e XGG
                  </span>
                  <span className="font-bold text-[#2C1E18]">
                    A partir de{" "}
                    <strong className="text-sm text-[#1E4620]">
                      {formatBRL(startingPix)}
                    </strong>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* GRID PRINCIPAL: GALERIA DE FOTOS REAIS + SELETOR DE COR E TAMANHO (Responsivo em Celular, Tablet e Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Coluna Esquerda: Galeria de Fotos Reais (6 colunas no Tablet, 7 no Desktop) */}
        <div className="md:col-span-6 lg:col-span-7 md:sticky md:top-24 space-y-4">
          <HammockVisualizer
            product={product}
            selectedColor={selectedColor}
            selectedSize={sizeSpec}
          />

          {/* Destaques do modelo escolhido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white rounded-3xl p-4 sm:p-5 border border-[#E6DEC8] shadow-warm">
            {product.highlights.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span className="text-[#4A3728] font-medium leading-relaxed">
                  {hl}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Painel de Escolha de Cor, Tamanho, Estoque e Compra (6 colunas no Tablet, 5 no Desktop) */}
        <div className="md:col-span-6 lg:col-span-5 bg-white rounded-[28px] p-5 sm:p-6 lg:p-7 border border-[#E6DEC8] shadow-warm space-y-6">
          {/* Título e Bloco de Preço */}
          <div className="border-b border-[#EFE8D8] pb-5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E4620] bg-[#E9F3E8] border border-[#C6E2C3] px-3 py-1 rounded-full">
                Fabricação Própria • Pronta Entrega
              </span>
              <span className="text-xs text-[#7A6252] font-semibold">
                Punho 2,5mm c/ UV
              </span>
            </div>

            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18] mt-2.5">
              {product.name}
            </h3>

            {/* Preço em Destaque Acolhedor */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#F4F9F3] via-[#ECF6EA] to-[#E3F1E0] border border-[#C6E2C3] shadow-2xs">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1E4620]">
                    <QrCode className="w-3.5 h-3.5" /> À vista no PIX (
                    {pixDiscountPercent}% de desconto)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#1E4620] tracking-tight mt-0.5">
                    {formatBRL(sizeSpec.pricePix)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8C6D58] line-through block">
                    {formatBRL(sizeSpec.priceCard)}
                  </span>
                  <span className="inline-block text-[11px] font-bold bg-[#1E4620] text-white px-2.5 py-0.5 rounded-full mt-1 shadow-2xs">
                    Economize {formatBRL(sizeSpec.priceCard - sizeSpec.pricePix)}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-[#C6E2C3] flex items-center gap-1.5 text-xs text-[#4A3728]">
                <CreditCard className="w-3.5 h-3.5 text-[#1E4620] shrink-0" />
                <span>
                  Ou <strong>{formatBRL(sizeSpec.priceCard)}</strong> no cartão
                  em até{" "}
                  <strong>3x de {formatBRL(installmentValue)} sem juros</strong>
                </span>
              </div>
            </div>
          </div>

          {/* PASSO 2: AS 10 CORES DO TECIDO TACTEL COM INDICADOR DE ESTOQUE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#2C1E18]">
                1. Escolha a Cor do Tactel:
              </label>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9C5221] bg-[#F5E6D3] border border-[#E6D2B5] px-3 py-1 rounded-full">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                {selectedColor.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {TACTEL_COLORS.map((color) => {
                const isSelected = color.id === selectedColorId;
                const colorSku = getSkuKey(
                  selectedProductId,
                  selectedSizeCode,
                  color.id
                );
                const colorStock = stockLoaded
                  ? (stockMap[colorSku] ?? 10)
                  : 10;
                const colorZero = colorStock <= 0;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    title={
                      colorZero
                        ? `${color.name} (Esgotado no tam. ${selectedSizeCode})`
                        : `${color.name} (${colorStock} un. em estoque)`
                    }
                    className={`group relative flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#D95D39] bg-[#FDF8F2] ring-2 ring-[#D95D39]/25 scale-[1.03]"
                        : colorZero
                          ? "border-[#E6DEC8] bg-[#FAF6F0]/60 opacity-65"
                          : "border-[#E6DEC8] hover:border-[#C9B89A] bg-white"
                    }`}
                  >
                    <span
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-inner border border-black/15 relative transition-transform group-hover:scale-105 tactel-swatch-sheen overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                    >
                      {colorZero && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                          <span className="w-full h-0.5 bg-white/90 -rotate-45 block" />
                        </span>
                      )}
                      {isSelected && !colorZero && (
                        <Check
                          className={`w-5 h-5 stroke-[3] drop-shadow-xs ${
                            color.id === "amarelo-sol"
                              ? "text-[#2C1E18]"
                              : "text-white"
                          }`}
                        />
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-[#4A3728] mt-1.5 text-center line-clamp-1 w-full">
                      {color.name.split(" ")[0]}{" "}
                      {color.name.split(" ")[1] || ""}
                    </span>
                    {colorZero && (
                      <span className="text-[9px] font-extrabold text-red-700 uppercase">
                        Esgotado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#7A6252] mt-2.5">
              * Todas as redes vêm com{" "}
              <strong className="text-[#2C1E18]">
                bolsinho lateral na mesma cor
              </strong>{" "}
              e punhos em{" "}
              <strong className="text-[#2C1E18]">
                corda trançada branca 2,5mm c/ UV
              </strong>
              .
            </p>
          </div>

          {/* PASSO 3: OS 4 TAMANHOS (M, G, GG, XGG) COM ESTOQUE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#2C1E18]">
                2. Escolha o Tamanho:
              </label>
              <a
                href="#guia-tamanhos"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#D95D39] hover:underline"
              >
                <Ruler className="w-3.5 h-3.5" /> Guia de medidas
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SIZE_ORDER.map((code) => {
                const s = product.sizes[code];
                const isSelected = selectedSizeCode === code;
                const sizeSku = getSkuKey(
                  selectedProductId,
                  code,
                  selectedColorId
                );
                const sizeStock = stockLoaded ? (stockMap[sizeSku] ?? 10) : 10;
                const sizeZero = sizeStock <= 0;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedSizeCode(code)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#2C1E18] bg-[#2C1E18] text-white shadow-md scale-[1.02]"
                        : sizeZero
                          ? "border-[#E6DEC8] bg-[#F5EFE6]/70 text-[#8C6D58] opacity-75"
                          : "border-[#E6DEC8] bg-[#FAF6F0] text-[#2C1E18] hover:border-[#C9B89A]"
                    }`}
                  >
                    <span className="font-serif-editorial text-lg font-bold tracking-tight">
                      {code}
                    </span>
                    <span
                      className={`text-xs font-bold mt-0.5 ${
                        isSelected
                          ? "text-amber-300"
                          : sizeZero
                            ? "text-red-700"
                            : "text-[#1E4620]"
                      }`}
                    >
                      {sizeZero ? "Esgotado" : formatBRL(s.pricePix)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Resumo das Medidas do Tamanho Selecionado */}
            <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#2C1E18]">
                <span>{sizeSpec.title}</span>
                <span className="text-[#1E4620] bg-[#E9F3E8] px-2 py-0.5 rounded-full">
                  Até {sizeSpec.capacityKg} kg
                </span>
              </div>
              <p className="text-[#5C4438]">{sizeSpec.recommendedFor}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[11px] text-[#7A6252] border-t border-[#E6DEC8]">
                <span>
                  <strong className="text-[#2C1E18]">Tecido:</strong>{" "}
                  {sizeSpec.clothDimensions.replace(" (Tecido)", "")}
                </span>
                <span>
                  <strong className="text-[#2C1E18]">Punho a Punho:</strong>{" "}
                  {sizeSpec.totalLengthWithCords.replace(
                    " (Punho a Punho)",
                    ""
                  )}
                </span>
                <span>
                  <strong className="text-[#2C1E18]">Peso:</strong>{" "}
                  {sizeSpec.weightApprox}
                </span>
              </div>
            </div>
          </div>

          {/* STATUS DE ESTOQUE EM TEMPO REAL + BOTÃO DE COMPRA */}
          <div className="pt-1 space-y-3">
            {/* Aviso de Disponibilidade da Combinação Escolhida */}
            {isOutOfStock ? (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  A cor <strong>{selectedColor.name}</strong> no tamanho{" "}
                  <strong>{selectedSizeCode}</strong> está esgotada no momento.
                  Escolha outra cor ou tamanho acima!
                </span>
              </div>
            ) : isLowStock ? (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D95D39] shrink-0" />
                  🔥 Restam apenas <strong>{totalSkuStock} unidades</strong>{" "}
                  nesta cor e tamanho!
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Últimas Peças
                </span>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-[#E9F3E8]/70 border border-[#C6E2C3] flex items-center justify-between text-xs text-[#1E4620] font-semibold">
                <span className="flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 shrink-0" />
                  Estoque disponível ({totalSkuStock} unidades prontas)
                </span>
                <span className="text-[11px] font-bold">Envio Imediato</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D4C5A9] rounded-2xl bg-[#FAF6F0] p-1">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 rounded-xl flex items-center justify-center text-[#2C1E18] hover:bg-white disabled:opacity-40 transition cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-extrabold text-base text-[#2C1E18]">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= remainingToAdd}
                  onClick={() =>
                    setQuantity((q) => Math.min(remainingToAdd, q + 1))
                  }
                  className="w-10 h-11 rounded-xl flex items-center justify-center text-[#2C1E18] hover:bg-white disabled:opacity-40 transition cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock || remainingToAdd <= 0}
                onClick={handleAddToCart}
                className={`flex-1 h-13 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 px-5 transition-all ${
                  isOutOfStock || remainingToAdd <= 0
                    ? "bg-[#D4C5A9] text-[#5C4438] cursor-not-allowed"
                    : "bg-solar-gradient active:scale-[0.99] text-white shadow-lg shadow-[#D95D39]/30 cursor-pointer"
                }`}
              >
                {isOutOfStock ? (
                  "Cor / Tamanho Esgotado"
                ) : remainingToAdd <= 0 ? (
                  "Limite do Estoque na Sacola"
                ) : justAdded ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    Rede Adicionada!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Colocar na Sacola •{" "}
                    {formatBRL(sizeSpec.pricePix * quantity)}
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A6252] text-center">
              <Shield className="w-3.5 h-3.5 text-[#1E4620] shrink-0" />
              <span>
                Compra Garantida via <strong>Mercado Pago</strong> (PIX ou
                Cartão de Crédito)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
