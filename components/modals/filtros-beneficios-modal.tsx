"use client"

import { useState } from "react"
import { Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FiltrosBeneficiosModalProps {
  isOpen: boolean
  onClose: () => void
  filtrosSeleccionados: string[]
  onAplicarFiltros: (filtros: string[]) => void
}

export default function FiltrosBeneficiosModal({
  isOpen,
  onClose,
  filtrosSeleccionados,
  onAplicarFiltros,
}: FiltrosBeneficiosModalProps) {
  const [filtrosTemp, setFiltrosTemp] = useState<string[]>(filtrosSeleccionados)

  const categorias = [
    { id: "comida", label: "Comida", color: "bg-orange-100 text-orange-800" },
    { id: "salud", label: "Salud", color: "bg-green-100 text-green-800" },
    { id: "deporte", label: "Deporte", color: "bg-blue-100 text-blue-800" },
    { id: "entretenimiento", label: "Entretenimiento", color: "bg-purple-100 text-purple-800" },
    { id: "educacion", label: "Educación", color: "bg-indigo-100 text-indigo-800" },
    { id: "tecnologia", label: "Tecnología", color: "bg-gray-100 text-gray-800" },
    { id: "belleza", label: "Belleza", color: "bg-pink-100 text-pink-800" },
    { id: "hogar", label: "Hogar", color: "bg-yellow-100 text-yellow-800" },
    { id: "transporte", label: "Transporte", color: "bg-teal-100 text-teal-800" },
    { id: "farmacia", label: "Farmacia", color: "bg-emerald-100 text-emerald-800" },
  ]

  const toggleFiltro = (categoriaId: string) => {
    setFiltrosTemp((prev) =>
      prev.includes(categoriaId) ? prev.filter((id) => id !== categoriaId) : [...prev, categoriaId],
    )
  }

  const handleAplicar = () => {
    onAplicarFiltros(filtrosTemp)
    onClose()
  }

  const handleLimpiar = () => {
    setFiltrosTemp([])
  }

  const handleCancelar = () => {
    setFiltrosTemp(filtrosSeleccionados)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancelar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-[#005A9C]" />
            <span>Filtrar Beneficios</span>
          </DialogTitle>
          <DialogDescription>
            Selecciona las categorías que te interesan para encontrar beneficios más fácilmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contador de filtros seleccionados */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filtrosTemp.length} {filtrosTemp.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"}
            </span>
            {filtrosTemp.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLimpiar}
                className="text-[#005A9C] hover:text-[#004080]"
              >
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {categorias.map((categoria) => {
              const isSelected = filtrosTemp.includes(categoria.id)
              return (
                <button
                  key={categoria.id}
                  onClick={() => toggleFiltro(categoria.id)}
                  className={`relative flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected ? "border-[#005A9C] bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Badge variant="secondary" className={`text-xs px-2 py-1 rounded-full ${categoria.color}`}>
                    {categoria.label}
                  </Badge>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="bg-[#005A9C] rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Filtros seleccionados */}
          {filtrosTemp.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {filtrosTemp.map((filtroId) => {
                  const categoria = categorias.find((c) => c.id === filtroId)
                  if (!categoria) return null
                  return (
                    <Badge
                      key={filtroId}
                      variant="secondary"
                      className={`text-xs px-2 py-1 rounded-full ${categoria.color}`}
                    >
                      {categoria.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button type="button" variant="outline" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleAplicar} className="bg-[#005A9C] hover:bg-[#004080] text-white">
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
