import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { grupoAprobadorKeys } from "./grupo-aprobador.keys"
import { getGrupoAprobador, listGruposAprobadores } from "./grupo-aprobador.service"

export const grupoAprobadorQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: grupoAprobadorKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listGruposAprobadores(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: grupoAprobadorKeys.detail(id),
      queryFn: () => getGrupoAprobador(id),
      enabled: Boolean(id),
    }),
}
