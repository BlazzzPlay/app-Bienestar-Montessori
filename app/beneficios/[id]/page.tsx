"use client"

import { useState } from "react"
import { MapPin, CheckCircle2, ArrowLeft, Users, MessageSquare, Send } from "lucide-react"
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

export default function DetalleBeneficioPage() {
  const { id } = useParams()
  const { data: beneficio, comentarios, loading, error } = useBeneficio(Number(id))
  const [nuevoComentario, setNuevoComentario] = useState("")

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-primary-foreground/20" />
          <Skeleton className="h-5 w-40 bg-primary-foreground/20" />
        </header>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !beneficio) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground text-lg">{error || "Beneficio no encontrado"}</p>
        <Link href="/beneficios" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Beneficios
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/beneficios">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-base font-semibold truncate">{beneficio.nombre_empresa}</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* ── Hero Image ── */}
        <div className="aspect-[16/9] sm:aspect-[2/1] bg-muted">
          <img
            src={beneficio.foto_local_url || "/placeholder.svg?height=400&width=800"}
            alt={beneficio.nombre_empresa}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-5">
          {/* ── Title + Tags + Stats ── */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {beneficio.nombre_empresa}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {beneficio.etiquetas?.map((etiqueta: string) => (
                <Badge
                  key={etiqueta}
                  variant="secondary"
                  className={`text-xs px-2.5 py-0.5 rounded-full ${getTagColor(etiqueta)}`}
                >
                  {etiqueta}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                <Users className="h-3.5 w-3.5" />
                {beneficio.contador_usos || 0} usos
              </span>
            </div>
          </div>

          {/* ── Description ── */}
          {(beneficio.descripcion_larga || beneficio.descripcion_corta) && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Descripción
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {beneficio.descripcion_larga || beneficio.descripcion_corta}
              </p>
            </div>
          )}

          {/* ── Location ── */}
          {beneficio.direccion && (
            <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
              <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Ubicación</p>
                <p className="text-sm text-muted-foreground">{beneficio.direccion}</p>
              </div>
            </div>
          )}

          {/* ── Available Benefits ── */}
          {beneficio.beneficiosDisponibles && beneficio.beneficiosDisponibles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Beneficios incluidos
              </h2>
              <div className="space-y-2">
                {beneficio.beneficiosDisponibles.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <Button
            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-xl text-base"
            size="lg"
          >
            Registrar Uso del Beneficio
          </Button>

          {/* ── Comments ── */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentarios
              {comentarios.length > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {comentarios.length}
                </span>
              )}
            </h2>

            {/* Existing comments */}
            {comentarios.length > 0 ? (
              <div className="space-y-3">
                {comentarios.map((comentario) => (
                  <Card key={comentario.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage
                            src={
                              comentario.perfiles?.avatar_url ||
                              "/placeholder.svg?height=36&width=36"
                            }
                            alt={comentario.perfiles?.nombre_completo || "Usuario"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {comentario.perfiles?.nombre_completo
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-foreground truncate">
                              {comentario.perfiles?.nombre_completo || "Usuario"}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(comentario.fecha_creacion).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comentario.contenido}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-xl">
                No hay comentarios aún. ¡Sé el primero!
              </p>
            )}

            {/* New comment form */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Comparte tu experiencia con este beneficio..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  disabled={!nuevoComentario.trim()}
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Comentario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
