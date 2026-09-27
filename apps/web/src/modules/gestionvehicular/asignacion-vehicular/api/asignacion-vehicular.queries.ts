import { queryOptions } from "@tanstack/react-query"

import {
  asignacionVehicularKeys,
  type AsignacionVehicularListFilters,
} from "./asignacion-vehicular.keys"
import {
  getAsignacionVehicular,
  getAsignacionesBySolicitud,
  listAsignacionesVehiculares,
} from "./asignacion-vehicular.service"

export const asignacionVehicularQueries = {
  list: (filters?: AsignacionVehicularListFilters) =>
    queryOptions({
      queryKey: asignacionVehicularKeys.list(filters),
      queryFn: () => {
        const { search, ...rest } = filters ?? {}
        const trimmed = search?.trim()
        return listAsignacionesVehiculares(
          trimmed ? { ...rest, search: trimmed } : rest
        )
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: asignacionVehicularKeys.detail(id),
      queryFn: () => getAsignacionVehicular(id),
      enabled: Boolean(id),
    }),

  bySolicitud: (solicitudVehicularId: string) =>
    queryOptions({
      queryKey: asignacionVehicularKeys.bySolicitud(solicitudVehicularId),
      queryFn: () => getAsignacionesBySolicitud(solicitudVehicularId),
      enabled: Boolean(solicitudVehicularId),
    }),
}
