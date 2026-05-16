#!/usr/bin/env tsx
/**
 * migrate-supabase-to-pb.ts
 *
 * One-way migration script: exports all Supabase tables, transforms data
 * to PocketBase schema, and imports via PB Admin API.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   NEXT_PUBLIC_POCKETBASE_URL=... \
 *   POCKETBASE_ADMIN_EMAIL=... \
 *   POCKETBASE_ADMIN_PASSWORD=... \
 *   npx tsx scripts/migrate-supabase-to-pb.ts
 *
 * Order: users → beneficios → publicaciones → dependent tables
 */

import { createClient } from "@supabase/supabase-js"
import PocketBase from "pocketbase"

// -----------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://localhost:8090"
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
  )
  process.exit(1)
}
if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("❌ Missing PB admin env vars (POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD)")
  process.exit(1)
}

// -----------------------------------------------------------------------
// Clients
// -----------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const pb = new PocketBase(PB_URL)

// -----------------------------------------------------------------------
// State
// -----------------------------------------------------------------------

/** old UUID → new PB 15-char ID for users */
const userMap = new Map<string, string>()
/** old int → new PB int ID for records that keep numeric IDs */
const beneficioMap = new Map<number, number>()
const publicacionMap = new Map<number, number>()

let totalErrors = 0
let totalCreated = 0

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function logOk(msg: string) {
  console.log(`  ✅ ${msg}`)
}
function logFail(msg: string) {
  console.error(`  ❌ ${msg}`)
  totalErrors++
}
function logSkip(msg: string) {
  console.log(`  ⏭️  ${msg}`)
}

// -----------------------------------------------------------------------
// Step 1 — Authenticate PB Admin
// -----------------------------------------------------------------------

async function authAdmin() {
  console.log("\n🔐 Authenticating PocketBase admin…")
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
    logOk(`Authenticated as ${PB_ADMIN_EMAIL}`)
  } catch (e: any) {
    console.error(`❌ PB admin auth failed: ${e.message}`)
    process.exit(1)
  }
}

// -----------------------------------------------------------------------
// Step 2 — Migrate users (perfiles → users)
// -----------------------------------------------------------------------

async function migrateUsers() {
  console.log("\n👤 Migrating users (perfiles → users)…")

  const { data: perfiles, error } = await supabase.from("perfiles").select("*")
  if (error) {
    logFail(`Cannot fetch perfiles: ${error.message}`)
    return
  }
  if (!perfiles || perfiles.length === 0) {
    logSkip("No perfiles to migrate")
    return
  }
  console.log(`  Found ${perfiles.length} perfiles`)

  for (const p of perfiles) {
    const tempPassword = `reset-${(p.rut ?? "changeme").slice(-4)}`

    try {
      const record = await pb.collection("users").create({
        email: p.correo,
        password: tempPassword,
        passwordConfirm: tempPassword,
        nombre_completo: p.nombre_completo,
        rut: p.rut,
        fecha_nacimiento: p.fecha_nacimiento ?? undefined,
        sexo: p.sexo ?? undefined,
        telefono: p.telefono ?? undefined,
        cargo: p.cargo ?? undefined,
        fecha_ingreso: p.fecha_ingreso ?? undefined,
        jornada_trabajo: p.jornada_trabajo ?? undefined,
        es_bienestar: p.es_bienestar,
        rol: p.rol,
        orden_directorio: p.orden_directorio ?? undefined,
        taller: p.taller ?? undefined,
        peso: p.peso ?? undefined,
        intereses: p.intereses ?? undefined,
        tipo_sangre: p.tipo_sangre ?? undefined,
        alergias: p.alergias ?? undefined,
      })

      userMap.set(p.id, record.id)
      totalCreated++
      logOk(`${p.correo} → ${record.id} (temp: ${tempPassword})`)
    } catch (e: any) {
      logFail(`Failed to create user ${p.correo}: ${e.message}`)
    }
  }

  console.log(`  📊 Users migrated: ${userMap.size}`)
}

