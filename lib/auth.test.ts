import { describe, it, expect, beforeEach, vi } from "vitest"
import { auth } from "./auth"

const mockSignInWithOtp = vi.fn()
const mockVerifyOtp = vi.fn()
const mockSignOut = vi.fn()
const mockGetUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      getUser: (...args: any[]) => mockGetUser(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
    },
  },
}))

describe("auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockSignInWithOtp.mockReset()
    mockVerifyOtp.mockReset()
    mockSignOut.mockReset()
    mockGetUser.mockReset()
    mockGetSession.mockReset()
  })

  describe("signIn", () => {
    it("returns error when email is empty", async () => {
      const result = await auth.signIn("")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email es obligatorio")
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it("returns error for non-institutional email", async () => {
      const result = await auth.signIn("test@gmail.com")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe(
        "Debes usar tu correo institucional (@colegiomontessori.cl)",
      )
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it("calls signInWithOtp for valid institutional email", async () => {
      mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })
      const result = await auth.signIn("test@colegiomontessori.cl")
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: "test@colegiomontessori.cl",
        options: { emailRedirectTo: expect.any(String) },
      })
      expect(result.error).toBeNull()
    })

    it("returns error when signInWithOtp fails", async () => {
      mockSignInWithOtp.mockResolvedValue({ data: null, error: { message: "Rate limit" } })
      const result = await auth.signIn("test@colegiomontessori.cl")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Rate limit")
    })
  })

  describe("verifyOtp", () => {
    it("returns error when email or token is empty", async () => {
      const result = await auth.verifyOtp("", "123456")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email y código OTP son obligatorios")
    })

    it("calls verifyOtp with correct params", async () => {
      mockVerifyOtp.mockResolvedValue({
        data: { user: { id: "u1" }, session: {} },
        error: null,
      })
      const result = await auth.verifyOtp("test@colegiomontessori.cl", "123456")
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: "test@colegiomontessori.cl",
        token: "123456",
        type: "email",
      })
      expect(result.error).toBeNull()
    })

    it("returns error when verifyOtp fails", async () => {
      mockVerifyOtp.mockResolvedValue({ data: null, error: { message: "Token expired" } })
      const result = await auth.verifyOtp("test@colegiomontessori.cl", "000000")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Token expired")
    })
  })

  describe("signOut", () => {
    it("calls supabase signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null })
      const result = await auth.signOut()
      expect(mockSignOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })

  describe("getSession", () => {
    it("returns session when active", async () => {
      const session = { user: { id: "u1" } }
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      const result = await auth.getSession()
      expect(result.session).toEqual(session)
      expect(result.error).toBeNull()
    })

    it("returns null when no session", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      const result = await auth.getSession()
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe("getCurrentUser", () => {
    it("returns user when authenticated", async () => {
      const user = { id: "u1", email: "a@b.cl" }
      mockGetUser.mockResolvedValue({ data: { user }, error: null })
      const result = await auth.getCurrentUser()
      expect(result.user).toEqual(user)
      expect(result.error).toBeNull()
    })

    it("returns null when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
      const result = await auth.getCurrentUser()
      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
    })
  })
})
