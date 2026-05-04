"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import GoogleSignInButton from "@/components/google-signin-button"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/perfil")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img
            src="/placeholder.svg?height=128&width=128"
            alt="Logo Bienestar Montessori"
            className="w-32 h-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-foreground">Bienestar Montessori</h1>
          <p className="text-muted-foreground mt-2">Portal de beneficios para funcionarios</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Accede con tu cuenta institucional de Google
          </p>

          <GoogleSignInButton />

          <p className="text-xs text-center text-muted-foreground">
            Solo se permiten cuentas @colegiomontessori.cl
          </p>
        </div>
      </div>
    </div>
  )
}
