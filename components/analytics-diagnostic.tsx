"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info } from "lucide-react"

export default function AnalyticsDiagnostic() {
  const [analyticsStatus, setAnalyticsStatus] = useState<"checking" | "detected" | "not-detected">("checking")
  const [speedInsightsStatus, setSpeedInsightsStatus] = useState<"checking" | "detected" | "not-detected">("checking")
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Verificar si estamos en producción
    setIsProduction(window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1"))

    // Verificar Analytics
    setTimeout(() => {
      const hasAnalytics = window.va !== undefined || document.querySelector('script[src*="analytics"]') !== null

      setAnalyticsStatus(hasAnalytics ? "detected" : "not-detected")
    }, 1000)

    // Verificar Speed Insights
    setTimeout(() => {
      const hasSpeedInsights =
        window.si !== undefined || document.querySelector('script[src*="speed-insights"]') !== null

      setSpeedInsightsStatus(hasSpeedInsights ? "detected" : "not-detected")
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    if (status === "checking") {
      return <Badge className="bg-yellow-500">Verificando...</Badge>
    } else if (status === "detected") {
      return <Badge className="bg-green-500">Detectado</Badge>
    } else {
      return <Badge className="bg-red-500">No detectado</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info size={20} />
          Diagnóstico de Vercel Analytics
        </CardTitle>
        <CardDescription>Verificando la integración de herramientas de análisis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Vercel Analytics:</span>
          {getStatusBadge(analyticsStatus)}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Speed Insights:</span>
          {getStatusBadge(speedInsightsStatus)}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Entorno:</span>
          <Badge className={isProduction ? "bg-green-500" : "bg-yellow-500"}>
            {isProduction ? "Producción" : "Desarrollo"}
          </Badge>
        </div>

        {!isProduction && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <div className="flex gap-2 items-center text-yellow-800 font-medium mb-1">
              <AlertCircle size={16} />
              <span>Nota importante</span>
            </div>
            <p className="text-yellow-700">
              Analytics y Speed Insights solo funcionan completamente en producción. En entornos de desarrollo, algunas
              funciones pueden estar limitadas.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Verificar de nuevo
        </Button>
        <Button
          variant="default"
          disabled={!isProduction}
          onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
        >
          Ver en Vercel
        </Button>
      </CardFooter>
    </Card>
  )
}
