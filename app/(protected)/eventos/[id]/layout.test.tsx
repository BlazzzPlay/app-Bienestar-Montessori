import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ toString: () => "" })),
}))

vi.mock("@/lib/pocketbase", () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from "@/lib/pocketbase"
import { generateMetadata as generateEventMetadata } from "./layout"
import { generateMetadata as generateBenefitMetadata } from "../../beneficios/[id]/layout"

function mockPbSingle(data: unknown, imageUrl?: string) {
  return {
    collection: vi.fn(() => ({
      getOne: vi.fn(() => Promise.resolve(data)),
    })),
    files: {
      getURL: vi.fn(() => imageUrl ?? "https://pb.example.com/file.jpg"),
    },
  }
}

function mockPbError() {
  return {
    collection: vi.fn(() => ({
      getOne: vi.fn(() => Promise.reject(new Error("Not found"))),
    })),
    files: {
      getURL: vi.fn(),
    },
  }
}

describe("Dynamic generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("eventos/[id]", () => {
    it("returns metadata for a valid event", async () => {
      vi.mocked(createServerClient).mockReturnValue(
        mockPbSingle(
          {
            titulo: "Taller de Yoga",
            descripcion: "Un taller relajante para todo el personal del colegio.",
            imagen: "yoga.jpg",
          },
          "https://pb.example.com/yoga.jpg",
        ) as any,
      )

      const metadata = await generateEventMetadata({ params: Promise.resolve({ id: "123" }) })

      expect(metadata.title).toBe("Taller de Yoga")
      expect(metadata.description).toBe("Un taller relajante para todo el personal del colegio.")
      expect(metadata.openGraph).toEqual({ images: ["https://pb.example.com/yoga.jpg"] })
      expect(metadata.alternates).toEqual({ canonical: "/eventos/123" })
    })

    it("returns fallback metadata when event is not found", async () => {
      vi.mocked(createServerClient).mockReturnValue(mockPbError() as any)

      const metadata = await generateEventMetadata({ params: Promise.resolve({ id: "999" }) })

      expect(metadata.title).toBe("Evento")
      expect(metadata.description).toBeDefined()
      expect(metadata.alternates).toEqual({ canonical: "/eventos/999" })
    })
  })

  describe("beneficios/[id]", () => {
    it("returns metadata for a valid benefit", async () => {
      vi.mocked(createServerClient).mockReturnValue(
        mockPbSingle(
          {
            nombre_empresa: "Gimnasio Pro",
            descripcion_corta: "Descuento del 20% en planes mensuales.",
            foto_local: "gym.jpg",
          },
          "https://pb.example.com/gym.jpg",
        ) as any,
      )

      const metadata = await generateBenefitMetadata({ params: Promise.resolve({ id: "456" }) })

      expect(metadata.title).toBe("Gimnasio Pro")
      expect(metadata.description).toBe("Descuento del 20% en planes mensuales.")
      expect(metadata.openGraph).toEqual({ images: ["https://pb.example.com/gym.jpg"] })
      expect(metadata.alternates).toEqual({ canonical: "/beneficios/456" })
    })

    it("returns fallback metadata when benefit is not found", async () => {
      vi.mocked(createServerClient).mockReturnValue(mockPbError() as any)

      const metadata = await generateBenefitMetadata({ params: Promise.resolve({ id: "999" }) })

      expect(metadata.title).toBe("Beneficio")
      expect(metadata.description).toBeDefined()
      expect(metadata.alternates).toEqual({ canonical: "/beneficios/999" })
    })
  })
})
