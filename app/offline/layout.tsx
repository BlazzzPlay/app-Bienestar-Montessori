import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "Estás navegando en modo sin conexión. Algunas funciones pueden estar limitadas.",
  alternates: {
    canonical: "/offline",
  },
}

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children
}
