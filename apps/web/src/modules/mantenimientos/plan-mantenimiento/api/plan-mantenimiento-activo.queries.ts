import { queryOptions } from "@tanstack/react-query"

import { planMantenimientoActivoKeys } from "./plan-mantenimiento-activo.keys"
import {
  getActivosByPlan,
  getPlanesByActivo,
  getPlanMantenimientoActivo,
  getPlanMantenimientoActivosPaginado,
} from "./plan-mantenimiento-activo.service"

export const planMantenimientoActivoQueries = {
  byPlan: (planId: string, activo?: boolean) =>
    queryOptions({
      queryKey: planMantenimientoActivoKeys.byPlan(planId, activo),
      queryFn: () => getActivosByPlan(planId, activo),
      enabled: Boolean(planId),
    }),

  byActivo: (activoId: string) =>
    queryOptions({
      queryKey: planMantenimientoActivoKeys.byActivo(activoId),
      queryFn: () => getPlanesByActivo(activoId),
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: planMantenimientoActivoKeys.detail(id),
      queryFn: () => getPlanMantenimientoActivo(id),
      enabled: Boolean(id),
    }),

  listPaginado: (params?: { page?: number; size?: number; activo?: boolean }) =>
    queryOptions({
      queryKey: [...planMantenimientoActivoKeys.all, "paginado", params],
      queryFn: () => getPlanMantenimientoActivosPaginado(params),
    }),
}
