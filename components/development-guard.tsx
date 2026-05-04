"use client"

import type React from "react"
import { useAuth } from "@/hooks/useAuth"
import { useDevMode } from "@/hooks/useDevMode"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, ArrowLeft } from "lucide-react"

interface DevelopmentGuardProps {
  children: React.ReactNode
}

export default function DevelopmentGuard({ children }: DevelopmentGuardProps) {
  const { hasFullAccess, loading, isAuthenticated } = useAuth()
  const isInDevelopment = useDevMode()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && isInDevelopment && !hasFullAccess()) {
      // Redirigir a perfil si no tiene acceso completo
      router.push("/perfil")
    }
  }, [hasFullAccess, isInDevelopment, loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si la app no está en desarrollo, mostrar contenido normal
  if (!isInDevelopment) {
    return <>{children}</>
  }

  // Si tiene acceso completo (Administrador), mostrar contenido normal
  if (hasFullAccess()) {
    return <>{children}</>
  }

  // Mostrar mensaje de restricción para usuarios sin acceso completo
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Construction className="h-10 w-10 text-orange-600" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Sección en Desarrollo</h2>
            <p className="text-gray-600 leading-relaxed">
              Esta funcionalidad está temporalmente restringida mientras realizamos mejoras en el
              sistema.
            </p>
            <p className="text-sm text-gray-500">
              Por el momento, puedes acceder a tu perfil personal. Pronto habilitaremos todas las
              funcionalidades.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/perfil")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir a Mi Perfil
            </Button>

            <p className="text-xs text-gray-400">
              ¿Necesitas ayuda? Contacta al administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
