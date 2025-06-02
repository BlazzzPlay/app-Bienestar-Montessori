import { supabase } from "./supabase"
import { processImage, validateImageFile, validateImageDimensions, generateSecureFileName } from "./image-utils"
import type { ProcessedImage } from "./image-utils"

export interface AvatarUploadResult {
  success: boolean
  data?: {
    path: string
    originalUrl: string
    fileName: string
    size: number
    dimensions: { width: number; height: number }
  }
  error?: string
  debugInfo?: any
}

/**
 * Servicio de avatares con autenticación simplificada
 */
export class FixedAvatarStorageService {
  private static instance: FixedAvatarStorageService
  private readonly BUCKET_NAME = "avatars"

  static getInstance(): FixedAvatarStorageService {
    if (!FixedAvatarStorageService.instance) {
      FixedAvatarStorageService.instance = new FixedAvatarStorageService()
    }
    return FixedAvatarStorageService.instance
  }

  /**
   * Subir avatar con autenticación simplificada
   */
  async uploadAvatar(file: File, userRut: string, userId: string): Promise<AvatarUploadResult> {
    try {
      console.log("🚀 Iniciando subida de avatar (versión simplificada)...")

      // 1. Validaciones básicas
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error }
      }

      const dimensionValidation = await validateImageDimensions(file, 50, 50)
      if (!dimensionValidation.isValid) {
        return { success: false, error: dimensionValidation.error }
      }

      console.log("✅ Validaciones pasadas")

      // 2. Procesar imagen
      const processedImage = await this.processImageForAvatar(file)
      console.log(`📦 Imagen procesada: ${(processedImage.size / 1024).toFixed(1)}KB`)

      // 3. Generar nombre único
      const fileName = generateSecureFileName(userRut, file.name)
      console.log(`📝 Nombre de archivo: ${fileName}`)

      // 4. Intentar subida directa sin autenticación compleja
      const uploadResult = await this.uploadDirect(processedImage.blob, fileName)

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error,
          debugInfo: uploadResult.debugInfo,
        }
      }

      console.log("✅ Imagen subida exitosamente")

      // 5. Obtener URL pública
      const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: fileName,
          originalUrl: data.publicUrl,
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
   * Subida directa con debugging detallado
   */
  private async uploadDirect(
    blob: Blob,
    fileName: string,
  ): Promise<{ success: boolean; error?: string; debugInfo?: any }> {
    try {
      console.log("📤 Intentando subida directa...")

      // Verificar configuración de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("🔧 Configuración Supabase:", {
        url: supabaseUrl ? "✅ Configurado" : "❌ Faltante",
        key: supabaseKey ? "✅ Configurado" : "❌ Faltante",
      })

      // Verificar bucket
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        return {
          success: false,
          error: `Error listando buckets: ${bucketsError.message}`,
          debugInfo: { bucketsError },
        }
      }

      const avatarsBucket = buckets?.find((b) => b.name === this.BUCKET_NAME)
      if (!avatarsBucket) {
        return {
          success: false,
          error: `Bucket '${this.BUCKET_NAME}' no encontrado`,
          debugInfo: { availableBuckets: buckets?.map((b) => b.name) },
        }
      }

      console.log("✅ Bucket encontrado:", avatarsBucket)

      // Intentar subida con configuración específica
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

      if (error) {
        console.error("❌ Error en subida:", error)
        return {
          success: false,
          error: `Error de subida: ${error.message}`,
          debugInfo: {
            errorCode: error.name,
            errorMessage: error.message,
            bucketConfig: avatarsBucket,
          },
        }
      }

      console.log("✅ Subida exitosa:", data)
      return { success: true }
    } catch (error) {
      console.error("❌ Excepción en uploadDirect:", error)
      return {
        success: false,
        error: `Excepción: ${error}`,
        debugInfo: { exception: error },
      }
    }
  }

  /**
   * Procesar imagen con configuración optimizada
   */
  private async processImageForAvatar(file: File): Promise<ProcessedImage> {
    return await processImage(file, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
      format: "jpeg",
    })
  }

  /**
   * Verificar configuración del sistema
   */
  async verifyConfiguration(): Promise<{
    success: boolean
    details: {
      supabaseConnection: boolean
      bucketExists: boolean
      bucketPublic: boolean
      policies: any[]
    }
    errors: string[]
  }> {
    const errors: string[] = []
    const details = {
      supabaseConnection: false,
      bucketExists: false,
      bucketPublic: false,
      policies: [] as any[],
    }

    try {
      // Verificar conexión
      const { data: testData, error: testError } = await supabase.from("perfiles").select("id").limit(1)

      if (testError) {
        errors.push(`Error de conexión: ${testError.message}`)
      } else {
        details.supabaseConnection = true
      }

      // Verificar bucket
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        errors.push(`Error listando buckets: ${bucketsError.message}`)
      } else {
        const bucket = buckets?.find((b) => b.name === this.BUCKET_NAME)
        if (bucket) {
          details.bucketExists = true
          details.bucketPublic = bucket.public
        } else {
          errors.push(`Bucket '${this.BUCKET_NAME}' no encontrado`)
        }
      }

      // Verificar políticas (esto puede fallar sin service role)
      try {
        const { data: policies } = await supabase.rpc("get_storage_policies")
        details.policies = policies || []
      } catch (policyError) {
        console.warn("No se pudieron obtener políticas:", policyError)
      }

      return {
        success: errors.length === 0,
        details,
        errors,
      }
    } catch (error) {
      errors.push(`Error general: ${error}`)
      return {
        success: false,
        details,
        errors,
      }
    }
  }
}

export const fixedAvatarStorage = FixedAvatarStorageService.getInstance()
