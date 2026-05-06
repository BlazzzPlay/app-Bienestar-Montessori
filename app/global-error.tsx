"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Algo salió mal</h1>
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Intentá recargar la página.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </body>
    </html>
  )
}
