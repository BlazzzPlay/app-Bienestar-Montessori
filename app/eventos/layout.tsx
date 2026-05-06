import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eventos y Noticias",
  description:
    "Descubre los próximos eventos, noticias y comunicados del programa de Bienestar Montessori.",
  alternates: {
    canonical: "/eventos",
  },
}

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return children
}
