"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  CalendarDays,
  Newspaper,
  Megaphone,
  Clock,
  MapPin,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  CalendarPlus,
} from "lucide-react"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useEvento } from "@/hooks/useEvento"
import { useAuth } from "@/hooks/useAuth"
import { database } from "@/lib/database"
import { getFileUrl } from "@/lib/pocketbase"
import { generateGoogleCalendarUrl } from "@/lib/calendar-utils"

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Evento: CalendarDays,
  Noticia: Newspaper,
  Comunicado: Megaphone,
}

const CATEGORY_COLORS: Record<string, string> = {
  Evento: "bg-secondary/10 text-secondary border-secondary/30",
  Noticia: "bg-primary/10 text-primary border-primary/30",
  Comunicado: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30",
}

export default function DetalleEventoPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { user, canModerate, isAuthenticated } = useAuth()
  const {
    event,
    comments,
    loading,
    error,
    refetch,
    submitComment,
    isAttending,
    attendanceLoading,
    confirmAttendance,
  } = useEvento(id, user?.id)
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [comentarioEnviado, setComentarioEnviado] = useState(false)
  const [mostrarPendientes, setMostrarPendientes] = useState(false)

  const comentariosFiltrados = comments.filter(
    (c) => c.estado === "aprobado" || (mostrarPendientes && c.estado === "pendiente"),
  )

  const handleEnviarComentario = async () => {
    if (nuevoComentario.trim() && user) {
      await submitComment(nuevoComentario.trim(), user.id)
      setComentarioEnviado(true)
      setNuevoComentario("")
      setTimeout(() => setComentarioEnviado(false), 3000)
    }
  }

  const handleModeracion = async (comentarioId: string, accion: "aprobar" | "rechazar") => {
    await database.moderarComentarioPublicacion(
      comentarioId,
      accion === "aprobar" ? "aprobado" : "archivado",
    )
    await refetch()
  }

  const handleConfirmarAsistencia = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para confirmar asistencia")
      router.push("/login")
      return
    }
    try {
      await confirmAttendance()
      toast.success("Asistencia confirmada")
    } catch {
      toast.error("Error al confirmar asistencia. Inténtalo de nuevo.")
    }
  }

  const handleAgregarCalendario = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar al calendario")
      router.push("/login")
      return
    }
    if (!event) return
    const url = generateGoogleCalendarUrl(event)
    window.open(url, "_blank")
  }

  const formatearFecha = (fecha: string | Date) =>
    new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(fecha))

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout title="Cargando...">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </MainLayout>
    )
  }

  // ── Error ──
  if (error || !event) {
    return (
      <MainLayout title="Detalle">
        <div className="flex flex-col items-center justify-center p-4 pt-12">
          <p className="text-muted-foreground text-lg">{error || "Publicación no encontrada"}</p>
          <Link href="/eventos" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const IconoCategoria = CATEGORY_ICON[event.categoria] || Newspaper
  const catColor = CATEGORY_COLORS[event.categoria] || ""

  return (
    <MainLayout title={event.titulo}>
      <div className="max-w-2xl mx-auto">
        {/* ── Back button ── */}
        <div className="px-4 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-9 rounded-xl text-muted-foreground hover:text-foreground -ml-2"
            aria-label="Volver a eventos"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Volver
          </Button>
        </div>

        {/* ── Hero Image ── */}
        <div className="aspect-[16/9] sm:aspect-[2/1] bg-muted">
          <img
            src={getFileUrl(event, event.imagen) || "/placeholder.svg?height=400&width=800"}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-5">
          {/* ── Title + Category ── */}
          <div className="space-y-2">
            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${catColor}`}
            >
              <IconoCategoria className="h-3.5 w-3.5" />
              {event.categoria}
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{event.titulo}</h1>
          </div>

          {/* ── Metadata ── */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatearFecha(event.fecha_publicacion)}
            </span>
            {event.categoria === "Evento" && (
              <>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.lugar}
                </span>
                {event.organizador && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {event.organizador}
                  </span>
                )}
              </>
            )}
          </div>

          {/* ── Description ── */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Descripción
            </h2>
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {event.descripcion}
            </div>
          </div>

          {/* ── Actions ── */}
          {event.categoria === "Evento" && (
            <div className="space-y-3">
              <Button
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-xl text-base"
                size="lg"
                onClick={handleConfirmarAsistencia}
                disabled={isAttending || attendanceLoading}
                aria-label={
                  isAttending ? "Asistencia ya confirmada" : "Confirmar asistencia al evento"
                }
              >
                {attendanceLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                )}
                {isAttending ? "Asistencia Confirmada" : "Confirmar Asistencia"}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                size="lg"
                onClick={handleAgregarCalendario}
                aria-label="Agregar evento a Google Calendar"
              >
                <CalendarPlus className="h-5 w-5 mr-2" />
                Agregar a Calendario
              </Button>
            </div>
          )}

          {/* ── Comments ── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentarios
                {comentariosFiltrados.length > 0 && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {comentariosFiltrados.length}
                  </span>
                )}
              </h2>
              {canModerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarPendientes(!mostrarPendientes)}
                  className={`text-xs h-8 rounded-full ${
                    mostrarPendientes ? "bg-secondary/10 text-secondary border-secondary" : ""
                  }`}
                >
                  {mostrarPendientes ? "Ocultar pendientes" : "Ver pendientes"}
                </Button>
              )}
            </div>

            {comentariosFiltrados.length > 0 ? (
              <div className="space-y-3">
                {comentariosFiltrados.map((comentario) => (
                  <Card
                    key={comentario.id}
                    className={`border-0 shadow-sm ${
                      comentario.estado === "pendiente" ? "ring-1 ring-warning/50 bg-warning/5" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage
                            src={comentario.perfiles?.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {comentario.perfiles?.nombre_completo
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-foreground truncate">
                              {comentario.perfiles?.nombre_completo || "Usuario"}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(comentario.fecha_creacion).toLocaleDateString("es-ES")}
                            </span>
                            {comentario.estado === "pendiente" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-warning/10 text-warning border-warning/30"
                              >
                                Pendiente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{comentario.contenido}</p>
                          {canModerate && comentario.estado === "pendiente" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success hover:bg-success/10 h-8 text-xs"
                                onClick={() => handleModeracion(comentario.id, "aprobar")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10 h-8 text-xs"
                                onClick={() => handleModeracion(comentario.id, "rechazar")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-xl">
                No hay comentarios aún. ¡Sé el primero!
              </p>
            )}

            {/* New comment */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Escribe tu comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Los comentarios son moderados.</p>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    disabled={!nuevoComentario.trim() || comentarioEnviado}
                    onClick={handleEnviarComentario}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    {comentarioEnviado ? "¡Enviado!" : "Publicar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
