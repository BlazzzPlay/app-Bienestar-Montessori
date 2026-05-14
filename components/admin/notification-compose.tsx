"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { database } from "@/lib/database"
import { toast } from "sonner"

interface NotificationComposeProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCompose({ isOpen, onClose }: NotificationComposeProps) {
  const [titulo, setTitulo] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [tipo, setTipo] = useState("sistema")
  const [prioridad, setPrioridad] = useState("normal")
  const [targetRole, setTargetRole] = useState<string>("todos")
  const [actionUrl, setActionUrl] = useState("")
  const [actionText, setActionText] = useState("")
  const [sending, setSending] = useState(false)

  const resetForm = () => {
    setTitulo("")
    setMensaje("")
    setTipo("sistema")
    setPrioridad("normal")
    setTargetRole("todos")
    setActionUrl("")
    setActionText("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !mensaje.trim()) {
      toast.error("Completá el título y el mensaje")
      return
    }

    setSending(true)
    const role = targetRole === "todos" ? null : targetRole
    const { error } = await database.broadcastNotificacion(
      titulo.trim(),
      mensaje.trim(),
      tipo,
      role,
      prioridad,
      null,
      null,
      actionUrl.trim() || null,
      actionText.trim() || null,
    )
    setSending(false)

    if (error) {
      toast.error("Error al enviar la notificación", {
        description: error.message,
      })
    } else {
      toast.success("Notificación enviada", {
        description:
          targetRole === "todos"
            ? "Se envió a todos los usuarios."
            : `Se envió a los usuarios con rol ${targetRole}.`,
      })
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <span>Enviar Notificación</span>
          </DialogTitle>
          <DialogDescription>
            Componé una notificación para enviar a los usuarios del sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Ej: Nuevo evento disponible"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              placeholder="Escribí el contenido de la notificación..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beneficio">Beneficio</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="comentario">Comentario</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="bienvenida">Bienvenida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger id="prioridad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">Destinatarios</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger id="targetRole">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los usuarios</SelectItem>
                <SelectItem value="Administrador">Administradores</SelectItem>
                <SelectItem value="Presidente">Presidentes</SelectItem>
                <SelectItem value="Directorio">Directorio</SelectItem>
                <SelectItem value="Beneficiario">Beneficiarios</SelectItem>
                <SelectItem value="Visualizador">Visualizadores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionUrl">URL de acción (opcional)</Label>
              <Input
                id="actionUrl"
                placeholder="/eventos/1"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionText">Texto del botón (opcional)</Label>
              <Input
                id="actionText"
                placeholder="Ver más"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={sending}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              <Send className="h-4 w-4 mr-1" />
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
