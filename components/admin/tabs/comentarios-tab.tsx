"use client"

import { useState, useEffect } from "react"
import { Check, Archive, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { database } from "@/lib/database"
import type { ComentarioBeneficio, ComentarioPublicacion } from "@/lib/supabase"
import { toast } from "sonner"

interface UnifiedComment {
  id: number
  contenido: string
  autor: string
  source: "beneficio" | "publicacion"
  sourceLabel: string
  fecha: string
  raw: ComentarioBeneficio | ComentarioPublicacion
}

interface ComentariosTabProps {
  onModerate?: () => void
}

export default function ComentariosTab({ onModerate }: ComentariosTabProps) {
  const [comments, setComments] = useState<UnifiedComment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const loadComments = async () => {
    setLoading(true)
    const [beneficiosRes, publicacionesRes] = await Promise.all([
      database.getPendingCommentsBeneficios(),
      database.getPendingCommentsPublicaciones(),
    ])

    const beneficios = (beneficiosRes.data || []).map(
      (c): UnifiedComment => ({
        id: c.id,
        contenido: c.contenido,
        autor: c.perfiles?.nombre_completo || "Usuario desconocido",
        source: "beneficio",
        sourceLabel: "Beneficio",
        fecha: c.fecha_creacion,
        raw: c,
      }),
    )

    const publicaciones = (publicacionesRes.data || []).map(
      (c): UnifiedComment => ({
        id: c.id,
        contenido: c.contenido,
        autor: c.perfiles?.nombre_completo || "Usuario desconocido",
        source: "publicacion",
        sourceLabel: "Publicación",
        fecha: c.fecha_creacion,
        raw: c,
      }),
    )

    setComments(
      [...beneficios, ...publicaciones].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadComments()
  }, [])

  const handleApprove = async (comment: UnifiedComment) => {
    setProcessingId(comment.id)
    const table =
      comment.source === "beneficio" ? "comentarios_beneficios" : "comentarios_publicaciones"
    const { error } = await database.approveComment(table, comment.id)
    if (error) {
      toast.error("Error al aprobar comentario")
    } else {
      toast.success("Comentario aprobado")
      await loadComments()
      onModerate?.()
    }
    setProcessingId(null)
  }

  const handleArchive = async (comment: UnifiedComment) => {
    setProcessingId(comment.id)
    const table =
      comment.source === "beneficio" ? "comentarios_beneficios" : "comentarios_publicaciones"
    const { error } = await database.archiveComment(table, comment.id)
    if (error) {
      toast.error("Error al archivar comentario")
    } else {
      toast.success("Comentario archivado")
      await loadComments()
      onModerate?.()
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">No hay comentarios pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {comments.length} comentario{comments.length !== 1 ? "s" : ""} pendiente
          {comments.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Autor</TableHead>
              <TableHead>Contenido</TableHead>
              <TableHead className="w-[100px]">Origen</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={`${comment.source}-${comment.id}`}>
                <TableCell className="font-medium text-sm">{comment.autor}</TableCell>
                <TableCell className="text-sm max-w-[300px] truncate">
                  {comment.contenido}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {comment.sourceLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => handleApprove(comment)}
                      disabled={processingId === comment.id}
                      aria-label={`Aprobar comentario de ${comment.autor}`}
                    >
                      {processingId === comment.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleArchive(comment)}
                      disabled={processingId === comment.id}
                      aria-label={`Archivar comentario de ${comment.autor}`}
                    >
                      <Archive className="h-3.5 w-3.5 mr-1" />
                      Archivar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
