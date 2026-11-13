import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import {
  PRODUCTS,
  TACTEL_COLORS,
  calculateShippingByUF,
  type ProductId,
  type SizeCode,
} from "@/data/products";

interface CheckoutItemInput {
  productId: ProductId;
  size: SizeCode;
  colorId: string;
  quantity: number;
}

interface CheckoutRequestBody {
  items: CheckoutItemInput[];
  paymentMethod: "pix" | "card";
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    uf: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { items, paymentMethod, customer, address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sua sacola está vazia." },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.phone || !address?.cep || !address?.uf) {
      return NextResponse.json(
        { error: "Por favor, preencha os dados de entrega obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Validação Server-Side dos Preços (Direto do Catálogo Estático no Servidor)
    let validatedSubtotal = 0;
    const mpItems = items.map((rawItem) => {
      const product = PRODUCTS[rawItem.productId];
      if (!product) {
        throw new Error(`Produto inválido: ${rawItem.productId}`);
      }
      const sizeSpec = product.sizes[rawItem.size];
      if (!sizeSpec) {
        throw new Error(`Tamanho inválido: ${rawItem.size}`);
      }
      const color =
        TACTEL_COLORS.find((c) => c.id === rawItem.colorId) || TACTEL_COLORS[0];

      const qty = Math.max(1, Math.min(50, Number(rawItem.quantity) || 1));
      const unitPrice =
        paymentMethod === "pix" ? sizeSpec.pricePix : sizeSpec.priceCard;

      validatedSubtotal += unitPrice * qty;

      return {
        id: `${product.id}-${sizeSpec.code}-${color.id}`,
        title: `${product.shortName} (Tam. ${sizeSpec.code}) - Cor: ${color.name}`,
        description: `${product.name} | Medida: ${sizeSpec.clothDimensions} | Punho 2,5mm c/ UV`,
        quantity: qty,
        currency_id: "BRL",
        unit_price: Number(unitPrice.toFixed(2)),
      };
    });

    // 2. Cálculo Server-Side do Frete
    const shipping = calculateShippingByUF(address.uf, validatedSubtotal);
    const totalAmount = Number((validatedSubtotal + shipping.price).toFixed(2));
    const orderReference = `ADA-${Date.now().toString().slice(-6)}`;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const mpAccessToken = process.env.MP_ACCESS_TOKEN?.trim();

    // Resumo compacto para a página de confirmação e metadados
    const orderSummaryParams = new URLSearchParams({
      ref: orderReference,
      method: paymentMethod,
      total: totalAmount.toFixed(2),
      shipping: shipping.price.toFixed(2),
      name: customer.name,
      city: `${address.city}/${address.uf}`,
      items: mpItems
        .map((i) => `${i.quantity}x ${i.title}`)
        .join(" | "),
    });

    // 3. Caso a chave MP_ACCESS_TOKEN já esteja configurada: cria Preferência Oficial no Mercado Pago
    if (mpAccessToken && mpAccessToken.length > 10) {
      const client = new MercadoPagoConfig({
        accessToken: mpAccessToken,
        options: { timeout: 8000 },
      });

      const preference = new Preference(client);
      const cleanCpf = (customer.cpf || "").replace(/\D/g, "");
      const cleanCep = (address.cep || "").replace(/\D/g, "");

      const prefResponse = await preference.create({
        body: {
          items: mpItems,
          payer: {
            name: customer.name,
            email: customer.email || "cliente@redesadamari.com.br",
            ...(cleanCpf.length === 11
              ? {
                  identification: {
                    type: "CPF",
                    number: cleanCpf,
                  },
                }
              : {}),
          },
          shipments: {
            cost: Number(shipping.price.toFixed(2)),
            mode: "not_specified",
            receiver_address: {
              zip_code: cleanCep,
              street_name: `${address.street}, ${address.number} - ${address.neighborhood} (${address.city}/${address.uf})`,
              street_number: address.number,
              apartment: address.complement || "",
              city_name: address.city,
              state_name: address.uf,
            },
          },
          payment_methods: {
            installments: paymentMethod === "pix" ? 1 : 6,
            ...(paymentMethod === "pix"
              ? {
                  excluded_payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" },
                    { id: "ticket" },
                  ],
                }
              : {}),
          },
          external_reference: orderReference,
          statement_descriptor: "REDES ADAMARI",
          metadata: {
            order_reference: orderReference,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_cpf: cleanCpf,
            payment_choice: paymentMethod,
            full_address: `${address.street}, ${address.number} ${
              address.complement ? `(${address.complement})` : ""
            } - ${address.neighborhood}, ${address.city}/${address.uf} - CEP: ${
              address.cep
            }`,
            items_summary: mpItems
              .map((i) => `${i.quantity}x ${i.title}`)
              .join("; "),
          },
          back_urls: {
            success: `${siteUrl}/pedido-confirmado?status=approved&${orderSummaryParams.toString()}`,
            pending: `${siteUrl}/pedido-confirmado?status=pending&${orderSummaryParams.toString()}`,
            failure: `${siteUrl}/pedido-confirmado?status=failure&${orderSummaryParams.toString()}`,
          },
          auto_return: "approved",
        },
      });

      return NextResponse.json({
        mode: "mercadopago_live",
        orderReference,
        checkoutUrl: prefResponse.init_point || prefResponse.sandbox_init_point,
        totalAmount,
        shippingPrice: shipping.price,
      });
    }

    // 4. Modo Demonstração Interativo (Quando MP_ACCESS_TOKEN ainda não foi preenchido no .env.local)
    return NextResponse.json({
      mode: "sandbox_preview",
      orderReference,
      totalAmount,
      subtotal: validatedSubtotal,
      shippingPrice: shipping.price,
      paymentMethod,
      items: mpItems,
      successRedirectUrl: `/pedido-confirmado?status=approved&${orderSummaryParams.toString()}`,
      pixCopyPasteCode: `00020126580014BR.GOV.BCB.PIX0136redesadamari-mp-${orderReference.toLowerCase()}520400005303986540${totalAmount.toFixed(
        2
      )}5802BR5913REDES ADAMARI6009SAO PAULO62070503***6304ABCD`,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/checkout:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar o pagamento.",
      },
      { status: 500 }
    );
  }
}

