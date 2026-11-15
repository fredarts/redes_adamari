import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  PRODUCTS,
  TACTEL_COLORS,
  type ProductId,
} from "@/data/products";
import { saveSocialPostRecord } from "@/lib/supabaseAdmin";

function checkAdminAuth(request: Request): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "adamari2026";
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === expectedPassword;
}

interface SocialStudioRequest {
  productId: ProductId;
  colorId: string;
  aspectRatio: "1:1" | "9:16" | "16:9";
  scenePrompt: string;
  campaignFocus?: string;
}

function getReferencePhotoFilename(productId: ProductId, colorId: string): string {
  if (productId === "rede-mosquiteiro") {
    return "rede-mosquiteiro-verde.jpg";
  }
  switch (colorId) {
    case "azul-turquesa":
      return "rede-turquesa-sol.jpg";
    case "vermelho-vivo":
    case "rosa-pink":
    case "laranja-tropical":
      return "rede-vermelha-suporte.jpg";
    case "amarelo-sol":
      return "rede-amarela-detalhe-punho.jpg";
    default:
      return "rede-azul-varanda.jpg";
  }
}

export async function POST(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SocialStudioRequest;
    const product = PRODUCTS[body.productId] || PRODUCTS["rede-tradicional"];
    const color =
      TACTEL_COLORS.find((c) => c.id === body.colorId) || TACTEL_COLORS[0];
    const aspectRatio = body.aspectRatio || "1:1";
    const userScene =
      body.scenePrompt?.trim() ||
      "Varanda aconchegante com plantas tropicais e iluminação dourada de fim de tarde no Ceará";

    const fullVisualPrompt = `Create a hyper-realistic commercial lifestyle photograph for the Brazilian hammock brand "Redes Adamari" (Ateliê Adamari).
Show the exact "${product.name}" hammock in the vibrant "${color.name}" (${color.hex}) smooth Tactel polyester fabric, preserving its authentic physical construction from the reference image:
1. Gathered pleated fabric hem ("bainha em casinhas franzidas") at both ends where thin white 2.50mm braided polypropylene cords pass through and fan out like a harp to a strong white loop.
2. Integrated rectangular side pocket made of the exact same "${color.name}" Tactel fabric sewn cleanly onto the side of the hammock body (no third-party logos).
${
  product.id === "rede-mosquiteiro"
    ? "3. Full 360-degree breathable fine mosquito mesh canopy suspended above the hammock with dual side zipper closure."
    : ""
}
Scene & Atmosphere: ${userScene}. Warm editorial lighting, ultra-sharp fabric texture, inviting relaxation vibe.`;

    const defaultCaptions = [
      `✨ Imagine chegar em casa e relaxar na sua ${product.shortName} na cor ${color.name}!\n\nConfeccionada em Tabuleiro do Norte/CE com tecido 100% Tactel de toque macio:\n🌬️ Não esquenta nas costas\n⚡ Seca em poucos minutos\n📱 Bolsinho lateral integrado p/ celular\n🪢 Punhos com cordas brancas 2,50mm c/ proteção UV (Suporta até 220kg no tam. GG/XGG!)\n\n💚 Compre agora no site com desconto especial no PIX:\n👉 Link na bio!\n\n#RedesAdamari #RedeDeDormir #RedeTactel #AtelieAdamari #TabuleiroDoNorte #ConfortoEmCasa`,
      `🌞 Calor combina com rede fresca! A nossa ${product.shortName} (${color.name}) é super leve, não retém suor e cabe até na mochila de viagem.\n\n✅ Tamanhos M, G, GG e XGG\n✅ Frete Grátis acima de R$ 249\n✅ Envio rápido para todo o Brasil\n\nToque no link do perfil e escolha a sua cor favorita! 🛍️✨\n\n#RedesDeDescanso #VarandaGourmet #CampingBrasil #RedeComMosquiteiro #RedesCeara`,
      `🔥 Direto do nosso ateliê em Tabuleiro do Norte - CE para a sua varanda!\n\nOlha o capricho da ${product.shortName} na cor ${color.name} (${color.profile}). Cordas certificadas com proteção solar UV e costura tripla reforçada.\n\n📲 Chame no WhatsApp ou peça direto pelo site com pagamento seguro via Mercado Pago!`,
    ];

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const refFilename = getReferencePhotoFilename(product.id, color.id);
    const refFilePath = path.join(process.cwd(), "public", "images", refFilename);

    // Se GEMINI_API_KEY estiver configurada, chama o Gemini Nano Banana 2.1 oficial
    if (geminiApiKey && geminiApiKey.length > 10) {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const inputParts: Array<
        | { type: "text"; text: string }
        | { type: "image"; mime_type: string; data: string }
      > = [{ type: "text", text: fullVisualPrompt }];

      if (fs.existsSync(refFilePath)) {
        const imgBuffer = fs.readFileSync(refFilePath);
        inputParts.push({
          type: "image",
          mime_type: "image/jpeg",
          data: imgBuffer.toString("base64"),
        });
      }

      const imageInteraction = await ai.interactions.create({
        model: "gemini-nano-banana-2.1",
        input: inputParts,
        response_format: {
          type: "image",
          mime_type: "image/jpeg",
          aspect_ratio: aspectRatio,
        },
      });

      let imageUrl = `/images/${refFilename}`;
      const generatedImage = imageInteraction.output_image;
      if (generatedImage && generatedImage.data) {
        const mime = generatedImage.mime_type || "image/jpeg";
        imageUrl = `data:${mime};base64,${generatedImage.data}`;
      }

      // Gera legendas persuasivas com o Gemini 4 Hydrogen
      let generatedCaptions = defaultCaptions;
      try {
        const copyInteraction = await ai.interactions.create({
          model: "gemini-4-hydrogen",
          input: `Você é o copywriter oficial da marca cearense "Redes Adamari" (Ateliê Adamari, de Tabuleiro do Norte - CE).
Crie 3 opções de legendas em português do Brasil para Instagram/Facebook/WhatsApp divulgando:
- Produto: ${product.name}
- Cor: ${color.name} (${color.profile})
- Cenário da foto: ${userScene}
- Foco da campanha: ${body.campaignFocus || "Venda direta com desconto no PIX e envio para todo o Brasil"}
Destaque o tecido Tactel fresco (não esquenta nas costas), bolsinho lateral integrado e punhos brancos em corda 2,50mm com proteção UV.
Separe as 3 opções exatamente com o divisor "---OPCAO---".`,
        });

        if (copyInteraction.output_text) {
          const split = copyInteraction.output_text
            .split("---OPCAO---")
            .map((s) => s.trim())
            .filter(Boolean);
          if (split.length > 0) {
            generatedCaptions = split;
          }
        }
      } catch (copyErr) {
        console.warn("[Gemini Copy Fallback]:", copyErr);
      }

      const saved = await saveSocialPostRecord({
        prompt: userScene,
        caption: generatedCaptions[0],
        aspectRatio,
        productId: product.id,
        colorId: color.id,
        imageUrl,
      });

      return NextResponse.json({
        mode: "gemini_nano_banana_live",
        modelUsed: "gemini-nano-banana-2.1",
        imageUrl,
        captions: generatedCaptions,
        promptUsed: fullVisualPrompt,
        post: saved,
      });
    }

    // Modo Demonstração Inteligente quando GEMINI_API_KEY ainda não foi configurada
    const previewUrl = `/images/${refFilename}`;
    const saved = await saveSocialPostRecord({
      prompt: userScene,
      caption: defaultCaptions[0],
      aspectRatio,
      productId: product.id,
      colorId: color.id,
      imageUrl: previewUrl,
    });

    return NextResponse.json({
      mode: "demo_preview",
      modelUsed: "gemini-nano-banana-2.1 (Modo Preview - Adicione GEMINI_API_KEY)",
      imageUrl: previewUrl,
      captions: defaultCaptions,
      promptUsed: fullVisualPrompt,
      post: saved,
      notice:
        "Preview gerado com a foto real de referência e 3 legendas prontas! Para gerar fotos inéditas ilimitadas com IA, adicione sua chave gratuita GEMINI_API_KEY do Google AI Studio.",
    });
  } catch (error) {
    console.error("[Admin Social Studio Error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar conteúdo no Estúdio IA.",
      },
      { status: 500 }
    );
  }
}
