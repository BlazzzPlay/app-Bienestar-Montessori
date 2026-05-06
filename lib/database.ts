import { supabase } from "./supabaseClient"
import type {
  Perfil,
  Beneficio,
  Publicacion,
  ComentarioBeneficio,
  ComentarioPublicacion,
  Sugerencia,
  AsistenciaEvento,
} from "./supabase"

export const database = {
  // --- PERFILES ---

  async getProfile(userId: string) {
    const { data, error } = await supabase.from("perfiles").select("*").eq("id", userId).single()
    return { data: data as Perfil | null, error }
  },

  async updateProfile(userId: string, updates: Partial<Perfil>) {
    const { data, error } = await supabase
      .from("perfiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()
    return { data: data as Perfil | null, error }
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .order("orden_directorio", { ascending: true, nullsFirst: false })
      .order("nombre_completo", { ascending: true })
    return { data: (data || []) as Perfil[], error }
  },

  // --- BENEFICIOS ---

  async getBeneficios() {
    const { data, error } = await supabase
      .from("beneficios")
      .select("*")
      .order("created_at", { ascending: false })
    return { data: (data || []) as Beneficio[], error }
  },

  async getBeneficio(id: number) {
    const { data, error } = await supabase.from("beneficios").select("*").eq("id", id).single()
    return { data: data as Beneficio | null, error }
  },

  async createBeneficio(
    beneficio: Omit<Beneficio, "id" | "created_at" | "updated_at" | "contador_usos">,
  ) {
    const { data, error } = await supabase
      .from("beneficios")
      .insert({ ...beneficio, contador_usos: 0 })
      .select()
      .single()
    return { data: data as Beneficio | null, error }
  },

  async updateBeneficio(id: number, updates: Partial<Beneficio>) {
    const { data, error } = await supabase
      .from("beneficios")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    return { data: data as Beneficio | null, error }
  },

  async registrarUsoBeneficio(beneficioId: number, _usuarioId: string) {
    const { error } = await supabase.rpc("incrementar_uso_beneficio", {
      p_id: beneficioId,
    })
    if (error) return { data: null, error }
    return this.getBeneficio(beneficioId)
  },

  // --- PUBLICACIONES ---

  async getPublicaciones(categoria?: "Evento" | "Noticia" | "Comunicado") {
    let query = supabase.from("publicaciones").select("*")
    if (categoria) {
      query = query.eq("categoria", categoria)
    }
    const { data, error } = await query.order("fecha_publicacion", { ascending: false })
    return { data: (data || []) as Publicacion[], error }
  },

  async getPublicacion(id: number) {
    const { data, error } = await supabase.from("publicaciones").select("*").eq("id", id).single()
    return { data: data as Publicacion | null, error }
  },

  async createPublicacion(publicacion: Omit<Publicacion, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("publicaciones")
      .insert(publicacion)
      .select()
      .single()
    return { data: data as Publicacion | null, error }
  },

  async confirmarAsistenciaEvento(publicacionId: number, usuarioId: string) {
    const { error } = await supabase.from("asistencias_evento").upsert(
      {
        publicacion_id: publicacionId,
        usuario_id: usuarioId,
        confirmado: true,
      },
      { onConflict: "publicacion_id,usuario_id" },
    )
    return { data: !error, error }
  },

  async getAsistenciaEvento(publicacionId: number, usuarioId: string) {
    const { data, error } = await supabase
      .from("asistencias_evento")
      .select("*")
      .eq("publicacion_id", publicacionId)
      .eq("usuario_id", usuarioId)
      .single()
    return { data: data as AsistenciaEvento | null, error }
  },

  // --- COMENTARIOS BENEFICIOS ---

  async getComentariosBeneficio(beneficioId: number, incluirPendientes = false) {
    let query = supabase
      .from("comentarios_beneficios")
      .select("*,perfiles(nombre_completo,avatar_url)")
      .eq("beneficio_id", beneficioId)

    if (!incluirPendientes) {
      query = query.eq("estado", "aprobado")
    }

    const { data, error } = await query.order("fecha_creacion", { ascending: false })

    // Normalizar nested perfiles a objeto simple (por compatibilidad con UI)
    const normalized = (data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
    }))

    return {
      data: normalized as (ComentarioBeneficio & {
        perfiles?: { nombre_completo: string; avatar_url?: string }
      })[],
      error,
    }
  },

  async createComentarioBeneficio(
    comentario: Omit<ComentarioBeneficio, "id" | "fecha_creacion" | "estado">,
  ) {
    const { data, error } = await supabase
      .from("comentarios_beneficios")
      .insert({ ...comentario, estado: "pendiente" })
      .select()
      .single()
    return { data: data as ComentarioBeneficio | null, error }
  },

  async moderarComentarioBeneficio(comentarioId: number, estado: "aprobado" | "archivado") {
    const { data, error } = await supabase
      .from("comentarios_beneficios")
      .update({ estado })
      .eq("id", comentarioId)
      .select()
      .single()
    return { data: data as ComentarioBeneficio | null, error }
  },

  // --- COMENTARIOS PUBLICACIONES ---

  async getComentariosPublicacion(publicacionId: number, incluirPendientes = false) {
    let query = supabase
      .from("comentarios_publicaciones")
      .select("*,perfiles(nombre_completo,avatar_url)")
      .eq("publicacion_id", publicacionId)

    if (!incluirPendientes) {
      query = query.eq("estado", "aprobado")
    }

    const { data, error } = await query.order("fecha_creacion", { ascending: false })

    const normalized = (data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
    }))

    return {
      data: normalized as (ComentarioPublicacion & {
        perfiles?: { nombre_completo: string; avatar_url?: string }
      })[],
      error,
    }
  },

  async createComentarioPublicacion(
    comentario: Omit<ComentarioPublicacion, "id" | "fecha_creacion" | "estado">,
  ) {
    const { data, error } = await supabase
      .from("comentarios_publicaciones")
      .insert({ ...comentario, estado: "pendiente" })
      .select()
      .single()
    return { data: data as ComentarioPublicacion | null, error }
  },

  async moderarComentarioPublicacion(comentarioId: number, estado: "aprobado" | "archivado") {
    const { data, error } = await supabase
      .from("comentarios_publicaciones")
      .update({ estado })
      .eq("id", comentarioId)
      .select()
      .single()
    return { data: data as ComentarioPublicacion | null, error }
  },

  // --- SUGERENCIAS ---

  async createSugerencia(contenido: string) {
    const { data, error } = await supabase
      .from("sugerencias")
      .insert({ contenido })
      .select()
      .single()
    return { data: data as Sugerencia | null, error }
  },

  async getSugerencias() {
    const { data, error } = await supabase
      .from("sugerencias")
      .select("*")
      .order("fecha_creacion", { ascending: false })
    return { data: (data || []) as Sugerencia[], error }
  },

  async marcarSugerenciaLeida(id: number) {
    const { data, error } = await supabase
      .from("sugerencias")
      .update({ leido: true })
      .eq("id", id)
      .select()
      .single()
    return { data: data as Sugerencia | null, error }
  },

  // --- COMENTARIOS PENDIENTES (Moderación) ---

  async getPendingCommentsBeneficios() {
    const { data, error } = await supabase
      .from("comentarios_beneficios")
      .select("*,perfiles(nombre_completo,avatar_url)")
      .eq("estado", "pendiente")
      .order("fecha_creacion", { ascending: false })

    const normalized = (data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
    }))

    return {
      data: normalized as (ComentarioBeneficio & {
        perfiles?: { nombre_completo: string; avatar_url?: string }
      })[],
      error,
    }
  },

  async getPendingCommentsPublicaciones() {
    const { data, error } = await supabase
      .from("comentarios_publicaciones")
      .select("*,perfiles(nombre_completo,avatar_url)")
      .eq("estado", "pendiente")
      .order("fecha_creacion", { ascending: false })

    const normalized = (data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
    }))

    return {
      data: normalized as (ComentarioPublicacion & {
        perfiles?: { nombre_completo: string; avatar_url?: string }
      })[],
      error,
    }
  },

  async approveComment(table: "comentarios_beneficios" | "comentarios_publicaciones", id: number) {
    const { data, error } = await supabase
      .from(table)
      .update({ estado: "aprobado" })
      .eq("id", id)
      .select()
      .single()
    return {
      data: data as (ComentarioBeneficio | ComentarioPublicacion) | null,
      error,
    }
  },

  async archiveComment(table: "comentarios_beneficios" | "comentarios_publicaciones", id: number) {
    const { data, error } = await supabase
      .from(table)
      .update({ estado: "archivado" })
      .eq("id", id)
      .select()
      .single()
    return {
      data: data as (ComentarioBeneficio | ComentarioPublicacion) | null,
      error,
    }
  },

  // --- ASISTENCIAS ---

  async getAsistenciasPorEvento(publicacionId: number) {
    const { data, error } = await supabase
      .from("asistencias_evento")
      .select("*,perfiles(nombre_completo,avatar_url)")
      .eq("publicacion_id", publicacionId)
      .eq("confirmado", true)
      .order("created_at", { ascending: false })

    const normalized = (data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
    }))

    return {
      data: normalized as (AsistenciaEvento & {
        perfiles?: { nombre_completo: string; avatar_url?: string }
      })[],
      error,
    }
  },

  // --- BENEFICIOS POR USO ---

  async getBenefitsByUsage() {
    const { data, error } = await supabase
      .from("beneficios")
      .select("*")
      .order("contador_usos", { ascending: false })
    return { data: (data || []) as Beneficio[], error }
  },

  async getRecentComments(limit = 10) {
    const [beneficiosRes, publicacionesRes] = await Promise.all([
      supabase
        .from("comentarios_beneficios")
        .select("*,perfiles(nombre_completo,avatar_url)")
        .order("fecha_creacion", { ascending: false })
        .limit(limit),
      supabase
        .from("comentarios_publicaciones")
        .select("*,perfiles(nombre_completo,avatar_url)")
        .order("fecha_creacion", { ascending: false })
        .limit(limit),
    ])

    const beneficios = (beneficiosRes.data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
      source: "beneficio" as const,
    }))

    const publicaciones = (publicacionesRes.data || []).map((item: any) => ({
      ...item,
      perfiles: Array.isArray(item.perfiles) ? item.perfiles[0] : item.perfiles,
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
      error: beneficiosRes.error || publicacionesRes.error,
    }
  },

  async getRecentSignups(limit = 10) {
    const { data, error } = await supabase
      .from("perfiles")
      .select("id,nombre_completo,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
    return {
      data: (data || []) as { id: string; nombre_completo: string; created_at: string }[],
      error,
    }
  },

  // --- ESTADÍSTICAS ---

  async getEstadisticasUsuario(usuarioId: string) {
    const { count, error } = await supabase
      .from("comentarios_beneficios")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)
    return { beneficiosUtilizados: count || 0, error }
  },
}
