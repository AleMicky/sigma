import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { tipoInsumoKeys } from "./tipo-insumo.keys"
import { getTipoInsumo, listTiposInsumo } from "./tipo-insumo.service"

export const tipoInsumoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: tipoInsumoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposInsumo(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoInsumoKeys.detail(id),
      queryFn: () => getTipoInsumo(id),
      enabled: Boolean(id),
    }),
}
