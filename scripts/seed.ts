import { createServiceClient } from "../lib/supabaseClient"

const TEST_USERS = [
  {
    email: "patricia.morales@colegiomontessori.cl",
    nombre_completo: "Patricia Morales",
    rut: "12345678-9",
    cargo: "Presidenta de Bienestar",
    fecha_ingreso: "2020-03-15",
    jornada_trabajo: "Ambas Jornadas",
    es_bienestar: true,
    rol: "Presidente",
    orden_directorio: 1,
  },
  {
    email: "maria.gonzalez@colegiomontessori.cl",
    nombre_completo: "María Elena González",
    rut: "98765432-1",
    cargo: "Profesora de Matemáticas",
    fecha_ingreso: "2018-08-20",
    jornada_trabajo: "Jornada Mañana",
    es_bienestar: true,
    rol: "Beneficiario",
  },
  {
    email: "juan.perez@colegiomontessori.cl",
    nombre_completo: "Juan Carlos Pérez",
    rut: "11223344-5",
    cargo: "Profesor de Historia",
    fecha_ingreso: "2019-02-10",
    jornada_trabajo: "Jornada Tarde",
    es_bienestar: false,
    rol: "Visualizador",
  },
  {
    email: "admin@colegiomontessori.cl",
    nombre_completo: "Administrador Sistema",
    rut: "99887766-4",
    cargo: "Administrador de Sistema",
    fecha_ingreso: "2020-01-01",
    jornada_trabajo: "Ambas Jornadas",
    es_bienestar: true,
    rol: "Administrador",
    orden_directorio: 0,
  },
]

const BENEFICIOS = [
  {
    nombre_empresa: "Restaurante El Buen Sabor",
    descripcion_corta: "20% de descuento en todos los platos del menú. Válido de lunes a viernes.",
    descripcion_larga:
      "Disfruta de un 20% de descuento en todos los platos de nuestro menú. Ofrecemos comida casera de alta calidad con ingredientes frescos y locales.",
    direccion: "Av. Providencia 1234, Providencia, Santiago",
    etiquetas: ["Comida", "Descuento"],
    contador_usos: 47,
    beneficios_disponibles: [
      "20% de descuento en todos los platos del menú",
      "10% adicional en cumpleaños",
      "Café de cortesía",
    ],
  },
  {
    nombre_empresa: "Farmacia Cruz Verde",
    descripcion_corta: "15% de descuento en medicamentos y productos de cuidado personal.",
    descripcion_larga:
      "Obtén un 15% de descuento en medicamentos con receta médica y productos de cuidado personal.",
    direccion: "Av. Las Condes 567, Las Condes, Santiago",
    etiquetas: ["Salud", "Farmacia"],
    contador_usos: 32,
    beneficios_disponibles: [
      "15% de descuento en medicamentos con receta",
      "10% de descuento en productos de cuidado personal",
      "Entrega gratuita a domicilio",
    ],
  },
  {
    nombre_empresa: "Gimnasio FitLife",
    descripcion_corta: "Membresía mensual con 30% de descuento y clases grupales incluidas.",
    descripcion_larga:
      "Accede a nuestras modernas instalaciones con un 30% de descuento en la membresía mensual.",
    direccion: "Calle Deportiva 890, Ñuñoa, Santiago",
    etiquetas: ["Deporte", "Salud"],
    contador_usos: 28,
    beneficios_disponibles: [
      "30% de descuento en membresía mensual",
      "Clases grupales incluidas",
      "Evaluación física gratuita",
      "Acceso a todas las instalaciones",
    ],
  },
  {
    nombre_empresa: "Cine Hoyts",
    descripcion_corta: "Entradas a precio especial todos los días de la semana.",
    descripcion_larga:
      "Disfruta del mejor cine con entradas a precio especial. Válido para todas las funciones de lunes a domingo.",
    direccion: "Mall Plaza Norte, Huechuraba, Santiago",
    etiquetas: ["Entretenimiento", "Cine"],
    contador_usos: 65,
    beneficios_disponibles: [
      "Entradas 2x1 de lunes a jueves",
      "25% de descuento en confitería",
      "Descuento en salas 3D y Premium",
    ],
  },
]

const PUBLICACIONES = [
  {
    titulo: "Celebración Día del Profesor",
    descripcion:
      "Te invitamos a participar en la celebración del Día del Profesor. Habrá un almuerzo especial y actividades de reconocimiento.",
    fecha_publicacion: "2025-10-16T13:00:00+00:00",
    categoria: "Evento" as const,
    lugar: "Salón Principal, Colegio Montessori",
    organizador: "Comité de Bienestar",
  },
  {
    titulo: "Nuevos Beneficios de Salud Disponibles",
    descripcion: "Se han agregado nuevos convenios con centros médicos y laboratorios clínicos.",
    fecha_publicacion: "2025-05-28T10:00:00+00:00",
    categoria: "Noticia" as const,
  },
  {
    titulo: "Taller de Bienestar Emocional",
    descripcion:
      "Participa en nuestro taller sobre manejo del estrés y bienestar emocional. Será dictado por una psicóloga especialista.",
    fecha_publicacion: "2025-06-15T15:30:00+00:00",
    categoria: "Evento" as const,
    lugar: "Sala de Profesores",
    organizador: "Departamento de Recursos Humanos",
  },
  {
    titulo: "Comunicado Importante: Cambio de Horarios",
    descripcion:
      "Se informa a todo el personal que a partir del próximo mes habrá modificaciones en los horarios.",
    fecha_publicacion: "2025-04-01T09:00:00+00:00",
    categoria: "Comunicado" as const,
  },
]

