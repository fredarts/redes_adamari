import { NextResponse } from "next/server";
import { getAllInventory, updateInventoryUnits } from "@/lib/supabaseAdmin";

function checkAdminAuth(request: Request): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "adamari2026";
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === expectedPassword;
}

export async function GET() {
  try {
    const { items, stockMap } = await getAllInventory();
    return NextResponse.json(
      {
        stockMap,
        items,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[Inventory GET Error]:", error);
    return NextResponse.json(
      { error: "Falha ao consultar estoque." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Acesso não autorizado ao controle de estoque." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      updates?: Array<{
        sku: string;
        stockQuantity: number;
        lowStockThreshold?: number;
      }>;
    };

    if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma atualização de estoque enviada." },
        { status: 400 }
      );
    }

    await updateInventoryUnits(body.updates);
    const { items, stockMap } = await getAllInventory();

    return NextResponse.json({
      success: true,
      stockMap,
      items,
    });
  } catch (error) {
    console.error("[Inventory PUT Error]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar estoque." },
      { status: 500 }
    );
  }
}
