// Almacenamiento local de imágenes usando base64
const AVATAR_STORAGE_KEY = "bm_avatars"

interface StoredAvatar {
  userId: string
  dataUrl: string
  createdAt: string
}

function getStoredAvatars(): StoredAvatar[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(AVATAR_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveStoredAvatars(avatars: StoredAvatar[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars))
  } catch (e) {
    console.error("Error saving avatar:", e)
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const storage = {
  async uploadAvatar(file: File, userId: string) {
    try {
      const dataUrl = await fileToBase64(file)
      const avatars = getStoredAvatars()
      const existingIndex = avatars.findIndex((a) => a.userId === userId)

      const entry: StoredAvatar = {
        userId,
        dataUrl,
        createdAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        avatars[existingIndex] = entry
      } else {
        avatars.push(entry)
      }

      saveStoredAvatars(avatars)
      return { data: { path: `local://avatar/${userId}`, url: dataUrl }, error: null }
    } catch (error) {
      return { data: null, error: { message: "Error al procesar la imagen" } }
    }
  },

  async getAvatarUrl(userId: string) {
    const avatars = getStoredAvatars()
    const avatar = avatars.find((a) => a.userId === userId)
    return avatar?.dataUrl || null
  },

  async uploadBeneficioImage(file: File, _beneficioId: number) {
    // Para beneficios también usamos base64 local
    try {
      const dataUrl = await fileToBase64(file)
      return { data: { path: "local://beneficio", url: dataUrl }, error: null }
    } catch (error) {
      return { data: null, error: { message: "Error al procesar la imagen" } }
    }
  },

  async deleteFile(_bucket: string, _path: string) {
    // No-op para localStorage
    return { data: true, error: null }
  },
}
