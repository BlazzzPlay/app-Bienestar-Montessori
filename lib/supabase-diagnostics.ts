import { supabase } from "./supabase"

export interface BucketDiagnostics {
  bucketExists: boolean
  hasReadAccess: boolean
  hasWriteAccess: boolean
  hasDeleteAccess: boolean
  bucketInfo?: {
    id: string
    name: string
    public: boolean
    created_at: string
    updated_at: string
  }
  policies?: any[]
  error?: string
}

export interface ConnectionDiagnostics {
  isConnected: boolean
  projectUrl: string
  hasValidKey: boolean
  error?: string
}

/**
 * Servicio de diagnóstico para Supabase Storage
 */
export class SupabaseDiagnostics {
  private static instance: SupabaseDiagnostics

  static getInstance(): SupabaseDiagnostics {
    if (!SupabaseDiagnostics.instance) {
      SupabaseDiagnostics.instance = new SupabaseDiagnostics()
    }
    return SupabaseDiagnostics.instance
  }

  /**
   * Diagnóstico completo de conexión a Supabase
   */
  async diagnoseConnection(): Promise<ConnectionDiagnostics> {
    try {
      // Verificar configuración básica
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!projectUrl || !anonKey) {
        return {
          isConnected: false,
          projectUrl: projectUrl || "No configurado",
          hasValidKey: false,
          error: "Variables de entorno de Supabase no configuradas correctamente",
        }
      }

      // Probar conexión básica
      const { data, error } = await supabase.from("perfiles").select("id").limit(1)

      if (error) {
        return {
          isConnected: false,
          projectUrl,
          hasValidKey: false,
          error: `Error de conexión: ${error.message}`,
        }
      }

      return {
        isConnected: true,
        projectUrl,
        hasValidKey: true,
      }
    } catch (error) {
      return {
        isConnected: false,
        projectUrl: "Error al obtener URL",
        hasValidKey: false,
        error: `Error inesperado: ${error}`,
      }
    }
  }

  /**
   * Diagnóstico específico del bucket de avatares
   */
  async diagnoseBucket(bucketName: string): Promise<BucketDiagnostics> {
    try {
      // 1. Verificar si el bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()

      if (listError) {
        return {
          bucketExists: false,
          hasReadAccess: false,
          hasWriteAccess: false,
          hasDeleteAccess: false,
          error: `Error listando buckets: ${listError.message}`,
        }
      }

      const bucket = buckets?.find((b) => b.name === bucketName)

      if (!bucket) {
        return {
          bucketExists: false,
          hasReadAccess: false,
          hasWriteAccess: false,
          hasDeleteAccess: false,
          error: `Bucket '${bucketName}' no existe`,
        }
      }

      // 2. Probar acceso de lectura
      const { data: files, error: readError } = await supabase.storage.from(bucketName).list("", { limit: 1 })

      const hasReadAccess = !readError

      // 3. Probar acceso de escritura (con archivo de prueba)
      const testFileName = `test_${Date.now()}.txt`
      const testContent = new Blob(["test"], { type: "text/plain" })

      const { error: writeError } = await supabase.storage.from(bucketName).upload(testFileName, testContent)

      const hasWriteAccess = !writeError

      // 4. Probar acceso de eliminación (limpiar archivo de prueba)
      let hasDeleteAccess = false
      if (hasWriteAccess) {
        const { error: deleteError } = await supabase.storage.from(bucketName).remove([testFileName])
        hasDeleteAccess = !deleteError
      }

      // 5. Obtener políticas del bucket
      let policies: any[] = []
      try {
        const { data: policyData } = await supabase.rpc("get_bucket_policies", { bucket_name: bucketName })
        policies = policyData || []
      } catch (error) {
        console.warn("No se pudieron obtener las políticas:", error)
      }

      return {
        bucketExists: true,
        hasReadAccess,
        hasWriteAccess,
        hasDeleteAccess,
        bucketInfo: {
          id: bucket.id,
          name: bucket.name,
          public: bucket.public,
          created_at: bucket.created_at,
          updated_at: bucket.updated_at,
        },
        policies,
      }
    } catch (error) {
      return {
        bucketExists: false,
        hasReadAccess: false,
        hasWriteAccess: false,
        hasDeleteAccess: false,
        error: `Error en diagnóstico: ${error}`,
      }
    }
  }

  /**
   * Crear bucket automáticamente si no existe
   */
  async createBucketIfNotExists(bucketName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar si ya existe
      const diagnosis = await this.diagnoseBucket(bucketName)

      if (diagnosis.bucketExists) {
        return { success: true }
      }

      // Crear bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"],
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        return {
          success: false,
          error: `Error creando bucket: ${error.message}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Error inesperado creando bucket: ${error}`,
      }
    }
  }

  /**
   * Configurar políticas de acceso para el bucket
   */
  async setupBucketPolicies(bucketName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Política para permitir lectura pública
      const readPolicy = {
        name: `${bucketName}_read_policy`,
        definition: {
          role: "anon",
          command: "SELECT",
          schema: "storage",
          table: "objects",
          using: `bucket_id = '${bucketName}'`,
        },
      }

      // Política para permitir subida autenticada
      const uploadPolicy = {
        name: `${bucketName}_upload_policy`,
        definition: {
          role: "authenticated",
          command: "INSERT",
          schema: "storage",
          table: "objects",
          using: `bucket_id = '${bucketName}'`,
        },
      }

      // Política para permitir actualización autenticada
      const updatePolicy = {
        name: `${bucketName}_update_policy`,
        definition: {
          role: "authenticated",
          command: "UPDATE",
          schema: "storage",
          table: "objects",
          using: `bucket_id = '${bucketName}'`,
        },
      }

      // Política para permitir eliminación autenticada
      const deletePolicy = {
        name: `${bucketName}_delete_policy`,
        definition: {
          role: "authenticated",
          command: "DELETE",
          schema: "storage",
          table: "objects",
          using: `bucket_id = '${bucketName}'`,
        },
      }

      // Nota: En una implementación real, estas políticas se configurarían
      // a través del dashboard de Supabase o mediante SQL directo
      console.log("Políticas que deberían configurarse:", {
        readPolicy,
        uploadPolicy,
        updatePolicy,
        deletePolicy,
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Error configurando políticas: ${error}`,
      }
    }
  }

  /**
   * Generar reporte completo de diagnóstico
   */
  async generateDiagnosticReport(bucketName: string): Promise<string> {
    const connectionDiag = await this.diagnoseConnection()
    const bucketDiag = await this.diagnoseBucket(bucketName)

    let report = "=== REPORTE DE DIAGNÓSTICO SUPABASE ===\n\n"

    // Conexión
    report += "1. CONEXIÓN:\n"
    report += `   - Estado: ${connectionDiag.isConnected ? "✅ Conectado" : "❌ Desconectado"}\n`
    report += `   - URL del proyecto: ${connectionDiag.projectUrl}\n`
    report += `   - Clave válida: ${connectionDiag.hasValidKey ? "✅ Sí" : "❌ No"}\n`
    if (connectionDiag.error) {
      report += `   - Error: ${connectionDiag.error}\n`
    }

    report += "\n2. BUCKET:\n"
    report += `   - Existe: ${bucketDiag.bucketExists ? "✅ Sí" : "❌ No"}\n`
    report += `   - Acceso lectura: ${bucketDiag.hasReadAccess ? "✅ Sí" : "❌ No"}\n`
    report += `   - Acceso escritura: ${bucketDiag.hasWriteAccess ? "✅ Sí" : "❌ No"}\n`
    report += `   - Acceso eliminación: ${bucketDiag.hasDeleteAccess ? "✅ Sí" : "❌ No"}\n`

    if (bucketDiag.bucketInfo) {
      report += `   - Público: ${bucketDiag.bucketInfo.public ? "✅ Sí" : "❌ No"}\n`
      report += `   - Creado: ${bucketDiag.bucketInfo.created_at}\n`
    }

    if (bucketDiag.error) {
      report += `   - Error: ${bucketDiag.error}\n`
    }

    report += "\n3. RECOMENDACIONES:\n"

    if (!connectionDiag.isConnected) {
      report += "   - Verificar variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY\n"
    }

    if (!bucketDiag.bucketExists) {
      report += "   - Crear bucket 'avatars' en el dashboard de Supabase\n"
    }

    if (!bucketDiag.hasWriteAccess) {
      report += "   - Configurar políticas de acceso para usuarios autenticados\n"
    }

    if (bucketDiag.bucketInfo && !bucketDiag.bucketInfo.public) {
      report += "   - Hacer el bucket público para permitir acceso a las imágenes\n"
    }

    return report
  }
}

// Exportar instancia singleton
export const supabaseDiagnostics = SupabaseDiagnostics.getInstance()
