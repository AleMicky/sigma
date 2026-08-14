import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type UbicacionFilters = PageParams & {
  q?: string
  tipo?: string
}

const baseKeys = createResourceKeys<"ubicaciones", UbicacionFilters>("ubicaciones")

export const ubicacionKeys = {
  ...baseKeys,
  raices: () => [...baseKeys.all, "raices"] as const,
  arbol: () => [...baseKeys.all, "arbol"] as const,
  hijos: (id: string) => [...baseKeys.all, "hijos", id] as const,
  subArbol: (id: string) => [...baseKeys.all, "subArbol", id] as const,
}
