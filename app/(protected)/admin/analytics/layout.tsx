import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analíticas",
  description: "Métricas y actividad reciente del programa de Bienestar Montessori.",
  alternates: {
    canonical: "/admin/analytics",
  },
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
