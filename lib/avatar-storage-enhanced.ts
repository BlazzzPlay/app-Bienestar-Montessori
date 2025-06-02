import { supabase } from "./supabase"
import { processImage, validateImageFile, validateImageDimensions, generateSecureFileName } from "./image-utils"
import { supabaseDiagnostics } from "./supabase-diagnostics"
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
  diagnostics?: string
}

export interface AvatarUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  compressionEnabled?: boolean
  fallbackToLocal?: boolean
}

/**
 * Servicio mejorado para manejo de avatares con diagnósticos
 */
export class EnhancedAvatarStorageService {
  private static instance: EnhancedAvatarStorageService
  private readonly BUCKET_NAME = "avatars"
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000
  private bucketVerified = false
  private fallbackStorage = new Map<string, string>() // Almacenamiento local temporal

  static getInstance(): EnhancedAvatarStorageService {
    if (!EnhancedAvatarStorageService.instance) {
      EnhancedAvatarStorageService.instance = new EnhancedAvatarStorageService()
    }
    return EnhancedAvatarStorageService.instance
  }

  /**
   * Verificar y configurar bucket antes de usar
   */
  private async ensureBucketExists(): Promise<{ success: boolean; error?: string; diagnostics?: string }> {
    if (this.bucketVerified) {
      return { success: true }
    }

    try {
      // Ejecutar diagnóstico completo
      const diagnosis = await supabaseDiagnostics.diagnoseBucket(this.BUCKET_NAME)

      if (!diagnosis.bucketExists) {
        // Intentar crear bucket automáticamente
        const createResult = await supabaseDiagnostics.createBucketIfNotExists(this.BUCKET_NAME)

        if (!createResult.success) {
          const diagnosticReport = await supabaseDiagnostics.generateDiagnosticReport(this.BUCKET_NAME)
          return {
            success: false,
            error: `Bucket no existe y no se pudo crear: ${createResult.error}`,
            diagnostics: diagnosticReport,
          }
        }

        // Configurar políticas
        await supabaseDiagnostics.setupBucketPolicies(this.BUCKET_NAME)
      }

      if (!diagnosis.hasWriteAccess) {
        const diagnosticReport = await supabaseDiagnostics.generateDiagnosticReport(this.BUCKET_NAME)
        return {
          success: false,
          error: "Sin permisos de escritura en el bucket",
          diagnostics: diagnosticReport,
        }
      }

      this.bucketVerified = true
      return { success: true }
    } catch (error) {
      const diagnosticReport = await supabaseDiagnostics.generateDiagnosticReport(this.BUCKET_NAME)
      return {
        success: false,
        error: `Error verificando bucket: ${error}`,
        diagnostics: diagnosticReport,
      }
    }
  }

  /**
   * Subir avatar con manejo robusto de errores
   */
  async uploadAvatar(
    file: File,
    userRut: string,
    userId: string,
    options: AvatarUploadOptions = {},
  ): Promise<AvatarUploadResult> {
    const { fallbackToLocal = true } = options

    try {
      // 1. Validaciones iniciales
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: fileValidation.error,
        }
      }

      const dimensionValidation = await validateImageDimensions(file, 100, 100)
      if (!dimensionValidation.isValid) {
        return {
          success: false,
          error: dimensionValidation.error,
        }
      }

      // 2. Procesar imagen
      const processedImage = await this.processImageForAvatar(file, options)
      const fileName = generateSecureFileName(userRut, file.name)

      // 3. Verificar bucket
      const bucketCheck = await this.ensureBucketExists()
      if (!bucketCheck.success) {
        if (fallbackToLocal) {
          return this.fallbackToLocalStorage(processedImage, fileName, userId)
        }

        return {
          success: false,
          error: bucketCheck.error,
          diagnostics: bucketCheck.diagnostics,
        }
      }

      // 4. Intentar subida con reintentos
      const uploadResult = await this.uploadWithRetry(processedImage.blob, fileName)

      if (!uploadResult.success) {
        if (fallbackToLocal) {
          return this.fallbackToLocalStorage(processedImage, fileName, userId)
        }

        const diagnosticReport = await supabaseDiagnostics.generateDiagnosticReport(this.BUCKET_NAME)
        return {
          success: false,
          error: uploadResult.error,
          diagnostics: diagnosticReport,
        }
      }

      // 5. Limpiar avatares anteriores
      await this.deleteOldAvatar(userId)

      // 6. Obtener URL pública
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

