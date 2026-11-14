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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://redes-adamari.fredericomonteiromendesmaia.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Redes Adamari | Redes de Dormir em Tactel (Tradicional e c/ Mosquiteiro)",
    template: "%s | Redes Adamari",
  },
  description:
    "Compre direto da fábrica em Tabuleiro do Norte - CE: Redes de dormir em tecido Tactel leves, frescas e resistentes em 10 cores vibrantes e tamanhos M, G, GG e XGG. Punhos em corda 2,50mm c/ proteção UV. Pague no PIX com desconto ou Cartão.",
  keywords: [
    "redes de dormir",
    "rede de dormir tactel",
    "rede tactel",
    "rede com mosquiteiro",
    "rede de dormir com mosquiteiro",
    "rede tactel casal",
    "redes adamari",
    "ateliê adamari",
    "redes tabuleiro do norte",
    "rede leve para camping",
    "rede para varanda e piscina",
    "rede que seca rápido",
  ],
  authors: [{ name: "Ateliê Adamari — Tabuleiro do Norte, CE" }],
  creator: "Ateliê Adamari",
  publisher: "Redes Adamari",
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    title:
      "Redes Adamari | Redes de Dormir em Tecido Tactel (Tradicional e c/ Mosquiteiro)",
    description:
      "Redes de dormir leves, frescas e resistentes em tecido Tactel com bolsinho integrado e punhos em cordas trançadas 2,50mm c/ UV. Escolha sua cor e tamanho!",
    images: [
      {
        url: `${siteUrl}/images/hero-casal-jardim.jpg`,
        secureUrl: `${siteUrl}/images/hero-casal-jardim.jpg`,
        width: 1200,
        height: 675,
        type: "image/jpeg",
        alt: "Casal descansando em Rede Adamari de Tactel no jardim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redes Adamari | Redes de Dormir em Tecido Tactel",
    description:
      "Redes de dormir leves, frescas e resistentes em tecido Tactel. 10 cores vibrantes e tamanhos M ao XGG.",
    images: [`${siteUrl}/images/hero-casal-jardim.jpg`],
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
