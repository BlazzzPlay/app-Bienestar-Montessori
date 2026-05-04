"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Beneficio, ComentarioBeneficio } from "@/lib/supabase"

export function useBeneficio(id: number) {
  const [data, setData] = useState<Beneficio | null>(null)
  const [comentarios, setComentarios] = useState<
    (ComentarioBeneficio & { perfiles?: { nombre_completo: string; avatar_url?: string } })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return { data, comentarios, loading, error, refetch: fetch }
}
