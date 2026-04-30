"use client"

import { useState } from "react"
import { CalendarCheck, Newspaper, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/main-layout"
import { useRouter } from "next/navigation"
import { database } from "@/lib/database"
import { useEffect } from "react"
// Importar DevelopmentGuard al inicio del archivo
import DevelopmentGuard from "@/components/development-guard"

type TipoPublicacion = "Todos" | "Eventos" | "Noticias"
type Categoria = "Evento" | "Noticia"

interface Publicacion {
  id: number
  titulo: string
  descripcion: string
  fecha: Date
  categoria: Categoria
}

export default function EventosPage() {
  const [filtroActivo, setFiltroActivo] = useState<TipoPublicacion>("Todos")
  const router = useRouter()

  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPublicaciones = async () => {
      const { data } = await database.getPublicaciones()
      if (data) {
        setPublicaciones(
          data.map((p) => ({
            ...p,
            fecha: new Date(p.fecha_publicacion),
          })),
        )
      }
      setLoading(false)
    }

    loadPublicaciones()
  }, [])

  if (loading) {
    return (
      <MainLayout title="Eventos y Noticias">
        <div className="p-4 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C]"></div>
        </div>
      </MainLayout>
    )
  }

  const filtros: TipoPublicacion[] = ["Todos", "Eventos", "Noticias"]

  const publicacionesFiltradas = publicaciones
    .filter((publicacion) => {
      if (filtroActivo === "Todos") return true
      if (filtroActivo === "Eventos") return publicacion.categoria === "Evento"
      if (filtroActivo === "Noticias") return publicacion.categoria === "Noticia"
      return true
    })
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

  const formatearFecha = (fecha: Date) => {
    const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
    return {
      mes: meses[fecha.getMonth()],
      dia: fecha.getDate().toString().padStart(2, "0"),
    }
  }

  const getIconoCategoria = (categoria: Categoria) => {
    return categoria === "Evento" ? CalendarCheck : Newspaper
  }

  const getColorCategoria = (categoria: Categoria) => {
    return categoria === "Evento"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleClickPublicacion = (id: number) => {
    router.push(`/eventos/${id}`)
  }

  return (
    <DevelopmentGuard>
      <MainLayout title="Eventos y Noticias">
        <div className="p-4 space-y-4">
          {/* Filtros */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filtros.map((filtro) => {
              const isActive = filtroActivo === filtro
              return (
                <Button
                  key={filtro}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroActivo(filtro)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-[#005A9C] hover:bg-[#004080] text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filtro}
                </Button>
              )
            })}
          </div>

          {/* Lista de publicaciones */}
          <div className="space-y-3">
            {publicacionesFiltradas.map((publicacion) => {
              const fechaFormateada = formatearFecha(publicacion.fecha)
              const IconoCategoria = getIconoCategoria(publicacion.categoria)

              return (
                <Card
                  key={publicacion.id}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-b-2 border-gray-100 cursor-pointer"
                  onClick={() => handleClickPublicacion(publicacion.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Bloque de fecha */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-[#005A9C] rounded-lg flex flex-col items-center justify-center text-white">
                          <span className="text-xs font-medium">{fechaFormateada.mes}</span>
                          <span className="text-lg font-bold">{fechaFormateada.dia}</span>
                        </div>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <div className="space-y-2">
                          {/* Etiqueta de categoría */}
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getColorCategoria(publicacion.categoria)}`}
                          >
                            <IconoCategoria className="h-3 w-3" />
                            <span>{publicacion.categoria}</span>
                          </Badge>

                          {/* Título */}
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">{publicacion.titulo}</h3>

                          {/* Descripción */}
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {publicacion.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Ícono de flecha */}
                      <div className="flex-shrink-0 flex items-center">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {publicacionesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay {filtroActivo.toLowerCase()} disponibles en este momento.</p>
            </div>
          )}
        </div>
      </MainLayout>
    </DevelopmentGuard>
  )
}
