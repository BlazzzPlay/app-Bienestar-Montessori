import AnalyticsDiagnostic from "@/components/analytics-diagnostic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Analytics</h1>

      <div className="grid gap-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Información</AlertTitle>
          <AlertDescription>
            Esta página permite verificar que Vercel Analytics y Speed Insights estén correctamente instalados.
          </AlertDescription>
        </Alert>

        <AnalyticsDiagnostic />

        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de uso</CardTitle>
            <CardDescription>Cómo aprovechar al máximo las herramientas de análisis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Vercel Analytics</h3>
              <p className="text-sm text-gray-600">
                Proporciona métricas sobre el uso de la aplicación, incluyendo páginas visitadas, tiempo de permanencia
                y comportamiento de usuarios. No requiere configuración adicional.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Speed Insights</h3>
              <p className="text-sm text-gray-600">
                Monitorea el rendimiento real de la aplicación, midiendo métricas como LCP, FID, CLS y más. Los datos se
                pueden visualizar en el dashboard de Vercel.
              </p>
            </div>

            <div className="pt-2">
              <h3 className="font-medium mb-2">Acceso a los datos</h3>
              <p className="text-sm text-gray-600">
                Para ver los datos recopilados, visita el dashboard de Vercel y navega a la sección de Analytics o Speed
                Insights dentro de tu proyecto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
