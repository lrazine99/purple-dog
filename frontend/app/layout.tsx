import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Geist } from "next/font/google"
import "./globals.css"

const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const _geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Purple Dog - La plateforme pour vendre vos objets de valeur",
  description: "Vendez vos objets de valeur à des tiers de confiance avec Purple Dog",
  generator: "v0.app",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${_playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
