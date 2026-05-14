import {
  uploadAvatar as pbUploadAvatar,
  uploadBeneficioImage as pbUploadBeneficioImage,
  getFileUrl as pbGetFileUrl,
} from "./pocketbase-storage"
import { createBrowserClient } from "./pocketbase"

export const storage = {
  /**
   * Upload an avatar for the given user.
   *
   * Delegates to pocketbase-storage which calls `pb.collection("users").update()`.
   * The avatar is stored as a PB file field on the user record.
   *
   * Returns `{ data: { path, url }, error }` — same contract as the old Supabase module.
   */
  async uploadAvatar(file: File, userId: string) {
    const result = await pbUploadAvatar(userId, file)
    if (result.error) return result
    return {
      data: { path: `${userId}/avatar`, url: result.data?.url ?? "" },
      error: null,
    }
  },

  /**
   * Get the avatar URL for a user.
   *
   * Fetches the user record from PB and returns the file URL for the `avatar` field.
   * Returns `null` if the user has no avatar.
   */
  async getAvatarUrl(userId: string) {
    try {
      const pb = createBrowserClient()
      const record = await pb.collection("users").getOne(userId)
      if (!record.avatar) return null
      return pbGetFileUrl(record, record.avatar)
    } catch {
      return null
    }
  },

  /**
   * Upload an image for a beneficio record.
   *
   * Delegates to pocketbase-storage which calls `pb.collection("beneficios").update()`.
   */
  async uploadBeneficioImage(file: File, beneficioId: number) {
    const result = await pbUploadBeneficioImage(String(beneficioId), file)
    if (result.error) return result
    return {
      data: { path: `${beneficioId}/cover`, url: result.data?.url ?? "" },
      error: null,
    }
  },

  /**
   * Delete a file by bucket and path.
   *
   * NOTE: PocketBase does not use Supabase's bucket/path model.
   * Files are tied to collection record fields. To delete a file in PB,
   * use `pocketbase-storage.deleteFile(collection, recordId, field)` directly.
   *
   * This method returns an error to prevent silent no-ops.
   */
  async deleteFile(_bucket: string, _path: string) {
    return {
      data: false,
      error: {
        message:
          "deleteFile no está disponible. Usa pocketbase-storage.deleteFile(collection, recordId, field) directamente.",
      },
    }
  },
}
