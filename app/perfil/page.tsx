"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/main-layout"
import CambiarFotoModal from "@/components/modals/cambiar-foto-modal"
import { useAuth } from "@/hooks/useAuth"
import { database } from "@/lib/database"
import { Sparkles, Heart, Star } from "lucide-react"
import { Info } from "lucide-react"

export default function PerfilPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [showCambiarFoto, setShowCambiarFoto] = useState(false)
  const [beneficiosUtilizados, setBeneficiosUtilizados] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  // Añadir estados para manejo de errores
  const [profileError, setProfileError] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Función para validar datos del perfil
  const validateProfileData = (profile: any): boolean => {
    if (!profile) return false
    if (!profile.nombre_completo || profile.nombre_completo.trim() === "") return false
    if (!profile.rut || profile.rut.trim() === "") return false
    if (!profile.rol) return false
    return true
  }

  // Mejorar el useEffect para cargar estadísticas:
  useEffect(() => {
    if (user) {
      setStatsLoading(true)
      setProfileError(null)

      // Obtener estadísticas del usuario con manejo de errores
      database
        .getEstadisticasUsuario(user.id)
        .then(({ beneficiosUtilizados, error }) => {
          if (error) {
            console.error("Error loading user stats:", error)
            setProfileError("Error al cargar estadísticas")
            setBeneficiosUtilizados(0)
          } else {
            setBeneficiosUtilizados(beneficiosUtilizados)
          }
        })
        .catch((error) => {
          console.error("Unexpected error loading stats:", error)
          setProfileError("Error inesperado al cargar estadísticas")
          setBeneficiosUtilizados(0)
        })
        .finally(() => {
          setStatsLoading(false)
        })
    }
  }, [user])

  const handleBienestarClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1
      if (newCount === 10) {
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 3000)
        return 0 // Reset counter
      }
      return newCount
    })
  }

  if (loading) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C]"></div>
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 text-center">
          <p className="text-gray-500">Error al cargar el perfil</p>
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
            <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
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
              <div className="w-[300px] h-[300px] mx-auto relative">
                <img
                  src={profile.avatar_url || "/placeholder.svg?height=300&width=300&query=avatar"}
                  alt={profile.nombre_completo}
                  className="w-full h-full object-cover rounded-2xl border-4 border-[#005A9C] shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=300&width=300"
                  }}
                />
                {!profile.avatar_url && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#005A9C] to-[#004080] rounded-2xl border-4 border-[#005A9C] shadow-xl flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">
                      {profile.nombre_completo
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.nombre_completo}</h2>
                <p className="text-sm text-gray-600">{profile.cargo}</p>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información Personal</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">RUT:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.rut}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Cargo:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.cargo}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
                  <span className="text-sm font-medium text-gray-900">
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
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Jornada:</span>
                    <span className="text-sm font-medium text-gray-900">{profile.jornada_trabajo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas - Temporalmente oculto hasta implementación completa
            <div className="text-center space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Estadísticas</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                {statsLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005A9C]"></div>
                  </div>
                ) : profileError ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-1">--</div>
                    <div className="text-xs text-red-600">{profileError}</div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-[#005A9C] mb-1">{beneficiosUtilizados}</div>
                    <div className="text-sm text-gray-600">Beneficios Utilizados</div>
                  </>
                )}
              </div>
            </div>
            */}

            {/* Indicador de Estado de Bienestar */}
            <div className="flex justify-center">
              <button
                onClick={handleBienestarClick}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                  profile.es_bienestar
                    ? "bg-gradient-to-r from-[#28a745] to-[#20c997] hover:from-[#218838] hover:to-[#1ea085] text-white shadow-green-200"
                    : "bg-gradient-to-r from-[#dc3545] to-[#e74c3c] hover:from-[#c82333] hover:to-[#dc2626] text-white shadow-red-200"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Gestión de Perfil</p>
                    <p>
                      Para cambios en tu foto de perfil o información personal, contacta al administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información del rol */}
            <div className="text-center">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs font-medium border-[#005A9C] text-[#005A9C] bg-blue-50"
              >
                {profile.rol}
              </Badge>
            </div>

            {/* Botones de Acción - Solo para Administrador */}
            {profile.rol === "Administrador" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 hover:border-[#005A9C] transition-colors"
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
