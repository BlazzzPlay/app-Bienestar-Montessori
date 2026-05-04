"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
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
import DevelopmentGuard from "@/components/development-guard"

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

  const handleClickBeneficio = (id: number) => {
    router.push(`/beneficios/${id}`)
  }

  if (loading) {
    return (
      <MainLayout title="Beneficios">
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Beneficios">
        <div className="p-4 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <DevelopmentGuard>
      <MainLayout title="Beneficios">
        <div className="p-4 space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar beneficios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-border rounded-lg focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFiltros(true)}
              className={`h-12 px-4 ${filtrosSeleccionados.length > 0 ? "border-primary text-primary" : ""}`}
            >
              <Filter className="h-5 w-5" />
              {filtrosSeleccionados.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                  {filtrosSeleccionados.length}
                </span>
              )}
            </Button>
          </div>

          {/* Grid de beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beneficiosFiltrados.map((beneficio) => (
              <button
                key={beneficio.id}
                className="text-left w-full block"
                onClick={() => handleClickBeneficio(beneficio.id)}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video bg-muted">
                    <img
                      src={beneficio.foto_local_url || "/placeholder.svg?height=160&width=280"}
                      alt={beneficio.nombre_empresa}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      {beneficio.nombre_empresa}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {beneficio.descripcion_corta}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {beneficio.etiquetas?.map((etiqueta: string) => (
                        <Badge
                          key={etiqueta}
                          variant="secondary"
                          className={`text-xs px-2 py-1 rounded-full ${getTagColor(etiqueta)}`}
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

          {beneficiosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No se encontraron beneficios que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
        {/* Modal de filtros */}
        <FiltrosBeneficiosModal
          isOpen={showFiltros}
          onClose={() => setShowFiltros(false)}
          filtrosSeleccionados={filtrosSeleccionados}
          onAplicarFiltros={setFiltrosSeleccionados}
        />
      </MainLayout>
    </DevelopmentGuard>
  )
}
