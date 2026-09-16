import { queryOptions } from "@tanstack/react-query"

import { solicitudKeys } from "./solicitud.keys"
import {
  getSolicitudesMantenimiento,
  getSolicitudMantenimiento,
  getSolicitudResumen,
  getSolicitudTrazabilidad,
} from "./solicitud.service"
import type { SolicitudMantenimientoFilters } from "../types/solicitud.type"

export const solicitudQueries = {
  list: (filters?: SolicitudMantenimientoFilters) =>
    queryOptions({
      queryKey: solicitudKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return getSolicitudesMantenimiento(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: solicitudKeys.detail(id),
      queryFn: () => getSolicitudMantenimiento(id),
      enabled: Boolean(id),
    }),

  resumen: () =>
    queryOptions({
      queryKey: solicitudKeys.resumen(),
      queryFn: () => getSolicitudResumen(),
    }),

  trazabilidad: (id: string) =>
    queryOptions({
      queryKey: solicitudKeys.trazabilidad(id),
      queryFn: () => getSolicitudTrazabilidad(id),
      enabled: Boolean(id),
    }),
}
