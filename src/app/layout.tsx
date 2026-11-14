import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://redes-adamari.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Redes Adamari | Redes de Dormir em Tecido Tactel",
    template: "%s | Redes Adamari",
  },
  description:
    "Redes de dormir leves, frescas e resistentes em tecido Tactel. Não esquentam nas costas, secam em minutos, com bolsinho lateral e punhos em cordas 2,50mm c/ proteção UV. Compre com PIX e Cartão pelo Mercado Pago.",
  keywords: [
    "redes de dormir",
    "rede tactel",
    "rede de descanso",
    "rede com mosquiteiro",
    "rede leve camping",
    "redes adamari",
    "rede para varanda",
    "rede que seca rapido",
  ],
  authors: [{ name: "Ateliê Adamari" }],
  creator: "Ateliê Adamari",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Redes Adamari",
    title: "Redes Adamari | Redes de Dormir em Tecido Tactel",
    description:
      "Redes de dormir leves, frescas e resistentes em tecido Tactel com bolsinho integrado e punhos em cordas trançadas 2,50mm c/ UV. Escolha sua cor e tamanho!",
    images: [
      {
        url: "/images/hero-casal-jardim.jpg",
        width: 1200,
        height: 675,
        alt: "Casal descansando em Rede Adamari de Tactel no jardim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redes Adamari | Redes de Dormir em Tecido Tactel",
    description:
      "Redes de dormir leves, frescas e resistentes em tecido Tactel. 10 cores vibrantes e tamanhos M ao XGG.",
    images: ["/images/hero-casal-jardim.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF6F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2C1E18] selection:bg-amber-200 selection:text-[#2C1E18]">
        {children}
      </body>
    </html>
  );
}
