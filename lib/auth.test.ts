import { describe, it, expect, beforeEach, vi } from "vitest"
import { auth } from "./auth"

const mockPbSignIn = vi.fn()
const mockPbSignOut = vi.fn()
const mockPbGetCurrentUser = vi.fn()
const mockPbGetSession = vi.fn()

vi.mock("./pocketbase-auth", () => ({
  signIn: (...args: any[]) => mockPbSignIn(...args),
  signOut: (...args: any[]) => mockPbSignOut(...args),
  getCurrentUser: (...args: any[]) => mockPbGetCurrentUser(...args),
  getSession: (...args: any[]) => mockPbGetSession(...args),
}))

describe("auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockPbSignIn.mockReset()
    mockPbSignOut.mockReset()
    mockPbGetCurrentUser.mockReset()
    mockPbGetSession.mockReset()
  })

  describe("signIn", () => {
    it("returns error when email is empty", async () => {
      const result = await auth.signIn("", "password123")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email y contraseña son obligatorios")
      expect(mockPbSignIn).not.toHaveBeenCalled()
    })

    it("returns error when password is empty", async () => {
      const result = await auth.signIn("test@colegiomontessori.cl", "")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email y contraseña son obligatorios")
      expect(mockPbSignIn).not.toHaveBeenCalled()
    })

    it("returns error for non-institutional email", async () => {
      const result = await auth.signIn("test@gmail.com", "password123")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe(
        "Debes usar tu correo institucional (@colegiomontessori.cl)",
      )
      expect(mockPbSignIn).not.toHaveBeenCalled()
    })

    it("calls pocketbase signIn for valid institutional email", async () => {
      const fakeRecord = { id: "abc123", email: "test@colegiomontessori.cl" }
      mockPbSignIn.mockResolvedValue({
        data: { record: fakeRecord, token: "jwt-token" },
        error: null,
      })

      const result = await auth.signIn("test@colegiomontessori.cl", "correct-password")
      expect(mockPbSignIn).toHaveBeenCalledWith("test@colegiomontessori.cl", "correct-password")
      expect(result.data?.record).toEqual(fakeRecord)
      expect(result.data?.token).toBe("jwt-token")
      expect(result.error).toBeNull()
    })

    it("returns error when signIn fails", async () => {
      mockPbSignIn.mockResolvedValue({
        data: null,
        error: { message: "Failed to authenticate" },
      })
      const result = await auth.signIn("test@colegiomontessori.cl", "wrong-password")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Failed to authenticate")
    })
  })

  describe("signOut", () => {
    it("calls pocketbase signOut", async () => {
      mockPbSignOut.mockResolvedValue({ error: null })
      const result = await auth.signOut()
      expect(mockPbSignOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })

  describe("getSession", () => {
    it("returns session when active", async () => {
      const fakeSession = { isValid: true, record: { id: "u1" } }
      mockPbGetSession.mockResolvedValue({ session: fakeSession, error: null })
      const result = await auth.getSession()
      expect(result.session).toEqual(fakeSession)
      expect(result.error).toBeNull()
    })

    it("returns null when no session", async () => {
      mockPbGetSession.mockResolvedValue({ session: null, error: null })
      const result = await auth.getSession()
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe("getCurrentUser", () => {
    it("returns user when authenticated", async () => {
      const user = { id: "u1", email: "a@b.cl" }
      mockPbGetCurrentUser.mockResolvedValue({ user, error: null })
      const result = await auth.getCurrentUser()
      expect(result.user).toEqual(user)
      expect(result.error).toBeNull()
    })

    it("returns null when not authenticated", async () => {
      mockPbGetCurrentUser.mockResolvedValue({ user: null, error: null })
      const result = await auth.getCurrentUser()
      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
    })
  })
})
