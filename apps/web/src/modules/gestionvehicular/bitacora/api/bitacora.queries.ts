import { queryOptions } from "@tanstack/react-query"

import { bitacoraKeys } from "./bitacora.keys"
import {
  getBitacoraConsolidada,
  getBitacoraVehicular,
  type BitacoraConsolidadaFiltros,
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

  /** Bitácora consolidada: salidas vehiculares + solicitudes vehiculares (vehículo opcional). */
  consolidado: (filtros: BitacoraConsolidadaFiltros | null) =>
    queryOptions({
      queryKey: bitacoraKeys.consolidado(filtros),
      queryFn: () => {
        if (!filtros || !filtros.fechaInicio || !filtros.fechaFin) {
          throw new Error("Filtros incompletos para consultar la bitácora consolidada")
        }
        return getBitacoraConsolidada(filtros)
      },
      enabled: Boolean(filtros?.fechaInicio && filtros?.fechaFin),
    }),
}
