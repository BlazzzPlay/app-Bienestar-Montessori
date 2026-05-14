import type { Publicacion } from "./pocketbase"

function toGoogleCalendarUtc(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

function addHours(dateStr: string, hours: number): string {
  const d = new Date(dateStr)
  d.setTime(d.getTime() + hours * 60 * 60 * 1000)
  return d.toISOString()
}

export function generateGoogleCalendarUrl(event: Publicacion): string {
  const query: Record<string, string> = {
    action: "TEMPLATE",
    text: event.titulo,
  }

  if (event.descripcion) {
    query.details = event.descripcion
  }

  if (event.lugar) {
    query.location = event.lugar
  }

  if (event.fecha_publicacion) {
    const start = toGoogleCalendarUtc(event.fecha_publicacion)
    const end = toGoogleCalendarUtc(addHours(event.fecha_publicacion, 1))
    query.dates = `${start}/${end}`
  }

  const qs = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")

  return `https://calendar.google.com/calendar/render?${qs}`
}
