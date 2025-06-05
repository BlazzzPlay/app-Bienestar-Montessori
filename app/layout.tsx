import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bienestar Montessori",
  description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  generator: "v0.dev",
  manifest: "/manifest.json",
  icons: {
    icon: "https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png",
    apple: "https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bienestar Montessori",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Bienestar Montessori",
    title: "Bienestar Montessori",
    description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  },
  twitter: {
    card: "summary",
    title: "Bienestar Montessori",
    description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#005A9C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bienestar Montessori" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
