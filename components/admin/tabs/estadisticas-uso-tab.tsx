"use client"

import { BarChart3, Gift, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Beneficio } from "@/lib/supabase"

interface EstadisticasUsoTabProps {
  beneficios: Beneficio[]
}

export default function EstadisticasUsoTab({ beneficios }: EstadisticasUsoTabProps) {
  const totalUsos = beneficios.reduce((sum, b) => sum + (b.contador_usos || 0), 0)
  const maxUsos = beneficios[0]?.contador_usos || 1

  if (beneficios.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">No hay datos de uso disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Total de usos</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalUsos} uso{totalUsos !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="space-y-3">
        {beneficios.map((beneficio, index) => {
          const usos = beneficio.contador_usos || 0
          const porcentaje = Math.round((usos / maxUsos) * 100)

          return (
            <Card key={beneficio.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{beneficio.nombre_empresa}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {beneficio.descripcion_corta}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {index === 0 && (
                      <Badge className="bg-secondary/10 text-secondary border-0 text-xs">#1</Badge>
                    )}
                    <span className="text-sm font-bold text-foreground">{usos}</span>
                  </div>
                </div>
                <Progress
                  value={porcentaje}
                  className="h-1.5"
                  aria-label={`${beneficio.nombre_empresa}: ${usos} usos`}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
