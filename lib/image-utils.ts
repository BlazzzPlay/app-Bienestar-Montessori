/**
 * Utilidades para procesamiento de imágenes con optimización agresiva
 */

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
}

export interface ProcessedImage {
  blob: Blob
  fileName: string
  size: number
  dimensions: { width: number; height: number }
}

/**
 * Convierte y optimiza una imagen con compresión agresiva
 */
export async function processImage(file: File, options: ImageProcessingOptions = {}): Promise<ProcessedImage> {
  const { maxWidth = 300, maxHeight = 300, quality = 0.65, format = "jpeg" } = options

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo proporción
        const { width: newWidth, height: newHeight } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)

        // Crear canvas para redimensionar
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("No se pudo crear el contexto del canvas"))
          return
        }

        canvas.width = newWidth
        canvas.height = newHeight

        // Configurar calidad de renderizado para máxima compresión
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "medium" // Cambiado de "high" a "medium" para menor tamaño

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Convertir a blob con compresión agresiva
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al procesar la imagen"))
              return
            }

            const processedImage: ProcessedImage = {
              blob,
              fileName: `processed.${format}`,
              size: blob.size,
              dimensions: { width: newWidth, height: newHeight },
            }

            resolve(processedImage)
          },
          `image/${format}`,
          quality,
        )
      } catch (error) {
        reject(new Error(`Error procesando imagen: ${error}`))
      }
    }

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"))
    }

    // Cargar imagen
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calcula nuevas dimensiones manteniendo proporción
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Si la imagen es más grande que los límites, redimensionar
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height

    if (width > height) {
      width = maxWidth
      height = width / aspectRatio
    } else {
      height = maxHeight
      width = height * aspectRatio
    }

    // Asegurar que no exceda los límites
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

/**
 * Valida si un archivo es una imagen válida con límites más estrictos
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Validar tipo MIME (solo los más eficientes)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato no válido. Solo se permiten: JPG, PNG, WEBP",
    }
  }

  // Validar tamaño (máximo 2MB para ahorrar espacio)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `La imagen debe ser menor a 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Validar extensión del archivo
  const fileName = file.name.toLowerCase()
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp"]
  const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Extensión de archivo no válida",
    }
  }

  return { isValid: true }
}

/**
 * Genera un nombre de archivo seguro con RUT y fecha
 */
export function generateSecureFileName(rut: string, originalFileName: string): string {
  // Limpiar RUT para usar en nombre de archivo
  const cleanRUT = rut.replace(/[.-]/g, "").toLowerCase()

  // Obtener fecha actual en formato YYYYMMDD_HHMMSS
  const now = new Date()
  const dateStr =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    "_" +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0")

  // Generar ID único adicional más corto
  const uniqueId = Math.random().toString(36).substring(2, 6) // Solo 4 caracteres

  // Usar extensión .jpg como estándar para avatares
  return `avatar_${cleanRUT}_${dateStr}_${uniqueId}.jpg`
}

/**
 * Valida dimensiones mínimas de imagen
 */
export async function validateImageDimensions(
  file: File,
  minWidth = 50,
  minHeight = 50,
): Promise<{ isValid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const dimensions = { width: img.width, height: img.height }

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          isValid: false,
          error: `La imagen debe tener al menos ${minWidth}x${minHeight} píxeles. Actual: ${img.width}x${img.height}`,
          dimensions,
        })
      } else {
        resolve({
          isValid: true,
          dimensions,
        })
      }

      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      resolve({
        isValid: false,
        error: "Archivo de imagen corrupto o inválido",
      })
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}
