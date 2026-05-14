"use client"

import { useEffect, useState } from "react"
import type { Perfil } from "@/lib/pocketbase"
import { database } from "@/lib/database"
import { createBrowserClient } from "@/lib/pocketbase"
import {
  signIn as pbSignIn,
  signOut as pbSignOut,
  getCurrentUser as pbGetCurrentUser,
  getSession as pbGetSession,
} from "@/lib/pocketbase-auth"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let initialCheckDone = false

    const pb = createBrowserClient()

    // 1. Get initial session (handles hash fragment redirects)
    const getInitialSession = async () => {
      const { session } = await pbGetSession()

      if (session?.isValid) {
        const { user: currentUser } = await pbGetCurrentUser()
        setUser(currentUser)
        if (currentUser?.id) {
          const { data: profileData } = await database.getProfile(currentUser.id)
          setProfile(profileData as Perfil | null)
        }
      }

      initialCheckDone = true
      setLoading(false)
    }

    getInitialSession()

    // 2. Listen for auth state changes (login, logout)
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (record) {
        setUser(record)
        if (record.id) {
          database.getProfile(record.id).then(({ data: profileData }) => {
            setProfile(profileData as Perfil | null)
          })
        }
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
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
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

      const { data, error } = await pbSignIn(email, password)

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

  const signOut = async () => {
    try {
      const { error } = await pbSignOut()
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
      error: { message: "Cambio de contraseña no disponible en esta versión" },
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const { data: profileData } = await database.getProfile(user.id)
      setProfile(profileData as Perfil | null)
    }
  }

  const hasFullAccess = () => {
    return profile?.rol === "Administrador"
  }

  const isInDevelopment = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  const validateSession = async () => {
    if (!user) return false
    try {
      const { session, error } = await pbGetSession()
      if (error || !session?.isValid) {
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
