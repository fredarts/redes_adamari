import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowLeft,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Política de Trocas e Devoluções | Redes Adamari",
  description:
    "Conheça os termos de garantia, direito de arrependimento (Art. 49 do CDC) e procedimentos de troca e devolução da Redes Adamari.",
};

export default function PoliticaTrocasPage() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5588999999999";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Breadcrumb / Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5C4438] hover:text-[#D95D39] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para a Loja
          </Link>
        </div>

        {/* Cabeçalho da Página */}
        <div className="rounded-[28px] bg-white border border-[#E6DEC8] p-6 sm:p-10 shadow-sm mb-8 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F3E8] border border-[#C6E2C3] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E4620]">
            <ShieldCheck className="w-3.5 h-3.5" /> Código de Defesa do Consumidor (Lei 8.078/90)
          </span>

          <h1 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#2C1E18]">
            Política de Trocas, Devoluções e Garantia de Fábrica
          </h1>

          <p className="text-sm sm:text-base text-[#5C4438] leading-relaxed">
            Na <strong className="text-[#2C1E18]">Redes Adamari</strong>, nossa missão é levar o máximo conforto, frescor e segurança para o seu descanso. Confeccionamos nossos produtos em Tabuleiro do Norte – CE com rigoroso padrão de qualidade. Caso precise trocar ou devolver seu pedido, o processo é transparente, rápido e sem complicações.
          </p>
        </div>

        {/* Blocos da Política */}
        <div className="space-y-6">
          {/* 1. Direito de Arrependimento */}
          <section className="rounded-3xl bg-white border border-[#E6DEC8] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F5E6D3] text-[#9C5221] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
                1. Direito de Arrependimento ou Desistência (7 Dias)
              </h2>
            </div>

            <p className="text-sm text-[#5C4438] leading-relaxed">
              Em conformidade com o <strong>Artigo 49 do Código de Defesa do Consumidor (CDC)</strong> e o <strong>Decreto do E-commerce nº 7.962/2013</strong>, você tem o direito de desistir da compra por qualquer motivo e solicitar a devolução do produto em até <strong className="text-[#2C1E18]">7 (sete) dias corridos</strong> após a data de recebimento no seu endereço.
            </p>

            <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EFE8D8] space-y-2 text-xs sm:text-sm text-[#4A3728]">
              <strong className="text-[#2C1E18] block">Condições para devolução por arrependimento:</strong>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span>O produto deve estar sem sinais de uso, odores ou manchas de lavagem.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span>Acompanhado do bolsinho integrado original e de todos os componentes intactos.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span>O frete de retorno fica sob responsabilidade da Redes Adamari (código de logística reversa nos Correios sem nenhum custo para você).</span>
              </div>
            </div>
          </section>

          {/* 2. Garantia de Fábrica */}
          <section className="rounded-3xl bg-white border border-[#E6DEC8] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F3E8] text-[#1E4620] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
                2. Garantia de Fábrica contra Defeitos (90 Dias)
              </h2>
            </div>

            <p className="text-sm text-[#5C4438] leading-relaxed">
              Todas as redes fabricadas pela <strong className="text-[#2C1E18]">Redes Adamari</strong> possuem <strong className="text-[#2C1E18]">garantia legal de 90 (noventa) dias</strong> contra qualquer defeito de fabricação, conforme previsto pelo CDC.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE8D8]">
                <strong className="text-[#1E4620] block mb-1">O que a garantia cobre:</strong>
                <p className="text-[#5C4438] leading-relaxed">
                  Descosturas na união do tecido, falhas nas casinhas franzidas do punho, defeitos no zíper da rede com mosquiteiro ou rompimento anormal nas cordas de polipropileno trançadas de 2,50 mm sob uso adequado do limite de peso.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE8D8]">
                <strong className="text-[#9C5221] block mb-1">O que a garantia não cobre:</strong>
                <p className="text-[#5C4438] leading-relaxed">
                  Danos por corte com facas ou tesouras, queimaduras por fogueira ou cigarro, sobrepeso acima da capacidade técnica indicada para o tamanho (M, G, GG ou XGG) ou desgaste por atrito com superfícies cortantes.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Troca de Cor ou Tamanho */}
          <section className="rounded-3xl bg-white border border-[#E6DEC8] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF8F2] text-[#D95D39] flex items-center justify-center shrink-0 border border-[#D95D39]/20">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
                3. Troca por Cor ou Tamanho
              </h2>
            </div>

            <p className="text-sm text-[#5C4438] leading-relaxed">
              Comprou um tamanho e percebeu que precisava de uma metragem maior ou preferiu outra das nossas 10 cores vibrantes?
            </p>
            <p className="text-sm text-[#5C4438] leading-relaxed">
              Você pode solicitar a troca em até <strong className="text-[#2C1E18]">30 (trinta) dias</strong> após o recebimento. O produto deve estar novo e sem uso. Se houver diferença de valor entre tamanhos ou modelos, faremos o acerto da diferença com total clareza.
            </p>
          </section>

          {/* 4. Prazos e Restituição do Valor */}
          <section className="rounded-3xl bg-white border border-[#E6DEC8] p-6 sm:p-8 space-y-4">
            <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
              4. Como Funciona o Reembolso
            </h2>

            <p className="text-sm text-[#5C4438] leading-relaxed">
              Assim que o produto retornado chegar à nossa confecção em Tabuleiro do Norte – CE e for conferido por nossa equipe de expedição, o estorno total (valor do produto + frete pago) será realizado em até <strong className="text-[#2C1E18]">2 (dois) dias úteis</strong>:
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-[#4A3728]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span><strong>Pagamento via PIX (Mercado Pago):</strong> O estorno cai instantaneamente na mesma conta bancária utilizada no pagamento.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
                <span><strong>Pagamento via Cartão de Crédito (Mercado Pago):</strong> O cancelamento é solicitado imediatamente à administradora do cartão, constando como crédito na fatura seguinte ou subsequente.</span>
              </li>
            </ul>
          </section>

          {/* 5. Como Solicitar */}
          <section className="rounded-3xl bg-[#FAF6F0] border-2 border-[#D95D39]/30 p-6 sm:p-8 space-y-4">
            <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2C1E18]">
              5. Como Solicitar sua Troca ou Devolução
            </h2>

            <p className="text-sm text-[#5C4438] leading-relaxed">
              Basta entrar em contato conosco com o número do pedido ou o CPF cadastrado. Nossa equipe cuidará de tudo:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "Olá! Gostaria de solicitar suporte para troca/devolução de um pedido da Redes Adamari."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1E4620] hover:bg-[#163617] text-white text-xs sm:text-sm font-bold shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                Falar pelo WhatsApp: (88) 99999-9999
              </a>

              <a
                href="mailto:contato@redesadamari.com.br"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#D4C5A9] hover:bg-[#F3ECE0] text-[#2C1E18] text-xs sm:text-sm font-bold transition"
              >
                <Mail className="w-4 h-4 text-[#D95D39]" />
                contato@redesadamari.com.br
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Rodapé Simples da Página */}
      <footer className="bg-[#2C1E18] text-[#C9B89A] py-8 px-4 text-center text-xs border-t border-[#4A3728]">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-serif-editorial text-sm font-bold text-white">Redes Adamari • Ateliê Adamari</p>
          <p>CNPJ: 52.148.963/0001-45 • Tabuleiro do Norte – Ceará, Brasil</p>
          <p className="pt-2 text-[11px] text-[#A6957B]">
            © {new Date().getFullYear()} Redes Adamari. Todos os direitos reservados. Conforme Decreto Federal nº 7.962/2013 e Lei 8.078/90.
          </p>
        </div>
      </footer>
    </div>
  );
}
