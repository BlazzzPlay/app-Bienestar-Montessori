"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock, Gift, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notificacion {
  id: number
  tipo: "beneficio" | "evento" | "comentario" | "sistema"
  titulo: string
  descripcion: string
  fecha: Date
  leida: boolean
  enlace?: string
}

interface NotificacionesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificacionesModal({ isOpen, onClose }: NotificacionesModalProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo - En una implementación real, estos vendrían de la API
  useEffect(() => {
    const notificacionesEjemplo: Notificacion[] = [
      {
        id: 1,
        tipo: "evento",
        titulo: "Nuevo evento: Celebración Día del Profesor",
        descripcion: "Se ha publicado un nuevo evento para el 16 de octubre. ¡No te lo pierdas!",
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        leida: false,
        enlace: "/eventos/1",
      },
      {
        id: 2,
        tipo: "beneficio",
        titulo: "Nuevo beneficio disponible",
        descripcion: "Se ha agregado un nuevo convenio con Farmacia Cruz Verde con 15% de descuento.",
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        leida: false,
        enlace: "/beneficios/2",
      },
      {
        id: 3,
        tipo: "comentario",
        titulo: "Tu comentario fue aprobado",
        descripcion: "Tu comentario en el beneficio de Restaurante El Buen Sabor ha sido aprobado y publicado.",
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
        leida: true,
        enlace: "/beneficios/1",
      },
      {
        id: 4,
        tipo: "sistema",
        titulo: "Actualización del sistema",
        descripcion: "El sistema de beneficios se actualizará el próximo lunes de 8:00 a 12:00 hrs.",
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        leida: true,
      },
      {
        id: 5,
        tipo: "evento",
        titulo: "Recordatorio: Taller de Bienestar Emocional",
        descripcion: "El taller se realizará mañana a las 15:30 en la Sala de Profesores.",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        leida: true,
        enlace: "/eventos/3",
      },
    ]

    // Simular carga
    setTimeout(() => {
      setNotificaciones(notificacionesEjemplo)
      setLoading(false)
    }, 500)
  }, [])

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida)
  const notificacionesLeidas = notificaciones.filter((n) => n.leida)

  const getIconoTipo = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "beneficio":
        return Gift
      case "evento":
        return CalendarDays
      case "comentario":
        return Users
      case "sistema":
        return Bell
      default:
        return Bell
    }
  }

  const getColorTipo = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "beneficio":
        return "bg-green-100 text-green-600"
      case "evento":
        return "bg-purple-100 text-purple-600"
      case "comentario":
        return "bg-blue-100 text-blue-600"
      case "sistema":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date()
    const diferencia = ahora.getTime() - fecha.getTime()
    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

    if (minutos < 60) {
      return `Hace ${minutos} min`
    } else if (horas < 24) {
      return `Hace ${horas}h`
    } else if (dias < 7) {
      return `Hace ${dias}d`
    } else {
      return fecha.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
    }
  }

  const marcarComoLeida = (id: number) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const handleClickNotificacion = (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id)
    }

    if (notificacion.enlace) {
      // En una implementación real, aquí navegarías a la página
      console.log(`Navegando a: ${notificacion.enlace}`)
      onClose()
    }
  }

  const NotificacionItem = ({ notificacion }: { notificacion: Notificacion }) => {
    const Icono = getIconoTipo(notificacion.tipo)

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-sm ${
          !notificacion.leida ? "border-l-4 border-l-[#005A9C] bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={() => handleClickNotificacion(notificacion)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${getColorTipo(notificacion.tipo)}`}>
              <Icono className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className={`text-sm font-medium text-gray-900 ${!notificacion.leida ? "font-semibold" : ""}`}>
                  {notificacion.titulo}
                </h4>
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{formatearFecha(notificacion.fecha)}</span>
                  {!notificacion.leida && <div className="w-2 h-2 bg-[#005A9C] rounded-full"></div>}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notificacion.descripcion}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-[#005A9C]" />
            <span>Notificaciones</span>
            {notificacionesNoLeidas.length > 0 && (
              <Badge variant="secondary" className="bg-[#005A9C] text-white text-xs">
                {notificacionesNoLeidas.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Mantente al día con las últimas actualizaciones y eventos del programa de bienestar.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005A9C]"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {/* Botón para marcar todas como leídas */}
            {notificacionesNoLeidas.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={marcarTodasComoLeidas}
                  className="text-[#005A9C] hover:text-[#004080]"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como leídas
                </Button>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {/* Notificaciones no leídas */}
                {notificacionesNoLeidas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#005A9C]" />
                      Nuevas ({notificacionesNoLeidas.length})
                    </h3>
                    {notificacionesNoLeidas.map((notificacion) => (
                      <NotificacionItem key={notificacion.id} notificacion={notificacion} />
                    ))}
                  </div>
                )}

                {/* Notificaciones leídas */}
                {notificacionesLeidas.length > 0 && (
                  <div className="space-y-3">
                    {notificacionesNoLeidas.length > 0 && <hr className="my-4" />}
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                      <Check className="h-4 w-4 mr-2 text-gray-500" />
                      Anteriores
                    </h3>
                    {notificacionesLeidas.map((notificacion) => (
                      <NotificacionItem key={notificacion.id} notificacion={notificacion} />
                    ))}
                  </div>
                )}

                {/* Estado vacío */}
                {notificaciones.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes notificaciones</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Te notificaremos cuando haya nuevos eventos o beneficios disponibles.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
