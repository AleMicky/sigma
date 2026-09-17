import { useQuery } from "@tanstack/react-query"

import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimientoFilters } from "../types/solicitud.type"

const DEFAULT_FILTERS: SolicitudMantenimientoFilters = {
  page: 0,
  size: 20,
  sortBy: "id",
  direction: "DESC",
}

/**
 * Hook para consultar el listado paginado de solicitudes de mantenimiento.
 */
export function useSolicitudes(filters?: SolicitudMantenimientoFilters) {
  return useQuery(
    solicitudQueries.list({
      ...DEFAULT_FILTERS,
      ...filters,
    }),
  )
}

/**
 * Hook para consultar el resumen y conteo de solicitudes por estado (opcionalmente por interfaz/rol).
 */
export function useSolicitudResumen(interfaz?: string) {
  return useQuery(solicitudQueries.resumen(interfaz))
}
