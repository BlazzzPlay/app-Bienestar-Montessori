export interface TagColor {
  backgroundColor: string
  color: string
}

const tagColors: Record<string, TagColor> = {
  Comida: { backgroundColor: "hsl(var(--tag-orange))", color: "hsl(var(--tag-orange-text))" },
  Salud: { backgroundColor: "hsl(var(--tag-green))", color: "hsl(var(--tag-green-text))" },
  Deporte: { backgroundColor: "hsl(var(--tag-blue))", color: "hsl(var(--tag-blue-text))" },
  Entretenimiento: {
    backgroundColor: "hsl(var(--tag-purple))",
    color: "hsl(var(--tag-purple-text))",
  },
  Descuento: { backgroundColor: "hsl(var(--tag-red))", color: "hsl(var(--tag-red-text))" },
  Farmacia: { backgroundColor: "hsl(var(--tag-teal))", color: "hsl(var(--tag-teal-text))" },
  Cine: { backgroundColor: "hsl(var(--tag-indigo))", color: "hsl(var(--tag-indigo-text))" },
}

const defaultTag: TagColor = {
  backgroundColor: "hsl(var(--tag-gray))",
  color: "hsl(var(--tag-gray-text))",
}

export function getTagColor(tag: string): TagColor {
  return tagColors[tag] || defaultTag
}

export interface CategoryColor extends TagColor {
  borderColor: string
}

const categoryColors: Record<string, CategoryColor> = {
  Evento: {
    backgroundColor: "hsl(var(--tag-purple))",
    color: "hsl(var(--tag-purple-text))",
    borderColor: "hsl(var(--tag-purple) / 0.5)",
  },
  Noticia: {
    backgroundColor: "hsl(var(--tag-gray))",
    color: "hsl(var(--tag-gray-text))",
    borderColor: "hsl(var(--tag-gray) / 0.5)",
  },
  Comunicado: {
    backgroundColor: "hsl(var(--tag-blue))",
    color: "hsl(var(--tag-blue-text))",
    borderColor: "hsl(var(--tag-blue) / 0.5)",
  },
}

const defaultCategory: CategoryColor = {
  backgroundColor: "hsl(var(--tag-gray))",
  color: "hsl(var(--tag-gray-text))",
  borderColor: "hsl(var(--tag-gray) / 0.5)",
}

export function getCategoryColor(cat: string): CategoryColor {
  return categoryColors[cat] || defaultCategory
}