// -----------------------------------------------------------------------
// Step 3 — Migrate beneficios
// -----------------------------------------------------------------------

async function migrateBeneficios() {
  console.log("\n🏪 Migrating beneficios…")

  const { data: beneficios, error } = await supabase.from("beneficios").select("*")
  if (error) {
    logFail(`Cannot fetch beneficios: ${error.message}`)
    return
  }
  if (!beneficios || beneficios.length === 0) {
    logSkip("No beneficios to migrate")
    return
  }

  for (const b of beneficios) {
    try {
      // Use the same numeric ID if the collection allows it, otherwise let PB auto-generate
      const payload: Record<string, any> = {
        nombre_empresa: b.nombre_empresa,
        descripcion_corta: b.descripcion_corta,
        descripcion_larga: b.descripcion_larga ?? undefined,
        direccion: b.direccion ?? undefined,
        etiquetas: b.etiquetas ?? [],
        fecha_inicio: b.fecha_inicio ?? undefined,
        fecha_termino: b.fecha_termino ?? undefined,
        contador_usos: b.contador_usos ?? 0,
        beneficiosDisponibles: b.beneficiosDisponibles ?? undefined,
      }
      // Attempt to preserve original ID; ignore if PB rejects it
      const record = await pb.collection("beneficios").create(payload)
      beneficioMap.set(b.id, Number(record.id) || b.id)
      totalCreated++
      logOk(`${b.nombre_empresa} (id: ${b.id} → ${record.id})`)
    } catch (e: any) {
      logFail(`Failed to create beneficio ${b.nombre_empresa}: ${e.message}`)
    }
  }

  console.log(`  📊 Beneficios migrated: ${beneficioMap.size}`)
}

// -----------------------------------------------------------------------
// Step 4 — Migrate publicaciones
// -----------------------------------------------------------------------

async function migratePublicaciones() {
  console.log("\n📰 Migrating publicaciones…")

  const { data: publicaciones, error } = await supabase.from("publicaciones").select("*")
  if (error) {
    logFail(`Cannot fetch publicaciones: ${error.message}`)
    return
  }
  if (!publicaciones || publicaciones.length === 0) {
    logSkip("No publicaciones to migrate")
    return
  }

  for (const pub of publicaciones) {
    try {
      const record = await pb.collection("publicaciones").create({
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        fecha_publicacion: pub.fecha_publicacion,
        categoria: pub.categoria,
        autor_id: pub.autor_id ? userMap.get(pub.autor_id) : undefined,
        lugar: pub.lugar ?? undefined,
        organizador: pub.organizador ?? undefined,
      })
      publicacionMap.set(pub.id, Number(record.id) || pub.id)
      totalCreated++
      logOk(`${pub.titulo} (id: ${pub.id} → ${record.id})`)
    } catch (e: any) {
      logFail(`Failed to create publicacion ${pub.titulo}: ${e.message}`)
    }
  }

  console.log(`  📊 Publicaciones migrated: ${publicacionMap.size}`)
}

// -----------------------------------------------------------------------
// Step 5 — Migrate comentarios_beneficios
// -----------------------------------------------------------------------

