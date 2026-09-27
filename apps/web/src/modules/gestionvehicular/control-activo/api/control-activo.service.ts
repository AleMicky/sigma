import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { CONTROL_ACTIVO_VEHICULAR_ENDPOINTS } from "./control-activo.endpoints"

export type TipoControlActivo = "ENTREGA" | "DEVOLUCION"

export type AccesorioInfo = {
  id: string
  codigo: string
  nombre: string
}

export type ControlActivoVehicular = AuditableEntity & {
  id: string
  solicitudVehicularId?: string | null
  asignacionVehicularId?: string | null
  activoId: string
  tipo: TipoControlActivo
  recibidoPorId?: string | null
  fecha: string
  conforme: boolean
  observacion?: string | null
  detalles?: ControlActivoVehicularDetalle[]
}

export type ControlActivoVehicularDetalle = AuditableEntity & {
  id: string
  controlActivoId: string
  accesorioId: string
  accesorio?: AccesorioInfo | null
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoVehicularPayload = {
  solicitudVehicularId?: string | null
  asignacionVehicularId?: string | null
  activoId: string
  tipo: TipoControlActivo
  recibidoPorId?: string | null
  fecha: string
  conforme: boolean
  observacion?: string | null
  detalles?: (Omit<ControlActivoVehicularDetallePayload, "controlActivoId"> & {
    controlActivoId?: string
  })[]
}

export type ControlActivoVehicularDetallePayload = {
  controlActivoId?: string
  accesorioId: string
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoVehicularFilters = PageParams & {
  solicitudVehicularId?: string
  asignacionVehicularId?: string
  activoId?: string
  tipo?: TipoControlActivo
}

export type ControlActivoVehicularDetalleFilters = PageParams & {
  controlActivoId?: string
}

// Service Methods for ControlActivo
export async function listControlesActivosVehiculares(
  filters?: ControlActivoVehicularFilters
): Promise<PageResponse<ControlActivoVehicular>> {
  return http.get<PageResponse<ControlActivoVehicular>>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.root,
    {
      params: filters,
    }
  )
}

export async function listControlesActivosBySolicitudVehicular(
  solicitudVehicularId: string
): Promise<ControlActivoVehicular[]> {
  return http.get<ControlActivoVehicular[]>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.bySolicitud(solicitudVehicularId)
  )
}

export async function listControlesActivosByAsignacionVehicular(
  asignacionVehicularId: string
): Promise<ControlActivoVehicular[]> {
  return http.get<ControlActivoVehicular[]>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.byAsignacion(asignacionVehicularId)
  )
}

export async function listControlesActivosByActivoVehicular(
  activoId: string
): Promise<ControlActivoVehicular[]> {
  return http.get<ControlActivoVehicular[]>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.byActivo(activoId)
  )
}

export async function getControlActivoVehicular(
  id: string
): Promise<ControlActivoVehicular> {
  return http.get<ControlActivoVehicular>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detail(id)
  )
}

export async function createControlActivoVehicular(
  payload: ControlActivoVehicularPayload
): Promise<ControlActivoVehicular> {
  return http.post<ControlActivoVehicular>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.root,
    payload
  )
}

export async function updateControlActivoVehicular(
  id: string,
  payload: ControlActivoVehicularPayload
): Promise<ControlActivoVehicular> {
  return http.put<ControlActivoVehicular>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detail(id),
    payload
  )
}

export async function deleteControlActivoVehicular(id: string): Promise<void> {
  return http.delete<void>(CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detail(id))
}

// Service Methods for ControlActivoDetalle
export async function listControlActivoVehicularDetalles(
  filters?: ControlActivoVehicularDetalleFilters
): Promise<PageResponse<ControlActivoVehicularDetalle>> {
  return http.get<PageResponse<ControlActivoVehicularDetalle>>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detalles.root,
    {
      params: filters,
    }
  )
}

export async function getControlActivoVehicularDetalle(
  id: string
): Promise<ControlActivoVehicularDetalle> {
  return http.get<ControlActivoVehicularDetalle>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detalles.detail(id)
  )
}

export async function createControlActivoVehicularDetalle(
  payload: ControlActivoVehicularDetallePayload
): Promise<ControlActivoVehicularDetalle> {
  return http.post<ControlActivoVehicularDetalle>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detalles.root,
    payload
  )
}

export async function updateControlActivoVehicularDetalle(
  id: string,
  payload: ControlActivoVehicularDetallePayload
): Promise<ControlActivoVehicularDetalle> {
  return http.put<ControlActivoVehicularDetalle>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detalles.detail(id),
    payload
  )
}

export async function deleteControlActivoVehicularDetalle(
  id: string
): Promise<void> {
  return http.delete<void>(
    CONTROL_ACTIVO_VEHICULAR_ENDPOINTS.detalles.detail(id)
  )
}
