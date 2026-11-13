import type { PorteriaFiltros } from "./porteria.types"

export const porteriaKeys = {
  all: ["porteria"] as const,
  lists: () => [...porteriaKeys.all, "list"] as const,
  list: (filters?: PorteriaFiltros) => [...porteriaKeys.lists(), filters] as const,
  afuera: () => [...porteriaKeys.all, "afuera"] as const,
  details: () => [...porteriaKeys.all, "detail"] as const,
  detail: (id: string) => [...porteriaKeys.details(), id] as const,
}

