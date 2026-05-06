"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Beneficio, ComentarioBeneficio } from "@/lib/supabase"

export function useBeneficio(
  id: number,
  userId?: string,
  perfil?: { nombre_completo: string; avatar_url?: string },
) {
  const [data, setData] = useState<Beneficio | null>(null)
  type ComentarioConPerfil = Omit<ComentarioBeneficio, "perfiles"> & {
    perfiles?: { nombre_completo: string; avatar_url?: string }
  }

  const [comentarios, setComentarios] = useState<ComentarioConPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUsed, setHasUsed] = useState(false)
  const [usageLoading, setUsageLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [beneficioResult, comentariosResult] = await Promise.all([
        database.getBeneficio(id),
        database.getComentariosBeneficio(id),
      ])
      if (beneficioResult.error) throw beneficioResult.error
      if (comentariosResult.error) throw comentariosResult.error
      setData(beneficioResult.data)
      setComentarios(comentariosResult.data || [])
    } catch (e: any) {
      setError(e.message || "Error al cargar el beneficio")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetch()
  }, [id, fetch])

  const registerUse = useCallback(async () => {
    if (!userId) throw new Error("Usuario no autenticado")
    setUsageLoading(true)
    try {
      const { error } = await database.registrarUsoBeneficio(id, userId)
      if (error) throw error
      await fetch()
      setHasUsed(true)
    } finally {
      setUsageLoading(false)
    }
  }, [id, userId, fetch])

  const submitComment = useCallback(
    async (contenido: string) => {
      if (!userId) throw new Error("Usuario no autenticado")
      setCommentLoading(true)
      try {
        const { data: nuevoComentario, error } = await database.createComentarioBeneficio({
          beneficio_id: id,
          usuario_id: userId,
          contenido,
        })
        if (error) throw error

        const optimisticComment: ComentarioConPerfil = {
          id: nuevoComentario?.id ?? Date.now(),
          contenido: nuevoComentario?.contenido ?? contenido,
          beneficio_id: nuevoComentario?.beneficio_id ?? id,
          usuario_id: nuevoComentario?.usuario_id ?? userId,
          estado: "pendiente",
          fecha_creacion: nuevoComentario?.fecha_creacion ?? new Date().toISOString(),
          perfiles: perfil
            ? {
                nombre_completo: perfil.nombre_completo,
                avatar_url: perfil.avatar_url,
              }
            : undefined,
        }

        setComentarios((prev) => [optimisticComment, ...prev])
      } finally {
        setCommentLoading(false)
      }
    },
    [id, userId, perfil],
  )

  return {
    data,
    comentarios,
    loading,
    error,
    refetch: fetch,
    hasUsed,
    usageLoading,
    commentLoading,
    registerUse,
    submitComment,
  }
}
