import { cookies } from "next/headers"
import { createServerClient } from "@/lib/pocketbase"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cookieStore = await cookies()
  const pb = createServerClient(cookieStore.toString())

  try {
    const data = await pb.collection("beneficios").getOne(id)
    const fotoUrl = data.foto_local ? pb.files.getURL(data, data.foto_local) : undefined

    return {
      title: data.nombre_empresa,
      description: data.descripcion_corta?.slice(0, 160),
      openGraph: {
        images: fotoUrl ? [fotoUrl] : undefined,
      },
      alternates: {
        canonical: `/beneficios/${id}`,
      },
    }
  } catch {
    return {
      title: "Beneficio",
      description: "Detalle del beneficio disponible para funcionarios del Colegio Montessori.",
      alternates: {
        canonical: `/beneficios/${id}`,
      },
    }
  }
}

export default function BeneficioDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
