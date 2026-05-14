import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { exportProfilesToCSV } from "./csv-export"
import type { Perfil } from "./pocketbase"

describe("exportProfilesToCSV", () => {
  let clickMock: ReturnType<typeof vi.fn>
  let revokeMock: ReturnType<typeof vi.fn>
  let originalCreateElement: typeof document.createElement

  beforeEach(() => {
    clickMock = vi.fn()
    revokeMock = vi.fn()
    originalCreateElement = document.createElement.bind(document)

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName)
      if (tagName === "a") {
        el.click = clickMock as any
      }
      return el
    })

    global.URL.createObjectURL = vi.fn(() => "blob:test")
    global.URL.revokeObjectURL = revokeMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does nothing when profiles array is empty", () => {
    exportProfilesToCSV([])
    expect(clickMock).not.toHaveBeenCalled()
  })

  it("generates CSV with public fields only", () => {
    const profiles: Perfil[] = [
      {
        id: "1",
        nombre_completo: "Juan Pérez",
        email: "juan@test.com",
        rut: "12345678-9",
        telefono: "+56912345678",
        cargo: "Profesor",
        fecha_ingreso: "2020-03-15",
        es_bienestar: true,
        rol: "Beneficiario",
        collectionId: "test",
        collectionName: "users",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
    ]

    exportProfilesToCSV(profiles)

    expect(clickMock).toHaveBeenCalled()

    // Verify blob creation
    const blobCalls = (global.URL.createObjectURL as any).mock.calls
    expect(blobCalls.length).toBeGreaterThan(0)
    const blob = blobCalls[0][0] as Blob
    expect(blob.type).toBe("text/csv;charset=utf-8;")
  })

  it("escapes commas and quotes correctly", () => {
    const profiles: Perfil[] = [
      {
        id: "2",
        nombre_completo: 'Pérez, Juan "El Profe"',
        email: "juan@test.com",
        rut: "12345678-9",
        telefono: "+56912345678",
        cargo: "Profesor",
        fecha_ingreso: "2020-03-15",
        es_bienestar: false,
        rol: "Beneficiario",
        collectionId: "test",
        collectionName: "users",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
    ]

    exportProfilesToCSV(profiles)
    expect(clickMock).toHaveBeenCalled()
  })
})
