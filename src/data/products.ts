export type SizeCode = "M" | "G" | "GG" | "XGG";

export type ProductId = "rede-tradicional" | "rede-mosquiteiro";

export interface TactelColor {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
  profile: string;
  tag?: string;
  /** Foto real correspondente ou mais próxima para exibição imediata */
  photoUrl: string;
}

export interface ProductSizeSpec {
  code: SizeCode;
  title: string;
  /** Medidas que podem ser editadas facilmente assim que tiver a metragem exata */
  clothDimensions: string;
  totalLengthWithCords: string;
  capacityKg: number;
  weightApprox: string;
  recommendedFor: string;
  priceCard: number;
  pricePix: number;
}

export interface ProductDefinition {
  id: ProductId;
  name: string;
  shortName: string;
  subtitle: string;
  badge: string;
  hasMosquitoNet: boolean;
  coverPhoto: string;
  galleryPhotos: {
    url: string;
    caption: string;
    environment: string;
  }[];
  description: string;
  highlights: string[];
  sizes: Record<SizeCode, ProductSizeSpec>;
}

/**
 * 10 CORES CLÁSSICAS E VIBRANTES DO TECIDO TACTEL
 */
export const TACTEL_COLORS: TactelColor[] = [
  {
    id: "azul-royal",
    name: "Azul Royal Vibrante",
    hex: "#0052CC",
    accentHex: "#2684FF",
    profile: "Clássico campeão de vendas, vivo e brilhante",
    tag: "Mais Vendida",
    photoUrl: "/images/rede-azul-varanda.jpg",
  },
  {
    id: "azul-turquesa",
    name: "Azul Turquesa (Piscina)",
    hex: "#00B4D8",
    accentHex: "#48CAE4",
    profile: "Tom tropical, alegre e super refrescante",
    tag: "Verão",
    photoUrl: "/images/rede-turquesa-sol.jpg",
  },
  {
    id: "rosa-pink",
    name: "Rosa Pink / Magenta",
    hex: "#D81B60",
    accentHex: "#FF4081",
    profile: "Cor intensa, acolhedora e destaque no jardim",
    tag: "Destaque",
    photoUrl: "/images/hero-casal-jardim.jpg",
  },
  {
    id: "vermelho-vivo",
    name: "Vermelho Vivo (Rubi)",
    hex: "#D90429",
    accentHex: "#EF233C",
    profile: "Quente, intenso e de alto destaque na varanda",
    photoUrl: "/images/rede-vermelha-suporte.jpg",
  },
  {
    id: "amarelo-sol",
    name: "Amarelo Sol (Ouro)",
    hex: "#FFB703",
    accentHex: "#FFD166",
    profile: "Alegre, solar e com a cara do verão brasileiro",
    tag: "Solar",
    photoUrl: "/images/rede-amarela-detalhe-punho.jpg",
  },
  {
    id: "verde-militar",
    name: "Verde Militar (Musgo)",
    hex: "#4A5D23",
    accentHex: "#6B8E23",
    profile: "Favorito absoluto para camping, pesca, sítio e mata",
    tag: "Ideal Camping",
    photoUrl: "/images/rede-mosquiteiro-verde.jpg",
  },
  {
    id: "verde-bandeira",
    name: "Verde Bandeira Esmeralda",
    hex: "#1B8A3D",
    accentHex: "#2B9348",
    profile: "Harmonia perfeita com plantas, jardins e chácaras",
    photoUrl: "/images/rede-mosquiteiro-verde.jpg",
  },
  {
    id: "laranja-tropical",
    name: "Laranja Tropical",
    hex: "#FB5607",
    accentHex: "#FF7F51",
    profile: "Vibrante, caloroso e cheio de energia",
    photoUrl: "/images/rede-amarela-detalhe-punho.jpg",
  },
  {
    id: "azul-marinho",
    name: "Azul Marinho",
    hex: "#1B263B",
    accentHex: "#415A77",
    profile: "Elegante, discreto e não mostra sujeira fácil",
    photoUrl: "/images/rede-azul-varanda.jpg",
  },
  {
    id: "roxo-acai",
    name: "Roxo Açaí (Lilás Escuro)",
    hex: "#7209B7",
    accentHex: "#9D4EDD",
    profile: "Sofisticado, diferente e cheio de personalidade",
    photoUrl: "/images/hero-casal-jardim.jpg",
  },
];

