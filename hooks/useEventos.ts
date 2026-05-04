"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Publicacion } from "@/lib/supabase"

export interface PublicacionConFecha extends Publicacion {
  fecha: Date
}

export function useEventos() {
  const [data, setData] = useState<PublicacionConFecha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await database.getPublicaciones()
      if (error) throw error
      setData(
        (data || []).map((p) => ({
          ...p,
          fecha: new Date(p.fecha_publicacion),
        })),
      )
    } catch (e: any) {
      setError(e.message || "Error al cargar publicaciones")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
