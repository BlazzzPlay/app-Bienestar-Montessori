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

  describe("getUsoBeneficio", () => {
    it("returns uso row when found", async () => {
      const uso = { id: 1, beneficio_id: 1, usuario_id: "u1", fecha_uso: "2024-01-01" }
      mockFrom.mockReturnValue(createChain({ data: uso, error: null }))

      const { data, error } = await database.getUsoBeneficio(1, "u1")
      expect(data).toEqual(uso)
      expect(error).toBeNull()
    })

    it("returns null when no uso found", async () => {
      mockFrom.mockReturnValue(createChain({ data: null, error: { message: "No rows found" } }))

      const { data, error } = await database.getUsoBeneficio(1, "u1")
      expect(data).toBeNull()
      expect(error).toBeDefined()
    })
  })

  describe("registrarUsoBeneficio", () => {
    it("calls RPC with usuarioId and returns updated beneficio", async () => {
      const beneficio = { id: 1, contador_usos: 5 }
      mockRpc.mockResolvedValue({ data: null, error: null })
      const chain = createChain({ data: beneficio, error: null })
      mockFrom.mockReturnValue(chain)

      const { data, error } = await database.registrarUsoBeneficio(1, "u1")
      expect(data).toEqual(beneficio)
      expect(error).toBeNull()
      expect(mockRpc).toHaveBeenCalledWith("incrementar_uso_beneficio", {
        p_id: 1,
        p_usuario_id: "u1",
      })
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

  describe("getNotificaciones", () => {
    it("returns notifications ordered by creado_en desc", async () => {
      const notifs = [
        {
          id: "n1",
          usuario_id: "u1",
          titulo: "T1",
          mensaje: "M1",
          estado: "no_leida",
          tipo: "sistema",
          prioridad: "normal",
          creado_en: "2024-01-02",
          updated_at: "2024-01-02",
        },
        {
          id: "n2",
          usuario_id: "u1",
          titulo: "T2",
          mensaje: "M2",
          estado: "leida",
          tipo: "evento",
          prioridad: "alta",
          creado_en: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ]
      mockFrom.mockReturnValue(createChain({ data: notifs, error: null }))

      const { data, error } = await database.getNotificaciones("u1")
      expect(data).toEqual(notifs)
      expect(error).toBeNull()
    })
  })

  describe("marcarNotificacionLeida", () => {
    it("updates estado to leida", async () => {
      const updated = {
        id: "n1",
        usuario_id: "u1",
        titulo: "T1",
        mensaje: "M1",
        estado: "leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
        updated_at: "2024-01-01",
        leido_en: "2024-01-01T00:00:00Z",
      }
      const chain = createChain({ data: updated, error: null })
      mockFrom.mockReturnValue(chain)

      const { data, error } = await database.marcarNotificacionLeida("n1")
      expect(data).toEqual(updated)
      expect(error).toBeNull()
    })
  })

  describe("broadcastNotificacion", () => {
    it("calls enviar_notificacion_broadcast RPC", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })

      const { error } = await database.broadcastNotificacion(
        "Titulo",
        "Mensaje",
        "sistema",
        "Administrador",
        "alta",
      )
      expect(error).toBeNull()
      expect(mockRpc).toHaveBeenCalledWith("enviar_notificacion_broadcast", {
        p_titulo: "Titulo",
        p_mensaje: "Mensaje",
        p_tipo: "sistema",
        p_target_role: "Administrador",
        p_prioridad: "alta",
        p_icono: null,
        p_color: null,
        p_action_url: null,
        p_action_text: null,
        p_metadata: null,
      })
    })

    it("calls RPC with null target_role for global broadcast", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })

      const { error } = await database.broadcastNotificacion("Titulo", "Mensaje", "evento")
      expect(error).toBeNull()
      expect(mockRpc).toHaveBeenCalledWith(
        "enviar_notificacion_broadcast",
        expect.objectContaining({
          p_target_role: null,
        }),
      )
    })
  })
})
