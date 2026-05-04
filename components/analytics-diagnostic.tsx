"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAnalytics } from "@/lib/analytics"

// Componente Badge
function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error"
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

export default function AnalyticsDiagnostic() {
  const { isAvailable } = useAnalytics()
  const [analyticsStatus, setAnalyticsStatus] = useState<"checking" | "detected" | "not-detected">(
    "checking",
  )
  const [speedInsightsStatus, setSpeedInsightsStatus] = useState<
    "checking" | "detected" | "not-detected"
  >("checking")
  const [isProduction, setIsProduction] = useState(false)
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null)

  useEffect(() => {
    // Verificar entorno
    const hostname = window.location.hostname
    const isProd =
      hostname !== "localhost" && !hostname.includes("127.0.0.1") && !hostname.includes("localhost")
    setIsProduction(isProd)

    // Obtener información del deployment
    if (isProd) {
      setDeploymentInfo({
        url: window.location.origin,
        hostname: hostname,
        protocol: window.location.protocol,
      })
    }

    // Verificar Analytics con múltiples intentos
    let attempts = 0
    const maxAttempts = 10

    const checkAnalytics = () => {
      attempts++

      const hasAnalytics =
        typeof window !== "undefined" &&
        ((window as any).va !== undefined ||
          document.querySelector('script[src*="analytics"]') !== null ||
          document.querySelector('script[data-name="vercel-analytics"]') !== null)

      const hasSpeedInsights =
        typeof window !== "undefined" &&
        ((window as any).si !== undefined ||
          document.querySelector('script[src*="speed-insights"]') !== null ||
          document.querySelector('script[data-name="vercel-speed-insights"]') !== null)

      if (hasAnalytics || attempts >= maxAttempts) {
        setAnalyticsStatus(hasAnalytics ? "detected" : "not-detected")
      }

      if (hasSpeedInsights || attempts >= maxAttempts) {
        setSpeedInsightsStatus(hasSpeedInsights ? "detected" : "not-detected")
      }

      if (attempts < maxAttempts && (!hasAnalytics || !hasSpeedInsights)) {
        setTimeout(checkAnalytics, 500)
      }
    }

    setTimeout(checkAnalytics, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "checking":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "detected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "not-detected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checking":
        return <Badge variant="warning">Verificando...</Badge>
      case "detected":
        return <Badge variant="success">✓ Activo</Badge>
      case "not-detected":
        return <Badge variant="error">✗ No detectado</Badge>
      default:
        return <Badge variant="default">Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            Diagnóstico de Vercel Analytics
          </CardTitle>
          <CardDescription>
            Estado actual de las herramientas de análisis y rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado de los servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Vercel Analytics</span>
                {getStatusIcon(analyticsStatus)}
              </div>
              {getStatusBadge(analyticsStatus)}
              <p className="text-xs text-gray-600 mt-2">Recopila datos de uso y comportamiento</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Speed Insights</span>
                {getStatusIcon(speedInsightsStatus)}
              </div>
              {getStatusBadge(speedInsightsStatus)}
              <p className="text-xs text-gray-600 mt-2">Monitorea rendimiento y Core Web Vitals</p>
            </div>
          </div>

          {/* Información del entorno */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Información del Entorno</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Entorno:</span>
                <Badge variant={isProduction ? "success" : "warning"}>
                  {isProduction ? "Producción" : "Desarrollo"}
                </Badge>
              </div>
              {deploymentInfo && (
                <>
                  <div className="flex justify-between">
                    <span>URL:</span>
                    <span className="text-blue-600">{deploymentInfo.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocolo:</span>
                    <span>{deploymentInfo.protocol}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Analytics disponible:</span>
                <Badge variant={isAvailable ? "success" : "error"}>
                  {isAvailable ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Alertas y recomendaciones */}
          {!isProduction && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2 items-center text-yellow-800 font-medium mb-2">
                <AlertCircle size={16} />
                <span>Entorno de Desarrollo</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Analytics y Speed Insights funcionan mejor en producción. Algunas métricas pueden no
                estar disponibles en desarrollo.
              </p>
            </div>
          )}

          {isProduction &&
            (analyticsStatus === "not-detected" || speedInsightsStatus === "not-detected") && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2 items-center text-blue-800 font-medium mb-2">
                  <Info size={16} />
                  <span>Configuración Requerida</span>
                </div>
                <p className="text-blue-700 text-sm mb-2">
                  Para activar Analytics, ve al dashboard de Vercel y habilita estas funciones para
                  tu proyecto.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                >
                  Ir a Vercel Dashboard
                </Button>
              </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Verificar de nuevo
          </Button>
          <Button
            variant="default"
            onClick={() => window.open("https://vercel.com/docs/analytics", "_blank")}
          >
            Ver Documentación
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
