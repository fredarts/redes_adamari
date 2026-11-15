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
  apiKey?: string; // Chave opcional enviada diretamente do campo na tela Admin
}

/**
 * Mapeia as fotos reais capturadas do produto como imagem de referência principal
 */
function getReferencePhotoFilenames(productId: ProductId, colorId: string): string[] {
  if (productId === "rede-mosquiteiro") {
    return ["rede-mosquiteiro-verde.jpg", "rede-azul-varanda.jpg"];
  }
  switch (colorId) {
    case "azul-turquesa":
      return ["rede-turquesa-sol.jpg", "rede-azul-varanda.jpg"];
    case "vermelho-vivo":
    case "rosa-pink":
    case "laranja-tropical":
      return ["rede-vermelha-suporte.jpg", "rede-amarela-detalhe-punho.jpg"];
    case "amarelo-sol":
      return ["rede-amarela-detalhe-punho.jpg", "rede-vermelha-suporte.jpg"];
    default:
      return ["rede-azul-varanda.jpg", "rede-turquesa-sol.jpg"];
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

    // PROMPT RIGOROSO: Garante Cordas Brancas e Tecido Tactel idênticos às fotos reais
    const fullVisualPrompt = `[STRICT PRODUCT FIDELITY INSTRUCTION]
You are generating a commercial photograph for the authentic Brazilian hammock manufacturer "Redes Adamari" (Ateliê Adamari, Tabuleiro do Norte - Ceará).
You MUST inspect the attached reference image of the actual Redes Adamari hammock and preserve its exact material, color, and hardware construction with 100% precision:

1. ROPES AND SUSPENSION (NON-NEGOTIABLE):
- The cords/ropes MUST BE BRIGHT WHITE, thin 2.50mm braided polypropylene rope with UV protection.
- NEVER generate colored, dark, rope, rope-twine, or thick cotton ropes.
- The cords must pass through gathered pleats ("bainha em casinhas franzidas") at each end of the fabric body and fan out like harp strings into a strong white looped eyelet.

2. FABRIC AND FINISH:
- Fabric MUST BE 100% smooth, lightweight Tactel polyester in "${color.name}" (HEX: ${color.hex}), showing subtle satin sheen and crisp clean folds.
- Integrated rectangular side pocket ("bolsinho lateral") made of the EXACT same "${color.name}" Tactel fabric cleanly stitched on the side of the hammock body.

${
  product.id === "rede-mosquiteiro"
    ? "3. MOSQUITO NET: Fine breathable 360-degree white/light mesh dome canopy suspended cleanly above the hammock with two smooth zipper tracks."
    : ""
}

Scene and Environment:
${userScene}.
High-end commercial Brazilian lifestyle, warm natural afternoon sunlight, cozy relaxing atmosphere, ultra-sharp detail on fabric texture and white ropes.`;

    const defaultCaptions = [
      `✨ Imagine chegar em casa e relaxar na sua ${product.shortName} na cor ${color.name}!\n\nConfeccionada em Tabuleiro do Norte/CE com tecido 100% Tactel de toque macio:\n🌬️ Não esquenta nas costas\n⚡ Seca em poucos minutos\n📱 Bolsinho lateral integrado p/ celular\n🪢 Punhos com cordas brancas 2,50mm c/ proteção UV (Suporta até 220kg no tam. GG/XGG!)\n\n💚 Compre agora no site com desconto especial no PIX:\n👉 Link na bio!\n\n#RedesAdamari #RedeDeDormir #RedeTactel #AtelieAdamari #TabuleiroDoNorte #ConfortoEmCasa`,
      `🌞 Calor combina com rede fresca! A nossa ${product.shortName} (${color.name}) é super leve, não retém suor e cabe até na mochila de viagem.\n\n✅ Tamanhos M, G, GG e XGG\n✅ Frete Grátis acima de R$ 249\n✅ Envio rápido para todo o Brasil\n\nToque no link do perfil e escolha a sua cor favorita! 🛍️✨\n\n#RedesDeDescanso #VarandaGourmet #CampingBrasil #RedeComMosquiteiro #RedesCeara`,
      `🔥 Direto do nosso ateliê em Tabuleiro do Norte - CE para a sua varanda!\n\nOlha o capricho da ${product.shortName} na cor ${color.name} (${color.profile}). Cordas certificadas com proteção solar UV e costura tripla reforçada.\n\n📲 Chame no WhatsApp ou peça direto pelo site com pagamento seguro via Mercado Pago!`,
    ];

    // Prioriza chave enviada pelo usuário no formulário da tela Admin, ou usa a env var
    const geminiApiKey = (body.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim()) || "";
    const refFilenames = getReferencePhotoFilenames(product.id, color.id);
    const primaryRefFilename = refFilenames[0];

    // Se GEMINI_API_KEY estiver configurada ou preenchida na tela:
    if (geminiApiKey && geminiApiKey.length > 10) {
      // Obrigatório apiVersion: "v1beta" para suporte ao Nano Banana 2.1 e tipos "text"/"image" no interactions API
      const ai = new GoogleGenAI({ apiKey: geminiApiKey, apiVersion: "v1beta" });

      const inputParts: Array<
        | { type: "text"; text: string }
        | { type: "image"; mime_type: string; data: string }
      > = [{ type: "text", text: fullVisualPrompt }];

      // Anexa as imagens de referência reais do ateliê
      for (const fname of refFilenames.slice(0, 2)) {
        let loaded = false;
        try {
          const refFilePath = path.join(process.cwd(), "public", "images", fname);
          if (fs.existsSync && fs.existsSync(refFilePath)) {
            const imgBuffer = fs.readFileSync(refFilePath);
            inputParts.push({
              type: "image",
              mime_type: "image/jpeg",
              data: imgBuffer.toString("base64"),
            });
            loaded = true;
          }
        } catch {}

        // Fallback para ambiente serverless/edge buscando do asset estático
        if (!loaded) {
          try {
            const origin = new URL(request.url).origin;
            const fetchRes = await fetch(`${origin}/images/${fname}`);
            if (fetchRes.ok) {
              const arrayBuf = await fetchRes.arrayBuffer();
              const base64Str = Buffer.from(arrayBuf).toString("base64");
              inputParts.push({
                type: "image",
                mime_type: "image/jpeg",
                data: base64Str,
              });
            }
          } catch {}
        }
      }

      let imageUrl = `/images/${primaryRefFilename}`;
      let modelNotice: string | undefined;

      try {
        const imageInteraction = await ai.interactions.create({
          model: "gemini-nano-banana-2.1",
          input: inputParts,
          response_format: {
            type: "image",
            mime_type: "image/jpeg",
            aspect_ratio: aspectRatio,
          },
        });

        const generatedImage = imageInteraction.output_image;
        if (generatedImage && generatedImage.data) {
          const mime = generatedImage.mime_type || "image/jpeg";
          imageUrl = `data:${mime};base64,${generatedImage.data}`;
        }
      } catch (imgErr: any) {
        console.warn("[Gemini Nano Banana Image Generation Warning]:", imgErr);
        modelNotice = `Aviso do Google Gemini: ${imgErr?.message || "Não foi possível gerar a nova imagem no momento"}. Exibindo a foto real de referência com as 3 legendas geradas pela IA.`;
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
Destaque o tecido Tactel fresco (não esquenta nas costas), bolsinho lateral integrado e punhos brancos em corda trançada 2,50mm com proteção UV.
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
        notice: modelNotice,
      });
    }

    // Modo Demonstração Inteligente quando a chave ainda não foi inserida
    const previewUrl = `/images/${primaryRefFilename}`;
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
      modelUsed: "gemini-nano-banana-2.1 (Modo Demonstração)",
      imageUrl: previewUrl,
      captions: defaultCaptions,
      promptUsed: fullVisualPrompt,
      post: saved,
      notice:
        "Cole sua chave gratuita do Google AI Studio no campo acima para gerar fotos inéditas em alta resolução!",
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
