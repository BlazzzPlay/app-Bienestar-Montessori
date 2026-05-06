import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sugerencias",
  description: "Envía sugerencias anónimas para mejorar el programa de Bienestar Montessori.",
  alternates: {
    canonical: "/sugerencias",
  },
}

export default function SugerenciasLayout({ children }: { children: React.ReactNode }) {
  return children
}
