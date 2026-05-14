import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginPage from "./page"

const mockSignIn = vi.fn()
const mockPush = vi.fn()

vi.mock("@/lib/pocketbase-auth", () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the login page with email and password fields", () => {
    render(<LoginPage />)
    expect(screen.getByText("Bienestar Montessori")).toBeDefined()
    expect(screen.getByText("Portal de beneficios para funcionarios")).toBeDefined()
    expect(screen.getByLabelText("Correo institucional")).toBeDefined()
    expect(screen.getByLabelText("Contraseña")).toBeDefined()
    expect(screen.getByText("Iniciar sesión")).toBeDefined()
  })

  it("shows error when submitting empty form", async () => {
    render(<LoginPage />)
    const submitButton = screen.getByText("Iniciar sesión")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Email y contraseña son obligatorios")).toBeDefined()
    })
  })

  it("shows error for non-institutional email", async () => {
    render(<LoginPage />)
    const emailInput = screen.getByLabelText("Correo institucional")
    const passwordInput = screen.getByLabelText("Contraseña")

    fireEvent.change(emailInput, { target: { value: "user@gmail.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByText("Iniciar sesión")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("Debes usar tu correo institucional (@colegiomontessori.cl)"),
      ).toBeDefined()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it("calls signIn with email and password for valid credentials", async () => {
    mockSignIn.mockResolvedValue({ data: { record: { id: "u1" }, token: "jwt" }, error: null })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText("Correo institucional")
    const passwordInput = screen.getByLabelText("Contraseña")

    fireEvent.change(emailInput, { target: { value: "user@colegiomontessori.cl" } })
    fireEvent.change(passwordInput, { target: { value: "correct-password" } })

    const submitButton = screen.getByText("Iniciar sesión")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("user@colegiomontessori.cl", "correct-password")
    })
  })

  it("shows error message on failed sign in", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: "Credenciales inválidas" },
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText("Correo institucional")
    const passwordInput = screen.getByLabelText("Contraseña")

    fireEvent.change(emailInput, { target: { value: "user@colegiomontessori.cl" } })
    fireEvent.change(passwordInput, { target: { value: "wrong-password" } })

    const submitButton = screen.getByText("Iniciar sesión")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeDefined()
    })
  })

  it("does not render Google sign-in or provider text", () => {
    render(<LoginPage />)
    expect(screen.queryByText("Accede con tu cuenta institucional de Google")).toBeNull()
  })
})
