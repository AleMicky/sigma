import { queryOptions } from "@tanstack/react-query"

import { activoAsignacionKeys } from "./activo-asignacion.keys"
import {
  getActivoAsignacion,
  listActivoAsignaciones,
  type ActivoAsignacionFilters,
} from "./activo-asignacion.service"

export const activoAsignacionQueries = {
  list: (filters?: ActivoAsignacionFilters) =>
    queryOptions({
      queryKey: activoAsignacionKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoAsignaciones(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  byActivo: (activoId: string, filters?: Omit<ActivoAsignacionFilters, "activoId">) =>
    queryOptions({
      queryKey: activoAsignacionKeys.byActivo(activoId, filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoAsignaciones({
          activoId,
          ...(trimmed ? { ...rest, q: trimmed } : rest),
        })
      },
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoAsignacionKeys.detail(id),
      queryFn: () => getActivoAsignacion(id),
      enabled: Boolean(id),
    }),
}
