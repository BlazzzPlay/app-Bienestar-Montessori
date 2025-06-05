"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Detectar si la app ya está instalada
  useEffect(() => {
    // Verificar si está en modo standalone (instalada)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Verificar estado de conexión inicial
    setIsOnline(navigator.onLine)

    // Escuchar cambios en el estado de la conexión
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre el prompt automáticamente
      e.preventDefault()
      // Guardar el evento para usarlo después
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Detectar cuando la app se instala
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      console.log("PWA instalada correctamente")
    })

    // Registrar el service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registrado con éxito:", registration.scope)
          })
          .catch((error) => {
            console.error("Error al registrar el Service Worker:", error)
          })
      })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Función para mostrar el prompt de instalación
  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log("No hay prompt de instalación disponible")
      return false
    }

    // Mostrar el prompt
    await deferredPrompt.prompt()

    // Esperar la respuesta del usuario
    const choiceResult = await deferredPrompt.userChoice

    // Limpiar el prompt guardado
    setDeferredPrompt(null)

    // Verificar si el usuario aceptó la instalación
    if (choiceResult.outcome === "accepted") {
      console.log("Usuario aceptó la instalación")
      return true
    } else {
      console.log("Usuario rechazó la instalación")
      return false
    }
  }

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      console.log("Permisos de notificación denegados")
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return {
    deferredPrompt,
    isInstalled,
    isInstallable,
    isOnline,
    installPWA,
    requestNotificationPermission,
  }
}
