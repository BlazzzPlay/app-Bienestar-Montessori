"use client"

import React from "react"
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export function AnalyticsProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}

// Función para tracking de eventos personalizados
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

// Hook para verificar si Analytics está disponible
export function useAnalytics() {
  const [isAvailable, setIsAvailable] = React.useState(false)

  React.useEffect(() => {
    const checkAnalytics = () => {
      const hasAnalytics = typeof window !== "undefined" && (window as any).va !== undefined
      const hasSpeedInsights = typeof window !== "undefined" && (window as any).si !== undefined
      setIsAvailable(hasAnalytics || hasSpeedInsights)
    }

    checkAnalytics()
    const interval = setInterval(checkAnalytics, 1000)

    return () => clearInterval(interval)
  }, [])

  return { isAvailable, trackEvent }
}
