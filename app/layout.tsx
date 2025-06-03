import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bienestar Montessori",
  description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  generator: "v0.dev",
  icons: {
    icon: "https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png",
    apple: "https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
