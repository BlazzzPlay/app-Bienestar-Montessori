import type { Metadata } from "next"
import type { ReactNode } from "react"
import AuthGuard from "@/components/auth-guard"

export const metadata: Metadata = {
  title: {
    absolute: "Bienestar Montessori",
  },
  description: "Portal de beneficios para funcionarios del Colegio Montessori",
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard requiredRole="authenticated">{children}</AuthGuard>
}
