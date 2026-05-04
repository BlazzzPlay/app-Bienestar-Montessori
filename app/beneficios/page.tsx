"use client"

import { useState } from "react"
import { Search, Filter, MapPin, Users, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import FiltrosBeneficiosModal from "@/components/modals/filtros-beneficios-modal"
import { useRouter } from "next/navigation"
import { useBeneficios } from "@/hooks/useBeneficios"
import { getTagColor } from "@/lib/tag-utils"

export default function BeneficiosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFiltros, setShowFiltros] = useState(false)
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([])
  const { data: beneficios, loading, error } = useBeneficios()
  const router = useRouter()

  const beneficiosFiltrados = beneficios.filter((beneficio) => {
    const matchesSearch =
      beneficio.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficio.descripcion_corta?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilters =
      filtrosSeleccionados.length === 0 ||
      beneficio.etiquetas?.some((etiqueta: string) =>
        filtrosSeleccionados.includes(etiqueta.toLowerCase()),
      )
    return matchesSearch && matchesFilters
  })

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout title="Beneficios">
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <MainLayout title="Beneficios">
        <div className="p-4 max-w-4xl mx-auto text-center pt-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Beneficios">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* ── Search bar ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar beneficios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 rounded-xl border-border bg-background"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFiltros(true)}
            className={`h-11 w-11 rounded-xl flex-shrink-0 relative ${
              filtrosSeleccionados.length > 0
                ? "border-secondary text-secondary bg-secondary/5"
                : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            {filtrosSeleccionados.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {filtrosSeleccionados.length}
              </span>
            )}
          </Button>
        </div>

        {/* ── Benefits grid ── */}
        {beneficiosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficiosFiltrados.map((beneficio) => (
              <button
                key={beneficio.id}
                className="text-left w-full group"
                onClick={() => router.push(`/beneficios/${beneficio.id}`)}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={beneficio.foto_local_url || "/placeholder.svg?height=240&width=320"}
                      alt={beneficio.nombre_empresa}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Users count */}
                    {beneficio.contador_usos > 0 && (
                      <span className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Users className="h-3 w-3" />
                        {beneficio.contador_usos}
                      </span>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight line-clamp-2 flex-1">
                        {beneficio.nombre_empresa}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-secondary transition-colors" />
                    </div>

                    {beneficio.direccion && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{beneficio.direccion}</span>
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {beneficio.descripcion_corta}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {beneficio.etiquetas?.slice(0, 3).map((etiqueta: string) => (
                        <Badge
                          key={etiqueta}
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getTagColor(etiqueta)}`}
                        >
                          {etiqueta}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Sin resultados</p>
            <p className="text-sm text-muted-foreground mt-1">
              No se encontraron beneficios con esos filtros.
            </p>
            {(searchTerm || filtrosSeleccionados.length > 0) && (
              <Button
                variant="link"
                className="mt-3 text-secondary"
                onClick={() => {
                  setSearchTerm("")
                  setFiltrosSeleccionados([])
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Filters Modal ── */}
      <FiltrosBeneficiosModal
        isOpen={showFiltros}
        onClose={() => setShowFiltros(false)}
        filtrosSeleccionados={filtrosSeleccionados}
        onAplicarFiltros={setFiltrosSeleccionados}
      />
    </MainLayout>
  )
}
