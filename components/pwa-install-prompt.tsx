"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Check, Info } from "lucide-react"
import { usePWA } from "@/hooks/usePWA"

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { deferredPrompt, isInstalled, isInstallable, installPWA } = usePWA()

  useEffect(() => {
    // Verificar si ya se ha descartado el prompt
    const isDismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (isDismissed === "true") {
      setDismissed(true)
      return
    }

    // Mostrar el prompt después de 3 segundos si es instalable y no está instalado
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, dismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setIsVisible(false)
    }
  }

  // No mostrar nada si no es visible o ya está instalado
  if (!isVisible || isInstalled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden max-w-md mx-auto pointer-events-auto">
        <div className="bg-gradient-to-r from-[#005A9C] to-[#0078d4] p-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png"
              alt="Logo Bienestar Montessori"
              className="w-8 h-8 mr-3"
            />
            <h3 className="text-white font-medium">Instalar aplicación</h3>
          </div>
          <button onClick={handleDismiss} className="text-white/80 hover:text-white" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start mb-4">
            <div className="bg-blue-50 p-2 rounded-full mr-3">
              <Smartphone className="h-5 w-5 text-[#005A9C]" />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Instala Bienestar Montessori en tu dispositivo para acceder más rápido y usar la aplicación sin
                conexión.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <Info className="h-4 w-4 mr-1 text-[#005A9C]" />
              Beneficios
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center text-xs text-gray-600">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Acceso rápido desde tu pantalla de inicio
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Funciona sin conexión a internet
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Recibe notificaciones importantes
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={handleDismiss} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-[#005A9C] hover:bg-[#004a80] text-white text-sm rounded-md flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
