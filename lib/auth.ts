import { supabase } from "./supabaseClient"

export const auth = {
  async signIn(email: string) {
    if (!email) {
      return { data: null, error: { message: "Email es obligatorio" } }
    }

    const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
    if (!emailRegex.test(email.toLowerCase())) {
      return {
        data: null,
        error: { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" },
      }
    }

    const siteUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: siteUrl,
      },
    })

    return { data, error }
  },

  async verifyOtp(email: string, token: string) {
    if (!email || !token) {
      return { data: null, error: { message: "Email y código OTP son obligatorios" } }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    return { user: data?.user || null, error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { session: data?.session || null, error }
  },
}
