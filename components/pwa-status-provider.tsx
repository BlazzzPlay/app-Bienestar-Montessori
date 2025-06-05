"use client"

import { createContext, useContext, type ReactNode } from "react"
import { usePWA } from "@/hooks/usePWA"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

// Crear contexto para el estado de PWA
const PWAContext = createContext<ReturnType<typeof usePWA> | undefined>(undefined)

export function PWAStatusProvider({ children }: { children: ReactNode }) {
  const pwaState = usePWA()

  return (
    <PWAContext.Provider value={pwaState}>
      {children}
      <PWAInstallPrompt />

      {/* Indicador de estado offline */}
      {!pwaState.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center text-sm py-1 z-50">
          Sin conexión - Modo offline
        </div>
      )}
    </PWAContext.Provider>
  )
}

// Hook para usar el contexto PWA
export function usePWAStatus() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error("usePWAStatus debe usarse dentro de un PWAStatusProvider")
  }
  return context
}
