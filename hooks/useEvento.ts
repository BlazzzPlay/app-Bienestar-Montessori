"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Publicacion, ComentarioPublicacion } from "@/lib/pocketbase"

export function useEvento(id: string, userId?: string) {
  const [event, setEvent] = useState<Publicacion | null>(null)
  const [comments, setComments] = useState<
    (ComentarioPublicacion & { perfiles?: { nombre_completo: string; avatar_url?: string } })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAttending, setIsAttending] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventResult, commentsResult] = await Promise.all([
        database.getPublicacion(id),
        database.getComentariosPublicacion(id),
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

  const checkAttendance = useCallback(async () => {
    if (!userId || !id) return
    try {
      const { data } = await database.getAsistenciaEvento(id, userId)
      setIsAttending(!!data?.confirmado)
    } catch {
      setIsAttending(false)
    }
  }, [id, userId])

  useEffect(() => {
    if (id) fetch()
  }, [id, fetch])

  useEffect(() => {
    if (userId && id) checkAttendance()
  }, [userId, id, checkAttendance])

  const submitComment = useCallback(
    async (contenido: string, usuarioId: string) => {
      const { data, error } = await database.createComentarioPublicacion({
        publicacion_id: id,
        usuario_id: usuarioId,
        contenido,
      })
      if (error) throw error
      await fetch()
      return data
    },
    [id, fetch],
  )

  const confirmAttendance = useCallback(async () => {
    if (!userId) throw new Error("Usuario no autenticado")
    setAttendanceLoading(true)
    try {
      const { error } = await database.confirmarAsistenciaEvento(id, userId)
      if (error) throw error
      setIsAttending(true)
    } finally {
      setAttendanceLoading(false)
    }
  }, [id, userId])

  return {
    event,
    comments,
    loading,
    error,
    refetch: fetch,
    submitComment,
    isAttending,
    attendanceLoading,
    confirmAttendance,
  }
}
