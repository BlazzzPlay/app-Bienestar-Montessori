"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { database } from "@/lib/database"

export function useProfile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [beneficiosUtilizados, setBeneficiosUtilizados] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { beneficiosUtilizados, error } = await database.getEstadisticasUsuario(user.id)
      if (error) throw error
      setBeneficiosUtilizados(beneficiosUtilizados)
    } catch (e: any) {
      setError(e.message || "Error al cargar estadísticas")
      setBeneficiosUtilizados(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user, fetchStats])

  const refetch = useCallback(async () => {
    await refreshProfile()
    await fetchStats()
  }, [refreshProfile, fetchStats])

  return {
    data: { profile, beneficiosUtilizados },
    loading: authLoading || loading,
    error,
    refetch,
  }
}
