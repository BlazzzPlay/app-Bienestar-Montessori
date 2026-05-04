import { supabase } from "./supabaseClient"

function getExt(file: File) {
  const parts = file.name.split(".")
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "jpg" : "jpg"
}

export const storage = {
  async uploadAvatar(file: File, userId: string) {
    try {
      const ext = getExt(file)
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })

      if (uploadError) {
        return { data: null, error: { message: uploadError.message } }
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      return { data: { path, url: data.publicUrl }, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Error al subir avatar" } }
    }
  },

  async getAvatarUrl(userId: string) {
    try {
      const { data: listData } = await supabase.storage.from("avatars").list(userId, { limit: 1 })

      const file = listData?.[0]
      if (!file) return null

      const { data } = supabase.storage.from("avatars").getPublicUrl(`${userId}/${file.name}`)
      return data.publicUrl
    } catch {
      return null
    }
  },

  async uploadBeneficioImage(file: File, beneficioId: number) {
    try {
      const ext = getExt(file)
      const path = `${beneficioId}/cover.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("beneficios")
        .upload(path, file, { upsert: true })

      if (uploadError) {
        return { data: null, error: { message: uploadError.message } }
      }

      const { data } = supabase.storage.from("beneficios").getPublicUrl(path)
      return { data: { path, url: data.publicUrl }, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Error al subir imagen" } }
    }
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path])
    return { data: !error, error }
  },
}
