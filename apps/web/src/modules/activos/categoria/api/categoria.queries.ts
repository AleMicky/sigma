import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { categoriaKeys } from "./categoria.keys"
import { getCategoria, listCategorias } from "./categoria.service"

export const categoriaQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: categoriaKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listCategorias(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: categoriaKeys.detail(id),
      queryFn: () => getCategoria(id),
      enabled: Boolean(id),
    }),
}
