"use client"

import { useEffect, useState } from "react"
import { Search, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/main-layout"
import { tempDatabase } from "@/lib/temp-database"
// Importar DevelopmentGuard al inicio del archivo
import DevelopmentGuard from "@/components/development-guard"

export default function DirectorioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [perfiles, setPerfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPerfiles = async () => {
      const { data } = await tempDatabase.getAllProfiles()
      if (data) {
        setPerfiles(data)
      }
      setLoading(false)
    }

    loadPerfiles()
  }, [])

  // Separar perfiles por rol
  const directorioBienestar = perfiles.filter((p) => ["Administrador", "Presidente", "Directorio"].includes(p.rol))
  const funcionarios = perfiles.filter((p) => !["Administrador", "Presidente", "Directorio"].includes(p.rol))

  const filtrarPersonas = (personas: any) => {
    return personas.filter(
      (persona: any) =>
        persona.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.cargo?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const directorioBienestarFiltrado = filtrarPersonas(directorioBienestar)
  const funcionariosFiltrados = filtrarPersonas(funcionarios)

  const PersonaItem = ({ persona }: { persona: any }) => (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <Avatar className="w-12 h-12">
        <AvatarImage src={persona.avatar || "/placeholder.svg"} alt={persona.nombre_completo} />
        <AvatarFallback className="bg-gray-200 text-gray-600">
          {persona.nombre_completo
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{persona.nombre_completo}</h3>
        <p className="text-sm text-gray-600 truncate">{persona.cargo}</p>
      </div>
      <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-[#005A9C]">
        <Mail className="h-5 w-5" />
      </Button>
    </div>
  )

  if (loading) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C]"></div>
        </div>
      </MainLayout>
    )
  }

  // Envolver todo el contenido del return en DevelopmentGuard:
  return (
    <DevelopmentGuard>
      <MainLayout title="Directorio">
        <div className="p-4 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300 rounded-lg focus:border-[#005A9C] focus:ring-[#005A9C]"
            />
          </div>

          {/* Directorio de Bienestar */}
          {directorioBienestarFiltrado.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 px-1">Directorio de Bienestar</h2>
              <div className="space-y-2">
                {directorioBienestarFiltrado.map((persona) => (
                  <PersonaItem key={persona.id} persona={persona} />
                ))}
              </div>
            </div>
          )}

          {/* Funcionarios */}
          {funcionariosFiltrados.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 px-1">Funcionarios</h2>
              <div className="space-y-2">
                {funcionariosFiltrados.map((persona) => (
                  <PersonaItem key={persona.id} persona={persona} />
                ))}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {directorioBienestarFiltrado.length === 0 && funcionariosFiltrados.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron personas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </MainLayout>
    </DevelopmentGuard>
  )
}
