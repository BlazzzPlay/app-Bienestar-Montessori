import { describe, it, expect, beforeEach, vi } from "vitest"

// -------------------------------------------------------------------
// Mock PocketBase constructor
// -------------------------------------------------------------------
const mockUpdate = vi.fn()
const mockGetURL = vi.fn()

const mockPb: any = {
  collection: vi.fn(() => ({
    update: mockUpdate,
  })),
  authStore: {
    clear: vi.fn(),
    record: null,
    isValid: false,
    loadFromCookie: vi.fn(),
    token: "",
    exportToCookie: vi.fn(() => ""),
    onChange: vi.fn(() => vi.fn()),
    save: vi.fn(),
  },
  files: {
    getURL: mockGetURL,
    getToken: vi.fn(),
  },
  beforeSend: null as any,
}

vi.mock("pocketbase", () => ({
  default: vi.fn(() => mockPb),
}))

import { uploadAvatar, uploadBeneficioImage, getFileUrl, deleteFile } from "./pocketbase-storage"
import { resetBrowserClient } from "./pocketbase"

const fakeFile = new File(["dummy-content"], "avatar.jpg", { type: "image/jpeg" })

describe("pocketbase-storage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetBrowserClient()
    mockUpdate.mockReset()
    mockGetURL.mockReset()
  })

  describe("uploadAvatar", () => {
    it("updates users collection with avatar file and returns url", async () => {
      const fakeRecord = { id: "u1", avatar: "avatar_abc.jpg" }
      mockUpdate.mockResolvedValue(fakeRecord)
      mockGetURL.mockReturnValue("http://localhost:8090/api/files/users/u1/avatar_abc.jpg")

      const result = await uploadAvatar("u1", fakeFile)
      expect(mockUpdate).toHaveBeenCalledWith("u1", { avatar: fakeFile })
      expect(mockGetURL).toHaveBeenCalledWith(fakeRecord, "avatar_abc.jpg")
      expect(result.data?.url).toBe("http://localhost:8090/api/files/users/u1/avatar_abc.jpg")
      expect(result.error).toBeNull()
    })

    it("returns error when update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("Upload failed"))
      const result = await uploadAvatar("u1", fakeFile)
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Upload failed")
    })
  })

  describe("uploadBeneficioImage", () => {
    it("updates beneficios collection with image file and returns url", async () => {
      const fakeRecord = { id: "b1", foto_local: "cover_xyz.jpg" }
      mockUpdate.mockResolvedValue(fakeRecord)
      mockGetURL.mockReturnValue("http://localhost:8090/api/files/beneficios/b1/cover_xyz.jpg")

      const result = await uploadBeneficioImage("b1", fakeFile)
      expect(mockUpdate).toHaveBeenCalledWith("b1", { foto_local: fakeFile })
      expect(mockGetURL).toHaveBeenCalledWith(fakeRecord, "cover_xyz.jpg")
      expect(result.data?.url).toBe("http://localhost:8090/api/files/beneficios/b1/cover_xyz.jpg")
      expect(result.error).toBeNull()
    })

    it("returns error when update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("Image upload failed"))
      const result = await uploadBeneficioImage("b1", fakeFile)
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Image upload failed")
    })
  })

  describe("getFileUrl", () => {
    it("returns the file URL for a valid record and filename", () => {
      const record = { id: "r1", collectionId: "col1" }
      mockGetURL.mockReturnValue("http://localhost:8090/api/files/col1/r1/photo.jpg")

      const url = getFileUrl(record, "photo.jpg")
      expect(mockGetURL).toHaveBeenCalledWith(record, "photo.jpg")
      expect(url).toBe("http://localhost:8090/api/files/col1/r1/photo.jpg")
    })

    it("returns null when filename is empty", () => {
      const record = { id: "r1" }
      const url = getFileUrl(record, "")
      expect(url).toBeNull()
      expect(mockGetURL).not.toHaveBeenCalled()
    })

    it("returns null when filename is null/undefined", () => {
      const record = { id: "r1" }
      const url = getFileUrl(record, null as any)
      expect(url).toBeNull()
    })
  })

  describe("deleteFile", () => {
    it("sets the file field to null", async () => {
      mockUpdate.mockResolvedValue({ id: "u1", avatar: null })
      const result = await deleteFile("users", "u1", "avatar")
      expect(mockUpdate).toHaveBeenCalledWith("u1", { avatar: null })
      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    it("returns error when update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("Delete failed"))
      const result = await deleteFile("users", "u1", "avatar")
      expect(result.data).toBe(false)
      expect(result.error?.message).toBe("Delete failed")
    })
  })
})
