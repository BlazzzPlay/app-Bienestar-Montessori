import { database } from "./database"

export interface CustomSession {
  user: {
    id: string
    email: string
    user_metadata: {
      nombre_completo: string
      rol: string
      last_login?: string
    }
  }
  access_token: string
  expires_at: number
}

const SESSION_KEY = "bienestar-montessori-session"

const validateRUTBasicFormat = (rut: string): boolean => {
  const cleanRUT = rut.replace(/[.-]/g, "").toLowerCase()
  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false
  const numbers = cleanRUT.slice(0, -1)
  const verifier = cleanRUT.slice(-1)
  if (!/^\d+$/.test(numbers)) return false
  if (!/^[0-9k]$/.test(verifier)) return false
  return true
}

export const auth = {
  async signIn(email: string, password: string) {
    if (!email || !password) {
      return { data: null, error: { message: "Email y RUT son obligatorios" } }
    }

    const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
    if (!emailRegex.test(email.toLowerCase())) {
      return { data: null, error: { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" } }
    }

    if (!validateRUTBasicFormat(password)) {
      return { data: null, error: { message: "El RUT debe tener un formato válido (ej: 12345678-9)" } }
    }

    const { data: perfil, error: authError } = await database.authenticateUser(email, password)

    if (authError || !perfil) {
      return { data: null, error: authError || { message: "Error de autenticación" } }
    }

    const session: CustomSession = {
      user: {
        id: perfil.id,
        email: perfil.correo,
        user_metadata: {
          nombre_completo: perfil.nombre_completo,
          rol: perfil.rol,
          last_login: new Date().toISOString(),
        },
      },
      access_token: `local-token-${perfil.id}-${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }

    return { data: { session }, error: null }
  },

  async signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY)
    }
    return { error: null }
  },

  async getCurrentUser() {
    const { session, error } = await this.getSession()
    if (error || !session) {
      return { user: null, error }
    }
    return { user: session.user, error: null }
  },

  async getSession() {
    if (typeof window === "undefined") {
      return { session: null, error: null }
    }
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) return { session: null, error: null }

      const session = JSON.parse(sessionData) as CustomSession
      if (session.expires_at < Date.now()) {
        localStorage.removeItem(SESSION_KEY)
        return { session: null, error: { message: "Sesión expirada" } }
      }
      if (!session.user?.id || !session.access_token) {
        localStorage.removeItem(SESSION_KEY)
        return { session: null, error: { message: "Sesión inválida" } }
      }
      return { session, error: null }
    } catch {
      localStorage.removeItem(SESSION_KEY)
      return { session: null, error: { message: "Sesión inválida" } }
    }
  },

  async updatePassword(_password: string) {
    const { session } = await this.getSession()
    if (!session) {
      return { data: null, error: { message: "No hay sesión activa" } }
    }
    return { data: { user: session.user }, error: null }
  },
}
