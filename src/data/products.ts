export type HammockSizeCode = "M" | "G" | "GG" | "XGG";
export type SizeCode = HammockSizeCode | "UNICO";

export type HammockProductId = "rede-tradicional" | "rede-mosquiteiro";
export type AccessoryProductId =
  | "gancho-armador"
  | "mola-extensora"
  | "corda-nylon";

export type ProductId = HammockProductId | AccessoryProductId;

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
  category: "hammock" | "accessory";
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
  packageContents?: string[];
  technicalSpecs?: Record<string, string>;
  usageIndication?: string;
  safetyWarnings?: string[];
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
 * ACABAMENTOS / CORES PADRÃO DOS ACESSÓRIOS DE INSTALAÇÃO
 */
export const ACCESSORY_COLORS: Record<AccessoryProductId, TactelColor> = {
  "gancho-armador": {
    id: "padrao",
    name: "Aço Zincado (Par + 8 Buchas 10 + 8 Parafusos)",
    hex: "#94A3B8",
    accentHex: "#CBD5E1",
    profile: "Kit completo pronto para instalar em alvenaria",
    photoUrl: "/images/gancho-armador-rede.jpg",
  },
  "mola-extensora": {
    id: "padrao",
    name: "Aço Prateado (Par de Molas)",
    hex: "#64748B",
    accentHex: "#94A3B8",
    profile: "Amortecimento macio e alta resistência",
    photoUrl: "/images/mola-extensora-rede.jpg",
  },
  "corda-nylon": {
    id: "padrao",
    name: "Nylon Trançado (Kit 2 Cordas de 2m)",
    hex: "#EAB308",
    accentHex: "#FACC15",
    profile: "Par de cordas de 2 metros cada para ajuste de distância",
    photoUrl: "/images/corda-nylon-rede.jpg",
  },
};

export function isAccessoryProduct(
  productId: string
): productId is AccessoryProductId {
  return (
    productId === "gancho-armador" ||
    productId === "mola-extensora" ||
    productId === "corda-nylon"
  );
}

export function resolveProductColor(
  productId: ProductId,
  colorId: string
): TactelColor {
  if (isAccessoryProduct(productId)) {
    return ACCESSORY_COLORS[productId];
  }
  return TACTEL_COLORS.find((c) => c.id === colorId) || TACTEL_COLORS[0];
}

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

function buildAccessorySizes(spec: ProductSizeSpec): Record<SizeCode, ProductSizeSpec> {
  return {
    M: spec,
    G: spec,
    GG: spec,
    XGG: spec,
    UNICO: spec,
  };
}

const ganchoSpec: ProductSizeSpec = {
  code: "UNICO",
  title: "Kit Completo (Par + 8 Buchas 10 + 8 Parafusos)",
  clothDimensions: "01 Par de Ganchos Sobrepor",
  totalLengthWithCords: "Acompanha 8 Buchas nº 10 + 8 Parafusos Sextavados",
  capacityKg: 110,
  weightApprox: "420g",
  recommendedFor: "Fixação em paredes e colunas de alvenaria (3 a 4m de distância)",
  priceCard: 37.9,
  pricePix: 34.9,
};

const molaSpec: ProductSizeSpec = {
  code: "UNICO",
  title: "Par de Extensores em Mola (2 Unidades)",
  clothDimensions: "4,5 cm (Alt.) x 5,0 cm (Larg.)",
  totalLengthWithCords: "Aço Resistente Prateado c/ Ganchos nas Extremidades",
  capacityKg: 160,
  weightApprox: "500g",
  recommendedFor: "Absorção suave dos movimentos da rede em varandas e quintais",
  priceCard: 42.9,
  pricePix: 39.9,
};

const cordaSpec: ProductSizeSpec = {
  code: "UNICO",
  title: "Kit 2 Cordas de Nylon (2,00m cada)",
  clothDimensions: "2 Cordas de 2,00 metros cada",
  totalLengthWithCords: "4,00 metros lineares totais no kit",
  capacityKg: 180,
  weightApprox: "320g",
  recommendedFor: "Prolongar e ajustar a distância em varandas amplas, pilares ou árvores",
  priceCard: 26.9,
  pricePix: 24.9,
};

/**
 * CATÁLOGO COMPLETO: 2 REDES PRINCIPAIS + 3 ACESSÓRIOS DE INSTALAÇÃO
 */
