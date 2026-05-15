"use client"

import React from "react"
import type { ReactNode } from "react"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next"

// Solo renderizar Vercel Analytics si estamos deployados en Vercel
const isVercel = !!process.env.NEXT_PUBLIC_VERCEL_ENV

export function AnalyticsProviders({ children }: { children: ReactNode }) {
  if (!isVercel) return <>{children}</>

  return (
    <>
      {children}
      <VercelAnalytics />
      <VercelSpeedInsights />
    </>
  )
}

/**
 * Tracking de eventos personalizados (solo funciona en Vercel)
 */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  if (!isVercel) return

  try {
    const win = window as unknown as Record<string, unknown>
    const va = win.va as
      | { track?: (name: string, props?: Record<string, unknown>) => void }
      | undefined
    if (va?.track) va.track(name, properties)
  } catch {
    // Silently fail
  }
}

/**
 * Hook para verificar si Analytics está disponible
 */
export function useAnalytics() {
  const [isAvailable, setIsAvailable] = React.useState(false)

  React.useEffect(() => {
    if (!isVercel) {
      setIsAvailable(false)
      return
    }
    const checkAnalytics = () => {
      const win = window as unknown as Record<string, unknown>
      const va = win.va as { track?: unknown } | undefined
      const si = win.si as { track?: unknown } | undefined
      setIsAvailable(!!va?.track || !!si?.track)
    }

    checkAnalytics()
    const interval = setInterval(checkAnalytics, 1000)

    return () => clearInterval(interval)
  }, [])

  return { isAvailable, trackEvent }
}
