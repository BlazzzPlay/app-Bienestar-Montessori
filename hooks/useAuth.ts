"use client"

import { useEffect, useState } from "react"
import type { Perfil } from "@/lib/supabase"
import { auth } from "@/lib/auth"
import { database } from "@/lib/database"
import { supabase } from "@/lib/supabaseClient"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let initialCheckDone = false

    // 1. Get initial session (handles hash fragment redirects)
    const getInitialSession = async () => {
      const { session } = await auth.getSession()

      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await database.getProfile(session.user.id)
        setProfile(profileData)
      }

      initialCheckDone = true
      setLoading(false)
    }

    getInitialSession()

    // 2. Listen for auth state changes (login, logout, hash processing)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await database.getProfile(session.user.id)
        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }

      // Only set loading false on first event if initial check didn't complete
      if (!initialCheckDone) {
        setLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string) => {
    setAuthError(null)

    try {
      if (!email) {
        const error = { message: "Email es obligatorio" }
        setAuthError(error.message)
        return { data: null, error }
      }

      if (!email.endsWith("@colegiomontessori.cl")) {
        const error = { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" }
        setAuthError(error.message)
        return { data: null, error }
      }

      const { data, error } = await auth.signIn(email)

      if (error) {
        setAuthError(error.message)
      }

      return { data, error }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      const errorMessage = "Error inesperado durante el inicio de sesión"
      setAuthError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    setAuthError(null)

    try {
      const { data, error } = await auth.verifyOtp(email, token)

      if (data && !error) {
        setUser(data.user)
        if (data.user?.id) {
          const { data: profileData, error: profileError } = await database.getProfile(data.user.id)
          if (profileError) {
            console.error("Error loading profile:", profileError)
            setAuthError("Error al cargar el perfil del usuario")
            return { data: null, error: { message: "Error al cargar el perfil del usuario" } }
          }
          setProfile(profileData)
        }
        setAuthError(null)
      } else if (error) {
        setAuthError(error.message)
      }

      return { data, error }
    } catch (error) {
      console.error("Unexpected error during OTP verification:", error)
      const errorMessage = "Error al verificar el código"
      setAuthError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signInWithGoogle = async () => {
    setAuthError(null)
    const { data, error } = await auth.signInWithGoogle()
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      setUser(null)
      setProfile(null)
      setAuthError(null)
      return { error }
    } catch (error) {
      console.error("Error during sign out:", error)
      return { error: { message: "Error al cerrar sesión" } }
    }
  }

  const updatePassword = async (_password: string) => {
    return {
      data: null,
      error: { message: "Cambio de contraseña no disponible con autenticación OTP" },
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const { data: profileData } = await database.getProfile(user.id)
      setProfile(profileData)
    }
  }

  const hasFullAccess = () => {
    return profile?.rol === "Administrador"
  }

  const isInDevelopment = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  const validateSession = async () => {
    if (!user) return false
    try {
      const { session, error } = await auth.getSession()
      if (error || !session) {
        setUser(null)
        setProfile(null)
        return false
      }
      return true
    } catch (error) {
      console.error("Error validating session:", error)
      setUser(null)
      setProfile(null)
      return false
    }
  }

  return {
    user,
    profile,
    loading,
    authError,
    signIn,
    verifyOtp,
    signInWithGoogle,
    signOut,
    updatePassword,
    refreshProfile,
    validateSession,
    isAuthenticated: !!user,
    isAdmin: profile?.rol === "Administrador",
    isPresidente: profile?.rol === "Presidente",
    isDirectorio: ["Administrador", "Presidente", "Directorio"].includes(profile?.rol || ""),
    canModerate: ["Administrador", "Presidente", "Directorio"].includes(profile?.rol || ""),
    hasFullAccess,
    isInDevelopment,
  }
}
