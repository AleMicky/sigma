import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { SOLICITUD_ENDPOINTS } from "./solicitud.endpoints"
import type {
  SolicitudMantenimiento,
  SolicitudMantenimientoFilters,
  SolicitudMantenimientoResumen,
  SolicitudMantenimientoTrazabilidad,
} from "../types/solicitud.type"

export * from "../types/solicitud.type"

/**
 * Obtiene el listado paginado de solicitudes de mantenimiento con filtros opcionales.
 * Endpoint: GET /api/v1/solicitudes-mantenimiento?page=0&size=1&sortBy=id&direction=ASC
 */
export async function getSolicitudesMantenimiento(
  filters?: SolicitudMantenimientoFilters,
): Promise<PageResponse<SolicitudMantenimiento>> {
  return http.get<PageResponse<SolicitudMantenimiento>>(
    SOLICITUD_ENDPOINTS.root,
    {
      params: filters,
    },
  )
}

/**
 * Obtiene el detalle de una solicitud de mantenimiento por su ID.
 * Endpoint: GET /api/v1/solicitudes-mantenimiento/{id}
 */
export async function getSolicitudMantenimiento(
  id: string,
): Promise<SolicitudMantenimiento> {
  return http.get<SolicitudMantenimiento>(SOLICITUD_ENDPOINTS.detail(id))
}

/**
 * Obtiene el resumen/conteo de solicitudes agrupadas por estado.
 * Endpoint: GET /api/v1/solicitudes-mantenimiento/resumen
 */
export async function getSolicitudResumen(): Promise<SolicitudMantenimientoResumen> {
  return http.get<SolicitudMantenimientoResumen>(SOLICITUD_ENDPOINTS.resumen)
}

/**
 * Obtiene el historial de trazabilidad de una solicitud de mantenimiento.
 * Endpoint: GET /api/v1/solicitudes-mantenimiento/{id}/trazabilidad
 */
export async function getSolicitudTrazabilidad(
  id: string,
): Promise<SolicitudMantenimientoTrazabilidad[]> {
  return http.get<SolicitudMantenimientoTrazabilidad[]>(
    SOLICITUD_ENDPOINTS.trazabilidad(id),
  )
}

// Aliases para conveniencia y compatibilidad
export const listSolicitudes = getSolicitudesMantenimiento
export const getSolicitudes = getSolicitudesMantenimiento
export const getSolicitud = getSolicitudMantenimiento
