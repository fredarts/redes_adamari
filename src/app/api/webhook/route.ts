import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { updateOrderByRefOrId } from "@/lib/supabaseAdmin";

/**
 * Webhook Serverless para notificações instantâneas do Mercado Pago (IPN / Webhooks).
 * Atualiza automaticamente o status do pedido no Supabase / Painel Admin (/admin)
 * e estorna o estoque caso um pagamento seja cancelado ou rejeitado.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Mercado Pago Webhook Recebido]:", JSON.stringify(body));

    const paymentId = body?.data?.id || body?.id;
    const directOrderRef = body?.external_reference || body?.orderReference;
    const directStatus = body?.status;

    // Permite atualização direta via chamada de teste ou consulta na API do Mercado Pago
    if (directOrderRef && directStatus) {
      const mappedStatus =
        directStatus === "approved"
          ? "approved"
          : directStatus === "cancelled" || directStatus === "rejected"
            ? "cancelled"
            : "pending";

      await updateOrderByRefOrId(String(directOrderRef), {
        paymentStatus: mappedStatus,
        fulfillmentStatus:
          mappedStatus === "approved"
            ? "separando"
            : mappedStatus === "cancelled"
              ? "cancelado"
              : "aguardando_pagamento",
      });

      return NextResponse.json({ received: true, updated: true }, { status: 200 });
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN?.trim();
    if (paymentId && mpAccessToken && mpAccessToken.length > 10) {
      const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: String(paymentId) });

      const externalRef = paymentInfo.external_reference;
      const status = paymentInfo.status;

      if (externalRef) {
        const mappedStatus =
          status === "approved"
            ? "approved"
            : status === "cancelled" || status === "rejected"
              ? "cancelled"
              : "pending";

        await updateOrderByRefOrId(externalRef, {
          paymentStatus: mappedStatus,
          fulfillmentStatus:
            mappedStatus === "approved"
              ? "separando"
              : mappedStatus === "cancelled"
                ? "cancelado"
                : "aguardando_pagamento",
          mpPaymentId: String(paymentId),
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
