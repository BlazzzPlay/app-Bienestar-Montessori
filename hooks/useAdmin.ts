"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/database"
import { exportProfilesToCSV } from "@/lib/csv-export"
import type { Perfil, Beneficio, Publicacion } from "@/lib/pocketbase"
import { toast } from "sonner"

interface EstadisticasGenerales {
  totalUsuarios: number
  usuariosBienestar: number
  totalBeneficios: number
  totalEventos: number
  comentariosPendientes: number
  sugerenciasNoLeidas: number
}

export interface EventoConAsistencia {
  evento: Publicacion
  asistentes: number
  confirmados: { nombre: string; avatar?: string }[]
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
  const [eventosConAsistencia, setEventosConAsistencia] = useState<EventoConAsistencia[]>([])
  const [topBeneficios, setTopBeneficios] = useState<Beneficio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEstadisticas = async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        perfilesResult,
        beneficiosResult,
        publicacionesResult,
        sugerenciasResult,
        pendingBeneficiosResult,
        pendingPublicacionesResult,
      ] = await Promise.allSettled([
        database.getAllProfiles(),
        database.getBeneficios(),
        database.getPublicaciones(),
        database.getSugerencias(),
        database.getPendingCommentsBeneficios(),
        database.getPendingCommentsPublicaciones(),
      ])

      const perfiles = perfilesResult.status === "fulfilled" ? perfilesResult.value : { data: [] }
      const beneficios =
        beneficiosResult.status === "fulfilled" ? beneficiosResult.value : { data: [] }
      const publicaciones =
        publicacionesResult.status === "fulfilled" ? publicacionesResult.value : { data: [] }
      const sugerencias =
        sugerenciasResult.status === "fulfilled" ? sugerenciasResult.value : { data: [] }
      const pendingBeneficios =
        pendingBeneficiosResult.status === "fulfilled"
          ? pendingBeneficiosResult.value
          : { data: [] }
      const pendingPublicaciones =
        pendingPublicacionesResult.status === "fulfilled"
          ? pendingPublicacionesResult.value
          : { data: [] }

      const eventos = publicaciones.data?.filter((p) => p.categoria === "Evento") || []

      // Cargar asistencias por evento
      const asistenciasPorEvento = await Promise.all(
        eventos.map(async (evento) => {
          const { data } = await database.getAsistenciasPorEvento(evento.id)
          return {
            evento,
            asistentes: data?.length || 0,
            confirmados:
              data?.map((a) => ({
                nombre: a.perfiles?.nombre_completo || "Usuario desconocido",
                avatar: a.perfiles?.avatar_url,
              })) || [],
          }
        }),
      )

      // Cargar beneficios por uso
      const { data: beneficiosPorUso } = await database.getBenefitsByUsage()

      const stats: EstadisticasGenerales = {
        totalUsuarios: perfiles.data?.length || 0,
        usuariosBienestar: perfiles.data?.filter((p) => p.es_bienestar).length || 0,
        totalBeneficios: beneficios.data?.length || 0,
        totalEventos: eventos.length,
        comentariosPendientes:
          (pendingBeneficios.data?.length || 0) + (pendingPublicaciones.data?.length || 0),
        sugerenciasNoLeidas: sugerencias.data?.filter((s) => !s.leido).length || 0,
      }

      setEstadisticas(stats)
      setEventosConAsistencia(asistenciasPorEvento)
      setTopBeneficios(beneficiosPorUso || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEstadisticas()
  }, [])

  const approveComment = async (
    table: "comentarios_beneficios" | "comentarios_publicaciones",
    id: string,
  ) => {
    const { error } = await database.approveComment(table, id)
    if (error) {
      toast.error("Error al aprobar comentario")
      return false
    }
    toast.success("Comentario aprobado")
    await loadEstadisticas()
    return true
  }

  const archiveComment = async (
    table: "comentarios_beneficios" | "comentarios_publicaciones",
    id: string,
  ) => {
    const { error } = await database.archiveComment(table, id)
    if (error) {
      toast.error("Error al archivar comentario")
      return false
    }
    toast.success("Comentario archivado")
    await loadEstadisticas()
    return true
  }

  const exportUsers = async () => {
    const { data } = await database.getAllProfiles()
    if (!data?.length) {
      toast.error("No hay usuarios para exportar")
      return
    }
    exportProfilesToCSV(data)
    toast.success("CSV exportado correctamente")
  }

  return {
    estadisticas,
    eventosConAsistencia,
    topBeneficios,
    loading,
    error,
    refetch: loadEstadisticas,
    approveComment,
    archiveComment,
    exportUsers,
  }
}
