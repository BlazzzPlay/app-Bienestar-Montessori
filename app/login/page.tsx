"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { signIn } from "@/lib/pocketbase-auth"

const DEV_USERS = [
  { label: "María G.", email: "admin@colegiomontessori.cl", password: "test123456", rol: "Administradora" },
  { label: "Pedro M.", email: "user@colegiomontessori.cl", password: "test123456", rol: "Beneficiario" },
]

function LoginForm() {
  const { isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectAfterLogin = useCallback(() => {
    const returnUrl = searchParams.get("returnUrl")
    window.location.href = returnUrl ?? "/perfil"
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated) {
      redirectAfterLogin()
    }
  }, [isAuthenticated, redirectAfterLogin])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!email || !password) {
        setError("Email y contraseña son obligatorios")
        return
      }

      const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
      if (!emailRegex.test(email.toLowerCase())) {
        setError("Debes usar tu correo institucional (@colegiomontessori.cl)")
        return
      }

      setLoading(true)
      const { error: signInError } = await signIn(email, password)
      setLoading(false)

      if (signInError) {
        setError(signInError.message)
      } else {
        redirectAfterLogin()
      }
    },
    [email, password, redirectAfterLogin],
  )

  const quickLogin = useCallback(async (user: (typeof DEV_USERS)[number]) => {
    setEmail(user.email)
    setPassword(user.password)
    setError(null)
    setLoading(true)
    const { error: signInError } = await signIn(user.email, user.password)
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
    } else {
      redirectAfterLogin()
    }
  }, [redirectAfterLogin])

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Correo institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@colegiomontessori.cl"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Solo se permiten cuentas @colegiomontessori.cl
          </p>
        </form>

        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs text-center text-muted-foreground font-medium">
            ⚡ Inicio rápido (testing)
          </p>
          <div className="flex gap-2">
            {DEV_USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                disabled={loading}
                onClick={() => quickLogin(user)}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-md border border-border bg-muted hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user.label}
                <span className="block text-[10px] text-muted-foreground">{user.rol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
