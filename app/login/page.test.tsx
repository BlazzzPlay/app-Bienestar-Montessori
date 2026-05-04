import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import LoginPage from "./page"

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    signInWithGoogle: vi.fn(),
  }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/components/google-signin-button", () => ({
  default: () => <button>Google</button>,
}))

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the login page with Google sign-in", () => {
    render(<LoginPage />)
    expect(screen.getByText("Bienestar Montessori")).toBeDefined()
    expect(screen.getByText("Portal de beneficios para funcionarios")).toBeDefined()
    expect(screen.getByText("Accede con tu cuenta institucional de Google")).toBeDefined()
    expect(screen.getByText("Google")).toBeDefined()
  })
})
