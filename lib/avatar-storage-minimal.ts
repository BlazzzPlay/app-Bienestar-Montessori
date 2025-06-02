import { supabase } from "./supabase"
import { processImage, validateImageFile } from "./image-utils"

export interface AvatarUploadResult {
  success: boolean
  data?: {
    path: string
    publicUrl: string
    fileName: string
  }
  error?: string
  debugInfo?: any
}

/**
 * Servicio de avatares ultra-simplificado para debugging
 */
export class MinimalAvatarStorageService {
  private static instance: MinimalAvatarStorageService
  private readonly BUCKET_NAME = "avatars"

  static getInstance(): MinimalAvatarStorageService {
    if (!MinimalAvatarStorageService.instance) {
      MinimalAvatarStorageService.instance = new MinimalAvatarStorageService()
    }
    return MinimalAvatarStorageService.instance
  }

  /**
   * Subir avatar con el mínimo de complejidad
   */
  async uploadAvatar(file: File, userRut: string): Promise<AvatarUploadResult> {
    try {
      console.log("🚀 Subida minimal iniciada...")

      // 1. Validaciones básicas
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error }
      }

      // 2. Procesar imagen (simplificado)
      const processedImage = await processImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
        format: "jpeg",
      })

      // 3. Generar nombre único
      const fileName = `avatar_${userRut}_${Date.now()}.jpg`
      console.log(`📝 Archivo: ${fileName}`)

      // 4. Subida directa sin autenticación compleja
      console.log("📤 Intentando subida...")

      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, processedImage.blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

      if (error) {
        console.error("❌ Error de subida:", error)
        return {
          success: false,
          error: `Error: ${error.message}`,
          debugInfo: {
            errorCode: error.name,
            errorMessage: error.message,
            fileName: fileName,
            fileSize: processedImage.size,
          },
        }
      }

      console.log("✅ Subida exitosa:", data)

      // 5. Obtener URL pública
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: fileName,
          publicUrl: urlData.publicUrl,
          fileName: fileName,
        },
      }
    } catch (error) {
      console.error("❌ Excepción:", error)
      return {
        success: false,
        error: `Excepción: ${error instanceof Error ? error.message : "Error desconocido"}`,
        debugInfo: { exception: String(error) },
      }
    }
  }

  /**
   * Verificar configuración básica
   */
  async checkConfiguration(): Promise<{
    success: boolean
    details: any
    errors: string[]
  }> {
    const errors: string[] = []
    const details: any = {}

    try {
      // 1. Verificar conexión básica
      console.log("🔍 Verificando conexión...")
      const { data: testData, error: testError } = await supabase.from("perfiles").select("id").limit(1)

      if (testError) {
        errors.push(`Conexión DB: ${testError.message}`)
      } else {
        details.databaseConnection = true
        console.log("✅ Conexión DB OK")
      }

      // 2. Verificar bucket
      console.log("🔍 Verificando bucket...")
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        errors.push(`Buckets: ${bucketsError.message}`)
      } else {
        const avatarsBucket = buckets?.find((b) => b.name === this.BUCKET_NAME)
        if (avatarsBucket) {
          details.bucket = avatarsBucket
          console.log("✅ Bucket encontrado:", avatarsBucket)
        } else {
          errors.push(`Bucket '${this.BUCKET_NAME}' no encontrado`)
        }
      }

      // 3. Probar subida de archivo de prueba
      if (details.bucket) {
        console.log("🔍 Probando subida de prueba...")
        try {
          // Usar un blob de imagen en lugar de texto plano
          const testBlob = await this.createTestImageBlob()
          const testFileName = `test_${Date.now()}.jpg`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(testFileName, testBlob, { upsert: true, contentType: "image/jpeg" })

          if (uploadError) {
            errors.push(`Test upload: ${uploadError.message}`)
            details.uploadTest = { success: false, error: uploadError.message }
          } else {
            details.uploadTest = { success: true, path: uploadData.path }
            console.log("✅ Test upload OK")

            // Limpiar archivo de prueba
            await supabase.storage.from(this.BUCKET_NAME).remove([testFileName])
          }
        } catch (uploadException) {
          errors.push(`Test upload exception: ${uploadException}`)
        }
      } else {
        errors.push("Test upload: No se puede probar sin bucket")
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

  /**
   * Crear un blob de imagen de prueba (1x1 pixel JPEG)
   */
  private async createTestImageBlob(): Promise<Blob> {
    // Crear un canvas de 1x1 pixel
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "red"
      ctx.fillRect(0, 0, 1, 1)
    }

    // Convertir a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("No se pudo crear el blob de prueba"))
          }
        },
        "image/jpeg",
        0.8,
      )
    })
  }

  /**
   * Crear bucket si no existe
   */
  async createBucketIfNotExists(): Promise<boolean> {
    try {
      console.log("🔍 Verificando si existe el bucket...")
      const { data: buckets } = await supabase.storage.listBuckets()

      if (!buckets?.some((b) => b.name === this.BUCKET_NAME)) {
        console.log("🔧 Creando bucket...")
        const { data, error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: 2 * 1024 * 1024, // 2MB
        })

        if (error) {
          console.error("❌ Error creando bucket:", error)
          return false
        }

        console.log("✅ Bucket creado:", data)
        return true
      }

      console.log("✅ Bucket ya existe")
      return true
    } catch (error) {
      console.error("❌ Error verificando/creando bucket:", error)
      return false
    }
  }
}

export const minimalAvatarStorage = MinimalAvatarStorageService.getInstance()
