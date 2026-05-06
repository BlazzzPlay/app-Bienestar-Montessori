"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "authenticated" | "admin"
}

export default function AuthGuard({ children, requiredRole = "authenticated" }: AuthGuardProps) {
  const { isAuthenticated, loading, profile, hasFullAccess } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      try {
        if (!isAuthenticated) {
          const returnUrl = encodeURIComponent(pathname)
          router.push(`/login?returnUrl=${returnUrl}`)
        } else if (requiredRole === "admin" && !hasFullAccess()) {
          toast.error("No tenés permisos para acceder a esta sección.")
          router.push("/perfil")
        }
      } catch (error) {
        console.error("Navigation error:", error)
        setAuthError("Error de navegación")
      }
    }
  }, [isAuthenticated, loading, requiredRole, hasFullAccess, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 font-medium mb-4">Error de Autenticación</p>
          <p className="text-gray-600 mb-4">{authError}</p>
          <Button
            onClick={() => {
              setAuthError(null)
              router.push("/login")
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Ir al Login
          </Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole === "admin" && !hasFullAccess()) {
    return null
  }

  return <>{children}</>
}
