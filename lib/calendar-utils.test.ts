import { describe, it, expect } from "vitest"
import { generateGoogleCalendarUrl } from "./calendar-utils"
import type { Publicacion } from "./pocketbase"

function makeEvent(overrides: Partial<Publicacion> = {}): Publicacion {
  return {
    id: "1",
    titulo: "Evento Test",
    descripcion: "Una descripción",
    fecha_publicacion: "2024-06-15T14:30:00Z",
    categoria: "Evento",
    lugar: "Santiago",
    organizador: "Bienestar",
    created: "2024-01-01T00:00:00Z",
    updated: "2024-01-01T00:00:00Z",
    collectionId: "test",
    collectionName: "publicaciones",
    ...overrides,
  }
}

describe("generateGoogleCalendarUrl", () => {
  it("includes title, description, location and dates", () => {
    const url = generateGoogleCalendarUrl(makeEvent())
    expect(url).toContain("text=Evento%20Test")
    expect(url).toContain("details=Una%20descripci%C3%B3n")
    expect(url).toContain("location=Santiago")
    expect(url).toContain("dates=20240615T143000Z%2F20240615T153000Z")
  })

  it("omits dates when fecha_publicacion is missing", () => {
    const url = generateGoogleCalendarUrl(makeEvent({ fecha_publicacion: "" }))
    expect(url).not.toContain("dates=")
  })

  it("formats dates in UTC", () => {
    const url = generateGoogleCalendarUrl(
      makeEvent({ fecha_publicacion: "2024-01-01T00:00:00-03:00" }),
    )
    expect(url).toContain("dates=20240101T030000Z")
  })

  it("omits details when description is empty", () => {
    const url = generateGoogleCalendarUrl(makeEvent({ descripcion: "" }))
    expect(url).not.toContain("details=")
  })

  it("omits location when lugar is missing", () => {
    const url = generateGoogleCalendarUrl(makeEvent({ lugar: undefined }))
    expect(url).not.toContain("location=")
  })
})
