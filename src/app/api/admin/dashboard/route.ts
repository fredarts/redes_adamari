import { NextResponse } from "next/server";
import {
  getAdminDashboardAnalytics,
  updateOrderByRefOrId,
  type FulfillmentStatus,
  type PaymentStatus,
} from "@/lib/supabaseAdmin";

function checkAdminAuth(request: Request): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "adamari2026";
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === expectedPassword;
}

export async function GET(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Senha de administrador incorreta." },
        { status: 401 }
      );
    }

    const data = await getAdminDashboardAnalytics();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Admin Dashboard GET Error]:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do painel administrativo." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      orderId: string;
      paymentStatus?: PaymentStatus;
      fulfillmentStatus?: FulfillmentStatus;
      trackingCode?: string;
    };

    if (!body.orderId) {
      return NextResponse.json(
        { error: "ID ou referência do pedido é obrigatório." },
        { status: 400 }
      );
    }

    const updated = await updateOrderByRefOrId(body.orderId, {
      paymentStatus: body.paymentStatus,
      fulfillmentStatus: body.fulfillmentStatus,
      trackingCode: body.trackingCode,
    });

    const analytics = await getAdminDashboardAnalytics();

    return NextResponse.json({
      success: true,
      order: updated,
      analytics,
    });
  } catch (error) {
    console.error("[Admin Dashboard PATCH Error]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido." },
      { status: 500 }
    );
  }
}
