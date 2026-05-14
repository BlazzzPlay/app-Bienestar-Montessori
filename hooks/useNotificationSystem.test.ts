import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

const mockGetNotificaciones = vi.hoisted(() => vi.fn())
const mockMarcarNotificacionLeida = vi.hoisted(() => vi.fn())
const mockArchivarNotificacion = vi.hoisted(() => vi.fn())
const mockEliminarNotificacion = vi.hoisted(() => vi.fn())
const mockMarcarTodasNotificacionesLeidas = vi.hoisted(() => vi.fn())
const mockLimpiarNotificaciones = vi.hoisted(() => vi.fn())

vi.mock("@/lib/database", () => ({
  database: {
    getNotificaciones: mockGetNotificaciones,
    marcarNotificacionLeida: mockMarcarNotificacionLeida,
    archivarNotificacion: mockArchivarNotificacion,
    eliminarNotificacion: mockEliminarNotificacion,
    marcarTodasNotificacionesLeidas: mockMarcarTodasNotificacionesLeidas,
    limpiarNotificaciones: mockLimpiarNotificaciones,
  },
}))

// PocketBase realtime mock
let mockSubscribeCallback: ((e: any) => void) | null = null
const mockUnsubscribe = vi.fn()
const mockSubscribe = vi.fn()

vi.mock("@/lib/pocketbase", () => ({
  createBrowserClient: vi.fn(() => ({
    collection: vi.fn(() => ({
      subscribe: mockSubscribe,
    })),
  })),
}))

const mockAuthUser = vi.hoisted(() => ({ id: "user-1" }))

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}))

const mockToast = vi.hoisted(() => vi.fn())

vi.mock("sonner", () => ({
  toast: mockToast,
}))

import { useNotificationSystem } from "@/hooks/useNotificationSystem"

describe("useNotificationSystem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockSubscribeCallback = null
    // Default: subscribe resolves successfully
    mockSubscribe.mockImplementation((_event: string, callback: (e: any) => void) => {
      mockSubscribeCallback = callback
      return Promise.resolve(mockUnsubscribe)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns loading initially and then loads notifications", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })

    const { result } = renderHook(() => useNotificationSystem())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.unreadCount).toBe(1)
    expect(mockGetNotificaciones).toHaveBeenCalledWith("user-1")
  })

  it("returns empty state when no user", async () => {
    const originalUser = mockAuthUser.id
    mockAuthUser.id = ""
    const { result } = renderHook(() => useNotificationSystem())

    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.loading).toBe(false)
    mockAuthUser.id = originalUser
  })

  it("handles realtime INSERT event and shows toast", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })

    const { result } = renderHook(() => useNotificationSystem())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.unreadCount).toBe(1)

    // PB subscribe callback should have been registered
    expect(mockSubscribeCallback).toBeDefined()
    expect(mockSubscribe).toHaveBeenCalledWith("*", expect.any(Function))

    act(() => {
      mockSubscribeCallback!({
        action: "create",
        record: {
          id: "n2",
          usuario_id: "user-1",
          titulo: "Nueva",
          mensaje: "Mensaje nuevo",
          estado: "no_leida",
          tipo: "evento",
          prioridad: "alta",
          creado_en: "2024-01-02",
        },
      })
    })

    expect(result.current.notifications).toHaveLength(2)
    expect(result.current.unreadCount).toBe(2)
    expect(mockToast).toHaveBeenCalledWith("Nueva", { description: "Mensaje nuevo" })
  })

  it("ignores realtime events for other users", async () => {
    mockGetNotificaciones.mockResolvedValue({ data: [], error: null })

    const { result } = renderHook(() => useNotificationSystem())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      mockSubscribeCallback!({
        action: "create",
        record: {
          id: "n-other",
          usuario_id: "other-user",
          titulo: "Not mine",
          mensaje: "Should be ignored",
          estado: "no_leida",
          tipo: "sistema",
          prioridad: "normal",
          creado_en: "2024-01-02",
        },
      })
    })

    expect(result.current.notifications).toHaveLength(0)
  })

  it("marks a notification as read", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })
    mockMarcarNotificacionLeida.mockResolvedValue({
      data: { ...notifs[0], estado: "leida" },
      error: null,
    })

    const { result } = renderHook(() => useNotificationSystem())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAsRead("n1")
    })

    expect(mockMarcarNotificacionLeida).toHaveBeenCalledWith("n1")
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications[0].status).toBe("read")
  })

  it("dismisses a notification", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })
    mockArchivarNotificacion.mockResolvedValue({
      data: { ...notifs[0], estado: "archivada" },
      error: null,
    })

    const { result } = renderHook(() => useNotificationSystem())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.dismissNotification("n1")
    })

    expect(mockArchivarNotificacion).toHaveBeenCalledWith("n1")
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications[0].status).toBe("dismissed")
  })

  it("removes a notification", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })
    mockEliminarNotificacion.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useNotificationSystem())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.removeNotification("n1")
    })

    expect(mockEliminarNotificacion).toHaveBeenCalledWith("n1")
    expect(result.current.notifications).toHaveLength(0)
    expect(result.current.unreadCount).toBe(0)
  })

  it("marks all as read", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
      {
        id: "n2",
        usuario_id: "user-1",
        titulo: "T2",
        mensaje: "M2",
        estado: "no_leida",
        tipo: "evento",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })
    mockMarcarTodasNotificacionesLeidas.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useNotificationSystem())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.unreadCount).toBe(2)

    await act(async () => {
      await result.current.markAllAsRead()
    })

    expect(mockMarcarTodasNotificacionesLeidas).toHaveBeenCalledWith("user-1")
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications.every((n) => n.status === "read")).toBe(true)
  })

  it("clears all notifications", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })
    mockLimpiarNotificaciones.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useNotificationSystem())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.clearAll()
    })

    expect(mockLimpiarNotificaciones).toHaveBeenCalledWith("user-1")
    expect(result.current.notifications).toHaveLength(0)
    expect(result.current.unreadCount).toBe(0)
  })

  it("falls back to polling when realtime subscribe fails", async () => {
    const notifs = [
      {
        id: "n1",
        usuario_id: "user-1",
        titulo: "T1",
        mensaje: "M1",
        estado: "no_leida",
        tipo: "sistema",
        prioridad: "normal",
        creado_en: "2024-01-01",
      },
    ]
    mockGetNotificaciones.mockResolvedValue({ data: notifs, error: null })

    // Simulate subscribe failure
    mockSubscribe.mockRejectedValue(new Error("Realtime unavailable"))

    renderHook(() => useNotificationSystem())
    await waitFor(() => expect(mockGetNotificaciones).toHaveBeenCalledTimes(1))

    // Advance past fallback timer and polling interval
    act(() => {
      vi.advanceTimersByTime(40000)
    })

    await waitFor(() => expect(mockGetNotificaciones).toHaveBeenCalledTimes(2))
  })

  it("unsubscribes on cleanup", async () => {
    mockGetNotificaciones.mockResolvedValue({ data: [], error: null })

    const { unmount } = renderHook(() => useNotificationSystem())

    // Wait for effect to register subscribe and resolve the promise
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith("*", expect.any(Function))
    })

    // Give microtasks time to resolve so unsubscribeRef is set
    await act(async () => {})

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
