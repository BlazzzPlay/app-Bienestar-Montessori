import { createBrowserClient } from "./pocketbase"

/**
 * Authenticate a user with email and password via PocketBase.
 *
 * Returns `{ data, error }` — same contract as the existing auth module.
 */
export async function signIn(email: string, password: string) {
  if (!email || !password) {
    return { data: null, error: { message: "Email y contraseña son obligatorios" } }
  }

  try {
    const pb = createBrowserClient()
    const authData = await pb.collection("users").authWithPassword(email, password)
    return { data: { record: authData.record, token: authData.token }, error: null }
  } catch (error: any) {
    return {
      data: null,
      error: { message: error?.message ?? "Error al iniciar sesión" },
    }
  }
}

/**
 * Sign out the current user by clearing the auth store.
 */
export async function signOut() {
  try {
    const pb = createBrowserClient()
    pb.authStore.clear()
    return { error: null }
  } catch (error: any) {
    return {
      error: { message: error?.message ?? "Error al cerrar sesión" },
    }
  }
}

/**
 * Get the currently authenticated PocketBase user record.
 *
 * Returns `{ user, error }` — same contract as the existing auth module.
 */
export async function getCurrentUser() {
  try {
    const pb = createBrowserClient()
    const user = pb.authStore.record
    return { user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: { message: error?.message ?? "Error al obtener usuario" },
    }
  }
}

/**
 * Get the current auth session from the PocketBase auth store.
 *
 * Returns `{ session, error }` — same contract as the existing auth module.
 */
export async function getSession() {
  try {
    const pb = createBrowserClient()
    return {
      session: pb.authStore.isValid ? pb.authStore : null,
      error: null,
    }
  } catch (error: any) {
    return {
      session: null,
      error: { message: error?.message ?? "Error al obtener sesión" },
    }
  }
}
