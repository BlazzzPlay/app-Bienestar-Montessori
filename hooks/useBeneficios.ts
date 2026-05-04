"use client"

import { useState, useEffect, useCallback } from "react"
import { database } from "@/lib/database"
import type { Beneficio } from "@/lib/supabase"

export function useBeneficios() {
  const [data, setData] = useState<Beneficio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await database.getBeneficios()
      if (error) throw error
      setData(data || [])
    } catch (e: any) {
      setError(e.message || "Error al cargar beneficios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
