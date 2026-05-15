import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beneficios",
  description:
    "Explora los convenios y beneficios disponibles para funcionarios del Colegio Montessori.",
  alternates: {
    canonical: "/beneficios",
  },
}

export default function BeneficiosLayout({ children }: { children: React.ReactNode }) {
  return children
}
