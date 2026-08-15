import { queryOptions } from "@tanstack/react-query"

import { insumoKeys } from "./insumo.keys"
import {
  getInsumo,
  listInsumos,
  type InsumoFilters,
} from "./insumo.service"

export const insumoQueries = {
  list: (filters?: InsumoFilters) =>
    queryOptions({
      queryKey: insumoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listInsumos(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: insumoKeys.detail(id),
      queryFn: () => getInsumo(id),
      enabled: Boolean(id),
    }),
}
