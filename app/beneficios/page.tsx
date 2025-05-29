"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import FiltrosBeneficiosModal from "@/components/modals/filtros-beneficios-modal"
import { useRouter } from "next/navigation"

export default function BeneficiosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFiltros, setShowFiltros] = useState(false)
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([])

  const router = useRouter()

  // Datos de ejemplo
  const beneficios = [
    {
      id: 1,
      empresa: "Restaurante El Buen Sabor",
      descripcion: "20% de descuento en todos los platos del menú. Válido de lunes a viernes.",
      imagen: "/placeholder.svg?height=160&width=280",
      etiquetas: ["Comida", "Descuento"],
    },
    {
      id: 2,
      empresa: "Farmacia Cruz Verde",
      descripcion: "15% de descuento en medicamentos y productos de cuidado personal.",
      imagen: "/placeholder.svg?height=160&width=280",
      etiquetas: ["Salud", "Farmacia"],
    },
    {
      id: 3,
      empresa: "Gimnasio FitLife",
      descripcion: "Membresía mensual con 30% de descuento y clases grupales incluidas.",
      imagen: "/placeholder.svg?height=160&width=280",
      etiquetas: ["Deporte", "Salud"],
    },
    {
      id: 4,
      empresa: "Cine Hoyts",
      descripcion: "Entradas a precio especial todos los días de la semana.",
      imagen: "/placeholder.svg?height=160&width=280",
      etiquetas: ["Entretenimiento", "Cine"],
    },
  ]

  const beneficiosFiltrados = beneficios.filter((beneficio) => {
    const matchesSearch =
      beneficio.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters =
      filtrosSeleccionados.length === 0 ||
      beneficio.etiquetas.some((etiqueta) => filtrosSeleccionados.includes(etiqueta.toLowerCase()))

    return matchesSearch && matchesFilters
  })

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      Comida: "bg-orange-100 text-orange-800",
      Salud: "bg-green-100 text-green-800",
      Deporte: "bg-blue-100 text-blue-800",
      Entretenimiento: "bg-purple-100 text-purple-800",
      Descuento: "bg-red-100 text-red-800",
      Farmacia: "bg-teal-100 text-teal-800",
      Cine: "bg-indigo-100 text-indigo-800",
    }
    return colors[tag] || "bg-gray-100 text-gray-800"
  }

  const handleClickBeneficio = (id: number) => {
    router.push(`/beneficios/${id}`)
  }

  return (
    <MainLayout title="Beneficios">
      <div className="p-4 space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar beneficios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300 rounded-lg focus:border-[#005A9C] focus:ring-[#005A9C]"
            />
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowFiltros(true)}
            className={`h-12 px-4 ${filtrosSeleccionados.length > 0 ? "border-[#005A9C] text-[#005A9C]" : ""}`}
          >
            <Filter className="h-5 w-5" />
            {filtrosSeleccionados.length > 0 && (
              <span className="ml-1 bg-[#005A9C] text-white text-xs rounded-full px-1.5 py-0.5">
                {filtrosSeleccionados.length}
              </span>
            )}
          </Button>
        </div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beneficiosFiltrados.map((beneficio) => (
            <Card
              key={beneficio.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleClickBeneficio(beneficio.id)}
            >
              <div className="aspect-video bg-gray-200">
                <img
                  src={beneficio.imagen || "/placeholder.svg"}
                  alt={beneficio.empresa}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">{beneficio.empresa}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{beneficio.descripcion}</p>
                <div className="flex flex-wrap gap-2">
                  {beneficio.etiquetas.map((etiqueta) => (
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
          ))}
        </div>

        {beneficiosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron beneficios que coincidan con tu búsqueda.</p>
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
  )
}
