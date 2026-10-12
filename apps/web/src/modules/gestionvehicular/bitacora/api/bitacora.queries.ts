import { queryOptions } from "@tanstack/react-query"

import { bitacoraKeys } from "./bitacora.keys"
import {
  getBitacoraVehicular,
  type BitacoraVehicularFiltros,
} from "./bitacora.service"

export const bitacoraQueries = {
  reporte: (filtros: BitacoraVehicularFiltros | null) =>
    queryOptions({
      queryKey: bitacoraKeys.reporte(filtros),
      queryFn: () => {
        if (!filtros || !filtros.activoId || !filtros.fechaInicio || !filtros.fechaFin) {
          throw new Error("Filtros incompletos para consultar bitácora")
        }
        return getBitacoraVehicular(filtros)
      },
      enabled: Boolean(filtros?.activoId && filtros?.fechaInicio && filtros?.fechaFin),
    }),
}
