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

export const metadata: Metadata = {
  title:
    "Redes Adamari | Redes de Dormir em Tactel (Tradicional e c/ Mosquiteiro)",
  description:
    "O descanso leve, fresco e colorido que a sua varanda, jardim ou acampamento merece. Redes de dormir em Tactel com bolsinho integrado e punhos em corda trançada 2,50mm com proteção UV.",
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
