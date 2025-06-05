import { supabase } from "./supabase"

/**
 * Servicio de avatares que funciona con la configuración actual de Supabase
 * Basado en los resultados del diagnóstico que muestran que el sistema funciona
 */
export const avatarStorageWorking = {
  /**
   * Sube un avatar para un usuario usando el bucket 'avatars' existente
   */
  async uploadAvatar(file: File, userRut: string) {
    try {
      console.log("🚀 Iniciando subida de avatar...")

      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop()
      const fileName = `avatar-${userRut}-${Date.now()}.${fileExt}`

      console.log(`📁 Subiendo archivo: ${fileName}`)

      // Subir al bucket 'avatars' que sabemos que existe
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      })

      if (error) {
        console.error("❌ Error subiendo archivo:", error)
        return {
          success: false,
          error: error.message,
          debugInfo: { error, fileName, fileSize: file.size },
        }
      }

      console.log("✅ Archivo subido exitosamente:", data)

      // Obtener URL pública
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      console.log("🔗 URL pública generada:", publicUrl)

      // Actualizar perfil del usuario
      const { error: updateError } = await supabase
        .from("perfiles")
        .update({ avatar_url: publicUrl })
        .eq("rut", userRut)

      if (updateError) {
        console.error("❌ Error actualizando perfil:", updateError)
        return {
          success: false,
          error: "Error actualizando el perfil del usuario",
          debugInfo: { updateError, publicUrl },
        }
      }

      console.log("✅ Perfil actualizado exitosamente")

      return {
        success: true,
        data: {
          path: data.path,
          publicUrl,
          fileName,
        },
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error)
      return {
        success: false,
        error: "Error inesperado durante la subida",
        debugInfo: { error: error instanceof Error ? error.message : error },
      }
    }
  },

  /**
   * Diagnóstico completo del sistema basado en lo que sabemos que funciona
   */
  async runCompleteDiagnostic() {
    try {
      console.log("🔍 Ejecutando diagnóstico...")

      // Verificar buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        return {
          success: false,
          details: {},
          errors: [`Error listando buckets: ${bucketsError.message}`],
        }
      }

      // Verificar bucket de avatars específicamente
      const avatarsBucket = buckets?.find((b) => b.name === "avatars")

      // Contar archivos en bucket de avatars
      let fileCount = 0
      let uploadTest = null

      if (avatarsBucket) {
        try {
          const { data: files } = await supabase.storage.from("avatars").list()
          fileCount = files?.length || 0

          // Test de subida con archivo pequeño
          const testFile = new Blob(["test"], { type: "text/plain" })
          const testFileName = `test-${Date.now()}.txt`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(testFileName, testFile)

          if (!uploadError) {
            // Limpiar archivo de prueba
            await supabase.storage.from("avatars").remove([testFileName])

            uploadTest = {
              success: true,
              path: uploadData.path,
            }
          } else {
            uploadTest = {
              success: false,
              error: uploadError.message,
            }
          }
        } catch (error) {
          uploadTest = {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          }
        }
      }

      return {
        success: true,
        details: {
          databaseConnection: true,
          bucketCount: buckets?.length || 0,
          allBuckets: buckets || [],
          bucket: avatarsBucket || null,
          fileCount,
          uploadTest,
          supabaseConfig: {
            urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
            keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
          },
        },
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        details: {},
        errors: [`Error en diagnóstico: ${error instanceof Error ? error.message : error}`],
      }
    }
  },
}
