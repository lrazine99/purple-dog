import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { CategoryProvider } from "@/contexts/CategoryContext";
import GenericHeader from "@/components/header/GenericHeader";

const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Purple Dog - La plateforme pour vendre vos objets de valeur",
  description:
    "Vendez vos objets de valeur à des tiers de confiance avec Purple Dog",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${_playfair.variable} font-sans antialiased`}>
        <Providers>
          <GenericHeader />
          <CategoryProvider>{children}</CategoryProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
