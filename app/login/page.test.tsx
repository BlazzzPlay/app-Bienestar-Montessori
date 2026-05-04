import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginPage from "./page"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

const mockSignIn = vi.fn()
const mockVerifyOtp = vi.fn()

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    verifyOtp: mockVerifyOtp,
    isAuthenticated: false,
  }),
}))

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockClear()
    mockSignIn.mockReset()
    mockVerifyOtp.mockReset()
  })

  it("renders email step initially", () => {
    render(<LoginPage />)
    expect(screen.getByText("Bienestar Montessori")).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo Institucional/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Enviar código de acceso/i })).toBeInTheDocument()
  })

  it("shows error for invalid email domain", async () => {
    render(<LoginPage />)
    const emailInput = screen.getByLabelText(/Correo Institucional/i)
    const submitBtn = screen.getByRole("button", { name: /Enviar código de acceso/i })

    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Debes usar tu correo institucional/)).toBeInTheDocument()
    })
  })

  it("transitions to OTP step after sending code", async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null })
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/Correo Institucional/i)
    const submitBtn = screen.getByRole("button", { name: /Enviar código de acceso/i })

    fireEvent.change(emailInput, { target: { value: "test@colegiomontessori.cl" } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByLabelText(/Código de verificación/i)).toBeInTheDocument()
    })
  })

  it("calls verifyOtp and redirects on success", async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null })
    mockVerifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null })
    render(<LoginPage />)

    // Step 1: email
    fireEvent.change(screen.getByLabelText(/Correo Institucional/i), {
      target: { value: "test@colegiomontessori.cl" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Enviar código de acceso/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Código de verificación/i)).toBeInTheDocument()
    })

    // Step 2: OTP
    const otpInput = screen.getByTestId("otp-input")
    fireEvent.change(otpInput, { target: { value: "123456" } })

    const verifyBtn = screen.getByRole("button", { name: /Verificar e ingresar/i })
    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith("test@colegiomontessori.cl", "123456")
      expect(push).toHaveBeenCalledWith("/perfil")
    })
  })
})
