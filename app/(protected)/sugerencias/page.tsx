"use client"

import type React from "react"
import { useState } from "react"
import { Lightbulb, Send, Shield, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import MainLayout from "@/components/main-layout"
import { useSugerencias } from "@/hooks/useSugerencias"

export default function SugerenciasPage() {
  const [sugerencia, setSugerencia] = useState("")
  const { submit, loading, enviado, error } = useSugerencias()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sugerencia.trim()) {
      await submit(sugerencia)
      if (!error) setSugerencia("")
    }
  }

  return (
    <MainLayout title="Sugerencias">
      <div className="p-4 max-w-xl mx-auto space-y-5">
        {/* ── Header card ── */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Buzón de Sugerencias</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Completamente anónimo
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compartí tus ideas, quejas o sugerencias para mejorar nuestro programa de bienestar.
              Todas las sugerencias son revisadas por el comité.
            </p>
          </CardContent>
        </Card>

        {/* ── Form ── */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  id="sugerencia"
                  value={sugerencia}
                  onChange={(e) => setSugerencia(e.target.value)}
                  placeholder="Escribe aquí tu idea, queja o sugerencia..."
                  className="min-h-[160px] resize-none text-sm"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{sugerencia.length}/1000</span>
                  {sugerencia.length > 900 && (
                    <span className="text-warning font-medium">
                      {1000 - sugerencia.length} caracteres restantes
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!sugerencia.trim() || loading || enviado}
                className="w-full h-12 rounded-xl font-semibold text-base"
                variant={enviado ? "outline" : "default"}
                size="lg"
              >
                {loading ? (
                  "Enviando..."
                ) : enviado ? (
                  <>
                    <Heart className="h-5 w-5 mr-2 text-success" />
                    ¡Sugerencia Enviada!
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Enviar Sugerencia Anónima
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Confirmation ── */}
        {enviado && (
          <Card className="border-0 shadow-sm bg-success/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-success font-medium">
                ¡Gracias! Tu sugerencia fue enviada de forma anónima y será revisada por el comité.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-muted-foreground px-4">
          ¿Necesitás una respuesta? Contactá al comité de Bienestar desde el directorio.
        </p>
      </div>
    </MainLayout>
  )
}
