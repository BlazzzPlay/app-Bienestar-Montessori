import { supabase } from "./supabase"
import { processImage, validateImageFile, validateImageDimensions, generateSecureFileName } from "./image-utils"
import { imageOptimizer } from "./supabase-image-optimizer"
import type { ProcessedImage } from "./image-utils"

export interface AvatarUploadResult {
  success: boolean
  data?: {
    path: string
    originalUrl: string
    optimizedUrls: {
      thumbnail: string
      small: string
      medium: string
      large: string
    }
    fileName: string
    size: number
    dimensions: { width: number; height: number }
  }
  error?: string
}

export interface AvatarUploadOptions {
  compressionEnabled?: boolean
  useWebP?: boolean
}

/**
 * Servicio de producción para avatares con optimización Supabase
 */
export class ProductionAvatarStorageService {
  private static instance: ProductionAvatarStorageService
  private readonly BUCKET_NAME = "avatars"
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000

  static getInstance(): ProductionAvatarStorageService {
    if (!ProductionAvatarStorageService.instance) {
      ProductionAvatarStorageService.instance = new ProductionAvatarStorageService()
    }
    return ProductionAvatarStorageService.instance
  }

  /**
   * Subir avatar con máxima optimización
   */
  async uploadAvatar(
    file: File,
    userRut: string,
    userId: string,
    options: AvatarUploadOptions = {},
  ): Promise<AvatarUploadResult> {
    const { compressionEnabled = true, useWebP = true } = options

    try {
      console.log("🚀 Iniciando subida de avatar...")

      // 1. Validaciones iniciales
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error }
      }

      const dimensionValidation = await validateImageDimensions(file, 50, 50)
      if (!dimensionValidation.isValid) {
        return { success: false, error: dimensionValidation.error }
      }

      console.log("✅ Validaciones pasadas")

      // 2. Procesar imagen con compresión agresiva para ahorrar espacio
      const processedImage = await this.processImageForAvatar(file, compressionEnabled)
      console.log(`📦 Imagen procesada: ${(processedImage.size / 1024).toFixed(1)}KB`)

      // 3. Generar nombre de archivo único
      const fileName = generateSecureFileName(userRut, file.name)
      console.log(`📝 Nombre de archivo: ${fileName}`)

      // 4. Eliminar avatar anterior para ahorrar espacio
      await this.deleteOldAvatar(userId)

      // 5. Subir imagen con reintentos
      const uploadResult = await this.uploadWithRetry(processedImage.blob, fileName)
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error }
      }

      console.log("✅ Imagen subida exitosamente")

      // 6. Generar URLs optimizadas usando Supabase Image Transformations
      const optimizedUrls = imageOptimizer.getMultiSizeAvatarUrls(fileName)

      return {
        success: true,
        data: {
          path: fileName,
          originalUrl: optimizedUrls.large.originalUrl,
          optimizedUrls: {
            thumbnail: optimizedUrls.thumbnail.optimizedUrl,
            small: optimizedUrls.small.optimizedUrl,
            medium: optimizedUrls.medium.optimizedUrl,
            large: optimizedUrls.large.optimizedUrl,
          },
          fileName: fileName,
          size: processedImage.size,
          dimensions: processedImage.dimensions,
        },
      }
    } catch (error) {
      console.error("❌ Error en uploadAvatar:", error)
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  /**
   * Procesar imagen con compresión máxima
   */
  private async processImageForAvatar(file: File, compressionEnabled: boolean): Promise<ProcessedImage> {
    if (!compressionEnabled) {
      const blob = new Blob([file], { type: "image/jpeg" })
      return {
        blob,
        fileName: file.name,
        size: blob.size,
        dimensions: { width: 0, height: 0 },
      }
    }

    // Compresión agresiva para maximizar espacio disponible
    return await processImage(file, {
      maxWidth: 300, // Reducido de 400 a 300
      maxHeight: 300,
      quality: 0.65, // Reducido de 0.85 a 0.65 para mayor compresión
      format: "jpeg", // JPEG para mejor compresión que PNG
    })
  }

  /**
   * Subir con reintentos mejorado
   */
  private async uploadWithRetry(
    blob: Blob,
    fileName: string,
    attempt = 1,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📤 Intento de subida ${attempt}/${this.MAX_RETRIES}`)

      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

      if (error) {
        console.error(`❌ Error en intento ${attempt}:`, error)

        if (error.message.includes("Bucket not found")) {
          return {
            success: false,
            error: `Bucket '${this.BUCKET_NAME}' no encontrado. Ejecuta el script de configuración SQL.`,
          }
        }

        if (error.message.includes("permission") || error.message.includes("policy")) {
          return {
            success: false,
            error: "Sin permisos para subir archivos. Verifica las políticas de acceso en Supabase.",
          }
        }

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt)
          return this.uploadWithRetry(blob, fileName, attempt + 1)
        }

        return {
          success: false,
          error: `Error después de ${this.MAX_RETRIES} intentos: ${error.message}`,
        }
      }

      console.log("✅ Subida exitosa:", data)
      return { success: true }
    } catch (error) {
      console.error(`❌ Excepción en intento ${attempt}:`, error)

      if (attempt < this.MAX_RETRIES) {
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
   * Eliminar avatares anteriores del usuario
   */
  private async deleteOldAvatar(userId: string): Promise<void> {
    try {
      console.log(`🗑️ Eliminando avatares anteriores del usuario ${userId}`)

      const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list("", {
        search: `avatar_`,
      })

      if (error || !files) {
        console.warn("⚠️ No se pudieron listar archivos:", error)
        return
      }

      // Filtrar archivos que contengan el ID del usuario
      const userFiles = files.filter(
        (file) => file.name.includes(`_${userId}_`) || file.name.includes(`_${userId.slice(-8)}_`), // Últimos 8 caracteres del ID
      )

      if (userFiles.length > 0) {
        const filesToDelete = userFiles.map((file) => file.name)
        console.log(`🗑️ Eliminando ${filesToDelete.length} archivos anteriores`)

        const { error: deleteError } = await supabase.storage.from(this.BUCKET_NAME).remove(filesToDelete)

        if (deleteError) {
          console.warn("⚠️ Error eliminando archivos anteriores:", deleteError)
        } else {
          console.log("✅ Archivos anteriores eliminados")
        }
      }
    } catch (error) {
      console.warn("⚠️ Error en deleteOldAvatar:", error)
    }
  }

  /**
   * Obtener estadísticas de uso del bucket
   */
  async getBucketStats(): Promise<{
    totalFiles: number
    totalSize: number
    availableSpace: number
    utilizationPercentage: number
  }> {
    try {
      const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list("")

      if (error || !files) {
        return {
          totalFiles: 0,
          totalSize: 0,
          availableSpace: 50 * 1024 * 1024, // 50MB
          utilizationPercentage: 0,
        }
      }

      const totalFiles = files.length
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
      const maxSpace = 50 * 1024 * 1024 // 50MB límite total
      const availableSpace = maxSpace - totalSize
      const utilizationPercentage = (totalSize / maxSpace) * 100

      return {
        totalFiles,
        totalSize,
        availableSpace,
        utilizationPercentage,
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error)
      return {
        totalFiles: 0,
        totalSize: 0,
        availableSpace: 50 * 1024 * 1024,
        utilizationPercentage: 0,
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Exportar instancia de producción
export const productionAvatarStorage = ProductionAvatarStorageService.getInstance()
