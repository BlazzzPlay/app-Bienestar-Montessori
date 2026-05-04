"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import MainLayout from "@/components/main-layout"
import CambiarFotoModal from "@/components/modals/cambiar-foto-modal"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { Sparkles, Heart, Star, Info } from "lucide-react"

export default function PerfilPage() {
  const { refreshProfile } = useAuth()
  const { data, loading, error, refetch } = useProfile()
  const [showCambiarFoto, setShowCambiarFoto] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  const profile = data?.profile
  const beneficiosUtilizados = data?.beneficiosUtilizados ?? 0

  const handleBienestarClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1
      if (newCount === 10) {
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 3000)
        return 0
      }
      return newCount
    })
  }

  if (loading) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 space-y-6 max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-[120px] w-[120px] rounded-2xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Error al cargar el perfil</p>
        </div>
      </MainLayout>
    )
  }

  if (!validateProfileData(profile)) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium">Error en los datos del perfil</p>
            <p className="text-red-500 text-sm mt-2">
              Los datos de tu perfil están incompletos. Contacta al administrador.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Recargar Página
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Mi Perfil">
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl relative overflow-hidden">
          {/* Easter Egg Animation */}
          {showEasterEgg && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-90 z-10 flex items-center justify-center">
              <div className="text-center text-white animate-bounce">
                <div className="flex justify-center space-x-2 mb-2">
                  <Sparkles className="h-8 w-8 animate-spin" />
                  <Heart className="h-8 w-8 animate-pulse" />
                  <Star className="h-8 w-8 animate-ping" />
                </div>
                <p className="text-xl font-bold">¡Eres increíble!</p>
                <p className="text-sm">🎉 ¡Has desbloqueado el easter egg! 🎉</p>
              </div>
            </div>
          )}

          <CardContent className="p-6 space-y-6">
            {/* Avatar y Nombre */}
            <div className="text-center space-y-4">
              <div className="mx-auto relative max-w-[120px] max-h-[120px]">
                <img
                  src={profile.avatar_url || "/placeholder.svg?height=300&width=300&query=avatar"}
                  alt={profile.nombre_completo}
                  className="w-full h-full object-cover rounded-2xl border-4 border-primary shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=300&width=300"
                  }}
                />
                {!profile.avatar_url && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-2xl border-4 border-primary shadow-xl flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profile.nombre_completo
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{profile.nombre_completo}</h2>
                <p className="text-sm text-muted-foreground">{profile.cargo}</p>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Información Personal
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">RUT:</span>
                  <span className="text-sm font-medium text-foreground">{profile.rut}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Cargo:</span>
                  <span className="text-sm font-medium text-foreground">{profile.cargo}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Fecha de Ingreso:</span>
                  <span className="text-sm font-medium text-foreground">
                    {profile.fecha_ingreso
                      ? new Date(profile.fecha_ingreso).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No especificada"}
                  </span>
                </div>
                {profile.jornada_trabajo && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Jornada:</span>
                    <span className="text-sm font-medium text-foreground">
                      {profile.jornada_trabajo}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Indicador de Estado de Bienestar */}
            <div className="flex justify-center">
              <button
                onClick={handleBienestarClick}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                  profile.es_bienestar
                    ? "bg-gradient-to-r from-green-600 to-emerald-400 hover:from-green-700 hover:to-emerald-500 text-white shadow-green-200"
                    : "bg-gradient-to-r from-destructive to-red-500 hover:from-destructive/90 hover:to-red-600 text-white shadow-red-200"
                } ${clickCount > 5 ? "animate-pulse" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  {profile.es_bienestar ? (
                    <>
                      <Heart className="h-4 w-4" />
                      <span>Pertenece a Bienestar</span>
                    </>
                  ) : (
                    <>
                      <span>No Pertenece a Bienestar</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Información para usuarios no administradores */}
            {profile.rol !== "Administrador" && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-primary">
                    <p className="font-medium">Gestión de Perfil</p>
                    <p>
                      Para cambios en tu foto de perfil o información personal, contacta al
                      administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información del rol */}
            <div className="text-center">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs font-medium border-primary text-primary bg-primary/5"
              >
                {profile.rol}
              </Badge>
            </div>

            {/* Botones de Acción - Solo para Administrador */}
            {profile.rol === "Administrador" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent hover:border-primary transition-colors"
                  onClick={() => setShowCambiarFoto(true)}
                >
                  Cambiar Foto (Solo Admin)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <CambiarFotoModal
        isOpen={showCambiarFoto}
        onClose={() => setShowCambiarFoto(false)}
        currentAvatar={profile.avatar_url}
        userName={profile.nombre_completo}
        onSuccess={refreshProfile}
      />
    </MainLayout>
  )
}

function validateProfileData(profile: any): boolean {
  if (!profile) return false
  if (!profile.nombre_completo || profile.nombre_completo.trim() === "") return false
  if (!profile.rut || profile.rut.trim() === "") return false
  if (!profile.rol) return false
  return true
}
