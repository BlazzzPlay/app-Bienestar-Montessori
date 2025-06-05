"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AtSign, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/perfil")
    }
  }, [isAuthenticated, router])

  // Validar formato de RUT
  const validateRUT = (rut: string): boolean => {
    const cleanRUT = rut.replace(/[.-]/g, "")
    if (cleanRUT.length < 8 || cleanRUT.length > 9) return false
    const numbers = cleanRUT.slice(0, -1)
    const verifier = cleanRUT.slice(-1).toLowerCase()
    if (!/^\d+$/.test(numbers)) return false
    if (!/^[0-9k]$/.test(verifier)) return false
    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
    return emailRegex.test(email.toLowerCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateEmail(email)) {
      setError("Debes usar tu correo institucional válido (@colegiomontessori.cl)")
      setLoading(false)
      return
    }

    if (!email.endsWith("@colegiomontessori.cl")) {
      setError("Debes usar tu correo institucional (@colegiomontessori.cl)")
      setLoading(false)
      return
    }

    if (!validateRUT(password)) {
      setError("El RUT debe tener un formato válido (ej: 12345678-9)")
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.push("/perfil")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img
            src="https://gxbsscvcnlnbuqvhjupd.supabase.co/storage/v1/object/public/img//logo2019_transparente.png"
            alt="Logo Bienestar Montessori"
            className="w-32 h-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 font-sans">Bienestar Montessori</h1>
          <p className="text-gray-600 mt-2">Accede a tu portal de beneficios</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo Institucional
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="usuario@colegiomontessori.cl"
                  className="pl-10 h-12 border-gray-300 rounded-lg focus:border-[#005A9C] focus:ring-[#005A9C]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                RUT (Contraseña)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="Ingresa tu RUT (ej: 12345678-9)"
                  className="pl-10 pr-10 h-12 border-gray-300 rounded-lg focus:border-[#005A9C] focus:ring-[#005A9C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#005A9C] hover:bg-[#004080] text-white font-medium rounded-lg transition-colors"
            size="lg"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Tu contraseña es tu RUT con guión (ej: 12345678-9)</p>
            <p className="text-xs text-gray-500">¿Problemas para acceder? Contacta al administrador</p>
          </div>
        </form>
      </div>
    </div>
  )
}
