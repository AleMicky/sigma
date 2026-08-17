import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { actividadAplicacionKeys } from "./actividad-aplicacion.keys"
import {
  getActividadAplicacion,
  listActividadAplicaciones,
  listAplicacionesByActividad,
} from "./actividad-aplicacion.service"

export const actividadAplicacionQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: actividadAplicacionKeys.list(filters),
      queryFn: () => listActividadAplicaciones(filters),
    }),

  byActividad: (actividadId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: actividadAplicacionKeys.byActividad(actividadId),
      queryFn: () => listAplicacionesByActividad(actividadId, filters),
      enabled: Boolean(actividadId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: actividadAplicacionKeys.detail(id),
      queryFn: () => getActividadAplicacion(id),
      enabled: Boolean(id),
    }),
}
