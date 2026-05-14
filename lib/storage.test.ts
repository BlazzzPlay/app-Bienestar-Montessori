import { describe, it, expect, beforeEach, vi } from "vitest"

// -------------------------------------------------------------------
// Mock pocketbase-storage
// -------------------------------------------------------------------
const mockPbUploadAvatar = vi.fn()
const mockPbUploadBeneficioImage = vi.fn()
const mockPbGetFileUrl = vi.fn()

vi.mock("./pocketbase-storage", () => ({
  uploadAvatar: (...args: any[]) => mockPbUploadAvatar(...args),
  uploadBeneficioImage: (...args: any[]) => mockPbUploadBeneficioImage(...args),
  getFileUrl: (...args: any[]) => mockPbGetFileUrl(...args),
}))

// -------------------------------------------------------------------
// Mock pocketbase for getAvatarUrl
// -------------------------------------------------------------------
const mockGetOne = vi.fn()
const mockCollection = vi.fn(() => ({ getOne: mockGetOne }))

vi.mock("./pocketbase", () => ({
  createBrowserClient: vi.fn(() => ({
    collection: mockCollection,
  })),
  resetBrowserClient: vi.fn(),
}))

import { storage } from "./storage"

const fakeFile = new File(["dummy-content"], "avatar.jpg", { type: "image/jpeg" })

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPbUploadAvatar.mockReset()
    mockPbUploadBeneficioImage.mockReset()
    mockPbGetFileUrl.mockReset()
    mockGetOne.mockReset()
    mockCollection.mockClear()
  })

  describe("uploadAvatar", () => {
    it("delegates to pocketbase-storage and wraps result", async () => {
      mockPbUploadAvatar.mockResolvedValue({
        data: { url: "http://localhost:8090/api/files/users/u1/avatar_abc.jpg" },
        error: null,
      })

      const result = await storage.uploadAvatar(fakeFile, "u1")
      expect(mockPbUploadAvatar).toHaveBeenCalledWith("u1", fakeFile)
      expect(result.data?.url).toBe("http://localhost:8090/api/files/users/u1/avatar_abc.jpg")
      expect(result.data?.path).toBe("u1/avatar")
      expect(result.error).toBeNull()
    })

    it("passes through error from pocketbase-storage", async () => {
      mockPbUploadAvatar.mockResolvedValue({
        data: null,
        error: { message: "Upload failed" },
      })

      const result = await storage.uploadAvatar(fakeFile, "u1")
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Upload failed")
    })
  })

  describe("getAvatarUrl", () => {
    it("returns the avatar URL when record has avatar", async () => {
      mockGetOne.mockResolvedValue({ id: "u1", avatar: "avatar_xyz.jpg" })
      mockPbGetFileUrl.mockReturnValue("http://localhost:8090/api/files/users/u1/avatar_xyz.jpg")

      const url = await storage.getAvatarUrl("u1")
      expect(mockGetOne).toHaveBeenCalledWith("u1")
      expect(mockPbGetFileUrl).toHaveBeenCalledWith(
        { id: "u1", avatar: "avatar_xyz.jpg" },
        "avatar_xyz.jpg",
      )
      expect(url).toBe("http://localhost:8090/api/files/users/u1/avatar_xyz.jpg")
    })

    it("returns null when record has no avatar", async () => {
      mockGetOne.mockResolvedValue({ id: "u1", avatar: null })

      const url = await storage.getAvatarUrl("u1")
      expect(url).toBeNull()
      expect(mockPbGetFileUrl).not.toHaveBeenCalled()
    })

    it("returns null when getOne fails", async () => {
      mockGetOne.mockRejectedValue(new Error("Not found"))

      const url = await storage.getAvatarUrl("nonexistent")
      expect(url).toBeNull()
    })
  })

  describe("uploadBeneficioImage", () => {
    it("delegates to pocketbase-storage with string id", async () => {
      mockPbUploadBeneficioImage.mockResolvedValue({
        data: { url: "http://localhost:8090/api/files/beneficios/42/cover.jpg" },
        error: null,
      })

      const result = await storage.uploadBeneficioImage(fakeFile, 42)
      expect(mockPbUploadBeneficioImage).toHaveBeenCalledWith("42", fakeFile)
      expect(result.data?.url).toBe("http://localhost:8090/api/files/beneficios/42/cover.jpg")
      expect(result.data?.path).toBe("42/cover")
      expect(result.error).toBeNull()
    })

    it("passes through error from pocketbase-storage", async () => {
      mockPbUploadBeneficioImage.mockResolvedValue({
        data: null,
        error: { message: "Image upload failed" },
      })

      const result = await storage.uploadBeneficioImage(fakeFile, 42)
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Image upload failed")
    })
  })

  describe("deleteFile", () => {
    it("returns error indicating method is unavailable", async () => {
      const result = await storage.deleteFile("avatars", "some/path")
      expect(result.data).toBe(false)
      expect(result.error?.message).toContain("no está disponible")
    })

    it("does not delegate to pocketbase-storage", async () => {
      await storage.deleteFile("bucket", "path")
      expect(mockPbUploadAvatar).not.toHaveBeenCalled()
      expect(mockPbUploadBeneficioImage).not.toHaveBeenCalled()
    })
  })
})
