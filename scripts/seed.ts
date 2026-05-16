#!/usr/bin/env tsx
/**
 * seed.ts
 *
 * Seeds PocketBase with test data via Admin API.
 *
 * Usage:
 *   NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090 \
 *   POCKETBASE_ADMIN_EMAIL=admin@example.com \
 *   POCKETBASE_ADMIN_PASSWORD=password \
 *   npx tsx scripts/seed.ts
 */

import PocketBase from "pocketbase"

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://localhost:8090"
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("❌ Missing PB admin env vars (POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD)")
  process.exit(1)
}

const pb = new PocketBase(PB_URL)

// -----------------------------------------------------------------------
// Test data
// -----------------------------------------------------------------------

const TEST_USERS = [
  {
    email: "patricia.morales@colegiomontessori.cl",
    password: "reset-6789",
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
    password: "reset-4321",
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
    password: "reset-4455",
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
    password: "reset-7664",
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
    beneficiosDisponibles: [
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
    beneficiosDisponibles: [
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
    beneficiosDisponibles: [
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
    beneficiosDisponibles: [
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
    categoria: "Evento",
    lugar: "Salón Principal, Colegio Montessori",
    organizador: "Comité de Bienestar",
  },
  {
    titulo: "Nuevos Beneficios de Salud Disponibles",
    descripcion: "Se han agregado nuevos convenios con centros médicos y laboratorios clínicos.",
    fecha_publicacion: "2025-05-28T10:00:00+00:00",
    categoria: "Noticia",
  },
  {
    titulo: "Taller de Bienestar Emocional",
    descripcion:
      "Participa en nuestro taller sobre manejo del estrés y bienestar emocional. Será dictado por una psicóloga especialista.",
    fecha_publicacion: "2025-06-15T15:30:00+00:00",
    categoria: "Evento",
    lugar: "Sala de Profesores",
    organizador: "Departamento de Recursos Humanos",
  },
  {
    titulo: "Comunicado Importante: Cambio de Horarios",
    descripcion:
      "Se informa a todo el personal que a partir del próximo mes habrá modificaciones en los horarios.",
    fecha_publicacion: "2025-04-01T09:00:00+00:00",
    categoria: "Comunicado",
  },
]

const SUGERENCIAS = [
  { contenido: "Sería genial tener más opciones de descuentos en restaurantes vegetarianos." },
  { contenido: "Propongo organizar más talleres de bienestar emocional, fueron muy útiles." },
  { contenido: "¿Podrían agregar convenios con gimnasios más cerca del colegio?" },
]

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function logOk(msg: string) {
  console.log(`  ✅ ${msg}`)
}

function logFail(msg: string) {
  console.error(`  ❌ ${msg}`)
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding PocketBase…\n")

  // Authenticate as admin
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
  logOk(`Authenticated as ${PB_ADMIN_EMAIL}`)

  // Check idempotency: if any user exists, skip
  const existingUsers = await pb.collection("users").getList(1, 1)
  if (existingUsers.totalItems > 0) {
    console.log("\n⚡ Database already seeded. Skipping.")
    return
  }

  const userMap = new Map<string, string>()

  // 1. Create users
  console.log("\n👤 Creating users…")
  for (const u of TEST_USERS) {
    try {
      const record = await pb.collection("users").create({
        email: u.email,
        password: u.password,
        passwordConfirm: u.password,
        nombre_completo: u.nombre_completo,
        rut: u.rut,
        cargo: u.cargo,
        fecha_ingreso: u.fecha_ingreso,
        jornada_trabajo: u.jornada_trabajo,
        es_bienestar: u.es_bienestar,
        rol: u.rol,
        orden_directorio: u.orden_directorio,
      })
      userMap.set(u.email, record.id)
      logOk(`Created ${u.email} → ${record.id}`)
    } catch (e: any) {
      logFail(`Failed to create user ${u.email}: ${e.message}`)
    }
  }

  // 2. Create beneficios
  console.log("\n🏪 Creating beneficios…")
  const beneficioIds: Record<string, any>[] = []
  for (const b of BENEFICIOS) {
    try {
      const record = await pb.collection("beneficios").create(b)
      beneficioIds.push(record)
      logOk(`${b.nombre_empresa} → ${record.id}`)
    } catch (e: any) {
      logFail(`Failed to create beneficio ${b.nombre_empresa}: ${e.message}`)
    }
  }

  // 3. Create publicaciones
  console.log("\n📰 Creating publicaciones…")
  const publicacionIds: Record<string, any>[] = []
  for (const p of PUBLICACIONES) {
    try {
      const record = await pb.collection("publicaciones").create(p)
      publicacionIds.push(record)
      logOk(`${p.titulo} → ${record.id}`)
    } catch (e: any) {
      logFail(`Failed to create publicacion ${p.titulo}: ${e.message}`)
    }
  }

  // 4. Create comentarios_beneficios
  console.log("\n💬 Creating comentarios_beneficios…")
  const mariaId = userMap.get("maria.gonzalez@colegiomontessori.cl")
  const patriciaId = userMap.get("patricia.morales@colegiomontessori.cl")

  const comentariosBeneficios = [
    {
      contenido:
        "Excelente servicio y la comida está deliciosa. El descuento se aplica sin problemas.",
      beneficio: beneficioIds[0]?.id,
      usuario: mariaId,
      estado: "aprobado",
    },
    {
      contenido:
        "Muy buena atención en la farmacia. El descuento es real y se aplica inmediatamente.",
      beneficio: beneficioIds[1]?.id,
      usuario: mariaId,
      estado: "aprobado",
    },
    {
      contenido: "El gimnasio tiene muy buenas instalaciones. Recomendado.",
      beneficio: beneficioIds[2]?.id,
      usuario: patriciaId,
      estado: "aprobado",
    },
  ].filter((c) => c.beneficio && c.usuario)

  for (const c of comentariosBeneficios) {
    try {
      await pb.collection("comentarios_beneficios").create(c)
      logOk("Comentario beneficio created")
    } catch (e: any) {
      logFail(`Failed to create comentario_beneficio: ${e.message}`)
    }
  }

  // 5. Create comentarios_publicaciones
  console.log("\n💬 Creating comentarios_publicaciones…")
  const juanId = userMap.get("juan.perez@colegiomontessori.cl")

  const comentariosPublicaciones = [
    {
      contenido: "¡Excelente iniciativa! Estaré presente en la celebración.",
      publicacion: publicacionIds[0]?.id,
      usuario: mariaId,
      estado: "aprobado",
    },
    {
      contenido: "¿Habrá transporte disponible para el evento?",
      publicacion: publicacionIds[0]?.id,
      usuario: juanId,
      estado: "aprobado",
    },
    {
      contenido: "Los nuevos convenios son una gran noticia. Gracias por gestionarlos.",
      publicacion: publicacionIds[1]?.id,
      usuario: patriciaId,
      estado: "aprobado",
    },
  ].filter((c) => c.publicacion && c.usuario)

  for (const c of comentariosPublicaciones) {
    try {
      await pb.collection("comentarios_publicaciones").create(c)
      logOk("Comentario publicacion created")
    } catch (e: any) {
      logFail(`Failed to create comentario_publicacion: ${e.message}`)
    }
  }

  // 6. Create sugerencias
  console.log("\n💡 Creating sugerencias…")
  for (const s of SUGERENCIAS) {
    try {
      await pb.collection("sugerencias").create(s)
      logOk("Sugerencia created")
    } catch (e: any) {
      logFail(`Failed to create sugerencia: ${e.message}`)
    }
  }

  console.log("\n🎉 Seed complete!")
}

seed().catch((err) => {
  console.error("💥 Fatal seed error:", err)
  process.exit(1)
})
