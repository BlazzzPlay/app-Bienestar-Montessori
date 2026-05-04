import { describe, it, expect, vi, beforeEach } from "vitest"
import { database } from "./database"

const mockFrom = vi.fn()
const mockRpc = vi.fn()

vi.mock("./supabaseClient", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    rpc: (...args: any[]) => mockRpc(...args),
  },
}))

function createChain(result: { data?: any; error?: any }) {
  const chain: any = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    upsert: vi.fn(() => chain),
  }
  chain.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(result).then(onFulfilled, onRejected)
  return chain
}

describe("database", () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockRpc.mockReset()
  })

  describe("getProfile", () => {
    it("returns profile data", async () => {
      const profile = { id: "u1", nombre_completo: "Test" }
      mockFrom.mockReturnValue(createChain({ data: profile, error: null }))

      const { data, error } = await database.getProfile("u1")
      expect(data).toEqual(profile)
      expect(error).toBeNull()
    })
  })

  describe("getAllProfiles", () => {
    it("returns ordered profiles", async () => {
      const profiles = [
        { id: "u1", nombre_completo: "A" },
        { id: "u2", nombre_completo: "B" },
      ]
      mockFrom.mockReturnValue(createChain({ data: profiles, error: null }))

      const { data, error } = await database.getAllProfiles()
      expect(data).toEqual(profiles)
      expect(error).toBeNull()
    })
  })

  describe("getBeneficios", () => {
    it("returns beneficios ordered by created_at desc", async () => {
      const beneficios = [{ id: 1, nombre_empresa: "Test" }]
      mockFrom.mockReturnValue(createChain({ data: beneficios, error: null }))

      const { data, error } = await database.getBeneficios()
      expect(data).toEqual(beneficios)
      expect(error).toBeNull()
    })
  })

  describe("createSugerencia", () => {
    it("inserts sugerencia and returns it", async () => {
      const sugerencia = { id: 1, contenido: "Test", fecha_creacion: "2024-01-01", leido: false }
      const chain = createChain({ data: sugerencia, error: null })
      mockFrom.mockReturnValue(chain)

      const { data, error } = await database.createSugerencia("Test")
      expect(data).toEqual(sugerencia)
      expect(error).toBeNull()
    })
  })

  describe("registrarUsoBeneficio", () => {
    it("calls RPC and returns updated beneficio", async () => {
      const beneficio = { id: 1, contador_usos: 5 }
      mockRpc.mockResolvedValue({ data: null, error: null })
      const chain = createChain({ data: beneficio, error: null })
      mockFrom.mockReturnValue(chain)

      const { data, error } = await database.registrarUsoBeneficio(1, "u1")
      expect(data).toEqual(beneficio)
      expect(error).toBeNull()
      expect(mockRpc).toHaveBeenCalledWith("incrementar_uso_beneficio", { p_id: 1 })
    })
  })

  describe("confirmarAsistenciaEvento", () => {
    it("upserts asistencia and returns true", async () => {
      const chain = createChain({ data: null, error: null })
      chain.upsert = vi.fn(() => Promise.resolve({ data: null, error: null }))
      mockFrom.mockReturnValue(chain)

      const { data, error } = await database.confirmarAsistenciaEvento(1, "u1")
      expect(data).toBe(true)
      expect(error).toBeNull()
    })
  })
})
