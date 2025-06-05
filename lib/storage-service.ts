import { supabase } from "./supabase"

/**
 * Servicio para gestionar el almacenamiento de archivos en Supabase
 * Este enfoque usa la API de Supabase en lugar de SQL directo
 */
export const storageService = {
  /**
   * Sube un archivo al bucket especificado
   */
  async uploadFile(
    bucketName: string,
    filePath: string,
    file: File,
    options?: { contentType?: string; upsert?: boolean },
  ) {
    try {
      // Verificar si el bucket existe, si no, intentar crearlo
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === bucketName)

      if (!bucketExists) {
        console.log(`Bucket ${bucketName} no existe, intentando crear...`)
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        })

        if (error) {
          console.error("Error creando bucket:", error)
          throw error
        }

        console.log(`Bucket ${bucketName} creado:`, data)
      }

      // Subir el archivo
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error en uploadFile:", error)
      throw error
    }
  },

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(bucketName: string, filePath: string) {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  },

  /**
   * Elimina un archivo
   */
  async deleteFile(bucketName: string, filePath: string) {
    const { error } = await supabase.storage.from(bucketName).remove([filePath])
    if (error) throw error
    return true
  },

  /**
   * Lista archivos en un bucket
   */
  async listFiles(bucketName: string, folderPath?: string) {
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath || "")

    if (error) throw error
    return data
  },

  /**
   * Verifica si un bucket existe
   */
  async bucketExists(bucketName: string) {
    try {
      const { data } = await supabase.storage.listBuckets()
      return data?.some((bucket) => bucket.name === bucketName) || false
    } catch (error) {
      console.error("Error verificando bucket:", error)
      return false
    }
  },

  /**
   * Diagnóstico del sistema de almacenamiento
   */
  async diagnostics() {
    try {
      // Verificar buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        return {
          status: "error",
          message: "Error al listar buckets",
          error: bucketsError,
        }
      }

      // Verificar permisos intentando listar archivos en cada bucket
      const bucketTests = await Promise.all(
        (buckets || []).map(async (bucket) => {
          try {
            const { data, error } = await supabase.storage.from(bucket.name).list()
            return {
              bucket: bucket.name,
              canList: !error,
              filesCount: data?.length || 0,
              error: error ? error.message : null,
            }
          } catch (e) {
            return {
              bucket: bucket.name,
              canList: false,
              filesCount: 0,
              error: e instanceof Error ? e.message : "Error desconocido",
            }
          }
        }),
      )

      return {
        status: "success",
        buckets: buckets || [],
        bucketTests,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: "error",
        message: "Error en diagnóstico de almacenamiento",
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  },
}
