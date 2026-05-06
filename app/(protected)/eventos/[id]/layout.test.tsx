import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/supabaseClient", () => ({
  createServiceClient: vi.fn(),
}))

import { createServiceClient } from "@/lib/supabaseClient"
import { generateMetadata as generateEventMetadata } from "./layout"
import { generateMetadata as generateBenefitMetadata } from "../../beneficios/[id]/layout"

function mockSupabaseSingle(data: unknown) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data })),
        })),
      })),
    })),
  }
}

describe("Dynamic generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("eventos/[id]", () => {
    it("returns metadata for a valid event", async () => {
      vi.mocked(createServiceClient).mockReturnValue(
        mockSupabaseSingle({
          titulo: "Taller de Yoga",
          descripcion: "Un taller relajante para todo el personal del colegio.",
          imagen_url: "https://example.com/yoga.jpg",
        }) as any,
      )

      const metadata = await generateEventMetadata({ params: Promise.resolve({ id: "123" }) })

      expect(metadata.title).toBe("Taller de Yoga")
      expect(metadata.description).toBe("Un taller relajante para todo el personal del colegio.")
      expect(metadata.openGraph).toEqual({ images: ["https://example.com/yoga.jpg"] })
      expect(metadata.alternates).toEqual({ canonical: "/eventos/123" })
    })

    it("returns fallback metadata when event is not found", async () => {
      vi.mocked(createServiceClient).mockReturnValue(mockSupabaseSingle(null) as any)

      const metadata = await generateEventMetadata({ params: Promise.resolve({ id: "999" }) })

      expect(metadata.title).toBe("Evento")
      expect(metadata.description).toBeDefined()
      expect(metadata.alternates).toEqual({ canonical: "/eventos/999" })
    })
  })

  describe("beneficios/[id]", () => {
    it("returns metadata for a valid benefit", async () => {
      vi.mocked(createServiceClient).mockReturnValue(
        mockSupabaseSingle({
          nombre_empresa: "Gimnasio Pro",
          descripcion_corta: "Descuento del 20% en planes mensuales.",
          foto_local_url: "https://example.com/gym.jpg",
        }) as any,
      )

      const metadata = await generateBenefitMetadata({ params: Promise.resolve({ id: "456" }) })

      expect(metadata.title).toBe("Gimnasio Pro")
      expect(metadata.description).toBe("Descuento del 20% en planes mensuales.")
      expect(metadata.openGraph).toEqual({ images: ["https://example.com/gym.jpg"] })
      expect(metadata.alternates).toEqual({ canonical: "/beneficios/456" })
    })

    it("returns fallback metadata when benefit is not found", async () => {
      vi.mocked(createServiceClient).mockReturnValue(mockSupabaseSingle(null) as any)

      const metadata = await generateBenefitMetadata({ params: Promise.resolve({ id: "999" }) })

      expect(metadata.title).toBe("Beneficio")
      expect(metadata.description).toBeDefined()
      expect(metadata.alternates).toEqual({ canonical: "/beneficios/999" })
    })
  })
})
