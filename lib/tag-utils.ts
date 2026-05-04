export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    Comida: "bg-orange-100 text-orange-800",
    Salud: "bg-green-100 text-green-800",
    Deporte: "bg-blue-100 text-blue-800",
    Entretenimiento: "bg-purple-100 text-purple-800",
    Descuento: "bg-red-100 text-red-800",
    Farmacia: "bg-teal-100 text-teal-800",
    Cine: "bg-indigo-100 text-indigo-800",
  }
  return colors[tag] || "bg-gray-100 text-gray-800"
}

export function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    Evento: "bg-purple-100 text-purple-800 border-purple-200",
    Noticia: "bg-gray-100 text-gray-800 border-gray-200",
    Comunicado: "bg-blue-100 text-blue-800 border-blue-200",
  }
  return colors[cat] || "bg-gray-100 text-gray-800 border-gray-200"
}
