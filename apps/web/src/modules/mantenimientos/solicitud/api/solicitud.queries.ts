import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { solicitudKeys } from "./solicitud.keys"
import { getSolicitud, listSolicitudes } from "./solicitud.service"

export const solicitudQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: solicitudKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listSolicitudes(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: solicitudKeys.detail(id),
      queryFn: () => getSolicitud(id),
      enabled: Boolean(id),
    }),
}
