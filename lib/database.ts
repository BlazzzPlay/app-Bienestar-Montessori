import {
  supabase,
  type Perfil,
  type Beneficio,
  type Publicacion,
  type ComentarioBeneficio,
  type ComentarioPublicacion,
} from "./supabase"

export const database = {
  // PERFILES
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("perfiles").select("*").eq("id", userId).single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Perfil>) {
    const { data, error } = await supabase
      .from("perfiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()
    return { data, error }
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .order("orden_directorio", { ascending: true, nullsLast: true })
      .order("nombre_completo", { ascending: true })
    return { data, error }
  },

  // BENEFICIOS
  async getBeneficios() {
    const { data, error } = await supabase.from("beneficios").select("*").order("created_at", { ascending: false })
    return { data, error }
  },

  async getBeneficio(id: number) {
    const { data, error } = await supabase.from("beneficios").select("*").eq("id", id).single()
    return { data, error }
  },

  async createBeneficio(beneficio: Omit<Beneficio, "id" | "created_at" | "updated_at" | "contador_usos">) {
    const { data, error } = await supabase.from("beneficios").insert(beneficio).select().single()
    return { data, error }
  },

  async updateBeneficio(id: number, updates: Partial<Beneficio>) {
    const { data, error } = await supabase
      .from("beneficios")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    return { data, error }
  },

  async registrarUsoBeneficio(beneficioId: number, usuarioId: string) {
    // Incrementar contador directamente
    const { data, error } = await supabase
      .from("beneficios")
      .update({ contador_usos: supabase.sql`contador_usos + 1` })
      .eq("id", beneficioId)
      .select()
      .single()

    return { data, error }
  },

  // PUBLICACIONES (Eventos y Noticias)
  async getPublicaciones(categoria?: "Evento" | "Noticia" | "Comunicado") {
    let query = supabase.from("publicaciones").select("*").order("fecha_publicacion", { ascending: false })

    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getPublicacion(id: number) {
    const { data, error } = await supabase.from("publicaciones").select("*").eq("id", id).single()
    return { data, error }
  },

  async createPublicacion(publicacion: Omit<Publicacion, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("publicaciones").insert(publicacion).select().single()
    return { data, error }
  },

  async confirmarAsistenciaEvento(publicacionId: number, usuarioId: string) {
    const { data, error } = await supabase
      .from("asistencia_eventos")
      .upsert({
        publicacion_id: publicacionId,
        usuario_id: usuarioId,
        confirmado: true,
      })
      .select()
      .single()
    return { data, error }
  },

  // COMENTARIOS BENEFICIOS
  async getComentariosBeneficio(beneficioId: number, incluirPendientes = false) {
    let query = supabase
      .from("comentarios_beneficios")
      .select(`
        *,
        perfiles (
          nombre_completo,
          avatar_url
        )
      `)
      .eq("beneficio_id", beneficioId)
      .order("fecha_creacion", { ascending: false })

    if (!incluirPendientes) {
      query = query.eq("estado", "aprobado")
    }

    const { data, error } = await query
    return { data, error }
  },

  async createComentarioBeneficio(comentario: Omit<ComentarioBeneficio, "id" | "fecha_creacion" | "estado">) {
    const { data, error } = await supabase.from("comentarios_beneficios").insert(comentario).select().single()
    return { data, error }
  },

  async moderarComentarioBeneficio(comentarioId: number, estado: "aprobado" | "archivado") {
    const { data, error } = await supabase
      .from("comentarios_beneficios")
      .update({ estado })
      .eq("id", comentarioId)
      .select()
      .single()
    return { data, error }
  },

  // COMENTARIOS PUBLICACIONES
  async getComentariosPublicacion(publicacionId: number, incluirPendientes = false) {
    let query = supabase
      .from("comentarios_publicaciones")
      .select(`
        *,
        perfiles (
          nombre_completo,
          avatar_url
        )
      `)
      .eq("publicacion_id", publicacionId)
      .order("fecha_creacion", { ascending: false })

    if (!incluirPendientes) {
      query = query.eq("estado", "aprobado")
    }

    const { data, error } = await query
    return { data, error }
  },

  async createComentarioPublicacion(comentario: Omit<ComentarioPublicacion, "id" | "fecha_creacion" | "estado">) {
    const { data, error } = await supabase.from("comentarios_publicaciones").insert(comentario).select().single()
    return { data, error }
  },

  async moderarComentarioPublicacion(comentarioId: number, estado: "aprobado" | "archivado") {
    const { data, error } = await supabase
      .from("comentarios_publicaciones")
      .update({ estado })
      .eq("id", comentarioId)
      .select()
      .single()
    return { data, error }
  },

  // SUGERENCIAS
  async createSugerencia(contenido: string) {
    const { data, error } = await supabase.from("sugerencias").insert({ contenido }).select().single()
    return { data, error }
  },

  async getSugerencias() {
    const { data, error } = await supabase.from("sugerencias").select("*").order("fecha_creacion", { ascending: false })
    return { data, error }
  },

  async marcarSugerenciaLeida(id: number) {
    const { data, error } = await supabase.from("sugerencias").update({ leido: true }).eq("id", id).select().single()
    return { data, error }
  },

  // ESTADÍSTICAS
  async getEstadisticasUsuario(usuarioId: string) {
    // Contar beneficios utilizados por el usuario
    const { count, error } = await supabase
      .from("comentarios_beneficios")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId)

    const beneficiosUtilizados = count || 0
    return { beneficiosUtilizados, error }
  },

  // AUTENTICACIÓN PERSONALIZADA
  async authenticateUser(email: string, rut: string) {
    const { data, error } = await supabase.from("perfiles").select("*").ilike("correo", email.toLowerCase()).single()

    if (error || !data) {
      return { data: null, error: { message: "Usuario no encontrado" } }
    }

    // Normalizar RUTs para comparación
    const normalizeRUT = (rut: string) => rut.replace(/[.-]/g, "").toLowerCase()

    if (normalizeRUT(data.rut) !== normalizeRUT(rut)) {
      return { data: null, error: { message: "RUT incorrecto" } }
    }

    return { data, error: null }
  },
}
