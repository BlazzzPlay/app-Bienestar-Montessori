import { describe, it, expect, beforeEach, vi } from "vitest"

// -------------------------------------------------------------------
// Mock PocketBase constructor so all `new PocketBase(url)` calls
// return the same controlled mock instance.
// -------------------------------------------------------------------
const mockAuthWithPassword = vi.fn()
const mockClear = vi.fn()
const mockPb: any = {
  collection: vi.fn(() => ({
    authWithPassword: mockAuthWithPassword,
  })),
  authStore: {
    clear: mockClear,
    record: null,
    isValid: false,
    loadFromCookie: vi.fn(),
    token: "",
    exportToCookie: vi.fn(() => ""),
    onChange: vi.fn(() => vi.fn()),
    save: vi.fn(),
  },
  files: { getURL: vi.fn(), getToken: vi.fn() },
  beforeSend: null as any,
}

vi.mock("pocketbase", () => ({
  default: vi.fn(() => mockPb),
}))

// Use the real pocketbase module (not mocked) so that resetBrowserClient works
import { signIn, signOut, getCurrentUser, getSession } from "./pocketbase-auth"
import { resetBrowserClient } from "./pocketbase"

describe("pocketbase-auth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetBrowserClient()
    mockAuthWithPassword.mockReset()
    mockClear.mockReset()
  })

  describe("signIn", () => {
    it("returns error when email is empty", async () => {
      const result = await signIn("", "password123")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email y contraseña son obligatorios")
      expect(mockAuthWithPassword).not.toHaveBeenCalled()
    })

    it("returns error when password is empty", async () => {
      const result = await signIn("user@colegiomontessori.cl", "")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Email y contraseña son obligatorios")
      expect(mockAuthWithPassword).not.toHaveBeenCalled()
    })

    it("calls authWithPassword with valid credentials", async () => {
      const fakeRecord = { id: "abc123", email: "user@colegiomontessori.cl" }
      mockAuthWithPassword.mockResolvedValue({
        record: fakeRecord,
        token: "jwt-token-123",
      })

      const result = await signIn("user@colegiomontessori.cl", "correct-password")
      expect(mockAuthWithPassword).toHaveBeenCalledWith(
        "user@colegiomontessori.cl",
        "correct-password",
      )
      expect(result.data?.record).toEqual(fakeRecord)
      expect(result.data?.token).toBe("jwt-token-123")
      expect(result.error).toBeNull()
    })

    it("returns error when authWithPassword fails", async () => {
      mockAuthWithPassword.mockRejectedValue(new Error("Failed to authenticate"))
      const result = await signIn("user@colegiomontessori.cl", "wrong-password")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Failed to authenticate")
    })
  })

  describe("signOut", () => {
    it("clears the auth store", async () => {
      const result = await signOut()
      expect(mockClear).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it("returns error if clear throws", async () => {
      mockClear.mockImplementationOnce(() => {
        throw new Error("Store error")
      })
      const result = await signOut()
      expect(result.error?.message).toBe("Store error")
    })
  })

  describe("getCurrentUser", () => {
    it("returns user when authenticated", async () => {
      const fakeUser = { id: "u1", email: "user@colegiomontessori.cl" }
      mockPb.authStore.record = fakeUser

      const result = await getCurrentUser()
      expect(result.user).toEqual(fakeUser)
      expect(result.error).toBeNull()
    })

    it("returns null when not authenticated", async () => {
      mockPb.authStore.record = null

      const result = await getCurrentUser()
      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe("getSession", () => {
    it("returns session when isValid is true", async () => {
      mockPb.authStore.isValid = true

      const result = await getSession()
      expect(result.session).toBe(mockPb.authStore)
      expect(result.error).toBeNull()
    })

    it("returns null when isValid is false", async () => {
      mockPb.authStore.isValid = false

      const result = await getSession()
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
    })
  })
})
