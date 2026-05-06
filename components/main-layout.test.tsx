import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import MainLayout from "./main-layout"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/perfil",
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}))

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    profile: { nombre_completo: "Juan Pérez", rol: "Administrador" },
    hasFullAccess: () => true,
    isInDevelopment: false,
  }),
}))

vi.mock("@/hooks/useNotificationSystem", () => ({
  useNotificationSystem: () => ({ unreadCount: 3 }),
}))

vi.mock("@/components/notifications/notification-center", () => ({
  default: () => <div data-testid="notification-center" />,
}))

describe("MainLayout accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("has main content with id='main-content' and nav with aria-label", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Navegación principal")
  })

  it("renders skip link as first focusable with correct href and text", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    const skipLink = screen.getByRole("link", { name: "Saltar al contenido principal" })
    expect(skipLink).toHaveAttribute("href", "#main-content")
    expect(skipLink).toHaveClass("sr-only")
  })

  it("marks exactly one active tab with aria-current='page' matching route", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    const buttons = screen.getAllByRole("button")
    const currentPageButtons = buttons.filter((btn) => btn.getAttribute("aria-current") === "page")

    expect(currentPageButtons).toHaveLength(1)
    expect(currentPageButtons[0]).toHaveTextContent("Perfil")
  })

  it("has no aria-current on inactive tabs", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    const buttons = screen.getAllByRole("button")
    const inactiveButtons = buttons.filter((btn) => btn.getAttribute("aria-current") !== "page")

    inactiveButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current", "page")
    })
  })

  it("has type='button' on all nav and header buttons", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("type", "button")
    })
  })

  it("has descriptive aria-label on icon-only header buttons", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    expect(screen.getByRole("button", { name: "Cambiar tema" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Notificaciones, 3 sin leer" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument()
  })

  it("has aria-label on header", () => {
    render(
      <MainLayout title="Test">
        <div>Content</div>
      </MainLayout>,
    )

    expect(screen.getByRole("banner")).toHaveAttribute("aria-label", "Barra superior")
  })
})
