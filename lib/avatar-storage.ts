import { supabase } from "./supabase"
import { processImage, validateImageFile, validateImageDimensions, generateSecureFileName } from "./image-utils"
import type { ProcessedImage } from "./image-utils"

export interface AvatarUploadResult {
  success: boolean
  data?: {
    path: string
    url: string
    fileName: string
    size: number
    dimensions: { width: number; height: number }
  }
  error?: string
}

export interface AvatarUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  compressionEnabled?: boolean
}

/**
 * Servicio para manejo seguro de avatares
 */
export class AvatarStorageService {
  private static instance: AvatarStorageService
  private readonly BUCKET_NAME = "avatars"
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 segundo

  static getInstance(): AvatarStorageService {
    if (!AvatarStorageService.instance) {
      AvatarStorageService.instance = new AvatarStorageService()
    }
    return AvatarStorageService.instance
  }

  /**
   * Sube un avatar con procesamiento completo
   */
  async uploadAvatar(
    file: File,
    userRut: string,
    userId: string,
    options: AvatarUploadOptions = {},
  ): Promise<AvatarUploadResult> {
    try {
      // 1. Validaciones iniciales
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: fileValidation.error,
        }
      }

      // 2. Validar dimensiones
      const dimensionValidation = await validateImageDimensions(file, 100, 100)
      if (!dimensionValidation.isValid) {
        return {
          success: false,
          error: dimensionValidation.error,
        }
      }

      // 3. Procesar imagen
      const processedImage = await this.processImageForAvatar(file, options)

      // 4. Generar nombre de archivo seguro
      const fileName = generateSecureFileName(userRut, file.name)

      // 5. Eliminar avatar anterior si existe
      await this.deleteOldAvatar(userId)

      // 6. Subir nueva imagen con reintentos
      const uploadResult = await this.uploadWithRetry(processedImage.blob, fileName)

      if (!uploadResult.success) {
        return uploadResult
      }

      // 7. Obtener URL pública
      const publicUrl = this.getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: fileName,
          url: publicUrl,
          fileName: fileName,
          size: processedImage.size,
          dimensions: processedImage.dimensions,
        },
      }
    } catch (error) {
      console.error("Error en uploadAvatar:", error)
      return {
        success: false,
        error: `Error inesperado al subir imagen: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  /**
   * Procesa imagen específicamente para avatares
   */
  private async processImageForAvatar(file: File, options: AvatarUploadOptions): Promise<ProcessedImage> {
    const { maxWidth = 400, maxHeight = 400, quality = 0.85, compressionEnabled = true } = options

    try {
      if (compressionEnabled) {
        // Procesar y comprimir imagen
        return await processImage(file, {
          maxWidth,
          maxHeight,
          quality,
          format: "jpeg", // Usar JPEG para avatares (mejor compresión)
        })
      } else {
        // Solo convertir a blob sin procesamiento
        const blob = new Blob([file], { type: "image/jpeg" })
        return {
          blob,
          fileName: file.name,
          size: blob.size,
          dimensions: { width: 0, height: 0 }, // Se calculará después si es necesario
        }
      }
    } catch (error) {
      throw new Error(`Error procesando imagen: ${error}`)
    }
  }

  /**
   * Sube archivo con sistema de reintentos
   */
  private async uploadWithRetry(blob: Blob, fileName: string, attempt = 1): Promise<AvatarUploadResult> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, blob, {
        cacheControl: "3600",
        upsert: true, // Sobrescribir si existe
        contentType: "image/jpeg",
      })

      if (error) {
        if (attempt < this.MAX_RETRIES) {
          console.warn(`Intento ${attempt} falló, reintentando...`, error)
          await this.delay(this.RETRY_DELAY * attempt)
          return this.uploadWithRetry(blob, fileName, attempt + 1)
        }

        return {
          success: false,
          error: `Error al subir imagen después de ${this.MAX_RETRIES} intentos: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      if (attempt < this.MAX_RETRIES) {
        console.warn(`Intento ${attempt} falló con excepción, reintentando...`, error)
        await this.delay(this.RETRY_DELAY * attempt)
        return this.uploadWithRetry(blob, fileName, attempt + 1)
      }

      return {
        success: false,
        error: `Error de conexión después de ${this.MAX_RETRIES} intentos`,
      }
    }
  }

  /**
   * Elimina avatar anterior del usuario
   */
  private async deleteOldAvatar(userId: string): Promise<void> {
    try {
      // Buscar archivos existentes del usuario
      const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list("", {
        search: `avatar_${userId}`,
      })

      if (error || !files) {
        console.warn("No se pudieron listar archivos existentes:", error)
        return
      }

      // Eliminar archivos encontrados
      if (files.length > 0) {
        const filesToDelete = files.map((file) => file.name)
        const { error: deleteError } = await supabase.storage.from(this.BUCKET_NAME).remove(filesToDelete)

        if (deleteError) {
          console.warn("Error eliminando archivos anteriores:", deleteError)
        }
      }
    } catch (error) {
      console.warn("Error en deleteOldAvatar:", error)
      // No lanzar error, continuar con la subida
    }
  }

  /**
   * Obtiene URL pública del archivo
   */
  private getPublicUrl(fileName: string): string {
    const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName)

    return data.publicUrl
  }

  /**
   * Elimina un archivo específico
   */
  async deleteAvatar(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([fileName])

      if (error) {
        return {
          success: false,
          error: `Error eliminando archivo: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error}`,
      }
    }
  }

  /**
   * Valida si un archivo existe en el storage
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list("", {
        search: fileName,
      })

      return !error && data && data.length > 0
    } catch (error) {
      console.warn("Error verificando existencia de archivo:", error)
      return false
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileName: string): Promise<{ size?: number; lastModified?: string } | null> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list("", {
        search: fileName,
      })

      if (error || !data || data.length === 0) {
        return null
      }

      const file = data[0]
      return {
        size: file.metadata?.size,
        lastModified: file.updated_at,
      }
    } catch (error) {
      console.warn("Error obteniendo información de archivo:", error)
      return null
    }
  }

  /**
   * Utilidad para delay en reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Exportar instancia singleton
export const avatarStorage = AvatarStorageService.getInstance()
