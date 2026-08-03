import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { cargoKeys } from "./cargo.keys"
import { getCargo, listCargos } from "./cargo.service"

export const cargoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: cargoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listCargos(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: cargoKeys.detail(id),
      queryFn: () => getCargo(id),
      enabled: Boolean(id),
    }),
}
