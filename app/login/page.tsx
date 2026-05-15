"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { signIn } from "@/lib/pocketbase-auth"
import { getVersionDisplay } from "@/lib/version"

const DEV_USERS = [
  {
    label: "María G.",
    email: "admin@colegiomontessori.cl",
    password: "test123456",
    rol: "Administradora",
  },
  {
    label: "Pedro M.",
    email: "user@colegiomontessori.cl",
    password: "test123456",
    rol: "Beneficiario",
  },
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

  const quickLogin = useCallback(
    async (user: (typeof DEV_USERS)[number]) => {
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
    },
    [redirectAfterLogin],
  )

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <svg
            viewBox="0 0 128 128"
            className="w-32 h-auto mx-auto mb-6"
            aria-label="Logo Bienestar Montessori"
            role="img"
          >
            <defs>
              <linearGradient id="s-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(222.2 47.4% 14%)" />
                <stop offset="100%" stopColor="hsl(222.2 47.4% 22%)" />
              </linearGradient>
            </defs>
            {/* Shield — navy */}
            <path
              d="M64 6 L14 30 L14 56 C14 96 40 118 64 124 C88 118 114 96 114 56 L114 30 Z"
              fill="url(#s-grad)"
              stroke="hsl(41 76% 49%)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner shield line — gold */}
            <path
              d="M64 17 L24 38 L24 56 C24 88 46 108 64 113 C82 108 104 88 104 56 L104 38 Z"
              fill="none"
              stroke="hsl(41 76% 49%)"
              strokeWidth="1"
              opacity="0.35"
            />
            {/* Open book — gold left page */}
            <path d="M40 62 L64 52 L64 92 L40 80 Z" fill="hsl(41 76% 49%)" opacity="0.9" />
            {/* Open book — gold right page */}
            <path d="M64 52 L88 62 L88 80 L64 92 Z" fill="hsl(41 76% 62%)" opacity="0.9" />
            {/* Book spine */}
            <line
              x1="64"
              y1="52"
              x2="64"
              y2="93"
              stroke="hsl(222.2 47.4% 14%)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Heart — gold */}
            <path
              d="M64 28 C57 22 46 25 46 34 C46 42 56 50 64 56 C72 50 82 42 82 34 C82 25 71 22 64 28Z"
              fill="hsl(41 76% 49%)"
            />
          </svg>
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

        {/* ── Versión ── */}
        <p className="text-[10px] text-muted-foreground/50 text-center mt-8 select-none">
          {getVersionDisplay()}
        </p>
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
