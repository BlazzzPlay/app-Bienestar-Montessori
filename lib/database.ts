import type {
  Perfil,
  Beneficio,
  Publicacion,
  ComentarioBeneficio,
  ComentarioPublicacion,
  Sugerencia,
  AsistenciaEvento,
} from "./supabase"

// ============================================
// DATOS INICIALES DE EJEMPLO
// ============================================

const INITIAL_PROFILES: Perfil[] = [
  {
    id: "user-1",
    nombre_completo: "Patricia Morales",
    correo: "patricia.morales@colegiomontessori.cl",
    rut: "12345678-9",
    cargo: "Presidenta de Bienestar",
    fecha_ingreso: "2020-03-15",
    jornada_trabajo: "Ambas Jornadas",
    avatar_url: "/placeholder.svg?height=120&width=120",
    es_bienestar: true,
    rol: "Presidente",
    orden_directorio: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    nombre_completo: "María Elena González",
    correo: "maria.gonzalez@colegiomontessori.cl",
    rut: "98765432-1",
    cargo: "Profesora de Matemáticas",
    fecha_ingreso: "2018-08-20",
    jornada_trabajo: "Jornada Mañana",
    avatar_url: "/placeholder.svg?height=120&width=120",
    es_bienestar: true,
    rol: "Beneficiario",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-3",
    nombre_completo: "Juan Carlos Pérez",
    correo: "juan.perez@colegiomontessori.cl",
    rut: "11223344-5",
    cargo: "Profesor de Historia",
    fecha_ingreso: "2019-02-10",
    jornada_trabajo: "Jornada Tarde",
    avatar_url: "/placeholder.svg?height=120&width=120",
    es_bienestar: false,
    rol: "Visualizador",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-4",
    nombre_completo: "Administrador Sistema",
    correo: "admin@colegiomontessori.cl",
    rut: "99887766-4",
    cargo: "Administrador de Sistema",
    fecha_ingreso: "2020-01-01",
    jornada_trabajo: "Ambas Jornadas",
    avatar_url: "/placeholder.svg?height=120&width=120",
    es_bienestar: true,
    rol: "Administrador",
    orden_directorio: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const INITIAL_BENEFICIOS: Beneficio[] = [
  {
    id: 1,
    nombre_empresa: "Restaurante El Buen Sabor",
    descripcion_corta: "20% de descuento en todos los platos del menú. Válido de lunes a viernes.",
    descripcion_larga:
      "Disfruta de un 20% de descuento en todos los platos de nuestro menú. Ofrecemos comida casera de alta calidad con ingredientes frescos y locales. Nuestro ambiente acogedor es perfecto para almuerzos de trabajo o cenas familiares.",
    direccion: "Av. Providencia 1234, Providencia, Santiago",
    etiquetas: ["Comida", "Descuento"],
    contador_usos: 47,
    beneficiosDisponibles: [
      "20% de descuento en todos los platos del menú",
      "10% adicional en cumpleaños",
      "Café de cortesía",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    nombre_empresa: "Farmacia Cruz Verde",
    descripcion_corta: "15% de descuento en medicamentos y productos de cuidado personal.",
    descripcion_larga:
      "Obtén un 15% de descuento en medicamentos con receta médica y productos de cuidado personal. Válido en todas las sucursales de la región metropolitana. No acumulable con otras promociones.",
    direccion: "Av. Las Condes 567, Las Condes, Santiago",
    etiquetas: ["Salud", "Farmacia"],
    contador_usos: 32,
    beneficiosDisponibles: [
      "15% de descuento en medicamentos con receta",
      "10% de descuento en productos de cuidado personal",
      "Entrega gratuita a domicilio",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    nombre_empresa: "Gimnasio FitLife",
    descripcion_corta: "Membresía mensual con 30% de descuento y clases grupales incluidas.",
    descripcion_larga:
      "Accede a nuestras modernas instalaciones con un 30% de descuento en la membresía mensual. Incluye acceso a todas las máquinas, piscina, sauna y clases grupales como yoga, pilates y spinning.",
    direccion: "Calle Deportiva 890, Ñuñoa, Santiago",
    etiquetas: ["Deporte", "Salud"],
    contador_usos: 28,
    beneficiosDisponibles: [
      "30% de descuento en membresía mensual",
      "Clases grupales incluidas",
      "Evaluación física gratuita",
      "Acceso a todas las instalaciones",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    nombre_empresa: "Cine Hoyts",
    descripcion_corta: "Entradas a precio especial todos los días de la semana.",
    descripcion_larga:
      "Disfruta del mejor cine con entradas a precio especial. Válido para todas las funciones de lunes a domingo. Incluye descuento en confitería. Presentar credencial del colegio.",
    direccion: "Mall Plaza Norte, Huechuraba, Santiago",
    etiquetas: ["Entretenimiento", "Cine"],
    contador_usos: 65,
    beneficiosDisponibles: [
      "Entradas 2x1 de lunes a jueves",
      "25% de descuento en confitería",
      "Descuento en salas 3D y Premium",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const INITIAL_PUBLICACIONES: Publicacion[] = [
  {
    id: 1,
    titulo: "Celebración Día del Profesor",
    descripcion:
      "Te invitamos a participar en la celebración del Día del Profesor. Habrá un almuerzo especial y actividades de reconocimiento para todo el equipo docente. El evento se realizará en el salón principal del colegio y contará con la presencia de autoridades educativas locales.\n\nLa jornada incluirá:\n- Almuerzo de camaradería\n- Entrega de reconocimientos por años de servicio\n- Presentación artística de los estudiantes\n- Sorteo de premios y regalos\n\nEsperamos contar con tu valiosa presencia en esta importante celebración.",
    fecha_publicacion: "2025-10-16T13:00:00+00:00",
    categoria: "Evento",
    lugar: "Salón Principal, Colegio Montessori",
    organizador: "Comité de Bienestar",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    titulo: "Nuevos Beneficios de Salud Disponibles",
    descripcion:
      "Se han agregado nuevos convenios con centros médicos y laboratorios clínicos. Revisa los nuevos beneficios disponibles en la sección correspondiente.\n\nLos nuevos convenios incluyen:\n- Centro Médico UC\n- Laboratorio Clínico Alemán\n- Clínica Santa María\n- Centro de Rehabilitación Kinésica\n\nPara más información sobre descuentos y condiciones, consulta en la sección de beneficios.",
    fecha_publicacion: "2025-05-28T10:00:00+00:00",
    categoria: "Noticia",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    titulo: "Taller de Bienestar Emocional",
    descripcion:
      "Participa en nuestro taller sobre manejo del estrés y bienestar emocional. Será dictado por una psicóloga especialista el próximo viernes.\n\nTemas a tratar:\n- Técnicas de relajación\n- Manejo del estrés laboral\n- Equilibrio vida-trabajo\n- Mindfulness para educadores\n\nCupos limitados. Inscripciones en secretaría.",
    fecha_publicacion: "2025-06-15T15:30:00+00:00",
    categoria: "Evento",
    lugar: "Sala de Profesores",
    organizador: "Departamento de Recursos Humanos",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    titulo: "Comunicado Importante: Cambio de Horarios",
    descripcion:
      "Se informa a todo el personal que a partir del próximo mes habrá modificaciones en los horarios de atención de bienestar.\n\nNuevos horarios:\n- Lunes a Viernes: 09:00 - 17:00\n- Miércoles: 09:00 - 13:00 (atención reducida)\n\nPara consultas, contactar al comité de bienestar.",
    fecha_publicacion: "2025-04-01T09:00:00+00:00",
    categoria: "Comunicado",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const INITIAL_COMENTARIOS_BENEFICIOS: ComentarioBeneficio[] = [
  {
    id: 1,
    contenido: "Excelente servicio y la comida está deliciosa. El descuento se aplica sin problemas.",
    beneficio_id: 1,
    usuario_id: "user-2",
    estado: "aprobado",
    fecha_creacion: "2024-12-20T10:00:00Z",
  },
  {
    id: 2,
    contenido: "Muy buena atención en la farmacia. El descuento es real y se aplica inmediatamente.",
    beneficio_id: 2,
    usuario_id: "user-2",
    estado: "aprobado",
    fecha_creacion: "2024-12-18T14:30:00Z",
  },
  {
    id: 3,
    contenido: "El gimnasio tiene muy buenas instalaciones. Recomendado.",
    beneficio_id: 3,
    usuario_id: "user-1",
    estado: "aprobado",
    fecha_creacion: "2024-12-15T09:00:00Z",
  },
]

const INITIAL_COMENTARIOS_PUBLICACIONES: ComentarioPublicacion[] = [
  {
    id: 1,
    contenido: "¡Excelente iniciativa! Estaré presente en la celebración.",
    publicacion_id: 1,
    usuario_id: "user-2",
    estado: "aprobado",
    fecha_creacion: "2024-12-20T10:00:00Z",
  },
  {
    id: 2,
    contenido: "¿Habrá transporte disponible para el evento?",
    publicacion_id: 1,
    usuario_id: "user-3",
    estado: "aprobado",
    fecha_creacion: "2024-12-19T11:00:00Z",
  },
  {
    id: 3,
    contenido: "Los nuevos convenios son una gran noticia. Gracias por gestionarlos.",
    publicacion_id: 2,
    usuario_id: "user-1",
    estado: "aprobado",
    fecha_creacion: "2024-12-18T16:00:00Z",
  },
]

const INITIAL_SUGERENCIAS: Sugerencia[] = [
  {
    id: 1,
    contenido: "Sería genial tener más opciones de descuentos en restaurantes vegetarianos.",
    fecha_creacion: "2024-12-15T10:30:00Z",
    leido: false,
  },
  {
    id: 2,
    contenido: "Propongo organizar más talleres de bienestar emocional, fueron muy útiles.",
    fecha_creacion: "2024-12-18T14:20:00Z",
    leido: false,
  },
  {
    id: 3,
    contenido: "¿Podrían agregar convenios con gimnasios más cerca del colegio?",
    fecha_creacion: "2024-12-20T09:15:00Z",
    leido: true,
  },
]

const INITIAL_ASISTENCIAS: AsistenciaEvento[] = []

// ============================================
// HELPERS DE LOCALSTORAGE
// ============================================

const STORAGE_KEYS = {
  perfiles: "bm_perfiles",
  beneficios: "bm_beneficios",
  publicaciones: "bm_publicaciones",
  comentariosBeneficios: "bm_comentarios_beneficios",
  comentariosPublicaciones: "bm_comentarios_publicaciones",
  sugerencias: "bm_sugerencias",
  asistencias: "bm_asistencias",
  initialized: "bm_initialized",
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error("Error saving to localStorage:", e)
  }
}

// Inicializar datos si es necesario
function initializeData() {
  if (typeof window === "undefined") return
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return

  setItem(STORAGE_KEYS.perfiles, INITIAL_PROFILES)
  setItem(STORAGE_KEYS.beneficios, INITIAL_BENEFICIOS)
  setItem(STORAGE_KEYS.publicaciones, INITIAL_PUBLICACIONES)
  setItem(STORAGE_KEYS.comentariosBeneficios, INITIAL_COMENTARIOS_BENEFICIOS)
  setItem(STORAGE_KEYS.comentariosPublicaciones, INITIAL_COMENTARIOS_PUBLICACIONES)
  setItem(STORAGE_KEYS.sugerencias, INITIAL_SUGERENCIAS)
  setItem(STORAGE_KEYS.asistencias, INITIAL_ASISTENCIAS)
  localStorage.setItem(STORAGE_KEYS.initialized, "true")
}

// ============================================
// DATABASE
// ============================================

export const database = {
  // --- PERFILES ---

  async getProfile(userId: string) {
    initializeData()
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    const perfil = perfiles.find((p) => p.id === userId)
    return { data: perfil || null, error: perfil ? null : { message: "Perfil no encontrado" } }
  },

  async updateProfile(userId: string, updates: Partial<Perfil>) {
    initializeData()
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    const index = perfiles.findIndex((p) => p.id === userId)
    if (index === -1) return { data: null, error: { message: "Perfil no encontrado" } }

    perfiles[index] = {
      ...perfiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    setItem(STORAGE_KEYS.perfiles, perfiles)
    return { data: perfiles[index], error: null }
  },

  async getAllProfiles() {
    initializeData()
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    const sorted = [...perfiles].sort((a, b) => {
      if (a.orden_directorio != null && b.orden_directorio != null) {
        return a.orden_directorio - b.orden_directorio
      }
      if (a.orden_directorio != null) return -1
      if (b.orden_directorio != null) return 1
      return a.nombre_completo.localeCompare(b.nombre_completo)
    })
    return { data: sorted, error: null }
  },

  // --- BENEFICIOS ---

  async getBeneficios() {
    initializeData()
    const beneficios = getItem<Beneficio[]>(STORAGE_KEYS.beneficios, [])
    const sorted = [...beneficios].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return { data: sorted, error: null }
  },

  async getBeneficio(id: number) {
    initializeData()
    const beneficios = getItem<Beneficio[]>(STORAGE_KEYS.beneficios, [])
    const beneficio = beneficios.find((b) => b.id === id)
    return {
      data: beneficio || null,
      error: beneficio ? null : { message: "Beneficio no encontrado" },
    }
  },

  async createBeneficio(beneficio: Omit<Beneficio, "id" | "created_at" | "updated_at" | "contador_usos">) {
    initializeData()
    const beneficios = getItem<Beneficio[]>(STORAGE_KEYS.beneficios, [])
    const newId = beneficios.length > 0 ? Math.max(...beneficios.map((b) => b.id)) + 1 : 1
    const nuevo: Beneficio = {
      ...(beneficio as any),
      id: newId,
      contador_usos: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    beneficios.push(nuevo)
    setItem(STORAGE_KEYS.beneficios, beneficios)
    return { data: nuevo, error: null }
  },

  async updateBeneficio(id: number, updates: Partial<Beneficio>) {
    initializeData()
    const beneficios = getItem<Beneficio[]>(STORAGE_KEYS.beneficios, [])
    const index = beneficios.findIndex((b) => b.id === id)
    if (index === -1) return { data: null, error: { message: "Beneficio no encontrado" } }

    beneficios[index] = {
      ...beneficios[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    setItem(STORAGE_KEYS.beneficios, beneficios)
    return { data: beneficios[index], error: null }
  },

  async registrarUsoBeneficio(beneficioId: number, _usuarioId: string) {
    initializeData()
    const beneficios = getItem<Beneficio[]>(STORAGE_KEYS.beneficios, [])
    const index = beneficios.findIndex((b) => b.id === beneficioId)
    if (index === -1) return { data: null, error: { message: "Beneficio no encontrado" } }

    beneficios[index].contador_usos += 1
    setItem(STORAGE_KEYS.beneficios, beneficios)
    return { data: beneficios[index], error: null }
  },

  // --- PUBLICACIONES ---

  async getPublicaciones(categoria?: "Evento" | "Noticia" | "Comunicado") {
    initializeData()
    let publicaciones = getItem<Publicacion[]>(STORAGE_KEYS.publicaciones, [])
    if (categoria) {
      publicaciones = publicaciones.filter((p) => p.categoria === categoria)
    }
    const sorted = [...publicaciones].sort(
      (a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
    )
    return { data: sorted, error: null }
  },

  async getPublicacion(id: number) {
    initializeData()
    const publicaciones = getItem<Publicacion[]>(STORAGE_KEYS.publicaciones, [])
    const pub = publicaciones.find((p) => p.id === id)
    return {
      data: pub || null,
      error: pub ? null : { message: "Publicación no encontrada" },
    }
  },

  async createPublicacion(publicacion: Omit<Publicacion, "id" | "created_at" | "updated_at">) {
    initializeData()
    const publicaciones = getItem<Publicacion[]>(STORAGE_KEYS.publicaciones, [])
    const newId = publicaciones.length > 0 ? Math.max(...publicaciones.map((p) => p.id)) + 1 : 1
    const nuevo: Publicacion = {
      ...(publicacion as any),
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    publicaciones.push(nuevo)
    setItem(STORAGE_KEYS.publicaciones, publicaciones)
    return { data: nuevo, error: null }
  },

  async confirmarAsistenciaEvento(publicacionId: number, usuarioId: string) {
    initializeData()
    const asistencias = getItem<AsistenciaEvento[]>(STORAGE_KEYS.asistencias, [])
    const existing = asistencias.find(
      (a) => a.publicacion_id === publicacionId && a.usuario_id === usuarioId
    )
    if (existing) {
      existing.confirmado = true
    } else {
      asistencias.push({
        publicacion_id: publicacionId,
        usuario_id: usuarioId,
        confirmado: true,
        created_at: new Date().toISOString(),
      })
    }
    setItem(STORAGE_KEYS.asistencias, asistencias)
    return { data: true, error: null }
  },

  // --- COMENTARIOS BENEFICIOS ---

  async getComentariosBeneficio(beneficioId: number, incluirPendientes = false) {
    initializeData()
    const comentarios = getItem<ComentarioBeneficio[]>(STORAGE_KEYS.comentariosBeneficios, [])
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    let result = comentarios.filter((c) => c.beneficio_id === beneficioId)
    if (!incluirPendientes) {
      result = result.filter((c) => c.estado === "aprobado")
    }
    result = result.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())

    // Enriquecer con perfiles
    const enriched = result.map((c) => ({
      ...c,
      perfiles: perfiles.find((p) => p.id === c.usuario_id)
        ? {
            nombre_completo: perfiles.find((p) => p.id === c.usuario_id)!.nombre_completo,
            avatar_url: perfiles.find((p) => p.id === c.usuario_id)!.avatar_url,
          }
        : undefined,
    }))
    return { data: enriched, error: null }
  },

  async createComentarioBeneficio(
    comentario: Omit<ComentarioBeneficio, "id" | "fecha_creacion" | "estado">
  ) {
    initializeData()
    const comentarios = getItem<ComentarioBeneficio[]>(STORAGE_KEYS.comentariosBeneficios, [])
    const newId = comentarios.length > 0 ? Math.max(...comentarios.map((c) => c.id)) + 1 : 1
    const nuevo: ComentarioBeneficio = {
      ...(comentario as any),
      id: newId,
      estado: "pendiente",
      fecha_creacion: new Date().toISOString(),
    }
    comentarios.push(nuevo)
    setItem(STORAGE_KEYS.comentariosBeneficios, comentarios)
    return { data: nuevo, error: null }
  },

  async moderarComentarioBeneficio(comentarioId: number, estado: "aprobado" | "archivado") {
    initializeData()
    const comentarios = getItem<ComentarioBeneficio[]>(STORAGE_KEYS.comentariosBeneficios, [])
    const index = comentarios.findIndex((c) => c.id === comentarioId)
    if (index === -1) return { data: null, error: { message: "Comentario no encontrado" } }
    comentarios[index].estado = estado
    setItem(STORAGE_KEYS.comentariosBeneficios, comentarios)
    return { data: comentarios[index], error: null }
  },

  // --- COMENTARIOS PUBLICACIONES ---

  async getComentariosPublicacion(publicacionId: number, incluirPendientes = false) {
    initializeData()
    const comentarios = getItem<ComentarioPublicacion[]>(STORAGE_KEYS.comentariosPublicaciones, [])
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    let result = comentarios.filter((c) => c.publicacion_id === publicacionId)
    if (!incluirPendientes) {
      result = result.filter((c) => c.estado === "aprobado")
    }
    result = result.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())

    const enriched = result.map((c) => ({
      ...c,
      perfiles: perfiles.find((p) => p.id === c.usuario_id)
        ? {
            nombre_completo: perfiles.find((p) => p.id === c.usuario_id)!.nombre_completo,
            avatar_url: perfiles.find((p) => p.id === c.usuario_id)!.avatar_url,
          }
        : undefined,
    }))
    return { data: enriched, error: null }
  },

  async createComentarioPublicacion(
    comentario: Omit<ComentarioPublicacion, "id" | "fecha_creacion" | "estado">
  ) {
    initializeData()
    const comentarios = getItem<ComentarioPublicacion[]>(STORAGE_KEYS.comentariosPublicaciones, [])
    const newId = comentarios.length > 0 ? Math.max(...comentarios.map((c) => c.id)) + 1 : 1
    const nuevo: ComentarioPublicacion = {
      ...(comentario as any),
      id: newId,
      estado: "pendiente",
      fecha_creacion: new Date().toISOString(),
    }
    comentarios.push(nuevo)
    setItem(STORAGE_KEYS.comentariosPublicaciones, comentarios)
    return { data: nuevo, error: null }
  },

  async moderarComentarioPublicacion(comentarioId: number, estado: "aprobado" | "archivado") {
    initializeData()
    const comentarios = getItem<ComentarioPublicacion[]>(STORAGE_KEYS.comentariosPublicaciones, [])
    const index = comentarios.findIndex((c) => c.id === comentarioId)
    if (index === -1) return { data: null, error: { message: "Comentario no encontrado" } }
    comentarios[index].estado = estado
    setItem(STORAGE_KEYS.comentariosPublicaciones, comentarios)
    return { data: comentarios[index], error: null }
  },

  // --- SUGERENCIAS ---

  async createSugerencia(contenido: string) {
    initializeData()
    const sugerencias = getItem<Sugerencia[]>(STORAGE_KEYS.sugerencias, [])
    const newId = sugerencias.length > 0 ? Math.max(...sugerencias.map((s) => s.id)) + 1 : 1
    const nueva: Sugerencia = {
      id: newId,
      contenido,
      fecha_creacion: new Date().toISOString(),
      leido: false,
    }
    sugerencias.unshift(nueva)
    setItem(STORAGE_KEYS.sugerencias, sugerencias)
    return { data: nueva, error: null }
  },

  async getSugerencias() {
    initializeData()
    const sugerencias = getItem<Sugerencia[]>(STORAGE_KEYS.sugerencias, [])
    const sorted = [...sugerencias].sort(
      (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    )
    return { data: sorted, error: null }
  },

  async marcarSugerenciaLeida(id: number) {
    initializeData()
    const sugerencias = getItem<Sugerencia[]>(STORAGE_KEYS.sugerencias, [])
    const index = sugerencias.findIndex((s) => s.id === id)
    if (index === -1) return { data: null, error: { message: "Sugerencia no encontrada" } }
    sugerencias[index].leido = true
    setItem(STORAGE_KEYS.sugerencias, sugerencias)
    return { data: sugerencias[index], error: null }
  },

  // --- ESTADÍSTICAS ---

  async getEstadisticasUsuario(usuarioId: string) {
    initializeData()
    const comentarios = getItem<ComentarioBeneficio[]>(STORAGE_KEYS.comentariosBeneficios, [])
    const count = comentarios.filter((c) => c.usuario_id === usuarioId).length
    return { beneficiosUtilizados: count, error: null }
  },

  // --- AUTENTICACIÓN ---

  async authenticateUser(email: string, rut: string) {
    initializeData()
    const perfiles = getItem<Perfil[]>(STORAGE_KEYS.perfiles, [])
    const perfil = perfiles.find(
      (p) => p.correo.toLowerCase() === email.toLowerCase()
    )

    if (!perfil) {
      return { data: null, error: { message: "Usuario no encontrado" } }
    }

    const normalizeRUT = (r: string) => r.replace(/[.-]/g, "").toLowerCase()
    if (normalizeRUT(perfil.rut) !== normalizeRUT(rut)) {
      return { data: null, error: { message: "RUT incorrecto" } }
    }

    return { data: perfil, error: null }
  },
}
