import { queryOptions } from "@tanstack/react-query"

import { activoAccesorioKeys } from "./activo-accesorio.keys"
import {
  getActivoAccesorio,
  listActivoAccesorios,
  type ActivoAccesorioFilters,
} from "./activo-accesorio.service"

export const activoAccesorioQueries = {
  list: (filters?: ActivoAccesorioFilters) =>
    queryOptions({
      queryKey: activoAccesorioKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoAccesorios(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  byActivo: (
    activoId: string,
    filters?: Omit<ActivoAccesorioFilters, "activoId">,
  ) =>
    queryOptions({
      queryKey: activoAccesorioKeys.byActivo(activoId, filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoAccesorios({
          activoId,
          ...(trimmed ? { ...rest, q: trimmed } : rest),
        })
      },
      enabled: Boolean(activoId),
    }),

  byAccesorio: (
    accesorioId: string,
    filters?: Omit<ActivoAccesorioFilters, "accesorioId">,
  ) =>
    queryOptions({
      queryKey: activoAccesorioKeys.byAccesorio(accesorioId, filters),
      queryFn: () => {
        return listActivoAccesorios({
          accesorioId,
          ...filters,
        })
      },
      enabled: Boolean(accesorioId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoAccesorioKeys.detail(id),
      queryFn: () => getActivoAccesorio(id),
      enabled: Boolean(id),
    }),
}
