"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="text-gray-600">Ocurrió un error inesperado. Intenta recargar la página.</p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Intentar de nuevo
          </Button>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
