"use client"

import { useState } from "react"
import { CalendarDays, Newspaper, Megaphone, MapPin, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import MainLayout from "@/components/main-layout"
import { useRouter } from "next/navigation"
import { useEventos } from "@/hooks/useEventos"

type TipoPublicacion = "Todos" | "Eventos" | "Noticias" | "Comunicados"

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Evento: CalendarDays,
  Noticia: Newspaper,
  Comunicado: Megaphone,
}

const CATEGORY_COLORS: Record<string, string> = {
  Evento: "bg-secondary/10 text-secondary border-secondary/30",
  Noticia: "bg-primary/10 text-primary border-primary/30",
  Comunicado: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30",
}

export default function EventosPage() {
  const [filtroActivo, setFiltroActivo] = useState<TipoPublicacion>("Todos")
  const router = useRouter()
  const { data: publicaciones, loading, error } = useEventos()

  if (loading) {
    return (
      <MainLayout title="Eventos">
        <div className="p-4 space-y-4 max-w-3xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Eventos">
        <div className="p-4 max-w-3xl mx-auto text-center pt-12">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </MainLayout>
    )
  }

  const filtros: TipoPublicacion[] = ["Todos", "Eventos", "Noticias", "Comunicados"]

  const publicacionesFiltradas = publicaciones
    .filter((p) => {
      if (filtroActivo === "Todos") return true
      if (filtroActivo === "Eventos") return p.categoria === "Evento"
      if (filtroActivo === "Noticias") return p.categoria === "Noticia"
      if (filtroActivo === "Comunicados") return p.categoria === "Comunicado"
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
    return { mes: meses[fecha.getMonth()], dia: fecha.getDate().toString().padStart(2, "0") }
  }

  return (
    <MainLayout title="Eventos">
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* ── Filter pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filtros.map((filtro) => {
            const isActive = filtroActivo === filtro
            return (
              <Button
                key={filtro}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroActivo(filtro)}
                className={`rounded-full px-4 h-9 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                {filtro}
              </Button>
            )
          })}
        </div>

        {/* ── Publications list ── */}
        {publicacionesFiltradas.length > 0 ? (
          <div className="space-y-3">
            {publicacionesFiltradas.map((publicacion) => {
              const fechaFormat = formatearFecha(publicacion.fecha)
              const IconoCategoria = CATEGORY_ICON[publicacion.categoria] || Newspaper
              const catColor = CATEGORY_COLORS[publicacion.categoria] || ""

              return (
                <button
                  key={publicacion.id}
                  className="text-left w-full group"
                  onClick={() => router.push(`/eventos/${publicacion.id}`)}
                >
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Date block */}
                        <div className="flex-shrink-0 w-16 sm:w-20 bg-primary flex flex-col items-center justify-center text-primary-foreground rounded-l-xl">
                          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide opacity-80">
                            {fechaFormat.mes}
                          </span>
                          <span className="text-xl sm:text-2xl font-bold leading-none mt-0.5">
                            {fechaFormat.dia}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <Badge
                              variant="outline"
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${catColor}`}
                            >
                              <IconoCategoria className="h-3 w-3" />
                              {publicacion.categoria}
                            </Badge>
                            <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                              {publicacion.titulo}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {publicacion.lugar && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                    {publicacion.lugar}
                                  </span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {publicacion.fecha.toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-secondary transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Sin publicaciones</p>
            <p className="text-sm text-muted-foreground mt-1">
              No hay {filtroActivo.toLowerCase()} en este momento.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
