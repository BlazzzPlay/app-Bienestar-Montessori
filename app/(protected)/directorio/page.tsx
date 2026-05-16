"use client"

import { useState } from "react"
import {
  Search,
  Mail,
  Shield,
  Users,
  Heart,
  Star,
  Award,
  Calendar,
  Briefcase,
  Hash,
  Clock,
  Cake,
  Phone,
  Info,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import MainLayout from "@/components/main-layout"
import { useDirectorio } from "@/hooks/useDirectorio"
import { getFileUrl, type Perfil } from "@/lib/pocketbase"

// ── Constants ──

const ROLE_COLORS: Record<string, string> = {
  Administrador: "bg-destructive/10 text-destructive border-destructive/20",
  Presidente: "bg-secondary/10 text-secondary border-secondary/20",
  Directorio: "bg-primary/10 text-primary border-primary/20",
  Beneficiario: "bg-success/10 text-success border-success/20",
  Visualizador: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
}

const ROLE_LABELS: Record<string, string> = {
  Administrador: "Admin",
  Presidente: "Presidente",
  Directorio: "Directorio",
  Beneficiario: "Bienestar",
  Visualizador: "Visualizador",
}

const BIENESTAR_ROLES = ["Administrador", "Presidente", "Directorio"]
const MIEMBRO_ROLES = ["Beneficiario"]
const NO_MIEMBRO_ROLES = ["Visualizador"]

const AVATAR_BG = [
  "from-[#2260FF] to-[#2260FF]/70",
  "from-secondary to-secondary/60",
  "from-primary/80 to-secondary/70",
  "from-[#2260FF]/70 to-primary/60",
]

// ── Helpers ──

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getAvatarBg(name: string): string {
  return AVATAR_BG[name.length % AVATAR_BG.length]
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ── Main Page ──

export default function DirectorioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<Perfil | null>(null)
  const { data: perfiles, loading, error } = useDirectorio()

  const filterBySection = (roles: string[]) =>
    perfiles.filter(
      (p) =>
        roles.includes(p.rol) &&
        (p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cargo?.toLowerCase().includes(searchTerm.toLowerCase())),
    )

  const equipoBienestar = filterBySection(BIENESTAR_ROLES)
  const miembrosBienestar = filterBySection(MIEMBRO_ROLES)
  const noMiembros = filterBySection(NO_MIEMBRO_ROLES)

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </MainLayout>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 max-w-2xl mx-auto text-center pt-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Directorio">
      <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl border-border bg-background"
          />
        </div>

        {/* ── Equipo de Bienestar ── */}
        {equipoBienestar.length > 0 && (
          <Section title="Equipo de Bienestar" icon={Shield} count={equipoBienestar.length}>
            {equipoBienestar.map((p) => (
              <PersonaCard key={p.id} persona={p} onClick={() => setSelectedProfile(p)} />
            ))}
          </Section>
        )}

        {/* ── Miembros de Bienestar ── */}
        {miembrosBienestar.length > 0 && (
          <Section title="Miembros de Bienestar" icon={Heart} count={miembrosBienestar.length}>
            {miembrosBienestar.map((p) => (
              <PersonaCard key={p.id} persona={p} onClick={() => setSelectedProfile(p)} />
            ))}
          </Section>
        )}

        {/* ── No Miembros ── */}
        {noMiembros.length > 0 && (
          <Section title="Personal" icon={Users} count={noMiembros.length}>
            {noMiembros.map((p) => (
              <PersonaCard key={p.id} persona={p} onClick={() => setSelectedProfile(p)} />
            ))}
          </Section>
        )}

        {/* ── Empty ── */}
        {equipoBienestar.length === 0 &&
          miembrosBienestar.length === 0 &&
          noMiembros.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                {searchTerm ? "Sin resultados" : "Directorio vacío"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? "No se encontraron personas con ese criterio."
                  : "Aún no hay personas registradas."}
              </p>
            </div>
          )}
      </div>

      {/* ── Ficha de detalle ── */}
      <Dialog
        open={!!selectedProfile}
        onOpenChange={(open) => {
          if (!open) setSelectedProfile(null)
        }}
      >
        {selectedProfile && <ProfileDetail profile={selectedProfile} />}
      </Dialog>
    </MainLayout>
  )
}

// ── Section ──

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="h-7 w-7 rounded-lg bg-[#2260FF]/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#2260FF]" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground/60 font-medium">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// ── Persona Card ──

