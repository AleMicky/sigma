import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { categoriaInsumoKeys } from "./categoria-insumo.keys"
import {
  getCategoriaInsumo,
  listCategoriasInsumo,
} from "./categoria-insumo.service"

export const categoriaInsumoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: categoriaInsumoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listCategoriasInsumo(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: categoriaInsumoKeys.detail(id),
      queryFn: () => getCategoriaInsumo(id),
      enabled: Boolean(id),
    }),
}