/**
 * ESPECIFICAÇÕES TÉCNICAS REAIS DOS PUNHOS (EXTRAÍDAS DA ETIQUETA PLASMÓDIA)
 */
export const ROPE_TECH_SPECS = {
  manufacturer: "Plasmódia Ind. e Com. de Plásticos Ltda. (Indústria Brasileira)",
  certification: "ISO 9001",
  code: "4492",
  material: "Corda de Polipropileno Trançada c/ Proteção UV",
  thickness: "2,50 mm",
  color: "Branca Pura",
  benefits: [
    "Leque de cordas brancas passando individualmente pelas casinhas franzidas do Tactel",
    "Proteção solar contra raios UV integrada (não resseca e não apodrece no sol)",
    "100% impermeável: não absorve água da chuva, mar ou piscina e não mofa",
    "Certificação de qualidade ISO 9001 — alta resistência e distribuição macia do peso",
  ],
};

/**
 * CATÁLOGO DOS 2 PRODUTOS PRINCIPAIS E SEUS 4 TAMANHOS (M, G, GG, XGG)
 */
export const PRODUCTS: Record<ProductId, ProductDefinition> = {
  "rede-tradicional": {
    id: "rede-tradicional",
    name: "Rede de Dormir Tradicional em Tactel",
    shortName: "Rede Tradicional",
    subtitle:
      "Toque fresquinho, bolsinho lateral integrado e punhos em leque de cordas brancas com proteção UV",
    badge: "Favorita para Varanda & Lazer",
    hasMosquitoNet: false,
    coverPhoto: "/images/rede-azul-varanda.jpg",
    galleryPhotos: [
      {
        url: "/images/rede-azul-varanda.jpg",
        caption: "Conforto na Varanda — Azul Royal Vibrante",
        environment: "Varanda & Quintal",
      },
      {
        url: "/images/hero-casal-jardim.jpg",
        caption: "Descanso a Dois no Jardim — Rosa Pink / Magenta",
        environment: "Jardim & Sítio",
      },
      {
        url: "/images/rede-turquesa-sol.jpg",
        caption: "Frescor à Beira da Piscina — Azul Turquesa",
        environment: "Piscina & Praia",
      },
      {
        url: "/images/rede-vermelha-suporte.jpg",
        caption: "Perfeita também em Suporte — Vermelho Vivo c/ Bolsinho",
        environment: "Suporte & Área Gourmet",
      },
      {
        url: "/images/rede-amarela-detalhe-punho.jpg",
        caption: "Detalhe das Casinhas Costuradas, Cordas 2,5mm e Bolsinho",
        environment: "Acabamento Artesanal",
      },
    ],
    description:
      "Feita para quem ama relaxar sentindo a brisa. O tecido Tactel de alta densidade abraça o corpo sem esquentar as costas, seca em minutos após um banho de piscina ou mar e já vem com bolsinho lateral costurado na própria rede. Nas pontas, o acabamento em casinhas franzidas recebe múltiplas cordas brancas trançadas de 2,50 mm com proteção UV.",
    highlights: [
      "Tecido Tactel macio e fresquinho: não esquenta nas costas nem acumula poeira",
      "Bolsinho lateral acoplado: guarde o celular ou dobre a rede dentro dele",
      "Bainha em casinhas reforçadas com cordas brancas trançadas 2,50 mm c/ UV",
      "Secagem ultra-rápida e lavável na máquina sem desbotar as cores",
    ],
    sizes: {
      M: {
        code: "M",
        title: "Tamanho M (Compacta / Individual)",
        clothDimensions: "2,40m x 1,40m (Tecido)",
        totalLengthWithCords: "3,40m (Punho a Punho)",
        capacityKg: 150,
        weightApprox: "550g",
        recommendedFor: "Ideal para 1 pessoa, sacadas de apartamento, viagens e praia",
        priceCard: 89.9,
        pricePix: 84.9,
      },
      G: {
        code: "G",
        title: "Tamanho G (Solteiro Conforto)",
        clothDimensions: "2,60m x 1,50m (Tecido)",
        totalLengthWithCords: "3,70m (Punho a Punho)",
        capacityKg: 180,
        weightApprox: "680g",
        recommendedFor: "Perfeita para 1 adulto deitar na diagonal com folga e maciez",
        priceCard: 109.9,
        pricePix: 103.9,
      },
      GG: {
        code: "GG",
        title: "Tamanho GG (Casal Espaçosa)",
        clothDimensions: "2,80m x 1,65m (Tecido)",
        totalLengthWithCords: "4,00m (Punho a Punho)",
        capacityKg: 220,
        weightApprox: "820g",
        recommendedFor: "Nossa campeã de vendas! Ampla para casal ou máximo conforto",
        priceCard: 129.9,
        pricePix: 122.9,
      },
      XGG: {
        code: "XGG",
        title: "Tamanho XGG (Gigante Família)",
        clothDimensions: "3,00m x 1,85m (Tecido)",
        totalLengthWithCords: "4,30m (Punho a Punho)",
        capacityKg: 260,
        weightApprox: "980g",
        recommendedFor: "Nossa maior metragem! Largura extra para curtir com as crianças",
        priceCard: 149.9,
        pricePix: 141.9,
      },
    },
  },
  "rede-mosquiteiro": {
    id: "rede-mosquiteiro",
    name: "Rede de Dormir com Mosquiteiro em Tactel",
    shortName: "Rede c/ Mosquiteiro",
    subtitle:
      "Sono tranquilo livre de pernilongos e insetos, com cúpula respirável e zíper duplo",
    badge: "Perfeita para Sítio, Camping & Pesca",
    hasMosquitoNet: true,
    coverPhoto: "/images/rede-mosquiteiro-verde.jpg",
    galleryPhotos: [
      {
        url: "/images/rede-mosquiteiro-verde.jpg",
        caption: "Cúpula Mosquiteiro Respirável c/ Zíper — Verde Militar",
        environment: "Sítio, Mata & Camping",
      },
      {
        url: "/images/rede-amarela-detalhe-punho.jpg",
        caption: "Detalhe do Punho em Cordas Brancas 2,5mm c/ UV e Bolsinho",
        environment: "Punho Certificado ISO 9001",
      },
      {
        url: "/images/rede-azul-varanda.jpg",
        caption: "Corpo em Tecido Tactel Fresco disponível nas 10 cores",
        environment: "Conforto Térmico",
      },
      {
        url: "/images/rede-turquesa-sol.jpg",
        caption: "Leve, impermeável ao sereno e de secagem rápida",
        environment: "Versatilidade Outdoor",
      },
    ],
    description:
      "Durma ao ar livre na varanda do sítio, na beira do rio ou no acampamento sem se preocupar com pernilongos, muriçocas ou mosquitos da dengue. Possui mosquiteiro integrado em tela ultrafina que deixa o vento passar livremente, abertura prática por zíper, bolsinho lateral e punhos em corda trançada 2,50 mm com proteção UV.",
    highlights: [
      "Véu mosquiteiro 360° integrado: malha fina que protege sem abafar o vento",
      "Fechamento completo com zíper reforçado (fácil de abrir por dentro e por fora)",
      "Punhos em Corda Trançada Branca 2,50 mm c/ proteção UV (ISO 9001)",
      "Acompanha bolsinho lateral costurado no próprio tecido Tactel",
    ],
    sizes: {
      M: {
        code: "M",
        title: "Tamanho M (Compacta c/ Mosquiteiro)",
        clothDimensions: "2,40m x 1,40m (Tecido)",
        totalLengthWithCords: "3,40m (Punho a Punho)",
        capacityKg: 150,
        weightApprox: "780g",
        recommendedFor: "Trilhas, mochileiros e aventuras individuais super leves",
        priceCard: 139.9,
        pricePix: 131.9,
      },
      G: {
        code: "G",
        title: "Tamanho G (Solteiro Aventura c/ Mosquiteiro)",
        clothDimensions: "2,60m x 1,50m (Tecido)",
        totalLengthWithCords: "3,70m (Punho a Punho)",
        capacityKg: 180,
        weightApprox: "920g",
        recommendedFor: "Conforto amplo para 1 adulto em pescarias, sítios ou acampamentos",
        priceCard: 159.9,
        pricePix: 151.9,
      },
      GG: {
        code: "GG",
        title: "Tamanho GG (Casal c/ Mosquiteiro)",
        clothDimensions: "2,80m x 1,65m (Tecido)",
        totalLengthWithCords: "4,00m (Punho a Punho)",
        capacityKg: 220,
        weightApprox: "1,10kg",
        recommendedFor: "Espaço generoso para 2 pessoas descansarem protegidas de insetos",
        priceCard: 179.9,
        pricePix: 169.9,
      },
      XGG: {
        code: "XGG",
        title: "Tamanho XGG (Família Gigante c/ Mosquiteiro)",
        clothDimensions: "3,00m x 1,85m (Tecido)",
        totalLengthWithCords: "4,30m (Punho a Punho)",
        capacityKg: 260,
        weightApprox: "1,28kg",
        recommendedFor: "Proteção máxima e espaço gigante para varandas de chácara e fazenda",
        priceCard: 199.9,
        pricePix: 189.9,
      },
    },
  },
};

