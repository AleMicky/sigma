import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { unidadMedidaKeys } from "./unidad-medida.keys"
import { getUnidadMedida, listUnidadesMedida } from "./unidad-medida.service"

export const unidadMedidaQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: unidadMedidaKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listUnidadesMedida(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: unidadMedidaKeys.detail(id),
      queryFn: () => getUnidadMedida(id),
      enabled: Boolean(id),
    }),
}
