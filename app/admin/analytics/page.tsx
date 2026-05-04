import type React from "react"
import AnalyticsDiagnostic from "@/components/analytics-diagnostic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, BarChart3, Zap, Users, TrendingUp } from "lucide-react"

// Componente Alert simple
function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border rounded-md ${className || "border-blue-200 bg-blue-50"}`}>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Analytics</h1>
        <p className="text-gray-600">Monitoreo y análisis de la aplicación Bienestar Montessori</p>
      </div>

      <div className="grid gap-6">
        {/* Información general */}
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800">Sistema de Analytics Integrado</h3>
          </div>
          <p className="text-blue-700 text-sm">
            Vercel Analytics y Speed Insights están configurados para recopilar datos anónimos sobre
            el uso y rendimiento de la aplicación.
          </p>
        </Alert>

        {/* Diagnóstico */}
        <AnalyticsDiagnostic />

        {/* Métricas disponibles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Visitantes únicos, sesiones y comportamiento de usuarios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                Páginas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Páginas más visitadas y rutas de navegación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Core Web Vitals, tiempos de carga y optimizaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Tendencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Análisis temporal y patrones de uso</p>
            </CardContent>
          </Card>
        </div>

        {/* Guías de uso */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vercel Analytics</CardTitle>
              <CardDescription>Análisis de uso y comportamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Qué mide:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Rutas de navegación más comunes</li>
                  <li>Dispositivos y navegadores utilizados</li>
                  <li>Ubicación geográfica (anónima)</li>
                </ul>
              </div>
              <div className="text-sm">
                <p>
                  <strong>Acceso:</strong> Dashboard de Vercel → Analytics
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Speed Insights</CardTitle>
              <CardDescription>Monitoreo de rendimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Métricas clave:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>LCP (Largest Contentful Paint)</li>
                  <li>FID (First Input Delay)</li>
                  <li>CLS (Cumulative Layout Shift)</li>
                  <li>TTFB (Time to First Byte)</li>
                </ul>
              </div>
              <div className="text-sm">
                <p>
                  <strong>Acceso:</strong> Dashboard de Vercel → Speed Insights
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuración avanzada */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración y Mejores Prácticas</CardTitle>
            <CardDescription>Recomendaciones para aprovechar al máximo Analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Datos de Analytics</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Los datos aparecen en 24-48 horas</li>
                  <li>• Se actualizan cada hora</li>
                  <li>• Retención de 12 meses</li>
                  <li>• Cumple con GDPR y CCPA</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optimización</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Monitorea Core Web Vitals regularmente</li>
                  <li>• Identifica páginas lentas</li>
                  <li>• Optimiza rutas más visitadas</li>
                  <li>• Revisa métricas semanalmente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
