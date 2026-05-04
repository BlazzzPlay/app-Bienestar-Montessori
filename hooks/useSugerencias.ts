"use client"

import { useState, useCallback } from "react"
import { database } from "@/lib/database"

export function useSugerencias() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const submit = useCallback(async (sugerencia: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await database.createSugerencia(sugerencia.trim())
      if (error) throw error
      setEnviado(true)
      setTimeout(() => setEnviado(false), 3000)
    } catch (e: any) {
      setError(e.message || "Error al enviar sugerencia")
    } finally {
      setLoading(false)
    }
  }, [])

  return { data: null, loading, error, refetch: () => Promise.resolve(), submit, enviado }
}
