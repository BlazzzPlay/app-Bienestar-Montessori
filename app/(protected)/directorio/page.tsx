"use client"

import { useState } from "react"
import { Search, Mail, Shield, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/main-layout"
import { useDirectorio } from "@/hooks/useDirectorio"
import type { Perfil } from "@/lib/supabase"

const ROLE_COLORS: Record<string, string> = {
  Administrador: "bg-destructive/10 text-destructive border-destructive/20",
  Presidente: "bg-secondary/10 text-secondary border-secondary/20",
  Directorio: "bg-primary/10 text-primary border-primary/20",
  Beneficiario: "bg-success/10 text-success border-success/20",
  Visualizador: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
}

export default function DirectorioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: perfiles, loading, error } = useDirectorio()

  const directorioBienestar = perfiles.filter((p) =>
    ["Administrador", "Presidente", "Directorio"].includes(p.rol),
  )
  const funcionarios = perfiles.filter(
    (p) => !["Administrador", "Presidente", "Directorio"].includes(p.rol),
  )

  const filtrar = (personas: Perfil[]) =>
    personas.filter(
      (p) =>
        p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cargo?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const dirFiltrado = filtrar(directorioBienestar)
  const funcFiltrado = filtrar(funcionarios)

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
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
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Directorio">
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
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

        {/* ── Directorio ── */}
        {dirFiltrado.length > 0 && (
          <Section title="Directorio de Bienestar" icon={Shield}>
            {dirFiltrado.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </Section>
        )}

        {/* ── Funcionarios ── */}
        {funcFiltrado.length > 0 && (
          <Section title="Funcionarios" icon={Users}>
            {funcFiltrado.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </Section>
        )}

        {/* ── Empty ── */}
        {dirFiltrado.length === 0 && funcFiltrado.length === 0 && (
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
    </MainLayout>
  )
}

// ── Helpers ──

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-4 w-4 text-secondary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground/60">
          {Array.isArray(children) ? children.length : ""}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PersonaCard({ persona }: { persona: Perfil }) {
  const roleColor = ROLE_COLORS[persona.rol] || ROLE_COLORS.Visualizador
  const initials = persona.nombre_completo
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
          <AvatarImage
            src={persona.avatar_url || "/placeholder.svg"}
            alt={persona.nombre_completo}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {persona.nombre_completo}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 rounded-full ${roleColor}`}
            >
              {persona.rol}
            </Badge>
          </div>
          {persona.cargo && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{persona.cargo}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full flex-shrink-0 text-muted-foreground hover:text-secondary hover:bg-secondary/10"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `mailto:${persona.correo}`
          }}
          title={`Enviar correo a ${persona.nombre_completo}`}
        >
          <Mail className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
