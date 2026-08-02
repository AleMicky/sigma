import type { PageParams } from "@/shared/types/api.types"

export type CatalogoItemListFilters = PageParams & {
  catalogoId?: string
}

export const catalogoItemKeys = {
  all: ["catalogo-items"] as const,
  lists: () => [...catalogoItemKeys.all, "list"] as const,
  list: (filters?: CatalogoItemListFilters) =>
    [...catalogoItemKeys.lists(), filters] as const,
  details: () => [...catalogoItemKeys.all, "detail"] as const,
  detail: (id: string) => [...catalogoItemKeys.details(), id] as const,
}
