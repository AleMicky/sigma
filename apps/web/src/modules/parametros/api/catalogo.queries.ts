import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { catalogoKeys } from "./catalogo.keys"
import { getCatalogo, listCatalogos } from "./catalogo.service"

export const catalogoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: catalogoKeys.list(filters),
      queryFn: () => listCatalogos(filters),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: catalogoKeys.detail(id),
      queryFn: () => getCatalogo(id),
      enabled: Boolean(id),
    }),
}
