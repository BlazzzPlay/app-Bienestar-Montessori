import { supabase } from "./supabase"
import { supabaseAuthService } from "./supabase-auth-service"
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
 * Servicio de avatares con autenticación mejorada
 */
export class AuthenticatedAvatarStorageService {
  private static instance: AuthenticatedAvatarStorageService
  private readonly BUCKET_NAME = "avatars"

  static getInstance(): AuthenticatedAvatarStorageService {
    if (!AuthenticatedAvatarStorageService.instance) {
      AuthenticatedAvatarStorageService.instance = new AuthenticatedAvatarStorageService()
    }
    return AuthenticatedAvatarStorageService.instance
  }

  /**
   * Subir avatar con autenticación mejorada
   */
  async uploadAvatar(file: File, userRut: string, userEmail: string, userId: string): Promise<AvatarUploadResult> {
    let sessionCreated = false

    try {
      console.log("🚀 Iniciando subida autenticada...")

      // 1. Validaciones básicas
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error }
      }

      // 2. Crear sesión temporal para la subida
      console.log("🔐 Estableciendo autenticación...")
      const authResult = await supabaseAuthService.createTemporarySession(userEmail, userId)

      if (!authResult.success) {
        return {
          success: false,
          error: "No se pudo establecer autenticación",
          debugInfo: { authError: authResult.error },
        }
      }

      sessionCreated = true

      // 3. Procesar imagen
      console.log("🖼️ Procesando imagen...")
      const processedImage = await processImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
        format: "jpeg",
      })

      // 4. Generar nombre único
      const fileName = `avatar_${userRut.replace(/[.-]/g, "")}_${Date.now()}.jpg`
      console.log(`📝 Archivo: ${fileName}`)

      // 5. Verificar sesión antes de subir
      const currentSession = await supabaseAuthService.getActiveSession()
      console.log("🔍 Sesión activa:", currentSession ? "Sí" : "No")

      // 6. Subida con autenticación
      console.log("📤 Subiendo archivo...")
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, processedImage.blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

      if (error) {
        console.error("❌ Error de subida:", error)
        return {
          success: false,
          error: `Error de subida: ${error.message}`,
          debugInfo: {
            errorCode: error.name,
            errorMessage: error.message,
            fileName: fileName,
            fileSize: processedImage.size,
            hasSession: !!currentSession,
          },
        }
      }

      console.log("✅ Subida exitosa:", data)

      // 7. Obtener URL pública
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
      console.error("❌ Excepción en subida:", error)
      return {
        success: false,
        error: `Excepción: ${error instanceof Error ? error.message : "Error desconocido"}`,
        debugInfo: { exception: String(error) },
      }
    } finally {
      // Limpiar sesión temporal
      if (sessionCreated) {
        console.log("🧹 Limpiando sesión temporal...")
        await supabaseAuthService.clearTemporarySession()
      }
    }
  }

  /**
   * Verificar configuración con autenticación
   */
  async checkConfiguration(
    userEmail: string,
    userId: string,
  ): Promise<{
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

      // 3. Test de autenticación y subida
      if (details.bucket) {
        console.log("🔍 Probando autenticación y subida...")
        try {
          // Crear sesión temporal
          const authResult = await supabaseAuthService.createTemporarySession(userEmail, userId)

          if (!authResult.success) {
            errors.push(`Auth test: ${authResult.error}`)
            details.authTest = { success: false, error: authResult.error }
          } else {
            details.authTest = { success: true }

            // Probar subida con autenticación
            const testBlob = await this.createTestImageBlob()
            const testFileName = `test_auth_${Date.now()}.jpg`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(this.BUCKET_NAME)
              .upload(testFileName, testBlob, { upsert: true, contentType: "image/jpeg" })

            if (uploadError) {
              errors.push(`Test upload: ${uploadError.message}`)
              details.uploadTest = { success: false, error: uploadError.message }
            } else {
              details.uploadTest = { success: true, path: uploadData.path }
              console.log("✅ Test upload con auth OK")

              // Limpiar archivo de prueba
              await supabase.storage.from(this.BUCKET_NAME).remove([testFileName])
            }

            // Limpiar sesión de prueba
            await supabaseAuthService.clearTemporarySession()
          }
        } catch (authException) {
          errors.push(`Auth/Upload test exception: ${authException}`)
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
   * Crear un blob de imagen de prueba
   */
  private async createTestImageBlob(): Promise<Blob> {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "blue"
      ctx.fillRect(0, 0, 1, 1)
    }

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
}

export const authenticatedAvatarStorage = AuthenticatedAvatarStorageService.getInstance()
