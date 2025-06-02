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
 * Servicio de diagnóstico avanzado para avatares
 */
export class DiagnosticAvatarStorageService {
  private static instance: DiagnosticAvatarStorageService
  private readonly BUCKET_NAME = "avatars"

  static getInstance(): DiagnosticAvatarStorageService {
    if (!DiagnosticAvatarStorageService.instance) {
      DiagnosticAvatarStorageService.instance = new DiagnosticAvatarStorageService()
    }
    return DiagnosticAvatarStorageService.instance
  }

  /**
   * Diagnóstico completo del sistema
   */
  async runCompleteDiagnostic(): Promise<{
    success: boolean
    details: any
    errors: string[]
    bucketInfo?: any
  }> {
    const errors: string[] = []
    const details: any = {}

    try {
      console.log("🔍 === DIAGNÓSTICO COMPLETO INICIADO ===")

      // 1. Verificar conexión básica
      console.log("🔍 1. Verificando conexión a Supabase...")
      const { data: testData, error: testError } = await supabase.from("perfiles").select("id").limit(1)

      if (testError) {
        console.error("❌ Error de conexión:", testError)
        errors.push(`Conexión DB: ${testError.message}`)
      } else {
        console.log("✅ Conexión DB exitosa")
        details.databaseConnection = true
      }

      // 2. Listar TODOS los buckets disponibles
      console.log("🔍 2. Listando TODOS los buckets...")
      const { data: allBuckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("❌ Error listando buckets:", bucketsError)
        errors.push(`Error listando buckets: ${bucketsError.message}`)
      } else {
        console.log("📋 Buckets encontrados:", allBuckets)
        details.allBuckets = allBuckets
        details.bucketCount = allBuckets?.length || 0

        // Buscar bucket avatars específicamente
        const avatarsBucket = allBuckets?.find((b) => b.name === this.BUCKET_NAME)
        if (avatarsBucket) {
          console.log("✅ Bucket 'avatars' encontrado:", avatarsBucket)
          details.bucket = avatarsBucket
        } else {
          console.log("❌ Bucket 'avatars' NO encontrado")
          console.log(
            "📋 Buckets disponibles:",
            allBuckets?.map((b) => b.name),
          )
          errors.push(`Bucket '${this.BUCKET_NAME}' no encontrado`)
        }
      }

      // 3. Si el bucket existe, listar archivos
      if (details.bucket) {
        console.log("🔍 3. Listando archivos en bucket avatars...")
        try {
          const { data: files, error: filesError } = await supabase.storage.from(this.BUCKET_NAME).list("", {
            limit: 10,
          })

          if (filesError) {
            console.error("❌ Error listando archivos:", filesError)
            errors.push(`Error listando archivos: ${filesError.message}`)
          } else {
            console.log("📁 Archivos en bucket:", files)
            details.filesInBucket = files
            details.fileCount = files?.length || 0
          }
        } catch (listError) {
          console.error("❌ Excepción listando archivos:", listError)
          errors.push(`Excepción listando archivos: ${listError}`)
        }
      }

      // 4. Test de subida simple (sin autenticación compleja)
      if (details.bucket) {
        console.log("🔍 4. Test de subida simple...")
        try {
          const testBlob = await this.createTestImageBlob()
          const testFileName = `diagnostic_test_${Date.now()}.jpg`

          console.log(`📤 Intentando subir: ${testFileName}`)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(testFileName, testBlob, {
              upsert: true,
              contentType: "image/jpeg",
            })

          if (uploadError) {
            console.error("❌ Error en test de subida:", uploadError)
            errors.push(`Test upload: ${uploadError.message}`)
            details.uploadTest = {
              success: false,
              error: uploadError.message,
              errorCode: uploadError.name,
            }
          } else {
            console.log("✅ Test de subida exitoso:", uploadData)
            details.uploadTest = {
              success: true,
              path: uploadData.path,
              fullPath: uploadData.fullPath,
            }

            // Intentar obtener URL pública
            const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(testFileName)
            console.log("🔗 URL pública generada:", urlData.publicUrl)
            details.uploadTest.publicUrl = urlData.publicUrl

            // Limpiar archivo de prueba
            console.log("🧹 Limpiando archivo de prueba...")
            const { error: deleteError } = await supabase.storage.from(this.BUCKET_NAME).remove([testFileName])
            if (deleteError) {
              console.warn("⚠️ Error limpiando archivo de prueba:", deleteError)
            } else {
              console.log("✅ Archivo de prueba limpiado")
            }
          }
        } catch (uploadException) {
          console.error("❌ Excepción en test de subida:", uploadException)
          errors.push(`Test upload exception: ${uploadException}`)
        }
      }

      // 5. Verificar configuración de Supabase
      console.log("🔍 5. Verificando configuración de Supabase...")
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        details.supabaseConfig = {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "No configurada",
          keyPreview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "No configurada",
        }

        console.log("🔧 Configuración Supabase:", details.supabaseConfig)
      } catch (configError) {
        console.error("❌ Error verificando configuración:", configError)
        errors.push(`Error de configuración: ${configError}`)
      }

      console.log("🔍 === DIAGNÓSTICO COMPLETO FINALIZADO ===")
      console.log(`📊 Errores encontrados: ${errors.length}`)
      console.log(`📊 Detalles recopilados: ${Object.keys(details).length} categorías`)

      return {
        success: errors.length === 0,
        details,
        errors,
        bucketInfo: details.bucket,
      }
    } catch (error) {
      console.error("❌ Error general en diagnóstico:", error)
      errors.push(`Error general: ${error}`)
      return {
        success: false,
        details,
        errors,
      }
    }
  }

  /**
   * Subir avatar con diagnóstico detallado
   */
  async uploadAvatar(file: File, userRut: string): Promise<AvatarUploadResult> {
    try {
      console.log("🚀 === SUBIDA CON DIAGNÓSTICO INICIADA ===")

      // 1. Validaciones básicas
      console.log("🔍 1. Validando archivo...")
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error }
      }
      console.log("✅ Archivo válido")

      // 2. Procesar imagen
      console.log("🔍 2. Procesando imagen...")
      const processedImage = await processImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
        format: "jpeg",
      })
      console.log("✅ Imagen procesada:", {
        originalSize: file.size,
        processedSize: processedImage.size,
        reduction: `${(((file.size - processedImage.size) / file.size) * 100).toFixed(1)}%`,
      })

      // 3. Generar nombre único
      const fileName = `avatar_${userRut.replace(/[.-]/g, "")}_${Date.now()}.jpg`
      console.log(`📝 Nombre de archivo: ${fileName}`)

      // 4. Verificar bucket antes de subir
      console.log("🔍 3. Verificando bucket antes de subir...")
      const { data: buckets } = await supabase.storage.listBuckets()
      const targetBucket = buckets?.find((b) => b.name === this.BUCKET_NAME)

      if (!targetBucket) {
        return {
          success: false,
          error: `Bucket '${this.BUCKET_NAME}' no existe`,
          debugInfo: {
            availableBuckets: buckets?.map((b) => b.name) || [],
          },
        }
      }

      console.log("✅ Bucket confirmado:", targetBucket)

      // 5. Subida real
      console.log("🔍 4. Ejecutando subida...")
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
            bucketExists: !!targetBucket,
          },
        }
      }

      console.log("✅ Subida exitosa:", data)

      // 6. Obtener URL pública
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName)
      console.log("🔗 URL pública:", urlData.publicUrl)

      console.log("🚀 === SUBIDA COMPLETADA EXITOSAMENTE ===")

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
    }
  }

  /**
   * Crear un blob de imagen de prueba
   */
  private async createTestImageBlob(): Promise<Blob> {
    const canvas = document.createElement("canvas")
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#FF0000"
      ctx.fillRect(0, 0, 10, 10)
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

export const diagnosticAvatarStorage = DiagnosticAvatarStorageService.getInstance()