      if (fallbackToLocal) {
        try {
          const processedImage = await this.processImageForAvatar(file, options)
          const fileName = generateSecureFileName(userRut, file.name)
          return this.fallbackToLocalStorage(processedImage, fileName, userId)
        } catch (fallbackError) {
          return {
            success: false,
            error: `Error en subida y fallback: ${error}`,
          }
        }
      }

      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  /**
   * Fallback a almacenamiento local temporal
   */
  private async fallbackToLocalStorage(
    processedImage: ProcessedImage,
    fileName: string,
    userId: string,
  ): Promise<AvatarUploadResult> {
    try {
      // Crear URL temporal local
      const localUrl = URL.createObjectURL(processedImage.blob)

      // Guardar en almacenamiento temporal
      this.fallbackStorage.set(userId, localUrl)

      console.warn("Usando almacenamiento local temporal para avatar")

      return {
        success: true,
        data: {
          path: fileName,
          url: localUrl,
          fileName: fileName,
          size: processedImage.size,
          dimensions: processedImage.dimensions,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: `Error en fallback local: ${error}`,
      }
    }
  }

  /**
   * Procesar imagen para avatar
   */
  private async processImageForAvatar(file: File, options: AvatarUploadOptions): Promise<ProcessedImage> {
    const { maxWidth = 400, maxHeight = 400, quality = 0.85, compressionEnabled = true } = options

    if (compressionEnabled) {
      return await processImage(file, {
        maxWidth,
        maxHeight,
        quality,
        format: "jpeg",
      })
    } else {
      const blob = new Blob([file], { type: "image/jpeg" })
      return {
        blob,
        fileName: file.name,
        size: blob.size,
        dimensions: { width: 0, height: 0 },
      }
    }
  }

  /**
   * Subir con reintentos y mejor manejo de errores
   */
  private async uploadWithRetry(
    blob: Blob,
    fileName: string,
    attempt = 1,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

      if (error) {
        // Analizar tipo de error
        if (error.message.includes("Bucket not found")) {
          this.bucketVerified = false // Resetear verificación
          return {
            success: false,
            error: `Bucket '${this.BUCKET_NAME}' no encontrado. Verifica la configuración en Supabase.`,
          }
        }

        if (error.message.includes("permission")) {
          return {
            success: false,
            error: "Sin permisos para subir archivos. Verifica las políticas de acceso.",
          }
        }

        if (error.message.includes("network") || error.message.includes("timeout")) {
          if (attempt < this.MAX_RETRIES) {
            console.warn(`Intento ${attempt} falló por red, reintentando...`)
            await this.delay(this.RETRY_DELAY * attempt)
            return this.uploadWithRetry(blob, fileName, attempt + 1)
          }
        }

        if (attempt < this.MAX_RETRIES) {
          console.warn(`Intento ${attempt} falló, reintentando...`, error)
          await this.delay(this.RETRY_DELAY * attempt)
          return this.uploadWithRetry(blob, fileName, attempt + 1)
        }

        return {
          success: false,
          error: `Error después de ${this.MAX_RETRIES} intentos: ${error.message}`,
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
        error: `Error de conexión después de ${this.MAX_RETRIES} intentos: ${error}`,
      }
    }
  }

  /**
   * Eliminar avatar anterior
   */
  private async deleteOldAvatar(userId: string): Promise<void> {
    try {
      const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list("", {
        search: `avatar_${userId}`,
      })

      if (error || !files) {
        console.warn("No se pudieron listar archivos existentes:", error)
        return
      }

      if (files.length > 0) {
        const filesToDelete = files.map((file) => file.name)
        const { error: deleteError } = await supabase.storage.from(this.BUCKET_NAME).remove(filesToDelete)

        if (deleteError) {
          console.warn("Error eliminando archivos anteriores:", deleteError)
        }
      }
    } catch (error) {
      console.warn("Error en deleteOldAvatar:", error)
    }
  }

  /**
   * Obtener URL pública
   */
  private getPublicUrl(fileName: string): string {
    const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName)
    return data.publicUrl
  }

  /**
   * Obtener avatar desde fallback local
   */
  getFallbackAvatar(userId: string): string | null {
    return this.fallbackStorage.get(userId) || null
  }

  /**
   * Limpiar almacenamiento local
   */
  clearFallbackStorage(): void {
    this.fallbackStorage.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url)
      }
    })
    this.fallbackStorage.clear()
  }

  /**
   * Ejecutar diagnóstico completo
   */
  async runDiagnostics(): Promise<string> {
    return await supabaseDiagnostics.generateDiagnosticReport(this.BUCKET_NAME)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Exportar instancia mejorada
export const enhancedAvatarStorage = EnhancedAvatarStorageService.getInstance()
