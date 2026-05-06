"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Gift,
  CalendarDays,
  MessageSquare,
  Clock,
  Shield,
  TrendingUp,
  UserPlus,
  MessageCircle,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdmin } from "@/hooks/useAdmin"
import { database } from "@/lib/database"
import AnalyticsDiagnostic from "@/components/analytics-diagnostic"

interface RecentComment {
  id: number
  contenido: string
  autor: string
  estado: string
  fecha: string
  source: "beneficio" | "publicacion"
}

interface RecentSignup {
  id: string
  nombre: string
  fecha: string
}

export default function AnalyticsPage() {
  const { estadisticas, loading: statsLoading } = useAdmin()

  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [recentSuggestions, setRecentSuggestions] = useState<
    { id: number; contenido: string; fecha: string; leido: boolean }[]
  >([])
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    const loadActivity = async () => {
      setActivityLoading(true)
      const [commentsRes, suggestionsRes, signupsRes] = await Promise.allSettled([
        database.getRecentComments(8),
        database.getSugerencias(),
        database.getRecentSignups(8),
      ])

      if (commentsRes.status === "fulfilled") {
        setRecentComments(
          (commentsRes.value.data || []).map((c) => ({
            id: c.id,
            contenido: c.contenido,
            autor: c.perfiles?.nombre_completo || "Usuario",
            estado: c.estado,
            fecha: c.fecha_creacion,
            source: (c as any).source,
          })),
        )
      }

      if (suggestionsRes.status === "fulfilled") {
        setRecentSuggestions(
          (suggestionsRes.value.data || []).slice(0, 8).map((s) => ({
            id: s.id,
            contenido: s.contenido,
            fecha: s.fecha_creacion,
            leido: s.leido,
          })),
        )
      }

      if (signupsRes.status === "fulfilled") {
        setRecentSignups(
          (signupsRes.value.data || []).map((p) => ({
            id: p.id,
            nombre: p.nombre_completo,
            fecha: p.created_at,
          })),
        )
      }

      setActivityLoading(false)
    }

    loadActivity()
  }, [])

  const loading = statsLoading || activityLoading

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">
              Métricas y actividad reciente del programa
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary-foreground/20 text-primary-foreground border-0"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              En vivo
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-4 pb-24 max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard icon={Users} label="Usuarios" value={estadisticas.totalUsuarios} />
              <SummaryCard
                icon={Shield}
                label="Bienestar"
                value={estadisticas.usuariosBienestar}
                color="text-success"
              />
              <SummaryCard
                icon={Gift}
                label="Beneficios"
                value={estadisticas.totalBeneficios}
                color="text-secondary"
              />
              <SummaryCard icon={CalendarDays} label="Eventos" value={estadisticas.totalEventos} />
              <SummaryCard
                icon={MessageSquare}
                label="Pendientes"
                value={estadisticas.comentariosPendientes}
                color="text-warning"
              />
              <SummaryCard
                icon={Clock}
                label="Sugerencias"
                value={estadisticas.sugerenciasNoLeidas}
                color="text-destructive"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Latest Comments */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Comentarios recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentComments.length > 0 ? (
                    recentComments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{c.contenido}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{c.autor}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 h-4 ${
                                c.estado === "pendiente"
                                  ? "border-warning text-warning"
                                  : c.estado === "aprobado"
                                    ? "border-success text-success"
                                    : "border-muted-foreground text-muted-foreground"
                              }`}
                            >
                              {c.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin comentarios recientes
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Latest Suggestions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-secondary" />
                    Sugerencias recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSuggestions.length > 0 ? (
                    recentSuggestions.map((s) => (
                      <div key={s.id} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{s.contenido}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 h-4 ${
                                s.leido
                                  ? "border-muted-foreground text-muted-foreground"
                                  : "border-destructive text-destructive"
                              }`}
                            >
                              {s.leido ? "Leída" : "Nueva"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin sugerencias recientes
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Signups */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-success" />
                    Registros recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSignups.length > 0 ? (
                    recentSignups.map((u) => (
                      <div key={u.id} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserPlus className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{u.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(u.fecha).toLocaleDateString("es-CL")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin registros recientes
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Vercel Analytics Diagnostic (kept as secondary) */}
            <AnalyticsDiagnostic />
          </>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color?: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
