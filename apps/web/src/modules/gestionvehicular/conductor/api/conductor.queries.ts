import { queryOptions } from "@tanstack/react-query"

import { conductorKeys, type ConductorListFilters } from "./conductor.keys"
import {
  getConductor,
  listConductores,
  listConductoresDisponibles,
} from "./conductor.service"

export const conductorQueries = {
  list: (filters?: ConductorListFilters) =>
    queryOptions({
      queryKey: conductorKeys.list(filters),
      queryFn: () => {
        const { search, ...rest } = filters ?? {}
        const trimmed = search?.trim()
        return listConductores(trimmed ? { ...rest, search: trimmed } : rest)
      },
    }),

  disponibles: (fechaSalida?: string | null, fechaRetorno?: string | null) =>
    queryOptions({
      queryKey: conductorKeys.disponibles(fechaSalida, fechaRetorno),
      queryFn: () => {
        if (!fechaSalida || !fechaRetorno) return []
        return listConductoresDisponibles({ fechaSalida, fechaRetorno })
      },
      enabled: Boolean(fechaSalida && fechaRetorno),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: conductorKeys.detail(id),
      queryFn: () => getConductor(id),
      enabled: Boolean(id),
    }),
}
