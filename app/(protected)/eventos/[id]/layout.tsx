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
    const data = await pb.collection("publicaciones").getOne(id)
    const imagenUrl = data.imagen ? pb.files.getURL(data, data.imagen) : undefined

    return {
      title: data.titulo,
      description: data.descripcion?.slice(0, 160),
      openGraph: {
        images: imagenUrl ? [imagenUrl] : undefined,
      },
      alternates: {
        canonical: `/eventos/${id}`,
      },
    }
  } catch {
    return {
      title: "Evento",
      description: "Detalle del evento o noticia del programa de Bienestar Montessori.",
      alternates: {
        canonical: `/eventos/${id}`,
      },
    }
  }
}

export default function EventoDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
