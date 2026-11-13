import { NextResponse } from "next/server";

/**
 * Webhook Serverless para notificações instantâneas do Mercado Pago (IPN / Webhooks).
 * Sem banco de dados: os dados completos já ficam salvos nos metadados da operação no Mercado Pago,
 * e aqui você pode opcionalmente disparar um alerta por e-mail (ex: Resend) quando o status for 'approved'.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Mercado Pago Webhook Recebido]:", JSON.stringify(body));

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}

