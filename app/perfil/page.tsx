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
import {
  Sparkles,
  Heart,
  Star,
  Info,
  Briefcase,
  Calendar,
  Clock,
  Hash,
  Gift,
  Shield,
  Camera,
} from "lucide-react"

export default function PerfilPage() {
  const { refreshProfile } = useAuth()
  const { data, loading } = useProfile()
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

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 space-y-4 max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-3 pt-6">
            <Skeleton className="h-28 w-28 rounded-2xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </MainLayout>
    )
  }

  // ── Error / no profile ──
  if (!profile || !validateProfileData(profile)) {
    return (
      <MainLayout title="Mi Perfil">
        <div className="p-4 max-w-md mx-auto pt-12 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 space-y-3">
            <Shield className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive font-semibold">Error en los datos del perfil</p>
            <p className="text-sm text-muted-foreground">
              Los datos de tu perfil están incompletos. Contacta al administrador.
            </p>
            <Button onClick={() => window.location.reload()} variant="destructive" className="mt-2">
              Recargar Página
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // ── Profile loaded ──
  const avatarColors = [
    "from-primary to-primary/70",
    "from-secondary to-secondary/60",
    "from-primary/80 to-secondary/70",
    "from-secondary/70 to-primary/60",
  ]
  const avatarColor = avatarColors[profile.nombre_completo.length % avatarColors.length]
  const initials = profile.nombre_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <MainLayout title="Mi Perfil">
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* ── Avatar + Name Card ── */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          {/* Easter Egg */}
          {showEasterEgg && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary/80 z-10 flex items-center justify-center animate-in fade-in">
              <div className="text-center text-primary-foreground animate-bounce">
                <div className="flex justify-center space-x-2 mb-2">
                  <Sparkles className="h-8 w-8 animate-spin" />
                  <Heart className="h-8 w-8 animate-pulse" />
                  <Star className="h-8 w-8 animate-ping" />
                </div>
                <p className="text-xl font-bold">¡Eres increíble!</p>
                <p className="text-sm opacity-80">🎉 Easter egg desbloqueado 🎉</p>
              </div>
            </div>
          )}

          <CardContent className="p-0">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary to-primary/80 h-24" />

            {/* Avatar - overlapping */}
            <div className="flex justify-center -mt-14">
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nombre_completo}
                    className="h-28 w-28 rounded-2xl object-cover border-4 border-background shadow-xl"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div
                    className={`h-28 w-28 rounded-2xl bg-gradient-to-br ${avatarColor} border-4 border-background shadow-xl flex items-center justify-center`}
                  >
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}

                {/* Role badge */}
                <Badge className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground border-2 border-background font-semibold text-xs px-2 shadow-md">
                  {profile.rol}
                </Badge>
              </div>
            </div>

            {/* Name + Info */}
            <div className="text-center px-6 pt-4 pb-6">
              <h2 className="text-xl font-bold text-foreground">{profile.nombre_completo}</h2>
              {profile.cargo && (
                <p className="text-sm text-muted-foreground mt-0.5">{profile.cargo}</p>
              )}

              {/* Bienestar badge */}
              <button
                onClick={handleBienestarClick}
                className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  profile.es_bienestar
                    ? "bg-success/10 text-success border border-success/30"
                    : "bg-muted text-muted-foreground border border-border"
                } ${clickCount > 5 ? "animate-pulse" : ""}`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${profile.es_bienestar ? "fill-success text-success" : ""}`}
                />
                {profile.es_bienestar ? "Bienestar" : "Funcionario"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-4 text-center">
              <Gift className="h-6 w-6 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{beneficiosUtilizados}</p>
              <p className="text-xs text-muted-foreground">Beneficios usados</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {profile.fecha_ingreso
                  ? new Date().getFullYear() - new Date(profile.fecha_ingreso).getFullYear()
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Años en el colegio</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Personal Info ── */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Información Personal
            </h3>

            <InfoRow icon={Hash} label="RUT" value={profile.rut || "No registrado"} />
            <InfoRow icon={Briefcase} label="Cargo" value={profile.cargo || "No registrado"} />
            <InfoRow
              icon={Calendar}
              label="Ingreso"
              value={
                profile.fecha_ingreso
                  ? new Date(profile.fecha_ingreso).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada"
              }
            />
            {profile.jornada_trabajo && (
              <InfoRow icon={Clock} label="Jornada" value={profile.jornada_trabajo} />
            )}
          </CardContent>
        </Card>

        {/* ── Admin Actions ── */}
        {profile.rol === "Administrador" && (
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-5">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowCambiarFoto(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Cambiar Foto de Perfil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Non-admin info ── */}
        {profile.rol !== "Administrador" && (
          <div className="flex items-start gap-2 px-1 py-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Para cambios en tu perfil, contacta al administrador del sistema.
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
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

// ── Helpers ──

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground truncate">{value}</span>
    </div>
  )
}

function validateProfileData(profile: any): boolean {
  if (!profile) return false
  if (!profile.nombre_completo || profile.nombre_completo.trim() === "") return false
  if (!profile.rol) return false
  return true
}
