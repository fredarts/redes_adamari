"use client";

import React from "react";
import { ShoppingBag, Sparkles, Truck } from "lucide-react";
import { useCartStore, resolveCartDetails } from "@/store/cartStore";

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const { totalItemsCount } = resolveCartDetails(items, paymentMethod);

  const navLinks = [
    { href: "#configurador", label: "Escolher Rede" },
    { href: "#galeria", label: "Fotos & Ambientes" },
    { href: "#qualidade", label: "Tecido & Punhos UV" },
    { href: "#guia-tamanhos", label: "Tamanhos" },
    { href: "#avaliacoes", label: "Avaliações" },
    { href: "#duvidas", label: "Dúvidas" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Faixa de Topo Acolhedora (Verde Mata / Folha c/ Detalhes Solares) */}
      <div className="bg-gradient-to-r from-[#173819] via-[#1E4620] to-[#173819] text-[#FAF6F0] text-[11px] sm:text-xs py-2 px-3 text-center font-medium border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
            <Truck className="w-3.5 h-3.5" /> Frete Grátis acima de R$ 249 para
            todo o Brasil
          </span>
          <span className="hidden sm:inline text-emerald-600">•</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Desconto à vista
            no PIX ou até 3x sem juros no Cartão
          </span>
        </div>
      </div>

      {/* Barra Principal Creme / Areia Natural */}
      <div className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E6DEC8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-17 sm:h-19 flex items-center justify-between gap-3">
          {/* Logo Redes Adamari */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white p-0.5 shadow-sm border border-[#E6DEC8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/logo.png"
                alt="Ateliê Adamari Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <span className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#2C1E18] block leading-none">
                Redes Adamari
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B85128] block mt-1">
                Ateliê Adamari • Tactel & UV
              </span>
            </div>
          </a>

          {/* Links de Navegação (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#5C4438]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[#D95D39] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Botão da Sacola com Gradiente Pôr do Sol */}
          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-solar-gradient text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#D95D39]/25 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Minha Sacola</span>
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#FAF6F0] text-[#2C1E18] text-xs font-black shadow-2xs">
              {totalItemsCount}
            </span>
          </button>
        </div>

        {/* Faixa de Navegação Rápida para Celular (Mobile UX) */}
        <div className="md:hidden border-t border-[#EFE8D8] bg-[#FDFBF7] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 px-3 py-1 rounded-full bg-[#F3ECE0] hover:bg-[#E8DFCE] active:bg-[#D95D39] active:text-white text-[#4A3728] text-xs font-bold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
