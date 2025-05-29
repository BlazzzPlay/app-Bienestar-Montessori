"use client"

import { useState } from "react"
import { MapPin, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DetalleBeneficioPage() {
  const [nuevoComentario, setNuevoComentario] = useState("")

  // Datos de ejemplo
  const beneficio = {
    id: 1,
    empresa: "Restaurante El Buen Sabor",
    descripcion:
      "Disfruta de un 20% de descuento en todos los platos de nuestro menú. Ofrecemos comida casera de alta calidad con ingredientes frescos y locales. Nuestro ambiente acogedor es perfecto para almuerzos de trabajo o cenas familiares.",
    direccion: "Av. Providencia 1234, Providencia, Santiago",
    imagen: "/placeholder.svg?height=300&width=600",
    beneficiosDisponibles: [
      "20% de descuento en todos los platos",
      "Bebida de cortesía con el menú del día",
      "Postre gratis en cumpleaños",
      "Reservas preferenciales",
    ],
    contadorUsos: 47,
    etiquetas: ["Comida", "Descuento"],
  }

  const comentarios = [
    {
      id: 1,
      usuario: "Ana Martínez",
      avatar: "/placeholder.svg?height=40&width=40",
      fecha: "2 días atrás",
      contenido: "Excelente servicio y la comida está deliciosa. El descuento se aplica sin problemas.",
    },
    {
      id: 2,
      usuario: "Carlos Rodríguez",
      avatar: "/placeholder.svg?height=40&width=40",
      fecha: "1 semana atrás",
      contenido: "Muy recomendado, el ambiente es muy agradable y el personal muy atento.",
    },
  ]

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      Comida: "bg-orange-100 text-orange-800",
      Descuento: "bg-red-100 text-red-800",
    }
    return colors[tag] || "bg-gray-100 text-gray-800"
  }

  return (
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
            src={beneficio.imagen || "/placeholder.svg"}
            alt={beneficio.empresa}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-6">
          {/* Título y etiquetas */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">{beneficio.empresa}</h1>
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
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
            <p className="text-gray-600 leading-relaxed">{beneficio.descripcion}</p>
          </div>

          {/* Ubicación */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-gray-600">{beneficio.direccion}</p>
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
              {beneficio.beneficiosDisponibles.map((item, index) => (
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
              <p className="text-lg font-semibold text-[#005A9C]">Ya lo han usado {beneficio.contadorUsos} personas</p>
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
              {comentarios.map((comentario) => (
                <Card key={comentario.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comentario.avatar || "/placeholder.svg"} alt={comentario.usuario} />
                        <AvatarFallback>
                          {comentario.usuario
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comentario.usuario}</span>
                          <span className="text-sm text-gray-500">{comentario.fecha}</span>
                        </div>
                        <p className="text-gray-600">{comentario.contenido}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
  )
}
