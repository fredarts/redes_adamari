"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  Palette,
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
  const [viewMode, setViewMode] = useState<"photos" | "simulator">("photos");
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

  const activePhotoIndex = Math.max(
    0,
    ALL_REAL_PHOTOS.findIndex((p) => p.url === activePhotoUrl)
  );
  const activePhotoMeta = ALL_REAL_PHOTOS[activePhotoIndex] || ALL_REAL_PHOTOS[0];

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
        {/* Cabeçalho da Galeria: Alternador Fotos Reais vs. Simulador de Cor */}
        <div className="px-4 py-3 sm:px-6 bg-[#FDFBF7] border-b border-[#EFE8D8] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("photos")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                viewMode === "photos"
                  ? "bg-[#2C1E18] text-white shadow-2xs"
                  : "bg-[#F3ECE0] text-[#5C4438] hover:bg-[#E8DFCE]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Fotos Reais ({ALL_REAL_PHOTOS.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("simulator")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                viewMode === "simulator"
                  ? "bg-[#2C1E18] text-white shadow-2xs"
                  : "bg-[#F3ECE0] text-[#5C4438] hover:bg-[#E8DFCE]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Simulador da Cor Escolhida
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4620] bg-[#E9F3E8] border border-[#C6E2C3] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
            Tam. {selectedSize.code} • Até {selectedSize.capacityKg}kg
          </span>
        </div>

        {/* MODO 1: GALERIA DE FOTOS REAIS */}
        {viewMode === "photos" ? (
          <div>
            <div className="group relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[#F5EFE6] overflow-hidden">
              <img
                src={activePhotoUrl}
                alt={activePhotoMeta.title}
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
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* MODO 2: SIMULADOR FIEL DO FORMATO DA REDE (CASINHAS + LEQUE DE CORDAS BRANCAS + BOLSINHO) */
          <div className="p-5 sm:p-8 bg-gradient-to-b from-[#FAF6F0] to-[#F3ECE0]">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-[#8C6D58]">
                Simulação da cor{" "}
                <strong className="text-[#2C1E18]">{selectedColor.name}</strong>{" "}
                com punhos brancos 2,5mm e bolsinho lateral
              </span>
            </div>

            <svg
              viewBox="0 0 720 330"
              className="w-full h-auto drop-shadow-md"
              role="img"
              aria-label={`${product.name} na cor ${selectedColor.name}`}
            >
              <defs>
                <linearGradient
                  id="tactelClothGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={selectedColor.hex} />
                  <stop offset="50%" stopColor={selectedColor.accentHex} />
                  <stop offset="100%" stopColor={selectedColor.hex} />
                </linearGradient>
                <pattern
                  id="netPattern"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 6 0 L 0 6 M 0 0 L 6 6"
                    stroke="#1f2937"
                    strokeWidth="0.5"
                    strokeOpacity="0.42"
                  />
                </pattern>
              </defs>

              {/* Mourões de madeira rústica nas extremidades */}
              <rect
                x="14"
                y="25"
                width="22"
                height="285"
                rx="6"
                fill="#5C3A21"
              />
              <rect
                x="684"
                y="25"
                width="22"
                height="285"
                rx="6"
                fill="#5C3A21"
              />

              {/* Sombra suave no gramado */}
              <ellipse
                cx="360"
                cy="300"
                rx="230"
                ry="14"
                fill="#2C1E18"
                opacity="0.12"
              />

              {/* Cúpula do Mosquiteiro caso seja a Rede c/ Mosquiteiro */}
              {product.hasMosquitoNet && (
                <g>
                  <path
                    d="M 155 135 Q 360 15 565 135 Q 490 210 360 215 Q 230 210 155 135 Z"
                    fill="url(#netPattern)"
                    stroke="#1f2937"
                    strokeWidth="2"
                  />
                  <path
                    d="M 250 82 Q 360 25 470 82"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 160 140 Q 360 175 560 140"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="3"
                    strokeDasharray="5 2"
                  />
                </g>
              )}

              {/* LEQUE DE 12 CORDAS BRANCAS 2,50MM ESQUERDO */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => {
                  const targetX = 148 + idx * 3.5;
                  const targetY = 116 + idx * 6.2;
                  return (
                    <g key={`left-cord-${idx}`}>
                      <line
                        x1="36"
                        y1="72"
                        x2={targetX}
                        y2={targetY}
                        stroke="#cbd5e1"
                        strokeWidth="3.2"
                      />
                      <line
                        x1="36"
                        y1="72"
                        x2={targetX}
                        y2={targetY}
                        stroke="#ffffff"
                        strokeWidth="2.2"
                      />
                    </g>
                  );
                })}
                <circle
                  cx="36"
                  cy="72"
                  r="7"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                />
              </g>

              {/* LEQUE DE 12 CORDAS BRANCAS 2,50MM DIREITO */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => {
                  const targetX = 572 - idx * 3.5;
                  const targetY = 116 + idx * 6.2;
                  return (
                    <g key={`right-cord-${idx}`}>
                      <line
                        x1="684"
                        y1="72"
                        x2={targetX}
                        y2={targetY}
                        stroke="#cbd5e1"
                        strokeWidth="3.2"
                      />
                      <line
                        x1="684"
                        y1="72"
                        x2={targetX}
                        y2={targetY}
                        stroke="#ffffff"
                        strokeWidth="2.2"
                      />
                    </g>
                  );
                })}
                <circle
                  cx="684"
                  cy="72"
                  r="7"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                />
              </g>

              {/* CORPO DA REDE EM TACTEL COM DOBRAS LONGITUDINAIS */}
              <path
                d="M 148 116 Q 360 198 572 116 Q 515 270 360 276 Q 205 270 148 116 Z"
                fill="url(#tactelClothGrad)"
              />

              {[135, 152, 168, 184, 200].map((yOffset, i) => (
                <path
                  key={i}
                  d={`M ${155 + i * 7} ${122 + i * 10} Q 360 ${
                    yOffset + 65
                  } ${565 - i * 7} ${122 + i * 10}`}
                  fill="none"
                  stroke={
                    i % 2 === 0
                      ? "rgba(255,255,255,0.26)"
                      : "rgba(0,0,0,0.18)"
                  }
                  strokeWidth="2.5"
                />
              ))}

              {/* Casinhas franzidas nas duas extremidades */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => (
                <g key={`pleats-${idx}`}>
                  <circle
                    cx={148 + idx * 3.5}
                    cy={116 + idx * 6.2}
                    r="4.2"
                    fill={selectedColor.hex}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={572 - idx * 3.5}
                    cy={116 + idx * 6.2}
                    r="4.2"
                    fill={selectedColor.hex}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Bolsinho lateral integrado */}
              <g transform="translate(245, 172) rotate(8)">
                <rect
                  x="0"
                  y="0"
                  width="54"
                  height="62"
                  rx="6"
                  fill={selectedColor.hex}
                  stroke="rgba(0,0,0,0.28)"
                  strokeWidth="1.5"
                />
                <line
                  x1="4"
                  y1="10"
                  x2="50"
                  y2="10"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>
        )}

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

      {/* LIGHTBOX DE TELA CHEIA PARA INSPEÇÃO DAS FOTOS */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A110D]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Fechar zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handlePrevPhoto}
            className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            <img
              src={activePhotoUrl}
              alt={activePhotoMeta.title}
              className="max-h-[78vh] w-auto rounded-3xl shadow-2xl border-2 border-white/20 object-contain"
            />
            <div className="mt-4 text-center text-white">
              <h4 className="font-serif-editorial text-lg sm:text-xl font-bold">
                {activePhotoMeta.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#E6DEC8] mt-0.5">
                {activePhotoMeta.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
