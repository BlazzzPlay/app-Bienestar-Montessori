import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

// Mock Supabase client first (before any imports that use it)
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "" } }),
      }),
    },
  },
}))

// Mock database module (hoisted for vi.mock compatibility)
const { mockGetBeneficios, mockGetPublicaciones, mockGetAllProfiles, mockGetSugerencias } =
  vi.hoisted(() => ({
    mockGetBeneficios: vi.fn(),
    mockGetPublicaciones: vi.fn(),
    mockGetAllProfiles: vi.fn(),
    mockGetSugerencias: vi.fn(),
  }))

vi.mock("@/lib/database", () => ({
  database: {
    getBeneficios: mockGetBeneficios,
    getPublicaciones: mockGetPublicaciones,
    getAllProfiles: mockGetAllProfiles,
    getSugerencias: mockGetSugerencias,
  },
}))

import { useBeneficios } from "@/hooks/useBeneficios"
import { useEventos } from "@/hooks/useEventos"
import { useDirectorio } from "@/hooks/useDirectorio"
import { useAdmin } from "@/hooks/useAdmin"

describe("useBeneficios", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns loading state initially", () => {
    const { result } = renderHook(() => useBeneficios())
    expect(result.current.loading).toBe(true)
  })

  it("fetches beneficios successfully", async () => {
    const mockBeneficios = [
      {
        id: 1,
        nombre_empresa: "Test",
        descripcion_corta: "desc",
        etiquetas: ["tag"],
        contador_usos: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ]
    mockGetBeneficios.mockResolvedValue({ data: mockBeneficios, error: null })

    const { result } = renderHook(() => useBeneficios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockBeneficios)
  })
})

describe("useEventos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches publicaciones successfully", async () => {
    mockGetPublicaciones.mockResolvedValue({ data: [], error: null })

    const { result } = renderHook(() => useEventos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})

describe("useDirectorio", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches profiles successfully", async () => {
    mockGetAllProfiles.mockResolvedValue({ data: [], error: null })

    const { result } = renderHook(() => useDirectorio())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})

describe("useAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches and computes estadisticas", async () => {
    const mockPerfiles = [
      {
        id: "user-1",
        nombre_completo: "Admin",
        correo: "admin@test.cl",
        rut: "1-1",
        es_bienestar: true,
        rol: "Administrador" as const,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "user-2",
        nombre_completo: "Teacher",
        correo: "teacher@test.cl",
        rut: "2-2",
        es_bienestar: false,
        rol: "Visualizador" as const,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ]
    const mockSugerencias = [
      { id: 1, contenido: "test", fecha_creacion: "2024-01-01", leido: false },
      { id: 2, contenido: "test2", fecha_creacion: "2024-01-01", leido: true },
    ]

    mockGetAllProfiles.mockResolvedValue({ data: mockPerfiles, error: null })
    mockGetBeneficios.mockResolvedValue({ data: [], error: null })
    mockGetPublicaciones.mockResolvedValue({ data: [], error: null })
    mockGetSugerencias.mockResolvedValue({ data: mockSugerencias, error: null })

    const { result } = renderHook(() => useAdmin())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.estadisticas.totalUsuarios).toBe(2)
    expect(result.current.estadisticas.usuariosBienestar).toBe(1)
    expect(result.current.estadisticas.sugerenciasNoLeidas).toBe(1)
  })
})
