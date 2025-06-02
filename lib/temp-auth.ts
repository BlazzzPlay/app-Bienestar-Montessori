import type { Perfil } from "./supabase"

// Datos temporales de usuarios para pruebas
const TEMP_USERS = [
  {
    id: "user-1",
    email: "patricia.morales@colegiomontessori.cl",
    rut: "12345678-9",
    profile: {
      id: "user-1",
      nombre_completo: "Patricia Morales",
      correo: "patricia.morales@colegiomontessori.cl",
      rut: "12345678-9",
      cargo: "Presidenta de Bienestar",
      fecha_ingreso: "2020-03-15",
      jornada_trabajo: "Ambas Jornadas" as const,
      avatar_url: "/placeholder.svg?height=120&width=120",
      es_bienestar: true,
      rol: "Presidente" as const,
      orden_directorio: 1,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "user-2",
    email: "maria.gonzalez@colegiomontessori.cl",
    rut: "98765432-1",
    profile: {
      id: "user-2",
      nombre_completo: "María Elena González",
      correo: "maria.gonzalez@colegiomontessori.cl",
      rut: "98765432-1",
      cargo: "Profesora de Matemáticas",
      fecha_ingreso: "2018-08-20",
      jornada_trabajo: "Jornada Mañana" as const,
      avatar_url: "/placeholder.svg?height=120&width=120",
      es_bienestar: true,
      rol: "Beneficiario" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "user-3",
    email: "juan.perez@colegiomontessori.cl",
    rut: "11223344-5",
    profile: {
      id: "user-3",
      nombre_completo: "Juan Carlos Pérez",
      correo: "juan.perez@colegiomontessori.cl",
      rut: "11223344-5",
      cargo: "Profesor de Historia",
      fecha_ingreso: "2019-02-10",
      jornada_trabajo: "Jornada Tarde" as const,
      avatar_url: "/placeholder.svg?height=120&width=120",
      es_bienestar: false,
      rol: "Visualizador" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "user-4",
    email: "admin@colegiomontessori.cl",
    rut: "99887766-4",
    profile: {
      id: "user-4",
      nombre_completo: "Administrador Sistema",
      correo: "admin@colegiomontessori.cl",
      rut: "99887766-4",
      cargo: "Administrador de Sistema",
      fecha_ingreso: "2020-01-01",
      jornada_trabajo: "Ambas Jornadas" as const,
      avatar_url: "/placeholder.svg?height=120&width=120",
      es_bienestar: true,
      rol: "Administrador" as const,
      orden_directorio: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
]

export const tempAuth = {
  // Simular inicio de sesión temporal
  async signIn(email: string, password: string) {
    // Validar formato de email
    if (!email.endsWith("@colegiomontessori.cl")) {
      return {
        data: null,
        error: { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" },
      }
    }

    // Buscar usuario por email
    const user = TEMP_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return {
        data: null,
        error: { message: "Usuario no encontrado" },
      }
    }

    // Validar RUT como contraseña
    if (password !== user.rut) {
      return {
        data: null,
        error: { message: "RUT incorrecto. Usa tu RUT como contraseña (formato: 12345678-9)" },
      }
    }

    // Simular datos de sesión exitosa
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {},
        app_metadata: {},
        aud: "authenticated",
        created_at: "2024-01-01T00:00:00Z",
      },
      access_token: `temp-token-${user.id}`,
      refresh_token: `temp-refresh-${user.id}`,
      expires_in: 3600,
      token_type: "bearer",
    }

    // Guardar en localStorage para persistencia temporal
    localStorage.setItem("temp-session", JSON.stringify(sessionData))
    localStorage.setItem("temp-profile", JSON.stringify(user.profile))

    return {
      data: sessionData,
      error: null,
    }
  },

  // Cerrar sesión temporal
  async signOut() {
    localStorage.removeItem("temp-session")
    localStorage.removeItem("temp-profile")
    return { error: null }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const sessionData = localStorage.getItem("temp-session")

    if (!sessionData) {
      return { user: null, error: null }
    }

    try {
      const session = JSON.parse(sessionData)
      return { user: session.user, error: null }
    } catch {
      return { user: null, error: { message: "Sesión inválida" } }
    }
  },

  // Obtener sesión actual
  async getSession() {
    const sessionData = localStorage.getItem("temp-session")

    if (!sessionData) {
      return { session: null, error: null }
    }

    try {
      const session = JSON.parse(sessionData)
      return { session, error: null }
    } catch {
      return { session: null, error: { message: "Sesión inválida" } }
    }
  },

  // Cambiar contraseña (temporal)
  async updatePassword(password: string) {
    const sessionData = localStorage.getItem("temp-session")

    if (!sessionData) {
      return { data: null, error: { message: "No hay sesión activa" } }
    }

    // En un sistema real, aquí actualizaríamos la contraseña
    // Por ahora solo simulamos éxito
    return {
      data: { user: JSON.parse(sessionData).user },
      error: null,
    }
  },

  // Obtener perfil temporal
  async getProfile(userId: string) {
    const profileData = localStorage.getItem("temp-profile")

    if (!profileData) {
      return { data: null, error: { message: "Perfil no encontrado" } }
    }

    try {
      const profile = JSON.parse(profileData)
      return { data: profile, error: null }
    } catch {
      return { data: null, error: { message: "Error al cargar perfil" } }
    }
  },

  // Actualizar perfil temporal
  async updateProfile(userId: string, updates: Partial<Perfil>) {
    const profileData = localStorage.getItem("temp-profile")

    if (!profileData) {
      return { data: null, error: { message: "Perfil no encontrado" } }
    }

    try {
      const profile = JSON.parse(profileData)
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem("temp-profile", JSON.stringify(updatedProfile))
      return { data: updatedProfile, error: null }
    } catch {
      return { data: null, error: { message: "Error al actualizar perfil" } }
    }
  },

  // Obtener estadísticas temporales
  async getEstadisticasUsuario(usuarioId: string) {
    // Simular estadísticas basadas en el usuario
    const stats = {
      "user-1": { beneficiosUtilizados: 12 },
      "user-2": { beneficiosUtilizados: 8 },
      "user-3": { beneficiosUtilizados: 3 },
      "user-4": { beneficiosUtilizados: 15 },
    }

    return {
      beneficiosUtilizados: stats[usuarioId as keyof typeof stats]?.beneficiosUtilizados || 0,
      error: null,
    }
  },

  // Obtener todos los perfiles para el directorio
  async getAllProfiles() {
    const profiles = TEMP_USERS.map((user) => user.profile)
    return { data: profiles, error: null }
  },
}
