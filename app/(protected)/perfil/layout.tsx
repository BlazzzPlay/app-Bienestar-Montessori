import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mi Perfil",
  description: "Visualiza y gestiona tu información personal en el portal de Bienestar Montessori.",
  alternates: {
    canonical: "/perfil",
  },
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return children
}
