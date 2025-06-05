// Configuración para Analytics de Vercel
// Este archivo prepara la configuración pero no importa los paquetes hasta que estén instalados

export const analyticsConfig = {
  enabled: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
}

// Función para verificar si Analytics está disponible
export function isAnalyticsAvailable(): boolean {
  if (typeof window === "undefined") return false

  // Verificar si los scripts de Vercel están cargados
  const hasAnalytics = (window as any).va !== undefined
  const hasSpeedInsights = (window as any).si !== undefined

  return hasAnalytics || hasSpeedInsights
}

// Función para registrar eventos personalizados (cuando Analytics esté disponible)
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return

  try {
    if ((window as any).va?.track) {
      ;(window as any).va.track(name, properties)
    }
  } catch (error) {
    console.warn("Analytics tracking failed:", error)
  }
}
