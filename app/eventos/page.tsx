"use client"

import { useState } from "react"
import { CalendarCheck, Newspaper, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import MainLayout from "@/components/main-layout"
import { useRouter } from "next/navigation"
import { useEventos } from "@/hooks/useEventos"
import { getCategoryColor } from "@/lib/tag-utils"
import DevelopmentGuard from "@/components/development-guard"

type TipoPublicacion = "Todos" | "Eventos" | "Noticias"

export default function EventosPage() {
  const [filtroActivo, setFiltroActivo] = useState<TipoPublicacion>("Todos")
  const router = useRouter()
  const { data: publicaciones, loading, error } = useEventos()

  if (loading) {
    return (
      <MainLayout title="Eventos y Noticias">
        <div className="p-4 space-y-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Eventos y Noticias">
        <div className="p-4 text-center">
          <p className="text-destructive">{error}</p>
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
    const meses = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ]
    return {
      mes: meses[fecha.getMonth()],
      dia: fecha.getDate().toString().padStart(2, "0"),
    }
  }

  const getIconoCategoria = (categoria: string) => {
    return categoria === "Evento" ? CalendarCheck : Newspaper
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
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-card border-border text-foreground hover:bg-accent"
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
                <button
                  key={publicacion.id}
                  className="text-left w-full block"
                  onClick={() => handleClickPublicacion(publicacion.id)}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-b-2 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Bloque de fecha */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-primary rounded-lg flex flex-col items-center justify-center text-primary-foreground">
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
                              className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getCategoryColor(publicacion.categoria)}`}
                            >
                              <IconoCategoria className="h-3 w-3" />
                              <span>{publicacion.categoria}</span>
                            </Badge>

                            {/* Título */}
                            <h3 className="font-semibold text-foreground text-base leading-tight">
                              {publicacion.titulo}
                            </h3>

                            {/* Descripción */}
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {publicacion.descripcion}
                            </p>
                          </div>
                        </div>

                        {/* Ícono de flecha */}
                        <div className="flex-shrink-0 flex items-center">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {publicacionesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay {filtroActivo.toLowerCase()} disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </DevelopmentGuard>
  )
}
