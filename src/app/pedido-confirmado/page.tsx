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
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6 text-center">
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            isApproved
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <Clock className="w-10 h-10" />
          )}
        </div>

        <div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-800 mb-2">
            Pedido #{ref}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isApproved
              ? "Pedido Recebido com Sucesso!"
              : "Aguardando Confirmação do Pagamento"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Obrigado por comprar na <strong>Redes Adamari</strong>, {name}!
          </p>
        </div>

        {/* Resumo do Pedido */}
        <div className="text-left rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Resumo da Sua Compra
          </div>

          <div>
            <span className="text-slate-500 block text-xs">
              Redes escolhidas:
            </span>
            <p className="font-bold text-slate-900 mt-0.5">{items}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
            <div>
              <span className="text-slate-500 block text-xs">Entrega em:</span>
              <strong className="text-slate-800">{city}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Pagamento:</span>
              <strong className="text-slate-800 uppercase">{method}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
            <span className="font-bold text-slate-700">Total:</span>
            <span className="text-lg font-black text-emerald-700">
              {formatBRL(total)}
            </span>
          </div>
        </div>

        {/* Botão para enviar no WhatsApp */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            <MessageCircle className="w-5 h-5" />
            Acompanhar Pedido pelo WhatsApp
          </a>

          <Link
            href="/"
            className="w-full py-3 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Loja Redes Adamari
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transação processada via Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
          Carregando detalhes do pedido...
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
}

