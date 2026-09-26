import { queryOptions } from "@tanstack/react-query"

import {
  solicitudVehicularKeys,
  type SolicitudVehicularListFilters,
} from "./solicitud-vehicular.keys"
import {
  getSolicitudVehicular,
  listSolicitudesVehiculares,
} from "./solicitud-vehicular.service"

export const solicitudVehicularQueries = {
  list: (filters?: SolicitudVehicularListFilters) =>
    queryOptions({
      queryKey: solicitudVehicularKeys.list(filters),
      queryFn: () => {
        const { search, estado, ...rest } = filters ?? {}
        const trimmed = search?.trim()
        const normalizedEstado = estado && estado !== "TODOS" ? estado : undefined
        return listSolicitudesVehiculares({
          ...rest,
          ...(trimmed && { search: trimmed }),
          ...(normalizedEstado && { estado: normalizedEstado }),
        })
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: solicitudVehicularKeys.detail(id),
      queryFn: () => getSolicitudVehicular(id),
      enabled: Boolean(id),
    }),
}
