"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MainLayout from "@/components/main-layout"
import CambiarContrasenaModal from "@/components/modals/cambiar-contrasena-modal"
import CambiarFotoModal from "@/components/modals/cambiar-foto-modal"
import { useState } from "react"

export default function PerfilPage() {
  // Datos de ejemplo
  const usuario = {
    nombre: "María Elena González",
    rut: "12.345.678-9",
    cargo: "Profesora de Matemáticas",
    fechaIngreso: "15 de marzo, 2020",
    avatar: "/placeholder.svg?height=120&width=120",
    beneficiosUtilizados: 12,
    perteneceABienestar: true,
  }

  const [showCambiarContrasena, setShowCambiarContrasena] = useState(false)
  const [showCambiarFoto, setShowCambiarFoto] = useState(false)

  return (
    <MainLayout title="Mi Perfil">
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl">
          <CardContent className="p-6 space-y-6">
            {/* Avatar y Nombre */}
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={usuario.avatar || "/placeholder.svg"} alt={usuario.nombre} />
                <AvatarFallback className="text-xl font-semibold bg-gray-200">
                  {usuario.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-gray-900">{usuario.nombre}</h2>
            </div>

            {/* Información Personal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información Personal</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RUT:</span>
                  <span className="text-sm font-medium text-gray-900">{usuario.rut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cargo:</span>
                  <span className="text-sm font-medium text-gray-900">{usuario.cargo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
                  <span className="text-sm font-medium text-gray-900">{usuario.fechaIngreso}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Estadísticas</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#005A9C]">{usuario.beneficiosUtilizados}</div>
                <div className="text-sm text-gray-600">Beneficios Utilizados</div>
              </div>
            </div>

            {/* Indicador de Estado */}
            <div className="flex justify-center">
              <Badge
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  usuario.perteneceABienestar
                    ? "bg-[#28a745] hover:bg-[#218838] text-white"
                    : "bg-[#dc3545] hover:bg-[#c82333] text-white"
                }`}
              >
                {usuario.perteneceABienestar ? "Pertenece a Bienestar" : "No Pertenece"}
              </Badge>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={() => setShowCambiarFoto(true)}
              >
                Cambiar Foto
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={() => setShowCambiarContrasena(true)}
              >
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Modales */}
      <CambiarFotoModal
        isOpen={showCambiarFoto}
        onClose={() => setShowCambiarFoto(false)}
        currentAvatar={usuario.avatar}
        userName={usuario.nombre}
      />
      <CambiarContrasenaModal isOpen={showCambiarContrasena} onClose={() => setShowCambiarContrasena(false)} />
    </MainLayout>
  )
}