function PersonaCard({ persona, onClick }: { persona: Perfil; onClick: () => void }) {
  const initials = getInitials(persona.nombre_completo)
  const avatarBg = getAvatarBg(persona.nombre_completo)
  const roleColor = ROLE_COLORS[persona.rol] || ROLE_COLORS.Visualizador
  const roleLabel = ROLE_LABELS[persona.rol] || persona.rol

  return (
    <Card
      className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 ring-2 ring-[#2260FF]/20">
            <AvatarImage
              src={getFileUrl(persona, persona.avatar) || ""}
              alt={persona.nombre_completo}
              className="object-cover"
            />
            <AvatarFallback
              className={`bg-gradient-to-br ${avatarBg} text-white text-sm sm:text-base font-bold`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {persona.nombre_completo}
            </h3>
            {persona.cargo && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                {persona.cargo}
              </p>
            )}

            {/* Tags row */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 rounded-full ${roleColor}`}
              >
                {roleLabel}
              </Badge>
              {persona.es_bienestar && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 rounded-full bg-[#2260FF]/5 text-[#2260FF] border-[#2260FF]/20"
                >
                  Bienestar
                </Badge>
              )}
              {/* Achievement icons placeholder — se agregarán más adelante */}
              <span className="flex items-center gap-0.5 ml-1 opacity-30">
                <Award className="h-3 w-3" />
                <Star className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-[#2260FF] hover:bg-[#2260FF]/5"
            aria-label="Favorito"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-[#2260FF] hover:bg-[#2260FF]/5"
            aria-label={`Enviar correo a ${persona.nombre_completo}`}
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `mailto:${persona.email}`
            }}
          >
            <Mail className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Badge className="bg-[#2260FF]/10 text-[#2260FF] border-0 text-[10px] font-normal px-2 py-0.5">
            {persona.rol === "Administrador" || persona.rol === "Presidente"
              ? "Dirección"
              : persona.rol === "Directorio"
                ? "Equipo"
                : persona.es_bienestar
                  ? "Miembro"
                  : "Personal"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Profile Detail Modal ──

function ProfileDetail({ profile }: { profile: Perfil }) {
  const initials = getInitials(profile.nombre_completo)
  const avatarBg = getAvatarBg(profile.nombre_completo)
  const roleColor = ROLE_COLORS[profile.rol] || ROLE_COLORS.Visualizador

  return (
    <DialogContent
      className="sm:max-w-md rounded-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto"
      aria-describedby={undefined}
    >
      <DialogClose className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </DialogClose>

      {/* Header gradient */}
      <div className="bg-gradient-to-br from-[#2260FF] to-[#2260FF]/60 h-28 rounded-t-2xl" />

      {/* Avatar overlapping */}
      <div className="flex justify-center -mt-14 relative z-0">
        <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
          <AvatarImage
            src={getFileUrl(profile, profile.avatar) || ""}
            alt={profile.nombre_completo}
            className="object-cover"
          />
          <AvatarFallback className={`bg-gradient-to-br ${avatarBg} text-white text-3xl font-bold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name + Role */}
      <div className="text-center px-6 pt-3 pb-5">
        <DialogTitle className="text-xl font-bold text-foreground">
          {profile.nombre_completo}
        </DialogTitle>
        {profile.cargo && <p className="text-sm text-muted-foreground mt-0.5">{profile.cargo}</p>}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-full ${roleColor}`}>
            {profile.rol}
          </Badge>
          {profile.es_bienestar && (
            <Badge
              variant="outline"
              className="text-xs px-2.5 py-0.5 rounded-full bg-[#2260FF]/5 text-[#2260FF] border-[#2260FF]/20"
            >
              Bienestar
            </Badge>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="px-6 pb-6 space-y-4">
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Información Personal
          </h4>

          <InfoRowDetail icon={Hash} label="RUT" value={profile.rut || "No registrado"} />
          <InfoRowDetail
            icon={Cake}
            label="Nacimiento"
            value={formatDate(profile.fecha_nacimiento)}
          />
          <InfoRowDetail icon={Briefcase} label="Cargo" value={profile.cargo || "No registrado"} />
          <InfoRowDetail
            icon={Calendar}
            label="Ingreso"
            value={formatDate(profile.fecha_ingreso)}
          />
          <InfoRowDetail
            icon={Clock}
            label="Jornada"
            value={profile.jornada_trabajo || "No especificada"}
          />
          {profile.taller && <InfoRowDetail icon={Star} label="Taller" value={profile.taller} />}
          {profile.telefono && (
            <InfoRowDetail icon={Phone} label="Teléfono" value={profile.telefono} />
          )}
        </div>

        {/* Logros y medallas — placeholder para futuro */}
        <div className="bg-muted/30 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Logros y Medallas
          </h4>
          <div className="flex items-center justify-center gap-6 py-4 text-muted-foreground/40">
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-[10px]">Próximamente</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
              <span className="text-[10px]">Próximamente</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-[10px]">Próximamente</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1 rounded-xl bg-[#2260FF] hover:bg-[#2260FF]/90"
            onClick={() => {
              window.location.href = `mailto:${profile.email}`
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Enviar Correo
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

// ── Info Row for Detail ──

function InfoRowDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Icon className="h-4 w-4 text-[#2260FF] flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground truncate">{value}</span>
    </div>
  )
}
