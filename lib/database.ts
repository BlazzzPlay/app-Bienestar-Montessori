import { createBrowserClient } from "./pocketbase"
import type {
  Perfil,
  Beneficio,
  Publicacion,
  ComentarioBeneficio,
  ComentarioPublicacion,
  Sugerencia,
  AsistenciaEvento,
  UsoBeneficio,
  Notificacion,
} from "./pocketbase"

function pb() {
  return createBrowserClient()
}

async function wrapSingle<T>(
  fn: () => Promise<T>,
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (e: any) {
    return { data: null, error: { message: e.message ?? e.toString() } }
  }
}

async function wrapList<T>(
  fn: () => Promise<T[]>,
): Promise<{ data: T[]; error: { message: string } | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (e: any) {
    return { data: [], error: { message: e.message ?? e.toString() } }
  }
}

function normalizeExpand(item: any): { nombre_completo: string; avatar_url?: string } | undefined {
  const expanded = item.expand?.usuario
  if (!expanded) return undefined
  return {
    nombre_completo: expanded.nombre_completo,
    avatar_url: expanded.avatar,
  }
}

export const database = {
  // --- PERFILES → USERS ---

  async getProfile(userId: string) {
    return wrapSingle(() => pb().collection("users").getOne(userId) as Promise<Perfil>)
  },

  async updateProfile(userId: string, updates: Partial<Perfil>) {
    return wrapSingle(() => pb().collection("users").update(userId, updates) as Promise<Perfil>)
  },

  async getAllProfiles() {
    return wrapList(
      () =>
        pb()
          .collection("users")
          .getFullList({ sort: "orden_directorio,nombre_completo" }) as Promise<Perfil[]>,
    )
  },

  // --- BENEFICIOS ---

  async getBeneficios() {
    return wrapList(
      () => pb().collection("beneficios").getFullList({ sort: "-id" }) as Promise<Beneficio[]>,
    )
  },

  async getBeneficio(id: string) {
    return wrapSingle(() => pb().collection("beneficios").getOne(id) as Promise<Beneficio>)
  },

  async createBeneficio(
    beneficio: Omit<Beneficio, "id" | "created" | "updated" | "collectionId" | "collectionName">,
  ) {
    return wrapSingle(
      () =>
        pb()
          .collection("beneficios")
          .create({ ...beneficio, contador_usos: 0 }) as Promise<Beneficio>,
    )
  },

  async updateBeneficio(id: string, updates: Partial<Beneficio>) {
    return wrapSingle(() => pb().collection("beneficios").update(id, updates) as Promise<Beneficio>)
  },

  async getUsoBeneficio(beneficioId: string, usuarioId: string) {
    try {
      const data = await pb()
        .collection("usos_beneficio")
        .getFirstListItem(`beneficio="${beneficioId}" && usuario="${usuarioId}"`)
      return { data: data as UsoBeneficio, error: null }
    } catch (e: any) {
      return { data: null, error: { message: e.message ?? e.toString() } }
    }
  },

  async registrarUsoBeneficio(beneficioId: string, usuarioId: string) {
    try {
      await pb().collection("usos_beneficio").create({
        beneficio: beneficioId,
        usuario: usuarioId,
      })
      await pb().collection("beneficios").update(beneficioId, { "contador_usos+": 1 })
      return this.getBeneficio(beneficioId)
    } catch (e: any) {
      return { data: null, error: { message: e.message ?? e.toString() } }
    }
  },

  // --- PUBLICACIONES ---

  async getPublicaciones(categoria?: "Evento" | "Noticia" | "Comunicado") {
    const filter = categoria ? `categoria="${categoria}"` : ""
    return wrapList(
      () =>
        pb()
          .collection("publicaciones")
          .getFullList({ sort: "-fecha_publicacion", filter }) as Promise<Publicacion[]>,
    )
  },

  async getPublicacion(id: string) {
    return wrapSingle(() => pb().collection("publicaciones").getOne(id) as Promise<Publicacion>)
  },

  async createPublicacion(
    publicacion: Omit<
      Publicacion,
      "id" | "created" | "updated" | "collectionId" | "collectionName"
    >,
  ) {
    return wrapSingle(
      () => pb().collection("publicaciones").create(publicacion) as Promise<Publicacion>,
    )
  },

  async confirmarAsistenciaEvento(publicacionId: string, usuarioId: string) {
    try {
      // Search for existing record first
      const existing = await pb()
        .collection("asistencias_evento")
        .getFirstListItem(`publicacion="${publicacionId}" && usuario="${usuarioId}"`, {
          sort: "-created",
        })
      // Found → update it
      await pb().collection("asistencias_evento").update(existing.id, { confirmado: true })
      return { data: true, error: null }
    } catch {
      // Not found → create new
      try {
        await pb().collection("asistencias_evento").create({
          publicacion: publicacionId,
          usuario: usuarioId,
          confirmado: true,
        })
        return { data: true, error: null }
      } catch (e: any) {
        return { data: null, error: { message: e.message ?? e.toString() } }
      }
    }
  },

  async cancelarAsistenciaEvento(publicacionId: string, usuarioId: string) {
    try {
      // Try to find existing record (sort by -created for determinism if duplicates somehow exist)
      const existing = await pb()
        .collection("asistencias_evento")
        .getFirstListItem(`publicacion="${publicacionId}" && usuario="${usuarioId}"`, {
          sort: "-created",
        })
      await pb().collection("asistencias_evento").update(existing.id, { confirmado: false })
      return { data: true, error: null }
    } catch {
      // No existing record — create one with confirmado=false (user marked "no participaré")
      try {
        await pb().collection("asistencias_evento").create({
          publicacion: publicacionId,
          usuario: usuarioId,
          confirmado: false,
        })
        return { data: true, error: null }
      } catch (e: any) {
        return { data: null, error: { message: e.message ?? e.toString() } }
      }
    }
  },

  async getAsistenciaEvento(publicacionId: string, usuarioId: string) {
    try {
      const data = await pb()
        .collection("asistencias_evento")
        .getFirstListItem(`publicacion="${publicacionId}" && usuario="${usuarioId}"`)
      return { data: data as AsistenciaEvento, error: null }
    } catch (e: any) {
      return { data: null, error: { message: e.message ?? e.toString() } }
    }
  },

  // --- COMENTARIOS BENEFICIOS ---

  async getComentariosBeneficio(beneficioId: string, incluirPendientes = false) {
    const filter = incluirPendientes
      ? `beneficio="${beneficioId}"`
      : `beneficio="${beneficioId}" && estado="aprobado"`

    try {
      const items = await pb()
        .collection("comentarios_beneficios")
        .getFullList({ filter, expand: "usuario", sort: "-fecha_creacion" })

      const normalized = items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
      }))

      return {
        data: normalized as (ComentarioBeneficio & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  async createComentarioBeneficio(data: { beneficio: string; usuario: string; contenido: string }) {
    return wrapSingle(
      () =>
        pb()
          .collection("comentarios_beneficios")
          .create({ ...data, estado: "pendiente" }) as Promise<ComentarioBeneficio>,
    )
  },

  async moderarComentarioBeneficio(comentarioId: string, estado: "aprobado" | "archivado") {
    return wrapSingle(
      () =>
        pb()
          .collection("comentarios_beneficios")
          .update(comentarioId, { estado }) as Promise<ComentarioBeneficio>,
    )
  },

  // --- COMENTARIOS PUBLICACIONES ---

  async getComentariosPublicacion(publicacionId: string, incluirPendientes = false) {
    const filter = incluirPendientes
      ? `publicacion="${publicacionId}"`
      : `publicacion="${publicacionId}" && estado="aprobado"`

    try {
      const items = await pb()
        .collection("comentarios_publicaciones")
        .getFullList({ filter, expand: "usuario", sort: "-fecha_creacion" })

      const normalized = items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
      }))

      return {
        data: normalized as (ComentarioPublicacion & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  async createComentarioPublicacion(data: {
    publicacion: string
    usuario: string
    contenido: string
  }) {
    return wrapSingle(
      () =>
        pb()
          .collection("comentarios_publicaciones")
          .create({ ...data, estado: "pendiente" }) as Promise<ComentarioPublicacion>,
    )
  },

  async moderarComentarioPublicacion(comentarioId: string, estado: "aprobado" | "archivado") {
    return wrapSingle(
      () =>
        pb()
          .collection("comentarios_publicaciones")
          .update(comentarioId, { estado }) as Promise<ComentarioPublicacion>,
    )
  },

  // --- SUGERENCIAS ---

  async createSugerencia(contenido: string) {
    return wrapSingle(
      () => pb().collection("sugerencias").create({ contenido }) as Promise<Sugerencia>,
    )
  },

  async getSugerencias() {
    return wrapList(
      () =>
        pb().collection("sugerencias").getFullList({ sort: "-fecha_creacion" }) as Promise<
          Sugerencia[]
        >,
    )
  },

  async marcarSugerenciaLeida(id: string) {
    return wrapSingle(
      () => pb().collection("sugerencias").update(id, { leido: true }) as Promise<Sugerencia>,
    )
  },

  // --- COMENTARIOS PENDIENTES (Moderación) ---

  async getPendingCommentsBeneficios() {
    try {
      const items = await pb().collection("comentarios_beneficios").getFullList({
        filter: 'estado="pendiente"',
        expand: "usuario",
        sort: "-fecha_creacion",
      })

      const normalized = items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
      }))

      return {
        data: normalized as (ComentarioBeneficio & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  async getPendingCommentsPublicaciones() {
    try {
      const items = await pb().collection("comentarios_publicaciones").getFullList({
        filter: 'estado="pendiente"',
        expand: "usuario",
        sort: "-fecha_creacion",
      })

      const normalized = items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
      }))

      return {
        data: normalized as (ComentarioPublicacion & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  async approveComment(table: "comentarios_beneficios" | "comentarios_publicaciones", id: string) {
    return wrapSingle(
      () =>
        pb().collection(table).update(id, { estado: "aprobado" }) as Promise<
          ComentarioBeneficio | ComentarioPublicacion
        >,
    )
  },

  async archiveComment(table: "comentarios_beneficios" | "comentarios_publicaciones", id: string) {
    return wrapSingle(
      () =>
        pb().collection(table).update(id, { estado: "archivado" }) as Promise<
          ComentarioBeneficio | ComentarioPublicacion
        >,
    )
  },

  // --- ASISTENCIAS ---

  async getAsistenciasPorEvento(publicacionId: string) {
    try {
      const items = await pb()
        .collection("asistencias_evento")
        .getFullList({
          filter: `publicacion="${publicacionId}" && confirmado=true`,
          expand: "usuario",
          sort: "-id",
        })

      const normalized = items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
      }))

      return {
        data: normalized as (AsistenciaEvento & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  // --- BENEFICIOS POR USO ---

  async getBenefitsByUsage() {
    return wrapList(
      () =>
        pb().collection("beneficios").getFullList({ sort: "-contador_usos" }) as Promise<
          Beneficio[]
        >,
    )
  },

  async getRecentComments(limit = 10) {
    try {
      const [beneficiosRes, publicacionesRes] = await Promise.all([
        pb()
          .collection("comentarios_beneficios")
          .getList(1, limit, { expand: "usuario", sort: "-fecha_creacion" }),
        pb()
          .collection("comentarios_publicaciones")
          .getList(1, limit, { expand: "usuario", sort: "-fecha_creacion" }),
      ])

      const beneficios = beneficiosRes.items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
        source: "beneficio" as const,
      }))

      const publicaciones = publicacionesRes.items.map((item: any) => ({
        ...item,
        perfiles: normalizeExpand(item),
        source: "publicacion" as const,
      }))

      const merged = [...beneficios, ...publicaciones].sort(
        (a, b) => +new Date(b.fecha_creacion) - +new Date(a.fecha_creacion),
      )

      return {
        data: merged.slice(0, limit) as ((ComentarioBeneficio | ComentarioPublicacion) & {
          perfiles?: { nombre_completo: string; avatar_url?: string }
          source: "beneficio" | "publicacion"
        })[],
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  async getRecentSignups(limit = 10) {
    try {
      const items = await pb()
        .collection("users")
        .getList(1, limit, { sort: "-id", fields: "id,nombre_completo,created" })

      return {
        data: items.items.map((u: any) => ({
          id: u.id,
          nombre_completo: u.nombre_completo,
          created_at: u.created,
        })),
        error: null,
      }
    } catch (e: any) {
      return { data: [], error: { message: e.message ?? e.toString() } }
    }
  },

  // --- ESTADÍSTICAS ---

  async getEstadisticasUsuario(usuarioId: string) {
    try {
      const result = await pb()
        .collection("usos_beneficio")
        .getList(1, 1, { filter: `usuario="${usuarioId}"` })
      return { beneficiosUtilizados: result.totalItems, error: null }
    } catch (e: any) {
      return { beneficiosUtilizados: 0, error: { message: e.message ?? e.toString() } }
    }
  },

  // --- NOTIFICACIONES ---

  async getNotificaciones(usuarioId: string) {
    return wrapList(
      () =>
        pb()
          .collection("notificaciones")
          .getFullList({ filter: `usuario="${usuarioId}"`, sort: "-creado_en" }) as Promise<
          Notificacion[]
        >,
    )
  },

  async getNotificacionesNoLeidas(usuarioId: string) {
    return wrapList(
      () =>
        pb()
          .collection("notificaciones")
          .getFullList({
            filter: `usuario="${usuarioId}" && estado="no_leida"`,
            sort: "-creado_en",
          }) as Promise<Notificacion[]>,
    )
  },

  async marcarNotificacionLeida(notificacionId: string) {
    return wrapSingle(
      () =>
        pb().collection("notificaciones").update(notificacionId, {
          estado: "leida",
          leido_en: new Date().toISOString(),
        }) as Promise<Notificacion>,
    )
  },

  async archivarNotificacion(notificacionId: string) {
    return wrapSingle(
      () =>
        pb()
          .collection("notificaciones")
          .update(notificacionId, { estado: "archivada" }) as Promise<Notificacion>,
    )
  },

  async eliminarNotificacion(notificacionId: string) {
    try {
      await pb().collection("notificaciones").delete(notificacionId)
      return { error: null }
    } catch (e: any) {
      return { error: { message: e.message ?? e.toString() } }
    }
  },

  async marcarTodasNotificacionesLeidas(usuarioId: string) {
    try {
      const records = await pb()
        .collection("notificaciones")
        .getFullList({ filter: `usuario="${usuarioId}" && estado="no_leida"` })
      const now = new Date().toISOString()
      for (const r of records) {
        await pb().collection("notificaciones").update(r.id, { estado: "leida", leido_en: now })
      }
      return { error: null }
    } catch (e: any) {
      return { error: { message: e.message ?? e.toString() } }
    }
  },

  async limpiarNotificaciones(usuarioId: string) {
    try {
      const records = await pb()
        .collection("notificaciones")
        .getFullList({ filter: `usuario="${usuarioId}"` })
      for (const r of records) {
        await pb().collection("notificaciones").delete(r.id)
      }
      return { error: null }
    } catch (e: any) {
      return { error: { message: e.message ?? e.toString() } }
    }
  },

  async broadcastNotificacion(
    titulo: string,
    mensaje: string,
    tipo: string,
    targetRole?: string | null,
    prioridad = "normal",
    icono?: string | null,
    color?: string | null,
    actionUrl?: string | null,
    actionText?: string | null,
    metadata?: Record<string, any> | null,
  ) {
    try {
      const filter = targetRole ? `rol="${targetRole}"` : ""
      const users = await pb().collection("users").getFullList({ filter })

      for (const user of users) {
        await pb()
          .collection("notificaciones")
          .create({
            usuario: user.id,
            titulo,
            mensaje,
            tipo,
            prioridad,
            icono: icono || undefined,
            color: color || undefined,
            action_url: actionUrl || undefined,
            action_text: actionText || undefined,
            metadata: metadata || undefined,
            estado: "no_leida",
          })
      }
      return { error: null }
    } catch (e: any) {
      return { error: { message: e.message ?? e.toString() } }
    }
  },
}
