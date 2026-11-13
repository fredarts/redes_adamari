"use client";

import React from "react";
import { ShoppingBag, Sun, Sparkles, Truck } from "lucide-react";
import { useCartStore, resolveCartDetails } from "@/store/cartStore";

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const { totalItemsCount } = resolveCartDetails(items, paymentMethod);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Faixa de Topo Acolhedora (Verde Mata / Folha) */}
      <div className="bg-[#1E4620] text-[#FAF6F0] text-[11px] sm:text-xs py-2 px-3 text-center font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
            <Truck className="w-3.5 h-3.5" /> Frete Grátis acima de R$ 249 para
            todo o Brasil
          </span>
          <span className="hidden sm:inline text-emerald-700">•</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Desconto à vista
            no PIX ou até 3x sem juros no Cartão
          </span>
        </div>
      </div>

      {/* Barra Principal Creme / Areia Natural */}
      <div className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E6DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-17 flex items-center justify-between gap-4">
          {/* Logo Redes Adamari */}
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="Ateliê Adamari Logo"
              className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#2C1E18] block leading-none">
                Redes Adamari
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9C5221] block mt-0.5">
                Ateliê Adamari • Tactel & UV
              </span>
            </div>
          </a>

          {/* Links de Navegação */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#5C4438]">
            <a
              href="#configurador"
              className="hover:text-[#D95D39] transition"
            >
              Nossas Redes
            </a>
            <a href="#galeria" className="hover:text-[#D95D39] transition">
              Fotos & Ambientes
            </a>
            <a href="#qualidade" className="hover:text-[#D95D39] transition">
              O Tecido & Punhos
            </a>
            <a
              href="#guia-tamanhos"
              className="hover:text-[#D95D39] transition"
            >
              Guia de Tamanhos
            </a>
            <a href="#duvidas" className="hover:text-[#D95D39] transition">
              Dúvidas
            </a>
          </nav>

          {/* Botão da Sacola */}
          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#D95D39] hover:bg-[#C04B29] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Minha Sacola</span>
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#FAF6F0] text-[#2C1E18] text-xs font-black">
              {totalItemsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
