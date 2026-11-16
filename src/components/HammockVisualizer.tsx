"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Sparkles,
  CheckCircle2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  ProductDefinition,
  ProductSizeSpec,
  TactelColor,
} from "@/data/products";

interface HammockVisualizerProps {
  product: ProductDefinition;
  selectedColor: TactelColor;
  selectedSize: ProductSizeSpec;
}

const ALL_REAL_PHOTOS = [
  {
    url: "/images/rede-azul-varanda.jpg",
    title: "Azul Royal na Varanda",
    subtitle: "Leque de cordas brancas 2,5mm nas casinhas costuradas",
  },
  {
    url: "/images/hero-casal-jardim.jpg",
    title: "Rosa Pink / Magenta no Jardim",
    subtitle: "Espaço e resistência para descansar a dois",
  },
  {
    url: "/images/rede-turquesa-sol.jpg",
    title: "Azul Turquesa na Piscina",
    subtitle: "Tecido Tactel que seca rápido e bolsinho lateral",
  },
  {
    url: "/images/rede-vermelha-suporte.jpg",
    title: "Vermelho Vivo no Suporte",
    subtitle: "Caimento perfeito com bolsinho porta-objetos integrado",
  },
  {
    url: "/images/rede-amarela-detalhe-punho.jpg",
    title: "Detalhe do Punho e Bolsinho (Amarelo Sol)",
    subtitle: "Casinhas reforçadas + Corda Polipropileno 2,5mm c/ UV",
  },
  {
    url: "/images/rede-mosquiteiro-verde.jpg",
    title: "Rede c/ Mosquiteiro (Verde Militar)",
    subtitle: "Cúpula respirável 360° com zíper duplo para sítio e camping",
  },
];

