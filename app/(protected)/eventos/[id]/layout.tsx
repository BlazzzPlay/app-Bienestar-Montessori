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
    .from("publicaciones")
    .select("titulo,descripcion,imagen_url")
    .eq("id", id)
    .single()

  if (!data) {
    return {
      title: "Evento",
      description: "Detalle del evento o noticia del programa de Bienestar Montessori.",
      alternates: {
        canonical: `/eventos/${id}`,
      },
    }
  }

  return {
    title: data.titulo,
    description: data.descripcion?.slice(0, 160),
    openGraph: {
      images: data.imagen_url ? [data.imagen_url] : undefined,
    },
    alternates: {
      canonical: `/eventos/${id}`,
    },
  }
}

export default function EventoDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
