"use client"

import { MapPin, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { tempDatabase } from "@/lib/temp-database"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
// Importar DevelopmentGuard al inicio del archivo
import DevelopmentGuard from "@/components/development-guard"

export default function DetalleBeneficioPage() {
  const [nuevoComentario, setNuevoComentario] = useState("")
  const { id } = useParams()
  const [beneficio, setBeneficio] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [beneficioResult, comentariosResult] = await Promise.all([
        tempDatabase.getBeneficio(Number(id)),
        tempDatabase.getComentariosBeneficio(Number(id)),
      ])

      if (beneficioResult.data) {
        setBeneficio(beneficioResult.data)
      }

      if (comentariosResult.data) {
        setComentarios(comentariosResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C]"></div>
      </div>
    )
  }

  if (!beneficio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Beneficio no encontrado</p>
      </div>
    )
  }

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

  // Envolver todo el contenido del return en DevelopmentGuard:
  return (
    <DevelopmentGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header con botón de regreso */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <Link href="/beneficios">
            <Button variant="ghost" size="sm" className="p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Detalle del Beneficio</h1>
        </header>

        <div className="pb-6">
          {/* Imagen hero */}
          <div className="aspect-video bg-gray-200">
            <img
              src={beneficio.foto_local_url || "/placeholder.svg?height=300&width=600"}
              alt={beneficio.nombre_empresa}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-6">
            {/* Título y etiquetas */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">{beneficio.nombre_empresa}</h1>
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
              <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
              <p className="text-gray-600 leading-relaxed">
                {beneficio.descripcion_larga || beneficio.descripcion_corta}
              </p>
            </div>

            {/* Ubicación */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-600">{beneficio.direccion || "Dirección no disponible"}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en el mapa
                  </Button>
                </div>
              </div>
            </div>

            {/* Beneficios disponibles */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Beneficios Disponibles</h2>
              <ul className="space-y-2">
                {beneficio.beneficiosDisponibles?.map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-[#28a745] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contador de uso */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold text-[#005A9C]">
                  Ya lo han usado {beneficio.contadorUsos || beneficio.contador_usos || 0} personas
                </p>
              </CardContent>
            </Card>

            {/* Botón CTA */}
            <Button className="w-full h-12 bg-[#28a745] hover:bg-[#218838] text-white font-medium rounded-lg" size="lg">
              Registrar Uso del Beneficio
            </Button>

            {/* Comentarios */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Comentarios</h2>

              {/* Comentarios existentes */}
              <div className="space-y-4">
                {comentarios.length > 0 ? (
                  comentarios.map((comentario) => (
                    <Card key={comentario.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={comentario.perfiles?.avatar_url || "/placeholder.svg?height=40&width=40"}
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
                              <span className="font-medium text-gray-900">
                                {comentario.perfiles?.nombre_completo || "Usuario"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(comentario.fecha_creacion).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600">{comentario.contenido}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                  </div>
                )}
              </div>

              {/* Formulario para nuevo comentario */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">Agregar comentario</h3>
                  <Textarea
                    placeholder="Comparte tu experiencia con este beneficio..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button
                    className="w-full bg-[#005A9C] hover:bg-[#004080] text-white"
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
