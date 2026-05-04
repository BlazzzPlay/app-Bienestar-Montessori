import { supabase } from "./supabaseClient"
import type {
  Perfil,
  Beneficio,
  Publicacion,
  ComentarioBeneficio,
  ComentarioPublicacion,
  Sugerencia,
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

  // --- ESTADÍSTICAS ---

  async getEstadisticasUsuario(usuarioId: string) {
    const { count, error } = await supabase
      .from("comentarios_beneficios")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)
    return { beneficiosUtilizados: count || 0, error }
  },
}