export const PRODUCTS: Record<ProductId, ProductDefinition> = {
  "rede-tradicional": {
    id: "rede-tradicional",
    category: "hammock",
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
      UNICO: {
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
    },
  },
  "rede-mosquiteiro": {
    id: "rede-mosquiteiro",
    category: "hammock",
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
      UNICO: {
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
    },
  },
  "gancho-armador": {
    id: "gancho-armador",
    category: "accessory",
    name: "Gancho Armador de Rede c/ Buchas e Parafusos",
    shortName: "Gancho Armador c/ Buchas (Par)",
    subtitle:
      "Acompanha 01 Par de Ganchos em aço + 8 Buchas nº 10 + 8 Parafusos Sextavados",
    badge: "Kit Completo de Fixação",
    hasMosquitoNet: false,
    coverPhoto: "/images/gancho-armador-rede.jpg",
    galleryPhotos: [
      {
        url: "/images/gancho-armador-rede.jpg",
        caption: "Par de Ganchos Armadores + 8 Buchas 10 + 8 Parafusos Sextavados",
        environment: "Alvenaria & Varanda",
      },
    ],
    description:
      "Kit completo de fixação de sobrepor para instalar sua rede de descanso com total firmeza em paredes e colunas de alvenaria. Já vai pronto para instalação com o par de ganchos reforçados, 8 buchas número 10 e 8 parafusos sextavados.",
    highlights: [
      "Acompanha 01 PAR de Ganchos Armadores de sobrepor em aço resistente",
      "Inclui 08 Buchas nº 10 + 08 Parafusos Sextavados para fixação firme",
      "Modelo sobrepor com 4 furos por base para distribuição segura da carga",
      "Pronto para instalar em paredes de alvenaria (altura recomendada: 1,50m)",
    ],
    packageContents: [
      "01 PAR de Ganchos Armadores de Rede",
      "08 Buchas nº 10",
      "08 Parafusos sextavados",
    ],
    technicalSpecs: {
      Produto: "Gancho Armador de Rede c/ Kit Fixação",
      Modelo: "Sobrepor (4 furos por chapa)",
      Material: "Aço Zincado Resistente",
      "Altura Recomendada": "1,50 m do solo (perpendicular e alinhado)",
      "Distância Recomendada": "3,00 m a 4,00 m entre os ganchos",
      "Peso Máximo Suportado": "110 kg",
      "Indicação de Parede": "Alvenaria resistente",
    },
    usageIndication:
      "USO EXCLUSIVO PARA REDES DE DESCANSO. Fixar em paredes de alvenaria e em locais que permitam uma boa fixação dos parafusos.",
    safetyWarnings: [
      "Recomenda-se a fixação a uma altura de 1,50 m do solo perpendicular à parede e no mesmo alinhamento.",
      "A distância entre os ganchos de rede pode variar de 3 a 4 metros, uma vez que as redes não possuem um padrão definido de comprimento.",
      "Modelo sobrepor: fixar em paredes de alvenaria e em locais que permitam uma boa fixação dos parafusos.",
      "Não exceder 110 kg de peso na rede.",
      "Procure fixar os ganchos para rede em locais seguros e que apresentem boas condições de fixação.",
      "Nunca deixe crianças desacompanhadas brincando na rede ou próximas da mesma.",
      "USO EXCLUSIVO PARA REDES DE DESCANSO.",
    ],
    sizes: buildAccessorySizes(ganchoSpec),
  },
  "mola-extensora": {
    id: "mola-extensora",
    category: "accessory",
    name: "Par de Extensores em Mola para Rede de Descanso – Aço Resistente",
    shortName: "Par de Molas Extensoras (Aço)",
    subtitle:
      "Mais conforto, praticidade e segurança: sistema de mola que absorve os movimentos durante o balanço",
    badge: "Amortecimento & Conforto",
    hasMosquitoNet: false,
    coverPhoto: "/images/mola-extensora-rede.jpg",
    galleryPhotos: [
      {
        url: "/images/mola-extensora-rede.jpg",
        caption: "Par de Extensores em Mola de Aço Prateado — Suporta até 160 kg",
        environment: "Conforto & Absorção",
      },
    ],
    description:
      "O Par de Extensores em Mola para Rede de Descanso é ideal para quem deseja instalar sua rede com mais praticidade e proporcionar uma experiência de descanso mais confortável. Fabricados em aço, os extensores possuem estrutura resistente e acabamento prateado. Seu sistema de mola auxilia na absorção dos movimentos durante o uso da rede, proporcionando maior flexibilidade e contribuindo para uma utilização mais confortável. Com ganchos nas extremidades, permitem a conexão entre a rede e os pontos de fixação, facilitando a instalação em locais apropriados.",
    highlights: [
      "Kit com 2 extensores em mola fabricados em aço resistente prateado",
      "Auxiliam na absorção dos movimentos da rede e proporcionam maior flexibilidade",
      "Possuem ganchos nas extremidades para facilitar a instalação prática e funcional",
      "Suportam até 160 kg — ideais para redes de descanso residenciais",
    ],
    packageContents: ["02 Extensores em Mola para Rede de Descanso"],
    technicalSpecs: {
      Marca: "I4 STORE",
      Produto: "Par de Extensores em Mola",
      Modelo: "Kit Instalação Dormir Segurança",
      Material: "Aço",
      Cor: "Prateado",
      Quantidade: "2 unidades",
      "Altura aproximada": "4,5 cm",
      "Largura aproximada": "5 cm",
      "Peso do produto": "500 g",
      "Peso máximo suportado informado": "160 kg",
      Regulagem: "Não possui",
      "Bolsa para transporte": "Não acompanha",
    },
    usageIndication:
      "Indicado para instalação de redes de descanso em ambientes residenciais, varandas, quintais e outros espaços com pontos de fixação adequados.",
    safetyWarnings: [
      "Antes da utilização, verifique se os pontos de fixação, ganchos, paredes e suportes estão devidamente instalados e dimensionados para suportar a carga.",
      "Respeite o limite máximo de peso informado pelo fabricante (160 kg).",
    ],
    sizes: buildAccessorySizes(molaSpec),
  },
  "corda-nylon": {
    id: "corda-nylon",
    category: "accessory",
    name: "Kit 2 Cordas de Nylon para Rede (2 Metros cada)",
    shortName: "Kit 2 Cordas de Nylon (2m cada)",
    subtitle:
      "Kit com 2 cordas resistentes de 2 metros cada para prolongar e ajustar a distância da rede em varandas, pilares ou árvores",
    badge: "Kit 2x 2 Metros",
    hasMosquitoNet: false,
    coverPhoto: "/images/corda-nylon-rede.jpg",
    galleryPhotos: [
      {
        url: "/images/corda-nylon-rede.jpg",
        caption: "Kit com 2 Cordas Trançadas de Nylon de 2 Metros cada",
        environment: "Varanda, Sítio & Camping",
      },
    ],
    description:
      "Kit composto por 2 cordas de nylon trançado de alta resistência com 2,00 metros de comprimento cada. Essencial quando os ganchos, colunas, vigas de madeira ou árvores estão mais distantes entre si, permitindo regular a altura e o caimento ideal da rede sem forçar nem desgastar os punhos.",
    highlights: [
      "Acompanha 02 cordas de nylon trançado com 2,00 metros cada (4m no total)",
      "Alta resistência à tração, sol e umidade — ideal para uso interno e externo",
      "Permite ajustar perfeitamente a distância entre ganchos distantes, pilares ou árvores",
      "Protege os punhos originais da sua rede contra atrito em troncos e vigas",
    ],
    packageContents: ["02 Cordas de Nylon de 2,00 metros cada"],
    technicalSpecs: {
      Produto: "Kit 2 Cordas Extensoras para Rede de Descanso",
      Material: "Nylon Trançado de Alta Resistência",
      Comprimento: "2,00 metros cada corda (4,00 m somados)",
      Quantidade: "02 unidades (Par)",
      "Peso máximo suportado": "180 kg",
      Indicação: "Ajuste de distância em varandas, colunas, vigas e árvores",
    },
    usageIndication:
      "Indicado para prolongar e ajustar a distância entre os punhos da rede e os ganchos armadores, colunas, caibros ou árvores em varandas, sítios e acampamentos.",
    safetyWarnings: [
      "Certifique-se de realizar nós firmes e bem ajustados nas duas extremidades antes de utilizar a rede.",
      "Evite apoiar a corda diretamente sobre quinas vivas ou cortantes de metal e concreto.",
    ],
    sizes: buildAccessorySizes(cordaSpec),
  },
};

export const SIZE_ORDER: HammockSizeCode[] = ["M", "G", "GG", "XGG"];
export const HAMMOCK_PRODUCT_IDS: HammockProductId[] = [
  "rede-tradicional",
  "rede-mosquiteiro",
];
export const ACCESSORY_PRODUCT_IDS: AccessoryProductId[] = [
  "gancho-armador",
  "mola-extensora",
  "corda-nylon",
];
export const ALL_PRODUCT_IDS: ProductId[] = [
  ...HAMMOCK_PRODUCT_IDS,
  ...ACCESSORY_PRODUCT_IDS,
];

export const PRODUCT_LIST: ProductDefinition[] = [
  PRODUCTS["rede-tradicional"],
  PRODUCTS["rede-mosquiteiro"],
];

export const ACCESSORY_LIST: ProductDefinition[] = [
  PRODUCTS["gancho-armador"],
  PRODUCTS["mola-extensora"],
  PRODUCTS["corda-nylon"],
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
