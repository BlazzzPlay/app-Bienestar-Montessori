import { createBrowserClient } from "./pocketbase"

/**
 * Upload an avatar file to the current user's profile.
 *
 * PocketBase stores files via multipart FormData through `pb.collection().update()`.
 */
export async function uploadAvatar(userId: string, file: File) {
  try {
    const pb = createBrowserClient()
    const record = await pb.collection("users").update(userId, { avatar: file })
    const url = pb.files.getURL(record, record.avatar ?? "")
    return { data: { url }, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error?.message ?? "Error al subir avatar" } }
  }
}

/**
 * Upload an image for a beneficio record.
 */
export async function uploadBeneficioImage(beneficioId: string, file: File) {
  try {
    const pb = createBrowserClient()
    const record = await pb.collection("beneficios").update(beneficioId, { foto_local: file })
    const url = pb.files.getURL(record, record.foto_local ?? "")
    return { data: { url }, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error?.message ?? "Error al subir imagen" } }
  }
}

/**
 * Build an absolute file URL for the given record and filename.
 * Returns `null` if `filename` is falsy.
 *
 * This is a synchronous helper — it only constructs the URL, it does not
 * fetch the file.
 */
export function getFileUrl(record: Record<string, any>, filename: string): string | null {
  if (!filename) return null
  try {
    const pb = createBrowserClient()
    return pb.files.getURL(record, filename)
  } catch {
    return null
  }
}

/**
 * Delete a file field from a record by setting it to `null`.
 *
 * PocketBase treats `null` field updates as file deletion.
 */
export async function deleteFile(collection: string, recordId: string, field: string) {
  try {
    const pb = createBrowserClient()
    await pb.collection(collection).update(recordId, { [field]: null })
    return { data: true, error: null }
  } catch (error: any) {
    return {
      data: false,
      error: { message: error?.message ?? "Error al eliminar archivo" },
    }
  }
}
