"use client"

import { useState, useEffect } from "react"
import { AtSign, AlertCircle, Mail, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const { signIn, verifyOtp, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/perfil")
    }
  }, [isAuthenticated, router])

  const validateEmail = (email: string) => {
    return email.endsWith("@colegiomontessori.cl")
  }

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (!validateEmail(email)) {
      setError("Debes usar tu correo institucional (@colegiomontessori.cl)")
      setLoading(false)
      return
    }

    try {
      const result = await signIn(email)
      if (result.error) {
        setError(result.error.message || "Error al enviar el código")
      } else {
        setMessage("Te enviamos un código de verificación a tu correo")
        setStep("otp")
      }
    } catch (err) {
      setError("Error al enviar el código")
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (otp.length < 6) {
      setError("Ingresa el código de 6 dígitos")
      setLoading(false)
      return
    }

    try {
      const result = await verifyOtp(email, otp)
      if (result.error) {
        setError(result.error.message || "Código incorrecto")
      } else {
        router.push("/perfil")
      }
    } catch (err) {
      setError("Error al verificar el código")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img
            src="/placeholder.svg?height=128&width=128"
            alt="Logo Bienestar Montessori"
            className="w-32 h-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 font-sans">Bienestar Montessori</h1>
          <p className="text-gray-600 mt-2">Accede a tu portal de beneficios</p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            {(error || message) && (
              <Alert variant={error ? "destructive" : "default"}>
                {error ? <AlertCircle className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                <AlertDescription>{error || message}</AlertDescription>
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
                    className="pl-10 h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
              size="lg"
            >
              {loading ? "Enviando código..." : "Enviar código de acceso"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Te enviaremos un código de verificación a tu correo
              </p>
              <p className="text-xs text-gray-500">
                ¿Problemas para acceder? Contacta al administrador
              </p>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {(error || message) && (
              <Alert variant={error ? "destructive" : "default"}>
                {error ? <AlertCircle className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                <AlertDescription>{error || message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Código de verificación
                </Label>
                <InputOTP
                  id="otp"
                  data-testid="otp-input"
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    if (error) setError("")
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-gray-500">
                  Ingresa el código de 6 dígitos que enviamos a {email}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
              size="lg"
            >
              {loading ? "Verificando..." : "Verificar e ingresar"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("email")
                  setOtp("")
                  setError("")
                }}
                className="text-sm text-primary hover:underline"
              >
                Volver al correo
              </button>
            </div>
          </form>
        )}

        {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
          <div className="mt-8 border border-blue-200 rounded-xl bg-blue-50/50 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Usuarios de prueba
            </h3>
            <div className="space-y-2">
              {[
                {
                  email: "admin@colegiomontessori.cl",
                  rol: "Administrador",
                  color: "bg-red-100 text-red-700 border-red-200",
                },
                {
                  email: "patricia.morales@colegiomontessori.cl",
                  rol: "Presidente",
                  color: "bg-purple-100 text-purple-700 border-purple-200",
                },
                {
                  email: "maria.gonzalez@colegiomontessori.cl",
                  rol: "Beneficiario",
                  color: "bg-green-100 text-green-700 border-green-200",
                },
                {
                  email: "juan.perez@colegiomontessori.cl",
                  rol: "Visualizador",
                  color: "bg-gray-100 text-gray-700 border-gray-200",
                },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email)
                    setError("")
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg border hover:shadow-sm transition-all hover:bg-white group"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ml-2 ${u.color}`}
                    >
                      {u.rol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-blue-600 mt-2 text-center">
              Hacé click en cualquier usuario para completar el correo automáticamente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
