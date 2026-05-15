/**
 * Seed script — Carga datos de ejemplo en PocketBase
 *
 * Uso:
 *   POCKETBASE_URL=https://tbase.blazz.cl \
 *   PB_ADMIN_EMAIL=admin@ejemplo.com \
 *   PB_ADMIN_PASS=tu-contraseña \
 *   node scripts/seed-data.mjs
 */

const PB_URL = process.env.POCKETBASE_URL || "http://localhost:8090"
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const ADMIN_PASS = process.env.PB_ADMIN_PASS

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Faltan PB_ADMIN_EMAIL y/o PB_ADMIN_PASS")
  process.exit(1)
}

async function main() {
  // 1. Autenticar como superuser
  console.log(`Autenticando en ${PB_URL}...`)
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })

  if (!authRes.ok) {
    const err = await authRes.text()
    console.error("Error de autenticación:", err)
    process.exit(1)
  }

  const { token } = await authRes.json()
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  let created = 0

  async function createRecord(collection, data) {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`  ❌ ${collection}: ${err}`)
    } else {
      const record = await res.json()
      console.log(`  ✅ ${collection}: ${record.id}`)
      created++
      return record
    }
  }

  // 2. Beneficios
  console.log("\n📦 Beneficios:")
  const beneficios = [
    {
      nombre_empresa: "Farmacias Ahumada",
      descripcion_corta: "20% de descuento en medicamentos",
      descripcion_larga: "Descuento exclusivo para funcionarios del Colegio Montessori en todas las sucursales de Farmacias Ahumada. Presentar credencial institucional.",
      direccion: "Av. Principal 123, Santiago",
      etiquetas: JSON.stringify(["salud", "descuento"]),
      foto_local: null,
      fecha_inicio: "2026-01-01T00:00:00Z",
      fecha_termino: "2026-12-31T00:00:00Z",
      contador_usos: 15,
      beneficios_disponibles: JSON.stringify(["20% descuento general", "10% adicional en genéricos"]),
    },
    {
      nombre_empresa: "Gimnasio SportLife",
      descripcion_corta: "50% en mensualidad sin matrícula",
      descripcion_larga: "Acceso ilimitado a todas las sucursales. Incluye evaluaciones físicas y clases dirigidas. Beneficio válido para el funcionario titular y su grupo familiar directo.",
      direccion: "Av. Los Leones 456, Providencia",
      etiquetas: JSON.stringify(["bienestar", "deporte"]),
      foto_local: null,
      fecha_inicio: "2026-03-01T00:00:00Z",
      fecha_termino: "2026-09-30T00:00:00Z",
      contador_usos: 7,
      beneficios_disponibles: JSON.stringify(["50% mensualidad", "Sin matrícula", "Evaluación física gratis"]),
    },
    {
      nombre_empresa: "Librería El Estudiante",
      descripcion_corta: "30% off en útiles escolares y libros",
      descripcion_larga: "Válido durante todo el año en compras presenciales y online. Incluye textos escolares, material didáctico y literatura general.",
      direccion: "Av. Providencia 789, Santiago",
      etiquetas: JSON.stringify(["educación", "descuento"]),
      foto_local: null,
      fecha_inicio: "2026-01-01T00:00:00Z",
      fecha_termino: "2026-12-31T00:00:00Z",
      contador_usos: 23,
      beneficios_disponibles: JSON.stringify(["30% en libros", "20% en útiles escolares"]),
    },
  ]

  for (const b of beneficios) {
    await createRecord("beneficios", b)
  }

  // 3. Publicaciones (noticias/eventos)
  console.log("\n📰 Publicaciones:")
  const publicaciones = [
    {
      titulo: "Feria de Salud Mental",
      descripcion: "Este viernes 22 de mayo se realizará la Feria de Salud Mental en el Salón de Actos. Habrá stands informativos, talleres de mindfulness y evaluaciones gratuitas.",
      fecha_publicacion: "2026-05-22T10:00:00Z",
      categoria: "Evento",
      lugar: "Salón de Actos, Colegio Montessori",
      organizador: "Departamento de Bienestar",
    },
    {
      titulo: "Taller de Finanzas Personales",
      descripcion: "Dirigido a todos los funcionarios. Aprenderás a presupuestar, ahorrar y planificar tus metas financieras. Cupos limitados.",
      fecha_publicacion: "2026-06-05T15:00:00Z",
      categoria: "Evento",
      lugar: "Sala de Conferencias, Edificio Central",
      organizador: "Equipo de Bienestar",
    },
    {
      titulo: "Nuevos horarios de atención",
      descripcion: "Se informa que a partir del 1 de junio, la oficina de Bienestar atenderá en horario continuado de 9:00 a 17:00 hrs.",
      fecha_publicacion: "2026-05-15T09:00:00Z",
      categoria: "Comunicado",
      lugar: "",
      organizador: "Dirección",
    },
  ]

  for (const p of publicaciones) {
    await createRecord("publicaciones", p)
  }

  // 4. Sugerencias de ejemplo
  console.log("\n💡 Sugerencias:")
  const sugerencias = [
    {
      contenido: "Sugiero implementar un convenio con un servicio de taxi ejecutivo para los funcionarios que salen tarde.",
      fecha_creacion: "2026-05-10T14:30:00Z",
      leido: false,
    },
    {
      contenido: "Podrían agregar más opciones de comida saludable en la cafetería del colegio.",
      fecha_creacion: "2026-05-08T10:15:00Z",
      leido: true,
    },
    {
      contenido: "Propongo organizar una jornada de team building una vez al mes para fortalecer los lazos entre departamentos.",
      fecha_creacion: "2026-05-12T16:45:00Z",
      leido: false,
    },
  ]

  for (const s of sugerencias) {
    await createRecord("sugerencias", s)
  }

  console.log(`\n🎉 Seed completado! ${created} registros creados.`)
}

main().catch(console.error)
