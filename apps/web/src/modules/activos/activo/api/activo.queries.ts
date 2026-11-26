import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type ActivoListFilters,
  type ActivoResumenFilters,
  activoKeys,
} from "./activo.keys"
import {
  getActivo,
  getActivoResumen,
  listActivos,
  listActivosDisponibilidad,
  listActivosParaSolicitud,
  type ActivoDisponibilidadParams,
  type ActivoParaSolicitudParams,
} from "./activo.service"

export const activoQueries = {
  list: (filters?: ActivoListFilters) =>
    queryOptions({
      queryKey: activoKeys.list(filters),
      queryFn: () => {
        const q = filters?.q?.trim()
        return listActivos(q ? { ...filters, q } : { ...filters, q: undefined })
      },
    }),

  resumen: (filters?: ActivoResumenFilters) =>
    queryOptions({
      queryKey: activoKeys.resumen(filters),
      queryFn: () => {
        const q = filters?.q?.trim()
        return getActivoResumen(q ? { ...filters, q } : filters)
      },
    }),

  paraSolicitud: (params?: ActivoParaSolicitudParams) =>
    queryOptions({
      queryKey: ["activos", "para-solicitud", params] as const,
      queryFn: () => {
        const q = params?.q?.trim()
        return listActivosParaSolicitud(
          q ? { ...params, q } : { ...params, q: undefined },
        )
      },
    }),

  byTipoActivo: (
    tipoActivoId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: activoKeys.list({ ...params, tipoActivoId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listActivos({
          ...params,
          tipoActivoId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(tipoActivoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoKeys.detail(id),
      queryFn: () => getActivo(id),
      enabled: Boolean(id),
    }),

  disponibilidad: (params?: ActivoDisponibilidadParams) =>
    queryOptions({
      queryKey: ["activos", "disponibilidad", params] as const,
      queryFn: () => {
        const q = params?.q?.trim()
        return listActivosDisponibilidad(q ? { ...params, q } : { ...params, q: undefined })
      },
    }),
}
