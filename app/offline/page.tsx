"use client"

import { ArrowLeft, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-blue-500 p-6 text-white text-center">
          <WifiOff className="h-12 w-12 mx-auto mb-2 opacity-90" />
          <h1 className="text-2xl font-bold">Sin conexión</h1>
          <p className="text-primary-foreground/80 mt-2">No se pudo conectar a internet</p>
        </div>

        <div className="p-6">
          <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/10">
            <p className="text-sm text-primary">
              Estás usando la versión offline de Bienestar Montessori. Algunas funciones pueden
              estar limitadas hasta que recuperes la conexión.
            </p>
          </div>

          <h2 className="font-medium text-foreground mb-3">Contenido disponible offline:</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-sm text-muted-foreground">
              <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
              Información de tu perfil
            </li>
            <li className="flex items-center text-sm text-muted-foreground">
              <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
              Beneficios guardados previamente
            </li>
            <li className="flex items-center text-sm text-muted-foreground">
              <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
              Eventos guardados previamente
            </li>
          </ul>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-primary hover:bg-primary/80 text-white rounded-md flex items-center justify-center"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Intentar reconectar
            </button>

            <Link
              href="/"
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-8">Bienestar Montessori • Versión Offline</p>
    </div>
  )
}
