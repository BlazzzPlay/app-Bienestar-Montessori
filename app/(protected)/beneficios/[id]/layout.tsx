import { createServiceClient } from "@/lib/supabaseClient"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceClient()

  const { data } = await supabase
    .from("beneficios")
    .select("nombre_empresa,descripcion_corta,foto_local_url")
    .eq("id", id)
    .single()

  if (!data) {
    return {
      title: "Beneficio",
      description: "Detalle del beneficio disponible para funcionarios del Colegio Montessori.",
      alternates: {
        canonical: `/beneficios/${id}`,
      },
    }
  }

  return {
    title: data.nombre_empresa,
    description: data.descripcion_corta?.slice(0, 160),
    openGraph: {
      images: data.foto_local_url ? [data.foto_local_url] : undefined,
    },
    alternates: {
      canonical: `/beneficios/${id}`,
    },
  }
}

export default function BeneficioDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
