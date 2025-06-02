import { supabase } from "./supabase"

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "jpeg" | "png"
  resize?: "cover" | "contain" | "fill"
}

export interface OptimizedImageResult {
  originalUrl: string
  optimizedUrl: string
  transformations: string
  estimatedSize: number
}

/**
 * Servicio de optimización de imágenes usando Supabase Image Transformations
 */
export class SupabaseImageOptimizer {
  private static instance: SupabaseImageOptimizer

  static getInstance(): SupabaseImageOptimizer {
    if (!SupabaseImageOptimizer.instance) {
      SupabaseImageOptimizer.instance = new SupabaseImageOptimizer()
    }
    return SupabaseImageOptimizer.instance
  }

  /**
   * Genera URL optimizada para avatares
   */
  getOptimizedAvatarUrl(bucketPath: string, options: ImageOptimizationOptions = {}): OptimizedImageResult {
    const { width = 200, height = 200, quality = 75, format = "webp", resize = "cover" } = options

    // URL base del archivo
    const { data } = supabase.storage.from("avatars").getPublicUrl(bucketPath)
    const baseUrl = data.publicUrl

    // Construir transformaciones para máxima compresión
    const transformations = [
      `width=${width}`,
      `height=${height}`,
      `resize=${resize}`,
      `quality=${quality}`,
      `format=${format}`,
    ].join("&")

    // URL optimizada usando Supabase Image Transformations
    const optimizedUrl = `${baseUrl}?${transformations}`

    // Estimar tamaño reducido (aproximación)
    const estimatedSize = this.estimateOptimizedSize(width, height, quality, format)

    return {
      originalUrl: baseUrl,
      optimizedUrl,
      transformations,
      estimatedSize,
    }
  }

  /**
   * Genera múltiples tamaños para diferentes usos
   */
  getMultiSizeAvatarUrls(bucketPath: string): {
    thumbnail: OptimizedImageResult
    small: OptimizedImageResult
    medium: OptimizedImageResult
    large: OptimizedImageResult
  } {
    return {
      thumbnail: this.getOptimizedAvatarUrl(bucketPath, {
        width: 50,
        height: 50,
        quality: 60,
        format: "webp",
      }),
      small: this.getOptimizedAvatarUrl(bucketPath, {
        width: 100,
        height: 100,
        quality: 70,
        format: "webp",
      }),
      medium: this.getOptimizedAvatarUrl(bucketPath, {
        width: 200,
        height: 200,
        quality: 75,
        format: "webp",
      }),
      large: this.getOptimizedAvatarUrl(bucketPath, {
        width: 400,
        height: 400,
        quality: 80,
        format: "webp",
      }),
    }
  }

  /**
   * Optimización específica para imágenes de beneficios
   */
  getOptimizedBenefitImageUrl(bucketPath: string, options: ImageOptimizationOptions = {}): OptimizedImageResult {
    const { width = 600, height = 400, quality = 70, format = "webp", resize = "cover" } = options

    const { data } = supabase.storage.from("beneficios").getPublicUrl(bucketPath)
    const baseUrl = data.publicUrl

    const transformations = [
      `width=${width}`,
      `height=${height}`,
      `resize=${resize}`,
      `quality=${quality}`,
      `format=${format}`,
    ].join("&")

    const optimizedUrl = `${baseUrl}?${transformations}`
    const estimatedSize = this.estimateOptimizedSize(width, height, quality, format)

    return {
      originalUrl: baseUrl,
      optimizedUrl,
      transformations,
      estimatedSize,
    }
  }

  /**
   * Optimización para imágenes de eventos/publicaciones
   */
  getOptimizedEventImageUrl(bucketPath: string, options: ImageOptimizationOptions = {}): OptimizedImageResult {
    const { width = 800, height = 450, quality = 75, format = "webp", resize = "cover" } = options

    const { data } = supabase.storage.from("eventos").getPublicUrl(bucketPath)
    const baseUrl = data.publicUrl

    const transformations = [
      `width=${width}`,
      `height=${height}`,
      `resize=${resize}`,
      `quality=${quality}`,
      `format=${format}`,
    ].join("&")

    const optimizedUrl = `${baseUrl}?${transformations}`
    const estimatedSize = this.estimateOptimizedSize(width, height, quality, format)

    return {
      originalUrl: baseUrl,
      optimizedUrl,
      transformations,
      estimatedSize,
    }
  }

  /**
   * Estimar tamaño de imagen optimizada
   */
  private estimateOptimizedSize(width: number, height: number, quality: number, format: string): number {
    const pixels = width * height
    let bytesPerPixel: number

    switch (format) {
      case "webp":
        bytesPerPixel = 0.5 * (quality / 100) // WebP es muy eficiente
        break
      case "jpeg":
        bytesPerPixel = 1.0 * (quality / 100)
        break
      case "png":
        bytesPerPixel = 2.0 // PNG sin compresión con pérdida
        break
      default:
        bytesPerPixel = 1.0
    }

    return Math.round(pixels * bytesPerPixel)
  }

  /**
   * Generar configuraciones optimizadas para diferentes contextos
   */
  getOptimizationPresets() {
    return {
      avatar: {
        thumbnail: { width: 50, height: 50, quality: 60, format: "webp" as const },
        small: { width: 100, height: 100, quality: 70, format: "webp" as const },
        medium: { width: 200, height: 200, quality: 75, format: "webp" as const },
        large: { width: 400, height: 400, quality: 80, format: "webp" as const },
      },
      benefit: {
        card: { width: 300, height: 200, quality: 70, format: "webp" as const },
        detail: { width: 600, height: 400, quality: 75, format: "webp" as const },
        hero: { width: 800, height: 450, quality: 80, format: "webp" as const },
      },
      event: {
        card: { width: 400, height: 250, quality: 70, format: "webp" as const },
        detail: { width: 800, height: 450, quality: 75, format: "webp" as const },
        hero: { width: 1200, height: 600, quality: 80, format: "webp" as const },
      },
    }
  }
}

// Exportar instancia singleton
export const imageOptimizer = SupabaseImageOptimizer.getInstance()