async function migrateComentariosBeneficios() {
  console.log("\n💬 Migrating comentarios_beneficios…")

  const { data: comentarios, error } = await supabase.from("comentarios_beneficios").select("*")
  if (error) {
    logFail(`Cannot fetch comentarios_beneficios: ${error.message}`)
    return
  }
  if (!comentarios || comentarios.length === 0) {
    logSkip("No comentarios_beneficios to migrate")
    return
  }

  for (const c of comentarios) {
    const newUserId = userMap.get(c.usuario)
    if (!newUserId) {
      logSkip(`Skipping comentario ${c.id}: usuario ${c.usuario} not mapped`)
      continue
    }

    try {
      await pb.collection("comentarios_beneficios").create({
        contenido: c.contenido,
        beneficio: String(c.beneficio),
        usuario: newUserId,
        estado: c.estado,
        fecha_creacion: c.fecha_creacion,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create comentario_beneficio ${c.id}: ${e.message}`)
    }
  }

  console.log(`  ✅ comentarios_beneficios migrated`)
}

// -----------------------------------------------------------------------
// Step 6 — Migrate comentarios_publicaciones
// -----------------------------------------------------------------------

async function migrateComentariosPublicaciones() {
  console.log("\n💬 Migrating comentarios_publicaciones…")

  const { data: comentarios, error } = await supabase.from("comentarios_publicaciones").select("*")
  if (error) {
    logFail(`Cannot fetch comentarios_publicaciones: ${error.message}`)
    return
  }
  if (!comentarios || comentarios.length === 0) {
    logSkip("No comentarios_publicaciones to migrate")
    return
  }

  for (const c of comentarios) {
    const newUserId = userMap.get(c.usuario)
    if (!newUserId) {
      logSkip(`Skipping comentario ${c.id}: usuario ${c.usuario} not mapped`)
      continue
    }

    try {
      await pb.collection("comentarios_publicaciones").create({
        contenido: c.contenido,
        publicacion: String(c.publicacion),
        usuario: newUserId,
        estado: c.estado,
        fecha_creacion: c.fecha_creacion,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create comentario_publicacion ${c.id}: ${e.message}`)
    }
  }

  console.log(`  ✅ comentarios_publicaciones migrated`)
}

// -----------------------------------------------------------------------
// Step 7 — Migrate sugerencias
// -----------------------------------------------------------------------

async function migrateSugerencias() {
  console.log("\n💡 Migrating sugerencias…")

  const { data: sugerencias, error } = await supabase.from("sugerencias").select("*")
  if (error) {
    logFail(`Cannot fetch sugerencias: ${error.message}`)
    return
  }
  if (!sugerencias || sugerencias.length === 0) {
    logSkip("No sugerencias to migrate")
    return
  }

  for (const s of sugerencias) {
    try {
      await pb.collection("sugerencias").create({
        contenido: s.contenido,
        fecha_creacion: s.fecha_creacion,
        leido: s.leido,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create sugerencia ${s.id}: ${e.message}`)
    }
  }

  console.log(`  ✅ sugerencias migrated`)
}

// -----------------------------------------------------------------------
// Step 8 — Migrate asistencias_evento
// -----------------------------------------------------------------------

async function migrateAsistenciasEvento() {
  console.log("\n📋 Migrating asistencias_evento…")

  const { data: asistencias, error } = await supabase.from("asistencias_evento").select("*")
  if (error) {
    logFail(`Cannot fetch asistencias_evento: ${error.message}`)
    return
  }
  if (!asistencias || asistencias.length === 0) {
    logSkip("No asistencias_evento to migrate")
    return
  }

  for (const a of asistencias) {
    const newUserId = userMap.get(a.usuario)
    if (!newUserId) {
      logSkip(`Skipping asistencia ${a.created_at}: usuario ${a.usuario} not mapped`)
      continue
    }

    try {
      await pb.collection("asistencias_evento").create({
        publicacion: String(a.publicacion),
        usuario: newUserId,
        confirmado: a.confirmado,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create asistencia_evento: ${e.message}`)
    }
  }

  console.log(`  ✅ asistencias_evento migrated`)
}

// -----------------------------------------------------------------------
// Step 9 — Migrate usos_beneficio
// -----------------------------------------------------------------------

async function migrateUsosBeneficio() {
  console.log("\n📊 Migrating usos_beneficio…")

  const { data: usos, error } = await supabase.from("usos_beneficio").select("*")
  if (error) {
    logFail(`Cannot fetch usos_beneficio: ${error.message}`)
    return
  }
  if (!usos || usos.length === 0) {
    logSkip("No usos_beneficio to migrate")
    return
  }

  for (const u of usos) {
    const newUserId = userMap.get(u.usuario)
    if (!newUserId) {
      logSkip(`Skipping uso ${u.id}: usuario ${u.usuario} not mapped`)
      continue
    }

    try {
      await pb.collection("usos_beneficio").create({
        beneficio: String(u.beneficio),
        usuario: newUserId,
        fecha_uso: u.fecha_uso,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create uso_beneficio ${u.id}: ${e.message}`)
    }
  }

  console.log(`  ✅ usos_beneficio migrated`)
}

// -----------------------------------------------------------------------
// Step 10 — Migrate notificaciones
// -----------------------------------------------------------------------

async function migrateNotificaciones() {
  console.log("\n🔔 Migrating notificaciones…")

  const { data: notificaciones, error } = await supabase.from("notificaciones").select("*")
  if (error) {
    logFail(`Cannot fetch notificaciones: ${error.message}`)
    return
  }
  if (!notificaciones || notificaciones.length === 0) {
    logSkip("No notificaciones to migrate")
    return
  }

  for (const n of notificaciones) {
    const newUserId = userMap.get(n.usuario)
    if (!newUserId) {
      logSkip(`Skipping notificacion ${n.id}: usuario ${n.usuario} not mapped`)
      continue
    }

    const newCreadoPor = n.creado_por ? userMap.get(n.creado_por) : undefined

    try {
      await pb.collection("notificaciones").create({
        usuario: newUserId,
        creado_por: newCreadoPor,
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        icono: n.icono ?? undefined,
        color: n.color ?? undefined,
        action_url: n.action_url ?? undefined,
        action_text: n.action_text ?? undefined,
        prioridad: n.prioridad,
        estado: n.estado,
        leido_en: n.leido_en ?? undefined,
        metadata: n.metadata ?? undefined,
      })
      totalCreated++
    } catch (e: any) {
      logFail(`Failed to create notificacion ${n.id}: ${e.message}`)
    }
  }

  console.log(`  ✅ notificaciones migrated`)
}

// -----------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------

function printSummary() {
  console.log("\n" + "=".repeat(50))
  console.log("📋 MIGRATION SUMMARY")
  console.log("=".repeat(50))
  console.log(`  Records created: ${totalCreated}`)
  console.log(`  Errors:          ${totalErrors}`)
  console.log(`  Users mapped:    ${userMap.size}`)
  console.log(`  Beneficios:      ${beneficioMap.size}`)
  console.log(`  Publicaciones:   ${publicacionMap.size}`)
  console.log("=".repeat(50))

  if (userMap.size > 0) {
    console.log("\n📄 User ID Mapping (UUID → PB ID):")
    for (const [oldId, newId] of userMap) {
      console.log(`  ${oldId} → ${newId}`)
    }
  }
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function main() {
  console.log("🚀 Supabase → PocketBase Migration")
  console.log(`   Source: ${SUPABASE_URL}`)
  console.log(`   Target: ${PB_URL}`)
  console.log("-".repeat(50))

  await authAdmin()
  await migrateUsers()
  await migrateBeneficios()
  await migratePublicaciones()

  // Dependent tables (need FK maps populated)
  await migrateComentariosBeneficios()
  await migrateComentariosPublicaciones()
  await migrateSugerencias()
  await migrateAsistenciasEvento()
  await migrateUsosBeneficio()
  await migrateNotificaciones()

  printSummary()

  if (totalErrors > 0) {
    console.log(`\n⚠️  Migration completed with ${totalErrors} errors.`)
    process.exit(1)
  } else {
    console.log("\n🎉 Migration completed successfully!")
  }
}

main().catch((err) => {
  console.error("💥 Fatal migration error:", err)
  process.exit(1)
})