async function seed() {
  const supabase = createServiceClient()

  // Check idempotency
  const { count: perfilesCount } = await supabase
    .from("perfiles")
    .select("*", { count: "exact", head: true })

  if (perfilesCount && perfilesCount > 0) {
    console.log("⚡ Database already seeded. Skipping.")
    return
  }

  console.log("🌱 Seeding database...")

  // 1. Create auth users and update perfiles
  for (const u of TEST_USERS) {
    const { data: existing } = await supabase
      .from("perfiles")
      .select("id")
      .eq("correo", u.email)
      .single()

    if (existing) {
      console.log(`  ⏭️  User ${u.email} already exists`)
      continue
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      email_confirm: true,
    })

    if (authError) {
      console.error(`  ❌ Failed to create auth user ${u.email}:`, authError.message)
      continue
    }

    const userId = authData.user!.id

    // Trigger auto-inserted a perfiles row; update it
    const { error: updateError } = await supabase
      .from("perfiles")
      .update({
        nombre_completo: u.nombre_completo,
        rut: u.rut,
        cargo: u.cargo,
        fecha_ingreso: u.fecha_ingreso,
        jornada_trabajo: u.jornada_trabajo as any,
        es_bienestar: u.es_bienestar,
        rol: u.rol as any,
        orden_directorio: u.orden_directorio,
      })
      .eq("id", userId)

    if (updateError) {
      console.error(`  ❌ Failed to update perfil ${u.email}:`, updateError.message)
    } else {
      console.log(`  ✅ Created user ${u.email}`)
    }
  }

  // 2. Seed beneficios
  const { data: beneficiosData, error: beneficiosError } = await supabase
    .from("beneficios")
    .insert(BENEFICIOS)
    .select()

  if (beneficiosError) {
    console.error("❌ Failed to seed beneficios:", beneficiosError.message)
  } else {
    console.log(`✅ Seeded ${beneficiosData.length} beneficios`)
  }

  // 3. Seed publicaciones
  const { data: pubsData, error: pubsError } = await supabase
    .from("publicaciones")
    .insert(PUBLICACIONES)
    .select()

  if (pubsError) {
    console.error("❌ Failed to seed publicaciones:", pubsError.message)
  } else {
    console.log(`✅ Seeded ${pubsData.length} publicaciones`)
  }

  // 4. Seed comentarios_beneficios
  const { data: allPerfiles } = await supabase.from("perfiles").select("id,correo")
  const perfilMap = new Map(allPerfiles?.map((p) => [p.correo, p.id]))

  const comentariosBeneficios = [
    {
      contenido:
        "Excelente servicio y la comida está deliciosa. El descuento se aplica sin problemas.",
      beneficio_id: beneficiosData?.[0]?.id,
      usuario_id: perfilMap.get("maria.gonzalez@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
    {
      contenido:
        "Muy buena atención en la farmacia. El descuento es real y se aplica inmediatamente.",
      beneficio_id: beneficiosData?.[1]?.id,
      usuario_id: perfilMap.get("maria.gonzalez@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
    {
      contenido: "El gimnasio tiene muy buenas instalaciones. Recomendado.",
      beneficio_id: beneficiosData?.[2]?.id,
      usuario_id: perfilMap.get("patricia.morales@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
  ].filter((c) => c.beneficio_id && c.usuario_id)

  if (comentariosBeneficios.length > 0) {
    const { error: cbError } = await supabase
      .from("comentarios_beneficios")
      .insert(comentariosBeneficios as any)
    if (cbError) console.error("❌ Failed to seed comentarios_beneficios:", cbError.message)
    else console.log(`✅ Seeded ${comentariosBeneficios.length} comentarios_beneficios`)
  }

  // 5. Seed comentarios_publicaciones
  const comentariosPublicaciones = [
    {
      contenido: "¡Excelente iniciativa! Estaré presente en la celebración.",
      publicacion_id: pubsData?.[0]?.id,
      usuario_id: perfilMap.get("maria.gonzalez@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
    {
      contenido: "¿Habrá transporte disponible para el evento?",
      publicacion_id: pubsData?.[0]?.id,
      usuario_id: perfilMap.get("juan.perez@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
    {
      contenido: "Los nuevos convenios son una gran noticia. Gracias por gestionarlos.",
      publicacion_id: pubsData?.[1]?.id,
      usuario_id: perfilMap.get("patricia.morales@colegiomontessori.cl"),
      estado: "aprobado" as const,
    },
  ].filter((c) => c.publicacion_id && c.usuario_id)

  if (comentariosPublicaciones.length > 0) {
    const { error: cpError } = await supabase
      .from("comentarios_publicaciones")
      .insert(comentariosPublicaciones as any)
    if (cpError) console.error("❌ Failed to seed comentarios_publicaciones:", cpError.message)
    else console.log(`✅ Seeded ${comentariosPublicaciones.length} comentarios_publicaciones`)
  }

  // 6. Seed sugerencias
  const sugerencias = [
    { contenido: "Sería genial tener más opciones de descuentos en restaurantes vegetarianos." },
    { contenido: "Propongo organizar más talleres de bienestar emocional, fueron muy útiles." },
    { contenido: "¿Podrían agregar convenios con gimnasios más cerca del colegio?" },
  ]

  const { error: sugError } = await supabase.from("sugerencias").insert(sugerencias)
  if (sugError) console.error("❌ Failed to seed sugerencias:", sugError.message)
  else console.log(`✅ Seeded ${sugerencias.length} sugerencias`)

  console.log("🎉 Seed complete!")
}

seed().catch((err) => {
  console.error("Fatal seed error:", err)
  process.exit(1)
})
