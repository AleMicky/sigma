import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type CatalogoItemListFilters = PageParams & {
  catalogoId?: string
  q?: string
}

export const catalogoItemKeys = createResourceKeys<
  "catalogo-items",
  CatalogoItemListFilters
>("catalogo-items")
