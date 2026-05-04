"use client"

import { useState } from "react"
import { Search, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import MainLayout from "@/components/main-layout"
import { useDirectorio } from "@/hooks/useDirectorio"
import type { Perfil } from "@/lib/supabase"
import DevelopmentGuard from "@/components/development-guard"

export default function DirectorioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: perfiles, loading, error } = useDirectorio()

  // Separar perfiles por rol
  const directorioBienestar = perfiles.filter((p) =>
    ["Administrador", "Presidente", "Directorio"].includes(p.rol),
  )
  const funcionarios = perfiles.filter(
    (p) => !["Administrador", "Presidente", "Directorio"].includes(p.rol),
  )

  const filtrarPersonas = (personas: Perfil[]) => {
    return personas.filter(
      (persona) =>
        persona.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.cargo?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const directorioBienestarFiltrado = filtrarPersonas(directorioBienestar)
  const funcionariosFiltrados = filtrarPersonas(funcionarios)

  const PersonaItem = ({ persona }: { persona: Perfil }) => (
    <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow">
      <Avatar className="w-12 h-12">
        <AvatarImage src={persona.avatar_url || "/placeholder.svg"} alt={persona.nombre_completo} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {persona.nombre_completo
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{persona.nombre_completo}</h3>
        <p className="text-sm text-muted-foreground truncate">{persona.cargo}</p>
      </div>
      <Button variant="ghost" size="sm" className="p-2 text-muted-foreground hover:text-primary">
        <Mail className="h-5 w-5" />
      </Button>
    </div>
  )

  if (loading) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Directorio">
        <div className="p-4 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <DevelopmentGuard>
      <MainLayout title="Directorio">
        <div className="p-4 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-border rounded-lg focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Directorio de Bienestar */}
          {directorioBienestarFiltrado.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground px-1">
                Directorio de Bienestar
              </h2>
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
              <h2 className="text-lg font-semibold text-foreground px-1">Funcionarios</h2>
              <div className="space-y-2">
                {funcionariosFiltrados.map((persona) => (
                  <PersonaItem key={persona.id} persona={persona} />
                ))}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {directorioBienestarFiltrado.length === 0 &&
            funcionariosFiltrados.length === 0 &&
            searchTerm && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron personas que coincidan con tu búsqueda.
                </p>
              </div>
            )}

          {/* Empty state when no data at all */}
          {perfiles.length === 0 && !searchTerm && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay personas en el directorio.</p>
            </div>
          )}
        </div>
      </MainLayout>
    </DevelopmentGuard>
  )
}
