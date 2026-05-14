import {
  signIn as pbSignIn,
  signOut as pbSignOut,
  getCurrentUser as pbGetCurrentUser,
  getSession as pbGetSession,
} from "./pocketbase-auth"

export const auth = {
  async signIn(email: string, password: string) {
    if (!email || !password) {
      return { data: null, error: { message: "Email y contraseña son obligatorios" } }
    }

    const emailRegex = /^[^\s@]+@colegiomontessori\.cl$/
    if (!emailRegex.test(email.toLowerCase())) {
      return {
        data: null,
        error: { message: "Debes usar tu correo institucional (@colegiomontessori.cl)" },
      }
    }

    return pbSignIn(email, password)
  },

  async signOut() {
    return pbSignOut()
  },

  async getCurrentUser() {
    return pbGetCurrentUser()
  },

  async getSession() {
    return pbGetSession()
  },
}
