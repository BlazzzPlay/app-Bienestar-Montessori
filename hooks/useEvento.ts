"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Publicacion, ComentarioPublicacion } from "@/lib/supabase"

export function useEvento(id: string) {
  const [event, setEvent] = useState<Publicacion | null>(null)
  const [comments, setComments] = useState<
    (ComentarioPublicacion & { perfiles?: { nombre_completo: string; avatar_url?: string } })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventResult, commentsResult] = await Promise.all([
        database.getPublicacion(Number(id)),
        database.getComentariosPublicacion(Number(id)),
      ])
      if (eventResult.error) throw eventResult.error
      if (commentsResult.error) throw commentsResult.error
      setEvent(eventResult.data)
      setComments(commentsResult.data || [])
    } catch (e: any) {
      setError(e.message || "Error al cargar el evento")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetch()
  }, [id, fetch])

  const submitComment = useCallback(
    async (contenido: string, usuarioId: string) => {
      const { data, error } = await database.createComentarioPublicacion({
        publicacion_id: Number(id),
        usuario_id: usuarioId,
        contenido,
      })
      if (error) throw error
      await fetch()
      return data
    },
    [id, fetch],
  )

  return { event, comments, loading, error, refetch: fetch, submitComment }
}
