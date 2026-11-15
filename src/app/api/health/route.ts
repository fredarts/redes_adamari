import { NextResponse } from "next/server";
import { getAllInventory, isSupabaseConfigured } from "@/lib/supabaseAdmin";

/**
 * Rota leve de Keep-Alive (/api/health)
 * Mantém o banco gratuito do Supabase acordado (evitando pausa por inatividade de 7 dias)
 * e retorna o status operacional da loja e do estoque.
 */
export async function GET() {
  try {
    const { items } = await getAllInventory();
    return NextResponse.json({
      status: "ok",
      store: "Redes Adamari (Tabuleiro do Norte - CE)",
      supabaseConnected: isSupabaseConfigured(),
      trackedSkus: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "degraded" }, { status: 500 });
  }
}
