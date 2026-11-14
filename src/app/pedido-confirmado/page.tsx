"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { formatBRL } from "@/data/products";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "approved";
  const ref = searchParams.get("ref") || "ADA-000001";
  const method = searchParams.get("method") || "pix";
  const total = Number(searchParams.get("total") || "0");
  const name = searchParams.get("name") || "Cliente";
  const city = searchParams.get("city") || "Brasil";
  const items = searchParams.get("items") || "Rede Adamari em Tactel";

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5588999999999";

  const whatsappText = encodeURIComponent(
    `Olá! Acabei de realizar o pedido *#${ref}* no site *Redes Adamari*!\n\n` +
      `👤 *Nome:* ${name}\n` +
      `🛍️ *Itens:* ${items}\n` +
      `📍 *Destino:* ${city}\n` +
      `💳 *Forma de Pagamento:* ${
        method === "pix" ? "PIX (Mercado Pago)" : "Cartão (Mercado Pago)"
      }\n` +
      `💰 *Valor Total:* ${formatBRL(total)}`
  );

  const isApproved = status === "approved";

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-[#E6DEC8] shadow-warm-lg p-6 sm:p-8 space-y-6 text-center">
        {/* Logo Oficial Ateliê Adamari */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#FAF6F0] p-1 border-2 border-[#D95D39]/40 shadow-sm">
            <img
              src="/images/logo.png"
              alt="Ateliê Adamari Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9C5221]">
            Ateliê Adamari • Tabuleiro do Norte - CE
          </span>
        </div>

        <div
          className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
            isApproved
              ? "bg-[#E9F3E8] text-[#1E4620] border border-[#C6E2C3]"
              : "bg-[#F5E6D3] text-[#9C5221] border border-[#E6D2B5]"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
        </div>

        <div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#F3ECE0] text-[#5C4438] mb-2">
            Pedido #{ref}
          </span>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2C1E18]">
            {isApproved
              ? "Pedido Recebido com Sucesso!"
              : "Aguardando Confirmação do Pagamento"}
          </h1>
          <p className="text-sm text-[#5C4438] mt-1">
            Muito obrigado por escolher a <strong>Redes Adamari</strong>, {name}
            !
          </p>
        </div>

        {/* Resumo do Pedido */}
        <div className="text-left rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-[#2C1E18] border-b border-[#E6DEC8] pb-2.5">
            <PackageCheck className="w-4 h-4 text-[#1E4620]" />
            Resumo da Sua Compra
          </div>

          <div>
            <span className="text-[#7A6252] block text-xs">
              Redes escolhidas:
            </span>
            <p className="font-bold text-[#2C1E18] mt-0.5 leading-relaxed">
              {items}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#E6DEC8]">
            <div>
              <span className="text-[#7A6252] block text-xs">Entrega em:</span>
              <strong className="text-[#2C1E18]">{city}</strong>
            </div>
            <div>
              <span className="text-[#7A6252] block text-xs">Pagamento:</span>
              <strong className="text-[#2C1E18] uppercase">{method}</strong>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#E6DEC8] flex items-center justify-between">
            <span className="font-bold text-[#4A3728]">Valor Total:</span>
            <span className="text-lg font-black text-[#1E4620]">
              {formatBRL(total)}
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-full bg-[#1E4620] hover:bg-[#163617] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            <MessageCircle className="w-5 h-5 text-amber-300" />
            Acompanhar Pedido pelo WhatsApp
          </a>

          <Link
            href="/"
            className="w-full py-3 px-5 rounded-full border border-[#D4C5A9] hover:bg-[#FAF6F0] text-[#4A3728] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Loja Redes Adamari
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C6D58]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1E4620]" />
          <span>Transação protegida via Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center text-sm text-[#5C4438]">
          Carregando detalhes do pedido...
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
}
