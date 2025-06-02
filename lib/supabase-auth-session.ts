import { supabase } from "./supabase"

/**
 * Crear una sesión temporal en Supabase para usuarios del sistema personalizado
 */
export class SupabaseAuthSession {
  private static instance: SupabaseAuthSession

  static getInstance(): SupabaseAuthSession {
    if (!SupabaseAuthSession.instance) {
      SupabaseAuthSession.instance = new SupabaseAuthSession()
    }
    return SupabaseAuthSession.instance
  }

  /**
   * Crear sesión temporal usando el service role key
   */
  async createTemporarySession(userId: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔐 Creando sesión temporal para:", userEmail)

      // Intentar crear un usuario temporal en Supabase Auth si no existe
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserById(userId)

      if (getUserError && !getUserError.message.includes("User not found")) {
        console.error("Error verificando usuario:", getUserError)
        return { success: false, error: getUserError.message }
      }

      // Si el usuario no existe en Supabase Auth, crearlo
      if (!existingUser.user) {
        console.log("👤 Creando usuario en Supabase Auth...")

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          user_id: userId,
          email: userEmail,
          email_confirm: true,
          password: "temp-password-" + Math.random().toString(36),
        })

        if (createError) {
          console.error("Error creando usuario:", createError)
          return { success: false, error: createError.message }
        }

        console.log("✅ Usuario creado en Supabase Auth:", newUser.user?.id)
      }

      // Generar token de acceso temporal
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: userEmail,
      })

      if (tokenError) {
        console.error("Error generando token:", tokenError)
        return { success: false, error: tokenError.message }
      }

      console.log("🎫 Token temporal generado")
      return { success: true }
    } catch (error) {
      console.error("Error en createTemporarySession:", error)
      return { success: false, error: `Error inesperado: ${error}` }
    }
  }

  /**
   * Establecer sesión usando el service role
   */
  async setServiceRoleSession(): Promise<{ success: boolean; error?: string }> {
    try {
      // Usar el service role key para operaciones administrativas
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!serviceRoleKey) {
        return { success: false, error: "Service role key no configurado" }
      }

      // Crear cliente con service role
      const { createClient } = await import("@supabase/supabase-js")
      const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Verificar que el cliente administrativo funcione
      const { data, error } = await adminClient.from("perfiles").select("id").limit(1)

      if (error) {
        return { success: false, error: `Error con service role: ${error.message}` }
      }

      console.log("✅ Service role configurado correctamente")
      return { success: true }
    } catch (error) {
      return { success: false, error: `Error configurando service role: ${error}` }
    }
  }
}

export const supabaseAuthSession = SupabaseAuthSession.getInstance()
