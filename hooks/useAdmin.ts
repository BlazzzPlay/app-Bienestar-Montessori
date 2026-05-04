"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/database"

interface EstadisticasGenerales {
  totalUsuarios: number
  usuariosBienestar: number
  totalBeneficios: number
  totalEventos: number
  comentariosPendientes: number
  sugerenciasNoLeidas: number
}

export function useAdmin() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalUsuarios: 0,
    usuariosBienestar: 0,
    totalBeneficios: 0,
    totalEventos: 0,
    comentariosPendientes: 0,
    sugerenciasNoLeidas: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEstadisticas = async () => {
    setLoading(true)
    setError(null)

    try {
      const [perfilesResult, beneficiosResult, publicacionesResult, sugerenciasResult] =
        await Promise.allSettled([
          database.getAllProfiles(),
          database.getBeneficios(),
          database.getPublicaciones(),
          database.getSugerencias(),
        ])

      const perfiles = perfilesResult.status === "fulfilled" ? perfilesResult.value : { data: [] }
      const beneficios =
        beneficiosResult.status === "fulfilled" ? beneficiosResult.value : { data: [] }
      const publicaciones =
        publicacionesResult.status === "fulfilled" ? publicacionesResult.value : { data: [] }
      const sugerencias =
        sugerenciasResult.status === "fulfilled" ? sugerenciasResult.value : { data: [] }

      const stats: EstadisticasGenerales = {
        totalUsuarios: perfiles.data?.length || 0,
        usuariosBienestar: perfiles.data?.filter((p) => p.es_bienestar).length || 0,
        totalBeneficios: beneficios.data?.length || 0,
        totalEventos: publicaciones.data?.filter((p) => p.categoria === "Evento").length || 0,
        comentariosPendientes: 0,
        sugerenciasNoLeidas: sugerencias.data?.filter((s) => !s.leido).length || 0,
      }

      setEstadisticas(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEstadisticas()
  }, [])

  return { estadisticas, loading, error, refetch: loadEstadisticas }
}