export const SIZE_ORDER: SizeCode[] = ["M", "G", "GG", "XGG"];
export const PRODUCT_LIST: ProductDefinition[] = [
  PRODUCTS["rede-tradicional"],
  PRODUCTS["rede-mosquiteiro"],
];

export const FREE_SHIPPING_THRESHOLD = 249.0;

export function calculateShippingByUF(uf: string, subtotal: number): {
  price: number;
  days: string;
  regionName: string;
  isFree: boolean;
} {
  const cleanUf = uf.trim().toUpperCase();
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  const southeast = ["SP", "RJ", "MG", "ES"];
  const south = ["PR", "SC", "RS"];
  const midwest = ["DF", "GO", "MT", "MS"];
  const northeast = ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"];

  if (southeast.includes(cleanUf)) {
    return {
      price: isFree ? 0 : 18.9,
      days: "3 a 6 dias úteis",
      regionName: `Sudeste (${cleanUf})`,
      isFree,
    };
  }
  if (south.includes(cleanUf)) {
    return {
      price: isFree ? 0 : 22.9,
      days: "4 a 7 dias úteis",
      regionName: `Sul (${cleanUf})`,
      isFree,
    };
  }
  if (midwest.includes(cleanUf)) {
    return {
      price: isFree ? 0 : 24.9,
      days: "5 a 8 dias úteis",
      regionName: `Centro-Oeste (${cleanUf})`,
      isFree,
    };
  }
  if (northeast.includes(cleanUf)) {
    return {
      price: isFree ? 0 : 26.9,
      days: "5 a 9 dias úteis",
      regionName: `Nordeste (${cleanUf})`,
      isFree,
    };
  }

  return {
    price: isFree ? 0 : 32.9,
    days: "7 a 12 dias úteis",
    regionName: `Norte (${cleanUf || "BR"})`,
    isFree,
  };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
