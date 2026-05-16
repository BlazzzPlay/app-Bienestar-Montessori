import PocketBase from "pocketbase"
import type { RecordModel } from "pocketbase"

// -------------------------------------------------------------------
// Types — every interface extends RecordModel for PB's 15-char string IDs
// -------------------------------------------------------------------

export interface Perfil extends RecordModel {
  email: string
  nombre_completo: string
  rut: string
  fecha_nacimiento?: string
  sexo?: string
  telefono?: string
  cargo?: string
  fecha_ingreso?: string
  jornada_trabajo?: string
  avatar?: string
  es_bienestar: boolean
  rol: "Administrador" | "Presidente" | "Directorio" | "Beneficiario" | "Visualizador"
  orden_directorio?: number
  taller?: string
  peso?: number
  intereses?: string
  tipo_sangre?: string
  alergias?: string
}

export interface Beneficio extends RecordModel {
  nombre_empresa: string
  descripcion_corta: string
  descripcion_larga?: string
  direccion?: string
  instagram_url?: string
  website_url?: string
  etiquetas: string[]
  foto_local?: string
  fecha_inicio?: string
  fecha_termino?: string
  contador_usos: number
  beneficiosDisponibles?: string[]
}

export interface Publicacion extends RecordModel {
  titulo: string
  descripcion: string
  fecha_publicacion: string
  categoria: "Evento" | "Noticia" | "Comunicado"
  autor_id?: string
  lugar?: string
  organizador?: string
  imagen?: string
}

export interface ComentarioBeneficio extends RecordModel {
  contenido: string
  beneficio_id: string
  usuario_id: string
  estado: "pendiente" | "aprobado" | "archivado"
  fecha_creacion: string
}

export interface ComentarioPublicacion extends RecordModel {
  contenido: string
  publicacion_id: string
  usuario_id: string
  estado: "pendiente" | "aprobado" | "archivado"
  fecha_creacion: string
}

export interface Sugerencia extends RecordModel {
  contenido: string
  fecha_creacion: string
  leido: boolean
}

export interface AsistenciaEvento extends RecordModel {
  publicacion_id: string
  usuario_id: string
  confirmado: boolean
}

export interface UsoBeneficio extends RecordModel {
  beneficio_id: string
  usuario_id: string
  fecha_uso: string
}

export interface Notificacion extends RecordModel {
  usuario_id: string
  creado_por?: string
  tipo: "beneficio" | "evento" | "comentario" | "sistema" | "bienvenida"
  titulo: string
  mensaje: string
  icono?: string
  color?: string
  action_url?: string
  action_text?: string
  prioridad: "baja" | "normal" | "alta"
  estado: "no_leida" | "leida" | "archivada"
  leido_en?: string
  creado_en: string
  metadata?: Record<string, any>
}

// -------------------------------------------------------------------
// Client factories
// -------------------------------------------------------------------

const PB_URL = () => process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://localhost:8090"

function setupDefaults(pb: PocketBase): void {
  pb.beforeSend = (url, options) => {
    options.timeout = 10_000
    // Skip skipTotal — PocketBase server v0.38 no lo soporta
    if (typeof url === "string" && url.includes("skipTotal")) {
      url = url.replace(/&?skipTotal=[^&]*/, "")
    }
    return { url, options }
  }
}

// --- Browser singleton ---

let _browserClient: PocketBase | null = null

/**
 * Returns a lazily-initialised PocketBase singleton for browser usage.
 * Auth state is persisted to localStorage AND synced to pb_auth cookie
 * so Next.js middleware can read it on subsequent requests.
 */
export function createBrowserClient(): PocketBase {
  if (!_browserClient) {
    _browserClient = new PocketBase(PB_URL())
    setupDefaults(_browserClient)

    // Sync auth store changes to a cookie the middleware can read
    if (typeof document !== "undefined") {
      _browserClient.authStore.onChange((_token) => {
        const cookie = _browserClient!.authStore.exportToCookie({ httpOnly: false })
        document.cookie = cookie
      })
    }
  }
  return _browserClient
}

/**
 * Creates a fresh PocketBase instance per SSR request, loading auth
 * from the provided cookie string so each request is isolated.
 */
export function createServerClient(cookie: string): PocketBase {
  const pb = new PocketBase(PB_URL())
  setupDefaults(pb)
  pb.authStore.loadFromCookie(cookie)
  return pb
}

/**
 * Resets the browser singleton. Useful in tests and HMR scenarios.
 * Not meant for production use.
 */
export function resetBrowserClient(): void {
  _browserClient = null
}

/**
 * Resolves a PocketBase file field to an absolute URL.
 * Uses the record metadata (collectionName/collectionId) and the stored filename.
 * Works without a PocketBase instance — pure URL construction.
 *
 * For thumbnails, append `?thumb=100x100` to the returned URL.
 */
export function getFileUrl(
  record: { collectionName?: string; collectionId?: string; id: string },
  filename: string | undefined,
): string {
  if (!filename) return ""
  const collection = record.collectionName || record.collectionId || ""
  return `${PB_URL()}/api/files/${collection}/${record.id}/${filename}`
}
