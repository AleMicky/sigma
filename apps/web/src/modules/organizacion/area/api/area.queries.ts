import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { areaKeys } from "./area.keys"
import { getArea, listAreas } from "./area.service"

export const areaQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: areaKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listAreas(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: areaKeys.detail(id),
      queryFn: () => getArea(id),
      enabled: Boolean(id),
    }),
}
