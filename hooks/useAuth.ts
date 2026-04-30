"use client"

import { useEffect, useState } from "react"
import type { Perfil } from "@/lib/supabase"
import { auth } from "@/lib/auth"
import { database } from "@/lib/database"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const getInitialSession = async () => {
      const { session } = await auth.getSession()

      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await database.getProfile(session.user.id)
        setProfile(profileData)
      }

      setLoading(false)
    }

    getInitialSession()

    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === "bienestar-montessori-session") {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue)
            setUser(session.user)
            const { data: profileData } = await database.getProfile(session.user.id)
            setProfile(profileData)
          } catch {
            setUser(null)
            setProfile(null)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthError(null)

    try {
      if (!email || !password) {
        const error = { message: "Email y RUT son obligatorios" }
        setAuthError(error.message)
        return { data: null, error }
      }

      if (!email.endsWith("@colegiomontessori.cl")) {
        const error = { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" }
        setAuthError(error.message)
        return { data: null, error }
      }

      const { data, error } = await auth.signIn(email, password)

      if (data && !error) {
        setUser(data.session.user)
        const { data: profileData, error: profileError } = await database.getProfile(data.session.user.id)

        if (profileError) {
          console.error("Error loading profile:", profileError)
          setAuthError("Error al cargar el perfil del usuario")
          return { data: null, error: { message: "Error al cargar el perfil del usuario" } }
        }

        setProfile(profileData)
        setAuthError(null)
      } else if (error) {
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

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      setUser(null)
      setProfile(null)
      setAuthError(null)
      localStorage.removeItem("bienestar-montessori-session")
      return { error }
    } catch (error) {
      console.error("Error during sign out:", error)
      return { error: { message: "Error al cerrar sesión" } }
    }
  }

  const updatePassword = async (password: string) => {
    if (!user) {
      return { data: null, error: { message: "No hay usuario autenticado" } }
    }
    const { data, error } = await auth.updatePassword(password)
    return { data, error }
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

  const isInDevelopment = true

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
