import type { Perfil } from "./supabase"

const PUBLIC_FIELDS: (keyof Perfil)[] = [
  "nombre_completo",
  "correo",
  "telefono",
  "cargo",
  "fecha_ingreso",
  "es_bienestar",
]

const HEADERS: Record<string, string> = {
  nombre_completo: "Nombre",
  correo: "Correo",
  telefono: "Teléfono",
  cargo: "Cargo",
  fecha_ingreso: "Años en colegio",
  es_bienestar: "En Bienestar",
}

function escapeCsv(value: unknown): string {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportProfilesToCSV(profiles: Perfil[]): void {
  if (!profiles.length) {
    return
  }

  const headerRow = PUBLIC_FIELDS.map((f) => HEADERS[f] || f).join(",")
  const rows = profiles.map((profile) =>
    PUBLIC_FIELDS.map((field) => {
      const value = profile[field]
      if (field === "es_bienestar") {
        return escapeCsv(value ? "Sí" : "No")
      }
      return escapeCsv(value)
    }).join(","),
  )

  const csv = [headerRow, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `usuarios-bienestar-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
