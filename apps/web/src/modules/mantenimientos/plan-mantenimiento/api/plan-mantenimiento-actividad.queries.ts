import { queryOptions } from "@tanstack/react-query"

import { planMantenimientoActividadKeys } from "./plan-mantenimiento-actividad.keys"
import { getActividadesByPlan } from "./plan-mantenimiento-actividad.service"

export const planMantenimientoActividadQueries = {
  byPlan: (planId: string) =>
    queryOptions({
      queryKey: planMantenimientoActividadKeys.byPlan(planId),
      queryFn: () => getActividadesByPlan(planId),
      enabled: Boolean(planId),
    }),
}
