"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CalendarCheck,
  Newspaper,
  Clock,
  MapPin,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEvento } from "@/hooks/useEvento"
import { useAuth } from "@/hooks/useAuth"
import { getCategoryColor } from "@/lib/tag-utils"
import { database } from "@/lib/database"
import DevelopmentGuard from "@/components/development-guard"

export default function DetalleEventoPage() {
  const params = useParams()
  const id = params.id as string
  const { event, comments, loading, error, refetch, submitComment } = useEvento(id)
  const { user, canModerate } = useAuth()
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [comentarioEnviado, setComentarioEnviado] = useState(false)
  const [mostrarPendientes, setMostrarPendientes] = useState(false)

  const comentariosFiltrados = comments.filter(
    (comentario) =>
      comentario.estado === "aprobado" || (mostrarPendientes && comentario.estado === "pendiente"),
  )

  const handleEnviarComentario = async () => {
    if (nuevoComentario.trim() && user) {
      try {
        await submitComment(nuevoComentario.trim(), user.id)
        setComentarioEnviado(true)
        setNuevoComentario("")
        setTimeout(() => {
          setComentarioEnviado(false)
        }, 3000)
      } catch (err) {
        console.error("Error enviando comentario:", err)
      }
    }
  }

  const handleModeracion = async (comentarioId: number, accion: "aprobar" | "rechazar") => {
    try {
      await database.moderarComentarioPublicacion(
        comentarioId,
        accion === "aprobar" ? "aprobado" : "archivado",
      )
      await refetch()
    } catch (err) {
      console.error("Error moderando comentario:", err)
    }
  }

  const formatearFecha = (fecha: string | Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(fecha))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-4 space-y-6 w-full max-w-2xl">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{error || "Evento no encontrado"}</p>
      </div>
    )
  }

  const IconoCategoria = event.categoria === "Evento" ? CalendarCheck : Newspaper

  return (
    <DevelopmentGuard>
      <div className="min-h-screen bg-background">
        {/* Header con botón de regreso */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center">
          <Link href="/eventos">
            <Button variant="ghost" size="sm" className="p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">
            {event.categoria === "Evento" ? "Detalle del Evento" : "Detalle de la Noticia"}
          </h1>
        </header>

        <div className="pb-6">
          {/* Imagen hero */}
          <div className="aspect-video bg-muted">
            <img
              src={event.imagen_url || "/placeholder.svg"}
              alt={event.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-6">
            {/* Título y categoría */}
            <div className="space-y-3">
              <Badge
                variant="outline"
                className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getCategoryColor(event.categoria)}`}
              >
                <IconoCategoria className="h-3 w-3 mr-1" />
                <span>{event.categoria}</span>
              </Badge>
              <h1 className="text-2xl font-bold text-foreground">{event.titulo}</h1>
            </div>

            {/* Metadatos */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatearFecha(event.fecha_publicacion)}</span>
              </div>

              {event.categoria === "Evento" && (
                <>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.lugar}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Organizado por: {event.organizador}</span>
                  </div>
                </>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Descripción</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.descripcion}
              </div>
            </div>

            {/* Botones de acción */}
            {event.categoria === "Evento" && (
              <div className="flex flex-col space-y-3">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg">
                  Confirmar Asistencia
                </Button>
                <Button variant="outline" className="w-full h-12 border-border hover:bg-accent">
                  Agregar a Calendario
                </Button>
              </div>
            )}

            {/* Comentarios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                  Comentarios
                </h2>

                {/* Toggle para mostrar comentarios pendientes (solo para administradores) */}
                {canModerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarPendientes(!mostrarPendientes)}
                    className={mostrarPendientes ? "bg-primary/5 text-primary border-primary" : ""}
                  >
                    {mostrarPendientes ? "Ocultar pendientes" : "Ver pendientes"}
                  </Button>
                )}
              </div>

              {/* Comentarios existentes */}
              <div className="space-y-4">
                {comentariosFiltrados.length > 0 ? (
                  comentariosFiltrados.map((comentario) => (
                    <Card
                      key={comentario.id}
                      className={
                        comentario.estado === "pendiente" ? "border-amber-300 bg-amber-50" : ""
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={comentario.perfiles?.avatar_url || "/placeholder.svg"}
                              alt={comentario.perfiles?.nombre_completo || "Usuario"}
                            />
                            <AvatarFallback>
                              {comentario.perfiles?.nombre_completo
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">
                                  {comentario.perfiles?.nombre_completo || "Usuario"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(comentario.fecha_creacion).toLocaleDateString()}
                                </span>
                                {comentario.estado === "pendiente" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-100 text-amber-800 border-amber-200 text-xs"
                                  >
                                    Pendiente de moderación
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{comentario.contenido}</p>

                            {/* Botones de moderación (solo para administradores) */}
                            {canModerate && comentario.estado === "pendiente" && (
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleModeracion(comentario.id, "aprobar")}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                  onClick={() => handleModeracion(comentario.id, "rechazar")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 bg-muted rounded-lg border border-border">
                    <p className="text-muted-foreground">
                      No hay comentarios aún. ¡Sé el primero en comentar!
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario para nuevo comentario */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium text-foreground">Agregar comentario</h3>
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Los comentarios son moderados antes de ser publicados.
                    </p>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!nuevoComentario.trim() || comentarioEnviado}
                      onClick={handleEnviarComentario}
                    >
                      {comentarioEnviado ? "¡Enviado!" : "Publicar Comentario"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DevelopmentGuard>
  )
}
