"use client"

import { useEffect } from "react"

export default function ServiceWorkerUpdater() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return

        // Cuando encuentra una actualización, recargar automáticamente
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nuevo SW instalado — recargar para activarlo
              window.location.reload()
            }
          })
        })
      })
    }
  }, [])

  return null
}
