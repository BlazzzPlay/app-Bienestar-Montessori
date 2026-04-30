// Tipos TypeScript para nuestras tablas
export interface Perfil {
  id: string
  nombre_completo: string
  correo: string
  rut: string
  fecha_nacimiento?: string
  sexo?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir"
  telefono?: string
  cargo?: string
  fecha_ingreso?: string
  jornada_trabajo?: "Jornada Mañana" | "Jornada Tarde" | "Ambas Jornadas"
  avatar_url?: string
  es_bienestar: boolean
  rol: "Administrador" | "Presidente" | "Directorio" | "Beneficiario" | "Visualizador"
  orden_directorio?: number
  created_at: string
  updated_at: string
}

export interface Beneficio {
  id: number
  nombre_empresa: string
  descripcion_corta: string
  descripcion_larga?: string
  direccion?: string
  etiquetas: string[]
  foto_local_url?: string
  fecha_inicio?: string
  fecha_termino?: string
  contador_usos: number
  beneficiosDisponibles?: string[]
  created_at: string
  updated_at: string
}

export interface Publicacion {
  id: number
  titulo: string
  descripcion: string
  fecha_publicacion: string
  categoria: "Evento" | "Noticia" | "Comunicado"
  autor_id?: string
  lugar?: string
  organizador?: string
  imagen_url?: string
  created_at: string
  updated_at: string
}

export interface ComentarioBeneficio {
  id: number
  contenido: string
  beneficio_id: number
  usuario_id: string
  estado: "pendiente" | "aprobado" | "archivado"
  fecha_creacion: string
  perfiles?: Perfil
}

export interface ComentarioPublicacion {
  id: number
  contenido: string
  publicacion_id: number
  usuario_id: string
  estado: "pendiente" | "aprobado" | "archivado"
  fecha_creacion: string
  perfiles?: Perfil
}

export interface Sugerencia {
  id: number
  contenido: string
  fecha_creacion: string
  leido: boolean
}

export interface AsistenciaEvento {
  publicacion_id: number
  usuario_id: string
  confirmado: boolean
  created_at: string
}
