import { tempAuth } from "./temp-auth"

// Datos temporales para beneficios
const TEMP_BENEFICIOS = [
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
    contadorUsos: 47,
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
    contadorUsos: 32,
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
    contadorUsos: 28,
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
    contadorUsos: 65,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Datos temporales para publicaciones
const TEMP_PUBLICACIONES = [
  {
    id: 1,
    titulo: "Celebración Día del Profesor",
    descripcion:
      "Te invitamos a participar en la celebración del Día del Profesor. Habrá un almuerzo especial y actividades de reconocimiento para todo el equipo docente. El evento se realizará en el salón principal del colegio y contará con la presencia de autoridades educativas locales.\n\nLa jornada incluirá:\n- Almuerzo de camaradería\n- Entrega de reconocimientos por años de servicio\n- Presentación artística de los estudiantes\n- Sorteo de premios y regalos\n\nEsperamos contar con tu valiosa presencia en esta importante celebración.",
    fecha_publicacion: "2025-10-16T13:00:00+00:00",
    categoria: "Evento" as const,
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
    categoria: "Noticia" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    titulo: "Taller de Bienestar Emocional",
    descripcion:
      "Participa en nuestro taller sobre manejo del estrés y bienestar emocional. Será dictado por una psicóloga especialista el próximo viernes.\n\nTemas a tratar:\n- Técnicas de relajación\n- Manejo del estrés laboral\n- Equilibrio vida-trabajo\n- Mindfulness para educadores\n\nCupos limitados. Inscripciones en secretaría.",
    fecha_publicacion: "2025-06-15T15:30:00+00:00",
    categoria: "Evento" as const,
    lugar: "Sala de Profesores",
    organizador: "Departamento de Recursos Humanos",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Datos temporales para sugerencias
const TEMP_SUGERENCIAS = [
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

export const tempDatabase = {
  // PERFILES
  async getProfile(userId: string) {
    return await tempAuth.getProfile(userId)
  },

  async updateProfile(userId: string, updates: any) {
    return await tempAuth.updateProfile(userId, updates)
  },

  async getAllProfiles() {
    return await tempAuth.getAllProfiles()
  },

  // BENEFICIOS
  async getBeneficios() {
    return { data: TEMP_BENEFICIOS, error: null }
  },

  async getBeneficio(id: number) {
    const beneficio = TEMP_BENEFICIOS.find((b) => b.id === id)
    return {
      data: beneficio || null,
      error: beneficio ? null : { message: "Beneficio no encontrado" },
    }
  },

  async registrarUsoBeneficio(beneficioId: number, usuarioId: string) {
    // Simular registro exitoso
    const beneficio = TEMP_BENEFICIOS.find((b) => b.id === beneficioId)
    if (beneficio) {
      beneficio.contador_usos += 1
    }
    return { data: true, error: null }
  },

  // PUBLICACIONES
  async getPublicaciones(categoria?: "Evento" | "Noticia") {
    let publicaciones = TEMP_PUBLICACIONES

    if (categoria) {
      publicaciones = publicaciones.filter((p) => p.categoria === categoria)
    }

    return { data: publicaciones, error: null }
  },

  async getPublicacion(id: number) {
    const publicacion = TEMP_PUBLICACIONES.find((p) => p.id === id)
    return {
      data: publicacion || null,
      error: publicacion ? null : { message: "Publicación no encontrada" },
    }
  },

  // COMENTARIOS (simulados)
  async getComentariosBeneficio(beneficioId: number, incluirPendientes = false) {
    const comentarios = [
      {
        id: 1,
        contenido: "Excelente servicio y la comida está deliciosa. El descuento se aplica sin problemas.",
        beneficio_id: beneficioId,
        usuario_id: "user-2",
        estado: "aprobado" as const,
        fecha_creacion: "2024-12-20T10:00:00Z",
        perfiles: {
          nombre_completo: "María Elena González",
          avatar_url: "/placeholder.svg?height=40&width=40",
        },
      },
    ]

    return { data: comentarios, error: null }
  },

  async getComentariosPublicacion(publicacionId: number, incluirPendientes = false) {
    const comentarios = [
      {
        id: 1,
        contenido: "¡Excelente iniciativa! Estaré presente en la celebración.",
        publicacion_id: publicacionId,
        usuario_id: "user-2",
        estado: "aprobado" as const,
        fecha_creacion: "2024-12-20T10:00:00Z",
        perfiles: {
          nombre_completo: "María Elena González",
          avatar_url: "/placeholder.svg?height=40&width=40",
        },
      },
    ]

    return { data: comentarios, error: null }
  },

  // SUGERENCIAS
  async createSugerencia(contenido: string) {
    const nuevaSugerencia = {
      id: Date.now(),
      contenido,
      fecha_creacion: new Date().toISOString(),
      leido: false,
    }
    TEMP_SUGERENCIAS.unshift(nuevaSugerencia)
    return { data: nuevaSugerencia, error: null }
  },

  async getSugerencias() {
    return { data: TEMP_SUGERENCIAS, error: null }
  },

  async marcarSugerenciaLeida(id: number) {
    const sugerencia = TEMP_SUGERENCIAS.find((s) => s.id === id)
    if (sugerencia) {
      sugerencia.leido = true
    }
    return { data: sugerencia, error: null }
  },

  // ESTADÍSTICAS
  async getEstadisticasUsuario(usuarioId: string) {
    return await tempAuth.getEstadisticasUsuario(usuarioId)
  },
}
