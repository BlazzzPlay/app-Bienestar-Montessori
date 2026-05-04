"use client"

import { useState } from "react"
import { MapPin, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useBeneficio } from "@/hooks/useBeneficio"
import { getTagColor } from "@/lib/tag-utils"
import DevelopmentGuard from "@/components/development-guard"

export default function DetalleBeneficioPage() {
  const { id } = useParams()
  const { data: beneficio, comentarios, loading, error } = useBeneficio(Number(id))
  const [nuevoComentario, setNuevoComentario] = useState("")

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-4 space-y-6 w-full max-w-2xl">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !beneficio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{error || "Beneficio no encontrado"}</p>
      </div>
    )
  }

  return (
    <DevelopmentGuard>
      <div className="min-h-screen bg-background">
        {/* Header con botón de regreso */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center">
          <Link href="/beneficios">
            <Button variant="ghost" size="sm" className="p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Detalle del Beneficio</h1>
        </header>

        <div className="pb-6">
          {/* Imagen hero */}
          <div className="aspect-video bg-muted">
            <img
              src={beneficio.foto_local_url || "/placeholder.svg?height=300&width=600"}
              alt={beneficio.nombre_empresa}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-6">
            {/* Título y etiquetas */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">{beneficio.nombre_empresa}</h1>
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
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {beneficio.descripcion_larga || beneficio.descripcion_corta}
              </p>
            </div>

            {/* Ubicación */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Ubicación</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    {beneficio.direccion || "Dirección no disponible"}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en el mapa
                  </Button>
                </div>
              </div>
            </div>

            {/* Beneficios disponibles */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Beneficios Disponibles</h2>
              <ul className="space-y-2">
                {beneficio.beneficiosDisponibles?.map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contador de uso */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold text-primary">
                  Ya lo han usado {beneficio.contador_usos || 0} personas
                </p>
              </CardContent>
            </Card>

            {/* Botón CTA */}
            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              size="lg"
            >
              Registrar Uso del Beneficio
            </Button>

            {/* Comentarios */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Comentarios</h2>

              {/* Comentarios existentes */}
              <div className="space-y-4">
                {comentarios.length > 0 ? (
                  comentarios.map((comentario) => (
                    <Card key={comentario.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={
                                comentario.perfiles?.avatar_url ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={comentario.perfiles?.nombre_completo || "Usuario"}
                            />
                            <AvatarFallback>
                              {comentario.perfiles?.nombre_completo
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-foreground">
                                {comentario.perfiles?.nombre_completo || "Usuario"}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(comentario.fecha_creacion).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{comentario.contenido}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 bg-muted rounded-lg border border-border">
                    <p className="text-muted-foreground">
                      No hay comentarios aún. ¡Sé el primero en comentar!
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario para nuevo comentario */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium text-foreground">Agregar comentario</h3>
                  <Textarea
                    placeholder="Comparte tu experiencia con este beneficio..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!nuevoComentario.trim()}
                  >
                    Publicar Comentario
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DevelopmentGuard>
  )
}
