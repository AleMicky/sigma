import { queryOptions } from "@tanstack/react-query"

import {
  tipoSolicitudVehicularKeys,
  type TipoSolicitudVehicularListFilters,
} from "./tipo-solicitud.keys"
import {
  getTipoSolicitudVehicular,
  listTiposSolicitudVehicular,
} from "./tipo-solicitud.service"

export const tipoSolicitudVehicularQueries = {
  list: (filters?: TipoSolicitudVehicularListFilters) =>
    queryOptions({
      queryKey: tipoSolicitudVehicularKeys.list(filters),
      queryFn: () => {
        const { search, ...rest } = filters ?? {}
        const trimmed = search?.trim()
        return listTiposSolicitudVehicular(
          trimmed ? { ...rest, search: trimmed } : rest
        )
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoSolicitudVehicularKeys.detail(id),
      queryFn: () => getTipoSolicitudVehicular(id),
      enabled: Boolean(id),
    }),
}
