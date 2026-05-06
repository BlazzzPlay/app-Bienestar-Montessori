import type { Metadata } from "next"
import type { ReactNode } from "react"
import AuthGuard from "@/components/auth-guard"

export const metadata: Metadata = {
  title: {
    default: "Panel de Administración",
    template: "%s | Panel de Administración",
  },
  description: "Panel de administración del programa de Bienestar Montessori",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthGuard requiredRole="admin">{children}</AuthGuard>
}
