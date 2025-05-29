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
import Link from "next/link"
import { useParams } from "next/navigation"

type Categoria = "Evento" | "Noticia"

interface Comentario {
  id: number
  usuario: {
    nombre: string
    avatar: string
  }
  fecha: string
  contenido: string
  estado: "pendiente" | "aprobado" | "rechazado"
}

export default function DetalleEventoPage() {
  const params = useParams()
  const id = params.id as string
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [comentarioEnviado, setComentarioEnviado] = useState(false)
  const [mostrarPendientes, setMostrarPendientes] = useState(false)
  const esAdministrador = true // En una implementación real, esto vendría de un contexto de autenticación

  // Datos de ejemplo - En una implementación real, estos datos vendrían de una API
  const publicacion = {
    id: Number.parseInt(id),
    titulo: "Celebración Día del Profesor",
    descripcion:
      "Te invitamos a participar en la celebración del Día del Profesor. Habrá un almuerzo especial y actividades de reconocimiento para todo el equipo docente. El evento se realizará en el salón principal del colegio y contará con la presencia de autoridades educativas locales.\n\nLa jornada incluirá:\n- Almuerzo de camaradería\n- Entrega de reconocimientos por años de servicio\n- Presentación artística de los estudiantes\n- Sorteo de premios y regalos\n\nEsperamos contar con tu valiosa presencia en esta importante celebración.",
    fecha: new Date("2025-10-16T13:00:00"),
    categoria: "Evento" as Categoria,
    lugar: "Salón Principal, Colegio Montessori",
    organizador: "Comité de Bienestar",
    imagen: "/placeholder.svg?height=300&width=600",
  }

  const comentarios: Comentario[] = [
    {
      id: 1,
      usuario: {
        nombre: "Ana Martínez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      fecha: "2 días atrás",
      contenido: "¡Excelente iniciativa! Estaré presente en la celebración.",
      estado: "aprobado",
    },
    {
      id: 2,
      usuario: {
        nombre: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      fecha: "1 semana atrás",
      contenido: "¿Podemos confirmar asistencia con anticipación? Me gustaría saber si puedo llevar a un acompañante.",
      estado: "aprobado",
    },
    {
      id: 3,
      usuario: {
        nombre: "Laura Fernández",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      fecha: "3 días atrás",
      contenido: "¿A qué hora termina el evento? Tengo clases en la tarde.",
      estado: "pendiente",
    },
  ]

  const comentariosFiltrados = comentarios.filter(
    (comentario) => comentario.estado === "aprobado" || (mostrarPendientes && comentario.estado === "pendiente"),
  )

  const handleEnviarComentario = () => {
    if (nuevoComentario.trim()) {
      // Aquí iría la lógica para enviar el comentario a la base de datos
      setComentarioEnviado(true)
      setNuevoComentario("")

      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setComentarioEnviado(false)
      }, 3000)
    }
  }

  const handleModeracion = (comentarioId: number, accion: "aprobar" | "rechazar") => {
    // Aquí iría la lógica para actualizar el estado del comentario en la base de datos
    console.log(`Comentario ${comentarioId} ${accion === "aprobar" ? "aprobado" : "rechazado"}`)
  }

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
  }

  const IconoCategoria = publicacion.categoria === "Evento" ? CalendarCheck : Newspaper
  const colorCategoria =
    publicacion.categoria === "Evento"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-gray-100 text-gray-800 border-gray-200"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de regreso */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <Link href="/eventos">
          <Button variant="ghost" size="sm" className="p-2 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          {publicacion.categoria === "Evento" ? "Detalle del Evento" : "Detalle de la Noticia"}
        </h1>
      </header>

      <div className="pb-6">
        {/* Imagen hero */}
        <div className="aspect-video bg-gray-200">
          <img
            src={publicacion.imagen || "/placeholder.svg"}
            alt={publicacion.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-6">
          {/* Título y categoría */}
          <div className="space-y-3">
            <Badge
              variant="outline"
              className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${colorCategoria}`}
            >
              <IconoCategoria className="h-3 w-3 mr-1" />
              <span>{publicacion.categoria}</span>
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900">{publicacion.titulo}</h1>
          </div>

          {/* Metadatos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatearFecha(publicacion.fecha)}</span>
            </div>

            {publicacion.categoria === "Evento" && (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{publicacion.lugar}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Organizado por: {publicacion.organizador}</span>
                </div>
              </>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">{publicacion.descripcion}</div>
          </div>

          {/* Botones de acción */}
          {publicacion.categoria === "Evento" && (
            <div className="flex flex-col space-y-3">
              <Button className="w-full h-12 bg-[#005A9C] hover:bg-[#004080] text-white font-medium rounded-lg">
                Confirmar Asistencia
              </Button>
              <Button variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50">
                Agregar a Calendario
              </Button>
            </div>
          )}

          {/* Comentarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
                Comentarios
              </h2>

              {/* Toggle para mostrar comentarios pendientes (solo para administradores) */}
              {esAdministrador && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarPendientes(!mostrarPendientes)}
                  className={mostrarPendientes ? "bg-blue-50 text-[#005A9C] border-[#005A9C]" : ""}
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
                    className={comentario.estado === "pendiente" ? "border-amber-300 bg-amber-50" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={comentario.usuario.avatar || "/placeholder.svg"}
                            alt={comentario.usuario.nombre}
                          />
                          <AvatarFallback>
                            {comentario.usuario.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{comentario.usuario.nombre}</span>
                              <span className="text-sm text-gray-500">{comentario.fecha}</span>
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
                          <p className="text-gray-600">{comentario.contenido}</p>

                          {/* Botones de moderación (solo para administradores) */}
                          {esAdministrador && comentario.estado === "pendiente" && (
                            <div className="flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#28a745] border-[#28a745] hover:bg-green-50"
                                onClick={() => handleModeracion(comentario.id, "aprobar")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#dc3545] border-[#dc3545] hover:bg-red-50"
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
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
              )}
            </div>

            {/* Formulario para nuevo comentario */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Agregar comentario</h3>
                <Textarea
                  placeholder="Escribe tu comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Los comentarios son moderados antes de ser publicados.</p>
                  <Button
                    className="bg-[#005A9C] hover:bg-[#004080] text-white"
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
  )
}
