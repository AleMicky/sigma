import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { periodoKeys } from "./periodo.keys"
import { getPeriodo, listPeriodos } from "./periodo.service"

export const periodoQueries = {
  byGestion: (gestionId: string, params?: PageParams) =>
    queryOptions({
      queryKey: periodoKeys.list({ ...params, gestionId }),
      queryFn: () =>
        listPeriodos({
          ...params,
          gestionId,
        }),
      enabled: Boolean(gestionId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: periodoKeys.detail(id),
      queryFn: () => getPeriodo(id),
      enabled: Boolean(id),
    }),
}
