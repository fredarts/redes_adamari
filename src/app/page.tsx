import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Sun,
  Droplets,
  Feather,
  Award,
  CheckCircle2,
  Ruler,
  HelpCircle,
  QrCode,
  CreditCard,
  Truck,
  ArrowDown,
  Heart,
  ShoppingBag,
} from "lucide-react";
import {
  PRODUCTS,
  SIZE_ORDER,
  TACTEL_COLORS,
  ROPE_TECH_SPECS,
  formatBRL,
} from "@/data/products";
import { Navbar } from "@/components/Navbar";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { CartDrawer } from "@/components/CartDrawer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. HERO EDITORIAL ACOLHEDOR COM FOTOGRAFIAS REAIS */}
        <section className="relative overflow-hidden pt-6 pb-12 sm:py-14 px-4 sm:px-6 bg-gradient-to-b from-[#FAF6F0] via-[#F5EFE4] to-[#FAF6F0] border-b border-[#E6DEC8]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Coluna Esquerda: Mensagem Acolhedora e Humana */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F3E8] border border-[#C6E2C3] px-4 py-1.5 text-xs font-bold text-[#1E4620]">
                <Sun className="w-4 h-4 text-[#D95D39]" />
                Leveza, Cores Vivas e Descanso de Verdade
              </div>

              <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#2C1E18] tracking-tight leading-[1.12]">
                O abraço fresco e colorido que a sua{" "}
                <span className="text-[#D95D39] italic">varanda</span> merece.
              </h1>

              <p className="text-sm sm:text-lg text-[#5C4438] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Nossas redes de dormir são confeccionadas em{" "}
                <strong className="text-[#2C1E18]">
                  tecido Tactel macio e resistente
                </strong>
                , com <strong className="text-[#2C1E18]">bolsinho lateral integrado</strong> e
                punhos artesanais em{" "}
                <strong className="text-[#2C1E18]">
                  leque de cordas brancas 2,50 mm com proteção UV
                </strong>
                . Não esquentam nas costas, secam em minutos e cabem em qualquer
                mochila!
              </p>

              {/* Faixa das 10 Cores Vibrantes */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center -space-x-1.5">
                  {TACTEL_COLORS.map((c) => (
                    <span
                      key={c.id}
                      title={c.name}
                      className="w-7 h-7 rounded-full border-2 border-[#FAF6F0] shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#7A6252]">
                  10 Cores de Tactel • Tamanhos M, G, GG e XGG
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <a
                  href="#configurador"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#D95D39] hover:bg-[#C04B29] text-white font-extrabold text-base shadow-lg shadow-[#D95D39]/25 transition"
                >
                  Escolher Minha Rede Agora
                  <ArrowDown className="w-4 h-4 stroke-[3]" />
                </a>
                <a
                  href="#galeria"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-[#F3ECE0] border border-[#D4C5A9] text-[#2C1E18] font-bold text-sm transition"
                >
                  Ver Fotos nos Ambientes
                </a>
              </div>
            </div>

            {/* Coluna Direita: Mosaico de Fotografias Reais da Rede */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-3.5 sm:gap-4 items-center">
              {/* Foto Principal Grande (Casal na Rede Rosa no Jardim) */}
              <div className="col-span-12 sm:col-span-7 relative rounded-[28px] overflow-hidden shadow-xl border-4 border-white aspect-[4/3] sm:aspect-[4/5]">
                <img
                  src="/images/hero-casal-jardim.jpg"
                  alt="Casal descansando em Rede Adamari de Tactel no jardim"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D95D39] px-2.5 py-0.5 rounded-full">
                    Tactel Ultra Resistente
                  </span>
                  <p className="text-sm font-bold mt-1">
                    Espaço de sobra e frescor para curtir a dois
                  </p>
                </div>
              </div>

              {/* Duas Fotos Laterais Empilhadas */}
              <div className="col-span-12 sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-3.5 sm:gap-4">
                <div className="relative rounded-[24px] overflow-hidden shadow-md border-4 border-white aspect-[4/3]">
                  <img
                    src="/images/rede-amarela-detalhe-punho.jpg"
                    alt="Detalhe das casinhas costuradas, cordas brancas 2,5mm e bolsinho"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <p className="text-xs font-bold leading-snug">
                      Punho em cordas brancas 2,5mm + Bolsinho
                    </p>
                  </div>
                </div>

                <div className="relative rounded-[24px] overflow-hidden shadow-md border-4 border-white aspect-[4/3]">
                  <img
                    src="/images/rede-turquesa-sol.jpg"
                    alt="Rede Azul Turquesa na varanda com piscina"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <p className="text-xs font-bold leading-snug">
                      Seca em minutos: ideal para piscina e praia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Faixa de Benefícios Acolhedores */}
          <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#E6DEC8] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-[#4A3728]">
            <div className="flex items-center gap-3 bg-white/80 p-3.5 rounded-2xl border border-[#EFE8D8]">
              <Feather className="w-5 h-5 text-[#D95D39] shrink-0" />
              <span>
                <strong className="text-[#2C1E18] block">Toque Fresquinho</strong>
                Não esquenta nas costas no calor
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-3.5 rounded-2xl border border-[#EFE8D8]">
              <ShoppingBag className="w-5 h-5 text-[#D95D39] shrink-0" />
              <span>
                <strong className="text-[#2C1E18] block">
                  Bolsinho Integrado
                </strong>
                Costurado na lateral da própria rede
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-3.5 rounded-2xl border border-[#EFE8D8]">
              <Sun className="w-5 h-5 text-[#1E4620] shrink-0" />
              <span>
                <strong className="text-[#2C1E18] block">
                  Cordas c/ Proteção UV
                </strong>
                Polipropileno 2,5mm que não resseca
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-3.5 rounded-2xl border border-[#EFE8D8]">
              <ShieldCheck className="w-5 h-5 text-[#1E4620] shrink-0" />
              <span>
                <strong className="text-[#2C1E18] block">Mercado Pago</strong>
                PIX com desconto ou Cartão em 3x
              </span>
            </div>
          </div>
        </section>

        {/* 2. CONFIGURADOR INTERATIVO DOS 2 PRODUTOS (REDE NORMAL E REDE C/ MOSQUITEIRO) */}
        <ProductConfigurator />

        {/* 3. GALERIA DE ESTILO DE VIDA E AMBIENTES REAIS (#galeria) */}
        <section
          id="galeria"
          className="scroll-mt-20 py-14 sm:py-18 bg-[#F3ECE0] border-y border-[#E6DEC8] px-4 sm:px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#9C5221] px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <Heart className="w-3.5 h-3.5 text-[#D95D39]" /> Feita para Todos
                os Seus Momentos
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#2C1E18]">
                Veja como a Rede Adamari transforma qualquer cantinho
              </h2>
              <p className="text-sm sm:text-base text-[#5C4438] mt-2">
                Na varanda de casa, no suporte de madeira, à beira da piscina ou
                protegida contra insetos no meio da natureza.
              </p>
            </div>

            {/* Mosaico Fotográfico de 6 Fotos Reais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  img: "/images/rede-azul-varanda.jpg",
                  tag: "Varanda & Quintal",
                  title: "Azul Royal Vibrante no Descanso de Fim de Tarde",
                  desc: "Observe o leque de cordas brancas de 2,50 mm passando pelas casinhas costuradas do tecido Tactel, distribuindo o peso com maciez.",
                },
                {
                  img: "/images/rede-vermelha-suporte.jpg",
                  tag: "Suporte & Jardim",
                  title: "Vermelho Vivo com Bolsinho Porta-Objetos",
                  desc: "Perfeita também para suportes de madeira ou aço. O bolsinho lateral guarda o celular, livro ou serve para embalar a rede.",
                },
                {
                  img: "/images/rede-turquesa-sol.jpg",
                  tag: "Piscina & Praia",
                  title: "Azul Turquesa: Pode Deitar Molhado Sem Medo",
                  desc: "Saiu da piscina ou do mar? O tecido Tactel e as cordas de polipropileno não retêm água, não mofam e secam rapidinho ao sol.",
                },
                {
                  img: "/images/hero-casal-jardim.jpg",
                  tag: "Momentos em Família",
                  title: "Rosa Pink / Magenta: Resistência até 260 kg (Tam. XGG)",
                  desc: "Costura reforçada e tecido largo que abraça sem apertar, disponível do tamanho M até o gigante XGG.",
                },
                {
                  img: "/images/rede-amarela-detalhe-punho.jpg",
                  tag: "Acabamento de Perto",
                  title: "Amarelo Sol: Veja o Capricho das Casinhas e Cordas",
                  desc: "Cada corda branca trançada de 2,50 mm passa individualmente pelas bainhas franzidas do Tactel para nunca embolar.",
                },
                {
                  img: "/images/rede-mosquiteiro-verde.jpg",
                  tag: "Sítio, Pesca & Camping",
                  title: "Verde Militar com Mosquiteiro 360° e Zíper",
                  desc: "A cúpula de tela respirável mantém pernilongos, mosquitos da dengue e muriçocas longe enquanto o vento fresco circula.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="group rounded-[26px] bg-white border border-[#E6DEC8] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                >
                  <div className="aspect-[16/11] relative overflow-hidden bg-[#FAF6F0]">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#2C1E18] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {card.tag}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif-editorial text-lg font-bold text-[#2C1E18]">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C4438] mt-1.5 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#F3ECE0]">
                      <a
                        href="#configurador"
                        className="text-xs font-extrabold text-[#D95D39] hover:underline inline-flex items-center gap-1"
                      >
                        Escolher essa cor no configurador →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. O SEGREDO DA DURABILIDADE: DETALHE DO PUNHO + CORDA PLASMÓDIA ISO 9001 (#qualidade) */}
        <section
          id="qualidade"
          className="scroll-mt-20 py-14 sm:py-18 px-4 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="rounded-[32px] bg-[#1E4620] text-[#FAF6F0] p-6 sm:p-10 lg:p-12 shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Foto Macro do Punho e Casinhas */}
              <div className="lg:col-span-5">
                <div className="rounded-[24px] overflow-hidden border-4 border-white/20 shadow-xl aspect-square relative">
                  <img
                    src="/images/rede-amarela-detalhe-punho.jpg"
                    alt="Detalhe das cordas brancas 2,50mm passando pelas casinhas do Tactel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-xs rounded-2xl p-3 text-xs text-white">
                    <strong className="text-amber-300 block">
                      Detalhe Real do Acabamento:
                    </strong>
                    Bainha em casinhas franzidas + Bolsinho + Cordas 2,50mm c/
                    UV
                  </div>
                </div>
              </div>

              {/* Explicação Acolhedora e Ficha Técnica da Corda */}
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 text-amber-300 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" /> Qualidade que Você Vê de Perto
                </span>

                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold leading-tight">
                  Punhos em Corda Trançada Branca 2,50 mm com Proteção Solar UV
                </h2>

                <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                  Não economizamos no que garante a sua segurança. Enquanto redes
                  comuns usam cordões que desfiam ou apodrecem com o sol e a
                  chuva, nossos punhos são produzidos com{" "}
                  <strong className="text-white">
                    {ROPE_TECH_SPECS.material}
                  </strong>{" "}
                  de padrão industrial certificado{" "}
                  <strong className="text-amber-300">
                    {ROPE_TECH_SPECS.certification}
                  </strong>
                  .
                </p>

                {/* Quadro Resumo da Etiqueta Plasmódia */}
                <div className="grid grid-cols-3 gap-3 bg-black/25 p-4 rounded-2xl border border-white/15 text-center">
                  <div>
                    <span className="text-[11px] text-emerald-200 block">
                      Espessura Real
                    </span>
                    <strong className="text-base sm:text-xl font-black text-white">
                      {ROPE_TECH_SPECS.thickness}
                    </strong>
                  </div>
                  <div className="border-x border-white/15">
                    <span className="text-[11px] text-emerald-200 block">
                      Material
                    </span>
                    <strong className="text-sm sm:text-base font-black text-white">
                      Polipropileno
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-200 block">
                      Tratamento Solar
                    </span>
                    <strong className="text-base sm:text-xl font-black text-amber-300">
                      Anti-UV
                    </strong>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-50">
                  {ROPE_TECH_SPECS.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. GUIA COMPARATIVO DE TAMANHOS (M, G, GG, XGG) (#guia-tamanhos) */}
        <section
          id="guia-tamanhos"
          className="scroll-mt-20 py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5E6D3] text-[#9C5221] px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <Ruler className="w-3.5 h-3.5" /> Escolha o Tamanho Ideal
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#2C1E18]">
              Tamanhos M, G, GG e XGG para qualquer espaço
            </h2>
            <p className="text-sm sm:text-base text-[#5C4438] mt-2">
              Tanto a <strong>Rede Tradicional</strong> quanto a{" "}
              <strong>Rede com Mosquiteiro</strong> estão disponíveis nas 4
              metragens abaixo:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SIZE_ORDER.map((code) => {
              const trad = PRODUCTS["rede-tradicional"].sizes[code];
              const mosq = PRODUCTS["rede-mosquiteiro"].sizes[code];

              return (
                <div
                  key={code}
                  className={`rounded-[26px] p-5 border flex flex-col justify-between ${code === "GG"
                      ? "border-2 border-[#D95D39] bg-white shadow-md relative"
                      : "border-[#E6DEC8] bg-white"
                    }`}
                >
                  {code === "GG" && (
                    <span className="-top-3 left-5 absolute bg-[#D95D39] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                      Mais Escolhido
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between border-b border-[#EFE8D8] pb-3">
                      <div>
                        <span className="text-xs font-bold text-[#7A6252] uppercase">
                          Tamanho
                        </span>
                        <h3 className="font-serif-editorial text-3xl font-bold text-[#2C1E18]">
                          {code}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#E9F3E8] text-[#1E4620] text-xs font-bold">
                        Até {trad.capacityKg} kg
                      </span>
                    </div>

                    <div className="py-4 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[#7A6252] block">
                          Medida do Tecido:
                        </span>
                        <strong className="text-[#2C1E18] text-sm">
                          {trad.clothDimensions.replace(" (Tecido)", "")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7A6252] block">
                          Comprimento Total (Punho a Punho):
                        </span>
                        <strong className="text-[#2C1E18] text-sm">
                          {trad.totalLengthWithCords.replace(
                            " (Punho a Punho)",
                            ""
                          )}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7A6252] block">
                          Para quem é indicada:
                        </span>
                        <p className="text-[#4A3728] font-medium mt-0.5 leading-relaxed">
                          {trad.recommendedFor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFE8D8] space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0]">
                      <span className="font-semibold text-[#5C4438]">
                        Rede Tradicional:
                      </span>
                      <strong className="text-[#1E4620] font-extrabold">
                        {formatBRL(trad.pricePix)} PIX
                      </strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0]">
                      <span className="font-semibold text-[#5C4438]">
                        C/ Mosquiteiro:
                      </span>
                      <strong className="text-[#1E4620] font-extrabold">
                        {formatBRL(mosq.pricePix)} PIX
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. PERGUNTAS FREQUENTES (#duvidas) */}
        <section
          id="duvidas"
          className="scroll-mt-20 py-14 sm:py-16 bg-white border-t border-[#E6DEC8] px-4 sm:px-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5E6D3] text-[#9C5221] px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Comuns
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2C1E18]">
                Tudo o que você precisa saber antes de escolher
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  q: "O tecido Tactel esquenta nas costas ou faz barulho?",
                  a: "De jeito nenhum! Nosso Tactel é macio, maleável e super fresquinho. Ele permite a troca de calor com o ambiente, sendo muito mais fresco no verão do que redes grossas de algodão.",
                },
                {
                  q: "Para que serve o bolsinho costurado na lateral da rede?",
                  a: "Ele tem dupla função: enquanto você está deitado descansando, serve para guardar o celular, óculos de sol ou controle remoto sempre à mão. E quando quiser guardar ou levar sua rede em viagens, você pode dobrar a rede inteira para dentro dele!",
                },
                {
                  q: "As cordas brancas dos punhos aguentam sol e chuva?",
                  a: "Sim! Usamos Corda de Polipropileno Trançada de 2,50 mm com aditivo de Proteção UV (certificada ISO 9001). Ela não absorve água, não mofa e não resseca mesmo ficando exposta na varanda ou no sol.",
                },
                {
                  q: "Como funciona a compra pelo Mercado Pago?",
                  a: "Basta adicionar suas redes na sacola aqui no site, digitar seu CEP e clicar em pagar. Você pode pagar com PIX (com desconto automático à vista) ou Cartão de Crédito em até 3x sem juros, contando com toda a segurança do Mercado Pago.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-[#E6DEC8] bg-[#FAF6F0] p-5 open:bg-white open:shadow-xs transition"
                >
                  <summary className="font-bold text-sm sm:text-base text-[#2C1E18] cursor-pointer list-none flex items-center justify-between gap-4">
                    <span>{faq.q}</span>
                    <span className="text-[#D95D39] group-open:rotate-45 transition-transform text-xl leading-none font-bold">
                      +
                    </span>
                  </summary>
                  <p className="text-xs sm:text-sm text-[#5C4438] mt-3 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. RODAPÉ ACOLHEDOR COM DADOS FISCAIS E CONFIANÇA (DECRETO Nº 7.962/2013) */}
      <footer className="bg-[#2C1E18] text-[#E6DEC8] pt-12 pb-8 px-4 sm:px-6 border-t border-[#4A3728]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Linha Superior: Logo, Identificação e Formas de Pagamento */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-[#422F24] text-xs">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <img
                src="/images/logo.png"
                alt="Ateliê Adamari Logo"
                className="w-14 h-14 object-contain drop-shadow-md shrink-0"
              />
              <div>
                <span className="font-serif-editorial text-xl font-bold text-white block">
                  Redes Adamari
                </span>
                <p className="mt-0.5 text-[#C9B89A]">
                  Ateliê Adamari • Conforto Leve em Tactel & Cordas UV 2,5mm
                </p>
                <p className="text-[11px] text-[#A6957B] mt-0.5">
                  Confeccionado artesanalmente em Tabuleiro do Norte – CE
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-white text-xs">
              <span className="inline-flex items-center gap-1.5 bg-[#3D2B22] border border-[#5C4438] px-3.5 py-1.5 rounded-full">
                <QrCode className="w-4 h-4 text-emerald-400" /> PIX c/ Desconto
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#3D2B22] border border-[#5C4438] px-3.5 py-1.5 rounded-full">
                <CreditCard className="w-4 h-4 text-sky-400" /> Cartão até 3x sem juros
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#3D2B22] border border-[#5C4438] px-3.5 py-1.5 rounded-full">
                <Truck className="w-4 h-4 text-amber-300" /> Envio p/ Todo o Brasil
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#1E4620] border border-emerald-800 text-emerald-200 px-3.5 py-1.5 rounded-full font-semibold">
                <ShieldCheck className="w-4 h-4" /> Mercado Pago Garantido
              </span>
            </div>
          </div>

          {/* Linha Central: Informações Institucionais e Atendimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#C9B89A]">
            <div>
              <h4 className="text-white font-bold text-sm mb-2 font-serif-editorial">
                Dados da Empresa
              </h4>
              <p className="leading-relaxed">
                <strong className="text-white">Razão Social:</strong> Redes Adamari Confecções Ltda. (Ateliê Adamari)<br />
                <strong className="text-white">CNPJ:</strong> 52.148.963/0001-45<br />
                <strong className="text-white">Origem / Expedição:</strong> Tabuleiro do Norte – Ceará, CEP 62960-000
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2 font-serif-editorial">
                Atendimento & Suporte
              </h4>
              <p className="leading-relaxed">
                <strong className="text-white">WhatsApp:</strong> (88) 99999-9999<br />
                <strong className="text-white">E-mail:</strong> contato@redesadamari.com.br<br />
                <strong className="text-white">Horário:</strong> Segunda a Sexta, das 08h às 18h
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2 font-serif-editorial">
                Garantia e Segurança
              </h4>
              <p className="leading-relaxed mb-2">
                Compra 100% protegida com direito de arrependimento em até 7 dias e garantia de fábrica de 90 dias.
              </p>
              <a
                href="/trocas-e-devolucoes"
                className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 underline"
              >
                Ler Política de Trocas e Devoluções →
              </a>
            </div>
          </div>

          {/* Linha Inferior: Direitos e Legislação */}
          <div className="pt-6 border-t border-[#422F24] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C7A68]">
            <p>
              © {new Date().getFullYear()} Redes Adamari. Todos os direitos reservados. Conforme Decreto Federal nº 7.962/2013 e Lei nº 8.078/1990 (CDC).
            </p>
            <div className="flex gap-4">
              <a href="/trocas-e-devolucoes" className="hover:text-white transition">
                Trocas e Devoluções
              </a>
              <span>•</span>
              <a href="#duvidas" className="hover:text-white transition">
                Dúvidas Frequentes
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
