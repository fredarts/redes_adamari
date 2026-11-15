import { NextResponse } from "next/server";
import {
  createManualCustomer,
  getAdminDashboardAnalytics,
  updateCustomerRecord,
  type ShippingAddressRecord,
} from "@/lib/supabaseAdmin";

function checkAdminAuth(request: Request): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "adamari2026";
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === expectedPassword;
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
      customerId: string;
      name?: string;
      email?: string;
      phone?: string;
      cpf?: string;
      address?: ShippingAddressRecord;
      notes?: string;
      tags?: string[];
      acceptsMarketing?: boolean;
    };

    if (!body.customerId) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório." },
        { status: 400 }
      );
    }

    const updated = await updateCustomerRecord(body.customerId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      cpf: body.cpf,
      address: body.address,
      notes: body.notes,
      tags: body.tags,
      acceptsMarketing: body.acceptsMarketing,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const analytics = await getAdminDashboardAnalytics();
    return NextResponse.json({
      success: true,
      customer: updated,
      analytics,
    });
  } catch (error) {
    console.error("[Admin Customers PATCH Error]:", error);
    return NextResponse.json(
      { error: "Erro ao salvar alterações do cliente." },
      { status: 500 }
    );
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

    const body = (await request.json()) as {
      name: string;
      email?: string;
      phone: string;
      cpf?: string;
      address: ShippingAddressRecord;
      notes?: string;
      tags?: string[];
    };

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Nome e WhatsApp do cliente são obrigatórios." },
        { status: 400 }
      );
    }

    const created = await createManualCustomer(body);
    const analytics = await getAdminDashboardAnalytics();

    return NextResponse.json({
      success: true,
      customer: created,
      analytics,
    });
  } catch (error) {
    console.error("[Admin Customers POST Error]:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar novo cliente." },
      { status: 500 }
    );
  }
}
