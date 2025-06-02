"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Añadir estado para errores de autenticación
  const [authError, setAuthError] = useState<string | null>(null)

  // Mejorar el useEffect con mejor manejo de errores:
  useEffect(() => {
    if (!loading) {
      try {
        if (requireAuth && !isAuthenticated) {
          router.push("/login")
        } else if (!requireAuth && isAuthenticated) {
          router.push("/perfil")
        }
      } catch (error) {
        console.error("Navigation error:", error)
        setAuthError("Error de navegación")
      }
    }
  }, [isAuthenticated, loading, requireAuth, router])

  // Mejorar el renderizado de carga:
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Añadir manejo de errores de autenticación:
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
            className="bg-[#005A9C] hover:bg-[#004080] text-white"
          >
            Ir al Login
          </Button>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
