"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/main-layout"
import { useSugerencias } from "@/hooks/useSugerencias"
import DevelopmentGuard from "@/components/development-guard"

export default function SugerenciasPage() {
  const [sugerencia, setSugerencia] = useState("")
  const { submit, loading, enviado, error } = useSugerencias()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sugerencia.trim()) {
      await submit(sugerencia)
      if (!error) {
        setSugerencia("")
      }
    }
  }

  return (
    <DevelopmentGuard>
      <MainLayout title="Buzón de Sugerencias">
        <div className="p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Texto de bienvenida */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Tu voz es importante para nosotros
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Este buzón de sugerencias es completamente <strong>anónimo</strong>. Puedes
                  compartir tus ideas, quejas o sugerencias para mejorar nuestro programa de
                  bienestar. Tu identidad no será revelada y todas las sugerencias serán revisadas
                  por el comité de Bienestar.
                </p>
              </CardContent>
            </Card>

            {/* Formulario */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="sugerencia"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Tu sugerencia
                    </label>
                    <Textarea
                      id="sugerencia"
                      value={sugerencia}
                      onChange={(e) => setSugerencia(e.target.value)}
                      placeholder="Escribe aquí tu idea, queja o sugerencia para mejorar nuestro bienestar..."
                      className="min-h-[200px] resize-none border-border focus:border-primary focus:ring-primary"
                      maxLength={1000}
                    />
                    <div className="text-right text-xs text-muted-foreground">
                      {sugerencia.length}/1000 caracteres
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!sugerencia.trim() || loading || enviado}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    size="lg"
                  >
                    {loading
                      ? "Enviando..."
                      : enviado
                        ? "¡Sugerencia Enviada!"
                        : "Enviar Sugerencia Anónima"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Mensaje de confirmación */}
            {enviado && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-center text-green-800 font-medium">
                    ¡Gracias por tu sugerencia! Ha sido enviada de forma anónima y será revisada por
                    el comité de Bienestar.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información adicional */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ¿Tienes alguna consulta específica que requiere respuesta?
              </p>
              <p className="text-sm text-muted-foreground">
                Contacta directamente al comité de Bienestar a través del directorio.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    </DevelopmentGuard>
  )
}