export function HammockVisualizer({
  product,
  selectedColor,
  selectedSize,
}: HammockVisualizerProps) {
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(
    product.hasMosquitoNet
      ? "/images/rede-mosquiteiro-verde.jpg"
      : selectedColor.photoUrl
  );
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  useEffect(() => {
    if (product.hasMosquitoNet) {
      setActivePhotoUrl("/images/rede-mosquiteiro-verde.jpg");
    } else {
      setActivePhotoUrl(selectedColor.photoUrl);
    }
  }, [product.hasMosquitoNet, selectedColor.photoUrl]);

  // Fecha o zoom ao pressionar a tecla ESC
  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen]);

  const activePhotoIndex = Math.max(
    0,
    ALL_REAL_PHOTOS.findIndex((p) => p.url === activePhotoUrl)
  );
  const activePhotoMeta =
    ALL_REAL_PHOTOS[activePhotoIndex] || ALL_REAL_PHOTOS[0];

  const handlePrevPhoto = () => {
    const prevIdx =
      (activePhotoIndex - 1 + ALL_REAL_PHOTOS.length) % ALL_REAL_PHOTOS.length;
    setActivePhotoUrl(ALL_REAL_PHOTOS[prevIdx].url);
  };

  const handleNextPhoto = () => {
    const nextIdx = (activePhotoIndex + 1) % ALL_REAL_PHOTOS.length;
    setActivePhotoUrl(ALL_REAL_PHOTOS[nextIdx].url);
  };

  return (
    <>
      <div className="rounded-[28px] bg-white border border-[#E6DEC8] shadow-warm overflow-hidden">
        {/* Cabeçalho da Galeria de Fotos Reais */}
        <div className="px-4 py-3 sm:px-6 bg-[#FDFBF7] border-b border-[#EFE8D8] flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2C1E18] text-white text-xs font-bold shadow-2xs">
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            Galeria de Fotos Reais ({ALL_REAL_PHOTOS.length})
          </span>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4620] bg-[#E9F3E8] border border-[#C6E2C3] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
            Tam. {selectedSize.code} • Até {selectedSize.capacityKg}kg
          </span>
        </div>

        {/* GALERIA DE FOTOS REAIS */}
        <div>
          <div className="group relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[#F5EFE6] overflow-hidden">
            <img
              src={activePhotoUrl}
              alt={activePhotoMeta.title}
              loading="lazy"
              decoding="async"
              onClick={() => setIsZoomOpen(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] cursor-zoom-in"
            />

            {/* Gradiente suave na base da foto para leitura da legenda */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1D120E]/85 via-[#1D120E]/35 to-transparent" />

            {/* Selo Flutuante da Cor e Modelo Selecionados pelo Cliente */}
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 bg-[#FAF6F0]/95 backdrop-blur-md rounded-2xl p-2.5 pr-4 shadow-warm border border-[#E6DEC8] flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl shadow-inner border border-black/15 shrink-0 tactel-swatch-sheen"
                style={{
                  backgroundColor: selectedColor.hex,
                }}
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D58] block leading-none">
                  Cor Selecionada:
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#2C1E18] block mt-0.5">
                  {selectedColor.name}
                </span>
                <span className="text-[11px] font-semibold text-[#1E4620] block">
                  {product.shortName} • Tam. {selectedSize.code}
                </span>
              </div>
            </div>

            {/* Botão de Ampliar Foto em Tela Cheia */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-[#2C1E18]/80 hover:bg-[#2C1E18] backdrop-blur-xs text-white text-xs font-bold px-3 py-2 rounded-full inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Ampliar imagem"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Ampliar</span>
            </button>

            {/* Legenda da Foto Ativa */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 text-white">
              <div>
                <p className="font-serif-editorial text-base sm:text-lg font-bold drop-shadow-xs">
                  {activePhotoMeta.title}
                </p>
                <p className="text-xs text-[#F5EFE6]/90 drop-shadow-xs">
                  {activePhotoMeta.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Tira de Miniaturas Clicáveis (6 Fotos Reais) */}
          <div className="p-3.5 sm:p-4 bg-[#FDFBF7] border-t border-[#EFE8D8]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-[#7A6252] uppercase tracking-wider">
                Toque nas fotos para ver todos os ângulos:
              </p>
              <span className="text-[11px] font-semibold text-[#9C5221]">
                {activePhotoIndex + 1} de {ALL_REAL_PHOTOS.length}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
              {ALL_REAL_PHOTOS.map((photo) => {
                const isCurrent = photo.url === activePhotoUrl;
                return (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => setActivePhotoUrl(photo.url)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? "border-[#D95D39] ring-3 ring-[#D95D39]/25 scale-[1.03] shadow-xs"
                        : "border-[#E6DEC8] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Barra Inferior com as Medidas Reais do Tamanho Selecionado */}
        <div className="p-3.5 sm:px-6 bg-white border-t border-[#EFE8D8] grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#EFE8D8]">
            <span className="text-[11px] text-[#7A6252] block">
              Medida do Tecido
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#2C1E18]">
              {selectedSize.clothDimensions.replace(" (Tecido)", "")}
            </strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#EFE8D8]">
            <span className="text-[11px] text-[#7A6252] block">
              Punho a Punho
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#2C1E18]">
              {selectedSize.totalLengthWithCords.replace(
                " (Punho a Punho)",
                ""
              )}
            </strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#E9F3E8] border border-[#C6E2C3]">
            <span className="text-[11px] text-[#1E4620] block">
              Resistência
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#1E4620] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />{" "}
              {selectedSize.capacityKg} kg
            </strong>
          </div>
        </div>
      </div>

      {/* LIGHTBOX DE TELA CHEIA PARA INSPEÇÃO DAS FOTOS (PORTAL NO BODY) */}
      {isZoomOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setIsZoomOpen(false)}
            className="fixed inset-0 z-[9999] bg-[#1A110D]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 cursor-zoom-out"
          >
            {/* Barra Superior do Zoom com Botão Fechar de Alto Contraste */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl flex items-center justify-between mb-3 z-20"
            >
              <span className="text-xs sm:text-sm font-bold text-[#FAF6F0]/90 bg-white/10 px-3.5 py-1.5 rounded-full">
                Foto {activePhotoIndex + 1} de {ALL_REAL_PHOTOS.length} • Clique
                fora ou na foto para fechar
              </span>

              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D95D39] hover:bg-[#C04B29] text-white font-extrabold text-xs sm:text-sm shadow-lg transition cursor-pointer"
                aria-label="Fechar zoom"
              >
                <span>Fechar</span>
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Área Central da Imagem + Setas */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full flex flex-col items-center cursor-default"
            >
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#2C1E18]/85 hover:bg-[#D95D39] text-white border border-white/20 shadow-lg transition cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={activePhotoUrl}
                alt={activePhotoMeta.title}
                onClick={() => setIsZoomOpen(false)}
                title="Clique para fechar"
                className="max-h-[72vh] w-auto rounded-3xl shadow-2xl border-2 border-white/25 object-contain cursor-zoom-out"
              />

              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#2C1E18]/85 hover:bg-[#D95D39] text-white border border-white/20 shadow-lg transition cursor-pointer"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="mt-3 text-center text-white">
                <h4 className="font-serif-editorial text-lg sm:text-xl font-bold">
                  {activePhotoMeta.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#E6DEC8] mt-0.5">
                  {activePhotoMeta.subtitle}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
