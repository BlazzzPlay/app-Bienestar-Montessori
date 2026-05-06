import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ServiceWorkerUpdater from "@/components/sw-updater"
import { Toaster } from "sonner"
import { PWAStatusProvider } from "@/components/pwa-status-provider"
import { AnalyticsProviders } from "@/lib/analytics"

const inter = Inter({ subsets: ["latin"] })

const appUrl = process.env.NEXT_PUBLIC_APP_URL

export const metadata: Metadata = {
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  title: {
    default: "Bienestar Montessori",
    template: "%s | Bienestar Montessori",
  },
  description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "Bienestar Montessori",
    description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bienestar Montessori",
    description: "Aplicación de gestión de beneficios para funcionarios del Colegio Montessori",
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B2545" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bienestar Montessori" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PWAStatusProvider>
            <AnalyticsProviders>{children}</AnalyticsProviders>
          </PWAStatusProvider>
        </ThemeProvider>
        <Toaster richColors closeButton />
        <ServiceWorkerUpdater />
      </body>
    </html>
  )
}
