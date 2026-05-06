import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Directorio",
  description: "Encuentra contactos del equipo de Bienestar Montessori y funcionarios del colegio.",
  alternates: {
    canonical: "/directorio",
  },
}

export default function DirectorioLayout({ children }: { children: React.ReactNode }) {
  return children
}
