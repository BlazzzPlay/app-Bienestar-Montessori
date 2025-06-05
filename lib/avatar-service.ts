import { storageService } from "./storage-service"
import { supabase } from "./supabase"

const AVATAR_BUCKET = "avatars"
const DEFAULT_AVATAR = "/placeholder.svg?height=300&width=300"

/**
 * Servicio para gestionar avatares de usuario
 */
export const avatarService = {
  /**
   * Sube un avatar para un usuario
   */
  async uploadAvatar(userId: string, file: File) {
    try {
      // Asegurar que el nombre de archivo sea único
      const fileExt = file.name.split(".").pop()
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

      // Subir el archivo
      await storageService.uploadFile(AVATAR_BUCKET, filePath, file, {
        contentType: file.type,
        upsert: true,
      })

      // Obtener la URL pública
      const avatarUrl = storageService.getPublicUrl(AVATAR_BUCKET, filePath)

      // Actualizar el perfil del usuario con la nueva URL
      const { error } = await supabase.from("perfiles").update({ avatar_url: avatarUrl }).eq("id", userId)

      if (error) throw error

      return { avatarUrl }
    } catch (error) {
      console.error("Error subiendo avatar:", error)
      throw error
    }
  },

  /**
   * Obtiene la URL del avatar de un usuario
   */
  async getAvatarUrl(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.from("perfiles").select("avatar_url").eq("id", userId).single()

      if (error) throw error
      return data?.avatar_url || DEFAULT_AVATAR
    } catch (error) {
      console.error("Error obteniendo avatar:", error)
      return DEFAULT_AVATAR
    }
  },

  /**
   * Elimina el avatar de un usuario
   */
  async deleteAvatar(userId: string, avatarPath: string) {
    try {
      // Extraer la ruta relativa del avatar desde la URL completa
      const pathMatch = avatarPath.match(/\/storage\/v1\/object\/public\/avatars\/(.+)$/)
      const relativePath = pathMatch ? pathMatch[1] : avatarPath

      // Eliminar el archivo
      await storageService.deleteFile(AVATAR_BUCKET, relativePath)

      // Actualizar el perfil del usuario
      const { error } = await supabase.from("perfiles").update({ avatar_url: null }).eq("id", userId)

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error eliminando avatar:", error)
      throw error
    }
  },

  /**
   * Verifica si el bucket de avatares existe
   */
  async ensureAvatarBucketExists() {
    const exists = await storageService.bucketExists(AVATAR_BUCKET)
    if (!exists) {
      console.log("El bucket de avatares no existe, intentando crear...")
      try {
        const { data, error } = await supabase.storage.createBucket(AVATAR_BUCKET, {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        })

        if (error) {
          console.error("Error creando bucket de avatares:", error)
          return false
        }

        console.log("Bucket de avatares creado:", data)
        return true
      } catch (error) {
        console.error("Error creando bucket de avatares:", error)
        return false
      }
    }
    return true
  },
}
