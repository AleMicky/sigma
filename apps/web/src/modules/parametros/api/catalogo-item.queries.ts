import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type CatalogoItemListFilters,
  catalogoItemKeys,
} from "./catalogo-item.keys"
import { getCatalogoItem, listCatalogoItems } from "./catalogo-item.service"

export const catalogoItemQueries = {
  list: (filters?: CatalogoItemListFilters) =>
    queryOptions({
      queryKey: catalogoItemKeys.list(filters),
      queryFn: () => listCatalogoItems(filters),
    }),

  byCatalogo: (
    catalogoId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: catalogoItemKeys.list({ ...params, catalogoId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listCatalogoItems({
          ...params,
          catalogoId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(catalogoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: catalogoItemKeys.detail(id),
      queryFn: () => getCatalogoItem(id),
      enabled: Boolean(id),
    }),
}
