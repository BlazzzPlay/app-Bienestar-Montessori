"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Perfil } from "@/lib/supabase"

export function useDirectorio() {
  const [data, setData] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await database.getAllProfiles()
      if (error) throw error
      setData(data || [])
    } catch (e: any) {
      setError(e.message || "Error al cargar directorio")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
