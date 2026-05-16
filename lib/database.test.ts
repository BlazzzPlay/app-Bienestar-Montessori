import { describe, it, expect, vi, beforeEach } from "vitest"
import { database } from "./database"

// Mock pocketbase module used by database.ts via createBrowserClient()
const mockGetOne = vi.fn()
const mockGetFullList = vi.fn()
const mockGetList = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

const mockPbInstance = {
  collection: vi.fn(() => ({
    getOne: mockGetOne,
    getFullList: mockGetFullList,
    getList: mockGetList,
    getFirstListItem: mockGetFirstListItem,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
}

vi.mock("./pocketbase", () => ({
  createBrowserClient: vi.fn(() => mockPbInstance),
}))

describe("database", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getProfile", () => {
    it("returns profile data from users collection", async () => {
      const profile = { id: "u1", nombre_completo: "Test", email: "test@test.cl" }
      mockGetOne.mockResolvedValue(profile)

      const { data, error } = await database.getProfile("u1")
      expect(data).toEqual(profile)
      expect(error).toBeNull()
      expect(mockPbInstance.collection).toHaveBeenCalledWith("users")
      expect(mockGetOne).toHaveBeenCalledWith("u1")
    })
  })

  describe("getAllProfiles", () => {
    it("returns ordered profiles from users collection", async () => {
      const profiles = [
        { id: "u1", nombre_completo: "A" },
        { id: "u2", nombre_completo: "B" },
      ]
      mockGetFullList.mockResolvedValue(profiles)

      const { data, error } = await database.getAllProfiles()
      expect(data).toEqual(profiles)
      expect(error).toBeNull()
      expect(mockGetFullList).toHaveBeenCalledWith({ sort: "orden_directorio,nombre_completo" })
    })
  })

  describe("getBeneficios", () => {
    it("returns beneficios ordered by created desc", async () => {
      const beneficios = [{ id: "1", nombre_empresa: "Test", contador_usos: 0 }]
      mockGetFullList.mockResolvedValue(beneficios)

      const { data, error } = await database.getBeneficios()
      expect(data).toEqual(beneficios)
      expect(error).toBeNull()
      expect(mockGetFullList).toHaveBeenCalledWith({ sort: "-id" })
    })
  })

  describe("createBeneficio", () => {
    it("creates beneficio with contador_usos=0", async () => {
      const input = {
        nombre_empresa: "Test",
        descripcion_corta: "Desc",
        contador_usos: 0,
        etiquetas: [],
      }
      const created = { id: "1", ...input }
      mockCreate.mockResolvedValue(created)

      const { data, error } = await database.createBeneficio(input as any)
      expect(data).toEqual(created)
      expect(error).toBeNull()
      expect(mockCreate).toHaveBeenCalledWith({ ...input, contador_usos: 0 })
    })
  })

  describe("getUsoBeneficio", () => {
    it("returns uso row when found", async () => {
      const uso = { id: "1", beneficio: "1", usuario: "u1", fecha_uso: "2024-01-01" }
      mockGetFirstListItem.mockResolvedValue(uso)

      const { data, error } = await database.getUsoBeneficio("1", "u1")
      expect(data).toEqual(uso)
      expect(error).toBeNull()
    })

    it("returns null when no uso found", async () => {
      mockGetFirstListItem.mockRejectedValue(new Error("Not found"))

      const { data, error } = await database.getUsoBeneficio("1", "u1")
      expect(data).toBeNull()
      expect(error).toBeDefined()
    })
  })

  describe("registrarUsoBeneficio", () => {
    it("creates uso, increments counter, and returns beneficio", async () => {
      const beneficio = { id: "1", contador_usos: 5 }
      mockCreate.mockResolvedValue({ id: "new-uso" })
      mockUpdate.mockResolvedValue(beneficio)
      mockGetOne.mockResolvedValue(beneficio)

      const { data, error } = await database.registrarUsoBeneficio("1", "u1")
      expect(data).toEqual(beneficio)
      expect(error).toBeNull()
      expect(mockCreate).toHaveBeenCalledWith({
        beneficio: "1",
        usuario: "u1",
      })
      expect(mockUpdate).toHaveBeenCalledWith("1", { "contador_usos+": 1 })
    })
  })

  describe("getPublicaciones", () => {
    it("filters by categoria when provided", async () => {
      mockGetFullList.mockResolvedValue([])
      await database.getPublicaciones("Evento")
      expect(mockGetFullList).toHaveBeenCalledWith({
        sort: "-fecha_publicacion",
        filter: 'categoria="Evento"',
      })
    })

    it("returns all when no categoria", async () => {
      mockGetFullList.mockResolvedValue([])
      await database.getPublicaciones()
      expect(mockGetFullList).toHaveBeenCalledWith({
        sort: "-fecha_publicacion",
        filter: "",
      })
    })
  })

  describe("confirmarAsistenciaEvento", () => {
    it("creates new record when user has no prior attendance", async () => {
      mockGetFirstListItem.mockRejectedValue(new Error("not found"))
      mockCreate.mockResolvedValue({ id: "1" })
      const { data, error } = await database.confirmarAsistenciaEvento("1", "u1")
      expect(data).toBe(true)
      expect(error).toBeNull()
      expect(mockCreate).toHaveBeenCalledWith({
        publicacion: "1",
        usuario: "u1",
        confirmado: true,
      })
    })

    it("updates existing record when user already has attendance", async () => {
      mockGetFirstListItem.mockResolvedValue({ id: "existing-1" })
      mockUpdate.mockResolvedValue({})
      const { data, error } = await database.confirmarAsistenciaEvento("1", "u1")
      expect(data).toBe(true)
      expect(error).toBeNull()
      expect(mockUpdate).toHaveBeenCalledWith("existing-1", { confirmado: true })
    })

    it("returns error when both find and create fail", async () => {
      mockGetFirstListItem.mockRejectedValue(new Error("not found"))
      mockCreate.mockRejectedValue(new Error("network error"))
      const { data, error } = await database.confirmarAsistenciaEvento("1", "u1")
      expect(data).toBeNull()
      expect(error?.message).toBe("network error")
    })
  })

  describe("getComentariosBeneficio", () => {
    it("uses expand and normalizes perfiles from expand.usuario", async () => {
      const items = [
        {
          id: "1",
          contenido: "Great!",
          usuario: "u1",
          estado: "aprobado",
          fecha_creacion: "2024-01-01",
          expand: {
            usuario: { nombre_completo: "Juan", avatar: "avatar.jpg" },
          },
        },
      ]
      mockGetFullList.mockResolvedValue(items)

      const { data, error } = await database.getComentariosBeneficio("1")
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data![0].perfiles?.nombre_completo).toBe("Juan")
      expect(data![0].perfiles?.avatar_url).toBe("avatar.jpg")
      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'beneficio="1" && estado="aprobado"',
        expand: "usuario",
        sort: "-fecha_creacion",
      })
    })

    it("includes pending comments when incluirPendientes=true", async () => {
      mockGetFullList.mockResolvedValue([])
      await database.getComentariosBeneficio("1", true)
      expect(mockGetFullList).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'beneficio="1"' }),
      )
    })
  })

  describe("createSugerencia", () => {
    it("creates sugerencia", async () => {
      const sugerencia = { id: "1", contenido: "Test", fecha_creacion: "2024-01-01", leido: false }
      mockCreate.mockResolvedValue(sugerencia)

      const { data, error } = await database.createSugerencia("Test")
      expect(data).toEqual(sugerencia)
      expect(error).toBeNull()
    })
  })

  describe("getNotificaciones", () => {
    it("returns notifications filtered by usuario", async () => {
      const notifs = [
        {
          id: "n1",
          usuario: "u1",
          titulo: "T1",
          mensaje: "M1",
          estado: "no_leida",
          tipo: "sistema",
          prioridad: "normal",
          creado_en: "2024-01-02",
        },
      ]
      mockGetFullList.mockResolvedValue(notifs)

      const { data, error } = await database.getNotificaciones("u1")
      expect(data).toEqual(notifs)
      expect(error).toBeNull()
      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'usuario="u1"',
        sort: "-creado_en",
      })
    })
  })

  describe("marcarNotificacionLeida", () => {
    it("updates estado to leida", async () => {
      const updated = {
        id: "n1",
        usuario: "u1",
        titulo: "T1",
        mensaje: "M1",
        estado: "leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
        leido_en: "2024-01-01T00:00:00Z",
      }
      mockUpdate.mockResolvedValue(updated)

      const { data, error } = await database.marcarNotificacionLeida("n1")
      expect(data).toEqual(updated)
      expect(error).toBeNull()
      expect(mockUpdate).toHaveBeenCalledWith("n1", {
        estado: "leida",
        leido_en: expect.any(String),
      })
    })
  })

  describe("broadcastNotificacion", () => {
    it("fetches users by role and creates notifications for each", async () => {
      const users = [
        { id: "u1", email: "a@test.cl" },
        { id: "u2", email: "b@test.cl" },
      ]
      mockGetFullList.mockResolvedValue(users)
      mockCreate.mockResolvedValue({})

      const { error } = await database.broadcastNotificacion(
        "Titulo",
        "Mensaje",
        "sistema",
        "Administrador",
        "alta",
      )
      expect(error).toBeNull()
      expect(mockGetFullList).toHaveBeenCalledWith({ filter: 'rol="Administrador"' })
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it("handles global broadcast (null targetRole)", async () => {
      mockGetFullList.mockResolvedValue([])
      const { error } = await database.broadcastNotificacion("Titulo", "Mensaje", "evento")
      expect(error).toBeNull()
      expect(mockGetFullList).toHaveBeenCalledWith({ filter: "" })
    })
  })

  describe("getEstadisticasUsuario", () => {
    it("returns totalItems count from PB getList", async () => {
      mockGetList.mockResolvedValue({ items: [], totalItems: 5, page: 1, perPage: 1 })

      const { beneficiosUtilizados, error } = await database.getEstadisticasUsuario("u1")
      expect(beneficiosUtilizados).toBe(5)
      expect(error).toBeNull()
    })
  })

  describe("marcarTodasNotificacionesLeidas", () => {
    it("fetches unread and updates each", async () => {
      mockGetFullList.mockResolvedValue([{ id: "n1" }, { id: "n2" }])
      mockUpdate.mockResolvedValue({})

      const { error } = await database.marcarTodasNotificacionesLeidas("u1")
      expect(error).toBeNull()
      expect(mockUpdate).toHaveBeenCalledTimes(2)
      expect(mockUpdate).toHaveBeenCalledWith("n1", {
        estado: "leida",
        leido_en: expect.any(String),
      })
    })
  })

  describe("limpiarNotificaciones", () => {
    it("fetches all and deletes each", async () => {
      mockGetFullList.mockResolvedValue([{ id: "n1" }, { id: "n2" }])
      mockDelete.mockResolvedValue(true)

      const { error } = await database.limpiarNotificaciones("u1")
      expect(error).toBeNull()
      expect(mockDelete).toHaveBeenCalledTimes(2)
    })
  })
})
