import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type AccesorioListFilters,
  accesorioKeys,
} from "./accesorio.keys"
import { getAccesorio, listAccesorios } from "./accesorio.service"

export const accesorioQueries = {
  list: (filters?: AccesorioListFilters) =>
    queryOptions({
      queryKey: accesorioKeys.list(filters),
      queryFn: () => listAccesorios(filters),
    }),

  byCategoria: (
    categoriaId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: accesorioKeys.list({ ...params, categoriaId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listAccesorios({
          ...params,
          categoriaId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(categoriaId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: accesorioKeys.detail(id),
      queryFn: () => getAccesorio(id),
      enabled: Boolean(id),
    }),
}
