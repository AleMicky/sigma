import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { estadoOperativoKeys } from "./estado-operativo.keys"
import { getEstadoOperativo, listEstadosOperativos } from "./estado-operativo.service"

export const estadoOperativoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: estadoOperativoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listEstadosOperativos(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: estadoOperativoKeys.detail(id),
      queryFn: () => getEstadoOperativo(id),
      enabled: Boolean(id),
    }),
}
