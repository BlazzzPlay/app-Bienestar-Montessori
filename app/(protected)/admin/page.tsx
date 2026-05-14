"use client"

import { useState } from "react"
import {
  Users,
  Gift,
  CalendarDays,
  MessageSquare,
  Clock,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdmin } from "@/hooks/useAdmin"
import { useRouter } from "next/navigation"
import ComentariosTab from "@/components/admin/tabs/comentarios-tab"
import AsistenciaTab from "@/components/admin/tabs/asistencia-tab"
import EstadisticasUsoTab from "@/components/admin/tabs/estadisticas-uso-tab"
import NotificationCompose from "@/components/admin/notification-compose"

export default function AdminPage() {
  const { estadisticas, eventosConAsistencia, topBeneficios, loading, exportUsers, refetch } =
    useAdmin()
  const router = useRouter()
  const [composeOpen, setComposeOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-primary text-primary-foreground px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">
              Gestioná el programa de Bienestar Montessori
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/perfil")}
            className="hidden sm:inline-flex"
          >
            Volver al Perfil
          </Button>
        </div>
      </header>

      <div className="p-4 pb-24 max-w-4xl mx-auto space-y-5">
        {/* ── Loading ── */}
        {loading ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard icon={Users} value={estadisticas.totalUsuarios} label="Usuarios" />
              <StatCard
                icon={Shield}
                value={estadisticas.usuariosBienestar}
                label="En Bienestar"
                color="text-success"
              />
              <StatCard icon={Gift} value={estadisticas.totalBeneficios} label="Beneficios" />
              <StatCard
                icon={CalendarDays}
                value={estadisticas.totalEventos}
                label="Eventos"
                color="text-secondary"
              />
              <StatCard
                icon={MessageSquare}
                value={estadisticas.comentariosPendientes}
                label="Comentarios"
                color="text-warning"
              />
              <StatCard
                icon={Clock}
                value={estadisticas.sugerenciasNoLeidas}
                label="Sugerencias"
                color="text-destructive"
              />
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="usuarios">
              <TabsList className="w-full grid grid-cols-5 bg-muted rounded-xl p-1">
                <TabsTrigger value="usuarios" className="rounded-lg text-xs sm:text-sm">
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="beneficios" className="rounded-lg text-xs sm:text-sm">
                  Beneficios
                </TabsTrigger>
                <TabsTrigger value="eventos" className="rounded-lg text-xs sm:text-sm">
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="comentarios" className="rounded-lg text-xs sm:text-sm">
                  Comentarios
                </TabsTrigger>
                <TabsTrigger value="sugerencias" className="rounded-lg text-xs sm:text-sm">
                  Sugerencias
                </TabsTrigger>
              </TabsList>

              <TabsContent value="usuarios" className="mt-4 space-y-3">
                <QuickAction
                  icon={Users}
                  title="Gestión de Usuarios"
                  desc="Ver, editar y gestionar todos los usuarios del sistema"
                  action="Ver Todos"
                  href="/directorio"
                />
                <QuickAction
                  icon={Shield}
                  title="Usuarios de Bienestar"
                  desc="Gestionar quién pertenece al programa de bienestar"
                  badge={`${estadisticas.usuariosBienestar} activos`}
                  badgeColor="bg-success/10 text-success"
                />
              </TabsContent>

              <TabsContent value="beneficios" className="mt-4 space-y-3">
                <QuickAction
                  icon={Gift}
                  title="Beneficios Activos"
                  desc="Gestionar convenios y descuentos disponibles"
                  action="Ver Todos"
                  href="/beneficios"
                />
                <EstadisticasUsoTab beneficios={topBeneficios} />
              </TabsContent>

              <TabsContent value="eventos" className="mt-4 space-y-3">
                <QuickAction
                  icon={CalendarDays}
                  title="Eventos y Noticias"
                  desc="Crear y gestionar eventos del programa"
                  action="Ver Todos"
                  href="/eventos"
                />
                <AsistenciaTab eventos={eventosConAsistencia} />
              </TabsContent>

              <TabsContent value="comentarios" className="mt-4">
                <ComentariosTab onModerate={refetch} />
              </TabsContent>

              <TabsContent value="sugerencias" className="mt-4 space-y-3">
                <QuickAction
                  icon={MessageSquare}
                  title="Sugerencias Recibidas"
                  desc="Revisar y gestionar sugerencias anónimas"
                  badge={
                    estadisticas.sugerenciasNoLeidas > 0
                      ? `${estadisticas.sugerenciasNoLeidas} sin leer`
                      : "Todas leídas"
                  }
                  badgeColor={
                    estadisticas.sugerenciasNoLeidas > 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }
                />
              </TabsContent>
            </Tabs>

            {/* ── Quick Actions ── */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickBtn
                    icon={BarChart3}
                    label="Reportes"
                    onClick={() => router.push("/admin/analytics")}
                  />
                  <QuickBtn icon={Settings} label="Configuración" />
                  <QuickBtn icon={Users} label="Exportar" onClick={exportUsers} />
                  <QuickBtn
                    icon={MessageSquare}
                    label="Notificaciones"
                    onClick={() => setComposeOpen(true)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <NotificationCompose isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  )
}

// ── Components ──

function StatCard({
  icon: Icon,
  value,
  label,
  color = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
  color?: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  action,
  href,
  badge,
  badgeColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  action?: string
  href?: string
  badge?: string
  badgeColor?: string
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{desc}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          {action && (
            <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" asChild>
              <a href={href}>{action}</a>
            </Button>
          )}
          {badge && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      className="h-16 flex flex-col gap-1 rounded-xl border-border hover:bg-muted"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}
