import { NextResponse } from "next/server";

function checkAdminAuth(request: Request): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "adamari2026";
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === expectedPassword;
}

interface MarketingRequestBody {
  subject: string;
  headline: string;
  messageBody: string;
  ctaText: string;
  ctaUrl: string;
  couponCode?: string;
  recipients: Array<{
    name: string;
    email: string;
  }>;
}

function buildAdamariEmailHtml(params: {
  recipientName: string;
  headline: string;
  messageBody: string;
  ctaText: string;
  ctaUrl: string;
  couponCode?: string;
}): string {
  const formattedBody = params.messageBody
    .replace(/\{nome\}/gi, params.recipientName.split(" ")[0] || "Cliente")
    .replace(/\n/g, "<br/>");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:'Helvetica Neue',Arial,sans-serif;color:#2C1E18;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#FFFFFF;border-radius:24px;border:1px solid #E6DEC8;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#2C1E18;padding:28px 32px;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F3C677;font-weight:bold;margin-bottom:6px;">
                Ateliê Adamari • Tabuleiro do Norte / CE
              </div>
              <div style="font-size:26px;font-weight:bold;color:#FFFFFF;font-family:Georgia,serif;">
                Redes Adamari
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 18px 0;font-size:22px;line-height:1.3;color:#2C1E18;font-family:Georgia,serif;">
                ${params.headline}
              </h1>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#5C4438;">
                ${formattedBody}
              </p>
              ${
                params.couponCode
                  ? `
              <div style="background-color:#FEF5EC;border:2px dashed #D95D39;border-radius:16px;padding:16px;text-align:center;margin-bottom:24px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#9A4B26;font-weight:bold;">
                  Cupom / Condição Especial
                </div>
                <div style="font-size:22px;font-weight:900;color:#D95D39;margin-top:4px;letter-spacing:2px;">
                  ${params.couponCode}
                </div>
              </div>
              `
                  : ""
              }
              <div style="text-align:center;margin:28px 0 12px 0;">
                <a href="${params.ctaUrl}" style="display:inline-block;background-color:#D95D39;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:15px 32px;border-radius:14px;">
                  ${params.ctaText || "Escolher Minha Rede no Site"}
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F4EFE6;padding:20px 32px;text-align:center;font-size:12px;color:#7A6252;border-top:1px solid #E6DEC8;">
              <strong>Redes Adamari Confecções Ltda.</strong> • Tabuleiro do Norte – Ceará<br/>
              Tecido 100% Tactel Fresco • Punhos Trançados 2,50mm c/ Proteção UV
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as MarketingRequestBody;
    const validRecipients = (body.recipients || []).filter(
      (r) => r.email && r.email.includes("@")
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: "Nenhum destinatário com e-mail válido selecionado." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    const senderEmail =
      process.env.MARKETING_FROM_EMAIL ||
      "Redes Adamari <contato@redesadamari.com.br>";

    // Se a chave RESEND_API_KEY estiver configurada, dispara via API oficial do Resend
    if (resendKey && resendKey.length > 10) {
      let sentCount = 0;
      const errors: string[] = [];

      for (const recipient of validRecipients) {
        const html = buildAdamariEmailHtml({
          recipientName: recipient.name,
          headline: body.headline,
          messageBody: body.messageBody,
          ctaText: body.ctaText,
          ctaUrl: body.ctaUrl,
          couponCode: body.couponCode,
        });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [recipient.email],
            subject: body.subject,
            html,
          }),
        });

        if (res.ok) {
          sentCount += 1;
        } else {
          const errText = await res.text();
          errors.push(`${recipient.email}: ${errText}`);
        }
      }

      return NextResponse.json({
        mode: "resend_live",
        sentCount,
        totalRequested: validRecipients.length,
        errors,
      });
    }

    // Modo Simulado / Preview (quando RESEND_API_KEY ainda não foi adicionada)
    const sampleHtml = buildAdamariEmailHtml({
      recipientName: validRecipients[0].name,
      headline: body.headline,
      messageBody: body.messageBody,
      ctaText: body.ctaText,
      ctaUrl: body.ctaUrl,
      couponCode: body.couponCode,
    });

    return NextResponse.json({
      mode: "simulation",
      sentCount: validRecipients.length,
      totalRequested: validRecipients.length,
      sampleHtml,
      notice:
        "Campanha validada e simulada com sucesso! Para envio real na caixa de entrada, adicione a chave gratuita RESEND_API_KEY nas variáveis de ambiente.",
    });
  } catch (error) {
    console.error("[Admin Marketing POST Error]:", error);
    return NextResponse.json(
      { error: "Falha ao processar disparo de e-mail marketing." },
      { status: 500 }
    );
  }
}
