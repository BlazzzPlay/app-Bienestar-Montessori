import { supabase } from "./supabase"

export const storage = {
  // Subir avatar
  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data, error } = await supabase.storage.from("avatars").upload(filePath, file)

    if (error) return { data: null, error }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    return { data: { path: filePath, url: publicUrl }, error: null }
  },

  // Subir imagen de beneficio
  async uploadBeneficioImage(file: File, beneficioId: number) {
    const fileExt = file.name.split(".").pop()
    const fileName = `beneficio-${beneficioId}-${Math.random()}.${fileExt}`
    const filePath = `beneficios/${fileName}`

    const { data, error } = await supabase.storage.from("beneficios").upload(filePath, file)

    if (error) return { data: null, error }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("beneficios").getPublicUrl(filePath)

    return { data: { path: filePath, url: publicUrl }, error: null }
  },

  // Eliminar archivo
  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage.from(bucket).remove([path])

    return { data, error }
  },
}
