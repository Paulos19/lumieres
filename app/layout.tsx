import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Configuração das Fontes
const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({ 
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumière Festin | Haute Cuisine Digital",
  description: "Concierge gastronômico de luxo com Inteligência Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={cn(
          "min-h-screen bg-deep-900 font-sans antialiased selection:bg-gold-500 selection:text-deep-900",
          cinzel.variable,
          playfair.variable,
          lato.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}