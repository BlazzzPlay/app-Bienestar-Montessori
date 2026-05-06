import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede al portal de beneficios del Colegio Montessori.",
  alternates: {
    canonical: "/login",
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
