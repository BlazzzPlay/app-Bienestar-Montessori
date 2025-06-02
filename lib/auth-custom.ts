import { supabase } from "./supabase"
import type { Perfil } from "./supabase"

// Clave para almacenar la sesión en localStorage
const SESSION_KEY = "bienestar-montessori-session"

// Tipo para la sesión personalizada
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

// Simplificar la función validateRUTWithVerifier para que solo valide formato básico
const validateRUTBasicFormat = (rut: string): boolean => {
  // Limpiar RUT
  const cleanRUT = rut.replace(/[.-]/g, "").toLowerCase()

  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false

  const numbers = cleanRUT.slice(0, -1)
  const verifier = cleanRUT.slice(-1)

  if (!/^\d+$/.test(numbers)) return false
  if (!/^[0-9k]$/.test(verifier)) return false

  return true
}

export const authCustom = {
  // Iniciar sesión con correo y RUT
  async signInWithEmailAndRut(email: string, rut: string) {
    try {
      // Validaciones más estrictas
      if (!email || !rut) {
        return {
          data: null,
          error: { message: "Email y RUT son obligatorios" },
        }
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
      if (!emailRegex.test(email.toLowerCase())) {
        return {
          data: null,
          error: { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" },
        }
      }

      // Validar formato de RUT (sin validar dígito verificador)
      if (!validateRUTBasicFormat(rut)) {
        return {
          data: null,
          error: { message: "El RUT debe tener un formato válido (ej: 12345678-9)" },
        }
      }

      // Buscar usuario por email (case insensitive)
      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("*")
        .ilike("correo", email.toLowerCase())
        .single()

      if (perfilError || !perfil) {
        return {
          data: null,
          error: { message: "Usuario no encontrado. Verifica tu correo institucional." },
        }
      }

      // Validar RUT (normalizar ambos para comparación)
      const normalizeRUT = (rut: string) => rut.replace(/[.-]/g, "").toLowerCase()

      if (normalizeRUT(perfil.rut) !== normalizeRUT(rut)) {
        return {
          data: null,
          error: { message: "RUT incorrecto. Verifica tu RUT y el dígito verificador." },
        }
      }

      // Crear sesión con datos adicionales de seguridad
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
        access_token: `custom-token-${perfil.id}-${Date.now()}`,
        expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
      }

      // Guardar en localStorage con timestamp
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))

      return { data: { session }, error: null }
    } catch (error) {
      console.error("Error en inicio de sesión:", error)
      return {
        data: null,
        error: { message: "Error inesperado al iniciar sesión. Inténtalo nuevamente." },
      }
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      localStorage.removeItem(SESSION_KEY)
      return { error: null }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      return { error: { message: "Error al cerrar sesión" } }
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)

      if (!sessionData) {
        return { session: null, error: null }
      }

      const session = JSON.parse(sessionData) as CustomSession

      // Verificar si la sesión ha expirado
      if (session.expires_at < Date.now()) {
        localStorage.removeItem(SESSION_KEY)
        return {
          session: null,
          error: { message: "Sesión expirada. Por favor, inicia sesión nuevamente." },
        }
      }

      // Verificar integridad básica de la sesión
      if (!session.user?.id || !session.access_token) {
        localStorage.removeItem(SESSION_KEY)
        return {
          session: null,
          error: { message: "Sesión inválida. Por favor, inicia sesión nuevamente." },
        }
      }

      return { session, error: null }
    } catch (error) {
      console.error("Error al obtener sesión:", error)
      localStorage.removeItem(SESSION_KEY)
      return {
        session: null,
        error: { message: "Error al validar sesión. Por favor, inicia sesión nuevamente." },
      }
    }
  },

  // Obtener usuario actual
  async getUser() {
    try {
      const { session, error } = await this.getSession()

      if (error || !session) {
        return { user: null, error }
      }

      return { user: session.user, error: null }
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      return { user: null, error: { message: "Error al obtener usuario" } }
    }
  },

  // Cambiar contraseña (RUT)
  async updatePassword(userId: string, newRut: string) {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .update({ rut: newRut, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      // Actualizar sesión si existe
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (sessionData) {
        const session = JSON.parse(sessionData) as CustomSession
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      return { data: null, error: { message: "Error al cambiar contraseña" } }
    }
  },

  // Obtener perfil del usuario
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase.from("perfiles").select("*").eq("id", userId).single()

      return { data, error }
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      return { data: null, error: { message: "Error al obtener perfil" } }
    }
  },

  // Actualizar perfil
  async updateProfile(userId: string, updates: Partial<Perfil>) {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      // Actualizar sesión si existe y si se cambió el nombre
      if (updates.nombre_completo) {
        const sessionData = localStorage.getItem(SESSION_KEY)
        if (sessionData) {
          const session = JSON.parse(sessionData) as CustomSession
          session.user.user_metadata.nombre_completo = updates.nombre_completo
          localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return { data: null, error: { message: "Error al actualizar perfil" } }
    }
  },
}
